import { getTransactions, getTickers, getVariables } from "@/lib/storage";
import { calcularPortfolio } from "@/lib/portfolio";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [transactions, tickers, variables] = await Promise.all([getTransactions(), getTickers(), getVariables()]);
    const portfolio = calcularPortfolio(transactions, tickers, variables);
    return NextResponse.json(portfolio);
  } catch (error) {
    console.error("GET /api/portfolio error:", error);
    return NextResponse.json({ error: "Error al calcular portfolio" }, { status: 500 });
  }
}
