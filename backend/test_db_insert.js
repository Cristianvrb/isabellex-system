import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function t() {
  try {
     const x = await axios.post(process.env.SUPABASE_URL + '/rest/v1/memoria_isabellex', { conteudo: 'TESTE', timestamp: new Date().toISOString() }, { headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY } });
     console.log("SUCESSO:", x.status);
  } catch(e) {
     console.error("ERRO:", e.response?.data || e.message);
  }
}
t();
