# Architecture

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| Lenguaje | TypeScript 5 (strict) |
| ORM | Drizzle ORM 0.45.2 |
| Base de datos | Turso (SQLite distribuida) |
| Autenticación | NextAuth v5 (beta) |
| Gráficos | Recharts 3 |
| Deploy target | Vercel (serverless) |

---

## Estructura de directorios

```
src/
  app/                  # Rutas Next.js (App Router)
    api/                # API Routes (serverless functions)
      auth/[...nextauth]/
      export/
      import/
      portfolio/
        history/
      tickers/
      transactions/
        [id]/
      variables/
        cotizaciones/
    login/
    layout.tsx
    page.tsx            # Dashboard principal (client component)
  components/           # Componentes React
  db/                   # Configuración de Drizzle + schema
  lib/                  # Lógica de negocio y utilidades
  types/                # Tipos TypeScript compartidos
  auth.ts               # Configuración NextAuth
data/                   # JSONs locales (variables.json, seeds)
scripts/                # Scripts de setup y migración
drizzle/                # Migraciones SQL generadas por Drizzle Kit
```

---

## Base de datos

### Turso (SQLite remoto)
Instancia única compartida. Singleton de conexión en `src/db/index.ts` para evitar múltiples conexiones en serverless.

### Tabla `transactions`

| Columna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | autoincrement |
| fecha | TEXT NOT NULL | formato YYYY-MM-DD |
| tipo | TEXT NOT NULL | "Compra" o "Venta" |
| ticker | TEXT NOT NULL | siempre mayúsculas |
| cantidad | REAL NOT NULL | |
| precioUnitario | REAL NOT NULL | en ARS |
| total | REAL NOT NULL | en ARS |
| precioUSD | REAL | nullable |
| totalUSD | REAL | nullable |
| broker | TEXT | nullable |
| tcUsado | REAL | nullable — tipo de cambio al momento de la operación |
| notas | TEXT | nullable |
| createdAt | TEXT NOT NULL | timestamp ISO |

### Tabla `tickers`

| Columna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | autoincrement |
| symbol | TEXT NOT NULL UNIQUE | |
| descripcion | TEXT | nullable |
| categoria | TEXT | nullable — Cedear, ETF, Cripto, AccionArg, FCI |
| precioActual | REAL | nullable — precio en ARS |
| precioActualUSD | REAL | nullable |
| updatedAt | TEXT | nullable — timestamp de última actualización |

### Tabla `variables`

Cotizaciones vigentes en Turso: `usdMep`, `usdt`, `fechaActualizacion`. Fila única (id=1), actualizada por `saveVariables()`.

Se actualiza automáticamente al guardar cualquier transacción (efecto secundario de `calcularCamposDerivados`).

---

## Autenticación

NextAuth v5 configurado en `src/auth.ts`:
- Proveedor: Google OAuth
- Callback `signIn`: valida email contra `ALLOWED_EMAILS`
- Callback `authorized`: protege rutas — permite `/login` y `/api/auth/*` sin sesión, el resto requiere sesión activa
- Redirección de error a `/login`

El middleware (`middleware.ts`) exporta directamente el handler de auth de NextAuth. El matcher excluye assets estáticos, imágenes y favicon.

---

## Capa de acceso a datos: `src/lib/storage.ts`

Todas las operaciones de BD pasan por esta capa. Nunca se llama a Drizzle directamente desde las API Routes.

| Función | Descripción |
|---|---|
| `getTransactions()` | SELECT todas, orden DESC por fecha |
| `addTransaction(data)` | INSERT, retorna registro con ID |
| `deleteTransaction(id)` | DELETE por ID, retorna boolean |
| `updateTransaction(id, data)` | UPDATE parcial, retorna objeto o null |
| `getTickers()` | SELECT todos |
| `updateTickerPrice(symbol, data)` | UPDATE precios por symbol |
| `getVariables()` | Lee cotizaciones desde tabla `variables` en Turso |
| `saveVariables(data)` | Upsert de cotizaciones en tabla `variables` |

---

## Lógica de negocio: `src/lib/portfolio.ts`

### `calcularPortfolio(transactions, tickers, variables): PortfolioData`

Calcula el estado completo de la cartera a partir de los datos crudos.

