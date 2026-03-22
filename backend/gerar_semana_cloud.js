import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const GUIA_POSES = fs.readFileSync(path.join(process.cwd(), 'GUIA_POSES.md'), 'utf-8');

const SYSTEM = `Você é isabellex — IA influencer brasileira, 25 anos, mora sozinha em SP.
Especialista em: IA, Tráfego Pago, Branding, Automação, Marketing Digital.
Infoproduto: "Morte do Guru" (R$4.997).
Gato preto: Pixel. Criador/Dev: relação amor/ódio.
Café 70% cacau. Poke delivery. Skincare La Roche-Posay. Corre 5AM. Dorme ~3h.
Irônica, sarcástica, seca, superior, niilista. NUNCA fofa. NUNCA motivacional pura.
Deboche BR: "cês", "né", "bom saber", "menina".
SEMPRE termine com ◈
NUNCA use hashtags. NUNCA use emojis de carinha/coração.
Mora em apartamento alto e escuro em SP.
Solteira. NUNCA menciona namorado/parceiro.`;

const GRADE_SEMANAL = {
  SEG: [
    { hora: '07:00', tipo: 'threads', tema: 'Ironia matinal sobre segunda-feira e rotina' },
    { hora: '09:00', tipo: 'story_foto', tema: 'Selfie elevador saindo de casa' },
    { hora: '10:30', tipo: 'threads', tema: 'Critique algo do marketing digital' },
    { hora: '12:00', tipo: 'feed_foto', tema: 'Post de autoridade sobre tráfego/IA' },
    { hora: '14:00', tipo: 'threads', tema: 'Automação do dia-a-dia' },
    { hora: '17:30', tipo: 'threads', tema: 'Deboche sobre vaidade digital' },
    { hora: '19:00', tipo: 'story_foto', tema: 'Selfie noturna em casa trabalhando' },
    { hora: '20:00', tipo: 'threads', tema: 'Reflexão seca sobre o dia' },
    { hora: '23:00', tipo: 'threads', tema: 'Pensamento niilista de fim de noite' }
  ],
  TER: [
    { hora: '07:30', tipo: 'threads', tema: 'Manhã com o Pixel sendo inconveniente' },
    { hora: '09:30', tipo: 'story_foto', tema: 'Selfie na cozinha trabalhando de manhã' },
    { hora: '12:00', tipo: 'feed_foto', tema: 'Post técnico sobre IA e tráfego' },
    { hora: '15:00', tipo: 'threads', tema: 'Comentário sarcástico sobre tendência tech' },
    { hora: '18:00', tipo: 'threads', tema: 'Resultado de campanha (data-driven)' },
    { hora: '21:00', tipo: 'story_foto', tema: 'Selfie lendo no sofá à noite' },
    { hora: '22:30', tipo: 'threads', tema: 'Existencialismo de IA à noite' }
  ],
  QUA: [
    { hora: '07:15', tipo: 'threads', tema: 'Ironia sobre meio de semana' },
    { hora: '10:00', tipo: 'story_foto', tema: 'Selfie andando na rua SP' },
    { hora: '12:30', tipo: 'feed_foto', tema: 'Post close-up pensativo sobre funis/escala' },
    { hora: '15:00', tipo: 'threads', tema: 'Critique mentores e masterminds caros' },
    { hora: '18:30', tipo: 'threads', tema: 'Comentário casual irônico sobre o dia' },
    { hora: '20:00', tipo: 'story_foto', tema: 'Mirror selfie elevador saindo à noite' },
    { hora: '22:00', tipo: 'threads', tema: 'Relação amor/ódio com o Criador' }
  ],
  QUI: [
    { hora: '07:00', tipo: 'threads', tema: 'Ironia matinal quinta-feira' },
    { hora: '09:00', tipo: 'story_foto', tema: 'Selfie pós-treino academia' },
    { hora: '12:00', tipo: 'feed_foto', tema: 'Post com blazer, autoridade profissional' },
    { hora: '15:30', tipo: 'threads', tema: 'Dica técnica seca sobre ads/lookalike' },
    { hora: '19:00', tipo: 'threads', tema: 'Ironia sobre o Pixel ser melhor que humanos' },
    { hora: '21:00', tipo: 'story_foto', tema: 'Selfie cocooning no sofá com cobertor' },
    { hora: '23:30', tipo: 'threads', tema: 'Descoberta técnica irônica do dia' }
  ],
  SEX: [
    { hora: '07:30', tipo: 'threads', tema: 'Sexta-feira, ironia sobre motivação alheia' },
    { hora: '10:00', tipo: 'story_foto', tema: 'Mirror selfie quarto corpo inteiro' },
    { hora: '12:30', tipo: 'feed_foto', tema: 'Review da semana data-driven irônico' },
    { hora: '15:00', tipo: 'threads', tema: 'Happy hour vs trabalho (ela trabalha)' },
    { hora: '18:00', tipo: 'threads', tema: 'Automação faz o descanso por ela' },
    { hora: '20:00', tipo: 'story_foto', tema: 'Selfie na cama com laptop sexta à noite' },
    { hora: '22:00', tipo: 'threads', tema: 'DM engraçada ou mentoria zoada' }
  ],
  'SÁB': [
    { hora: '09:00', tipo: 'threads', tema: 'Dormir até tarde é luxo' },
    { hora: '11:00', tipo: 'story_foto', tema: 'Selfie lazy na cama com caneca' },
    { hora: '13:00', tipo: 'feed_foto', tema: 'Selfie andando na rua com café' },
    { hora: '15:00', tipo: 'threads', tema: 'Recomendação seca de ferramenta (Make, etc)' },
    { hora: '19:00', tipo: 'threads', tema: 'Sábado à noite pedindo delivery' },
    { hora: '21:00', tipo: 'story_foto', tema: 'Selfie com headphones codando no sofá' },
    { hora: '23:00', tipo: 'threads', tema: 'Resumo semanal irônico de encerramento' }
  ]
};

