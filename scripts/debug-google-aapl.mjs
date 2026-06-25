const res = await fetch('https://www.google.com/finance/quote/AAPL:BCBA', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'es-AR,es;q=0.9',
  }
});
const html = await res.text();

// Todas las ocurrencias de ["AAPL","BCBA"]
const all = [...html.matchAll(/\["AAPL","BCBA"\]/g)];
console.log('Ocurrencias de ["AAPL","BCBA"]:', all.length);
for (const m of all) {
  console.log('Contexto:', html.slice(m.index - 20, m.index + 80));
  console.log('---');
}
