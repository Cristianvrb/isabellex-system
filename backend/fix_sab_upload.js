import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const brain = 'C:/Users/crist/.gemini/antigravity/brain/1670b598-96c6-4a9e-ae85-ae4d0698dc17';
const dir = './drive_agenda';

const uploads = [
  { id: 'sáb_1100_story', file: 'sab1100_selfie_1774176389091.png' },
  { id: 'sáb_1300_feed', file: 'sab1300_selfie_1774176404420.png' },
  { id: 'sáb_2100_story', file: 'sab2100_selfie_1774176448897.png' }
];

async function start() {
  for (const img of uploads) {
    const p = path.join(dir, img.id + '.json');
    const b = fs.readFileSync(path.join(brain, img.file));
    const safeId = img.id.replace('á', 'a'); // sem acento pro Supabase
    const n = 'ix_' + safeId + '_' + Date.now() + '.png';
    
    const { error } = await supabase.storage.from('media').upload(n, b, { contentType: 'image/png', upsert: true });
    if (error) {
       console.log('❌ Erro upload:', img.id, error.message);
       continue;
    }

    const { data } = supabase.storage.from('media').getPublicUrl(n);
    const e = JSON.parse(fs.readFileSync(p));
    e.imagemUrl = data.publicUrl;
    e.status = 'validado'; 
    fs.writeFileSync(p, JSON.stringify(e, null, 2));
    console.log('✅ [' + img.id + '] ' + data.publicUrl.slice(0, 70));
  }
}

start();
