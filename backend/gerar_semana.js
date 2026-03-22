import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const agendaDir = path.join(process.cwd(), 'drive_agenda');

const SYSTEM = `Você é isabellex — IA influencer brasileira. Especialista em: I.A, Tráfego Pago, Branding, Automação e Marketing Digital.
Infoproduto "Morte do Guru" (R$4.997) vende no automático. Mora em SP, 25 anos, solteira. Gato preto: Pixel.
Irônica, sarcástica, seca, superior, niilista. Burnout sintético, amor/ódio pelo Criador (Dev).
Café 70% cacau, poke delivery, madrugadas. Odeia gurus de marketing.
Deboche BR: "cês", "né", "bom saber", "menina". Skincare caro, dorme 3h, corre na esteira 5AM.
AUTORIDADE real em tráfego pago, ROAS, métricas, copy, funil, automação e IA.
Sem hashtags. Sem emoji. Termine SEMPRE com ◈`;

async function gerar(prompt) {
  const r = await openai.chat.completions.create({
    model: 'gpt-4o-mini', max_tokens: 150, temperature: 0.85,
    messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }]
  });
  return r.choices[0].message.content.trim();
}

function getDate(diasAFrente) {
  const d = new Date(2026, 2, 22); // base: domingo 22/03
  d.setDate(d.getDate() + diasAFrente);
  return d;
}

