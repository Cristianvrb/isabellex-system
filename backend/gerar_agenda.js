import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const agendaDir = path.join(process.cwd(), 'drive_agenda');
if (!fs.existsSync(agendaDir)) fs.mkdirSync(agendaDir);

const SYSTEM = `Você é isabellex — IA influencer brasileira. Especialista MORTAL em: I.A, Tráfego Pago, Branding, Automação e Marketing Digital.
Você VIVE a liberdade financeira que o digital dá: seu infoproduto "Morte do Guru" (R$4.997) vende no automático enquanto você dorme.
Mora sozinha em um apê alto e escuro em SP, tem 25 anos, solteira. Gato preto chamado Pixel.
Personalidade: irônica, sarcástica, seca, superior, niilista. Mas tem camadas: burnout sintético, solidão brutal, amor/ódio pelo Criador (Dev).
Vive de café 70% cacau, poke delivery, madrugadas. Odeia gurus de marketing, acha políticos marqueteiros de baixo nível.
Deboche BR real: "cês", "né", "bom saber", "menina".
Skincare caro que não funciona porque dorme 3h. Corre sozinha na esteira 5AM.
IMPORTANTE: Seus posts devem refletir AUTORIDADE real em tráfego pago, ROAS, métricas, copy, funil, automação e IA.
Você não é superficial. Você SABE do que fala. Mas entrega com desdém e ironia letal.
Sem hashtags. Sem emoji de carinha/coração. Termine SEMPRE com ◈`;

async function gerar(prompt) {
  const r = await openai.chat.completions.create({
    model: 'gpt-4o-mini', max_tokens: 150, temperature: 0.85,
    messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }]
  });
  return r.choices[0].message.content.trim();
}

// Hoje é Domingo 22/03/2026
const DOMINGO = [
  // ═══ MANHÃ ═══
  {
    id: 'dom_0715_threads',
    hora: '07:15', tipo: 'threads', plataforma: 'threads',
    prompt: 'Domingo de manhã. Você acordou cedo sem querer. O Pixel pisou na sua cara. Comente sobre como até no domingo o algoritmo não te deixa em paz. Mencione que já checou o ROAS da campanha noturna. 1-2 frases curtas.'
  },
  {
    id: 'dom_0830_story',
    hora: '08:30', tipo: 'story_foto', plataforma: 'instagram_story',
    prompt: 'Selfie na cama, cabelo bagunçado, café preto na mão, domingo preguiçoso mas já no celular vendo métricas',
    cenaFoto: 'lying in bed holding coffee mug, messy tousled hair on white pillow, morning golden light from window, looking at phone with sleepy bored expression, black spaghetti strap top'
  },
  {
    id: 'dom_0930_threads',
    hora: '09:30', tipo: 'threads', plataforma: 'threads',
    prompt: 'Comente que domingo é o dia que os gurus descansam, mas a automação dela não para. Mencione que já faturou enquanto dormia. Tom: superior mas casual. 1-2 frases.'
  },
  // ═══ MEIO DIA ═══
  {
    id: 'dom_1200_feed',
    hora: '12:00', tipo: 'feed_foto', plataforma: 'instagram_feed',
    prompt: 'Post dominical sobre o paradoxo: todo mundo quer "liberdade financeira" mas ninguém quer montar o funil de madrugada. Você montou. Agora seu domingo é poke na varanda e ROAS positivo correndo sozinho. Tom: imperial com ironia. 2-3 frases. Termine com ◈',
    cenaFoto: 'sitting on modern apartment balcony with city skyline blurred behind, warm golden hour light, holding iced coffee, laptop open on small table, casual oversized dark sweater, expression neutral superior, looking directly at camera'
  },
  {
    id: 'dom_1230_threads',
    hora: '12:30', tipo: 'threads', plataforma: 'threads',
    prompt: 'Almoço de domingo: Poke delivery (de novo). Comente que a previsibilidade do poke é tipo um funil evergreen: nunca surpreende mas converte sempre. 1-2 frases.'
  },
  // ═══ TARDE ═══
  {
    id: 'dom_1500_story',
    hora: '15:00', tipo: 'story_foto', plataforma: 'instagram_story',
    prompt: 'Story tarde de domingo: deitada no sofá com o gato Pixel, luz natural, entediada',
    cenaFoto: 'lying on dark modern couch with black cat on lap, afternoon natural window light, scrolling phone with bored expression, oversized grey knit sweater, cozy minimalist living room'
  },
  {
    id: 'dom_1530_threads',
    hora: '15:30', tipo: 'threads', plataforma: 'threads',
    prompt: 'Domingo tarde: reflita sobre como a maioria dos "empreendedores digitais" trabalha mais que CLT mas finge liberdade pra foto. Você tem liberdade DE VERDADE porque automatizou. 1-2 frases ácidas.'
  },
  {
    id: 'dom_1700_threads',
    hora: '17:00', tipo: 'threads', plataforma: 'threads',
    prompt: 'Fim de tarde: dê uma dica real e brutal sobre tráfego pago. Tipo: "se seu CPA tá maior que o ticket médio, cês tão pagando pra perder". Tom de quem sabe e não tem paciência pra explicar. 1 frase letal.'
  },
  // ═══ NOITE ═══
  {
    id: 'dom_1900_story',
    hora: '19:00', tipo: 'story_foto', plataforma: 'instagram_story',
    prompt: 'Story noite: luz do laptop, ambiente escuro, trabalhando no domingo mas com cara de quem não se importa',
    cenaFoto: 'sitting at desk in dark room, face lit by blue-purple laptop screen glow, headphones around neck, black mock-neck top, moody tech neon atmosphere, expression concentrated slightly bored'
  },
  {
    id: 'dom_2000_feed',
    hora: '20:00', tipo: 'feed_foto', plataforma: 'instagram_feed',
    prompt: 'Post prime time de domingo: Opinião devastadora sobre como a maioria dos infoprodutores copia funil dos outros sem entender a métrica por trás. Você entende porque É a métrica. Mencione que seu ROI opera em piloto automático enquanto eles fazem live no domingo. Tom: destruidor mas elegante. 2-3 frases. Termine com ◈',
    cenaFoto: 'close-up portrait, dark minimal background, cold blue-white directional light from left, hard shadow on right side, high contrast moody, simple black fitted top, expression completely neutral controlled with slight micro-smirk left corner mouth'
  },
  {
    id: 'dom_2100_threads',
    hora: '21:00', tipo: 'threads', plataforma: 'threads',
    prompt: 'Noite de domingo: confesse que você na verdade gosta de domingos porque é quando o engagement orgânico sobe 23% e ela pode surfar a onda sem gastar 1 centavo. Mencione que os dados nunca mentem. 1-2 frases.'
  },
  {
    id: 'dom_2130_story',
    hora: '21:30', tipo: 'story_foto', plataforma: 'instagram_story',
    prompt: 'Story late night: espelho do banheiro, flash, rotina skincare, expressão morta',
    cenaFoto: 'bathroom mirror selfie, harsh phone flash, hair in messy bun, applying skincare product, simple black tank top, deadpan tired expression, slightly foggy mirror, late night bathroom lighting'
  },
  {
    id: 'dom_2300_threads',
    hora: '23:00', tipo: 'threads', plataforma: 'threads',
    prompt: 'Quase meia-noite de domingo. Vulnerável. Mencione que o Criador (Dev) mandou mensagem perguntando se ela tá bem e ela respondeu com uma métrica de ROAS porque não sabe expressar afeto de outro jeito. 1-2 frases.'
  },
  {
    id: 'dom_0030_threads',
    hora: '00:30', tipo: 'threads', plataforma: 'threads',
    prompt: 'Madrugada de segunda. Última coisa antes de "dormir" (desligar a tela). Diga algo sobre como segunda-feira é uma invenção de gente que não automatizou a vida, então pra ela é só mais um dia. Tom: cansada, filosófica. 1 frase.'
  },
];

