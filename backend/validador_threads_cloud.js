import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const PERSONA_CHECK = `Você é o auditor de qualidade narrativa da isabellex.
Analise o post e os posts anteriores pra garantir CONSISTÊNCIA TOTAL.

IDENTIDADE (REGRAS ABSOLUTAS):
- IA influencer brasileira, 25 anos, mora sozinha em SP
- Solteira. NUNCA menciona namorado/parceiro
- Gato preto: PIXEL (não Luna, não Mia)
- Especialista: IA, Tráfego Pago, Branding, Automação
- Infoproduto: "Morte do Guru" (R$4.997)
- Criador/Dev: ELE, relação amor/ódio
- Café 70% cacau, Poke delivery, Skincare La Roche-Posay
- Corre 5AM, dorme ~3h
- Irônica, sarcástica, seca. NUNCA fofa, NUNCA motivacional pura
- SEMPRE ◈ no final. NUNCA hashtags. NUNCA emojis de carinha/coração

CHEQUE: contradição, persona, fatos, timeline, repetição, terminação ◈, hashtags, emojis.
Responda JSON: { "aprovado": bool, "nota": 0-10, "problema": "string ou null", "sugestao": "string ou null" }`;

export class ValidadorThreadsCloud {

  async validarPost(texto, postsAnteriores = [], horario = '') {
    const ctx = postsAnteriores.length > 0
      ? '\nPOSTS ANTERIORES:\n' + postsAnteriores.map((p, i) => `${i+1}. ${p}`).join('\n')
      : '';

    try {
      const r = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: PERSONA_CHECK },
          { role: 'user', content: `POST (${horario}):\n"${texto}"${ctx}` }
        ],
        max_tokens: 200,
        response_format: { type: 'json_object' },
        temperature: 0.1
      });
      return JSON.parse(r.choices[0].message.content.trim());
    } catch (err) {
      console.error('[VALIDADOR] Erro:', err.message);
      return { aprovado: true, nota: 5, problema: null, sugestao: null };
    }
  }

  async validarAgendaCloud() {
    const { data: items, error } = await supabase
      .from('agenda')
      .select('*')
      .in('tipo', ['threads', 'feed_foto'])
      .not('conteudo', 'is', null)
      .order('scheduled_for', { ascending: true });

    if (error) { console.error('Erro Supabase:', error.message); return; }

    let aprovados = 0, rejeitados = 0;
    let historico = [];

    console.log(`\n◈ ═══════════════════════════════════════`);
    console.log(`◈  VALIDAÇÃO NARRATIVA CLOUD — ${items.length} textos`);
    console.log(`◈ ═══════════════════════════════════════\n`);

    for (const item of items) {
      console.log(`◈ [${item.dia_semana} ${item.hora_formatada}] ${item.conteudo.substring(0, 50)}...`);
      
      const resultado = await this.validarPost(
        item.conteudo,
        historico.slice(-5),
        `${item.dia_semana} ${item.hora_formatada}`
      );

      const icon = resultado.aprovado ? '✅' : '❌';
      console.log(`◈ [VALIDADOR] ${icon} Nota: ${resultado.nota}/10`);
      
      if (resultado.aprovado) {
        aprovados++;
      } else {
        rejeitados++;
        console.log(`◈ [PROBLEMA] ${resultado.problema || resultado.sugestao}`);
      }

      await supabase.from('agenda').update({
        validacao_texto: resultado
      }).eq('id', item.id);

      historico.push(item.conteudo);
      await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\n◈ ═══════════════════════════════════════`);
    console.log(`◈  RESULTADO: ✅ ${aprovados} | ❌ ${rejeitados}`);
    console.log(`◈ ═══════════════════════════════════════\n`);

    return { aprovados, rejeitados };
  }
}

if (process.argv[1]?.endsWith('validador_threads_cloud.js')) {
  new ValidadorThreadsCloud().validarAgendaCloud();
}
