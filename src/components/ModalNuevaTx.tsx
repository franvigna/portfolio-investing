"use client";

import { useState } from "react";
import { BROKERS } from "@/lib/format";
import type { Transaction } from "@/types";

interface Props {
  onClose: () => void;
  onSaved: () => void;
  transaccion?: Transaction;
}

export function ModalNuevaTx({ onClose, onSaved, transaccion }: Props) {
  const isEditing = !!transaccion;

  const [form, setForm] = useState({
    fecha: transaccion?.fecha ?? new Date().toISOString().split("T")[0],
    tipo: (transaccion?.tipo ?? "Compra") as "Compra" | "Venta",
    ticker: transaccion?.ticker ?? "",
    cantidad: transaccion?.cantidad?.toString() ?? "",
    precioUnitario: transaccion?.precioUnitario?.toString() ?? "",
    broker: transaccion?.broker ?? "Balanz",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        fecha: form.fecha,
        tipo: form.tipo,
        ticker: form.ticker.toUpperCase(),
        cantidad: parseFloat(form.cantidad),
        precioUnitario: parseFloat(form.precioUnitario),
        broker: form.broker || null,
      };

      const url = isEditing ? `/api/transactions/${transaccion.id}` : "/api/transactions";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Error al guardar");
      } else {
        onSaved();
        onClose();
      }
    } catch {
      setError("Error de red");
    } finally {
      setSaving(false);
    }
  }

  const inp = "bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white w-full focus:outline-none focus:border-violet-500 placeholder-gray-600";
  const lbl = "text-xs text-gray-400 mb-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#12122a] border border-white/10 rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">
            {isEditing ? "Editar transaccion" : "Nueva transaccion"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Fecha</label>
              <input type="date" className={inp} value={form.fecha} onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))} required />
            </div>
            <div>
              <label className={lbl}>Broker</label>
              <select className={inp} value={form.broker} onChange={(e) => setForm((f) => ({ ...f, broker: e.target.value }))}>
                {BROKERS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={lbl}>Tipo</label>
            <div className="flex rounded-lg overflow-hidden border border-white/10">
              {(["Compra", "Venta"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, tipo: t }))}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${form.tipo === t ? (t === "Compra" ? "bg-emerald-600 text-white" : "bg-red-600 text-white") : "bg-[#1a1a2e] text-gray-400 hover:text-white"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Ticker</label>
              <input type="text" className={inp} placeholder="AAPL" value={form.ticker} onChange={(e) => setForm((f) => ({ ...f, ticker: e.target.value.toUpperCase() }))} required />
            </div>
            <div>
              <label className={lbl}>Cantidad</label>
              <input type="number" step="any" className={inp} placeholder="1" value={form.cantidad} onChange={(e) => setForm((f) => ({ ...f, cantidad: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className={lbl}>Precio Unitario ARS</label>
            <input type="number" step="any" className={inp} placeholder="0" value={form.precioUnitario} onChange={(e) => setForm((f) => ({ ...f, precioUnitario: e.target.value }))} required />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-sm transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm transition-colors disabled:opacity-50 font-medium">
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
