"use client";

import { fmtARS, fmtDate, type Variables } from "@/lib/format";
import { SideNavItem } from "./SideNavItem";
import { signOut, useSession } from "next-auth/react";

const iconPortfolio = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const iconTx = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const iconBrokers = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M9 8h1m-1 4h1m4-4h1m-1 4h1M5 21V7l7-4 7 4v14"/></svg>;
const iconPlus = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const iconTag = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const iconRefresh = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
const iconLogout = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

interface SidebarProps {
  variables: Variables | null;
  fetchingRates: boolean;
  showTx: boolean;
  setShowTx: (v: boolean) => void;
  showBrokerPanel: boolean;
  setShowBrokerPanel: (v: boolean | ((prev: boolean) => boolean)) => void;
  onNewTx: () => void;
  onUpdatePrices: () => void;
  onFetchRates: () => void;
}

export function Sidebar({
  variables,
  fetchingRates,
  showTx,
  setShowTx,
  showBrokerPanel,
  setShowBrokerPanel,
  onNewTx,
  onUpdatePrices,
  onFetchRates,
}: SidebarProps) {
  const { data: session } = useSession();

  return (
    <aside className="fixed inset-y-0 left-0 w-56 z-20 flex flex-col border-r border-white/8" style={{ background: "#07070f" }}>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">Mi Portfolio</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs text-gray-700 px-2 pb-1 uppercase tracking-wider">Menu</p>
        <SideNavItem icon={iconPortfolio} label="Portfolio" active={!showTx} onClick={() => setShowTx(false)} />
        <SideNavItem icon={iconTx} label="Transacciones" active={showTx} onClick={() => setShowTx(true)} />
        <SideNavItem icon={iconBrokers} label="Brokers" active={showBrokerPanel} onClick={() => setShowBrokerPanel((v) => !v)} />

        <p className="text-xs text-gray-700 px-2 pb-1 pt-4 uppercase tracking-wider">Acciones</p>
        <button
          onClick={onNewTx}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors"
        >
          {iconPlus}
          Nueva Transaccion
        </button>
        <SideNavItem icon={iconTag} label="Actualizar Precios" onClick={onUpdatePrices} />
        <SideNavItem
          icon={iconRefresh}
          label={fetchingRates ? "Actualizando..." : "Cotizaciones"}
          onClick={onFetchRates}
          disabled={fetchingRates}
        />
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/8">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-600">MEP</span>
          <span className="text-gray-400 font-mono">{variables?.usdMep != null ? fmtARS(variables.usdMep) : "-"}</span>
        </div>
        <div className="flex justify-between text-xs mb-2">
          <span className="text-gray-600">USDT</span>
          <span className="text-gray-400 font-mono">{variables?.usdt != null ? fmtARS(variables.usdt) : "-"}</span>
        </div>
        {variables?.fechaActualizacion && (
          <p className="text-xs text-gray-700 mb-3">{fmtDate(variables.fechaActualizacion)}</p>
        )}
        {session?.user && (
          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
            {session.user.image && (
              <img src={session.user.image} alt="" className="w-6 h-6 rounded-full flex-shrink-0" referrerPolicy="no-referrer" />
            )}
            <span className="text-xs text-gray-600 truncate flex-1">{session.user.name ?? session.user.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Cerrar sesion"
              className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0"
            >
              {iconLogout}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
