import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env.local') });

const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

// Eliminar las dos migraciones de Buenbit recien insertadas
const del = await client.execute("DELETE FROM transactions WHERE fecha = '2026-04-07' AND notas = 'Migracion desde Buenbit'");
console.log('Eliminadas:', del.rowsAffected, 'filas (migraciones Buenbit)');

// Revertir correccion del 20 May
const upd = await client.execute({
  sql: "UPDATE transactions SET cantidad = 66.35568, total = 66.35568 * precio_unitario WHERE fecha = '2026-05-21' AND ticker = 'USDT' AND tipo = 'Compra'",
  args: []
});
console.log('Revertido USDT 20 May, filas:', upd.rowsAffected);

// Verificar totales
const txs = await client.execute("SELECT tipo, ticker, cantidad FROM transactions WHERE ticker IN ('BTC', 'USDT') ORDER BY fecha");
let btc = 0, usdt = 0;
for (const r of txs.rows) {
  if (r.ticker === 'BTC') btc += r.tipo === 'Compra' ? Number(r.cantidad) : -Number(r.cantidad);
  if (r.ticker === 'USDT') usdt += r.tipo === 'Compra' ? Number(r.cantidad) : -Number(r.cantidad);
}
console.log('\nBTC:', btc.toFixed(8));
console.log('USDT:', usdt.toFixed(6));
client.close();
