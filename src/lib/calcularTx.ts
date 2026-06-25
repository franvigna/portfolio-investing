import { getTickers, getVariables, saveVariables } from "@/lib/storage";

interface DolarApiItem {
  casa: string;
  compra: number | null;
  venta: number | null;
}

async function fetchCotizacionesLive(): Promise<{ usdMep: number | null; usdt: number | null }> {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares", { next: { revalidate: 0 } });
    if (!res.ok) return { usdMep: null, usdt: null };
    const dolares: DolarApiItem[] = await res.json();
    const mep = dolares.find((d) => d.casa === "mep");
    const cripto = dolares.find((d) => d.casa === "cripto");
    const usdMep = mep?.venta ?? null;
    const usdtBase = cripto?.venta ?? null;
    // Nexo aplica un markup de 3.15% sobre el dolar cripto oficial
    const usdt = usdtBase != null ? usdtBase * 1.0315 : null;
    return { usdMep, usdt };
  } catch {
    return { usdMep: null, usdt: null };
  }
}

export async function calcularCamposDerivados(
  ticker: string,
  precioUnitario: number,
  cantidad: number
) {
  const [tickers, live, stored] = await Promise.all([
    getTickers(),
    fetchCotizacionesLive(),
    getVariables(),
  ]);

  // Usar cotización live si está disponible, sino caer en la guardada
  const usdMep = live.usdMep ?? stored.usdMep;
  const usdt = live.usdt ?? stored.usdt;

  // Actualizar variables en BD con los valores frescos (sin await para no bloquear)
  if (live.usdMep != null || live.usdt != null) {
    saveVariables({
      usdMep: usdMep,
      usdt: usdt,
      fechaActualizacion: new Date().toISOString().split("T")[0],
    }).catch(() => {});
  }

  const tickerData = tickers.find((t) => t.symbol === ticker);
  const categoria = tickerData?.categoria ?? null;

  const total = cantidad * precioUnitario;

  let tcUsado: number | null;
  let precioUSD: number | null;
  let totalUSD: number | null;

  if (ticker === "USDT") {
    tcUsado = precioUnitario;
    precioUSD = 1;
    totalUSD = cantidad;
  } else {
    tcUsado = categoria === "Cripto" ? (usdt ?? null) : (usdMep ?? null);
    if (tcUsado && tcUsado > 0) {
      precioUSD = precioUnitario / tcUsado;
      totalUSD = total / tcUsado;
    } else {
      precioUSD = null;
      totalUSD = null;
    }
  }

  return { total, precioUSD, totalUSD, tcUsado };
}
