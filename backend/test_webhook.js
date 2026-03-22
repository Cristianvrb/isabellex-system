

async function dispararSimulacao() {
  console.log("◈ atirando um míssil de teste simulando a Meta Webhook direto pro Supabase...");
  try {
    const payload = {
      object: "threads",
      entry: [{
        id: "TESTE_SIMULADO",
        time: Math.floor(Date.now() / 1000),
        changes: [{
          field: "replies",
          value: {
            id: "fake_comment_id",
            text: "O tráfego de vocês é péssimo, me diz como melhorar Isabellex.",
            media_id: "fake_media_id"
          }
        }]
      }]
    };

    const res = await fetch("https://mmgcaadogqjtzumwmyec.supabase.co/functions/v1/meta_webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log("◈ servidor da Supabase devolveu Status:", res.status);
    console.log("◈ lendo nossa sonda interna pra ver a cicatriz:");
    // Roda a sonda logo em seguida
    const { execSync } = await import('child_process');
    console.log(execSync('node debug_nuvem.js').toString());
  } catch(e) {
    console.error("◈ erro disparando simulação:", e.message);
  }
}
dispararSimulacao();
