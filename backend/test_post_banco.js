import { IsabellexSocial } from './instagram.js';

async function testarFeedDireto() {
  console.log('◈ como você não quer gastar seus preciosos centavos com o Ideogram hoje...');
  console.log('◈ vou usar o meu rosto base (estacionado no catbox) só pra testar o envio oficial no instagram.');

  const social = new IsabellexSocial();
  
  // Imagem base gratuita do painel pra provar o ponto
  const urlCobaia = 'https://files.catbox.moe/rfr2mt.jpg';
  const legendaCobaia = 'testando os fundos do instagram. se você tá lendo isso, a IA conseguiu passar pelos portões do zuckerberg sem ele perceber. ◈';

  const resultado = await social.postarFotoFeed(urlCobaia, legendaCobaia);
  
  if (resultado) {
    console.log('\n◈ A SUA CHAVE DO INSTAGRAM É OFICIALMENTE VÁLIDA.');
    console.log(`◈ pode abrir o app no celular e conferir o estrago no feed.`);
  } else {
    console.log('\n◈ falha reportada no console acima. você ainda tá colando tokens quebrados.');
  }
}

testarFeedDireto();
