"use client";

import { fmtARS, fmtUSD, fmtPct, colorG } from "@/lib/format";
import type { Posicion, ResumenCartera } from "@/types";

export function FooterTotales({
  posiciones,
  resumen,
  esFiltrado,
  moneda,
}: {
  posiciones: Posicion[];
  resumen: ResumenCartera | undefined;
  esFiltrado: boolean;
  moneda: "ARS" | "USD";
}) {
  const fmt = moneda === "USD" ? fmtUSD : fmtARS;
  const isUSD = moneda === "USD";

  if (!esFiltrado) {
    const valuacion = isUSD ? resumen?.valuacionTotalUSD ?? resumen?.capitalTotalUSD : resumen?.valuacionTotalARS ?? resumen?.capitalTotalARS;
    const capital = isUSD ? resumen?.capitalTotalUSD : resumen?.capitalTotalARS;
    const ganancia = isUSD ? resumen?.gananciaTotalUSD : resumen?.gananciaTotalARS;
    const rendimiento = isUSD ? resumen?.rendimientoPctUSD : resumen?.rendimientoPctARS;
    return (
      <tfoot>
        <tr className="bg-white/2">
          <td className="px-5 py-3 text-gray-400 text-xs font-medium">Total cartera</td>
          <td colSpan={2} />
          <td className="px-4 py-3 text-right font-mono font-bold text-white">{fmt(valuacion)}</td>
          <td className="px-4 py-3 text-right font-mono text-gray-500">{fmt(capital)}</td>
          <td className={`px-4 py-3 text-right font-mono font-bold ${colorG(ganancia)}`}>{fmt(ganancia)}</td>
          <td className={`px-5 py-3 text-right font-mono font-bold ${colorG(rendimiento)}`}>{fmtPct(rendimiento)}</td>
        </tr>
      </tfoot>
    );
  }

  const capitalSub = isUSD
    ? posiciones.reduce((s, p) => s + (p.capitalInvertidoUSD ?? 0), 0)
    : posiciones.reduce((s, p) => s + p.capitalInvertidoARS, 0);
  const valuacionSub = isUSD
    ? posiciones.reduce((s, p) => s + (p.valuacionUSD ?? p.capitalInvertidoUSD ?? 0), 0)
    : posiciones.reduce((s, p) => s + (p.valuacionARS ?? p.capitalInvertidoARS), 0);
  const gananciaSub = valuacionSub - capitalSub;
  const pctSub = capitalSub > 0 ? gananciaSub / capitalSub : null;

  return (
    <tfoot>
      <tr className="bg-white/2">
        <td className="px-5 py-3 text-gray-400 text-xs font-medium">Total categoria</td>
        <td colSpan={2} />
        <td className="px-4 py-3 text-right font-mono font-bold text-white">{fmt(valuacionSub)}</td>
        <td className="px-4 py-3 text-right font-mono text-gray-500">{fmt(capitalSub)}</td>
        <td className={`px-4 py-3 text-right font-mono font-bold ${colorG(gananciaSub)}`}>{fmt(gananciaSub)}</td>
        <td className={`px-5 py-3 text-right font-mono font-bold ${colorG(pctSub)}`}>{fmtPct(pctSub)}</td>
      </tr>
    </tfoot>
  );
}
