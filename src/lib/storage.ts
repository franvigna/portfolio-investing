import { getDb } from "@/db";
import { transactions as txTable, tickers as tkTable, variables as varsTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { Transaction } from "@/types";

export type { Transaction };

export interface Ticker {
  symbol: string;
  descripcion: string | null;
  categoria: string | null;
  precioActual: number | null;
  precioActualUSD: number | null;
}

export interface Variables {
  usdMep: number | null;
  usdt: number | null;
  fechaActualizacion: string | null;
}


// ---- DB row -> domain type mapping ----

function rowToTx(row: typeof txTable.$inferSelect): Transaction {
  return {
    id: row.id,
    fecha: row.fecha,
    tipo: row.tipo,
    ticker: row.ticker,
    cantidad: row.cantidad,
    precioUnitario: row.precioUnitario,
    total: row.total,
    precioUSD: row.precioUSD ?? null,
    totalUSD: row.totalUSD ?? null,
    broker: row.broker ?? null,
    tcUsado: row.tcUsado ?? null,
    notas: row.notas ?? null,
  };
}

function rowToTicker(row: typeof tkTable.$inferSelect): Ticker {
  return {
    symbol: row.symbol,
    descripcion: row.descripcion ?? null,
    categoria: row.categoria ?? null,
    precioActual: row.precioActual ?? null,
    precioActualUSD: row.precioActualUSD ?? null,
  };
}

// ---- Transactions ----

export async function getTransactions(): Promise<Transaction[]> {
  const db = getDb();
  const rows = await db.select().from(txTable).orderBy(desc(txTable.fecha));
  return rows.map(rowToTx);
}

export async function addTransaction(tx: Omit<Transaction, "id">): Promise<Transaction> {
  const db = getDb();
  const [inserted] = await db
    .insert(txTable)
    .values({
      fecha: tx.fecha,
      tipo: tx.tipo,
      ticker: tx.ticker,
      cantidad: tx.cantidad,
      precioUnitario: tx.precioUnitario,
      total: tx.total,
      precioUSD: tx.precioUSD ?? undefined,
      totalUSD: tx.totalUSD ?? undefined,
      broker: tx.broker ?? undefined,
      tcUsado: tx.tcUsado ?? undefined,
      notas: tx.notas ?? undefined,
    })
    .returning();
  return rowToTx(inserted);
}

export async function deleteTransaction(id: number): Promise<boolean> {
  const db = getDb();
  const result = await db.delete(txTable).where(eq(txTable.id, id)).returning();
  return result.length > 0;
}

export async function updateTransaction(
  id: number,
  updates: Partial<Omit<Transaction, "id">>
): Promise<Transaction | null> {
  const db = getDb();
  const [updated] = await db
    .update(txTable)
    .set({
      ...(updates.fecha !== undefined && { fecha: updates.fecha }),
      ...(updates.tipo !== undefined && { tipo: updates.tipo }),
      ...(updates.ticker !== undefined && { ticker: updates.ticker }),
      ...(updates.cantidad !== undefined && { cantidad: updates.cantidad }),
      ...(updates.precioUnitario !== undefined && { precioUnitario: updates.precioUnitario }),
      ...(updates.total !== undefined && { total: updates.total }),
      ...(updates.precioUSD !== undefined && { precioUSD: updates.precioUSD }),
      ...(updates.totalUSD !== undefined && { totalUSD: updates.totalUSD }),
      ...(updates.broker !== undefined && { broker: updates.broker }),
      ...(updates.tcUsado !== undefined && { tcUsado: updates.tcUsado }),
      ...(updates.notas !== undefined && { notas: updates.notas }),
    })
    .where(eq(txTable.id, id))
    .returning();
  return updated ? rowToTx(updated) : null;
}

// ---- Tickers ----

export async function getTickers(): Promise<Ticker[]> {
  const db = getDb();
  const rows = await db.select().from(tkTable);
  return rows.map(rowToTicker);
}

export async function updateTickerPrice(
  symbol: string,
  precioActual: number | null,
  precioActualUSD: number | null
): Promise<void> {
  const db = getDb();
  await db
    .update(tkTable)
    .set({
      precioActual: precioActual ?? undefined,
      precioActualUSD: precioActualUSD ?? undefined,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(tkTable.symbol, symbol));
}

// ---- Variables ----

export async function getVariables(): Promise<Variables> {
  const db = getDb();
  const rows = await db.select().from(varsTable).limit(1);
  if (rows.length === 0) return { usdMep: null, usdt: null, fechaActualizacion: null };
  const row = rows[0];
  return {
    usdMep: row.usdMep ?? null,
    usdt: row.usdt ?? null,
    fechaActualizacion: row.fechaActualizacion ?? null,
  };
}

export async function saveVariables(vars: Variables): Promise<void> {
  const db = getDb();
  const rows = await db.select().from(varsTable).limit(1);
  if (rows.length === 0) {
    await db.insert(varsTable).values({
      usdMep: vars.usdMep ?? undefined,
      usdt: vars.usdt ?? undefined,
      fechaActualizacion: vars.fechaActualizacion ?? undefined,
    });
  } else {
    await db.update(varsTable).set({
      usdMep: vars.usdMep ?? undefined,
      usdt: vars.usdt ?? undefined,
      fechaActualizacion: vars.fechaActualizacion ?? undefined,
    }).where(eq(varsTable.id, rows[0].id));
  }
}