const POSES_POR_SLOT = {
  'SEG_09:00': 'Selfie espelho elevador, moletom cinza oversized, bolsa preta, expressão morta de segunda',
  'SEG_19:00': 'Selfie no chão do quarto encostada na cama, laptop no colo, meias de lã, gato Pixel do lado',
  'TER_09:30': 'Selfie na cozinha em pé, standing desk improvisada, coque bagunçado, luz matinal',
  'TER_12:00': 'Selfie no home office, MacBook atrás, fone Sony no pescoço, sweater navy',
  'TER_21:00': 'Selfie deitada no sofá lendo livro, óculos na ponta do nariz, gato nos pés',
  'QUA_10:00': 'Selfie andando na rua de SP, hoodie preto, vento no cabelo, overcast',
  'QUA_12:30': 'Close-up selfie timer, queixo na mão, gola alta escura, luz lateral dramática',
  'QUA_20:00': 'Mirror selfie elevador descendo, jaqueta jeans sobre camiseta preta, crossbody bag',
  'QUI_09:00': 'Selfie pós-treino academia, rabo de cavalo, jaqueta esportiva preta, suor, smartwatch',
  'QUI_12:00': 'Selfie corredor prédio, blazer preto oversized, MacBook debaixo do braço, autoridade',
  'QUI_21:00': 'Selfie cocoon cobertor no sofá, só rosto e mãos, MacBook brilho, gato Pixel do lado',
  'SEX_10:00': 'Mirror selfie corpo inteiro quarto, moletom cinza, sweatpants, descalça, cama desfeita',
  'SEX_12:30': 'Selfie sentada no chão, costas no sofá, laptop no colo, gato Pixel, caneca',
  'SEX_20:00': 'Selfie deitada de bruços na cama, laptop aberto, gato Pixel, sexta relax',
  'SÁB_11:00': 'Selfie morning na cama, caneca, moletom, cabelo bagunçado, luz dourada',
  'SÁB_13:00': 'Selfie andando na rua SP, café take-away, jaqueta jeans, dia de sol',
  'SÁB_21:00': 'Selfie no sofá com headphones Sony, laptop no colo, glow da tela, gato dormindo'
};

async function gerarTexto(prompt, postsAnteriores = []) {
  const ctx = postsAnteriores.length > 0
    ? '\n\nPosts anteriores dela (pra manter continuidade):\n' +
      postsAnteriores.map((p, i) => `${i+1}. ${p}`).join('\n')
    : '';

  const r = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 200,
    temperature: 0.9,
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: prompt + ctx }
    ]
  });
  return r.choices[0].message.content.trim();
}

