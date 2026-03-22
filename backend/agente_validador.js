import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AGENTE VALIDADOR — PORTEIRO DE QUALIDADE
// Nenhuma imagem passa pro frontend ou é postada sem
// aprovação deste agente. REGRA ABSOLUTA.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CHECKLIST_PROMPT = `Você é o Agente de Qualidade Visual da influencer isabellex.
Analise esta foto e responda um JSON rigoroso.

CHEQUE CADA ITEM INDIVIDUALMENTE:

1. ANATOMIA (CRÍTICO — REJEITAR SE FALHAR):
   - Quantos braços visíveis? (deve ser exatamente 0, 1 ou 2)
   - Quantas mãos visíveis? (deve ser exatamente 0, 1 ou 2)
   - Dedos normais? (5 dedos por mão, sem fusão, sem dedos extras)
   - Pescoço e ombros proporcionais? (sem distorção, sem alongamento bizarro)
   - Orelhas normais? (sem duplicação, sem posição alienígena)

2. CONSISTÊNCIA DO PERSONAGEM:
   - Cabelo: preto liso longo com repartido central? (sim/não)
   - Olhos: azul-cinza claros? (sim/não)
   - Sardas: visíveis no nariz e bochechas? (sim/não)
   - Sobrancelhas: grossas, escuras, definidas? (sim/não)

3. OBJETO PROBLEMÁTICO:
   - Celulares: quantos celulares aparecem? Qual cor/modelo?
   - Textos/logos na imagem que não deveriam estar lá?
   - Objetos flutuando ou colados em posição impossível?

4. QUALIDADE GERAL:
   - A foto parece AI gerada de forma óbvia? (blur estranho, pele de plástico, olhar morto)
   - Serviria como post de uma influencer real? (sim/não)

RESPONDA em JSON:
{
  "aprovada": boolean,
  "bracos": number,
  "maos": number,
  "dedos_ok": boolean,
  "cabelo_ok": boolean,
  "olhos_ok": boolean,
  "sardas_ok": boolean,
  "celulares": number,
  "modelo_celular": "string ou null",
  "qualidade_influencer": boolean,
  "motivo_rejeicao": "string explicando o problema ou null se aprovada",
  "nota": number (0-10)
}`;

export class AgenteValidador {

  // Valida uma imagem por URL pública (Supabase)
  async validarUrl(imagemUrl) {
    console.log(`◈ [VALIDADOR] Inspecionando: ${imagemUrl.substring(0, 60)}...`);
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: CHECKLIST_PROMPT },
            { type: 'image_url', image_url: { url: imagemUrl } }
          ]
        }],
        max_tokens: 400,
        response_format: { type: 'json_object' },
        temperature: 0.1
      });

      const resultado = JSON.parse(response.choices[0].message.content.trim());
      
      // Regras ABSOLUTAS de rejeição
      if (resultado.bracos > 2) resultado.aprovada = false;
      if (resultado.maos > 2) resultado.aprovada = false;
      if (!resultado.dedos_ok) resultado.aprovada = false;
      
      const icon = resultado.aprovada ? '✅' : '❌';
      console.log(`◈ [VALIDADOR] ${icon} Nota: ${resultado.nota}/10`);
      if (!resultado.aprovada) {
        console.log(`◈ [VALIDADOR] REJEITADA: ${resultado.motivo_rejeicao}`);
      } else {
        console.log(`◈ [VALIDADOR] APROVADA — braços:${resultado.bracos} mãos:${resultado.maos} dedos:OK cel:${resultado.celulares}`);
      }
      
      return resultado;
    } catch (err) {
      console.error('◈ [VALIDADOR] Erro de análise:', err.message);
      return { aprovada: false, motivo_rejeicao: 'Erro de API na validação', nota: 0 };
    }
  }

  // Valida um arquivo local (buffer/path)
  async validarArquivoLocal(filePath) {
    const buf = fs.readFileSync(filePath);
    const base64 = buf.toString('base64');
    const mimeType = filePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;
    
    return this.validarUrl(dataUrl);
  }

  // Valida E faz upload se aprovada — fluxo completo
  async validarESubir(filePath, nomeStorage) {
    console.log(`◈ [VALIDADOR] Fluxo completo: validar → upload → URL`);
    
    const resultado = await this.validarArquivoLocal(filePath);
    
    if (!resultado.aprovada) {
      console.log(`◈ [VALIDADOR] ❌ Imagem bloqueada. NÃO vai pro Supabase nem pro frontend.`);
      return { url: null, validacao: resultado };
    }

    // Upload pro Supabase
    const buf = fs.readFileSync(filePath);
    const storageName = nomeStorage || `isabellex_validado_${Date.now()}.png`;
    
    const { error } = await supabase.storage.from('media').upload(storageName, buf, {
      contentType: 'image/png', upsert: true
    });

    if (error) {
      console.log(`◈ [VALIDADOR] Erro no upload:`, error.message);
      return { url: null, validacao: resultado };
    }

    const { data } = supabase.storage.from('media').getPublicUrl(storageName);
    console.log(`◈ [VALIDADOR] ✅ Aprovada e publicada: ${data.publicUrl}`);
    
    return { url: data.publicUrl, validacao: resultado };
  }

  // Valida TODAS as fotos pendentes na agenda
  async validarAgendaCompleta() {
    const agendaDir = path.join(process.cwd(), 'drive_agenda');
    const files = fs.readdirSync(agendaDir).filter(f => f.endsWith('.json'));
    
    let aprovadas = 0;
    let rejeitadas = 0;
    
    console.log(`\n◈ ═══════════════════════════════════════`);
    console.log(`◈  VALIDAÇÃO COMPLETA DA AGENDA`);
    console.log(`◈  ${files.length} itens para verificar`);
    console.log(`◈ ═══════════════════════════════════════\n`);
    
    for (const file of files) {
      const filePath = path.join(agendaDir, file);
      const entry = JSON.parse(fs.readFileSync(filePath));
      
      if (!entry.imagemUrl) {
        console.log(`◈ [${entry.id}] Sem imagem (texto puro) — SKIP`);
        continue;
      }
      
      const resultado = await this.validarUrl(entry.imagemUrl);
      
      // Salva resultado da validação no JSON
      entry.validacao = resultado;
      
      if (resultado.aprovada) {
        entry.status = 'validado';
        aprovadas++;
      } else {
        entry.status = 'rejeitado_validador';
        rejeitadas++;
      }
      
      fs.writeFileSync(filePath, JSON.stringify(entry, null, 2));
      
      // Delay entre chamadas
      await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log(`\n◈ ═══════════════════════════════════════`);
    console.log(`◈  RESULTADO: ✅ ${aprovadas} aprovadas | ❌ ${rejeitadas} rejeitadas`);
    console.log(`◈ ═══════════════════════════════════════\n`);
    
    return { aprovadas, rejeitadas };
  }
}

// Se rodar direto: valida toda a agenda
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('agente_validador.js')) {
  const agente = new AgenteValidador();
  agente.validarAgendaCompleta();
}
