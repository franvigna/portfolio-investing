"use client";

import { fmtARS, colorG, BROKER_COLORS } from "@/lib/format";

interface BrokerItem {
  broker: string;
  capital: number;
  pct: number;
  valuacion: number;
  ganancia: number;
  tickers: string[];
}

export function BrokerPanel({ brokerAnalysis, onClose }: { brokerAnalysis: BrokerItem[]; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-80 z-40 overflow-y-auto border-l border-white/8 shadow-2xl" style={{ background: "#0d0d20" }}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-white">Por broker</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">&times;</button>
          </div>
          {brokerAnalysis.length === 0 ? (
            <p className="text-gray-600 text-sm">Sin datos de brokers en las transacciones.</p>
          ) : (
            <div className="space-y-3">
              {brokerAnalysis.map((b) => {
                const color = BROKER_COLORS[b.broker] ?? "#78909C";
                return (
                  <div key={b.broker} className="rounded-xl border border-white/8 p-4" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                        <span className="text-sm font-semibold text-white">{b.broker}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-400">{(b.pct * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/8 mb-3">
                      <div className="h-1 rounded-full" style={{ width: `${(b.pct * 100).toFixed(1)}%`, background: color }} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Capital</span>
                        <span className="text-gray-300 font-mono">{fmtARS(b.capital)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Valuacion</span>
                        <span className="text-gray-300 font-mono">{fmtARS(b.valuacion)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Ganancia</span>
                        <span className={`font-mono font-medium ${colorG(b.ganancia)}`}>{fmtARS(b.ganancia)}</span>
                      </div>
                    </div>
                    {b.tickers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-white/5">
                        {b.tickers.map((t) => (
                          <span key={t} className="text-xs px-1.5 py-0.5 rounded-md text-gray-400" style={{ background: "rgba(255,255,255,0.06)" }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="rounded-xl border border-white/8 p-4 mt-2">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500 font-medium">Total</span>
                  <span className="text-white font-mono font-bold">{fmtARS(brokerAnalysis.reduce((s, b) => s + b.valuacion, 0))}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Capital total</span>
                  <span className="text-gray-400 font-mono">{fmtARS(brokerAnalysis.reduce((s, b) => s + b.capital, 0))}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
