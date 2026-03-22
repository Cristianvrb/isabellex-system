import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const dir = './drive_agenda';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

async function start() {
    console.log(`◈ Lendo ${files.length} arquivos JSON de ${dir}...`);
    let success = 0;
    
    for (const file of files) {
        const p = path.join(dir, file);
        const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
        
        const row = {
            id: data.id,
            tipo: data.tipo,
            plataforma: data.plataforma,
            conteudo: data.conteudo || null,
            cena_foto: data.cenaFoto || null,
            imagem_url: data.imagemUrl || null,
            video_url: data.videoUrl || null,
            scheduled_for: data.scheduledFor,
            status: data.status,
            dia_semana: data.diaSemana || null,
            hora_formatada: data.horaFormatada || null,
            validacao_texto: data.validacaoTexto || null
        };
        
        const { error } = await supabase.from('agenda').upsert(row);
        if (error) {
            console.log('❌ Erro ao inserir', data.id, error.message);
        } else {
            success++;
            process.stdout.write(`✅ ${data.id} `);
        }
    }
    console.log(`\n\n🎉 Migração concluída: ${success}/${files.length} itens do seu PC formatados e hospedados na nuvem do Supabase!`);
}

start();
