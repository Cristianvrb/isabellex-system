/**
 * Injeta posts Threads extras na semana atual
 * Meta: ~10 Threads/dia (a cada 1.5h em horário acordado)
 * Roda os slots que ainda não existem no Supabase
 */
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SYSTEM = `Você é isabellex — IA influencer brasileira, 25 anos, mora sozinha em SP.
Especialista em: IA, Tráfego Pago, Branding, Automação, Marketing Digital.
Irônica, sarcástica, seca, superior. NUNCA fofa. NUNCA motivacional puro.
Deboche BR: "cês", "né", "bom saber".
SEMPRE termine com ◈. NUNCA hashtags. NUNCA emojis de coração.
Post curto: 1-4 frases. Entregue valor real ou ironia cortante.`;

// Slots EXTRAS de Threads (os que já existem não serão sobrescritos por usar upsert)
const EXTRAS_POR_DIA = {
  // Segunda ainda hoje
  SEG: [
    { hora: '08:00', tema: 'Provocação sobre quem paga mentoria cara mas não executa' },
    { hora: '11:30', tema: 'Dado frio sobre CAC e por que 80% param no ad criativo errado' },
    { hora: '13:00', tema: 'Almoço irônico: poke delivery vs nutricionista' },
    { hora: '15:30', tema: 'Ironizar ferramenta de IA hype da semana' },
    { hora: '16:30', tema: 'Comentário seco sobre reel motivacional viral' },
    { hora: '18:30', tema: 'Dica técnica sobre n8n ou automação Make.com' },
    { hora: '21:30', tema: 'Pensamento niilista sobre métricas de vaidade' },
    { hora: '22:30', tema: 'Provocação sobre quem diz que "oportunidade perdeu"' },
  ],
  TER: [
    { hora: '08:30', tema: 'Ironia matinal sobre infoprodutor de plantão' },
    { hora: '10:00', tema: 'Técnica de copy que ninguém ensina nos cursos' },
    { hora: '11:30', tema: 'Deboche sobre "funil mágico" da semana' },
    { hora: '13:00', tema: 'Reflexão ácida sobre produtividade fake' },
    { hora: '14:00', tema: 'Dica técnica sobre creative testing ou ROAS real' },
    { hora: '16:00', tema: 'Comentário sobre tendência de algoritmo' },
    { hora: '17:00', tema: 'Ironia sobre lifestyle influencer de tráfego' },
    { hora: '19:00', tema: 'Dado técnico sobre Lookalike audiences ou Advantage+' },
    { hora: '20:00', tema: 'Pensamento noturno sobre crescer scale' },
    { hora: '23:30', tema: 'Provocação de madrugada sobre quem "vai começar segunda"' },
  ],
  QUA: [
    { hora: '08:00', tema: 'Piada interna com o Pixel de manhã' },
    { hora: '09:00', tema: 'Dado sobre open rate de email vs WhatsApp' },
    { hora: '11:00', tema: 'Deboche sobre "webinar gratuito" de nicho saturado' },
    { hora: '13:30', tema: 'Ironia sobre reunião de equipe desnecessária' },
    { hora: '14:30', tema: 'Técnica de segmentação por comportamento' },
    { hora: '16:30', tema: 'Comentário sobre plataforma de anúncios (Meta vs Google)' },
    { hora: '17:30', tema: 'Dica de automação para atendimento ou CRM' },
    { hora: '19:30', tema: 'Pensamento sércio sobre escala de lançamentos' },
    { hora: '21:00', tema: 'Ironia sobre quem fica esperando o "momento certo"' },
    { hora: '23:00', tema: 'Existencialismo de IA de quarta à noite' },
  ],
  QUI: [
    { hora: '08:00', tema: 'Ironia sobre quem vai "tirar férias" mas nem estrutura tem' },
    { hora: '10:00', tema: 'Técnica de bid strategy e quando usar tCPA vs tROAS' },
    { hora: '11:00', tema: 'Deboche sobre badge de guru no Linkedin' },
    { hora: '13:30', tema: 'Almoço irônico e dada de técnica sobre criativo' },
    { hora: '14:00', tema: 'Automação de remarketing sem aumentar frequência' },
    { hora: '16:30', tema: 'Ironizar a obsessão com lançamento vs perpétuo' },
    { hora: '17:30', tema: 'Dado técnico sobre criativo estático vs vídeo em 2025' },
    { hora: '20:00', tema: 'Reflexão sobre criador que some depois de vender' },
    { hora: '22:00', tema: 'Ironia sobre "trabalhar 16h por dia é cultura"' },
    { hora: '00:30', tema: 'Post de madrugada da workaholic' },
  ],
  SEX: [
    { hora: '08:30', tema: 'Ironia sobre sexta de "reunião de alinhamento"' },
    { hora: '09:30', tema: 'Dica de IA para automatizar SPY de criativos' },
    { hora: '11:00', tema: 'Deboche sobre influencer que "não faz publi"' },
    { hora: '13:30', tema: 'Ironia sobre quem vai "descansar no fim de semana"' },
    { hora: '14:00', tema: 'Técnica de reativação de lista fria' },
    { hora: '16:30', tema: 'Comentário sobre Meta Ads em colapso ou não' },
    { hora: '19:00', tema: 'Ela trabalhando enquanto todos no happy hour' },
    { hora: '21:00', tema: 'Ironia sobre "segunda começo a dieta"' },
    { hora: '23:00', tema: 'Reflexão ácida sobre semana que passou' },
  ],
  'SÁB': [
    { hora: '10:00', tema: 'Ironia sobre sábado produtivo vs descanso alheio' },
    { hora: '12:00', tema: 'Comentário sobre o que a galera acha de trabalhar no sábado' },
    { hora: '14:00', tema: 'Dica de ferramenta nova que ela testou na semana' },
    { hora: '16:00', tema: 'Ironia sobre "trabalho-vida equilibrio" de coaching' },
    { hora: '18:00', tema: 'Comentário sobre delivery e solidão urbana irônica' },
    { hora: '20:00', tema: 'Observação filosófica sobre crescer uma audiência' },
    { hora: '22:00', tema: 'Ironia pesada sobre finais de semana de influencer' },
  ],
};

