const res = await fetch('https://www.google.com/finance/quote/AAPL:BCBA', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'es-AR,es;q=0.9',
  }
});
const html = await res.text();
// Buscar cualquier numero que parezca precio (5 digitos)
const prices = [...html.matchAll(/(\d{4,6}[.,]\d{2})/g)].slice(0, 20);
console.log('Posibles precios:', prices.map(m => m[1]));

// Ver si hay JSON embebido
const jsonMatch = html.match(/AF_initDataCallback\(({.*?})\)/s);
console.log('\nJSON embebido:', jsonMatch ? 'SI' : 'NO');

// Buscar "22" cerca de AAPL (precio esperado ~$22.780)
const idx = html.indexOf('22780') !== -1 ? html.indexOf('22780') : html.indexOf('22.780');
console.log('\nPrecio 22780 encontrado:', idx !== -1 ? html.slice(Math.max(0, idx-50), idx+50) : 'NO');

console.log('\nStatus:', res.status);
console.log('Primeros 500 chars:', html.slice(0, 500));