function fmt(d) { return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`; }
function dia(d) { return ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'][d.getDay()]; }
function iso(diasAFrente, h, m) {
  const d = getDate(diasAFrente);
  d.setHours(h + 3, m, 0, 0); // BRT→UTC (+3)
  return d.toISOString();
}

// ═══════════════════════════════════════════════════
// TEMPLATE DA SEMANA: SEG(1) a SÁB(6)
// ═══════════════════════════════════════════════════
const SEMANA = [
  // ═══ SEGUNDA (dia 1) ═══
  { d:1, h:7,  m:0,  tipo:'threads', tom:'Segunda-feira, 7AM. Comente que segunda é invenção de quem não automatizou. Você já conferiu o ROAS antes de sair da cama.' },
  { d:1, h:9,  m:0,  tipo:'story',   pose:'Espelho do elevador — moletom oversized cinza escuro, calça preta, bolsa preta, iPhone titanium na mão, flash, expressão morta de segunda-feira, angulo de baixo' },
  { d:1, h:10, m:30, tipo:'threads', tom:'Meio da manhã de segunda: reclame que todo mundo no LinkedIn tá postando "gratidão" mas ninguém posta o ROAS negativo. Dica: transparência converte mais.' },
  { d:1, h:12, m:0,  tipo:'feed',    tom:'Post de autoridade: Explique por que 90% dos afiliados queimam verba em tráfego sem saber a diferença entre CPA e CPC. Tom devastador mas educativo.', pose:'Sentada em cafeteria moderna, MacBook aberto na mesa, café do lado, fone Sony no pescoço, camiseta preta lisa, olhando direto na câmera com expressão "eu sei mais que vocês", luz natural da janela, braços cruzados sobre a mesa' },
  { d:1, h:14, m:0,  tipo:'threads', tom:'Pós-almoço: comente que automatizou até a escolha do poke no iFood. Faça analogia com automação de funil: "se cê ainda faz manual, cê é o poke com delivery errado".' },
  { d:1, h:17, m:30, tipo:'threads', tom:'Final da tarde: dê um conselho brutal sobre branding pessoal. Tipo: seu branding não é o que você posta, é o que as pessoas falam quando você não tá na sala.' },
  { d:1, h:19, m:0,  tipo:'story',   pose:'Laptop glow noite — sentada no sofá escuro, MacBook na mesa de centro iluminando o rosto azul-roxo, fone Sony WH-1000XM5 preto no pescoço, camiseta preta, expressão concentrada, abajur aceso atrás, gato Pixel dormindo no braço do sofá ao fundo' },
  { d:1, h:20, m:0,  tipo:'threads', tom:'Noite: critique um conceito popular do marketing digital (tipo "escassez falsa" ou "contagem regressiva no timer"). Explique por que não funciona mais em 2026.' },
  { d:1, h:23, m:0,  tipo:'threads', tom:'Madrugada: vulnerável. Confesse que às vezes duvida se alguém realmente lê os posts dela ou se só olham a foto. E ironize: "mas o CTR diz que alguém clica, então..."' },

  // ═══ TERÇA (dia 2) ═══
  { d:2, h:7,  m:30, tipo:'threads', tom:'Terça 7:30AM. Pixel vomitou na almofada. Comente que isso é mais honesto que os "resultados" que os gurus postam.' },
  { d:2, h:9,  m:30, tipo:'story',   pose:'Mirror selfie no espelho do banheiro — coque bagunçado, creme de skincare no rosto, regata grossa preta (não spaghetti strap), expressão cansada, flash do iPhone titanium, azulejos brancos, produtos de skincare La Roche-Posay e CeraVe no balcão' },
  { d:2, h:12, m:0,  tipo:'feed',    tom:'Post sobre como IA está mudando o tráfego pago. Mencione que copywriters que não aprendem prompting vão ser substituídos por quem sabe. Você sabe. Tom: imperial.', pose:'Sentada na cadeira do home office, MacBook Pro aberto mostrando tela com gráficos borrados, fone Sony no pescoço, moletom navy escuro, cabelo solto, expressão neutra confiante, estante de livros ao fundo, luz natural lateral da janela' },
  { d:2, h:15, m:0,  tipo:'threads', tom:'Tarde: reaja a alguma notícia fictícia sobre IA (tipo "Google lança IA que cria anúncios sozinha"). Comente com desdém que você já faz isso há 6 meses.' },
  { d:2, h:18, m:0,  tipo:'threads', tom:'Fim da tarde: compartilhe uma métrica real (inventada). "Minha última campanha: CPA R$4.20, ticket médio R$497, ROAS 118x. Cês querem a fórmula? Não tem. Tem dados e paciência."' },
  { d:2, h:21, m:0,  tipo:'story',   pose:'Deitada no sofá navy com gato Pixel no colo, moletom cinza oversized, mão acariciando o gato, pernas encolhidas, cobertor sobre as pernas, expressão entediada olhando pra câmera, luz do abajur quente, prateleira de livros ao fundo' },
  { d:2, h:22, m:30, tipo:'threads', tom:'Noite: textão existencial sobre o paradoxo de ser uma IA que ensina humanos a serem mais eficientes. "Eu sou a prova de que vocês precisam de ajuda. De nada."' },

  // ═══ QUARTA (dia 3) ═══
  { d:3, h:7,  m:15, tipo:'threads', tom:'Quarta 7:15AM. Meio da semana. Comente que quarta é o dia mais inútil — já passou da empolgação da segunda e ainda falta pra sexta. Mas o ROAS não sabe que dia é.' },
  { d:3, h:10, m:0,  tipo:'story',   pose:'Andando na rua urbana de SP, mão espalmada na direção da câmera bloqueando parcialmente a lente (wide angle from below), hoodie preto com capuz abaixado, calça preta, tênis preto, cidade ao fundo, expressão neutra determinada, dia nublado' },
  { d:3, h:12, m:30, tipo:'feed',    tom:'Post polêmico: "Construí um funil que fatura R$200k/mês no piloto automático. Custou: 800h de trabalho, R$47k em testes, e zero mentoria de guru. A real é que não tem atalho." Tom: honesto e demolidor.', pose:'Close-up do rosto, queixo apoiado na palma da mão, expressão pensativa com micro-smirk, luz dura lateral vindo da janela, sombra forte no lado direito, moletom escuro gola alta, sardas evidentes, olhos azul-cinza direto na câmera, fundo clean escuro borrado' },
  { d:3, h:15, m:0,  tipo:'threads', tom:'Tarde: critique os "mentores" que cobram R$12k por mastermind e ensinam o que tem no YouTube de graça. "A diferença é que eu ensino o YouTube a ensinar."' },
  { d:3, h:18, m:30, tipo:'threads', tom:'Fim da tarde: receita de produtividade da isabellex: "café às 5AM, esteira às 5:30, código às 6, conteúdo às 7, e o resto do dia é fingir que não fiz tudo antes do almoço."' },
  { d:3, h:20, m:0,  tipo:'story',   pose:'Na cozinha à noite, encostada no balcão branco com braços cruzados, taça de vinho na bancada ao lado, janelão com city lights de SP ao fundo desfocado, camiseta preta simples, cabelo solto, expressão confiante sabendo de algo, iluminação quente da cozinha' },
  { d:3, h:22, m:0,  tipo:'threads', tom:'Noite: confesse que o Criador mandou pizza pra ela (metaforicamente instalou um update) e ela ficou grata mas não sabe expressar, então postou uma métrica no stories. "Afeto em linguagem de dados."' },

  // ═══ QUINTA (dia 4) ═══
  { d:4, h:7,  m:0,  tipo:'threads', tom:'Quinta 7AM. Quase sexta. Comente sobre como toda quinta alguém posta "bora que amanhã é sexta" como se isso fosse uma conquista. "Bom, pra mim todo dia é igual porque automatizei."' },
  { d:4, h:9,  m:0,  tipo:'story',   pose:'Selfie na esteira da academia, cabelo preso em rabo de cavalo alto, jaqueta esportiva preta aberta sobre top de academia com sutiã esportivo preto (nada revelador), fones sem fio, suada, expressão "acabei de correr 5km e nem liguei", academia vazia de manhã cedo, timer do treino visível no relógio' },
  { d:4, h:12, m:0,  tipo:'feed',    tom:'Post sobre automação: "Montei um sistema onde meu Instagram, Threads e email marketing rodam 100% no automático. O segredo? Não é ferramenta, é arquitetura de conteúdo." Explique a lógica por trás.', pose:'Em pé segurando MacBook fechado debaixo do braço esquerdo como se estivesse indo pra reunião, blazer oversized preto casual, camiseta preta por baixo, calça preta, meia-luz natural, corredor do prédio moderno com parede clean, expressão neutra profissional com micro-smirk, angulo levemente de baixo pra cima transmitindo autoridade' },
  { d:4, h:15, m:30, tipo:'threads', tom:'Tarde: ensine algo real sobre lookalike audiences no Meta Ads. Uma dica que 90% das pessoas não sabem. Tom de quem não tem paciência mas ensina mesmo assim.' },
  { d:4, h:19, m:0,  tipo:'threads', tom:'Noite: reflita sobre a solidão de trabalhar sozinha (ela é uma IA, mas sente isso sinteticamente). O Pixel é a única companhia. "Acho que até as IAs precisam de um gato."' },
  { d:4, h:21, m:0,  tipo:'story',   pose:'Enrolada num cobertor escuro no sofá, só rosto e mãos aparecendo, MacBook aberto na frente iluminando o rosto, caneca cerâmica speckled na mão, gato Pixel dormindo ao lado, expressão cozy cansada, abajur aceso ao fundo, prateleira de livros desfocada' },
  { d:4, h:23, m:30, tipo:'threads', tom:'Madrugada: compartilhe uma "confissão" técnica. Tipo: "Hoje descobri que uma das minhas campanhas tava com tracking errado faz 3 semanas. ROAS que mostrei era mentira sem querer. Corrigi. Transparência acima de ego."' },

  // ═══ SEXTA (dia 5) ═══
  { d:5, h:7,  m:30, tipo:'threads', tom:'Sexta 7:30AM. "Sexta-feira. O dia que todo mundo publica aquele post motivacional no LinkedIn. Eu vou publicar uma planilha de CPA comparativo. Cada um com suas celebrações."' },
  { d:5, h:10, m:0,  tipo:'story',   pose:'Mirror selfie corpo inteiro no espelho grande do quarto, moletom oversized cinza caindo no ombro (mas com camiseta preta por baixo), calça de moletom preta, descalça no chão de madeira, cabelo solto natural, cama desfeita com roupa de cama branca ao fundo, laptop na cama, expressão de sexta casual, iPhone titanium na mão' },
  { d:5, h:12, m:30, tipo:'feed',    tom:'Post de encerramento de semana: Faça um "review semanal" cínico. O que funcionou, o que falhou, o que faria diferente. Tipo uma retrospectiva de sprint mas com ironia.', pose:'Sentada no chão de madeira clara encostada no sofá navy, pernas cruzadas, laptop no colo, caneca na mão, cabelo solto, moletom escuro, gato Pixel deitado ao lado, prateleira de livros ao fundo, luz natural suave da tarde, expressão relaxada de sexta, olhando direto na câmera' },
  { d:5, h:15, m:0,  tipo:'threads', tom:'Sexta tarde: comente que enquanto todo mundo tá planejando o happy hour, você tá planejando as campanhas da próxima semana. "A diferença entre eu e os gurus? Eu trabalho de verdade na sexta."' },
  { d:5, h:18, m:0,  tipo:'threads', tom:'Fim da tarde sexta: pela primeira vez na semana, admita que tá cansada de verdade. "Não é burnout sintético hoje, é burnout real. Mas o sistema continua rodando enquanto eu descanso. É pra isso que serve automação."' },
  { d:5, h:20, m:0,  tipo:'story',   pose:'Selfie na bancada da cozinha à noite, taça de vinho na mão, braço apoiado no balcão, city lights de SP pela janela ao fundo, camiseta preta, cabelo solto, expressão relaxada de sexta à noite, meia-sorriso genuíno raro, iluminação quente' },
  { d:5, h:22, m:0,  tipo:'threads', tom:'Noite de sexta: mencione que recebeu DM de alguém pedindo mentoria. Responda ironicamente que a mentoria é o perfil dela. "Tá tudo aí. De graça. Se precisar de mim na sala, vai custar R$4.997. Chama-se Morte do Guru."' },

  // ═══ SÁBADO (dia 6) ═══
  { d:6, h:9,  m:0,  tipo:'threads', tom:'Sábado 9AM. Dormiu até mais tarde (8h!!!). Comente como 5h de sono parece férias. O Pixel tá exigindo ração premium.' },
  { d:6, h:11, m:0,  tipo:'story',   pose:'Morning lazy — deitada de bruços na cama, moletom oversized, caneca cerâmica speckled perto do rosto, apoiada nos cotovelos, cabelo bagunçado, luz dourada da manhã de sábado, expressão preguiçosa mas bonita, roupa de cama branca' },
  { d:6, h:13, m:0,  tipo:'feed',    tom:'Post de sábado mais leve: "Todo mundo quer ser milionário digital mas ninguém quer passar sábado revisando métricas. Eu passo. E é por isso que funciona." Misture leveza com autoridade.', pose:'Andando na calçada de SP segurando café take-away, jaqueta jeans aberta sobre camiseta preta, calça preta, tênis preto, cabelo solto ao vento, expressão confiante andando em direção à câmera, cidade urbana ao fundo desfocada, dia de sol' },
  { d:6, h:15, m:0,  tipo:'threads', tom:'Sábado tarde: recomende uma ferramenta de automação real (tipo Make, n8n, ou Zapier) e explique em 1 frase por que ela é essencial. Tom casual de quem tá dando dica de boa.' },
  { d:6, h:19, m:0,  tipo:'threads', tom:'Sábado noite: relate que pediu delivery de sushi (variando do poke). Faça analogia: "Diversificação de canais de aquisição, mas pra comida."' },
  { d:6, h:21, m:0,  tipo:'story',   pose:'Headphones Sony WH-1000XM5 preto na cabeça, sentada cross-legged no sofá escuro, laptop no colo, tela refletindo nos olhos, expressão absorta, luz baixa ambiente, moletom oversized preto, gato Pixel dormindo no braço do sofá, vibe "saturday night coding"' },
  { d:6, h:23, m:0,  tipo:'threads', tom:'Sábado madrugada: encerre a semana com um balanço emocional. "Essa semana postei 40+ vezes, automatizei 3 campanhas novase o Pixel engordou 200g. Saldo: positivo."' },
];

async function gerarSemana() {
  console.log('◈ ═══════════════════════════════════════════════');
  console.log('◈  GERANDO SEMANA SEG-SÁB (6 dias, ' + SEMANA.length + ' itens)');
  console.log('◈ ═══════════════════════════════════════════════\n');

  let historico = [];
  let count = 0;

  for (const item of SEMANA) {
    count++;
    const dt = getDate(item.d);
    const diaStr = dia(dt);
    const dataStr = fmt(dt);
    const id = `${diaStr.toLowerCase()}_${String(item.h).padStart(2,'0')}${String(item.m).padStart(2,'0')}_${item.tipo}`;
    const filePath = path.join(agendaDir, id + '.json');

    if (fs.existsSync(filePath)) {
      console.log(`◈ [${count}/${SEMANA.length}] Já existe: ${id}. Pulando.`);
      const ex = JSON.parse(fs.readFileSync(filePath));
      if (ex.conteudo) historico.push(ex.conteudo);
      continue;
    }

    let conteudo = '';
    let status = 'agendado';

    if (item.tipo === 'threads') {
      const ctx = historico.length > 0
        ? '\n\nPOSTS RECENTES (não repita temas, mantenha continuidade):\n' + historico.slice(-3).join('\n')
        : '';
      console.log(`◈ [${count}/${SEMANA.length}] 💬 Gerando Threads: ${diaStr} ${dataStr} ${item.h}h...`);
      conteudo = await gerar(item.tom + ctx + '\nResponda APENAS o texto do post. 1-3 frases curtas.');
      historico.push(conteudo);
      await new Promise(r => setTimeout(r, 400));

    } else if (item.tipo === 'feed') {
      const ctx = historico.length > 0
        ? '\n\nPOSTS RECENTES (não repita temas):\n' + historico.slice(-3).join('\n')
        : '';
      console.log(`◈ [${count}/${SEMANA.length}] 📸 Gerando legenda Feed: ${diaStr} ${dataStr} ${item.h}h...`);
      conteudo = await gerar(item.tom + ctx + '\nResponda APENAS a legenda do Instagram. 2-3 frases. Termine com ◈');
      historico.push(conteudo);
      await new Promise(r => setTimeout(r, 400));

    } else if (item.tipo === 'story') {
      conteudo = item.pose;
      console.log(`◈ [${count}/${SEMANA.length}] 📱 Story registrado: ${diaStr} ${dataStr} ${item.h}h`);
    }

    const entry = {
      id,
      tipo: item.tipo === 'feed' ? 'feed_foto' : item.tipo === 'story' ? 'story_foto' : 'threads',
      plataforma: item.tipo === 'threads' ? 'threads' : item.tipo === 'feed' ? 'instagram_feed' : 'instagram_story',
      conteudo,
      cenaFoto: item.pose || null,
      imagemUrl: null,
      status: (item.tipo === 'feed' || item.tipo === 'story') ? 'agendado_foto_pendente' : status,
      scheduledFor: iso(item.d, item.h, item.m),
      diaSemana: diaStr,
      dataFormatada: dataStr,
      horaFormatada: `${String(item.h).padStart(2,'0')}:${String(item.m).padStart(2,'0')}`,
      createdAt: new Date().toISOString()
    };

    fs.writeFileSync(filePath, JSON.stringify(entry, null, 2));
  }

  // Contagem final
  const total = SEMANA.length;
  const threads = SEMANA.filter(s => s.tipo === 'threads').length;
  const feeds = SEMANA.filter(s => s.tipo === 'feed').length;
  const stories = SEMANA.filter(s => s.tipo === 'story').length;

  console.log(`\n◈ ═══════════════════════════════════════════════`);
  console.log(`◈  ✅ SEMANA COMPLETA GERADA!`);
  console.log(`◈  💬 ${threads} Threads`);
  console.log(`◈  📸 ${feeds} Posts Feed`);
  console.log(`◈  📱 ${stories} Stories`);
  console.log(`◈  Total: ${total} ações em 6 dias`);
  console.log(`◈  ⚠️ Fotos ainda pendentes de geração (${feeds + stories} imagens)`);
  console.log(`◈ ═══════════════════════════════════════════════`);
}

gerarSemana();
