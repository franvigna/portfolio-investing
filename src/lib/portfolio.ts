import type { Posicion, ResumenCartera, PortfolioData } from "@/types";
import { Transaction, Ticker, Variables } from "./storage";

export type { Posicion, ResumenCartera, PortfolioData };

export function calcularPortfolio(
  transactions: Transaction[],
  tickers: Ticker[],
  variables: Variables
): PortfolioData {
  const tickerMap = new Map<string, Ticker>(tickers.map((t) => [t.symbol, t]));

  // Group by ticker
  const byTicker = new Map<
    string,
    {
      cantidadActual: number;
      // buys
      totalCompradoARS: number;
      totalCompradoCantidad: number;
      totalCompradoUSD: number;
      totalCompradoCantidadUSD: number;
      // sells
      totalVendidoARS: number;
      totalVendidoCantidad: number;
      totalVendidoUSD: number;
      totalVendidoCantidadUSD: number;
    }
  >();

  for (const tx of transactions) {
    if (!byTicker.has(tx.ticker)) {
      byTicker.set(tx.ticker, {
        cantidadActual: 0,
        totalCompradoARS: 0,
        totalCompradoCantidad: 0,
        totalCompradoUSD: 0,
        totalCompradoCantidadUSD: 0,
        totalVendidoARS: 0,
        totalVendidoCantidad: 0,
        totalVendidoUSD: 0,
        totalVendidoCantidadUSD: 0,
      });
    }
    const acc = byTicker.get(tx.ticker)!;

    if (tx.tipo === "Compra") {
      acc.cantidadActual += tx.cantidad;
      if (tx.total > 0) {
        // Compra normal: suma al numerador y denominador del PPC
        acc.totalCompradoARS += tx.total;
        acc.totalCompradoCantidad += tx.cantidad;
        if (tx.totalUSD !== null && tx.precioUSD !== null) {
          acc.totalCompradoUSD += tx.totalUSD;
          acc.totalCompradoCantidadUSD += tx.cantidad;
        }
      } else {
        // Split/bonificacion (total = 0): solo suma al denominador para bajar el PPC
        acc.totalCompradoCantidad += tx.cantidad;
        if (acc.totalCompradoCantidadUSD > 0) {
          acc.totalCompradoCantidadUSD += tx.cantidad;
        }
      }
    } else {
      acc.cantidadActual -= tx.cantidad;
      acc.totalVendidoARS += tx.total;
      acc.totalVendidoCantidad += tx.cantidad;
      if (tx.totalUSD !== null && tx.precioUSD !== null) {
        acc.totalVendidoUSD += tx.totalUSD;
        acc.totalVendidoCantidadUSD += tx.cantidad;
      }
    }
  }

  const posiciones: Posicion[] = [];

  for (const [symbol, acc] of byTicker.entries()) {
    // Only show current holdings (cantidad > 0.0001 to handle float rounding)
    if (acc.cantidadActual < 0.0001) continue;

    const ticker = tickerMap.get(symbol);
    const promedioCompraARS =
      acc.totalCompradoCantidad > 0
        ? acc.totalCompradoARS / acc.totalCompradoCantidad
        : 0;
    const promedioVentaARS =
      acc.totalVendidoCantidad > 0
        ? acc.totalVendidoARS / acc.totalVendidoCantidad
        : 0;
    const capitalInvertidoARS = acc.cantidadActual * promedioCompraARS;

    const promedioCompraUSD =
      acc.totalCompradoCantidadUSD > 0
        ? acc.totalCompradoUSD / acc.totalCompradoCantidadUSD
        : null;
    const promedioVentaUSD =
      acc.totalVendidoCantidadUSD > 0
        ? acc.totalVendidoUSD / acc.totalVendidoCantidadUSD
        : null;
    const precioActualARS = ticker?.precioActual ?? null;
    // Compute USD from ARS using the correct dollar for each category
    const dollarRate =
      (ticker?.categoria === "Cripto")
        ? (variables.usdt ?? 1)
        : (variables.usdMep ?? 1);

    const capitalInvertidoUSD =
      promedioCompraUSD !== null
        ? acc.cantidadActual * promedioCompraUSD
        // Fallback para transacciones históricas sin totalUSD: convertir capital ARS con TC actual
        : dollarRate > 0
          ? capitalInvertidoARS / dollarRate
          : null;
    const precioActualUSD =
      precioActualARS !== null ? precioActualARS / dollarRate : null;

    const valuacionARS =
      precioActualARS !== null ? acc.cantidadActual * precioActualARS : null;
    const gananciaARS =
      valuacionARS !== null ? valuacionARS - capitalInvertidoARS : null;
    const gananciaPctARS =
      gananciaARS !== null && capitalInvertidoARS > 0
        ? gananciaARS / capitalInvertidoARS
        : null;

    const valuacionUSD =
      precioActualUSD !== null ? acc.cantidadActual * precioActualUSD : null;
    const gananciaUSD =
      valuacionUSD !== null && capitalInvertidoUSD !== null
        ? valuacionUSD - capitalInvertidoUSD
        : null;
    const gananciaPctUSD =
      gananciaUSD !== null &&
      capitalInvertidoUSD !== null &&
      capitalInvertidoUSD > 0
        ? gananciaUSD / capitalInvertidoUSD
        : null;

    posiciones.push({
      ticker: symbol,
      descripcion: ticker?.descripcion ?? null,
      categoria: ticker?.categoria ?? null,
      cantidad: acc.cantidadActual,
      promedioCompraARS,
      promedioVentaARS,
      capitalInvertidoARS,
      precioActualARS,
      valuacionARS,
      gananciaARS,
      gananciaPctARS,
      promedioCompraUSD,
      promedioVentaUSD,
      capitalInvertidoUSD,
      precioActualUSD,
      valuacionUSD,
      gananciaUSD,
      gananciaPctUSD,
      tenenciaPctARS: null, // calculated after
    });
  }

  // Sort by capitalInvertidoARS desc
  posiciones.sort((a, b) => b.capitalInvertidoARS - a.capitalInvertidoARS);

  // Totals
  const capitalTotalARS = posiciones.reduce(
    (s, p) => s + p.capitalInvertidoARS,
    0
  );
  const posicionesConValuacion = posiciones.filter((p) => p.valuacionARS !== null);
  const valuacionTotalARS =
    posicionesConValuacion.length === posiciones.length
      ? posiciones.reduce((s, p) => s + p.valuacionARS!, 0)
      : posiciones.reduce((s, p) => s + (p.valuacionARS ?? p.capitalInvertidoARS), 0);

  const gananciaTotalARS = valuacionTotalARS - capitalTotalARS;
  const rendimientoPctARS =
    capitalTotalARS > 0 ? gananciaTotalARS / capitalTotalARS : null;

  const capitalTotalUSD = posiciones.every((p) => p.capitalInvertidoUSD !== null)
    ? posiciones.reduce((s, p) => s + (p.capitalInvertidoUSD ?? 0), 0)
    : null;
  const valuacionTotalUSD = posiciones.every((p) => p.valuacionUSD !== null)
    ? posiciones.reduce((s, p) => s + (p.valuacionUSD ?? 0), 0)
    : null;
  const gananciaTotalUSD =
    valuacionTotalUSD !== null && capitalTotalUSD !== null
      ? valuacionTotalUSD - capitalTotalUSD
      : null;
  const rendimientoPctUSD =
    gananciaTotalUSD !== null && capitalTotalUSD !== null && capitalTotalUSD > 0
      ? gananciaTotalUSD / capitalTotalUSD
      : null;

  // Tenencia %
  for (const p of posiciones) {
    p.tenenciaPctARS =
      capitalTotalARS > 0 ? p.capitalInvertidoARS / capitalTotalARS : null;
  }

  // Categorias
  const catMap = new Map<string, number>();
  for (const p of posiciones) {
    const cat = p.categoria ?? "Sin categoria";
    catMap.set(cat, (catMap.get(cat) ?? 0) + p.capitalInvertidoARS);
  }
  const categorias = Array.from(catMap.entries())
    .map(([categoria, capital]) => ({
      categoria,
      capital,
      pct: capitalTotalARS > 0 ? capital / capitalTotalARS : 0,
    }))
    .sort((a, b) => b.capital - a.capital);

  return {
    posiciones,
    resumen: {
      capitalTotalARS,
      valuacionTotalARS,
      gananciaTotalARS,
      rendimientoPctARS,
      capitalTotalUSD,
      valuacionTotalUSD,
      gananciaTotalUSD,
      rendimientoPctUSD,
    },
    categorias,
  };
}
