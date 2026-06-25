"use client";

import type { Transaction } from "@/types";
import { TxRow } from "./TxRow";

interface TransaccionesTableProps {
  filteredTx: Transaction[];
  txSearch: string;
  setTxSearch: (v: string) => void;
  onDeleted: () => void;
  onEdited: () => void;
}

export function TransaccionesTable({ filteredTx, txSearch, setTxSearch, onDeleted, onEdited }: TransaccionesTableProps) {
  return (
    <div>
      <div className="px-5 py-3 border-b border-white/5">
        <input
          type="text"
          placeholder="Buscar por ticker o broker..."
          className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white w-64 focus:outline-none focus:border-violet-500 placeholder-gray-600"
          value={txSearch}
          onChange={(e) => setTxSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="sticky top-0" style={{ background: "#0d0d20" }}>
            <tr className="border-b border-white/5">
              <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs">Fecha</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs">Tipo</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs">Ticker</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium text-xs">Cantidad</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium text-xs">Precio ARS</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium text-xs">Total ARS</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs">Broker</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filteredTx.map((tx) => (
              <TxRow key={tx.id} tx={tx} onDeleted={onDeleted} onEdited={onEdited} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
