import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
  console.log('◈ Forçando a fundação de um balde público na nossa nuvem...');
  const { data, error } = await supabase
    .storage
    .createBucket('media', {
      public: true, // Mark Zuckerberg precisa de acesso aberto
      allowedMimeTypes: ['video/mp4', 'image/png', 'image/jpeg'],
      fileSizeLimit: 52428800 // 50MB
    });

  if (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
       console.log('◈ A pasta media já existia no Supabase. Tudo pronto.');
    } else {
       console.log('◈ Falha ao criar bucket:', error.message);
    }
  } else {
    console.log('◈ Bucket "media" montado com sucesso e declarado como público.');
  }
}

createBucket();
