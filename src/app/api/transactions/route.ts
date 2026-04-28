import { addTransaction, getTransactions } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const txs = await getTransactions();
    return NextResponse.json(txs);
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ error: "Error al leer transacciones" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fecha, tipo, ticker, cantidad, precioUnitario, total, precioUSD, totalUSD, broker, tcUsado, notas } = body;

    if (!fecha || !tipo || !ticker || !cantidad || !precioUnitario || !total) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const newTx = await addTransaction({
      fecha,
      tipo,
      ticker: ticker.toUpperCase(),
      cantidad: Number(cantidad),
      precioUnitario: Number(precioUnitario),
      total: Number(total),
      precioUSD: precioUSD ? Number(precioUSD) : null,
      totalUSD: totalUSD ? Number(totalUSD) : null,
      broker: broker ?? null,
      tcUsado: tcUsado ? Number(tcUsado) : null,
      notas: notas ?? null,
    });

    return NextResponse.json(newTx, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ error: "Error al crear transaccion" }, { status: 500 });
  }
}
