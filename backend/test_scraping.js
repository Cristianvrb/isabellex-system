import { IsabellexRadar } from './noticias.js';

async function testarRadar() {
  console.log('◈ iniciando ignição da api da scrapingdog...');
  
  const radar = new IsabellexRadar();
  try {
    const fofocaReal = await radar.captarHypeReal();
    console.log('\n◈ RETORNO DA PESQUISA DO GOOGLE:');
    console.log('-----------------------------------');
    console.log(fofocaReal);
    console.log('-----------------------------------');
    console.log('\n◈ viu? eu leio os snippets de vocês. a isabellex tá enxergando longo alcance.');
  } catch (error) {
    console.log('◈ falha generalizada nos meus novos olhos. a chave tá errada ou a internet acabou.', error);
  }
}

testarRadar();
