"use client";

import { useState } from "react";
import { fmtDate, fmtARS, fmtQty } from "@/lib/format";
import type { Transaction } from "@/types";

export function TxRow({ tx, onDeleted }: { tx: Transaction; onDeleted: () => void }) {
  const [conf, setConf] = useState(false);

  async function del() {
    await fetch(`/api/transactions/${tx.id}`, { method: "DELETE" });
    onDeleted();
  }

  return (
    <tr className="border-b border-white/5 hover:bg-white/3 transition-colors">
      <td className="px-5 py-2.5 font-mono text-xs text-gray-400">{fmtDate(tx.fecha)}</td>
      <td className="px-4 py-2.5">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tx.tipo === "Compra" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
          {tx.tipo}
        </span>
      </td>
      <td className="px-4 py-2.5 font-semibold text-white">{tx.ticker}</td>
      <td className="px-4 py-2.5 text-right font-mono text-gray-300">{fmtQty(tx.cantidad)}</td>
      <td className="px-4 py-2.5 text-right font-mono text-gray-300">{fmtARS(tx.precioUnitario)}</td>
      <td className="px-4 py-2.5 text-right font-mono text-gray-200">{fmtARS(tx.total)}</td>
      <td className="px-5 py-2.5 text-xs text-gray-500">{tx.broker ?? "-"}</td>
      <td className="px-4 py-2.5">
        {conf ? (
          <div className="flex gap-2">
            <button onClick={del} className="text-xs text-red-400 hover:text-red-300">Si</button>
            <button onClick={() => setConf(false)} className="text-xs text-gray-500 hover:text-gray-400">No</button>
          </div>
        ) : (
          <button onClick={() => setConf(true)} className="text-xs text-gray-700 hover:text-red-400 transition-colors">Eliminar</button>
        )}
      </td>
    </tr>
  );
}
