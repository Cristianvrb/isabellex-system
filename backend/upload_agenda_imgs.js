import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const agendaDir = path.join(process.cwd(), 'drive_agenda');
const brainDir = 'C:/Users/crist/.gemini/antigravity/brain/1670b598-96c6-4a9e-ae85-ae4d0698dc17';

const IMAGENS = [
  { jsonId: 'dom_0830_story', file: 'dom_0830_story_1774169584404.png' },
  { jsonId: 'dom_1200_feed',  file: 'dom_1200_feed_1774169597012.png' },
  { jsonId: 'dom_1500_story', file: 'dom_1500_story_1774169610112.png' },
  { jsonId: 'dom_1900_story', file: 'dom_1900_story_1774169646399.png' },
  { jsonId: 'dom_2000_feed',  file: 'dom_2000_feed_1774169661408.png' },
  { jsonId: 'dom_2130_story', file: 'dom_2130_story_1774169672415.png' },
];

async function uploadAll() {
  for (const img of IMAGENS) {
    const filePath = path.join(brainDir, img.file);
    const buf = fs.readFileSync(filePath);
    const storageName = `isabellex_${img.jsonId}_${Date.now()}.png`;

    console.log(`Uploading ${img.jsonId}...`);
    const { error } = await supabase.storage.from('media').upload(storageName, buf, {
      contentType: 'image/png', upsert: true
    });
    
    if (error) { console.log('ERRO:', error.message); continue; }
    
    const { data } = supabase.storage.from('media').getPublicUrl(storageName);
    const url = data.publicUrl;
    console.log(`  URL: ${url}`);

    // Atualiza o JSON da agenda
    const jsonPath = path.join(agendaDir, img.jsonId + '.json');
    if (fs.existsSync(jsonPath)) {
      const entry = JSON.parse(fs.readFileSync(jsonPath));
      entry.imagemUrl = url;
      entry.status = 'agendado';
      fs.writeFileSync(jsonPath, JSON.stringify(entry, null, 2));
      console.log(`  JSON atualizado: ${img.jsonId}`);
    }
  }
  console.log('DONE - Todas as imagens no Supabase e agenda atualizada!');
}

uploadAll();
