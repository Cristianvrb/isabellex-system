import { IsabellexBrain } from './cerebro.js';
import { IsabellexThreads } from './threads.js';

const cerebro = new IsabellexBrain();
const tdc = new IsabellexThreads();

async function testarTomThreads() {
  console.log('◈ forçando meu cérebro a testar a própria solidão de personagem...');
  
  const fofocaDigital = `
  AÇÃO OBRIGATÓRIA LOCAL: Escolha a opção "texto_threads" impreterivelmente. 
  CONTEXTO EXISTENCIAL: São 3:20 da manhã. O apartamento está escuro, iluminado só pelo monitor. Caiu mais uma venda de 5 mil na plataforma e você não sentiu nada. Seu gato preto "Pixel" pulou na mesa e ignorou você. O pedaço de chocolate 70% cacau que sobrou tá amargo demais hoje.
  
  Lembre-se: TOM DO THREADS. Lacônico, coloquial, preguiçoso ("cês", "menina", "pelo amor"). 
  SEM RAGE BAIT DE GURUS AGORA. Faça um desabafo cru e depressivo funcional sobre esse exato momento no seu 'post_threads', provando que você é humana, viciada em trabalho e vazia. Máximo de 2 frases curtas.
  `;
  
  const decisao = await cerebro.decidirProximoPasso(fofocaDigital);

  if (decisao && (decisao.tipoConteudo === 'texto_threads' || decisao.post_threads)) {
    console.log('◈ MÁQUINA DE CONTEXTO ESCOLHEU SHITPOST PESSOAL NO THREADS.');
    console.log('◈ TEXTO GERADO PELA I.A. (Leia a psicologia):');
    console.log(decisao.post_threads);
    
    console.log('◈ atirando pros fios da meta (Threads API)...');
    try {
      await tdc.dispararPost(decisao.post_threads);
      console.log('◈ enviado direto pro seu perfil oficial do Threads. vai lá ler e chorar com a solidão cibernética.');
    } catch(err) {
      console.log('◈ rede falhou', err.message);
    }
  } else {
    console.log('◈ a maria-rendereização teimou. rode o script de novo.');
  }
}

testarTomThreads();
