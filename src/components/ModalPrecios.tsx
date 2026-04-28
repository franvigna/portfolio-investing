"use client";

import { useState } from "react";
import type { Posicion } from "@/types";

export function ModalPrecios({ posiciones, onClose, onSaved }: { posiciones: Posicion[]; onClose: () => void; onSaved: () => void }) {
  const [prices, setPrices] = useState<Record<string, string>>(
    Object.fromEntries(posiciones.map((p) => [p.ticker, p.precioActualARS != null ? String(p.precioActualARS) : ""]))
  );
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch("/api/tickers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        Object.entries(prices).map(([symbol, ars]) => ({
          symbol,
          precioActual: ars ? parseFloat(ars) : null,
          precioActualUSD: null,
        }))
      ),
    });
    setSaving(false);
    onSaved();
    onClose();
  }

  const inp = "bg-[#1a1a2e] border border-white/10 rounded px-2 py-1.5 text-sm text-white w-full focus:outline-none focus:border-violet-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#12122a] border border-white/10 rounded-2xl w-full max-w-sm mx-4 p-6 shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Actualizar precios</h2>
            <p className="text-xs text-gray-600 mt-0.5">El precio USD se calcula automaticamente segun MEP/USDT</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 px-1 mb-2">
            <span>Ticker</span><span>Precio ARS</span>
          </div>
          {posiciones.map((p) => (
            <div key={p.ticker} className="grid grid-cols-2 gap-2 items-center">
              <div>
                <span className="text-sm font-medium text-white">{p.ticker}</span>
                {p.categoria && <div className="text-xs text-gray-600">{p.categoria}</div>}
              </div>
              <input
                type="number"
                step="any"
                className={inp}
                placeholder="ARS"
                value={prices[p.ticker] ?? ""}
                onChange={(e) => setPrices((prev) => ({ ...prev, [p.ticker]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-4">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-sm">Cancelar</button>
          <button onClick={save} disabled={saving} className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm disabled:opacity-50 font-medium">
            {saving ? "Guardando..." : "Guardar precios"}
          </button>
        </div>
      </div>
    </div>
  );
}
