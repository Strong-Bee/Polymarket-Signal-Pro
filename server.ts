/**
 * Aegis Polymarket AI Terminal - Core Full-Stack Server
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { 
  PolymarketMarket, 
  WhaleWallet, 
  WhaleTransaction, 
  TradingSignal, 
  BotConfig, 
  Position, 
  TradeLog, 
  PortfolioSummary, 
  SystemAlert, 
  SystemHealth, 
  BotStrategy, 
  MarketCategory,
  BookLevel,
  OrderBook,
  SignalAction,
  RiskLevel,
  WebSocketEvent
} from "./src/types/trading.js";

// Load env variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();
app.use(express.json());

// Create standard HTTP server
const server = http.createServer(app);

// Configure WebSocket Server
const wss = new WebSocketServer({ noServer: true });

// Listen for upgrades and direct to WS server
server.on("upgrade", (request, socket, head) => {
  const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;
  
  if (pathname === "/ws") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    // Let Vite handle its own websocket upgrades for developer client if and when necessary
    if (process.env.NODE_ENV !== "production") {
      // Vite dev server handles its HMR or websockets
    } else {
      socket.destroy();
    }
  }
});

// Create active client connection list
const clients = new Set<WebSocket>();

// -----------------------------------------------------------------------------
// BACKEND REAL-TIME SIMULATED STATE (SOURCE OF TRUTH)
// -----------------------------------------------------------------------------

// Active Hot Polymarket Markets
let markets: PolymarketMarket[] = [
  {
    id: "poly-us-election-2028",
    title: "US Presidential Election 2028 Winner",
    category: "POLITICS",
    slug: "us-election-2028",
    yesPrice: 0.52,
    noPrice: 0.48,
    volume24h: 12450800,
    liquidity: 4500000,
    volatility: 64,
    openInterest: 8520000,
    sentimentScore: 58,
    isHot: true,
    isTrending: true,
    isManipulated: false,
    resolutionDate: "2028-11-07",
    orderBookYes: generateInitialOrderBook(0.52),
    orderBookNo: generateInitialOrderBook(0.48)
  },
  {
    id: "poly-fed-rate-june",
    title: "Fed Interest Rate Cut in June Meeting",
    category: "CRYPTO", // Represent financial economics
    slug: "fed-rate-cut-june",
    yesPrice: 0.76,
    noPrice: 0.24,
    volume24h: 3845000,
    liquidity: 1200000,
    volatility: 42,
    openInterest: 4200000,
    sentimentScore: 71,
    isHot: true,
    isTrending: false,
    isManipulated: false,
    resolutionDate: "2026-06-18",
    orderBookYes: generateInitialOrderBook(0.76),
    orderBookNo: generateInitialOrderBook(0.24)
  },
  {
    id: "poly-gpts-q4",
    title: "OpenAI to Release GPT-5 by Q4 2026",
    category: "TECH",
    slug: "openai-gpt5-release-q4",
    yesPrice: 0.35,
    noPrice: 0.65,
    volume24h: 6890000,
    liquidity: 2900000,
    volatility: 82,
    openInterest: 5100000,
    sentimentScore: 33,
    isHot: true,
    isTrending: true,
    isManipulated: true, // Tag as volatile/suspicious flow
    resolutionDate: "2026-12-31",
    orderBookYes: generateInitialOrderBook(0.35),
    orderBookNo: generateInitialOrderBook(0.65)
  },
  {
    id: "poly-btc-150k",
    title: "Bitcoin to Touch $150,000 in 2026",
    category: "CRYPTO",
    slug: "btc-150k-2026",
    yesPrice: 0.44,
    noPrice: 0.56,
    volume24h: 9120000,
    liquidity: 3700000,
    volatility: 55,
    openInterest: 6800000,
    sentimentScore: 49,
    isHot: false,
    isTrending: true,
    isManipulated: false,
    resolutionDate: "2026-12-31",
    orderBookYes: generateInitialOrderBook(0.44),
    orderBookNo: generateInitialOrderBook(0.56)
  },
  {
    id: "poly-apple-robot",
    title: "Apple to announce household robot in 2026",
    category: "TECH",
    slug: "apple-household-robot-2026",
    yesPrice: 0.18,
    noPrice: 0.82,
    volume24h: 1850000,
    liquidity: 650000,
    volatility: 75,
    openInterest: 1400000,
    sentimentScore: 22,
    isHot: false,
    isTrending: false,
    isManipulated: false,
    resolutionDate: "2026-10-30",
    orderBookYes: generateInitialOrderBook(0.18),
    orderBookNo: generateInitialOrderBook(0.82)
  },
  {
    id: "poly-mars-starship",
    title: "SpaceX Starship to land on Mars in 2026",
    category: "SCIENCE",
    slug: "spacex-mars-starship",
    yesPrice: 0.12,
    noPrice: 0.88,
    volume24h: 4600000,
    liquidity: 1800000,
    volatility: 91,
    openInterest: 3200000,
    sentimentScore: 15,
    isHot: true,
    isTrending: false,
    isManipulated: false,
    resolutionDate: "2026-12-31",
    orderBookYes: generateInitialOrderBook(0.12),
    orderBookNo: generateInitialOrderBook(0.88)
  },
  {
    id: "poly-oscars-best-picture",
    title: "Indie Art Film wins Best Picture 2027",
    category: "CULTURE",
    slug: "oscars-best-picture-2027",
    yesPrice: 0.29,
    noPrice: 0.71,
    volume24h: 960000,
    liquidity: 420000,
    volatility: 35,
    openInterest: 750000,
    sentimentScore: 40,
    isHot: false,
    isTrending: false,
    isManipulated: false,
    resolutionDate: "2027-03-10",
    orderBookYes: generateInitialOrderBook(0.29),
    orderBookNo: generateInitialOrderBook(0.71)
  }
];

// Whale Tracker Wallet List
let whales: WhaleWallet[] = [
  { address: "0x3e76fa9be723707010a34b2f1e2cd77be5e8f49a", label: "Politics Whales Corp", totalPnl: 1450200, unrealizedPnl: 340000, winrate: 74, totalTrades: 428, avgTradeSize: 120400, lastTradeTime: Date.now(), isCoordinated: false },
  { address: "0x892a0e4fd2c892eeffb779a83427be9dae8ffd39", label: "Alpha Quant Fund VII", totalPnl: 890450, unrealizedPnl: -24000, winrate: 68, totalTrades: 312, avgTradeSize: 85000, lastTradeTime: Date.now() - 400000, isCoordinated: true },
  { address: "0x7a30cf78efea8290312019ab76bc296f81dfda2e", label: "GigaDegen Capital", totalPnl: 2100800, unrealizedPnl: 180000, winrate: 61, totalTrades: 980, avgTradeSize: 154000, lastTradeTime: Date.now() - 900000, isCoordinated: true },
  { address: "0x00f89ae2349be8de7aefea8389ade0cb2481de37", label: "Smart Money Insight", totalPnl: 680000, unrealizedPnl: 105000, winrate: 80, totalTrades: 194, avgTradeSize: 45000, lastTradeTime: Date.now() - 1200000, isCoordinated: false },
  { address: "0xa6f84902cd7a83dcb724ef19e2cd1e2478ba109f", label: "Polymarket Insider #4", totalPnl: -140000, unrealizedPnl: -42000, winrate: 45, totalTrades: 89, avgTradeSize: 68000, lastTradeTime: Date.now() - 2400000, isCoordinated: false }
];

// Active AI Signals Generated
let signals: TradingSignal[] = [
  {
    id: "sig-default-1",
    marketId: "poly-us-election-2028",
    marketName: "US Presidential Election 2028 Winner",
    action: "BUY_YES",
    confidence: 88,
    risk: "MEDIUM",
    expectedROI: 14.5,
    whaleDetected: true,
    reasoning: "Whale wallet Politics Whales Corp accumulated $250k Yes contracts with aggressive bids. Orderbook imbalance reveals 75% buy pressure.",
    createdAt: Date.now() - 360000
  },
  {
    id: "sig-default-2",
    marketId: "poly-gpts-q4",
    marketName: "OpenAI to Release GPT-5 by Q4 2026",
    action: "BUY_NO",
    confidence: 74,
    risk: "HIGH",
    expectedROI: 22.1,
    whaleDetected: false,
    reasoning: "Major Bid exhaustion. Spread widened by 2.4c as liquidity drops on Yes. High probability technical downside mean-reversion signal.",
    createdAt: Date.now() - 120000
  }
];

// Active automated trading bots
let bots: BotConfig[] = [
  {
    id: "bot-scalp",
    name: "Polymarket Scalper-Core",
    strategy: "SCALPING",
    marketId: "poly-us-election-2028",
    isActive: true,
    allocationSize: 5000,
    stopLossPercent: 2.5,
    takeProfitPercent: 5.0,
    slippageLimitPercent: 0.5,
    maxDailyLoss: 1500,
    cooldownPeriodMs: 300000,
    isLive: false,
    tradesCount: 34,
    profitableTradesCount: 22,
    totalPnl: 1450
  },
  {
    id: "bot-momentum",
    name: "Velocity Momentum Eng v2",
    strategy: "MOMENTUM",
    marketId: "ALL",
    isActive: false,
    allocationSize: 10000,
    stopLossPercent: 4.0,
    takeProfitPercent: 12.0,
    slippageLimitPercent: 1.0,
    maxDailyLoss: 3000,
    cooldownPeriodMs: 600000,
    isLive: false,
    tradesCount: 18,
    profitableTradesCount: 11,
    totalPnl: -240
  },
  {
    id: "bot-mmrevent",
    name: "SMC Mean Reversion Engine",
    strategy: "MEAN_REVERSION",
    marketId: "poly-gpts-q4",
    isActive: true,
    allocationSize: 7500,
    stopLossPercent: 3.5,
    takeProfitPercent: 8.0,
    slippageLimitPercent: 0.8,
    maxDailyLoss: 2000,
    cooldownPeriodMs: 900000,
    isLive: false,
    tradesCount: 41,
    profitableTradesCount: 28,
    totalPnl: 2890
  }
];

// User portfolio details
let cashBalance = 87450.00; // Unlocked USD cash
let initialEquity = 100000.00;
let userPositions: Position[] = [
  {
    id: "pos-1",
    marketId: "poly-us-election-2028",
    marketName: "US Presidential Election 2028 Winner",
    outcome: "YES",
    shares: 15000, // YES contracts
    avgBuyPrice: 0.50, // cash deployed = $7,500
    currentPrice: 0.52, // currentValue = $7,800
    totalCost: 7500.00,
    currentValue: 7800.00,
    unrealizedPnL: 300.00,
    createdAt: Date.now() - 360000
  },
  {
    id: "pos-2",
    marketId: "poly-fed-rate-june",
    marketName: "Fed Interest Rate Cut in June Meeting",
    outcome: "YES",
    shares: 8000,
    avgBuyPrice: 0.74, // cash deployed = $5,920
    currentPrice: 0.76, // value = $6,080
    totalCost: 5920.00,
    currentValue: 6080.00,
    unrealizedPnL: 160.00,
    createdAt: Date.now() - 100000
  }
];

let tradeLogs: TradeLog[] = [
  {
    id: "trade-log-1",
    marketId: "poly-us-election-2028",
    marketName: "US Presidential Election 2028 Winner",
    outcome: "YES",
    type: "BUY",
    shares: 15000,
    price: 0.50,
    totalValue: 7500.00,
    timestamp: Date.now() - 360000,
    executionLatencyMs: 42
  },
  {
    id: "trade-log-2",
    marketId: "poly-fed-rate-june",
    marketName: "Fed Interest Rate Cut in June Meeting",
    outcome: "YES",
    type: "BUY",
    shares: 8000,
    price: 0.74,
    totalValue: 5920.00,
    timestamp: Date.now() - 100000,
    executionLatencyMs: 38
  }
];

// Historical Equity Curve point tracking (simulating last 30 hours)
let equityHistory: { timestamp: number; value: number }[] = [];
const nowTime = Date.now();
for (let i = 30; i >= 0; i--) {
  const stepTime = nowTime - (i * 3600000);
  const pnlChange = (30 - i) * 110 + (Math.sin(i * 1.5) * 450);
  equityHistory.push({
    timestamp: Math.floor(stepTime / 1000), // Seconds timestamp for lightweight charts
    value: initialEquity + pnlChange
  });
}

// System Alerts Log
let alerts: SystemAlert[] = [
  { id: "alert-1", type: "SIGNAL", title: "Institutional AI Signal Found", message: "BUY YES signal detected for US Elections with 88% confidence.", timestamp: Date.now() - 360000, severity: "INFO", marketId: "poly-us-election-2028" },
  { id: "alert-2", type: "WHALE", title: "Massive Buy Accumulation", message: "Politics Whales Corp spent $250k YES contracts on US Elections.", timestamp: Date.now() - 360000, severity: "WARNING", marketId: "poly-us-election-2028" },
  { id: "alert-3", type: "MANIPULATION", title: "Anomalous Price Action", message: "Coordinated purchasing pattern detected for OpenAI Release GPT-5 by Q4.", timestamp: Date.now() - 200000, severity: "CRITICAL", marketId: "poly-gpts-q4" }
];

// -----------------------------------------------------------------------------
// ANALYTICAL GENERATOR HELPERS
// -----------------------------------------------------------------------------

function generateInitialOrderBook(midPrice: number): OrderBook {
  const bids: BookLevel[] = [];
  const asks: BookLevel[] = [];
  
  // Mid price is e.g. 0.52. Bids starting at 0.51 scale down. Asks starting at 0.53 scale up.
  for (let i = 1; i <= 8; i++) {
    const bidPrice = Math.max(0.01, Number((midPrice - i * 0.01).toFixed(2)));
    const bidSize = Math.floor(10000 / (i * 0.8) + Math.random() * 5000);
    
    const askPrice = Math.min(0.99, Number((midPrice + (i - 1) * 0.01).toFixed(2))); // Close spread
    const askSize = Math.floor(12000 / (i * 0.8) + Math.random() * 5000);
    
    if (bids.findIndex(b => b.price === bidPrice) === -1) bids.push({ price: bidPrice, size: bidSize });
    if (asks.findIndex(a => a.price === askPrice) === -1) asks.push({ price: askPrice, size: askSize });
  }

  bids.sort((s1, s2) => s2.price - s1.price);
  asks.sort((s1, s2) => s1.price - s2.price);

  const bestBid = bids[0]?.price || (midPrice - 0.01);
  const bestAsk = asks[0]?.price || (midPrice + 0.01);
  const spread = Number((bestAsk - bestBid).toFixed(2));
  const bidSum = bids.reduce((acc, l) => acc + l.size, 0);
  const askSum = asks.reduce((acc, l) => acc + l.size, 0);
  const imbalance = (bidSum - askSum) / (bidSum + askSum || 1);

  return { bids, asks: asks.slice(0, 8), imbalance, spread };
}

// -----------------------------------------------------------------------------
// LIVE SIMULATION INTERVALS (BROUNDS & WHALES AND SIGNAL BOTS DETECTORS)
// -----------------------------------------------------------------------------

// Active simulation for price ticks (Every 1.8 seconds)
setInterval(() => {
  markets = markets.map(market => {
    // Apply brownian step to yesPrice
    const vol = market.volatility / 1000; // Volatility scaling
    const step = (Math.random() - 0.5) * vol;
    let newYes = Number((market.yesPrice + step).toFixed(2));
    if (newYes < 0.03) newYes = 0.03;
    if (newYes > 0.97) newYes = 0.97;
    
    const newNo = Number((1.00 - newYes).toFixed(2));

    // Dynamic metrics fluctuation
    const volumeStep = Math.floor(Math.random() * 8000 + 1000);
    const liqStep = (Math.random() - 0.48) * 1500;
    const oiStep = Math.floor((Math.random() - 0.5) * 5000);

    // Re-generate orderbooks based on new prices
    const yesBook = generateInitialOrderBook(newYes);
    const noBook = generateInitialOrderBook(newNo);
    
    // Anomaly score/manipulation status is evaluated
    const isImbalanced = Math.abs(yesBook.imbalance) > 0.65;
    const isFluctuating = market.volatility > 75;

    return {
      ...market,
      yesPrice: newYes,
      noPrice: newNo,
      volume24h: market.volume24h + volumeStep,
      liquidity: Number((market.liquidity + liqStep).toFixed(2)),
      openInterest: Math.max(100000, market.openInterest + oiStep),
      isManipulated: isImbalanced && isFluctuating ? true : market.isManipulated,
      orderBookYes: yesBook,
      orderBookNo: noBook
    };
  });

  broadcastToAll({ type: "MARKETS_UPDATE", payload: markets });
}, 1800);

// Random Whale transaction generation (Every 4.5 seconds)
setInterval(() => {
  const selectedMarket = markets[Math.floor(Math.random() * markets.length)];
  const selectedWhale = whales[Math.floor(Math.random() * whales.length)];
  
  const outcomeSelected = Math.random() > 0.45 ? "YES" : "NO";
  const tradeType = Math.random() > 0.3 ? "BUY" : "SELL";
  const marketPrice = outcomeSelected === "YES" ? selectedMarket.yesPrice : selectedMarket.noPrice;
  
  // Institutional scale
  const size = Math.floor(50000 + Math.random() * 250000);
  const totalValue = size * marketPrice;
  const isSuspicious = totalValue > 100000 && Math.random() > 0.75;
  const anomalyScore = isSuspicious ? Math.floor(75 + Math.random() * 23) : Math.floor(10 + Math.random() * 40);

  const tx: WhaleTransaction = {
    id: `tx-whale-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    walletAddress: selectedWhale.address,
    walletLabel: selectedWhale.label,
    marketId: selectedMarket.id,
    marketName: selectedMarket.title,
    outcomeSelected,
    type: tradeType,
    price: marketPrice,
    size,
    totalValue,
    timestamp: Date.now(),
    anomalyScore
  };

  // Update whale's leaderboard metrics
  selectedWhale.totalTrades += 1;
  selectedWhale.lastTradeTime = Date.now();
  if (tradeType === "BUY") {
    selectedWhale.unrealizedPnl += isSuspicious ? 12000 : -3500;
  } else {
    selectedWhale.totalPnl += isSuspicious ? 18000 : 2500;
  }
  selectedWhale.winrate = Math.min(95, Math.max(40, selectedWhale.winrate + (Math.random() > 0.48 ? 1 : -1)));

  // If anomalous buy is flag-worthy, log alerts
  if (anomalyScore > 70) {
    const manipAlert: SystemAlert = {
      id: `alert-whale-${Date.now()}`,
      type: "WHALE",
      title: "Vast Smart Flow Active",
      message: `${selectedWhale.label || selectedWhale.address.slice(0,6)} order of $${totalValue.toLocaleString()} detected on ${selectedMarket.title}. Anomaly: ${anomalyScore}/100.`,
      timestamp: Date.now(),
      severity: "CRITICAL",
      marketId: selectedMarket.id
    };
    alerts.unshift(manipAlert);
    if (alerts.length > 50) alerts.pop();
    broadcastToAll({ type: "ALERT", payload: manipAlert });
  }

  broadcastToAll({ type: "WHALE_TRANS", payload: tx });
  broadcastToAll({ type: "PORTFOLIO_UPDATE", payload: compilePortfolioSummary() });
}, 4500);

// AI Signal analysis Engine (Every 8 seconds decides on market trade ideas)
setInterval(() => {
  if (Math.random() > 0.45) { // Probability threshold for new signal
    const selectedMarket = markets[Math.floor(Math.random() * markets.length)];
    const isYesHeavy = selectedMarket.orderBookYes.imbalance > 0.2;
    const isTrending = selectedMarket.isTrending;
    
    const actions: SignalAction[] = isYesHeavy ? ["BUY_YES", "HOLD"] : ["BUY_NO", "EXIT"];
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    if (action === "HOLD" || action === "EXIT") return; // Filter for immediate buy signals

    const confidence = Math.floor(65 + Math.random() * 32);
    const risk: RiskLevel = selectedMarket.volatility > 70 ? "HIGH" : (selectedMarket.volatility > 45 ? "MEDIUM" : "LOW");
    const expectedROI = Number((Math.random() * 15 + 5).toFixed(1));
    const whaleDetected = selectedMarket.volume24h > 5000000;

    let reasoning = "";
    if (action === "BUY_YES") {
      reasoning = `Advanced orderbook scans show Yes volume delta of ${Math.floor(Math.random()*40+10)}% with a spread of ${selectedMarket.orderBookYes.spread}c. Whale accumulation confirmed on standard address aggregates.`;
    } else {
      reasoning = `Vaporizing orderbook bids paired with sudden liquidity withdrawals. Strong Momentum Divergence detected over institutional mean intervals for holding No.`;
    }

    const signal: TradingSignal = {
      id: `sig-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      marketId: selectedMarket.id,
      marketName: selectedMarket.title,
      action,
      confidence,
      risk,
      expectedROI,
      whaleDetected,
      reasoning,
      createdAt: Date.now()
    };

    signals.unshift(signal);
    if (signals.length > 50) signals.pop();

    broadcastToAll({ type: "SIGNAL_NEW", payload: signal });

    // Inform user through notification alert
    const alert: SystemAlert = {
      id: `alert-sig-${Date.now()}`,
      type: "SIGNAL",
      title: `New AI ${action} generated`,
      message: `${selectedMarket.title} (${confidence}% confidence, expected PnL: +${expectedROI}%)`,
      timestamp: Date.now(),
      severity: confidence > 85 ? "WARNING" : "INFO",
      marketId: selectedMarket.id
    };
    alerts.unshift(alert);
    broadcastToAll({ type: "ALERT", payload: alert });

    // Execute Auto-trade trigger for any active bot with matching parameters
    executeBotStrategy(signal);
  }
}, 8000);

// Portofolio pricing update (Every 2 seconds recalculates cash limits and aggregates valuations)
setInterval(() => {
  recalculateUserPortfolio();
  broadcastToAll({ type: "PORTFOLIO_UPDATE", payload: compilePortfolioSummary() });
}, 2000);

// System telemetry metrics stream (Every 5 seconds)
setInterval(() => {
  const telemetry: SystemHealth = {
    websocketConnected: true,
    apiLatencyMs: Math.floor(10 + Math.random() * 15),
    cpuUsagePercent: Math.floor(5 + Math.random() * 10),
    memoryUsageMb: Math.floor(75 + Math.random() * 20),
    activeSocketsCount: clients.size,
    geminiApiStatus: "ONLINE",
    polymarketApiStatus: "ONLINE"
  };
  broadcastToAll({ type: "SYSTEM_HEALTH", payload: telemetry });
}, 5000);

// -----------------------------------------------------------------------------
// BOT EXECUTION LOGIC
// -----------------------------------------------------------------------------

function executeBotStrategy(signal: TradingSignal) {
  const matchingBots = bots.filter(bot => 
    bot.isActive && 
    (bot.marketId === "ALL" || bot.marketId === signal.marketId)
  );

  matchingBots.forEach(bot => {
    // Run core parameters checks: max loss threshold, spread filters or allocation constraints
    const market = markets.find(m => m.id === signal.marketId);
    if (!market) return;

    const outcome: "YES" | "NO" = signal.action === "BUY_YES" ? "YES" : "NO";
    const price = outcome === "YES" ? market.yesPrice : market.noPrice;

    // Check spread limit
    const spreadLimit = 0.08;
    const currentSpread = outcome === "YES" ? market.orderBookYes.spread : market.orderBookNo.spread;
    if (currentSpread > spreadLimit) {
      logBotAction(bot, signal.marketId, market.title, "REJECTED", `Spread limit exceeded: ${currentSpread} > ${spreadLimit}`);
      return;
    }

    // Determine capital deployment limits
    const costToDeploy = Math.min(cashBalance, bot.allocationSize);
    if (costToDeploy < 100) return; // Insufficient cash

    // Buy shares calculation
    const sharesNum = Math.floor(costToDeploy / price);
    if (sharesNum <= 0) return;

    const finalCost = sharesNum * price;
    cashBalance = Number((cashBalance - finalCost).toFixed(2));

    // Inject position or top-up active
    const positionIndex = userPositions.findIndex(pos => pos.marketId === signal.marketId && pos.outcome === outcome);
    
    if (positionIndex !== -1) {
      const pos = userPositions[positionIndex];
      const newShares = pos.shares + sharesNum;
      const newCost = pos.totalCost + finalCost;
      userPositions[positionIndex] = {
        ...pos,
        shares: newShares,
        totalCost: newCost,
        avgBuyPrice: Number((newCost / newShares).toFixed(4)),
        createdAt: Date.now()
      };
    } else {
      userPositions.push({
        id: `pos-bot-${Date.now()}-${Math.floor(Math.random()*100)}`,
        marketId: signal.marketId,
        marketName: market.title,
        outcome,
        shares: sharesNum,
        avgBuyPrice: price,
        currentPrice: price,
        totalCost: finalCost,
        currentValue: finalCost,
        unrealizedPnL: 0,
        createdAt: Date.now()
      });
    }

    // Capture logs
    const logId = `trade-log-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const latency = Math.floor(25 + Math.random() * 20); // ms
    const logEntry: TradeLog = {
      id: logId,
      botId: bot.id,
      botName: bot.name,
      marketId: signal.marketId,
      marketName: market.title,
      outcome,
      type: "BUY",
      shares: sharesNum,
      price,
      totalValue: finalCost,
      timestamp: Date.now(),
      executionLatencyMs: latency
    };
    tradeLogs.unshift(logEntry);
    bot.tradesCount += 1;

    // Send alert to users
    const alertMsg: SystemAlert = {
      id: `alert-exec-${Date.now()}`,
      type: "EXECUTION",
      title: `${bot.name} Executed BUY`,
      message: `Aegis Bot filled ${sharesNum.toLocaleString()} shares of ${outcome} on ${market.title} at ${price}c. Latency: ${latency}ms.`,
      timestamp: Date.now(),
      severity: "INFO",
      marketId: signal.marketId
    };
    alerts.unshift(alertMsg);

    broadcastToAll({ type: "TRADE_LOG_NEW", payload: logEntry });
    broadcastToAll({ type: "ALERT", payload: alertMsg });
    broadcastToAll({ type: "BOTS_UPDATE", payload: bots });
  });
}

function logBotAction(bot: BotConfig, marketId: string, marketName: string, action: string, message: string) {
  const alert: SystemAlert = {
    id: `alert-bot-reject-${Date.now()}`,
    type: "RISK_LIMIT",
    title: `${bot.name} Entry Blocked`,
    message: `${marketName}: ${message}`,
    timestamp: Date.now(),
    severity: "WARNING",
    marketId
  };
  alerts.unshift(alert);
  broadcastToAll({ type: "ALERT", payload: alert });
}

function recalculateUserPortfolio() {
  let unrealizedTotal = 0;
  
  userPositions = userPositions.map(pos => {
    const market = markets.find(m => m.id === pos.marketId);
    if (!market) return pos;

    const currentPrice = pos.outcome === "YES" ? market.yesPrice : market.noPrice;
    const value = pos.shares * currentPrice;
    const pnl = Number((value - pos.totalCost).toFixed(2));
    unrealizedTotal += pnl;

    // Simulate Bot Trailing Stop & Take Profit validations!
    const pctPnl = (pnl / pos.totalCost) * 100;

    // Find any bot that filled this position
    const fillingBot = bots.find(b => b.marketId === pos.marketId || b.marketId === "ALL");
    
    if (fillingBot && fillingBot.isActive) {
      const isSLHit = pctPnl <= -fillingBot.stopLossPercent;
      const isTPHit = pctPnl >= fillingBot.takeProfitPercent;

      if (isSLHit || isTPHit) {
        // Trigger exit trade execution
        setTimeout(() => {
          triggerPositionExit(pos, isSLHit ? "STOP_LOSS" : "TAKE_PROFIT", currentPrice, fillingBot);
        }, 50);
      }
    }

    return {
      ...pos,
      currentPrice,
      currentValue: Number(value.toFixed(2)),
      unrealizedPnL: pnl
    };
  });

  const totalValue = Number((cashBalance + userPositions.reduce((acc, p) => acc + p.currentValue, 0)).toFixed(2));
  
  // Track continuous returns in equity graph every hour or tick
  const curTimeSec = Math.floor(Date.now() / 1000);
  if (equityHistory.length === 0 || equityHistory[equityHistory.length - 1].timestamp < curTimeSec - 5) {
    equityHistory.push({
      timestamp: curTimeSec,
      value: totalValue
    });
    if (equityHistory.length > 50) {
      equityHistory.shift();
    }
  }
}

function triggerPositionExit(pos: Position, reason: "STOP_LOSS" | "TAKE_PROFIT" | "MANUAL", price: number, bot?: BotConfig) {
  // Prevent double exit execution
  const currentPosIdx = userPositions.findIndex(p => p.id === pos.id);
  if (currentPosIdx === -1) return;

  const currentPos = userPositions[currentPosIdx];
  const proceeds = currentPos.shares * price;
  cashBalance = Number((cashBalance + proceeds).toFixed(2));

  const earnedPnL = Number((proceeds - currentPos.totalCost).toFixed(2));

  // Record trade log
  const exitLog: TradeLog = {
    id: `trade-log-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    botId: bot?.id,
    botName: bot?.name,
    marketId: currentPos.marketId,
    marketName: currentPos.marketName,
    outcome: currentPos.outcome,
    type: "SELL",
    shares: currentPos.shares,
    price,
    totalValue: proceeds,
    timestamp: Date.now(),
    executionLatencyMs: Math.floor(18 + Math.random() * 12),
    exitReason: reason,
    isPnLLogged: true,
    pnlEarned: earnedPnL
  };

  tradeLogs.unshift(exitLog);

  // Update Bot details if and when filled by bot
  if (bot) {
    bot.totalPnl += earnedPnL;
    if (earnedPnL > 0) {
      bot.profitableTradesCount += 1;
    }
    broadcastToAll({ type: "BOTS_UPDATE", payload: bots });
  }

  // Erase from positions
  userPositions.splice(currentPosIdx, 1);

  // Dispatch alert notification
  const exitAlert: SystemAlert = {
    id: `alert-exit-${Date.now()}`,
    type: "EXECUTION",
    title: `${reason === "MANUAL" ? "Manual Portfolio" : (bot?.name || "Bot")} Closed Position`,
    message: `${currentPos.marketName}: Sold ${currentPos.shares.toLocaleString()} YES contracts for $${proceeds.toLocaleString()} (${reason}). Net Return: ${earnedPnL >= 0 ? "+" : ""}$${earnedPnL}.`,
    timestamp: Date.now(),
    severity: earnedPnL < 0 ? "CRITICAL" : "WARNING",
    marketId: currentPos.marketId
  };
  alerts.unshift(exitAlert);

  broadcastToAll({ type: "TRADE_LOG_NEW", payload: exitLog });
  broadcastToAll({ type: "ALERT", payload: exitAlert });
  broadcastToAll({ type: "PORTFOLIO_UPDATE", payload: compilePortfolioSummary() });
}

function compilePortfolioSummary(): PortfolioSummary {
  const currentPositionsValue = userPositions.reduce((acc, p) => acc + p.currentValue, 0);
  const totalBalance = cashBalance + currentPositionsValue;
  
  const totalClosedTrades = tradeLogs.filter(t => t.type === "SELL" && t.isPnLLogged);
  const wonClosedTrades = totalClosedTrades.filter(t => (t.pnlEarned || 0) > 0);
  const totalProfitsVal = totalClosedTrades.filter(t => (t.pnlEarned || 0) > 0).reduce((acc, t) => acc + (t.pnlEarned || 0), 0);
  const totalLossesVal = Math.abs(totalClosedTrades.filter(t => (t.pnlEarned || 0) < 0).reduce((acc, t) => acc + (t.pnlEarned || 0), 0));
  
  const winrate = totalClosedTrades.length > 0 ? Math.floor((wonClosedTrades.length / totalClosedTrades.length) * 100) : 60;
  const profitFactor = totalLossesVal > 0 ? Number((totalProfitsVal / totalLossesVal).toFixed(2)) : 1.45;
  const unrealized = userPositions.reduce((sum, p) => sum + p.unrealizedPnL, 0);
  const realizedVal = totalClosedTrades.reduce((acc, t) => acc + (t.pnlEarned || 0), 1850);

  return {
    totalBalance: Number(totalBalance.toFixed(2)),
    cashBalance: Number(cashBalance.toFixed(2)),
    realizedPnL: realizedVal,
    unrealizedPnL: Number(unrealized.toFixed(2)),
    winrate,
    sharpeRatio: 2.14,
    profitFactor,
    exposure: Number(currentPositionsValue.toFixed(2)),
    positions: userPositions,
    equityHistory: equityHistory
  };
}

function broadcastToAll(message: WebSocketEvent) {
  const data = JSON.stringify({
    ...message,
    timestamp: Date.now()
  });

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// -----------------------------------------------------------------------------
// WEBSOCKET INCOMING ACTIONS ROUTING
// -----------------------------------------------------------------------------

wss.on("connection", (ws: WebSocket) => {
  clients.add(ws);

  // Send baseline data dump on initial handshakes (TDD sync)
  const initialPayload = {
    markets,
    whales,
    signals,
    positions: userPositions,
    cash: cashBalance
  };

  ws.send(JSON.stringify({
    type: "INIT",
    payload: initialPayload,
    timestamp: Date.now()
  }));

  ws.on("message", (message: string) => {
    try {
      const parsedData = JSON.parse(message);
      const { type, payload } = parsedData;

      switch (type) {
        case "MANUAL_TRADE": {
          const { marketId, outcome, tradeType, shares, price } = payload;
          const market = markets.find(m => m.id === marketId);
          if (!market) return;

          const executionPrice = outcome === "YES" ? market.yesPrice : market.noPrice;
          const cost = shares * executionPrice;

          if (tradeType === "BUY") {
            if (cashBalance < cost) {
              ws.send(JSON.stringify({
                type: "ALERT",
                payload: {
                  id: `alert-err-${Date.now()}`,
                  type: "RISK_LIMIT",
                  title: "Insufficient Balance",
                  message: `Cannot purchase ${shares.toLocaleString()} contracts. Required: $${cost.toLocaleString()} but Cash: $${cashBalance.toLocaleString()}`,
                  timestamp: Date.now(),
                  severity: "CRITICAL"
                }
              }));
              return;
            }

            // Decrement cash
            cashBalance = Number((cashBalance - cost).toFixed(2));
            const existingPosIdx = userPositions.findIndex(p => p.marketId === marketId && p.outcome === outcome);
            if (existingPosIdx !== -1) {
              const pos = userPositions[existingPosIdx];
              const totalCost = pos.totalCost + cost;
              const newShares = pos.shares + shares;
              userPositions[existingPosIdx] = {
                ...pos,
                shares: newShares,
                totalCost,
                avgBuyPrice: Number((totalCost / newShares).toFixed(4)),
                createdAt: Date.now()
              };
            } else {
              userPositions.push({
                id: `pos-${Date.now()}`,
                marketId,
                marketName: market.title,
                outcome,
                shares,
                avgBuyPrice: executionPrice,
                currentPrice: executionPrice,
                totalCost: cost,
                currentValue: cost,
                unrealizedPnL: 0,
                createdAt: Date.now()
              });
            }

            const buyLog: TradeLog = {
              id: `log-${Date.now()}`,
              marketId,
              marketName: market.title,
              outcome,
              type: "BUY",
              shares,
              price: executionPrice,
              totalValue: cost,
              timestamp: Date.now(),
              executionLatencyMs: 14 // fast manual fill
            };
            tradeLogs.unshift(buyLog);
            
            const manualAlert: SystemAlert = {
              id: `alert-man-${Date.now()}`,
              type: "EXECUTION",
              title: "Manual Trade Executed",
              message: `Successfully purchased ${shares.toLocaleString()} shares of ${outcome} on ${market.title} at ${executionPrice}c.`,
              timestamp: Date.now(),
              severity: "INFO",
              marketId
            };
            alerts.unshift(manualAlert);

            broadcastToAll({ type: "TRADE_LOG_NEW", payload: buyLog });
            broadcastToAll({ type: "ALERT", payload: manualAlert });
            broadcastToAll({ type: "PORTFOLIO_UPDATE", payload: compilePortfolioSummary() });
          } else {
            // SELL - manual liquification limit
            const idx = userPositions.findIndex(p => p.marketId === marketId && p.outcome === outcome);
            if (idx === -1) return;
            const pos = userPositions[idx];
            triggerPositionExit(pos, "MANUAL", executionPrice);
          }
          break;
        }

        case "UPDATE_BOTS": {
          const { botId, isActive, stopLossPercent, takeProfitPercent, allocationSize } = payload;
          const botIdx = bots.findIndex(b => b.id === botId);
          if (botIdx !== -1) {
            bots[botIdx] = {
              ...bots[botIdx],
              isActive,
              stopLossPercent: stopLossPercent ?? bots[botIdx].stopLossPercent,
              takeProfitPercent: takeProfitPercent ?? bots[botIdx].takeProfitPercent,
              allocationSize: allocationSize ?? bots[botIdx].allocationSize
            };
            
            const configAlert: SystemAlert = {
              id: `alert-bot-cfg-${Date.now()}`,
              type: "EXECUTION",
              title: `${bots[botIdx].name} Config Updated`,
              message: `Status: ${isActive ? "ACTIVE" : "STANDBY"}. Alloc: $${bots[botIdx].allocationSize}, SL: ${bots[botIdx].stopLossPercent}%, TP: ${bots[botIdx].takeProfitPercent}%`,
              timestamp: Date.now(),
              severity: "INFO"
            };
            alerts.unshift(configAlert);
            
            broadcastToAll({ type: "BOTS_UPDATE", payload: bots });
            broadcastToAll({ type: "ALERT", payload: configAlert });
          }
          break;
        }

        case "TRIGGER_BACKTEST": {
          const { strategy, marketId, days } = payload;
          const selectedM = markets.find(m => m.id === marketId) || markets[0];
          
          // Generate realistic sequence of 100 historical intervals
          const tradesSeq: any[] = [];
          const dataBars: any[] = [];
          let currentPrice = selectedM.yesPrice;
          let currentEquity = 10000;
          let highestEquity = 10000;
          let maxDrawdown = 0;
          let wins = 0;
          let loss = 0;
          
          for (let i = 0; i < 100; i++) {
            const time = Math.floor((Date.now() - (100 - i) * 3600000) / 1000);
            
            // High frequency updates
            const vol = selectedM.volatility / 100;
            const change = (Math.random() - 0.49) * vol * 0.05;
            currentPrice = Number(Math.max(0.05, Math.min(0.95, currentPrice + change)).toFixed(3));
            dataBars.push({ time, value: currentPrice });

            // Apply strategy mock logic over intervals
            const isEntryTrigger = (strategy === "SCALPING" && i % 8 === 0) ||
                                  (strategy === "MOMENTUM" && i % 12 === 0) ||
                                  (strategy === "BREAKOUT" && i % 15 === 0) ||
                                  (strategy === "MEAN_REVERSION" && i % 10 === 0) ||
                                  (Math.random() > 0.85);

            if (isEntryTrigger) {
              const dir = Math.random() > 0.45 ? "YES" : "NO";
              const entryPrice = currentPrice;
              // Exit calculated standardly after random short drift
              const drift = (Math.random() - 0.45) * 0.12;
              let exitPrice = Number(Math.max(0.01, Math.min(0.99, entryPrice + drift)).toFixed(3));
              const tradeReturn = dir === "YES" ? (exitPrice - entryPrice) : (entryPrice - exitPrice);
              
              const pnlEarned = Math.floor(tradeReturn * 30000);
              currentEquity += pnlEarned;
              if (currentEquity > highestEquity) highestEquity = currentEquity;
              const dd = ((highestEquity - currentEquity) / highestEquity) * 100;
              if (dd > maxDrawdown) maxDrawdown = dd;

              if (pnlEarned > 0) wins++;
              else if (pnlEarned < 0) loss++;

              tradesSeq.push({
                index: i,
                outcome: dir,
                type: "BUY",
                price: entryPrice,
                exitPrice,
                pnl: pnlEarned,
                success: pnlEarned > 0,
                timestamp: time * 1000
              });
            }
          }
          
          const totalProfitPct = Number((((currentEquity - 10000) / 10000) * 100).toFixed(2));
          const totalTrades = wins + loss || 1;
          const winrate = Math.floor((wins / totalTrades) * 100);

          // Return result directly
          ws.send(JSON.stringify({
            type: "BACKTEST_RESULT",
            payload: {
              strategy,
              marketId,
              marketName: selectedM.title,
              winrate,
              sharpeRatio: Number((1.5 + Math.random() * 1.5).toFixed(2)),
              drawdown: Number(maxDrawdown.toFixed(2)),
              totalReturnPercent: totalProfitPct,
              tradesPlaced: totalTrades,
              trades: tradesSeq,
              equityHistory: dataBars
            },
            timestamp: Date.now()
          }));
          break;
        }
      }
    } catch (err) {
      console.error("Payload decoding error in WebSocket connection:", err);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
  });
});

// -----------------------------------------------------------------------------
// EXPRESS STANDARD REST API ENDPOINTS
// -----------------------------------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    activeSockets: clients.size,
    timestamp: Date.now()
  });
});

app.get("/api/data/static", (req, res) => {
  res.json({
    markets,
    whales,
    signals,
    portfolio: compilePortfolioSummary(),
    alerts
  });
});

// Serve Vite dynamic assets based on environment configuration
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa"
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Bind to port 3000
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Institutional Polymarket AI Terminal running on http://localhost:${PORT}`);
});
