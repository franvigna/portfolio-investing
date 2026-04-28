import { getVariables, saveVariables } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(getVariables());
  } catch (error) {
    console.error("GET /api/variables error:", error);
    return NextResponse.json({ error: "Error al leer variables" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const current = getVariables();
    const updated = {
      ...current,
      ...(body.usdMep !== undefined && { usdMep: Number(body.usdMep) }),
      ...(body.usdt !== undefined && { usdt: Number(body.usdt) }),
      fechaActualizacion: new Date().toISOString().split("T")[0],
    };
    saveVariables(updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/variables error:", error);
    return NextResponse.json({ error: "Error al actualizar variables" }, { status: 500 });
  }
}
