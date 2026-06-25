"use client";

import { fmtARS, fmtUSD } from "@/lib/format";

export function ChartTooltip({
  active,
  payload,
  label,
  moneda,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string }[];
  label?: string;
  moneda?: "ARS" | "USD";
}) {
  if (!active || !payload?.length) return null;
  const fmt = moneda === "USD" ? fmtUSD : fmtARS;
  const valKey = moneda === "USD" ? "valuacionUSD" : "valuacionARS";
  const capKey = moneda === "USD" ? "capitalUSD" : "capitalARS";
  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className={p.dataKey === valKey ? "text-emerald-400" : "text-violet-400"}>
          {p.dataKey === valKey ? "Valuacion" : "Capital"}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}
