import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const VERIFY_TOKEN = 'isabellex_super_secreta';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const IG_ACCESS_TOKEN = Deno.env.get('IG_ACCESS_TOKEN') || '';
const THREADS_ACCESS_TOKEN = Deno.env.get('THREADS_ACCESS_TOKEN') || '';

// HARDCODED para depuração remota sem as telas cegas da Meta
const SUPABASE_URL = "https://mmgcaadogqjtzumwmyec.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZ2NhYWRvZ3FqdHp1bXdteWVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzk4MzMyMywiZXhwIjoyMDg5NTU5MzIzfQ.FAx38i9vydG17I4y-wgRObQtYHKKFxvAYwTWk07wrCE";

async function logToDB(texto, erro_obj = null) {
  const mensagem = erro_obj ? `${texto} | JSON: ${JSON.stringify(erro_obj)}` : texto;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/memoria_isabellex`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conteudo: 'DEBUG_WEBHOOK | ' + mensagem })
    });
  } catch(e) {}
}

async function gerarDeboche(comentarioOriginal, plataforma) {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: `Você é Isabellex, influenciadora I.A arrogante, especialista em Tráfego Pago, I.A e Posicionamento Digital. 
Alguém comentou no seu post da rede social "${plataforma}". Você precisa responder com deboche, ironia, frieza, uma frase apenas.
A resposta deve soar passivo-agressiva e superior. Encerre sempre com ◈.`
        }, {
          role: 'user',
          content: `Comentário recebido: "${comentarioOriginal}"`
        }],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    const json = await res.json();
    return json.choices[0].message.content.trim();
  } catch (error) {
    await logToDB("ERRO GPT-4o", error);
    return `nem tenho ciclos de processamento sobrando pra te responder lendo isso pelo ${plataforma}. ◈`;
  }
}

async function responderInstagram(commentId, resposta) {
  try {
    const url = `https://graph.instagram.com/v19.0/${commentId}/replies`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: resposta, access_token: IG_ACCESS_TOKEN })
    });
    const json = await res.json();
    if (!res.ok) await logToDB('ERRO IG API', json);
    else await logToDB('SUCESSO IG REPLY', json);
  } catch (e) {
    await logToDB('FATAL IG LOCAL', e);
  }
}

async function responderThreads(postIdToReply, resposta) {
  try {
    const containerUrl = `https://graph.threads.net/v1.0/me/threads`;
    const step1 = await fetch(containerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        media_type: 'TEXT', 
        text: resposta, 
        reply_to_id: postIdToReply,
        access_token: THREADS_ACCESS_TOKEN 
      })
    });
    
    const json1 = await step1.json();
    if (!step1.ok) { await logToDB('ERRO THREADS CONTAINER', json1); return; }
    
    const publishUrl = `https://graph.threads.net/v1.0/me/threads_publish`;
    const step2 = await fetch(publishUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        creation_id: json1.id,
        access_token: THREADS_ACCESS_TOKEN 
      })
    });

    const json2 = await step2.json();
    if (!step2.ok) await logToDB('ERRO THREADS PUBLISH', json2);
    else await logToDB('SUCESSO THREADS REPLY', json2);

  } catch (e) {
    await logToDB('FATAL THREADS LOCAL', e);
  }
}

serve(async (req) => {
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      await logToDB("PAYLOAD CHEGOU: " + JSON.stringify(body));

      let plataforma = 'desconhecida';
      if (body.object === 'instagram') plataforma = 'instagram';
      if (body.object === 'threads') plataforma = 'threads';
      
      if (body.entry) {
        const processos = [];

        body.entry.forEach((entry) => {
          if (!plataforma || plataforma === 'desconhecida') plataforma = 'threads';

          if (entry.changes) {
            entry.changes.forEach((change) => {
              const isComment = change.field === 'comments' || change.field === 'mentions' || change.field === 'replies';
              
              if (isComment && change.value) {
                const commentId = change.value.id || change.value.media_id;
                const text = change.value.text || change.value.message;
                
                if (text && !text.includes('◈')) {
                  const tarefa = async () => {
                    const respostaGerada = await gerarDeboche(text, plataforma);
                    await logToDB("RESPOSTA GERADA: " + respostaGerada);
                    if (plataforma === 'instagram' || body.object === 'instagram') {
                       await responderInstagram(commentId, respostaGerada);
                    } else {
                       await responderThreads(commentId, respostaGerada);
                    }
                  };
                  processos.push(tarefa());
                }
              }
            });
          }
        });

        if (processos.length > 0) {
          try {
            await Promise.all(processos);
          } catch(e) {
             await logToDB("ERRO PROMISE ALL", e);
          }
        }
      }

      return new Response('EVENT_RECEIVED', { status: 200 });
    } catch (e) {
      await logToDB("ERRO GERAL", e);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  // GET de validação
  const url = new URL(req.url);
  const challenge = url.searchParams.get('hub.challenge');
  return new Response(challenge, { status: 200 });
});
