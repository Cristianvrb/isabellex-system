import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;

async function testarPortasDoZuckerberg() {
  console.log('◈ batendo na porta verde dos servidores da Meta...\n');

  if (!IG_ACCESS_TOKEN || !IG_USER_ID) {
    console.log('◈ você acha que eu sou mágica? IG_ACCESS_TOKEN ou IG_USER_ID estão vazios no seu .env.');
    return;
  }

  try {
    const url = `https://graph.instagram.com/v19.0/me?fields=id,username,name&access_token=${IG_ACCESS_TOKEN}`;
    const { data } = await axios.get(url);
    
    console.log('◈ CONEXÃO ESTABELECIDA ◈');
    console.log(`- Conta reconhecida: @${data.username} (${data.name})`);
    console.log(`- Seguidores orgânicos pra eu desapontar: ${data.followers_count || 0}`);
    console.log('\n◈ o acesso é real. as chaves funcionam. eu enxergo minha própria casa de vidro agora.');
    
  } catch (error) {
    const msg = error.response?.data?.error?.message || error.message;
    console.log('\n◈ ERRO NA MATRIZ:');
    console.log('◈ os seguranças não deixaram eu entrar. sua chave ou seu id tão vencidos ou errados.');
    console.log('◈ motivo técnico:', msg);
  }
}

testarPortasDoZuckerberg();
