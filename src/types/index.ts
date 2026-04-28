// Tipos compartidos entre servidor y cliente

export type TransactionType = "Compra" | "Venta";

export interface Transaction {
  id: number;
  fecha: string;
  tipo: TransactionType;
  ticker: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  precioUSD: number | null;
  totalUSD: number | null;
  broker: string | null;
  tcUsado: number | null;
  notas: string | null;
}

export interface Posicion {
  ticker: string;
  descripcion: string | null;
  categoria: string | null;
  cantidad: number;
  promedioCompraARS: number;
  promedioVentaARS: number;
  capitalInvertidoARS: number;
  precioActualARS: number | null;
  valuacionARS: number | null;
  gananciaARS: number | null;
  gananciaPctARS: number | null;
  promedioCompraUSD: number | null;
  promedioVentaUSD: number | null;
  capitalInvertidoUSD: number | null;
  precioActualUSD: number | null;
  valuacionUSD: number | null;
  gananciaUSD: number | null;
  gananciaPctUSD: number | null;
  tenenciaPctARS: number | null;
}

export interface ResumenCartera {
  capitalTotalARS: number;
  valuacionTotalARS: number | null;
  gananciaTotalARS: number | null;
  rendimientoPctARS: number | null;
  capitalTotalUSD: number | null;
  valuacionTotalUSD: number | null;
  gananciaTotalUSD: number | null;
  rendimientoPctUSD: number | null;
}

export interface PortfolioData {
  posiciones: Posicion[];
  resumen: ResumenCartera;
  categorias: { categoria: string; capital: number; pct: number }[];
}

export interface HistoryPoint {
  fecha: string;
  capitalARS: number;
  valuacionARS: number;
  capitalUSD?: number;
}
