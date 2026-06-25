import { addTransaction, getTransactions } from "@/lib/storage";
import { calcularCamposDerivados } from "@/lib/calcularTx";
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
    const { fecha, tipo, ticker, cantidad, precioUnitario, broker } = body;

    if (!fecha || !tipo || !ticker || !cantidad || !precioUnitario) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const tickerUpper = ticker.toUpperCase();
    const { total, precioUSD, totalUSD, tcUsado } = await calcularCamposDerivados(
      tickerUpper,
      Number(precioUnitario),
      Number(cantidad)
    );

    const newTx = await addTransaction({
      fecha,
      tipo,
      ticker: tickerUpper,
      cantidad: Number(cantidad),
      precioUnitario: Number(precioUnitario),
      total,
      precioUSD,
      totalUSD,
      broker: broker ?? null,
      tcUsado,
      notas: null,
    });

    return NextResponse.json(newTx, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ error: "Error al crear transaccion" }, { status: 500 });
  }
}
