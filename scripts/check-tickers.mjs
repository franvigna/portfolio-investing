import { createClient } from "@libsql/client";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env.local") });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const result = await client.execute("SELECT symbol, categoria, precio_actual, precio_actual_usd FROM tickers ORDER BY categoria, symbol");
console.table(result.rows);
client.close();
