import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env.local') });

const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

// Precios de Yahoo Finance para verificar
const symbols = ['AAPL','AMD','MELI','META','MSFT','NVDA','QQQ','SPY','GGAL','BMA','LOMA','PAM','YPF'];
for (const sym of symbols) {
  try {
    const r = await fetch(`https://query2.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const d = await r.json();
    const price = d?.chart?.result?.[0]?.meta?.regularMarketPrice;
    console.log(`${sym}: $${price} USD`);
  } catch (e) {
    console.log(`${sym}: ERROR`);
  }
}

const vars = await client.execute('SELECT usd_mep FROM variables LIMIT 1');
const mep = vars.rows[0].usd_mep;
console.log('\nMEP actual en DB:', mep);

// Ratios actuales en codigo
const ratios = { AAPL:20, AMD:10, MELI:120, META:24, MSFT:30, NVDA:24, QQQ:20, SPY:60, GGAL:10, BMA:10, LOMA:5, PAMP:25, YPFD:1 };
const yahoo = { GGAL:'GGAL', PAMP:'PAM', YPFD:'YPF', LOMA:'LOMA' };

console.log('\nFormula: precio_ars = precio_usd_yahoo * mep / ratio');

client.close();
