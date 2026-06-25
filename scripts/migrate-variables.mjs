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

// Crear tabla
await client.execute(`
  CREATE TABLE IF NOT EXISTS variables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usd_mep REAL,
    usdt REAL,
    fecha_actualizacion TEXT
  )
`);

// Leer datos actuales del JSON
const vars = JSON.parse(readFileSync(join(__dirname, "../data/variables.json"), "utf-8"));

// Insertar si no hay filas
const existing = await client.execute("SELECT COUNT(*) as count FROM variables");
if (existing.rows[0].count === 0) {
  await client.execute({
    sql: "INSERT INTO variables (usd_mep, usdt, fecha_actualizacion) VALUES (?, ?, ?)",
    args: [vars.usdMep ?? null, vars.usdt ?? null, vars.fechaActualizacion ?? null],
  });
  console.log("Variables migradas:", vars);
} else {
  console.log("Ya existe una fila en variables, actualizando...");
  await client.execute({
    sql: "UPDATE variables SET usd_mep = ?, usdt = ?, fecha_actualizacion = ? WHERE id = 1",
    args: [vars.usdMep ?? null, vars.usdt ?? null, vars.fechaActualizacion ?? null],
  });
}

console.log("Listo.");
client.close();
