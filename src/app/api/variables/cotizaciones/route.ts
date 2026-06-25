import { getVariables, saveVariables, getTickers, updateTickerPrice } from "@/lib/storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface DolarApiItem {
  casa: string;
  compra: number | null;
  venta: number | null;
}

const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  SOL: "solana",
  ADA: "cardano",
  DOT: "polkadot",
  AVAX: "avalanche-2",
};

// Tickers que cotizan en BYMA (Cedears, ETFs, acciones argentinas)
const BYMA_TICKERS = new Set([
  "AAPL", "ADBE", "AMD", "AMZN", "ASML", "GOOGL",
  "MELI", "META", "MSFT", "NVDA", "SPY", "QQQ",
  "ARKK", "SMH", "VIG",
  "GGAL", "BMA", "CEPU", "LOMA", "PAMP", "YPFD",
  "ALUA", "SUPV", "TECO2", "TGNO4", "TGSU2",
]);

async function fetchGoogleFinanceBCBA(ticker: string): Promise<number | null> {
  try {
    const res = await fetch(`https://www.google.com/finance/quote/${ticker}:BCBA`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "es-AR,es;q=0.9",
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    // Patron: ["TICKER","BCBA"],"NombreEmpresa",0,"ARS",[PRECIO,
    const match = html.match(new RegExp(`\\["${ticker}","BCBA"\\],"[^"]+",0,"ARS",\\[(\\d+(?:\\.\\d+)?),`));
    if (!match) return null;
    const price = parseFloat(match[1]);
    // Sanity check: precio razonable para acciones/Cedears en ARS (max 5M)
    return price < 5_000_000 ? price : null;
  } catch {
    return null;
  }
}

export async function POST() {
  try {
    const tickers = await getTickers();
    const cryptoTickers = tickers.filter((t) => t.categoria === "Cripto");
    const bymaTickerList = tickers
      .filter((t) => BYMA_TICKERS.has(t.symbol.toUpperCase()))
      .map((t) => t.symbol.toUpperCase());

    const [dolarRes, cgRes] = await Promise.all([
      fetch("https://dolarapi.com/v1/dolares", { next: { revalidate: 0 } }),
      fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${Object.values(COINGECKO_IDS).join(",")}&vs_currencies=usd`,
        { next: { revalidate: 0 } }
      ),
    ]);

    if (!dolarRes.ok) throw new Error(`dolarapi.com respondio ${dolarRes.status}`);
    const dolares: DolarApiItem[] = await dolarRes.json();

    const mep = dolares.find((d) => d.casa === "mep");
    const cripto = dolares.find((d) => d.casa === "cripto");

    const usdMep = mep?.venta ?? null;
    const usdt = cripto?.venta ?? null;

    const current = await getVariables();
    const updated = {
      ...current,
      ...(usdMep != null && { usdMep }),
      ...(usdt != null && { usdt }),
      fechaActualizacion: new Date().toISOString().split("T")[0],
    };
    await saveVariables(updated);

    // Actualizar cripto
    const cryptoUpdates: string[] = [];
    if (usdt != null) {
      let cgData: Record<string, { usd: number }> = {};
      if (cgRes.ok) {
        try { cgData = await cgRes.json(); } catch { /* ignore */ }
      }

      for (const ticker of cryptoTickers) {
        const symbol = ticker.symbol.toUpperCase();
        if (symbol === "USDT") {
          await updateTickerPrice(symbol, usdt, 1);
          cryptoUpdates.push(symbol);
          continue;
        }
        const cgId = COINGECKO_IDS[symbol];
        const priceUSD = cgId ? cgData[cgId]?.usd : undefined;
        if (priceUSD != null) {
          await updateTickerPrice(symbol, priceUSD * usdt, priceUSD);
          cryptoUpdates.push(symbol);
        }
      }
    }

    // Actualizar Cedears, ETFs y acciones argentinas via Google Finance BYMA
    // Precio directo en ARS — sin necesidad de ratios ni conversion
    const equityUpdates: string[] = [];
    const bymaResults = await Promise.all(
      bymaTickerList.map(async (symbol) => ({
        symbol,
        priceARS: await fetchGoogleFinanceBCBA(symbol),
      }))
    );

    for (const { symbol, priceARS } of bymaResults) {
      if (priceARS == null) continue;
      const priceUSD = usdMep != null && usdMep > 0 ? priceARS / usdMep : null;
      await updateTickerPrice(symbol, priceARS, priceUSD);
      equityUpdates.push(symbol);
    }

    return NextResponse.json({ variables: updated, cryptoUpdated: cryptoUpdates, equityUpdated: equityUpdates });
  } catch (error) {
    console.error("POST /api/variables/cotizaciones error:", error);
    return NextResponse.json({ error: "Error al obtener cotizaciones" }, { status: 500 });
  }
}
