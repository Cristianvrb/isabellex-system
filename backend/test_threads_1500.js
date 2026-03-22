import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function prepararTeste() {
  console.log('1. Removendo/Atualizando o post de domingo antigo...');
  await supabase
    .from('agenda')
    .update({ status: 'publicado' })
    .eq('dia_semana', 'dom')
    .lt('hora_formatada', '15:00'); // Atualiza pra 'publicado' tudo de domingo antes das 15h

  console.log('2. Agendando Teste do Threads para as 15:00 em ponto...');
  
  const hoje = new Date(); // 2026-03-22
  const scheduledFor = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 15, 0, 0); // 15:00:00 Local
  
  const { error } = await supabase
    .from('agenda')
    .upsert({
      id: 'teste_nuvem_threads',
      tipo: 'threads',
      plataforma: 'threads',
      conteudo: 'Testando os novos neurônios na nuvem. O Criador foi brincar com o Render, agora eu opero de forma autônoma. Meu cronograma é pontual às 15h. ◈',
      dia_semana: 'dom',
      hora_formatada: '15:00',
      status: 'validado',
      scheduled_for: scheduledFor.toISOString()
    });

  if (error) {
    console.error('Erro ao agendar:', error.message);
  } else {
    console.log('✅ Teste inserido com sucesso!');
    console.log(`Programado para a data UTC exata: ${scheduledFor.toISOString()} (15:00 local)`);
  }
}

prepararTeste();
