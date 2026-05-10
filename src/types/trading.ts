/**
 * Aegis Polymarket AI Terminal - Type Definitions
 * SPDX-License-Identifier: Apache-2.0
 */

export type SignalAction = "BUY_YES" | "BUY_NO" | "HOLD" | "EXIT";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type BotStrategy = "SCALPING" | "MOMENTUM" | "MEAN_REVERSION" | "BREAKOUT" | "LIQUIDITY_SWEEP" | "SMART_MONEY";
export type MarketCategory = "POLITICS" | "CRYPTO" | "TECH" | "SCIENCE" | "CULTURE";

export interface BookLevel {
  price: number; // in cents (e.g., 0.52 or 52)
  size: number;  // contracts
}

export interface OrderBook {
  bids: BookLevel[];
  asks: BookLevel[];
  imbalance: number; // -1 to +1 indicator (positive = bid heavy)
  spread: number;    // difference between best ask and best bid
}

export interface PolymarketMarket {
  id: string;
  title: string;
  category: MarketCategory;
  slug: string;
  yesPrice: number; // 0.01 - 0.99
  noPrice: number;  // 0.01 - 0.99
  volume24h: number; // in USD
  liquidity: number; // in USD
  volatility: number; // index (e.g. 0-100)
  openInterest: number; // in contracts
  sentimentScore: number; // 0-100 (whales lean yes)
  isHot: boolean;
  isTrending: boolean;
  isManipulated: boolean;
  resolutionDate: string;
  imageUrl?: string;
  orderBookYes: OrderBook;
  orderBookNo: OrderBook;
}

export interface TradingSignal {
  id: string;
  marketId: string;
  marketName: string;
  action: SignalAction;
  confidence: number; // 0 to 100
  risk: RiskLevel;
  expectedROI: number; // percentage
  whaleDetected: boolean;
  reasoning: string;
  createdAt: number;
}

export interface WhaleWallet {
  address: string;
  label?: string;
  totalPnl: number; // USD
  unrealizedPnl: number; // USD
  winrate: number; // 0 - 100
  totalTrades: number;
  avgTradeSize: number; // USD
  lastTradeTime: number;
  isCoordinated: boolean; // Part of group activity
}

export interface WhaleTransaction {
  id: string;
  walletAddress: string;
  walletLabel?: string;
  marketId: string;
  marketName: string;
  outcomeSelected: "YES" | "NO";
  type: "BUY" | "SELL";
  price: number; // price per share (e.g. 0.54)
  size: number;  // share count
  totalValue: number; // USD
  timestamp: number;
  anomalyScore: number; // 0-100 scale of suspicious trading
}

export interface Position {
  id: string;
  marketId: string;
  marketName: string;
  outcome: "YES" | "NO";
  shares: number;
  avgBuyPrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  unrealizedPnL: number;
  createdAt: number;
}

export interface BotConfig {
  id: string;
  name: string;
  strategy: BotStrategy;
  marketId: string | "ALL"; // "ALL" means scans all hot markets
  isActive: boolean;
  allocationSize: number; // USD to deploy per signal
  stopLossPercent: number;
  takeProfitPercent: number;
  slippageLimitPercent: number;
  maxDailyLoss: number; // Max USD loss before shutdown
  cooldownPeriodMs: number; // Cooldown after a loss
  isLive: boolean; // Is paper trade (false) or live (true - simulated)
  tradesCount: number;
  profitableTradesCount: number;
  totalPnl: number;
}

export interface TradeLog {
  id: string;
  botId?: string;
  botName?: string;
  marketId: string;
  marketName: string;
  outcome: "YES" | "NO";
  type: "BUY" | "SELL";
  shares: number;
  price: number;
  totalValue: number;
  timestamp: number;
  executionLatencyMs: number;
  exitReason?: "TAKE_PROFIT" | "STOP_LOSS" | "MANUAL" | "SIGNAL_EXIT" | "TRAILING_STOP";
  isPnLLogged?: boolean;
  pnlEarned?: number;
}

export interface PortfolioSummary {
  totalBalance: number; // cash + positions value
  cashBalance: number;
  realizedPnL: number;
  unrealizedPnL: number;
  winrate: number;
  sharpeRatio: number;
  profitFactor: number;
  exposure: number; // current capital locked in positions
  positions: Position[];
  equityHistory: { timestamp: number; value: number }[];
}

export interface StrategyMetrics {
  strategy: BotStrategy;
  isActive: boolean;
  tradesPlaced: number;
  winRate: number;
  avgProfit: number;
  maxDrawdown: number;
  totalReturnPercent: number;
  score: number; // 0-100 rating
}

export interface SystemAlert {
  id: string;
  type: "SIGNAL" | "WHALE" | "EXECUTION" | "RISK_LIMIT" | "MANIPULATION";
  title: string;
  message: string;
  timestamp: number;
  severity: "INFO" | "WARNING" | "CRITICAL";
  marketId?: string;
}

export interface SystemHealth {
  websocketConnected: boolean;
  apiLatencyMs: number;
  cpuUsagePercent: number;
  memoryUsageMb: number;
  activeSocketsCount: number;
  geminiApiStatus: "ONLINE" | "OFFLINE";
  polymarketApiStatus: "ONLINE" | "STABLE" | "DEGRADED";
}

// Typed WebSocket Protocol Messages
export type WebSocketEvent =
  | { type: "INIT"; payload: { markets: PolymarketMarket[]; whales: WhaleWallet[]; signals: TradingSignal[]; positions: Position[]; cash: number } }
  | { type: "MARKETS_UPDATE"; payload: PolymarketMarket[] }
  | { type: "ALERT"; payload: SystemAlert }
  | { type: "WHALE_TRANS"; payload: WhaleTransaction }
  | { type: "SIGNAL_NEW"; payload: TradingSignal }
  | { type: "PORTFOLIO_UPDATE"; payload: PortfolioSummary }
  | { type: "BOTS_UPDATE"; payload: BotConfig[] }
  | { type: "TRADE_LOG_NEW"; payload: TradeLog }
  | { type: "SYSTEM_HEALTH"; payload: SystemHealth }
  | { type: "NEWS_COMMENTARY"; payload: { marketId: string; commentary: string; probability: number } }
  | { type: "BACKTEST_RESULT"; payload: any };

export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: number;
}
