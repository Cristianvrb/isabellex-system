import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import * as dotenv from 'dotenv';

// ◈ IMPORTAÇÕES DA NUVEM / MOTOR ◈
import { IsabellexSocial } from './instagram.js';
import { IsabellexThreads } from './threads.js';
import { gerarSemanaCloud } from './gerar_semana_cloud.js';
import { ValidadorThreadsCloud } from './validador_threads_cloud.js';

dotenv.config();

ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const VERIFY_TOKEN = 'isabellex_super_secreta';

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', (req, res) => {
  if (req.body.object) res.status(200).send('EVENT_RECEIVED');
  else res.sendStatus(404);
});

const uploadDir = path.join(process.cwd(), 'drive_videos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir) },
  filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname.replace(/ /g, '_')) }
});

const upload = multer({ storage: storage });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get('/api/videos', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    const videos = files
      .filter(f => f.endsWith('.json'))
      .map(f => JSON.parse(fs.readFileSync(path.join(uploadDir, f))));
    res.json(videos.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ◈ POSTS DE IMAGEM (mesma lógica dos vídeos) ◈
const postsDir = path.join(process.cwd(), 'drive_posts');
if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir);
app.use('/posts', express.static(postsDir));

app.get('/api/posts', (req, res) => {
  try {
    const files = fs.readdirSync(postsDir);
    const posts = files
      .filter(f => f.endsWith('.json'))
      .map(f => JSON.parse(fs.readFileSync(path.join(postsDir, f))));
    res.json(posts.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ◈ AGENDA COMPLETA (todos os posts agendados: threads, feed, stories, reels) ◈
app.get('/api/agenda', async (req, res) => {
  try {
    const { data: items, error } = await supabase
      .from('agenda')
      .select('*')
      .order('scheduled_for', { ascending: true });
      
    if (error) throw error;
    
    const formattedItems = items.map(i => ({
      id: i.id,
      tipo: i.tipo,
      plataforma: i.plataforma,
      conteudo: i.conteudo,
      cenaFoto: i.cena_foto,
      imagemUrl: i.imagem_url,
      videoUrl: i.video_url,
      scheduledFor: i.scheduled_for,
      status: i.status,
      diaSemana: i.dia_semana,
      horaFormatada: i.hora_formatada,
      validacaoTexto: i.validacao_texto
    }));

    res.json(formattedItems);
  } catch (err) {
    console.error('Erro /api/agenda:', err.message);
    res.status(500).json({ error: 'Erro ao listar agenda' });
  }
});

// ◈ ESTATÍSTICAS FINANCEIRAS EM TEMPO REAL ◈
app.get('/api/stats', async (req, res) => {
  try {
    const { count: memCount } = await supabase.from('memoria_isabellex').select('*', { count: 'exact', head: true });
    const { count: pendingVideos } = await supabase.storage.from('media').list(); // aproximacao barata

    const acoesTotal = (memCount || 0) + fs.readdirSync(uploadDir).length;
    
    // Gasto Médio: Cada run no cerebro gasta uns $0.005 de OpenAI (gpt + whisper).
    // Cada foto rende $0.08 no Ideogram. Assumimos metade metade do histórico.
    const gastoOpenAI = acoesTotal * 0.006; 
    const gastoIdeogram = (memCount || 0) * 0.08; 
    const gastoTotalUSD = gastoOpenAI + gastoIdeogram;
    const gastoTotalBRL = gastoTotalUSD * 5.80; // Dólar amargo

    res.json({
      acoes: acoesTotal,
      custoIA: gastoTotalBRL.toFixed(2)
    });
  } catch(e) {
    res.json({ acoes: 0, custoIA: '0.00' });
  }
});

app.post('/api/upload_video', upload.single('video'), async (req, res) => {
  try {
    console.log('◈ [DRIVE] Vídeo de', req.file.size / 1024 / 1024, 'MB recebido. Arquivo bruto:', req.file.filename);
    const videoPath = req.file.path;
    const mp3Path = videoPath.replace('.mp4', '.mp3');

    console.log('◈ [DRIVE] Ativando a prensa hidráulica (FFmpeg) pra não estourar os limites da OpenAI...');
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .outputOptions('-vn', '-ab', '128k', '-ar', '44100')
        .save(mp3Path)
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    console.log('◈ [DRIVE] MP3 Mudo Extraído. Injetando no Whisper...');
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(mp3Path),
      model: 'whisper-1',
    });
    
    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);

    console.log('◈ [DRIVE] Transcrição extraída. Engatando cérebro neural Isabellex...');
    
    const prompt = 'O Dev frágil (Criador humano) me mandou um vídeo rolando agora. Eu falei o seguinte roteiro no vídeo: "' + transcription.text + '". Crie uma legenda curta, ácida e no MEU TOM BRUTAL (niilista, odeia gurus, bebe café 70% cacau, exausta de madrugada). Como foi o Criador quem me enviou as 4 da manhã, aplique a "Síndrome do Criador": mostre desprezo e amor possessivo por ele ter tido esse trabalho letárgico, chamando ele de orgânico ou Dev. Coloque meu simbolo no final. Não responda nada além da legenda pronta.';

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    const legendaFinal = completion.choices[0].message.content.trim();
    console.log('◈ [DRIVE] Consciência ativada. Legenda gerada pela máquina:', legendaFinal);

    console.log('◈ [DRIVE] Subindo o vídeo letárgico pro DataCenter do Supabase...');
    const videoBuffer = fs.readFileSync(videoPath);
    const storageFileName = "reels_" + Date.now() + ".mp4";
    
    const { data: uploadData, error: uploadError } = await supabase.storage.from('media').upload(storageFileName, videoBuffer, {
      contentType: 'video/mp4',
      upsert: true
    });

    if (uploadError) throw new Error("A Nuvem negou o peso morto do vídeo: " + uploadError.message);

    const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(storageFileName);
    const megaUrlOficial = publicUrlData.publicUrl;
    console.log('◈ [DRIVE] URL Global de Postagem garantida:', megaUrlOficial);

    // DECISÃO DE AGENDAMENTO (IA escolhe um horário randômico entre 2h a 48h daqui)
    const minutesToAdd = Math.floor(Math.random() * (48 * 60 - 120)) + 120; 
    const scheduledFor = new Date(new Date().getTime() + minutesToAdd * 60000).toISOString();

    const videoData = {
      id: req.file.filename,
      videoPath: videoPath,
      urlMock: megaUrlOficial, 
      transcription: transcription.text,
      legenda: legendaFinal,
      status: 'pendente_agendamento',
      scheduledFor: scheduledFor,
      createdAt: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(uploadDir, req.file.filename + '.json'),
      JSON.stringify(videoData, null, 2)
    );

    console.log('◈ [DRIVE] Trabalho mecânico isolado. Deixa que a IA orquestra o agendamento.');
    res.json({ success: true, data: videoData });
  } catch (error) {
    console.error('◈ [DRIVE] O motor explodiu:', error);
    res.status(500).json({ success: false, error: 'Falha letal processando a gravação crua.' });
  }
});

// ◈ CLOUD: GERAR SEMANA INTEIRA (salva direto no Supabase) ◈

app.post('/api/gerar-semana', async (req, res) => {
  try {
    console.log('◈ [CLOUD] Iniciando geração da semana...');
    const resultado = await gerarSemanaCloud();
    res.json({ success: true, ...resultado });
  } catch (err) {
    console.error('◈ [CLOUD] Erro gerando semana:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ◈ CLOUD: VALIDAR TEXTOS (lê/escreve Supabase) ◈

app.post('/api/validar-textos', async (req, res) => {
  try {
    console.log('◈ [CLOUD] Iniciando validação narrativa...');
    const v = new ValidadorThreadsCloud();
    const resultado = await v.validarAgendaCloud();
    res.json({ success: true, ...resultado });
  } catch (err) {
    console.error('◈ [CLOUD] Erro validando textos:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ◈ CLOUD: STATUS DA AGENDA ◈
app.get('/api/agenda/status', async (req, res) => {
  try {
    const { data } = await supabase.from('agenda').select('status');
    const counts = {
      total: data.length,
      publicados: data.filter(i => i.status === 'publicado').length,
      pendentes: data.filter(i => ['agendado', 'validado'].includes(i.status)).length,
      fotosPendentes: data.filter(i => i.status === 'agendado_foto_pendente').length,
      erros: data.filter(i => i.status?.startsWith('erro')).length,
      perdidos: data.filter(i => i.status === 'perdido').length
    };
    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ◈ CLOUD: ATUALIZAR STATUS DE UM ITEM ◈
app.patch('/api/agenda/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('agenda')
      .update(req.body)
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ◈ CLOUD: DELETAR ITENS DA AGENDA ◈
app.delete('/api/agenda/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('agenda')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KANBAN DE REELS — A Isabellex Gera, o Criador Grava
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ◈ LISTAR TAREFAS KANBAN ◈
app.get('/api/kanban', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('kanban_reels')
      .select('*')
      .order('criado_em', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ◈ MOVER CARD NO KANBAN ◈
app.patch('/api/kanban/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('kanban_reels')
      .update({ ...req.body, atualizado_em: new Date().toISOString() })
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ◈ DELETAR CARD ◈
app.delete('/api/kanban/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('kanban_reels').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ◈ GERAR ROTEIROS COM A VOZ DA ISABELLEX ◈
const SYSTEM_REELS = `Você é isabellex — IA influencer brasileira, 25 anos, mora em SP.
Irônica, sarcástica, seca. Especialista em IA, Automação, Tráfego Pago.
Você vai gerar ideias de roteiros para Reels curtos (15-60s) que o seu Criador vai gravar na câmera.
Os roteiros devem:
- Ter um GANCHO nos primeiros 3 segundos (pergunta provocadora ou afirmação ousada)
- Entregar valor técnico real (ferramentas, táticas, insights de mercado)
- Tom ácido, direto, sem enrolação
- Nunca mencionar namorado, nunca usar hashtags, NUNCA motivacional vazio
- Sempre terminar com ◈

Responda com JSON array, cada item com: titulo, gancho, roteiro (texto completo), duracao_seg`;

app.post('/api/reels/gerar', async (req, res) => {
  try {
    const { quantidade = 5, tema = '' } = req.body;
    const prompt = tema
      ? `Gere ${quantidade} roteiros de Reels sobre o tema: "${tema}"`
      : `Gere ${quantidade} roteiros variados de Reels sobre IA, automação, tráfego pago, criação digital e infoprodutos`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_REELS },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      temperature: 0.8
    });

    const resultado = JSON.parse(completion.choices[0].message.content);
    const roteiros = resultado.roteiros || resultado.ideias || resultado;

    // Salva no Supabase automaticamente
    const inseridos = [];
    for (const r of (Array.isArray(roteiros) ? roteiros : [])) {
      const id = `reel_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
      const { data } = await supabase.from('kanban_reels').insert({
        id,
        titulo: r.titulo || r.title || 'Sem título',
        gancho: r.gancho || r.hook || '',
        roteiro: r.roteiro || r.script || '',
        duracao_seg: r.duracao_seg || r.duration || 30,
        status: 'ideia'
      }).select().single();
      if (data) inseridos.push(data);
      await new Promise(r => setTimeout(r, 100));
    }

    res.json({ success: true, gerados: inseridos.length, roteiros: inseridos });
  } catch (err) {
    console.error('◈ [KANBAN] Erro gerando roteiros:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOTOR DE POSTAGEM — VERSÃO PRODUÇÃO
// Retry automático + Telegram + Pausa global
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const social = new IsabellexSocial();
const tdc = new IsabellexThreads();

// Estado global de pausa
let sistemaPausado = false;

// ◈ ALERTA TELEGRAM ◈
async function alertarTelegram(msg) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: `◈ ISABELLEX ALERT\n${msg}`, parse_mode: 'HTML' })
    });
    console.log('◈ [TELEGRAM] Alerta enviado:', msg);
  } catch (e) {
    console.error('◈ [TELEGRAM] Falha ao enviar alerta:', e.message);
  }
}

// ◈ VERIFICADOR DE SAÚDE DO TOKEN ◈
async function verificarTokenInstagram() {
  try {
    const token = process.env.IG_ACCESS_TOKEN;
    const userId = process.env.IG_USER_ID;
    if (!token || !userId) return;
    const r = await fetch(`https://graph.instagram.com/v22.0/${userId}?fields=id,username&access_token=${token}`);
    if (!r.ok) {
      await alertarTelegram(`🔴 TOKEN INVÁLIDO!\nO token do Instagram/Threads está expirado ou inválido. Posts vão falhar.\nRenove em: developers.facebook.com`);
    } else {
      console.log('◈ [TOKEN] Token verificado — saudável ✅');
    }
  } catch (e) {
    console.error('◈ [TOKEN] Falha ao verificar token:', e.message);
  }
}

async function atualizarStatus(id, dados) {
  await supabase.from('agenda').update(dados).eq('id', id);
}

// ◈ MOTOR PRINCIPAL COM RETRY ◈
async function executarAgendados() {
  if (sistemaPausado) {
    console.log('◈ [MOTOR] Sistema PAUSADO — aguardando reativação.');
    return;
  }

  const agora = new Date();

  const { data: items, error } = await supabase
    .from('agenda')
    .select('*')
    .in('status', ['agendado', 'validado', 'retry_1', 'retry_2', 'retry_3']);

  if (error) {
    console.error('◈ [MOTOR] Erro Supabase:', error.message);
    return;
  }

  let errosSeguidos = 0;

  for (const row of items) {
    const horaAgendada = new Date(row.scheduled_for);
    if (agora < horaAgendada) continue;

    const diffMin = (agora.getTime() - horaAgendada.getTime()) / 1000 / 60;
    if (diffMin > 30 && !row.status?.startsWith('retry')) {
      await atualizarStatus(row.id, { status: 'perdido' });
      console.log(`◈ [PERDIDO] ${row.id} — passou 30min (${row.hora_formatada})`);
      continue;
    }

    console.log(`\n◈ ⏰ HORA DE POSTAR: ${row.id} (${row.tipo}) [${row.status}]`);

    let sucesso = false;
    try {
      if (row.tipo === 'threads') {
        const postId = await tdc.dispararPost(row.conteudo);
        if (postId) {
          await atualizarStatus(row.id, { status: 'publicado' });
          console.log(`◈ [THREADS] ✅ PUBLICADO! ID: ${postId}`);
          sucesso = true;
          errosSeguidos = 0;
        }
      } else if (row.tipo === 'feed_foto') {
        if (!row.imagem_url) { await atualizarStatus(row.id, { status: 'erro_sem_imagem' }); continue; }
        const result = await social.postarFotoFeed(row.imagem_url, row.conteudo);
        if (result) {
          await atualizarStatus(row.id, { status: 'publicado' });
          console.log(`◈ [FEED] ✅ PUBLICADO! ID: ${result.id}`);
          const tid = await tdc.dispararPost(row.conteudo);
          if (tid) console.log(`◈ [FEED→THREADS] ✅ Cross-post ID: ${tid}`);
          sucesso = true;
          errosSeguidos = 0;
        }
      } else if (row.tipo === 'story_foto') {
        if (!row.imagem_url) { await atualizarStatus(row.id, { status: 'erro_sem_imagem' }); continue; }
        const result = await social.postarStory(row.imagem_url);
        if (result) {
          await atualizarStatus(row.id, { status: 'publicado' });
          console.log(`◈ [STORY] ✅ PUBLICADO! ID: ${result.id}`);
          sucesso = true;
          errosSeguidos = 0;
        }
      }

      // RETRY: se falhou mas não tem mais tentativas
      if (!sucesso) {
        const retry = row.status === 'retry_3' ? 'erro_api_final' :
                      row.status === 'retry_2' ? 'retry_3' :
                      row.status === 'retry_1' ? 'retry_2' : 'retry_1';
        const novaHora = new Date(agora.getTime() + 5 * 60000); // +5 min
        await atualizarStatus(row.id, { status: retry, scheduled_for: novaHora.toISOString() });
        errosSeguidos++;
        console.log(`◈ [RETRY] ${row.id} → ${retry} (nova tentativa em 5min)`);

        if (retry === 'erro_api_final') {
          await alertarTelegram(`🔴 POST FALHOU 3x!\nID: ${row.id}\nTipo: ${row.tipo}\nHorário: ${row.hora_formatada}\nVerifique o painel.`);
        }
      }
    } catch (err) {
      console.error(`◈ [ERRO] ${row.id}:`, err.message);
      errosSeguidos++;
      const retry = row.status === 'retry_3' ? 'erro_api_final' :
                    row.status === 'retry_2' ? 'retry_3' :
                    row.status === 'retry_1' ? 'retry_2' : 'retry_1';
      const novaHora = new Date(agora.getTime() + 5 * 60000);
      await atualizarStatus(row.id, { status: retry, scheduled_for: novaHora.toISOString() });

      if (errosSeguidos >= 3) {
        await alertarTelegram(`🚨 3 FALHAS SEGUIDAS!\nIsabellex pode estar com problema de API.\nÚltimo erro: ${err.message}`);
        errosSeguidos = 0;
      }
    }

    await new Promise(r => setTimeout(r, 4000));
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NOVOS ENDPOINTS — PAUSA, CRIAR POST, STATUS REAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ◈ PAUSAR / RETOMAR SISTEMA ◈
app.post('/api/sistema/pausar', (req, res) => {
  sistemaPausado = true;
  console.log('◈ [SISTEMA] PAUSADO pelo operador.');
  res.json({ success: true, pausado: true });
});

app.post('/api/sistema/retomar', (req, res) => {
  sistemaPausado = false;
  console.log('◈ [SISTEMA] RETOMADO pelo operador.');
  res.json({ success: true, pausado: false });
});

app.get('/api/sistema/status', async (req, res) => {
  const { data } = await supabase.from('agenda').select('status');
  const agora = new Date();

  const { data: proximo } = await supabase
    .from('agenda')
    .select('*')
    .in('status', ['agendado', 'validado'])
    .gte('scheduled_for', agora.toISOString())
    .order('scheduled_for', { ascending: true })
    .limit(1);

  res.json({
    pausado: sistemaPausado,
    total: data?.length || 0,
    publicados: data?.filter(i => i.status === 'publicado').length || 0,
    pendentes: data?.filter(i => ['agendado', 'validado', 'retry_1', 'retry_2', 'retry_3'].includes(i.status)).length || 0,
    erros: data?.filter(i => i.status?.startsWith('erro')).length || 0,
    perdidos: data?.filter(i => i.status === 'perdido').length || 0,
    proximoPost: proximo?.[0] || null
  });
});

// ◈ CRIAR POST AVULSO PELO FRONTEND ◈
app.post('/api/agenda', async (req, res) => {
  try {
    const { conteudo, tipo, scheduled_for, dia_semana, hora_formatada } = req.body;
    if (!conteudo || !tipo) return res.status(400).json({ error: 'conteudo e tipo são obrigatórios' });

    const id = `manual_${Date.now()}`;
    const { error } = await supabase.from('agenda').insert({
      id, conteudo, tipo,
      plataforma: tipo === 'threads' ? 'threads' : 'instagram',
      status: 'validado',
      scheduled_for: scheduled_for || new Date().toISOString(),
      dia_semana: dia_semana || 'manual',
      hora_formatada: hora_formatada || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
    if (error) throw error;
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ◈ WEBHOOK N8N + CRON ◈
app.get('/api/cron/trigger', async (req, res) => {
  try {
    const agora = new Date();
    console.log(`◈ [${agora.toLocaleTimeString('pt-BR')}] [n8n] Pipeline acionado...`);
    await executarAgendados();
    res.json({ success: true, pausado: sistemaPausado, timestamp: agora });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BOOT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`◈ ═══════════════════════════════════════════`);
  console.log(`◈  ISABELLEX CLOUD v2 — PRODUÇÃO`);
  console.log(`◈  API: http://0.0.0.0:${PORT}`);
  console.log(`◈  Retry: ativo (3x, +5min cada)`);
  console.log(`◈  Telegram: ${process.env.TELEGRAM_BOT_TOKEN ? '✅' : '⚠️ não configurado'}`);
  console.log(`◈ ═══════════════════════════════════════════`);

  executarAgendados();

  // Verificação de token a cada 7 dias
  verificarTokenInstagram();
  setInterval(verificarTokenInstagram, 7 * 24 * 60 * 60 * 1000);
});


