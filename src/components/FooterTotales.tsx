"use client";

import { fmtARS, fmtPct, colorG } from "@/lib/format";
import type { Posicion, ResumenCartera } from "@/types";

export function FooterTotales({
  posiciones,
  resumen,
  esFiltrado,
}: {
  posiciones: Posicion[];
  resumen: ResumenCartera | undefined;
  esFiltrado: boolean;
}) {
  if (!esFiltrado) {
    return (
      <tfoot>
        <tr className="bg-white/2">
          <td className="px-5 py-3 text-gray-400 text-xs font-medium">Total cartera</td>
          <td colSpan={2} />
          <td className="px-4 py-3 text-right font-mono font-bold text-white">{fmtARS(resumen?.valuacionTotalARS ?? resumen?.capitalTotalARS)}</td>
          <td className="px-4 py-3 text-right font-mono text-gray-500">{fmtARS(resumen?.capitalTotalARS)}</td>
          <td className={`px-4 py-3 text-right font-mono font-bold ${colorG(resumen?.gananciaTotalARS)}`}>{fmtARS(resumen?.gananciaTotalARS)}</td>
          <td className={`px-5 py-3 text-right font-mono font-bold ${colorG(resumen?.rendimientoPctARS)}`}>{fmtPct(resumen?.rendimientoPctARS)}</td>
        </tr>
      </tfoot>
    );
  }

  const capitalSub = posiciones.reduce((s, p) => s + p.capitalInvertidoARS, 0);
  const valuacionSub = posiciones.reduce((s, p) => s + (p.valuacionARS ?? p.capitalInvertidoARS), 0);
  const gananciaSub = valuacionSub - capitalSub;
  const pctSub = capitalSub > 0 ? gananciaSub / capitalSub : null;

  return (
    <tfoot>
      <tr className="bg-white/2">
        <td className="px-5 py-3 text-gray-400 text-xs font-medium">Total categoria</td>
        <td colSpan={2} />
        <td className="px-4 py-3 text-right font-mono font-bold text-white">{fmtARS(valuacionSub)}</td>
        <td className="px-4 py-3 text-right font-mono text-gray-500">{fmtARS(capitalSub)}</td>
        <td className={`px-4 py-3 text-right font-mono font-bold ${colorG(gananciaSub)}`}>{fmtARS(gananciaSub)}</td>
        <td className={`px-5 py-3 text-right font-mono font-bold ${colorG(pctSub)}`}>{fmtPct(pctSub)}</td>
      </tr>
    </tfoot>
  );
}
