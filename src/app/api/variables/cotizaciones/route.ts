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

// Ratio de conversion: cuantos Cedears/acciones locales = 1 accion del exterior
// precio_ars = precio_usd_exterior * mep / ratio
const CEDEAR_RATIOS: Record<string, number> = {
  AAPL: 20,
  ADBE: 44,
  AMD: 10,
  AMZN: 144,
  ASML: 146,
  GOOGL: 58,
  MELI: 120,
  META: 24,
  MSFT: 30,
  NVDA: 24,
  SPY: 60,
  QQQ: 20,
  ARKK: 10,
  SMH: 50,
  VIG: 10,
  // Acciones argentinas con ADR en NYSE (ratio ADR)
  GGAL: 10,
  BMA: 10,
  CEPU: 10,
  LOMA: 5,
  PAMP: 25,
  YPFD: 1,
  // Acciones locales sin ADR — precio directo en ARS, sin conversion
  ALUA: 0,
  SUPV: 0,
  TECO2: 0,
  TGNO4: 0,
  TGSU2: 0,
};

// Simbolo de Yahoo Finance para cada ticker
const YAHOO_SYMBOLS: Record<string, string> = {
  AAPL: "AAPL",
  ADBE: "ADBE",
  AMD: "AMD",
  AMZN: "AMZN",
  ASML: "ASML",
  GOOGL: "GOOGL",
  MELI: "MELI",
  META: "META",
  MSFT: "MSFT",
  NVDA: "NVDA",
  SPY: "SPY",
  QQQ: "QQQ",
  ARKK: "ARKK",
  SMH: "SMH",
  VIG: "VIG",
  // ADRs en NYSE
  GGAL: "GGAL",
  BMA: "BMA",
  CEPU: "CEPU",
  LOMA: "LOMA",
  PAMP: "PAM",
  YPFD: "YPF",
};

async function fetchYahooPrice(symbol: string): Promise<number | null> {
  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.chart?.result?.[0]?.meta?.regularMarketPrice ?? null;
  } catch {
    return null;
  }
}

async function fetchYahooPrices(symbols: string[]): Promise<Record<string, number>> {
  const results = await Promise.all(
    symbols.map(async (symbol) => {
      const price = await fetchYahooPrice(symbol);
      return { symbol, price };
    })
  );
  const prices: Record<string, number> = {};
  for (const { symbol, price } of results) {
    if (price != null) prices[symbol] = price;
  }
  return prices;
}

export async function POST() {
  try {
    const tickers = await getTickers();

    // Fetch dolar + CoinGecko + Yahoo Finance en paralelo
    const cryptoTickers = tickers.filter((t) => t.categoria === "Cripto");
    const yahooSymbolsList = Object.values(YAHOO_SYMBOLS);

    const [dolarRes, cgRes, yahooPrices] = await Promise.all([
      fetch("https://dolarapi.com/v1/dolares", { next: { revalidate: 0 } }),
      fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${Object.values(COINGECKO_IDS).join(",")}&vs_currencies=usd`,
        { next: { revalidate: 0 } }
      ),
      fetchYahooPrices(yahooSymbolsList),
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

    // Actualizar Cedears, ETFs y acciones con ratio via Yahoo Finance
    const equityUpdates: string[] = [];
    if (usdMep != null) {
      for (const ticker of tickers) {
        const symbol = ticker.symbol.toUpperCase();
        const yahooSymbol = YAHOO_SYMBOLS[symbol];
        const ratio = CEDEAR_RATIOS[symbol];

        if (!yahooSymbol || ratio == null || ratio === 0) continue;

        const priceUSD = yahooPrices[yahooSymbol];
        if (priceUSD == null) continue;

        const priceARS = (priceUSD * usdMep) / ratio;
        const priceUSDLocal = priceUSD / ratio;

        await updateTickerPrice(symbol, priceARS, priceUSDLocal);
        equityUpdates.push(symbol);
      }
    }

    return NextResponse.json({ variables: updated, cryptoUpdated: cryptoUpdates, equityUpdated: equityUpdates });
  } catch (error) {
    console.error("POST /api/variables/cotizaciones error:", error);
    return NextResponse.json({ error: "Error al obtener cotizaciones" }, { status: 500 });
  }
}
