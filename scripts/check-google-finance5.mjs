async function fetchGoogleFinanceBCBA(ticker) {
  try {
    const res = await fetch(`https://www.google.com/finance/quote/${ticker}:BCBA`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-AR,es;q=0.9',
      }
    });
    if (!res.ok) return null;
    const html = await res.text();
    // Buscar: ["TICKER","BCBA"],"NombreEmpresa",0,"ARS",[PRECIO,
    // El 0 es el tipo de mercado (equity), "ARS" es la moneda, PRECIO es <= 10M para evitar datos financieros
    const match = html.match(new RegExp(`\\["${ticker}","BCBA"\\],"[^"]+",0,"ARS",\\[(\\d+(?:\\.\\d+)?),`));
    if (match) {
      const price = parseFloat(match[1]);
      // Sanity check: precio de CEDEAR/accion Argentina razonable (max 5M ARS)
      if (price < 5_000_000) return price;
    }
    return null;
  } catch {
    return null;
  }
}

const tickers = ['AAPL', 'AMD', 'MELI', 'META', 'MSFT', 'NVDA', 'QQQ', 'SPY', 'GGAL', 'LOMA', 'PAMP', 'SUPV', 'YPFD', 'TECO2', 'TGNO4', 'TGSU2', 'ALUA', 'BMA', 'CEPU', 'ADBE', 'AMZN', 'ASML', 'ARKK', 'SMH', 'VIG'];

for (const ticker of tickers) {
  const price = await fetchGoogleFinanceBCBA(ticker);
  console.log(`${ticker}: ${price != null ? '$' + price.toLocaleString('es-AR') : 'NO ENCONTRADO'}`);
}
