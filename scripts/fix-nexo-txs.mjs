import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env.local') });

const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

// Precios de mercado del 7 de abril 2026
// BTC: ~$83.000 USD, MEP ~$1.457 ARS
// USDT: $1 USD, MEP ~$1.457 ARS
const MEP_7APR = 1457.03;
const BTC_USD_7APR = 83000;
const BTC_ARS_7APR = BTC_USD_7APR * MEP_7APR; // ~121.033.490

// 1. Agregar migracion Buenbit: 152.771396 USDT
await client.execute({
  sql: `INSERT INTO transactions (fecha, tipo, ticker, cantidad, precio_unitario, total, precio_usd, total_usd, broker, notas)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  args: [
    '2026-04-07', 'Compra', 'USDT',
    152.771396, MEP_7APR, 152.771396 * MEP_7APR,
    1, 152.771396,
    'Nexo', 'Migracion desde Buenbit'
  ]
});
console.log('Agregado: +152.771396 USDT (migracion Buenbit)');

// 2. Agregar migracion Buenbit: 0.00213157 BTC
await client.execute({
  sql: `INSERT INTO transactions (fecha, tipo, ticker, cantidad, precio_unitario, total, precio_usd, total_usd, broker, notas)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  args: [
    '2026-04-07', 'Compra', 'BTC',
    0.00213157, BTC_ARS_7APR, 0.00213157 * BTC_ARS_7APR,
    BTC_USD_7APR, 0.00213157 * BTC_USD_7APR,
    'Nexo', 'Migracion desde Buenbit'
  ]
});
console.log('Agregado: +0.00213157 BTC (migracion Buenbit)');

// 3. Corregir cantidad USDT 20 May: 66.35568 -> 66.366613
const result = await client.execute({
  sql: `UPDATE transactions SET cantidad = 66.366613, total = 66.366613 * precio_unitario
        WHERE fecha = '2026-05-21' AND ticker = 'USDT' AND tipo = 'Compra'`,
  args: []
});
console.log('Corregido: USDT 20 May cantidad 66.35568 -> 66.366613, filas afectadas:', result.rowsAffected);

// Verificar totales
const txs = await client.execute("SELECT tipo, ticker, cantidad FROM transactions WHERE ticker IN ('BTC', 'USDT') ORDER BY fecha, id");
let btc = 0, usdt = 0;
for (const r of txs.rows) {
  if (r.ticker === 'BTC') btc += r.tipo === 'Compra' ? Number(r.cantidad) : -Number(r.cantidad);
  if (r.ticker === 'USDT') usdt += r.tipo === 'Compra' ? Number(r.cantidad) : -Number(r.cantidad);
}
console.log('\nBTC total:', btc.toFixed(8), '(Nexo: 0.00744454)');
console.log('USDT total:', usdt.toFixed(6), '(Nexo: 209.678657)');

client.close();
