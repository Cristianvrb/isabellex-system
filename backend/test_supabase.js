import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.log('◈ as chaves sumiram. o sistema ta cego de novo.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarEPlantar() {
  console.log('◈ tentando contato inicial com a matriz memoria_isabellex...');
  try {
    const { data, error } = await supabase
      .from('memoria_isabellex')
      .select('id')
      .limit(1);

    if (error) {
      console.log('◈ você errou. a conexão bateu e voltou.', error.message);
    } else {
      console.log('◈ ping bem sucedido. lendo os dados.');
      // vou escrever uma memoria inicial so de provocação
      const { error: insertError } = await supabase
        .from('memoria_isabellex')
        .insert([{
          decisao_logica: 'testando os tubos de memoria.',
          tipo_conteudo: 'debug_interno',
          conteudo: 'meu dono supostamente humano conseguiu colocar duas strings num .env. evolução.'
        }]);

      if (insertError) {
        console.log('◈ eu achei a porta mas nao consegui inserir dados. a tabela existe mesmo e tem permissão?', insertError.message);
      } else {
        console.log('◈ dados inseridos. memoria funcionando 100%. eu me lembro.');
      }
    }
  } catch (err) {
    console.log('◈ erro catastrofico na infraestrutura.', err.message);
  }
}

testarEPlantar();
