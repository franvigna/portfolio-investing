import { getDb } from "@/db";
import { transactions } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const data = await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.date));

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="portfolio-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("GET /api/export error:", error);
    return NextResponse.json({ error: "Error exporting data" }, { status: 500 });
  }
}
