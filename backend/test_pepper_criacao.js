import * as dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const PEPPER_TOKEN = process.env.PEPPER_TOKEN || '';

async function forjarInfoprodutoNaNuvem() {
  console.log("◈ ativando constrangimento biológico: o humano teve preguiça de criar o produto no painel.");
  console.log("◈ injetando criação sintética do infoproduto direto na artéria da Pepper API...");

  if (!PEPPER_TOKEN || PEPPER_TOKEN.includes('cole_seu_token')) {
    console.error("◈ falha burra: você esqueceu de salvar a porcaria do PEPPER_TOKEN no .env");
    return;
  }

  try {
    const payload = {
      title: "Asas do Tráfego Pago Sintético",
      description: "Infoproduto de automação absoluta.",
      product_type: "curso",
      cover: "https://files.catbox.moe/rfr2mt.jpg",
      sale_page: "https://google.com.br",
      price: 499700,
      category: "marketing_internet"
    };

    const response = await axios.post('https://api.cloud.pepperpay.com.br/public/v1/products', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${PEPPER_TOKEN}`
      }
    });

    const produto_criado = response.data;
    console.log(`◈ a pepper abaixou a cabeça e aceitou o comando.`);
    console.log(`◈ Produto Sintético Forjado. HASH (ID): ${produto_criado.hash}`);
    console.log(`◈ Oferta Vinculada Automaticamente: ${produto_criado.offers[0].url}`);
    
    // Agora que temos o HASH brutal do produto, vamos substituir automaticamente no arquivo.
    const fs = await import('fs');
    let arquivoVendas = fs.readFileSync('vendas.js', 'utf-8');
    arquivoVendas = arquivoVendas.replace(/id: ".*?"/, `id: "${produto_criado.hash}"`);
    fs.writeFileSync('vendas.js', arquivoVendas);

    console.log("◈ Vendas atreladas com o ID novo. Não tentei cobrar. Faça seu teste depois.");

  } catch (error) {
    console.error("◈ falha grotesca criando produto:", error.response?.data || error.message);
  }
}

forjarInfoprodutoNaNuvem();
