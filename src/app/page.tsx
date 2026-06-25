"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import type { Transaction, PortfolioData } from "@/types";
import { filterHistory, catColor, type TimeRange, type Variables } from "@/lib/format";

import { Sidebar } from "@/components/Sidebar";
import { BrokerPanel } from "@/components/BrokerPanel";
import { ModalNuevaTx } from "@/components/ModalNuevaTx";
import { PortfolioHeader } from "@/components/PortfolioHeader";
import { ChartsRow } from "@/components/ChartsRow";
import { ActivosTable } from "@/components/ActivosTable";
import { TransaccionesTable } from "@/components/TransaccionesTable";

export default function Home() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [history, setHistory] = useState<{ fecha: string; capitalARS: number; valuacionARS: number }[]>([]);
  const [variables, setVariables] = useState<Variables | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingRates, setFetchingRates] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("ALL");
  const [catFilter, setCatFilter] = useState("Todo");
  const [showTx, setShowTx] = useState(false);
  const [txSearch, setTxSearch] = useState("");
  const [showBrokerPanel, setShowBrokerPanel] = useState(false);
  const [sort, setSort] = useState<{ field: string; dir: "desc" | "asc" } | null>(null);
  const [moneda, setMoneda] = useState<"ARS" | "USD">("ARS");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [portRes, txRes, histRes, varsRes] = await Promise.all([
        fetch("/api/portfolio"),
        fetch("/api/transactions"),
        fetch("/api/portfolio/history"),
        fetch("/api/variables"),
      ]);
      if (portRes.ok) setPortfolio(await portRes.json());
      if (txRes.ok) setTransactions(await txRes.json());
      if (histRes.ok) setHistory(await histRes.json());
      if (varsRes.ok) setVariables(await varsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRates = useCallback(async () => {
    setFetchingRates(true);
    try {
      const res = await fetch("/api/variables/cotizaciones", { method: "POST" });
      if (res.ok) {
        const body = await res.json();
        setVariables(body.variables ?? body);
        const [portRes, histRes] = await Promise.all([
          fetch("/api/portfolio"),
          fetch("/api/portfolio/history"),
        ]);
        if (portRes.ok) setPortfolio(await portRes.json());
        if (histRes.ok) setHistory(await histRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingRates(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const r = portfolio?.resumen;
  const posiciones = portfolio?.posiciones ?? [];
  const categorias = portfolio?.categorias ?? [];

  const filteredPos = useMemo(() => {
    let result = catFilter === "Todo" ? posiciones : posiciones.filter((p) => p.categoria === catFilter);
    if (!sort) return result;
    return [...result].sort((a, b) => {
      const d = sort.dir === "desc" ? -1 : 1;
      switch (sort.field) {
        case "ticker":   return d * a.ticker.localeCompare(b.ticker);
        case "precio":   return d * ((a.precioActualARS ?? 0) - (b.precioActualARS ?? 0));
        case "cantidad": return d * (a.cantidad - b.cantidad);
        case "monto":    return d * ((a.valuacionARS ?? a.capitalInvertidoARS) - (b.valuacionARS ?? b.capitalInvertidoARS));
        case "ppc":      return d * (a.promedioCompraARS - b.promedioCompraARS);
        case "ganancia": return d * ((a.gananciaARS ?? 0) - (b.gananciaARS ?? 0));
        case "pct":      return d * ((a.gananciaPctARS ?? 0) - (b.gananciaPctARS ?? 0));
        default: return 0;
      }
    });
  }, [posiciones, catFilter, sort]);

  function handleColSort(field: string) {
    setSort((prev) => {
      if (!prev || prev.field !== field) return { field, dir: "desc" };
      if (prev.dir === "desc") return { field, dir: "asc" };
      return null;
    });
  }

  const filteredTx = useMemo(
    () => transactions.filter(
      (t) => txSearch === "" || t.ticker.toLowerCase().includes(txSearch.toLowerCase()) || (t.broker ?? "").toLowerCase().includes(txSearch.toLowerCase())
    ),
    [transactions, txSearch]
  );

  const chartData = useMemo(
    () => filterHistory(history, timeRange).map((p) => ({ ...p, label: p.fecha.split("-").reverse().slice(0, 2).join("/") })),
    [history, timeRange]
  );

  const donutData = useMemo(
    () => categorias.map((c) => ({ name: c.categoria, value: c.capital, pct: c.pct, fill: catColor(c.categoria) })),
    [categorias]
  );

  const brokerAnalysis = useMemo(() => {
    const brokerNetQty: Record<string, Record<string, number>> = {};
    const brokersSet = new Set<string>();

    for (const tx of transactions) {
      const b = tx.broker?.trim() || "Sin broker";
      brokersSet.add(b);
      if (!brokerNetQty[tx.ticker]) brokerNetQty[tx.ticker] = {};
      brokerNetQty[tx.ticker][b] =
        (brokerNetQty[tx.ticker][b] ?? 0) + (tx.tipo === "Compra" ? tx.cantidad : -tx.cantidad);
    }

    const brokerCapital: Record<string, number> = {};
    const brokerValuacion: Record<string, number> = {};
    const brokerTickers: Record<string, string[]> = {};

    for (const pos of posiciones) {
      const byBroker = brokerNetQty[pos.ticker];
      if (!byBroker) continue;
      const active = Object.entries(byBroker).filter(([, q]) => q > 0.00001);
      const totalNet = active.reduce((a, [, q]) => a + q, 0);
      if (totalNet === 0) continue;
      const val = pos.valuacionARS ?? pos.capitalInvertidoARS;
      for (const [broker, qty] of active) {
        const prop = qty / totalNet;
        brokerCapital[broker] = (brokerCapital[broker] ?? 0) + pos.capitalInvertidoARS * prop;
        brokerValuacion[broker] = (brokerValuacion[broker] ?? 0) + val * prop;
        if (!brokerTickers[broker]) brokerTickers[broker] = [];
        if (!brokerTickers[broker].includes(pos.ticker)) brokerTickers[broker].push(pos.ticker);
      }
    }

    const totalCapital = Object.values(brokerCapital).reduce((s, c) => s + c, 0);

    return Array.from(brokersSet)
      .filter((broker) => (brokerCapital[broker] ?? 0) > 0)
      .map((broker) => {
        const capital = brokerCapital[broker] ?? 0;
        const valuacion = brokerValuacion[broker] ?? 0;
        return {
          broker,
          capital,
          pct: totalCapital > 0 ? capital / totalCapital : 0,
          valuacion,
          ganancia: valuacion - capital,
          tickers: brokerTickers[broker] ?? [],
        };
      })
      .sort((a, b) => b.capital - a.capital);
  }, [transactions, posiciones]);

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #0d0d20 50%, #0a0a1a 100%)" }}>
      {showModal && <ModalNuevaTx onClose={() => setShowModal(false)} onSaved={loadData} />}
      <Sidebar
        variables={variables}
        fetchingRates={fetchingRates}
        showTx={showTx}
        setShowTx={setShowTx}
        showBrokerPanel={showBrokerPanel}
        setShowBrokerPanel={setShowBrokerPanel}
        onNewTx={() => setShowModal(true)}
        onFetchRates={fetchRates}
      />

      {showBrokerPanel && (
        <BrokerPanel brokerAnalysis={brokerAnalysis} onClose={() => setShowBrokerPanel(false)} />
      )}

      <main className="flex-1 ml-56 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
          <PortfolioHeader resumen={r} moneda={moneda} setMoneda={setMoneda} />

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <ChartsRow
                chartData={chartData}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
                donutData={donutData}
                resumen={r}
                moneda={moneda}
              />

              {!showTx ? (
                <ActivosTable
                  filteredPos={filteredPos}
                  resumen={r}
                  catFilter={catFilter}
                  setCatFilter={setCatFilter}
                  sort={sort}
                  onSort={handleColSort}
                  showTx={showTx}
                  setShowTx={setShowTx}
                  transactions={transactions}
                  moneda={moneda}
                />
              ) : (
                <div className="border border-white/8 rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                    <span className="text-sm font-semibold text-gray-300">Transacciones</span>
                    <button onClick={() => setShowTx(false)} className="text-xs text-gray-500 hover:text-gray-300 border border-white/10 rounded-lg px-3 py-1.5 transition-colors">
                      Ver activos
                    </button>
                  </div>
                  <TransaccionesTable
                    filteredTx={filteredTx}
                    txSearch={txSearch}
                    setTxSearch={setTxSearch}
                    onDeleted={loadData}
                    onEdited={loadData}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
