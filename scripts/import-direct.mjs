import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env.local") });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const transactions = JSON.parse(
  readFileSync(join(__dirname, "import-transactions.json"), "utf-8")
);

let count = 0;
for (const t of transactions) {
  await client.execute({
    sql: `INSERT INTO transactions (fecha, tipo, ticker, cantidad, precio_unitario, total, precio_usd, total_usd, broker, tc_usado, notas, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [
      String(t.fecha),
      t.tipo,
      String(t.ticker).toUpperCase(),
      Number(t.cantidad),
      Number(t.precioUnitario),
      Number(t.total),
      t.precioUSD != null ? Number(t.precioUSD) : null,
      t.totalUSD != null ? Number(t.totalUSD) : null,
      t.broker ?? null,
      t.tcUsado != null ? Number(t.tcUsado) : null,
      t.notas ?? null,
    ],
  });
  count++;
  process.stdout.write(`\r${count}/${transactions.length} importadas...`);
}

console.log(`\nListo: ${count} transacciones importadas.`);
client.close();
