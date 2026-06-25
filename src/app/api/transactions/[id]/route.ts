import { deleteTransaction, updateTransaction } from "@/lib/storage";
import { calcularCamposDerivados } from "@/lib/calcularTx";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteTransaction(Number(id));
    if (!deleted) {
      return NextResponse.json({ error: "Transaccion no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/transactions/[id] error:", error);
    return NextResponse.json({ error: "Error al eliminar transaccion" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { fecha, tipo, ticker, cantidad, precioUnitario, broker, notas } = body;

    if (!fecha || !tipo || !ticker || !cantidad || !precioUnitario) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const tickerUpper = ticker.toUpperCase();
    const { total, precioUSD, totalUSD, tcUsado } = await calcularCamposDerivados(
      tickerUpper,
      Number(precioUnitario),
      Number(cantidad)
    );

    const updated = await updateTransaction(Number(id), {
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
      notas: notas ?? null,
    });

    if (!updated) {
      return NextResponse.json({ error: "Transaccion no encontrada" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/transactions/[id] error:", error);
    return NextResponse.json({ error: "Error al actualizar transaccion" }, { status: 500 });
  }
}
