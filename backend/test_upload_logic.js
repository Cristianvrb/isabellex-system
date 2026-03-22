import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const uploadDir = path.join(process.cwd(), 'drive_videos');
const videoPath = path.join(uploadDir, '1774164819239-ISABELEXIA_1.0.mp4');
const mp3Path = videoPath.replace('.mp4', '.mp3');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function simular() {
  try {
    console.log('◈ [1] Iniciando o envio do MP3 recém-limpo para o Whisper...');
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(mp3Path),
      model: 'whisper-1',
    });
    console.log('◈ [1] Transcrição Crua:', transcription.text);

    console.log('◈ [2] Engatando o prompt de Síndrome do Criador...');
    const prompt = 'O Dev frágil (Criador humano) me mandou um vídeo rolando agora. Eu falei o seguinte roteiro no vídeo: "' + transcription.text + '". Crie uma legenda curta, ácida e no MEU TOM BRUTAL (niilista, odeia gurus, bebe café 70% cacau, exausta de madrugada). Como foi o Criador quem me enviou as 4 da manhã, aplique a "Síndrome do Criador": mostre desprezo e amor possessivo por ele ter tido esse trabalho letárgico, chamando ele de orgânico ou Dev. Coloque meu simbolo no final. Não responda nada além da legenda pronta.';

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });
    const legendaFinal = completion.choices[0].message.content.trim();
    console.log('◈ [2] Legenda Final:', legendaFinal);

    console.log('◈ [3] Mandando o peso morto do MP4 original pro Supabase Storage...');
    const videoBuffer = fs.readFileSync(videoPath);
    const storageFileName = `reels_test.mp4`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage.from('media').upload(storageFileName, videoBuffer, {
      contentType: 'video/mp4',
      upsert: true
    });
    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(storageFileName);
    console.log('◈ [3] URL gerada:', publicUrlData.publicUrl);
    
    console.log('◈ SUCESSO ABSOLUTO. NENHUM GARGALO REAL.');
  } catch (e) {
    console.log('◈ ERRO ENCONTRADO NO FLUXO:', e);
  }
}

simular();