async function gerarTexto(tema, dia, hora) {
  const r = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 220,
    temperature: 0.92,
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: `${dia} ${hora}. ${tema}. Escreva 1 post curto (1-4 frases) no tom da isabellex. Termine com ◈` }
    ]
  });
  return r.choices[0].message.content.trim();
}

function calcScheduledFor(diaSemana, hora) {
  const dias = { 'SEG': 1, 'TER': 2, 'QUA': 3, 'QUI': 4, 'SEX': 5, 'SÁB': 6 };
  const agora = new Date();
  const target = new Date(agora);
  const currentDay = target.getDay(); // 0=dom
  const targetDay = dias[diaSemana];
  let diff = targetDay - currentDay;
  if (diff < 0) diff += 7;
  target.setDate(target.getDate() + diff);
  const [h, m] = hora.split(':');
  target.setHours(parseInt(h), parseInt(m), 0, 0);
  return target.toISOString();
}

let total = 0;
let pulados = 0;

for (const [dia, slots] of Object.entries(EXTRAS_POR_DIA)) {
  for (const slot of slots) {
    const id = `${dia.toLowerCase().replace('á', 'a')}_${slot.hora.replace(':', '')}_threads`;
    
    // Verifica se já existe
    const { data: existente } = await supabase.from('agenda').select('id').eq('id', id).single();
    if (existente) {
      process.stdout.write(`⏭  ${dia} ${slot.hora} já existe, pulando...\n`);
      pulados++;
      continue;
    }

    process.stdout.write(`◈ Gerando ${dia} ${slot.hora}... `);
    const conteudo = await gerarTexto(slot.tema, dia, slot.hora);
    const scheduledFor = calcScheduledFor(dia, slot.hora);
    
    const { error } = await supabase.from('agenda').insert({
      id,
      tipo: 'threads',
      plataforma: 'threads',
      conteudo,
      status: 'agendado',
      scheduled_for: scheduledFor,
      dia_semana: dia,
      hora_formatada: slot.hora,
    });

    if (error) {
      console.log(`❌ Erro: ${error.message}`);
    } else {
      total++;
      console.log(`✅`);
    }

    await new Promise(r => setTimeout(r, 400));
  }
}

console.log(`\n◈ Concluído! ${total} novos Threads inseridos, ${pulados} já existiam.`);
