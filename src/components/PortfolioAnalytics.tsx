/**
 * Aegis Polymarket AI Terminal - Institutional Portfolio Analytics & Live Equity Curves
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useTerminal } from "../context/TerminalContext";
import { TerminalChart } from "./charts/TerminalChart";
import { TrendingUp, Award, DollarSign, Percent, ShieldAlert, ArrowDownRight, RefreshCw, Layers } from "lucide-react";

export const PortfolioAnalytics: React.FC = () => {
  const { portfolio, placeManualTrade } = useTerminal();

  if (!portfolio) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 font-mono">
        <RefreshCw className="h-8 w-8 animate-spin mb-3 text-emerald-400" />
        RECALCULATING BALANCES AND EXPOSURES...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* SECTION 1: TOP EXECUTIVE METRICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {/* Metric 1 */}
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1">
          <span className="text-[10px] font-mono font-medium text-slate-500 uppercase block">NET EQUITY</span>
          <span className="text-lg font-mono font-bold text-white block">${portfolio.totalBalance.toLocaleString()}</span>
          <span className={`text-[10px] font-mono block font-semibold ${portfolio.unrealizedPnL >= 0 ? "text-emerald-400" : "text-rose-500"}`}>
            {portfolio.unrealizedPnL >= 0 ? "+" : ""}${portfolio.unrealizedPnL.toLocaleString()} UNREAL
          </span>
        </div>

        {/* Metric 2 */}
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1">
          <span className="text-[10px] font-mono font-medium text-slate-500 uppercase block">CASH BALANCE</span>
          <span className="text-lg font-mono font-bold text-emerald-400 block">${portfolio.cashBalance.toLocaleString()}</span>
          <span className="text-[10px] font-mono text-slate-500 block">AVAILABLE</span>
        </div>

        {/* Metric 3 */}
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1">
          <span className="text-[10px] font-mono font-medium text-slate-500 uppercase block">REALIZED GAINS</span>
          <span className="text-lg font-mono font-bold text-slate-100 block">${portfolio.realizedPnL.toLocaleString()}</span>
          <span className="text-[10px] font-mono text-emerald-400 block font-semibold">+{(portfolio.realizedPnL / 1000).toFixed(1)}% Cum</span>
        </div>

        {/* Metric 4 */}
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1">
          <span className="text-[10px] font-mono font-medium text-slate-500 uppercase block">WIN RATE</span>
          <span className="text-lg font-mono font-bold text-white block">{portfolio.winrate}%</span>
          <span className="text-[10px] font-mono text-slate-500 block">CLOSED TRADES</span>
        </div>

        {/* Metric 5 */}
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1">
          <span className="text-[10px] font-mono font-medium text-slate-500 uppercase block">SHARPE RATIO</span>
          <span className="text-lg font-mono font-bold text-amber-500 block">{portfolio.sharpeRatio}</span>
          <span className="text-[10px] font-mono text-slate-500 block">RISK ADJUSTED</span>
        </div>

        {/* Metric 6 */}
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1">
          <span className="text-[10px] font-mono font-medium text-slate-500 uppercase block">PROFIT FACTOR</span>
          <span className="text-lg font-mono font-bold text-slate-100 block">{portfolio.profitFactor}</span>
          <span className="text-[10px] font-mono text-emerald-400 block font-semibold">STABLE</span>
        </div>
      </div>

      {/* SECTION 2: CHARTS AND ACTIVE POSITIONS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART COLUMN */}
        <div className="lg:col-span-2">
          {/* Render continuous line charts using lightweight-charts */}
          <TerminalChart
            data={portfolio.equityHistory}
            title="Aegis Automated Cumulative Net Returns ($)"
            isArea={true}
          />
        </div>

        {/* ACTIVE POSITIONS COLUMN */}
        <div className="flex flex-col rounded-lg border border-slate-800 bg-slate-950 p-4">
          <div className="mb-4">
            <h2 className="font-sans text-base font-bold text-white flex items-center gap-1.5 leading-none">
              <Layers className="h-4 w-4 text-emerald-400" />
              HELD EXPOSURE POSITIONS
            </h2>
            <span className="text-[10px] font-mono text-slate-500">
              LOCKED EXPOSURE: ${portfolio.exposure.toLocaleString()}
            </span>
          </div>

          <div className="flex-grow overflow-y-auto space-y-3.5 max-h-[300px] pr-1">
            {portfolio.positions.map(pos => (
              <div key={pos.id} className="p-3 bg-slate-900/40 border border-slate-905 rounded font-mono text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400">MARKET PORTFOLIO ENTRY</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    pos.unrealizedPnL >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-500"
                  }`}>
                    {pos.unrealizedPnL >= 0 ? "+" : ""}${pos.unrealizedPnL.toLocaleString()}
                  </span>
                </div>

                <p className="font-sans font-semibold text-xs text-white leading-tight mb-2 line-clamp-1">{pos.marketName}</p>

                <div className="grid grid-cols-3 gap-1 mb-3 text-[10px] uppercase text-slate-500 leading-tight">
                  <div>
                    <span>Shares Unit</span>
                    <span className="block text-slate-300 font-bold font-mono text-xs mt-0.5">{pos.shares.toLocaleString()}</span>
                  </div>
                  <div>
                    <span>AVG / CURR</span>
                    <span className="block text-slate-300 font-bold font-mono text-xs mt-0.5">{pos.avgBuyPrice}c / {pos.currentPrice}c</span>
                  </div>
                  <div>
                    <span>Total Cost</span>
                    <span className="block text-slate-300 font-bold font-mono text-xs mt-0.5">${(pos.totalCost).toLocaleString()}</span>
                  </div>
                </div>

                {/* LIQUIDATE BUTTON ACTION */}
                <button
                  onClick={() => placeManualTrade(pos.marketId, pos.outcome, "SELL", pos.shares)}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-sans font-bold text-[10.5px] py-1.5 rounded transition-transform active:scale-[0.98] outline-none"
                >
                  LIQUIDATE CONTRACTS
                </button>
              </div>
            ))}

            {portfolio.positions.length === 0 && (
              <div className="text-center py-16 text-slate-500 text-xs mt-4">
                No active exposure held. Deploy manual fill or bot integrations.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
