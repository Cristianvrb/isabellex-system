async function ping() {
  try {
    const res = await fetch('http://localhost:3000/api/stats');
    const data = await res.json();
    console.log("DADOS DO ENDPOINT:", data);
  } catch (e) {
    console.log("ERRO API:", e.message);
  }
}
ping();
