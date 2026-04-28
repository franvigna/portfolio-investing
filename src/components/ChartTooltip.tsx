"use client";

import { fmtARS } from "@/lib/format";

export function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className={p.dataKey === "valuacionARS" ? "text-emerald-400" : "text-violet-400"}>
          {p.dataKey === "valuacionARS" ? "Valuacion" : "Capital"}: {fmtARS(p.value)}
        </p>
      ))}
    </div>
  );
}
