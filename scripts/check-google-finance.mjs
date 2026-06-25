// Probar Google Finance para precios BYMA
const tickers = ['AAPL', 'AMD', 'MELI', 'META', 'MSFT', 'NVDA', 'QQQ', 'SPY', 'GGAL', 'LOMA', 'PAMP', 'SUPV', 'YPFD'];

for (const ticker of tickers) {
  try {
    const url = `https://www.google.com/finance/quote/${ticker}:BCBA`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-AR,es;q=0.9',
      }
    });
    const html = await res.text();
    // El precio aparece en un elemento con data-last-price o en el JSON embebido
    const match = html.match(/data-last-price="([0-9.,]+)"/);
    const match2 = html.match(/"price":\s*"([0-9.,]+)"/);
    const match3 = html.match(/\$([0-9]+(?:[.,][0-9]+)?)\s*<\/span>/);
    // Buscar el precio en el HTML
    const priceMatch = html.match(/class="YMlKec fxKbKc"[^>]*>([^<]+)</);
    console.log(`${ticker}: data-last-price=${match?.[1]} | price=${match2?.[1]} | YMlKec=${priceMatch?.[1]}`);
  } catch (e) {
    console.log(`${ticker}: ERROR - ${e.message}`);
  }
}
