import { addTransaction } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Se esperaba un array de transacciones" }, { status: 400 });
    }

    let count = 0;
    for (const t of body) {
      await addTransaction({
        fecha: String(t.fecha),
        tipo: t.tipo as "Compra" | "Venta",
        ticker: String(t.ticker).toUpperCase(),
        cantidad: Number(t.cantidad),
        precioUnitario: Number(t.precioUnitario),
        total: Number(t.total),
        precioUSD: t.precioUSD != null ? Number(t.precioUSD) : null,
        totalUSD: t.totalUSD != null ? Number(t.totalUSD) : null,
        broker: t.broker ?? null,
        tcUsado: t.tcUsado != null ? Number(t.tcUsado) : null,
        notas: t.notas ?? null,
      });
      count++;
    }

    return NextResponse.json({ imported: count });
  } catch (error) {
    console.error("POST /api/import error:", error);
    return NextResponse.json({ error: "Error al importar datos" }, { status: 500 });
  }
}
