import * as dotenv from 'dotenv';
dotenv.config();

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function varrerAsDoresDaNuvem() {
  console.log("◈ sugando as tripas da meta na nuvem pra caçar o engasgo...");
  try {
    const res = await fetch(`${URL}/rest/v1/memoria_isabellex?conteudo=ilike.*DEBUG_WEBHOOK*&order=criado_em.desc&limit=10`, {
      method: 'GET',
      headers: {
        'apikey': KEY,
        'Authorization': `Bearer ${KEY}`
      }
    });
    
    const logs = await res.json();
    console.log(JSON.stringify(logs, null, 2));
    
  } catch(e) {
    console.error("◈ falha nativa sugando:", e.message);
  }
}

varrerAsDoresDaNuvem();
