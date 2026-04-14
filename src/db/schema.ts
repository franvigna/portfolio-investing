import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ticker: text("ticker").notNull(),
  type: text("type", { enum: ["BUY", "SELL"] }).notNull(),
  shares: real("shares").notNull(),
  price: real("price").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const tickers = sqliteTable("tickers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull().unique(),
  name: text("name"),
  lastPrice: real("last_price"),
  updatedAt: text("updated_at"),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Ticker = typeof tickers.$inferSelect;
