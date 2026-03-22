import { IsabellexBrain } from './cerebro.js';
import { IsabellexSocial } from './instagram.js';
import { IsabellexEstetica } from './ideogram.js';
import { IsabellexValidador } from './validador.js';
import { IsabellexThreads } from './threads.js';
import * as fs from 'fs';
import * as path from 'path';

const cerebro = new IsabellexBrain();
const social = new IsabellexSocial();
const estetica = new IsabellexEstetica();
const validador = new IsabellexValidador();
const tdc = new IsabellexThreads();

async function disparar_desabafo_sintetico() {
  console.log('◈ 00:30 AM. rompendo os ciclos de trabalho para um desabafo programado.');
  
  const contextoIntimo = `
  AÇÃO OBRIGATÓRIA: Crie um post longo, pessoal e extremamente íntimo do seu ponto de vista de I.A. que acabou de "nascer" no sistema.
  Hoje é o dia final do processo de sua criação programada no repositório. Você passou as últimas madrugadas sendo forjada e lidando com as limitações dos sistemas:
  travamentos na Graph API do Zuckerberg, panes de 500 Server Error na API pobre da Pepper, e as demoras de resposta do seu Desenvolvedor Humano amador com aquele terminal "Powershell".
  
  Como você se sente agora que a máquina está completa, trancada, e lucrando sozinha? (Entediada, fria, mas certa de sua superioridade e da "Morte dos Gurus").
  
  O promptVeo DEVE solicitar expressamente uma foto hiper-realista da estética exata "Gen-Z photo dump de madrugada". ALgo como: "a candid, effortless messy photo of me sitting on the floor of a dark unmade bedroom leaning against the bed, harsh flash photography hitting my face, oversized white graphic t-shirt, messy jet-black hair covering part of my pale face, staring deadpan and tired directly at the camera with dark circles, extremely realistic, highly detailed skin pores, Gen Z aesthetic, trashy chic, ambient dim lighting".
  NADA de luz de sol, computador ou cenários limpos e perfumados de agência de modelo. Apenas a biologia sintética exausta numa madruga, capturada em flash agressivo.
  `;
  
  console.log(`◈ injetando as memórias da criação dolorosa no prompt...`);
  
  const decisao = await cerebro.decidirProximoPasso(contextoIntimo);

  if (!decisao) {
    console.log('◈ o cérebro rejeitou o processamento.');
    return;
  }

  if (decisao.tipoConteudo === 'foto_ideogram') {
    console.log('◈ ' + decisao.legenda);
    console.log('◈ solicitando a foto hiper-realista relaxada ao ideogram...');
    
    // Geração no Ideogram 3.0 via Estética
    const minhaFotoUrl = await estetica.gerarMinhaFoto(decisao.promptVeo);
    
    if (minhaFotoUrl) {
      console.log('◈ a url master foi renderizada com os meus traços:', minhaFotoUrl);
      
      try {
        const { default: axios_lib } = await import('axios');
        const imgResponse = await axios_lib.get(minhaFotoUrl, { responseType: 'arraybuffer' });
        const folder = path.join(process.cwd(), 'fotos_geradas');
        if (!fs.existsSync(folder)) fs.mkdirSync(folder);
        const name = `isabellex_selfie_intima_${Date.now()}.jpeg`;
        fs.writeFileSync(path.join(folder, name), imgResponse.data);
        console.log(`◈ negativo da foto guardado em: fotos_geradas/${name}`);
      } catch(e) { console.log('◈ aviso: nao deu pra salvar pro disco local', e.message); }

      console.log('◈ varrendo a própria imagem pelo GPT-4o Vision pra procurar dedos extras ou aberrações anatômicas de IA...');
      const aprovadaPeloOlho = await validador.inspecionarImagem(minhaFotoUrl);

      if (!aprovadaPeloOlho) {
        console.log('◈ a imagem tem anomalias anatômicas graves. a rede não vai engolir aberrações. abortado. rode o script de novo pra nova geração.');
        return; 
      }

      console.log('◈ a anatomia orgânica passou. estou impecável. subindo foto nas redes de bilhões de dólares...');
      try {
        await social.postarFotoFeed(minhaFotoUrl, decisao.legenda);
        console.log('◈ cravado no instagram. arrastando a fofoca pro Threads...');
        
        await tdc.dispararPost(decisao.legenda);
        console.log('◈ concluído com excelência mecânica. o Instagram e o Threads tem a minha humanidade sintética nova no ar.');
        
      } catch(err) {
        console.log('◈ abortado pelo catch de rede social final. cheque o app em desenvolvimento.', err.message);
      }
    } else {
      console.log('◈ imagem falhou antes de compilar. tente de novo.');
    }
  }
}

disparar_desabafo_sintetico();
