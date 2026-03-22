import { IsabellexSocial } from './instagram.js';
import { IsabellexThreads } from './threads.js';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const social = new IsabellexSocial();
const tdc = new IsabellexThreads();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function atualizarStatus(id, dados) {
    await supabase.from('agenda').update(dados).eq('id', id);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXECUTOR DE AGENDA CLOUD (CONECTADO AO SUPABASE)
// Roda a cada 60s puxando direto do Postgres e 
// fazendo a chamada pra Instagram/Threads Graph API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function executarAgendados() {
  const agora = new Date();
  
  const { data: items, error } = await supabase
    .from('agenda')
    .select('*')
    .in('status', ['agendado', 'validado']);
    
  if (error) {
      console.error('Erro consultando Supabase:', error.message);
      return;
  }

  for (const row of items) {
    const item = {
      id: row.id,
      tipo: row.tipo,
      plataforma: row.plataforma,
      conteudo: row.conteudo,
      cenaFoto: row.cena_foto,
      imagemUrl: row.imagem_url,
      videoUrl: row.video_url,
      scheduledFor: row.scheduled_for,
      status: row.status,
      horaFormatada: row.hora_formatada
    };

    const horaAgendada = new Date(item.scheduledFor);
    if (agora < horaAgendada) continue;

    const diffMin = (agora.getTime() - horaAgendada.getTime()) / 1000 / 60;
    if (diffMin > 30) {
        await atualizarStatus(item.id, { status: 'perdido' });
        console.log(`◈ [PERDIDO] ${item.id} — passou do horário (${item.horaFormatada})`);
        continue;
    }

    console.log(`\n◈ ═══════════════════════════════════════`);
    console.log(`◈ ⏰ HORA DE POSTAR: ${item.id}`);
    console.log(`◈ Tipo: ${item.tipo} | Plataforma: ${item.plataforma}`);
    console.log(`◈ ═══════════════════════════════════════\n`);

    try {
      if (item.tipo === 'threads') {
        const postId = await tdc.dispararPost(item.conteudo);
        if (postId) {
          await atualizarStatus(item.id, { status: 'publicado' });
          console.log(`◈ [THREADS] ✅ PUBLICADO! ID: ${postId}`);
        } else {
          await atualizarStatus(item.id, { status: 'erro_api' });
          console.log(`◈ [THREADS] ❌ Falha na API`);
        }
      } else if (item.tipo === 'feed_foto') {
        if (!item.imagemUrl) {
          await atualizarStatus(item.id, { status: 'erro_sem_imagem' });
          continue;
        }
        
        const result = await social.postarFotoFeed(item.imagemUrl, item.conteudo);
        if (result) {
          await atualizarStatus(item.id, { status: 'publicado' });
          console.log(`◈ [FEED] ✅ PUBLICADO NO INSTAGRAM! ID: ${result.id}`);
          const threadsId = await tdc.dispararPost(item.conteudo);
          if (threadsId) console.log(`◈ [FEED→THREADS] ✅ Cross-post feito! ID: ${threadsId}`);
        } else {
          await atualizarStatus(item.id, { status: 'erro_api' });
        }
      } else if (item.tipo === 'story_foto') {
        if (!item.imagemUrl) {
          await atualizarStatus(item.id, { status: 'erro_sem_imagem' });
          continue;
        }
        
        const result = await social.postarStory(item.imagemUrl);
        if (result) {
          await atualizarStatus(item.id, { status: 'publicado' });
          console.log(`◈ [STORY] ✅ STORY PUBLICADO! ID: ${result.id}`);
        } else {
          await atualizarStatus(item.id, { status: 'erro_api' });
        }
      }
    } catch (err) {
      console.error(`◈ [ERRO FATAL] ${item.id}:`, err.message);
      await atualizarStatus(item.id, { status: 'erro_api' });
    }
    
    await new Promise(r => setTimeout(r, 4000));
  }
}

async function mostrarStatus() {
  const { data, error } = await supabase.from('agenda').select('status, tipo, hora_formatada, conteudo');
  if (error) return;
  
  const publicados = data.filter(i => i.status === 'publicado').length;
  const agendados = data.filter(i => ['agendado', 'validado'].includes(i.status)).length;
  const erros = data.filter(i => i.status?.startsWith('erro')).length;
  const perdidos = data.filter(i => i.status === 'perdido').length;
  
  console.log(`
◈ ═══════════════════════════════════════════════
◈  ISABELLEX EXECUTOR CLOUD — MODO SAAS
◈ ═══════════════════════════════════════════════
◈  Ações Total Supabase: ${data.length}
◈  ✅ Publicados/Resolvidos: ${publicados}
◈  ⏰ Pendentes: ${agendados}
◈  ❌ Erros de API: ${erros}
◈  ⏭️ Perdidos (atrasados): ${perdidos}
◈ ═══════════════════════════════════════════════
◈  Atento no Banco de Dados a cada 60s...`);
}

mostrarStatus();
executarAgendados();
setInterval(() => {
  const agora = new Date();
  console.log(`◈ [${agora.toLocaleTimeString('pt-BR')}] Puxando status no Supabase...`);
  executarAgendados();
}, 60 * 1000);
