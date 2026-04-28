import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle>;
let _db: Db | null = null;

export function getDb(): Db {
  if (_db) return _db;
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL no esta configurado");
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  _db = drizzle(client, { schema });
  return _db;
}
