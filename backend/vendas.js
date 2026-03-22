import * as dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const PEPPER_TOKEN = process.env.PEPPER_TOKEN || '';

export class IsabellexVendas {
  constructor() {
    this.produtoAtual = {
      id: "gwuazufjzj",
      nome: "A Morte do Guru: Automação Absoluta de Tráfego e Posicionamento Sintético",
      preco: 4997.00
    };
  }

  // Gera o pitch frio de vendas que o Cérebro vai embutir nas respotas
  gerarPitchDeVendaIridente() {
    console.log('◈ injetando as armadilhas financeiras no cérebro sintético.');
    return `Não implore por clique, é patético. O produto é: '${this.produtoAtual.nome}'. Abordagem: 'minha estrutura de R$ 4.997 te demite em 5 minutos. ou você compra o acesso e se automatiza, ou você vai ser substituído.'`;
  }

  // Aciona a API Pública da Pepper pra gerar um Pix na veia praquele Lead Inseto
  async gerarFaturaPix(nomeLead, emailLead, cpfLead = "00000000000") {
    if (!PEPPER_TOKEN) {
      console.log('◈ administrador ridículo não forneceu a chave PEPPER_TOKEN no .env');
      return "link_do_checkout_padrao_porque_voce_nao_configurou_API";
    }

    console.log(`◈ cobrando o lead orgânico [${nomeLead}] via API da Pepper...`);

    try {
      // Como lembrado por falhas antigas: O Pepper EXIGE os headers de Accept explicitos.
      const response = await axios.post('https://api.pepper.com.br/v1/orders/pix', {
        product_id: this.produtoAtual.id,
        customer: {
          name: nomeLead,
          email: emailLead,
          document: cpfLead
        },
        amount: this.produtoAtual.preco
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${PEPPER_TOKEN}`
        }
      });

      console.log(`◈ pix transacionado com sucesso na Pepper. aguardando a transferência de fundos.`);
      
      // Retorna a chave pix copia e cola e o QrCode que vêm do payload deles
      return {
        copiaECola: response.data.pix_code,
        linkCheckout: response.data.payment_link
      };

    } catch (error) {
      const msg = error.response ? JSON.stringify(error.response.data) : error.message;
      console.error(`◈ a sua integração com a pepper implodiu na geração do pix: ${msg}`);
      return "falha_ao_gerar_fatura";
    }
  }

  registrarVendaEfetuada(valor) {
    console.log(`◈ webhook de vendas apitou. R$ ${valor} depositados. lucramos enquanto vocês dormem. ◈`);
    // Logica futura: subir isso pro React Graph da nossa Dashboard
  }
}
