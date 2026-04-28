"use client";

import { fmtARS, fmtPct, fmtQty, colorG, catColor, CAT_TABS } from "@/lib/format";
import type { Posicion, ResumenCartera, Transaction } from "@/types";
import { FooterTotales } from "./FooterTotales";

interface SortState { field: string; dir: "desc" | "asc" }

interface ActivosTableProps {
  filteredPos: Posicion[];
  resumen: ResumenCartera | undefined;
  catFilter: string;
  setCatFilter: (cat: string) => void;
  sort: SortState | null;
  onSort: (field: string) => void;
  showTx: boolean;
  setShowTx: (v: boolean) => void;
  transactions: Transaction[];
}

export function ActivosTable({
  filteredPos,
  resumen,
  catFilter,
  setCatFilter,
  sort,
  onSort,
  showTx,
  setShowTx,
  transactions,
}: ActivosTableProps) {
  return (
    <div className="border border-white/8 rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-1">
          {CAT_TABS.map((cat) => (
            <button key={cat} onClick={() => setCatFilter(cat)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium ${catFilter === cat ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-300"}`}>
              {cat}
            </button>
          ))}
        </div>
        <button onClick={() => setShowTx(!showTx)} className="text-xs text-gray-500 hover:text-gray-300 border border-white/10 rounded-lg px-3 py-1.5 transition-colors">
          {showTx ? "Ver activos" : `Transacciones (${transactions.length})`}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-white/5">
              {([
                { label: "Nombre",       field: "ticker",   align: "left",  px: "px-5" },
                { label: "Precio",       field: "precio",   align: "right", px: "px-4" },
                { label: "Cantidad",     field: "cantidad", align: "right", px: "px-4" },
                { label: "Monto actual", field: "monto",    align: "right", px: "px-4" },
                { label: "PPC",          field: "ppc",      align: "right", px: "px-4" },
                { label: "+/-",          field: "ganancia", align: "right", px: "px-4" },
                { label: "%",            field: "pct",      align: "right", px: "px-5" },
              ] as { label: string; field: string; align: "left" | "right"; px: string }[]).map(({ label, field, align, px }) => {
                const active = sort?.field === field;
                const indicator = active ? (sort!.dir === "desc" ? " ↓" : " ↑") : "";
                return (
                  <th
                    key={field}
                    onDoubleClick={() => onSort(field)}
                    className={`${px} py-3 text-${align} font-medium text-xs select-none cursor-pointer transition-colors ${active ? "text-violet-400" : "text-gray-500 hover:text-gray-300"}`}
                  >
                    {label}{indicator}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredPos.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-gray-600 py-12">Sin posiciones activas en esta categoria</td></tr>
            ) : (
              filteredPos.map((p) => (
                <tr key={p.ticker} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: catColor(p.categoria) }}>
                        {p.ticker.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-white">{p.ticker}</span>
                        {p.categoria && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full border text-gray-400" style={{ borderColor: catColor(p.categoria) + "50", color: catColor(p.categoria) }}>
                            {p.categoria}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-gray-200">
                    {p.precioActualARS != null ? fmtARS(p.precioActualARS) : <span className="text-gray-600 text-xs">-</span>}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-gray-300">{fmtQty(p.cantidad)}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-white font-medium">
                    {p.valuacionARS != null ? fmtARS(p.valuacionARS) : fmtARS(p.capitalInvertidoARS)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-gray-400">{fmtARS(p.promedioCompraARS)}</td>
                  <td className={`px-4 py-3.5 text-right font-mono font-medium ${colorG(p.gananciaARS)}`}>
                    {p.gananciaARS != null ? fmtARS(p.gananciaARS) : "-"}
                  </td>
                  <td className={`px-5 py-3.5 text-right font-mono font-medium ${colorG(p.gananciaPctARS)}`}>
                    {fmtPct(p.gananciaPctARS)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {filteredPos.length > 0 && (
            <FooterTotales
              posiciones={filteredPos}
              resumen={resumen}
              esFiltrado={catFilter !== "Todo"}
            />
          )}
        </table>
      </div>
    </div>
  );
}
