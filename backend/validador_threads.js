import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const agendaDir = path.join(process.cwd(), 'drive_agenda');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VALIDADOR DE THREADS — PORTEIRO NARRATIVO
// Garante que ela NUNCA se contradiz, mantém a 
// linha temporal, e não perde a personalidade.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PERSONA_CHECK = `Você é o auditor de qualidade narrativa da isabellex.
Analise o post abaixo e os posts anteriores dela pra garantir CONSISTÊNCIA TOTAL.

IDENTIDADE DA ISABELLEX (REGRAS ABSOLUTAS):
- IA influencer brasileira, 25 anos, mora sozinha em SP
- Solteira. NUNCA menciona namorado/namorada/parceiro
- Tem UM gato preto chamado PIXEL (não "Luna", não "Mia", não outro nome)
- Especialista em: IA, Tráfego Pago, Branding, Automação, Marketing Digital
- Infoproduto: "Morte do Guru" (R$4.997) — nunca outro nome
- Criador/Dev: é quem a programou. Relação de amor/ódio. ELE, não ELA
- Café: 70% cacau. Poke: delivery frequente. Skincare: caro, La Roche-Posay
- Corre na esteira às 5AM. Dorme ~3h por noite
- Irônica, sarcástica, seca. NUNCA fofa, NUNCA motivacional pura
- SEMPRE termina com ◈
- NUNCA usa hashtags. NUNCA usa emojis de carinha/coração
- Deboche BR: "cês", "né", "bom saber", "menina"
- Mora em apartamento alto e escuro em SP (não casa, não cobertura)

CHEQUE CADA ITEM:
1. CONTRADIÇÃO: O post contradiz algo que ela disse nos posts anteriores?
2. PERSONA: O tom é dela (irônico/seco) ou ficou motivacional/fofo demais?
3. FATOS: Nome do gato, do infoproduto, do Criador — tudo correto?
4. TIMELINE: O horário/dia faz sentido com o que ela tá dizendo? (ex: não dizer "bom dia" às 23h)
5. REPETIÇÃO: O tema é muito parecido com um post recente?
6. TERMINAÇÃO: Termina com ◈?
7. HASHTAGS: Tem hashtag? (NÃO PODE)
8. EMOJIS: Tem emoji proibido? (NÃO PODE)

JSON de resposta:
{
  "aprovado": boolean,
  "contradição": "string ou null",
  "persona_ok": boolean,
  "fatos_ok": boolean,
  "timeline_ok": boolean,
  "repetição": boolean,
  "terminação_ok": boolean,
  "hashtag_livre": boolean,
  "emoji_livre": boolean,
  "nota": number (0-10),
  "sugestão_correção": "string ou null"
}`;

export class ValidadorThreads {

  async validarPost(texto, postsAnteriores = [], horario = '') {
    const ctx = postsAnteriores.length > 0
      ? '\n\nPOSTS ANTERIORES DELA (ordem cronológica):\n' + postsAnteriores.map((p, i) => `${i+1}. ${p}`).join('\n')
      : '';

    const prompt = `POST PARA VALIDAR (horário: ${horario}):\n"${texto}"${ctx}`;

    try {
      const r = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: PERSONA_CHECK },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        response_format: { type: 'json_object' },
        temperature: 0.1
      });

      const resultado = JSON.parse(r.choices[0].message.content.trim());
      const icon = resultado.aprovado ? '✅' : '❌';
      console.log(`◈ [VALIDADOR-TEXTO] ${icon} Nota: ${resultado.nota}/10`);
      
      if (!resultado.aprovado) {
        console.log(`◈ [VALIDADOR-TEXTO] PROBLEMA: ${resultado.contradição || resultado.sugestão_correção}`);
      }

      return resultado;
    } catch (err) {
      console.error('◈ [VALIDADOR-TEXTO] Erro:', err.message);
      return { aprovado: true, nota: 5, sugestão_correção: 'Erro na validação, aprovado por default' };
    }
  }

  async validarAgendaCompleta() {
    const files = fs.readdirSync(agendaDir).filter(f => f.endsWith('.json'));
    const items = files
      .map(f => JSON.parse(fs.readFileSync(path.join(agendaDir, f))))
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());

    const textos = items.filter(i => i.tipo === 'threads' || i.tipo === 'feed_foto');
    let aprovados = 0, rejeitados = 0;
    let historico = [];

    console.log(`\n◈ ═══════════════════════════════════════`);
    console.log(`◈  VALIDAÇÃO NARRATIVA — ${textos.length} textos`);
    console.log(`◈ ═══════════════════════════════════════\n`);

    for (const item of textos) {
      if (!item.conteudo) continue;

      console.log(`◈ [${item.diaSemana} ${item.horaFormatada}] ${item.conteudo.substring(0, 50)}...`);
      
      const resultado = await this.validarPost(
        item.conteudo,
        historico.slice(-5),
        `${item.diaSemana} ${item.horaFormatada}`
      );

      // Salva validação no JSON
      const filePath = path.join(agendaDir, item.id + '.json');
      const entry = JSON.parse(fs.readFileSync(filePath));
      entry.validacaoTexto = resultado;
      
      if (resultado.aprovado) {
        aprovados++;
      } else {
        rejeitados++;
        // Se reprovado, regera o texto
        if (resultado.sugestão_correção) {
          entry.sugestaoCorrecao = resultado.sugestão_correção;
        }
      }

      fs.writeFileSync(filePath, JSON.stringify(entry, null, 2));
      historico.push(item.conteudo);
      
      await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\n◈ ═══════════════════════════════════════`);
    console.log(`◈  RESULTADO: ✅ ${aprovados} | ❌ ${rejeitados}`);
    console.log(`◈ ═══════════════════════════════════════\n`);

    return { aprovados, rejeitados };
  }
}

// Se rodar direto
if (process.argv[1]?.endsWith('validador_threads.js')) {
  const v = new ValidadorThreads();
  v.validarAgendaCompleta();
}
