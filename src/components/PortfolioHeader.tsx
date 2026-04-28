"use client";

import { fmtARS, fmtUSD, fmtPct, colorG } from "@/lib/format";
import type { ResumenCartera } from "@/types";

interface PortfolioHeaderProps {
  resumen: ResumenCartera | undefined;
}

export function PortfolioHeader({ resumen }: PortfolioHeaderProps) {
  const totalARS = resumen?.valuacionTotalARS ?? resumen?.capitalTotalARS ?? 0;
  const gananciaARS = resumen?.gananciaTotalARS ?? 0;
  const rendimientoPct = resumen?.rendimientoPctARS ?? 0;

  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Panel de mi portfolio</p>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-white">{fmtARS(totalARS)}</span>
          {resumen?.valuacionTotalUSD != null && (
            <span className="text-lg text-gray-400">{fmtUSD(resumen.valuacionTotalUSD)}</span>
          )}
        </div>
      </div>
      <div className={`border rounded-xl px-4 py-2 text-right ${gananciaARS >= 0 ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10"}`}>
        <p className="text-xs text-gray-400">Ganancia historica</p>
        <p className={`text-lg font-bold ${colorG(gananciaARS)}`}>{fmtARS(gananciaARS)}</p>
        <p className={`text-xs font-medium ${colorG(rendimientoPct)}`}>{fmtPct(rendimientoPct)}</p>
      </div>
    </div>
  );
}
