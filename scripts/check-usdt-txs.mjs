import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env.local') });

const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const txs = await client.execute("SELECT id, fecha, tipo, ticker, cantidad, precio_unitario, total, broker FROM transactions WHERE ticker IN ('BTC', 'USDT') ORDER BY fecha, id");
for (const r of txs.rows) {
  console.log(`id=${r.id} ${r.fecha} ${r.tipo} ${r.ticker} cant=${r.cantidad} precio=${r.precio_unitario} total=${r.total} broker=${r.broker}`);
}
client.close();
