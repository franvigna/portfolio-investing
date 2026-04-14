export type TransactionType = "BUY" | "SELL";

export interface Transaction {
  id: number;
  ticker: string;
  type: TransactionType;
  shares: number;
  price: number;
  date: string;
  notes?: string | null;
  createdAt: string;
}

export interface PortfolioPosition {
  ticker: string;
  name?: string | null;
  shares: number;
  avgBuyPrice: number;
  currentPrice?: number | null;
  totalInvested: number;
  currentValue?: number | null;
  gainLoss?: number | null;
  gainLossPct?: number | null;
}

export interface DashboardStats {
  totalInvested: number;
  currentValue: number;
  totalGainLoss: number;
  totalGainLossPct: number;
  positions: PortfolioPosition[];
}