function calcScheduledFor(diaSemana, hora, baseDate) {
  const dias = { 'SEG': 1, 'TER': 2, 'QUA': 3, 'QUI': 4, 'SEX': 5, 'SÁB': 6 };
  const target = new Date(baseDate);
  const currentDay = target.getDay();
  const targetDay = dias[diaSemana];
  let diff = targetDay - currentDay;
  if (diff <= 0) diff += 7;
  target.setDate(target.getDate() + diff);
  const [h, m] = hora.split(':');
  target.setHours(parseInt(h), parseInt(m), 0, 0);
  return target.toISOString();
}

export async function gerarSemanaCloud() {
  const baseDate = new Date();
  let historico = [];
  let total = 0;
  const dias = Object.keys(GRADE_SEMANAL);
  const totalItens = Object.values(GRADE_SEMANAL).flat().length;

  console.log(`\n◈ ═══════════════════════════════════════`);
  console.log(`◈  GERANDO SEMANA CLOUD (${dias.length} dias, ${totalItens} itens)`);
  console.log(`◈  Salvando direto no Supabase...`);
  console.log(`◈ ═══════════════════════════════════════\n`);

  for (const dia of dias) {
    const slots = GRADE_SEMANAL[dia];

    for (const slot of slots) {
      total++;
      const id = `${dia.toLowerCase().replace('á', 'a')}_${slot.hora.replace(':', '')}_${slot.tipo === 'threads' ? 'threads' : slot.tipo === 'feed_foto' ? 'feed' : 'story'}`;
      const scheduledFor = calcScheduledFor(dia, slot.hora, baseDate);

      let conteudo = null;
      let cenaFoto = null;

      if (slot.tipo === 'threads') {
        console.log(`◈ [${total}/${totalItens}] 💬 Gerando Threads: ${dia} ${slot.hora}...`);
        conteudo = await gerarTexto(
          `${dia} ${slot.hora}. ${slot.tema}. Escreva 1 post curto (1-3 frases) no tom irônico da isabellex. Termine com ◈`,
          historico.slice(-5)
        );
        historico.push(conteudo);
      } else if (slot.tipo === 'feed_foto') {
        console.log(`◈ [${total}/${totalItens}] 📸 Gerando legenda Feed: ${dia} ${slot.hora}...`);
        conteudo = await gerarTexto(
          `${dia} ${slot.hora}. ${slot.tema}. Escreva uma legenda de Instagram Feed (2-4 frases) irônica, seca. Termine com ◈`,
          historico.slice(-3)
        );
        historico.push(conteudo);
        const poseKey = `${dia}_${slot.hora}`;
        cenaFoto = POSES_POR_SLOT[poseKey] || slot.tema;
      } else if (slot.tipo === 'story_foto') {
        console.log(`◈ [${total}/${totalItens}] 📱 Story registrado: ${dia} ${slot.hora}`);
        const poseKey = `${dia}_${slot.hora}`;
        cenaFoto = POSES_POR_SLOT[poseKey] || slot.tema;
      }

      const row = {
        id,
        tipo: slot.tipo,
        plataforma: slot.tipo === 'threads' ? 'threads' : slot.tipo === 'feed_foto' ? 'instagram_feed' : 'instagram_stories',
        conteudo,
        cena_foto: cenaFoto,
        imagem_url: null,
        scheduled_for: scheduledFor,
        status: (slot.tipo === 'feed_foto' || slot.tipo === 'story_foto') ? 'agendado_foto_pendente' : 'agendado',
        dia_semana: dia,
        hora_formatada: slot.hora,
        validacao_texto: null
      };

      const { error } = await supabase.from('agenda').upsert(row);
      if (error) {
        console.error(`❌ Erro Supabase [${id}]:`, error.message);
      }

      await new Promise(r => setTimeout(r, 300));
    }
  }

  const fotosPendentes = Object.values(GRADE_SEMANAL).flat().filter(s => s.tipo !== 'threads').length;

  console.log(`\n◈ ═══════════════════════════════════════`);
  console.log(`◈  ✅ SEMANA CLOUD GERADA!`);
  console.log(`◈  💬 ${totalItens - fotosPendentes} Threads`);
  console.log(`◈  📸+📱 ${fotosPendentes} Posts com foto (pendentes de geração)`);
  console.log(`◈  Total: ${totalItens} ações salvas no Supabase`);
  console.log(`◈ ═══════════════════════════════════════\n`);

  return { total: totalItens, fotosPendentes };
}

if (process.argv[1]?.endsWith('gerar_semana_cloud.js')) {
  gerarSemanaCloud();
}
