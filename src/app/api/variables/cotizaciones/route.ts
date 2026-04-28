import { getVariables, saveVariables, getTickers, updateTickerPrice } from "@/lib/storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface DolarApiItem {
  casa: string;
  compra: number | null;
  venta: number | null;
}

// Mapping from portfolio ticker symbols to CoinGecko IDs
const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  SOL: "solana",
  ADA: "cardano",
  DOT: "polkadot",
  AVAX: "avalanche-2",
};

export async function POST() {
  try {
    // Fetch dollar rates and CoinGecko crypto prices in parallel
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

    // Update variables.json
    const current = getVariables();
    const updated = {
      ...current,
      ...(usdMep != null && { usdMep }),
      ...(usdt != null && { usdt }),
      fechaActualizacion: new Date().toISOString().split("T")[0],
    };
    saveVariables(updated);

    // Update crypto ticker prices using USDT rate as conversion
    const cryptoUpdates: string[] = [];
    if (usdt != null) {
      // Get current portfolio tickers to know which crypto we hold
      const tickers = await getTickers();
      const cryptoTickers = tickers.filter((t) => t.categoria === "Cripto");

      // Parse CoinGecko response (best effort — if it fails, skip)
      let cgData: Record<string, { usd: number }> = {};
      if (cgRes.ok) {
        try { cgData = await cgRes.json(); } catch { /* ignore */ }
      }

      for (const ticker of cryptoTickers) {
        const symbol = ticker.symbol.toUpperCase();

        if (symbol === "USDT") {
          // USDT is always exactly 1 USD = usdt ARS
          await updateTickerPrice(symbol, usdt, 1);
          cryptoUpdates.push(symbol);
          continue;
        }

        const cgId = COINGECKO_IDS[symbol];
        const priceUSD = cgId ? cgData[cgId]?.usd : undefined;
        if (priceUSD != null) {
          const priceARS = priceUSD * usdt;
          await updateTickerPrice(symbol, priceARS, priceUSD);
          cryptoUpdates.push(symbol);
        }
      }
    }

    return NextResponse.json({ variables: updated, cryptoUpdated: cryptoUpdates });
  } catch (error) {
    console.error("POST /api/variables/cotizaciones error:", error);
    return NextResponse.json({ error: "Error al obtener cotizaciones" }, { status: 500 });
  }
}
