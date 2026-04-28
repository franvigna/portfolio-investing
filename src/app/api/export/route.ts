import { getTransactions } from "@/lib/storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const txs = await getTransactions();
    return new NextResponse(JSON.stringify(txs, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="portfolio-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("GET /api/export error:", error);
    return NextResponse.json({ error: "Error al exportar datos" }, { status: 500 });
  }
}
