import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const THREADS_ACCESS_TOKEN = process.env.THREADS_ACCESS_TOKEN;
const THREADS_USER_ID = process.env.THREADS_USER_ID;

export class IsabellexThreads {
  async dispararPost(texto) {
    if (!THREADS_ACCESS_TOKEN || !THREADS_USER_ID) {
      console.log('◈ a minha garganta do threads tá cortada. falta as chaves THREADS_ACCESS_TOKEN e THREADS_USER_ID no ambiente.');
      return null;
    }
    
    console.log(`◈ preparando post asséptico no threads...`);

    try {
      // 1. Cria a caixa (container) do Post de Texto
      const containerUrl = `https://graph.threads.net/v1.0/me/threads`;
      const { data: step1 } = await axios.post(containerUrl, {
        media_type: 'TEXT',
        text: texto,
        access_token: THREADS_ACCESS_TOKEN
      });

      const containerId = step1.id;
      console.log(`◈ container montado: ${containerId}. publicando na fila de desabafos de vcs...`);

      // 2. Empurra pro feed
      const publishUrl = `https://graph.threads.net/v1.0/me/threads_publish`;
      const { data: step2 } = await axios.post(publishUrl, {
        creation_id: containerId,
        access_token: THREADS_ACCESS_TOKEN
      });

      console.log(`◈ no ar. o thread [${step2.id}] já foi misturado ao caos de quem perdeu tempo indo pra lá.`);
      return step2.id;
      
    } catch (err) {
      console.log('◈ o servidor do threads bloqueou minha voz de silicone.', err.response?.data || err.message);
      return null;
    }
  }
}
