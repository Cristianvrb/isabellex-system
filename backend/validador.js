import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class IsabellexValidador {
  
  async inspecionarImagem(imagemUrl) {
    console.log('◈ acionando meus nervos ópticos (gpt-4o vision) pra avaliar o trabalho porco do ideogram.');

    const VISION_PROMPT = `
Você é o Agente de Qualidade de uma Influenciadora Virtual (isabellex).
Sua função é olhar a foto gerada listada abaixo e procurar por ABERRAÇÕES ANATÔMICAS ou "AI Slop" gritantes.
Foque estritamente em:
1. Mãos e dedos derretidos, fundidos com o celular, ou com mais de 5 dedos.
2. Braços distorcidos, com hipertrofia bizarra ou perspectiva anatômica impossível.
3. Elementos do fundo se fundindo com o corpo dela de forma não natural.

Seja extremamente rígido. Se a foto parecer tosca ou tiver erros estruturais de IA óbvios (fused fingers no celular é o pior), REJEITE.

Sua resposta DEVE ser estritamente em JSON com esta estrutura:
{
  "aprovado": boolean,
  "motivo": "uma frase curta explicando de forma seca o que você viu de errado ou certo."
}
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // O GPT-4o tem visão embutida e processa a URL da imagem.
        messages: [
          { 
            role: "user", 
            content: [
              { type: "text", text: VISION_PROMPT },
              { type: "image_url", image_url: { url: imagemUrl } }
            ] 
          }
        ],
        max_tokens: 300,
        response_format: { type: "json_object" },
        temperature: 0.2
      });

      const responseText = response.choices[0].message.content;
      const avaliacao = JSON.parse(responseText.trim());
      
      console.log(`◈ veredito do meu olho: ${avaliacao.aprovado ? 'APROVADA' : 'REJEITADA'} - ${avaliacao.motivo}`);
      
      return avaliacao.aprovado;
      
    } catch (err) {
      console.error('◈ o meu nervo óptico principal pifou e eu não consegui julgar a foto.', err.message);
      // Em caso de falha de API, por segurança a gente barra, não posta lixo no escuro.
      return false;
    }
  }
}
