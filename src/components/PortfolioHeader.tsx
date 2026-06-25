"use client";

import { fmtARS, fmtUSD, fmtPct, colorG } from "@/lib/format";
import type { ResumenCartera } from "@/types";

interface PortfolioHeaderProps {
  resumen: ResumenCartera | undefined;
  moneda: "ARS" | "USD";
  setMoneda: (m: "ARS" | "USD") => void;
}

export function PortfolioHeader({ resumen, moneda, setMoneda }: PortfolioHeaderProps) {
  const isUSD = moneda === "USD";

  const totalARS = resumen?.valuacionTotalARS ?? resumen?.capitalTotalARS ?? 0;
  const totalUSD = resumen?.valuacionTotalUSD ?? resumen?.capitalTotalUSD ?? 0;
  const gananciaARS = resumen?.gananciaTotalARS ?? 0;
  const gananciaUSD = resumen?.gananciaTotalUSD ?? 0;
  const rendimientoPct = isUSD ? (resumen?.rendimientoPctUSD ?? 0) : (resumen?.rendimientoPctARS ?? 0);
  const ganancia = isUSD ? gananciaUSD : gananciaARS;

  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Panel de mi portfolio</p>
          <div className="flex rounded-lg overflow-hidden border border-white/10 text-xs">
            {(["ARS", "USD"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMoneda(m)}
                className={`px-2.5 py-1 font-medium transition-colors ${moneda === m ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-300"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-white">
            {isUSD ? fmtUSD(totalUSD) : fmtARS(totalARS)}
          </span>
          <span className="text-lg text-gray-400">
            {isUSD ? fmtARS(totalARS) : fmtUSD(totalUSD)}
          </span>
        </div>
      </div>
      <div className={`border rounded-xl px-4 py-2 text-right ${ganancia >= 0 ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10"}`}>
        <p className="text-xs text-gray-400">Ganancia historica</p>
        <p className={`text-lg font-bold ${colorG(ganancia)}`}>
          {isUSD ? fmtUSD(gananciaUSD) : fmtARS(gananciaARS)}
        </p>
        <p className={`text-xs font-medium ${colorG(rendimientoPct)}`}>{fmtPct(rendimientoPct)}</p>
      </div>
    </div>
  );
}
