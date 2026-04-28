// ---- Format helpers ----

export function fmtARS(n: number | null | undefined, compact = false): string {
  if (n == null) return "-";
  if (compact && Math.abs(n) >= 1_000_000)
    return "$" + (n / 1_000_000).toFixed(2) + "M";
  if (compact && Math.abs(n) >= 1_000)
    return "$" + (n / 1_000).toFixed(1) + "k";
  return "$" + Math.round(n).toLocaleString("es-AR");
}

export function fmtUSD(n: number | null | undefined): string {
  if (n == null) return "-";
  return "U$D " + n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtPct(n: number | null | undefined, sign = true): string {
  if (n == null) return "-";
  return (sign && n >= 0 ? "+" : "") + (n * 100).toFixed(2) + "%";
}

export function fmtQty(n: number): string {
  return n.toLocaleString("es-AR", { maximumFractionDigits: 6 });
}

export function colorG(n: number | null | undefined): string {
  if (n == null) return "text-gray-400";
  return n >= 0 ? "text-emerald-400" : "text-red-400";
}

export function fmtDate(d: string): string {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y.slice(2)}`;
}

// ---- Category colors ----

export const CAT_COLORS: Record<string, string> = {
  Cedear: "#6C63FF",
  ETF: "#3ECFCF",
  Cripto: "#F7931A",
  AccionArg: "#E040FB",
  FCI: "#29B6F6",
  "Sin categoria": "#78909C",
};

export function catColor(cat: string | null): string {
  return CAT_COLORS[cat ?? "Sin categoria"] ?? "#78909C";
}

// ---- Broker constants ----

export const BROKERS = ["Balanz", "BuenBit", "Nexo", "Cocos", "Otro"];

export const BROKER_COLORS: Record<string, string> = {
  Balanz: "#6C63FF",
  BuenBit: "#F7931A",
  Nexo: "#29B6F6",
  Cocos: "#3ECFCF",
  Otro: "#78909C",
  "Sin broker": "#4b5563",
};

// ---- Category tabs ----

export const CAT_TABS = ["Todo", "Cedear", "ETF", "Cripto", "AccionArg", "FCI"];

// ---- Time range filter ----

export type TimeRange = "30D" | "3M" | "6M" | "1Y" | "ALL";

export interface HistoryPoint {
  fecha: string;
  capitalARS: number;
  valuacionARS: number;
  capitalUSD?: number;
}

export function filterHistory(points: HistoryPoint[], range: TimeRange): HistoryPoint[] {
  if (range === "ALL" || points.length === 0) return points;
  const last = points[points.length - 1].fecha;
  const d = new Date(last);
  if (range === "30D") d.setDate(d.getDate() - 30);
  else if (range === "3M") d.setMonth(d.getMonth() - 3);
  else if (range === "6M") d.setMonth(d.getMonth() - 6);
  else if (range === "1Y") d.setFullYear(d.getFullYear() - 1);
  const cutoff = d.toISOString().split("T")[0];
  return points.filter((p) => p.fecha >= cutoff);
}

// ---- Variables type ----

export interface Variables {
  usdMep: number | null;
  usdt: number | null;
  fechaActualizacion: string | null;
}
