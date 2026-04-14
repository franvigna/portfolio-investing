import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Ticker not found" }, { status: 404 });
    }

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;

    if (!meta) {
      return NextResponse.json({ error: "No data available" }, { status: 404 });
    }

    return NextResponse.json({
      symbol: meta.symbol,
      price: meta.regularMarketPrice,
      currency: meta.currency,
      name: meta.longName || meta.shortName || symbol,
    });
  } catch (error) {
    console.error("GET /api/tickers error:", error);
    return NextResponse.json({ error: "Error fetching ticker" }, { status: 500 });
  }
}
