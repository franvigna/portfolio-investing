import { getTickers, getVariables } from "@/lib/storage";

export async function calcularCamposDerivados(
  ticker: string,
  precioUnitario: number,
  cantidad: number
) {
  const [tickers, variables] = await Promise.all([getTickers(), getVariables()]);
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
    tcUsado = categoria === "Cripto" ? (variables.usdt ?? null) : (variables.usdMep ?? null);
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