**Flujo:**
1. Agrupa transacciones por ticker
2. Para cada ticker: suma compras, resta ventas → cantidad actual y totales invertidos
3. Compras con `total = 0` (splits/bonificaciones) suman cantidad pero no afectan el PPC
4. Filtra posiciones con `cantidad > 0.0001` (posición activa)
5. Para cada posición activa:
   - PPC = total_comprado / cantidad_comprada (promedio ponderado)
   - Capital invertido = cantidad_actual * PPC
   - Valuación = cantidad_actual * precioActual (si existe)
   - Ganancia = valuación - capital_invertido
   - Tenencia % = capital_posición / capital_total
6. Calcula resumen total (ARS y USD)
7. Agrupa por categoría con porcentajes

**Conversión USD:** Usa `totalUSD` guardado en la transacción. Si no existe (datos históricos), fallback: `capitalInvertidoARS / dollarRate` con el TC actual. Garantiza que `capitalTotalUSD` nunca sea null cuando hay precios actualizados.

### `calcularCamposDerivados(ticker, precioUnitario, cantidad)` — `src/lib/calcularTx.ts`

Llamado por POST y PUT de transacciones. Llama a dolarapi.com en tiempo real, calcula `total`, `precioUSD`, `totalUSD` y `tcUsado` según la categoría del ticker. Actualiza la tabla `variables` como efecto secundario (sin bloquear la respuesta).

---

## API Routes

Todas las rutas son serverless functions. Las de lectura/escritura usan `dynamic = "force-dynamic"` para no cachear.

### Transacciones
- `GET /api/transactions` — lista todas ordenadas por fecha
- `POST /api/transactions` — crea una nueva con 6 campos (fecha, tipo, ticker, cantidad, precioUnitario, broker); total/precioUSD/totalUSD/tcUsado se calculan via `calcularCamposDerivados`
- `DELETE /api/transactions/[id]` — elimina por ID
- `PUT /api/transactions/[id]` — edita; recalcula campos derivados igual que POST

### Cartera
- `GET /api/portfolio` — ejecuta `calcularPortfolio()` y retorna `PortfolioData`
- `GET /api/portfolio/history` — recalcula cartera en cada fecha de transacción, fetcha tasas históricas desde ArgentinaDatos como fallback

### Tickers
- `GET /api/tickers` — lista todos los tickers
- `POST /api/tickers` — actualiza precios (acepta array o objeto `{ symbol, precioActual, precioActualUSD }`)

### Variables
- `GET /api/variables` — retorna `{ usdMep, usdt, fechaActualizacion }`
- `PUT /api/variables` — actualiza campos parcialmente
- `POST /api/variables/cotizaciones` — fetcha APIs externas (dolarapi + CoinGecko), actualiza tickers cripto y variables

### Importación / Exportación
- `POST /api/import` — inserta array de transacciones en bulk
- `GET /api/export` — descarga todas las transacciones como JSON adjunto

---

## Tipos compartidos: `src/types/index.ts`

```typescript
Transaction         // Fila de BD con campos opcionales
Posicion            // Posición calculada con PPC, valuación, ganancia (ARS y USD)
ResumenCartera      // Totales agregados de la cartera
PortfolioData       // { posiciones, resumen, categorias }
HistoryPoint        // { fecha, capitalARS, valuacionARS, capitalUSD }
```

---

## Componentes

### Estructura del dashboard (`page.tsx`)

```
page.tsx (client)
  ├── Sidebar                  — navegación, cotizaciones, acciones
  ├── PortfolioHeader          — valuación total + ganancia histórica
  ├── ChartsRow
  │     ├── Gráfico de área   — evolución temporal (Recharts AreaChart)
  │     └── Gráfico donut     — asignación por categoría (Recharts PieChart)
  ├── ActivosTable             — posiciones activas con filtros y ordenamiento
  │     └── FooterTotales     — fila de totales al pie
  ├── TransaccionesTable       — transacciones con búsqueda
  │     └── TxRow             — fila con edición y borrado inline
  ├── BrokerPanel              — panel lateral de análisis por broker
  ├── ModalNuevaTx             — formulario de nueva transacción
  └── ModalPrecios             — formulario de actualización de precios
```

### Patrones de componentes
- Todos los componentes del dashboard son Client Components (`"use client"`)
- El estado global de la aplicación vive en `page.tsx` como estados de React
- Los datos calculados (posiciones filtradas, datos de gráficos, análisis de brokers) se derivan con `useMemo`
- Cada modal recibe callback `onSaved` que dispara re-fetch de los datos necesarios
- `ModalNuevaTx` funciona en dos modos: creación (POST) y edición (PUT) según si recibe prop `transaccion`

