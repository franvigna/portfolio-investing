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

    // Patron mas especifico: buscar el bloque de datos del ticker en BCBA con precio razonable
    // Formato: ["/g/...",["TICKER","BCBA"],"Nombre",0,"ARS",[PRECIO,-VAR,-PCT%,2,2,2],null,PREV
    const match = html.match(new RegExp(`\\["/g/[^"]+",\\["${ticker}","BCBA"\\],[^[]+\\[(\\d+(?:\\.\\d+)?),`));
    if (match) return parseFloat(match[1]);
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
