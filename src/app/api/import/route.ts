import { getDb } from "@/db";
import { transactions } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an array of transactions" }, { status: 400 });
    }

    const rows = body.map((t) => ({
      ticker: String(t.ticker).toUpperCase(),
      type: t.type as "BUY" | "SELL",
      shares: Number(t.shares),
      price: Number(t.price),
      date: String(t.date),
      notes: t.notes ?? null,
    }));

    const db = getDb();
    await db.insert(transactions).values(rows);

    return NextResponse.json({ imported: rows.length });
  } catch (error) {
    console.error("POST /api/import error:", error);
    return NextResponse.json({ error: "Error importing data" }, { status: 500 });
  }
}