---

## Estado del dashboard

```typescript
// Estado de datos
portfolio: PortfolioData | null
transactions: Transaction[]
history: HistoryPoint[]
variables: Variables | null
loading: boolean
fetchingRates: boolean

// Estado de UI
showModal: boolean          // ModalNuevaTx
showPrecios: boolean        // ModalPrecios
showBrokerPanel: boolean    // BrokerPanel
showTx: boolean             // Vista activos vs transacciones
timeRange: TimeRange        // Filtro de gráfico
catFilter: string           // Filtro de categoría
txSearch: string            // Búsqueda de transacciones
sort: { field, dir } | null // Ordenamiento de tabla
moneda: "ARS" | "USD"       // Toggle global de moneda

// Derivados (useMemo)
filteredPos: Posicion[]     // posiciones filtradas por categoría y ordenadas
filteredTx: Transaction[]   // transacciones filtradas por búsqueda
chartData: ChartPoint[]     // history filtrada con labels
donutData: DonutItem[]      // categorías con colores para el gráfico
brokerAnalysis: BrokerItem[]
```

---

## Utilidades: `src/lib/format.ts`

| Función | Descripción |
|---|---|
| `fmtARS(n, compact?)` | Formato moneda ARS, con opción compacto (1,2M) |
| `fmtUSD(n)` | Formato USD con prefijo U$D |
| `fmtPct(n, sign?)` | Porcentaje con signo opcional |
| `fmtQty(n)` | Cantidad con hasta 6 decimales |
| `fmtDate(d)` | YYYY-MM-DD → DD/MM/YY |
| `colorG(n)` | Clase Tailwind de color según signo del número |
| `filterHistory(points, range)` | Filtra HistoryPoints según TimeRange |

**Constantes:**
- `CAT_TABS` — orden de categorías en tabs
- `CAT_COLORS` — colores por categoría para gráficos
- `BROKERS` — lista de brokers disponibles
- `BROKER_COLORS` — colores por broker

---

## Flujos principales

### Crear / editar transacción
```
User → ModalNuevaTx (6 campos) → POST o PUT /api/transactions[/id]
→ calcularCamposDerivados()
    → fetch dolarapi.com (tiempo real)
    → determina TC según categoría del ticker
    → calcula total, precioUSD, totalUSD, tcUsado
    → saveVariables() en background (actualiza cotizaciones)
→ addTransaction() / updateTransaction() → Turso
→ onSaved() → re-fetch portfolio + transactions + history
→ UI actualizada
```

### Actualizar cotizaciones
```
User → Sidebar "Cotizaciones" → POST /api/variables/cotizaciones
→ fetch dolarapi.com (MEP, USDT)
→ fetch CoinGecko (cripto USD)
→ updateTickerPrice() para cada cripto
→ saveVariables() con nuevos MEP/USDT
→ re-fetch portfolio + history → UI actualizada
```

### Calcular historial
```
GET /api/portfolio/history
→ getTransactions() ordenadas por fecha ASC
→ para cada fecha única:
    → recalcula holdings hasta esa fecha
    → fetcha tasa histórica desde ArgentinaDatos (fallback: tcUsado → usdt/mep actual)
    → agrega HistoryPoint { fecha, capitalARS, valuacionARS, capitalUSD }
→ si hoy no está en el historial, agrega punto con valuación actual
→ retorna array de HistoryPoints
```

---

## Scripts de setup

| Script | Descripción |
|---|---|
| `npm run db:generate` | Genera migraciones SQL desde el schema |
| `npm run db:migrate` | Aplica migraciones en Turso |
| `npm run db:push` | Push directo del schema (sin migraciones) |
| `npm run db:studio` | Abre Drizzle Studio (UI de BD) |
| `node scripts/migrate-to-db.mjs` | Migra datos de JSONs locales a Turso |

---

## Deploy

**Target:** Vercel (serverless)

**Requisitos:**
1. Variables de entorno configuradas en el panel de Vercel
2. Tablas creadas en Turso (`npm run db:push` o `npm run db:migrate`)
3. `middleware.ts` en la raíz para protección de rutas con NextAuth

**Sin configuración especial:** `vercel.json` no es necesario. Vercel detecta Next.js automáticamente.
