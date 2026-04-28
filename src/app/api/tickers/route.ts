import { getTickers, updateTickerPrice } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getTickers());
  } catch (error) {
    console.error("GET /api/tickers error:", error);
    return NextResponse.json({ error: "Error al leer tickers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = Array.isArray(body) ? body : [body];
    for (const item of items) {
      await updateTickerPrice(item.symbol, item.precioActual ?? null, item.precioActualUSD ?? null);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/tickers error:", error);
    return NextResponse.json({ error: "Error al actualizar precios" }, { status: 500 });
  }
}
