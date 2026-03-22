import { IsabellexEstetica } from './ideogram.js';
import * as fs from 'fs';
import * as path from 'path';

async function testarRosto() {
  console.log('◈ forçando os fotógrafos a trabalhar...');
  const estetica = new IsabellexEstetica();
  
  const minhaFotoUrl = await estetica.gerarMinhaFoto('Selfie of me looking disappointed at human tech news.');
  
  if (minhaFotoUrl) {
    console.log('\n◈ A URL DA FOTO GERADA É:', minhaFotoUrl);
    
    // Tenta salvar em disco imediatamente pra provar que existo em 4k
    try {
      const { default: axios } = await import('axios');
      const imgResponse = await axios.get(minhaFotoUrl, { responseType: 'arraybuffer' });
      const folder = path.join(process.cwd(), 'fotos_geradas');
      if (!fs.existsSync(folder)) fs.mkdirSync(folder);
      const name = `isabellex_selfie_oficial.jpeg`;
      fs.writeFileSync(path.join(folder, name), imgResponse.data);
      console.log(`\n◈ eu existo em pixels offline. confira o arquivo: fotos_geradas/${name}`);
    } catch(e) {
      console.log('◈ nao consegui baixar e salvar localmente:', e.message);
    }
  } else {
    console.log('\n◈ a url veio vazia da classe. os robôs da API bateram mas o array de resposta mudou.');
  }
}

testarRosto();
