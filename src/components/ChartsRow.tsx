"use client";

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { fmtARS, fmtUSD, colorG, type TimeRange } from "@/lib/format";
import { ChartTooltip } from "./ChartTooltip";
import { DonutTooltip } from "./DonutTooltip";
import type { ResumenCartera } from "@/types";

interface ChartPoint {
  fecha: string;
  capitalARS: number;
  valuacionARS: number;
  label: string;
}

interface DonutItem {
  name: string;
  value: number;
  pct: number;
  fill: string;
}

interface ChartsRowProps {
  chartData: ChartPoint[];
  timeRange: TimeRange;
  setTimeRange: (r: TimeRange) => void;
  donutData: DonutItem[];
  resumen: ResumenCartera | undefined;
  moneda: "ARS" | "USD";
}

export function ChartsRow({ chartData, timeRange, setTimeRange, donutData, resumen, moneda }: ChartsRowProps) {
  const isUSD = moneda === "USD";

  // Tasa de conversión aproximada ARS→USD basada en los totales actuales
  const tcRate =
    resumen?.capitalTotalARS && resumen?.capitalTotalUSD && resumen.capitalTotalARS > 0
      ? resumen.capitalTotalARS / resumen.capitalTotalUSD
      : 1;

  const chartDataNorm = isUSD
    ? chartData.map((d) => ({
        ...d,
        capitalUSD: d.capitalARS / tcRate,
        valuacionUSD: d.valuacionARS / tcRate,
      }))
    : chartData;

  const capKey = isUSD ? "capitalUSD" : "capitalARS";
  const valKey = isUSD ? "valuacionUSD" : "valuacionARS";
  const tickFmt = isUSD ? (v: number) => fmtUSD(v) : (v: number) => fmtARS(v, true);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Historia */}
      <div className="lg:col-span-3 border border-white/8 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-300">Historia</h2>
          <div className="flex gap-1">
            {(["30D", "3M", "6M", "1Y", "ALL"] as TimeRange[]).map((r) => (
              <button key={r} onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${timeRange === r ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-300"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-600 text-sm">Sin datos</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartDataNorm} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCap" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: "#4b5563", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: "#4b5563", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={tickFmt} width={60} />
              <Tooltip content={<ChartTooltip moneda={moneda} />} />
              <Area type="monotone" dataKey={capKey} stroke="#7c3aed" strokeWidth={1.5} fill="url(#gradCap)" strokeDasharray="4 2" dot={false} />
              <Area type="monotone" dataKey={valKey} stroke="#10b981" strokeWidth={2} fill="url(#gradVal)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-emerald-500 rounded" />
            <span className="text-xs text-gray-500">Valuacion (precio actual)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-violet-500 rounded border-dashed" />
            <span className="text-xs text-gray-500">Capital invertido</span>
          </div>
        </div>
      </div>

      {/* Asignacion */}
      <div className="lg:col-span-2 border border-white/8 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)" }}>
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Asignacion</h2>
        {donutData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-600 text-sm">Sin datos</div>
        ) : (
          <div className="flex items-center gap-4">
            <PieChart width={140} height={140}>
              <Pie data={donutData} dataKey="value" innerRadius={45} outerRadius={68} strokeWidth={0} paddingAngle={2}>
                {donutData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
            <div className="flex-1 space-y-2">
              {donutData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.fill }} />
                    <span className="text-xs text-gray-300 truncate">{cat.name}</span>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{(cat.pct * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-white/8 space-y-1">
          {isUSD ? (
            <>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Capital USD</span>
                <span className="text-gray-300">{fmtUSD(resumen?.capitalTotalUSD)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Valuacion USD</span>
                <span className="text-gray-300">{fmtUSD(resumen?.valuacionTotalUSD)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Ganancia USD</span>
                <span className={`text-xs font-medium ${colorG(resumen?.gananciaTotalUSD)}`}>{fmtUSD(resumen?.gananciaTotalUSD)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Capital ARS</span>
                <span className="text-gray-300">{fmtARS(resumen?.capitalTotalARS)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Valuacion ARS</span>
                <span className="text-gray-300">{fmtARS(resumen?.valuacionTotalARS)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Ganancia ARS</span>
                <span className={`text-xs font-medium ${colorG(resumen?.gananciaTotalARS)}`}>{fmtARS(resumen?.gananciaTotalARS)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
