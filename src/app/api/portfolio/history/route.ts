import { getTransactions, getTickers, getVariables } from "@/lib/storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RateRecord { fecha: string; venta: number }

async function fetchHistoricalRates(casa: string): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  try {
    const res = await fetch(
      `https://api.argentinadatos.com/v1/cotizaciones/dolares/${casa}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return map;
    const data: RateRecord[] = await res.json();
    if (!Array.isArray(data)) return map;
    for (const item of data) {
      if (item.fecha && item.venta) {
        // Normalize date to yyyy-MM-dd (API returns yyyy/MM/dd or yyyy-MM-dd)
        const normalized = item.fecha.replace(/\//g, "-");
        map.set(normalized, item.venta);
      }
    }
  } catch {
    // Silently fall back to transaction's tcUsado
  }
  return map;
}

export async function GET() {
  try {
    const [transactions, tickers] = await Promise.all([
      getTransactions(),
      getTickers(),
    ]);
    const variables = getVariables();

    const priceMap = new Map(tickers.map((t) => [t.symbol, t.precioActual]));
    const categoryMap = new Map(tickers.map((t) => [t.symbol, t.categoria]));

    // Fetch historical dollar rates (bolsa = MEP, cripto = USDT)
    const [bolsaRates, criptoRates] = await Promise.all([
      fetchHistoricalRates("bolsa"),
      fetchHistoricalRates("cripto"),
    ]);

    const sorted = [...transactions].sort((a, b) => a.fecha.localeCompare(b.fecha));

    const holdings = new Map<string, number>();
    const points: { fecha: string; capitalARS: number; valuacionARS: number; capitalUSD: number }[] = [];
    const datesSeen = new Set<string>();
    let runningCapital = 0;
    let runningCapitalUSD = 0;

    const calcValuacion = () => {
      let v = 0;
      for (const [symbol, qty] of holdings.entries()) {
        const price = priceMap.get(symbol);
        if (price != null && qty > 0) v += qty * price;
      }
      return v;
    };

    for (const tx of sorted) {
      const prev = holdings.get(tx.ticker) ?? 0;
      holdings.set(
        tx.ticker,
        tx.tipo === "Compra" ? prev + tx.cantidad : Math.max(0, prev - tx.cantidad)
      );
      runningCapital += tx.tipo === "Compra" ? tx.total : -tx.total;

      // Determine USD capital contribution
      let txUSD = tx.totalUSD;
      if (txUSD == null) {
        const cat = categoryMap.get(tx.ticker);
        const isCripto = cat === "Cripto";
        // Look up historical rate for this transaction's date
        const historicalRate = isCripto
          ? (criptoRates.get(tx.fecha) ?? tx.tcUsado ?? variables.usdt)
          : (bolsaRates.get(tx.fecha) ?? tx.tcUsado ?? variables.usdMep);
        if (historicalRate && historicalRate > 0) {
          txUSD = tx.total / historicalRate;
        }
      }
      runningCapitalUSD += tx.tipo === "Compra" ? (txUSD ?? 0) : -(txUSD ?? 0);

      if (!datesSeen.has(tx.fecha)) {
        datesSeen.add(tx.fecha);
        points.push({
          fecha: tx.fecha,
          capitalARS: Math.max(0, runningCapital),
          valuacionARS: calcValuacion(),
          capitalUSD: Math.max(0, runningCapitalUSD),
        });
      }
    }

    const today = new Date().toISOString().split("T")[0];
    if (!datesSeen.has(today) && points.length > 0) {
      points.push({
        fecha: today,
        capitalARS: points[points.length - 1].capitalARS,
        valuacionARS: calcValuacion(),
        capitalUSD: points[points.length - 1].capitalUSD,
      });
    }

    return NextResponse.json(points);
  } catch (error) {
    console.error("GET /api/portfolio/history error:", error);
    return NextResponse.json({ error: "Error al calcular historial" }, { status: 500 });
  }
}
