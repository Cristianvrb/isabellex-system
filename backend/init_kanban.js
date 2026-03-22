import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Cria a tabela de tarefas Kanban se não existir
const { error } = await supabase.rpc('exec_sql', {
  sql: `
    CREATE TABLE IF NOT EXISTS kanban_reels (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      roteiro TEXT NOT NULL,
      gancho TEXT,
      duracao_seg INTEGER DEFAULT 30,
      status TEXT DEFAULT 'ideia',
      criado_em TIMESTAMPTZ DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ DEFAULT NOW()
    );
  `
});

if (error) {
  console.log('Tabela já existe ou erro:', error.message);
  console.log('Se der erro de permissão, crie a tabela manualmente no Supabase SQL Editor:');
  console.log(`
CREATE TABLE IF NOT EXISTS kanban_reels (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  roteiro TEXT NOT NULL,
  gancho TEXT,
  duracao_seg INTEGER DEFAULT 30,
  status TEXT DEFAULT 'ideia',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
  `);
} else {
  console.log('✅ Tabela kanban_reels criada com sucesso!');
}
