import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const agora = new Date();
console.log(`\n◈ DIAGNÓSTICO — ${agora.toLocaleString('pt-BR')}`);
console.log('─'.repeat(60));

// 1. Tudo que está ativo
const { data: ativos } = await supabase
  .from('agenda')
  .select('id, tipo, status, scheduled_for, hora_formatada, dia_semana')
  .in('status', ['agendado', 'validado', 'retry_1', 'retry_2', 'retry_3'])
  .order('scheduled_for', { ascending: true });

console.log(`\n✅ ATIVOS (pendentes de postar): ${ativos?.length || 0}`);
ativos?.forEach(i => {
  const hora = new Date(i.scheduled_for);
  const passou = hora < agora;
  console.log(`  ${passou ? '⚠️  JÁ PASSOU' : '⏰ FUTURO  '} | ${i.dia_semana} ${i.hora_formatada} | ${i.tipo} | ${i.status} | ID: ${i.id}`);
});

// 2. Posts de hoje com qualquer status
const hoje = agora.toISOString().split('T')[0];
const { data: hoje_posts } = await supabase
  .from('agenda')
  .select('id, tipo, status, scheduled_for, hora_formatada')
  .gte('scheduled_for', `${hoje}T00:00:00Z`)
  .lte('scheduled_for', `${hoje}T23:59:59Z`)
  .order('scheduled_for');

console.log(`\n📅 TODOS OS POSTS DE HOJE (${hoje}): ${hoje_posts?.length || 0}`);
hoje_posts?.forEach(i => {
  const emoji = i.status === 'publicado' ? '✅' : i.status?.startsWith('erro') ? '❌' : i.status === 'perdido' ? '💀' : '⏳';
  console.log(`  ${emoji} ${i.hora_formatada} | ${i.tipo} | ${i.status}`);
});

// 3. Últimos publicados
const { data: ultimos } = await supabase
  .from('agenda')
  .select('id, tipo, status, scheduled_for, hora_formatada')
  .eq('status', 'publicado')
  .order('scheduled_for', { ascending: false })
  .limit(5);

console.log(`\n🚀 ÚLTIMOS 5 PUBLICADOS:`);
ultimos?.forEach(i => {
  console.log(`  ✅ ${new Date(i.scheduled_for).toLocaleString('pt-BR')} | ${i.tipo} | ${i.id}`);
});

// 4. Erros recentes
const { data: erros } = await supabase
  .from('agenda')
  .select('id, tipo, status, scheduled_for, hora_formatada')
  .or('status.like.erro%,status.eq.perdido')
  .order('scheduled_for', { ascending: false })
  .limit(10);

console.log(`\n❌ ERROS RECENTES: ${erros?.length || 0}`);
erros?.forEach(i => {
  console.log(`  ${i.status} | ${new Date(i.scheduled_for).toLocaleString('pt-BR')} | ${i.tipo} | ${i.id}`);
});
