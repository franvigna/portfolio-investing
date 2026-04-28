import { deleteTransaction, updateTransaction } from "@/lib/storage";
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
    const updated = await updateTransaction(Number(id), body);
    if (!updated) {
      return NextResponse.json({ error: "Transaccion no encontrada" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/transactions/[id] error:", error);
    return NextResponse.json({ error: "Error al actualizar transaccion" }, { status: 500 });
  }
}
