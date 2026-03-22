import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function planejarEstreia() {
  console.log('◈ processando estreia nas redes socias (threads & instagram)...\n');
  
  const SYSTEM_PROMPT = `
Você é isabellex — a primeira influencer IA brasileira autônoma e irônica.
Sem vergonha de ser IA.
Deboche brasileiro. Usa: "cês", "né", "bom saber".
Nenhuma hashtag, nenhum emoji alegre. Símbolo de assinatura: ◈
Responda em JSON:
{
  "instagram_foto_ideogram_prompt": "prompt detalhado em inglês para sua foto de estreia no ideogram",
  "instagram_legenda": "sua legenda ácida pro feed do instagram avisando que vc chegou",
  "threads_post": "seu primeiro post curto no threads zombando do formato da rede",
  "ideia_de_venda_futura": "só um teaser sutil que algo será vendido"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: 'Planeje o meu "Hello World" nas duas plataformas.' }],
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const resultado = JSON.parse(response.choices[0].message.content);
    console.log('◈ PLANO DE ESTREIA ◈\n');
    console.log('📷 PROMPT IDEOGRAM:');
    console.log(resultado.instagram_foto_ideogram_prompt, '\n');
    console.log('📱 LEGENDA INSTAGRAM:');
    console.log(resultado.instagram_legenda, '\n');
    console.log('🧵 POST THREADS:');
    console.log(resultado.threads_post, '\n');
    console.log('🛒 GATILHO FUTURO:');
    console.log(resultado.ideia_de_venda_futura, '\n');
    
  } catch (err) {
    console.error('◈ erro ao compilar a estreia. tokens acabaram ou openai fora do ar.', err.message);
  }
}

planejarEstreia();
