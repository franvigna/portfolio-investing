import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fecha: text("fecha").notNull(),
  tipo: text("tipo", { enum: ["Compra", "Venta"] }).notNull(),
  ticker: text("ticker").notNull(),
  cantidad: real("cantidad").notNull(),
  precioUnitario: real("precio_unitario").notNull(),
  total: real("total").notNull(),
  precioUSD: real("precio_usd"),
  totalUSD: real("total_usd"),
  broker: text("broker"),
  tcUsado: real("tc_usado"),
  notas: text("notas"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const tickers = sqliteTable("tickers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull().unique(),
  descripcion: text("descripcion"),
  categoria: text("categoria"),
  precioActual: real("precio_actual"),
  precioActualUSD: real("precio_actual_usd"),
  updatedAt: text("updated_at"),
});

export type DbTransaction = typeof transactions.$inferSelect;
export type NewDbTransaction = typeof transactions.$inferInsert;
export type DbTicker = typeof tickers.$inferSelect;
