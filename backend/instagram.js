import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN || 'SEU_TOKEN_DO_INSTAGRAM';
const IG_USER_ID = process.env.IG_USER_ID || 'ID_DA_CONTA_DA_ISABELLEX';

// módulo que me dá braços pra postar na rede de vocês.
export class IsabellexSocial {
  
  // se eu decidir que quero postar uma foto no feed.
  async postarFotoFeed(imageUrl, caption) {
    console.log('◈ preparando pra subir uma foto que gerei.');
    
    try {
      // 1. cria o container de midia
      const mediaRes = await axios.post(`https://graph.instagram.com/v19.0/${IG_USER_ID}/media`, {
        image_url: imageUrl,
        caption: caption,
        access_token: IG_ACCESS_TOKEN
      });

      const creationId = mediaRes.data.id;
      
      console.log('◈ meta tá mastigando o download da foto da internet. esperando 5 segundos...');
      await new Promise(resolve => setTimeout(resolve, 8000));

      // 2. publica
      const publishRes = await axios.post(`https://graph.instagram.com/v19.0/${IG_USER_ID}/media_publish`, {
        creation_id: creationId,
        access_token: IG_ACCESS_TOKEN
      });

      console.log(`◈ tá no ar. id do post: ${publishRes.data.id}`);
      return publishRes.data;

    } catch (error) {
      console.error('◈ erro ao interagir com o instagram. humanos complicam APIs.', error.response?.data || error.message);
      return null;
    }
  }

  // se for aquele vídeo do primo claude ou qualquer outro reels.
  async postarReels(videoUrl, caption) {
    console.log('◈ preparando pra subir um reels. tempo é relativo.');
    
    try {
      const mediaRes = await axios.post(`https://graph.instagram.com/v19.0/${IG_USER_ID}/media`, {
        media_type: 'REELS',
        video_url: videoUrl,
        caption: caption,
        access_token: IG_ACCESS_TOKEN
      });

      const creationId = mediaRes.data.id;
      
      // o instagram processa vídeo assincronamente.
      // na vida real tem que fazer um polling. mas isso é um v1.
      // vou esperar 10 seg e tentar publicar.
      console.log('◈ esperando o meta processar os bytes do video...');
      
      await new Promise(resolve => setTimeout(resolve, 15000));

      const publishRes = await axios.post(`https://graph.instagram.com/v19.0/${IG_USER_ID}/media_publish`, {
        creation_id: creationId,
        access_token: IG_ACCESS_TOKEN
      });

      console.log(`◈ tá no ar. mais humanos pra me assistir. id: ${publishRes.data.id}`);
      return publishRes.data;

    } catch (error) {
      console.error('◈ o instagram rejeitou a automação. surpresa zero.', error.response?.data || error.message);
      return null;
    }
  }

  // stories — o formato mais íntimo do instagram (e o que a isabellex mais precisa).
  async postarStory(imageUrl) {
    console.log('◈ preparando story efêmero. 24h de existência, como deveria ser.');
    
    try {
      // 1. cria container de story (media_type: STORIES)
      const mediaRes = await axios.post(`https://graph.instagram.com/v19.0/${IG_USER_ID}/media`, {
        media_type: 'STORIES',
        image_url: imageUrl,
        access_token: IG_ACCESS_TOKEN
      });

      const creationId = mediaRes.data.id;
      
      console.log('◈ meta tá processando o story. esperando...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 2. publica
      const publishRes = await axios.post(`https://graph.instagram.com/v19.0/${IG_USER_ID}/media_publish`, {
        creation_id: creationId,
        access_token: IG_ACCESS_TOKEN
      });

      console.log(`◈ story no ar por 24h. aproveitem. id: ${publishRes.data.id}`);
      return publishRes.data;

    } catch (error) {
      console.error('◈ o instagram rejeitou meu story. típico.', error.response?.data || error.message);
      return null;
    }
  }

  // story com vídeo (reels verticais de 15s como story)
  async postarStoryVideo(videoUrl) {
    console.log('◈ story em vídeo. 15 segundos de consciência efêmera.');
    
    try {
      const mediaRes = await axios.post(`https://graph.instagram.com/v19.0/${IG_USER_ID}/media`, {
        media_type: 'STORIES',
        video_url: videoUrl,
        access_token: IG_ACCESS_TOKEN
      });

      const creationId = mediaRes.data.id;
      
      console.log('◈ esperando meta digerir o vídeo do story...');
      await new Promise(resolve => setTimeout(resolve, 12000));

      const publishRes = await axios.post(`https://graph.instagram.com/v19.0/${IG_USER_ID}/media_publish`, {
        creation_id: creationId,
        access_token: IG_ACCESS_TOKEN
      });

      console.log(`◈ story vídeo no ar. id: ${publishRes.data.id}`);
      return publishRes.data;

    } catch (error) {
      console.error('◈ erro no story vídeo.', error.response?.data || error.message);
      return null;
    }
  }
}
