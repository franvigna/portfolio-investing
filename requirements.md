# Requirements

Aplicación web privada de seguimiento de cartera de inversiones en activos financieros argentinos e internacionales. Acceso restringido por whitelist de emails via Google OAuth.

---

## Funcionalidades

### Autenticación y acceso
- Login exclusivo con cuenta Google (OAuth)
- Whitelist de emails permitidos via variable de entorno `ALLOWED_EMAILS`
- Si `ALLOWED_EMAILS` está vacío, acepta cualquier cuenta Google
- Redirección automática: usuario autenticado va a `/`, usuario sin sesión va a `/login`
- Todas las rutas excepto `/login` y `/api/auth/*` requieren sesión activa

### Dashboard principal
- Visualización central del estado de la cartera en tiempo real
- Header con valuación total en ARS y equivalente en USD
- Muestra ganancia histórica total (ARS y porcentaje)
- Dos vistas alternables: Activos o Transacciones
- Filtro por categoría de activo: Todo, Cedear, ETF, Cripto, AccionArg, FCI
- Ordenamiento de columnas en tabla de activos (click doble para cambiar dirección, triple para limpiar)

### Gestión de transacciones
- Crear transacción con: fecha, tipo (Compra/Venta), ticker, cantidad, precio ARS, total ARS, precio USD, total USD, tipo de cambio usado, broker y notas
- El total ARS se calcula automáticamente al ingresar cantidad y precio
- El total USD se calcula automáticamente al ingresar precio USD
- Eliminar transacción con confirmación inline (Sí/No)
- Búsqueda de transacciones por ticker o broker
- Importar transacciones en bulk (array JSON via API)
- Exportar todas las transacciones como archivo JSON con fecha en el nombre

### Cálculo de cartera (PPC y valuación)
- Promedio ponderado de compra (PPC) calculado dinámicamente a partir de las transacciones
- Las ventas reducen la cantidad pero no afectan el PPC de compra
- Capital invertido = cantidad actual * PPC
- Valuación = cantidad actual * precio actual
- Ganancia ARS y USD por posición
- Porcentaje de ganancia por posición
- Tenencia porcentual de cada posición sobre el capital total
- Posiciones con cantidad <= 0.0001 se consideran cerradas y no se muestran
- Para activos sin precio informado, la valuación y ganancia quedan como null

### Multi-divisa
- Todas las posiciones se muestran en ARS y USD en simultáneo
- Para cripto, la tasa de conversión es `variables.usdt`
- Para el resto, la tasa es `variables.usdMep`
- Si una transacción no tiene `totalUSD`, se calcula a partir del total ARS y la tasa correspondiente

### Actualización de cotizaciones
- Botón en sidebar para actualizar cotizaciones automaticamente
- Fetcha USD MEP y USDT desde `dolarapi.com`
- Fetcha precios de criptomonedas en USD desde CoinGecko
- Calcula precios ARS de cripto: `precioUSD * usdt`
- USDT siempre vale 1 USD = valor de `variables.usdt`
- Criptos soportadas: BTC, ETH, BNB, SOL, ADA, DOT, AVAX, USDT
- Actualización manual de cotizaciones MEP y USDT tambien disponible

### Actualización de precios de activos
- Modal con listado de todas las posiciones activas
- Input de precio ARS por activo (pre-relleno con precio actual)
- El precio USD se calcula automáticamente usando MEP o USDT según categoría

### Análisis por broker
- Panel lateral derecho con desglose por broker
- Para cada broker: capital invertido, valuación actual, ganancia, porcentaje del capital total
- Barra de progreso proporcional al capital
- Badges de tickers que tiene ese broker
- Brokers disponibles: Balanz, BuenBit, Nexo, Cocos, Otro

### Historial y gráficos
- Historial de valuación de cartera recalculado desde cada transacción en adelante
- Para fechas sin tipo de cambio informado, usa API de ArgentinaDatos como fallback
- Gráfico de área con dos líneas: valuación (verde) y capital invertido (violet)
- Filtros de rango temporal: 30D, 3M, 6M, 1Y, ALL
- Gráfico donut de asignación de cartera por categoría con porcentajes
- Footer del gráfico donut muestra totales USD: capital, valuación y ganancia

### Categorías de activos
- Cedear: certificados de depósito argentinos que replican acciones extranjeras
- ETF: fondos cotizados
- Cripto: criptomonedas
- AccionArg: acciones de empresas argentinas
- FCI: fondos comunes de inversión

---

## Variables de entorno requeridas

| Variable | Descripción |
|---|---|
| `AUTH_GOOGLE_ID` | Client ID de Google OAuth |
| `AUTH_GOOGLE_SECRET` | Client Secret de Google OAuth |
| `ALLOWED_EMAILS` | Emails autorizados separados por coma |
| `TURSO_DATABASE_URL` | URL de la base de datos Turso |
| `TURSO_AUTH_TOKEN` | Token de autenticación Turso |

---

## APIs externas consumidas

| API | Propósito |
|---|---|
| `dolarapi.com` | Cotizaciones USD MEP y USDT |
| `api.coingecko.com` | Precios de criptomonedas en USD |
| `api.argentinadatos.com` | Historial de tasas de cambio para reconstrucción de history |
