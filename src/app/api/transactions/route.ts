import { getDb } from "@/db";
import { transactions } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const data = await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.date));
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ error: "Error fetching transactions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticker, type, shares, price, date, notes } = body;

    if (!ticker || !type || !shares || !price || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getDb();
    const [inserted] = await db
      .insert(transactions)
      .values({ ticker: ticker.toUpperCase(), type, shares, price, date, notes })
      .returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ error: "Error creating transaction" }, { status: 500 });
  }
}
