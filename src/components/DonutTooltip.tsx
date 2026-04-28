"use client";

import { fmtARS } from "@/lib/format";

export function DonutTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { pct: number } }[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-white font-medium">{item.name}</p>
      <p className="text-gray-300">{fmtARS(item.value)}</p>
      <p className="text-gray-400">{(item.payload.pct * 100).toFixed(1)}%</p>
    </div>
  );
}
