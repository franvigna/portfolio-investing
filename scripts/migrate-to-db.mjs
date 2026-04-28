/**
 * Script: migra datos de data/*.json a Turso DB
 * Uso: node scripts/migrate-to-db.mjs
 */

import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env.local") });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Falta TURSO_DATABASE_URL o TURSO_AUTH_TOKEN en .env.local");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function main() {
  console.log("Conectando a Turso:", url);

  // 1. Crear tablas
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('Compra', 'Venta')),
      ticker TEXT NOT NULL,
      cantidad REAL NOT NULL,
      precio_unitario REAL NOT NULL,
      total REAL NOT NULL,
      precio_usd REAL,
      total_usd REAL,
      broker TEXT,
      tc_usado REAL,
      notas TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tickers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL UNIQUE,
      descripcion TEXT,
      categoria TEXT,
      precio_actual REAL,
      precio_actual_usd REAL,
      updated_at TEXT
    );
  `);
  console.log("Tablas creadas / ya existentes.");

  // 2. Leer JSONs
  const txs = JSON.parse(readFileSync(join(__dirname, "../data/transactions.json"), "utf8"));
  const tickers = JSON.parse(readFileSync(join(__dirname, "../data/tickers.json"), "utf8"));

  // 3. Insertar transacciones (ignorar duplicados por si se corre dos veces)
  console.log(`Insertando ${txs.length} transacciones...`);
  const existingTx = await client.execute("SELECT COUNT(*) as cnt FROM transactions");
  const txCount = existingTx.rows[0].cnt;

  if (txCount > 0) {
    console.log(`  Ya hay ${txCount} transacciones en la DB. Saltando insercion para evitar duplicados.`);
    console.log("  Si queres reemplazar, ejecuta: DELETE FROM transactions; antes de correr este script.");
  } else {
    for (const tx of txs) {
      await client.execute({
        sql: `INSERT INTO transactions (fecha, tipo, ticker, cantidad, precio_unitario, total, precio_usd, total_usd, broker, tc_usado, notas)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [tx.fecha, tx.tipo, tx.ticker, tx.cantidad, tx.precioUnitario, tx.total,
               tx.precioUSD ?? null, tx.totalUSD ?? null, tx.broker ?? null, tx.tcUsado ?? null, tx.notas ?? null],
      });
    }
    console.log(`  ${txs.length} transacciones insertadas.`);
  }

  // 4. Insertar/actualizar tickers
  console.log(`Insertando ${tickers.length} tickers...`);
  for (const t of tickers) {
    await client.execute({
      sql: `INSERT INTO tickers (symbol, descripcion, categoria, precio_actual, precio_actual_usd, updated_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(symbol) DO UPDATE SET
              descripcion = excluded.descripcion,
              categoria = excluded.categoria,
              precio_actual = excluded.precio_actual,
              precio_actual_usd = excluded.precio_actual_usd,
              updated_at = datetime('now')`,
      args: [t.symbol, t.descripcion ?? null, t.categoria ?? null, t.precioActual ?? null, t.precioActualUSD ?? null],
    });
  }
  console.log(`  ${tickers.length} tickers actualizados.`);

  // 5. Verificar
  const txResult = await client.execute("SELECT COUNT(*) as cnt FROM transactions");
  const tkResult = await client.execute("SELECT COUNT(*) as cnt FROM tickers");
  console.log(`\nVerificacion:`);
  console.log(`  Transactions en DB: ${txResult.rows[0].cnt}`);
  console.log(`  Tickers en DB:      ${tkResult.rows[0].cnt}`);
  console.log("\nMigracion completada.");
}

main().catch((e) => { console.error(e); process.exit(1); });
