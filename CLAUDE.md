@AGENTS.md

# Portfolio Investing

Aplicación web privada fullstack para seguimiento de cartera de inversiones en activos financieros (Cedears, ETFs, criptomonedas, acciones argentinas, FCI). Acceso restringido por whitelist de emails via Google OAuth.

Documentacion detallada:
- Funcionalidades completas: [requirements.md](requirements.md)
- Arquitectura y decisiones tecnicas: [architecture.md](architecture.md)

## Resumen tecnico

**Stack:** Next.js 16 (App Router) + React 19 + TypeScript 5 + Tailwind CSS 4 + Drizzle ORM + Turso (SQLite) + NextAuth v5

**Base de datos:** Turso con tres tablas — `transactions` (registro de compras/ventas), `tickers` (activos con precios actuales) y `variables` (cotizaciones USD MEP y USDT). Las cotizaciones se actualizan automáticamente al guardar cualquier transacción.

**Autenticacion:** Google OAuth con whitelist de emails en `ALLOWED_EMAILS`. El middleware en `middleware.ts` protege todas las rutas. La logica vive en `src/auth.ts`.

**Logica de negocio:** `src/lib/portfolio.ts` calcula PPC, valuacion y ganancias (ARS y USD). `src/lib/calcularTx.ts` calcula campos derivados al guardar transacciones (llama a dolarapi en tiempo real). `src/lib/storage.ts` centraliza todo acceso a datos. `src/lib/format.ts` tiene formateo de moneda y fechas.

**Dashboard:** Un solo Client Component (`src/app/page.tsx`) maneja todo el estado, incluyendo el toggle global `moneda: "ARS" | "USD"` que pasa como prop a todos los componentes de visualizacion. Los datos calculados (posiciones filtradas, graficos, analisis por broker) se derivan con `useMemo`.

**APIs externas:** dolarapi.com (USD MEP y USDT), CoinGecko (precios cripto), ArgentinaDatos (tasas historicas para reconstruccion de historial).

## Variables de entorno requeridas

```
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
ALLOWED_EMAILS
TURSO_DATABASE_URL
TURSO_AUTH_TOKEN
```

## Comandos clave

```bash
npm run dev          # desarrollo local
npm run build        # build de produccion
npm run db:push      # aplica schema en Turso sin migraciones
npm run db:generate  # genera migraciones SQL
npm run db:studio    # UI de base de datos
node scripts/migrate-to-db.mjs  # migra JSONs locales a Turso
```
