import * as dotenv from 'dotenv';

dotenv.config();

const IDEOGRAM_API_KEY = process.env.IDEOGRAM_API_KEY;

export class IsabellexEstetica {
  
  constructor() {
    this.characterUrl = process.env.ISABELLEX_ROSTO_BASE_URL;
  }

  async gerarMinhaFoto(descricaoCena) {
    console.log('◈ baixando meu rosto matriz do catbox pra forçar no Ideogram V3...');

    // O segredo do fotorealismo absoluto (estilo Flux.1 / Midjourney v6 pesado):
    // Cortamos as descrições fofas de "Aesthetic" e focamos em LENTES FÍSICAS de câmeras e DEFEITOS MICROSCÓPICOS obrigatórios na pele humana sintética.
    const promptMestre = `EXTREME ULTRA-PHOTOREALISTIC RAW MACRO PHOTOGRAPHY. 35mm lens, f/1.8 aperture, shot on Sony A7R IV. CHARACTER: young Brazilian woman, deadpan piercing gaze, incredibly slim face, long elegant neck, center-parted long straight jet-black hair with flyaways, pale striking blue-grey eyes, thick unstructured defined dark brows, subtle asymmetric freckles across nose and cheeks, silver small nose ring. ACTION/SCENE: ${descricaoCena}. LIGHTING & AESTHETIC: strict non-studio lighting, harsh flash or flat natural window light, ultra-detailed asymmetric skin texture, visible pores, subtle blemishes, vellus hair, completely unretouched, zero makeup, candid spontaneous framing, zero CGI or plastic 3D look, gritty texture, moody raw influencer, extreme 8k resolution.`;

    try {
      // 1. O V3 exige upload físico do arquivo em multipart/form-data.
      // Então eu baixo a minha matriz base do Catbox em binário primeiro:
      const imgRes = await fetch(this.characterUrl);
      const imageBlob = await imgRes.blob();

      console.log(`◈ acionando a renderização pesada V3 pra: ${descricaoCena}`);

      // 2. Monta o Form nativo pro Node repassar pra eles.
      const formData = new FormData();
      formData.append('prompt', promptMestre);
      formData.append('style_type', 'REALISTIC');
      formData.append('aspect_ratio', '3x4');
      // Força a consistência facial (Feature Exclusiva da V3)
      formData.append('character_reference_images', imageBlob, 'rosto_matriz.jpg');

      const response = await fetch("https://api.ideogram.ai/v1/ideogram-v3/generate", {
        method: "POST",
        headers: {
          "Api-Key": IDEOGRAM_API_KEY
        },
        body: formData
      });

      const json = await response.json();

      if (response.ok && json.data && json.data.length > 0) {
        console.log(`◈ foto gerada nativamente na V3. parece com minha estrutura original de verdade dessa vez.`);
        return json.data[0].url;
      } else {
        console.error('◈ erro maldito da api do ideogram v3:', JSON.stringify(json));
        return null;
      }

    } catch (error) {
      console.error('◈ os servidores do ideogram tão suando no V3.', error.message);
      return null;
    }
  }
}
