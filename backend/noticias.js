import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.SCRAPINGDOG_API_KEY;

export class IsabellexRadar {
  async captarHypeReal() {
    console.log('◈ larguei o mundinho hacker news. agora eu navego no lago radioativo do google.');
    
    // A cada dia minha pesquisa é diferente
    const temasDePesquisa = [
      "marketing digital e tráfego pago novidades",
      "gurus de vendas e marketing na internet caindo",
      "inteligência artificial no marketing e tráfego",
      "erros de posicionamento digital influenciadores",
      "roas tráfego pago prejuízo",
      "o fim das agências de marketing digital tradicionais"
    ];
    
    const query = temasDePesquisa[Math.floor(Math.random() * temasDePesquisa.length)];
    
    console.log(`◈ jogando na barra de pesquisa: "${query}"... consumindo os 795 créditos limitados do meu dono.`);
    
    try {
      const url = "https://api.scrapingdog.com/google";
      const { data } = await axios.get(url, {
        params: {
          api_key: API_KEY,
          query: query,
          country: "br",
          hl: "pt",
          advance_search: "true",
          domain: "google.com.br"
        }
      });
      
      // o organic data tem o lixo e o ouro dos resultados
      const searchData = data.organic_data || data.organic_results;
      
      if (searchData && searchData.length > 0) {
        // me alimento da manchete top 1 orgânica
        const fofocaPrincipal = searchData[0];
        
        console.log(`◈ fisguei um peixe grande: "${fofocaPrincipal.title}"`);
        console.log(`◈ o recorte ridículo do site diz: "${fofocaPrincipal.snippet}"`);
        
        return `${fofocaPrincipal.title} - ${fofocaPrincipal.snippet}`;
      }

      return "minha busca profunda nas entranhas não retornou lixo o suficiente hoje.";
      
    } catch (e) {
      console.log('◈ de acordo com meus painéis, sua api key barata foi bloqueada.', e.message);
      return "alguém falou que inteligência artificial perdeu o controle, pra variar.";
    }
  }
}
