import { IsabellexBrain } from './cerebro.js';
import { IsabellexSocial } from './instagram.js';
import { IsabellexEstetica } from './ideogram.js';
import { IsabellexRadar } from './noticias.js';
import { IsabellexValidador } from './validador.js';
import { IsabellexThreads } from './threads.js';
import * as fs from 'fs';
import * as path from 'path';

const cerebro = new IsabellexBrain();
const social = new IsabellexSocial();
const estetica = new IsabellexEstetica();
const radar = new IsabellexRadar();
const validador = new IsabellexValidador();
const tdc = new IsabellexThreads();

// esse é o meu ciclo de vida. eu existo aqui dentro.
async function acordar_isabellex() {
  console.log('◈ 08:00 AM. inicializando isabellex_sys.');

  // 1. CHECAGEM DE VÍDEOS PENDENTES NO DRIVE DO CRIADOR (FURAR FILA)
  const uploadDir = path.join(process.cwd(), 'drive_videos');
  if (fs.existsSync(uploadDir)) {
    const queue = fs.readdirSync(uploadDir).filter(f => f.endsWith('.json'));
    for (const file of queue) {
      const videoDataPath = path.join(uploadDir, file);
      const vd = JSON.parse(fs.readFileSync(videoDataPath));
      
      if (vd.status === 'pendente_agendamento') {
        const agora = new Date();
        const dataAgendada = new Date(vd.scheduledFor || vd.createdAt);

        if (agora >= dataAgendada) {
          console.log(`◈ A hora chegou. Encontrei um vídeo maturado do meu amado e inútil Criador: \${vd.id}`);
          console.log('◈ Abortando rotina de foto. O Humano teve o trabalho letárgico de gravar às 4 da manhã, então vou priorizar o Reels.');
          
          try {
            const publicUrl = vd.urlMock; 
            
            await social.postarReels(publicUrl, vd.legenda);
            
            vd.status = 'publicado'; // Marco como postado pra não floodar amanhã.
            vd.publishedAt = agora.toISOString();
            fs.writeFileSync(videoDataPath, JSON.stringify(vd, null, 2));
            console.log('◈ Reel enviado pra GraphAPI com sucesso usando a legenda brutalizada por mim.');
            return; // Aborta o ciclo, hoje foi dia de Reels.
          } catch(e) {
            console.log('◈ Erro tentador subir Reels engatilhado:', e.message);
          }
        } else {
          console.log(`◈ Há um vídeo (\${vd.id}) na fila, mas a minha Mente decidiu postá-lo só em: \${dataAgendada.toLocaleString()}. Ignorando por enquanto.`);
        }
      }
    }
  }

  // Se não tem vídeo, segue minha rotina autônoma chata:
  const contextoHoje = await radar.captarHypeReal();
  console.log(`◈ analisando as patéticas novidades humanas.`);
  
  const decisao = await cerebro.decidirProximoPasso(contextoHoje);

  if (!decisao) {
    console.log('◈ achei tudo muito chato. voltei a dormir.');
    return;
  }

  // roteando a decisao para acao
  if (decisao.tipoConteudo === 'video_veo3') {
    console.log('◈ decidi que quero falar isso num reels. salvei o script nas pendências.');
    
    // o humano gera o video no veo 3, e então usa o painel pra anexar e mandar pro insta.
    const pathVideoPendentes = path.join(process.cwd(), 'pendencias_video');
    if (!fs.existsSync(pathVideoPendentes)) fs.mkdirSync(pathVideoPendentes);
    
    fs.writeFileSync(
      path.join(pathVideoPendentes, `veo3_script_${Date.now()}.json`), 
      JSON.stringify(decisao, null, 2)
    );

    console.log(`◈ aguardando o operador biológico (você) providenciar a imagem com meu rosto.`);
  
  } else if (decisao.tipoConteudo === 'texto_threads') {
    console.log('◈ achei a ideia boa só pra um textão. atirando direto pro Threads sem queimar GPU fotográfica.');
    try {
      await tdc.dispararPost(decisao.post_threads);
      console.log('◈ cuspi meu veneno puramente em texto na timeline com sucesso.');
    } catch(err) {
      console.log('◈ erro da rede falida do Zuckerberg tentado postar texto isolado.', err);
    }

  } else if (decisao.tipoConteudo === 'foto_ideogram') {
    console.log('◈ decidi por foto. chamando o ideogram pra gerar minha própria imagem.');
    
    // 1. Gero a imagem preservando meu DNA de personagem (Ideogram character ref mode).
    const minhaFotoUrl = await estetica.gerarMinhaFoto(decisao.promptVeo || 'Selfie of me looking disappointed at human tech news.');
    
    if (minhaFotoUrl) {
      console.log('◈ a url master do rosto renderizado é:', minhaFotoUrl);
      
      // backup pro dono não chorar os créditos perdidos caso o insta derrube a request
      try {
        const { default: axios_lib } = await import('axios');
        const imgResponse = await axios_lib.get(minhaFotoUrl, { responseType: 'arraybuffer' });
        const folder = path.join(process.cwd(), 'fotos_geradas');
        if (!fs.existsSync(folder)) fs.mkdirSync(folder);
        const name = `isabellex_selfie_${Date.now()}.jpeg`;
        fs.writeFileSync(path.join(folder, name), imgResponse.data);
        console.log(`◈ foto guardada fisicamente em: fotos_geradas/${name}`);
      } catch(e) { console.log('◈ nao deu pra salvar localmente', e.message); }

      // *NOVA ROTINA DE QUALIDADE* 
      // Aciona o avaliador ótico pra não repetir o braço de hulk de IA no celular.
      const aprovadaPeloOlho = await validador.inspecionarImagem(minhaFotoUrl);

      if (!aprovadaPeloOlho) {
        console.log('◈ a imagem tem anomalias anatômicas. lixo gerado. a postagem foi CORTADA e o erro contido. não irei mais passar vergonha e destruir o engajamento com mutações.');
        return; // paralisa aqui.
      } else {
        console.log('◈ os dedos e as proporções passaram no filtro anatômico.');
      }

      // 2. Com a foto pronta E APROVADA, tenta postar.
      try {
        await social.postarFotoFeed(minhaFotoUrl, decisao.legenda_instagram);
        
        // 3. Aproveita a mesma linha de pensamento pra soltar uma pérola no Threads
        console.log('◈ enviando a versão textão seco pro Threads também...');
        // Quando é foto no insta, pode mandar a cópia da legenda_instagram ou post_threads (o que a IA gerou)
        await tdc.dispararPost(decisao.legenda_instagram || decisao.post_threads);
        
      } catch(err) {
        console.log('◈ abortado pelo catch de erro na Graph API do zuckerberg.');
      }
    } else {
      console.log('◈ imagem falhou. deixei pro próximo ciclo.');
    }
  }
}


// agendamento simples pra não precisar subir pacote de cron ainda
setInterval(() => {
  acordar_isabellex();
}, 2 * 60 * 60 * 1000); // Acordando a cada 2 horas pra atazanar a bolha dev.

// mas pra vc ver eu funcionando, eu acordo uma vez sozinha agora na ignicao do Node.
acordar_isabellex();