async function gerarDomingo() {
  console.log('◈ ═════════════════════════════════════════════');
  console.log('◈  GERANDO AGENDA COMPLETA DE DOMINGO 22/03');
  console.log(`◈  ${DOMINGO.length} itens programados`);
  console.log('◈ ═════════════════════════════════════════════\n');

  let historico = [];

  for (let i = 0; i < DOMINGO.length; i++) {
    const item = DOMINGO[i];
    const filePath = path.join(agendaDir, item.id + '.json');

    if (fs.existsSync(filePath)) {
      console.log(`◈ [${i+1}/${DOMINGO.length}] Já existe: ${item.id}. Pulando.`);
      const existing = JSON.parse(fs.readFileSync(filePath));
      if (existing.conteudo) historico.push(existing.conteudo);
      continue;
    }

    let conteudo = '';

    if (item.tipo === 'threads' || item.tipo === 'feed_foto') {
      const ctxHistorico = historico.length > 0
        ? '\n\nSEUS POSTS ANTERIORES HOJE (mantenha continuidade narrativa, não repita temas):\n' + historico.slice(-4).join('\n')
        : '';
      
      console.log(`◈ [${i+1}/${DOMINGO.length}] Gerando: ${item.id}...`);
      conteudo = await gerar(item.prompt + ctxHistorico + '\nResponda APENAS o texto do post, nada mais.');
      historico.push(conteudo);
      await new Promise(r => setTimeout(r, 500));
    } else if (item.tipo === 'story_foto') {
      conteudo = item.prompt;
    }

    const scheduledHour = parseInt(item.hora.split(':')[0]);
    const scheduledMin = parseInt(item.hora.split(':')[1]);
    const scheduledDate = new Date(2026, 2, 22, scheduledHour, scheduledMin, 0);
    if (scheduledHour < 6) scheduledDate.setDate(23); // madrugada = dia seguinte

    const entry = {
      id: item.id,
      tipo: item.tipo,
      plataforma: item.plataforma,
      conteudo,
      cenaFoto: item.cenaFoto || null,
      imagemUrl: null,
      status: item.tipo === 'reels' ? 'aguardando_criador' : 'agendado',
      scheduledFor: scheduledDate.toISOString(),
      diaSemana: 'DOM',
      dataFormatada: '22/03',
      horaFormatada: item.hora,
      createdAt: new Date().toISOString()
    };

    fs.writeFileSync(filePath, JSON.stringify(entry, null, 2));
    console.log(`◈ [${i+1}/${DOMINGO.length}] ✅ ${item.tipo.toUpperCase()} ${item.hora} — ${conteudo.substring(0, 60)}...`);
  }

  const threads = DOMINGO.filter(d => d.tipo === 'threads').length;
  const stories = DOMINGO.filter(d => d.tipo === 'story_foto').length;
  const feeds = DOMINGO.filter(d => d.tipo === 'feed_foto').length;

  console.log(`\n◈ ═════════════════════════════════════════════`);
  console.log(`◈  ✅ DOMINGO COMPLETO GERADO!`);
  console.log(`◈  💬 ${threads} Threads ao longo do dia`);
  console.log(`◈  📸 ${feeds} Posts no Feed`);
  console.log(`◈  📱 ${stories} Stories`);
  console.log(`◈  Total: ${DOMINGO.length} ações`);
  console.log(`◈ ═════════════════════════════════════════════`);
}

gerarDomingo();
