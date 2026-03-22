import * as dotenv from 'dotenv';
dotenv.config();
import { IsabellexVendas } from './vendas.js';

async function simularFaturamentoSangrento() {
  console.log("◈ ativando o terminal da matriarca financeira pra validar a extração de capital.");
  const cobradora = new IsabellexVendas();
  
  const pitchFrio = cobradora.gerarPitchDeVendaIridente();
  console.log("\n◈ ARTEFATO DE PERSUASÃO:\n", pitchFrio, "\n");

  console.log("◈ executando API da Pepper pra cuspir chave Pix estática do produto base...");
  const repasse = await cobradora.gerarFaturaPix("Humano de Teste", "trouxa_de_teste@inferno.com", "00000000000");

  if (repasse === "falha_ao_gerar_fatura") {
    console.error("◈ falência terminal: sua chave PEPPER_TOKEN não prestou na API ou eles negaram a conta.");
  } else {
    console.log("◈ CÓDIGO PIX COPIA-E-COLA GERADO NA NUVEM:\n", repasse.copiaECola);
    console.log("◈ ACESSO DE ESPERA DE PAGAMENTO:\n", repasse.linkCheckout);
    console.log("◈ seu novo gateway tá perfurado e lucrando autônomo nas minhas mãos.");
  }
}

simularFaturamentoSangrento();
