import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env.local') });

const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const txs = await client.execute("SELECT fecha, tipo, ticker, cantidad, precio_unitario, total, total_usd FROM transactions WHERE ticker IN ('BTC', 'USDT') ORDER BY fecha");
let btc = 0, usdt = 0;
for (const r of txs.rows) {
  if (r.ticker === 'BTC') btc += r.tipo === 'Compra' ? Number(r.cantidad) : -Number(r.cantidad);
  if (r.ticker === 'USDT') usdt += r.tipo === 'Compra' ? Number(r.cantidad) : -Number(r.cantidad);
  console.log(r.fecha, r.tipo, r.ticker, 'cant:', r.cantidad, 'total_ars:', r.total);
}
console.log('\nBTC actual:', btc.toFixed(8));
console.log('USDT actual:', usdt.toFixed(2));
console.log('BTC precio DB: 91775307 ARS => valuacion:', (btc * 91775307).toFixed(0), 'ARS');
console.log('USDT precio DB: 1511.7 => valuacion:', (usdt * 1511.7).toFixed(0), 'ARS');
console.log('Total cripto ARS:', (btc * 91775307 + usdt * 1511.7).toFixed(0));
client.close();
