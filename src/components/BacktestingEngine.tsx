/**
 * Aegis Polymarket AI Terminal - Strategy Backtesting & Monte Carlo Simulator
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useTerminal } from "../context/TerminalContext";
import { TerminalChart } from "./charts/TerminalChart";
import { Play, Download, PlayCircle, RefreshCw, BarChart2 } from "lucide-react";

export const BacktestingEngine: React.FC = () => {
  const { markets, triggerBacktest, backtestResult, backtestLoading } = useTerminal();
  const [strategyInput, setStrategyInput] = useState<string>("SCALPING");
  const [marketInput, setMarketInput] = useState<string>("");
  const [daysInput, setDaysInput] = useState<number>(30);

  // Auto-set first market code on scan
  React.useEffect(() => {
    if (markets.length > 0 && !marketInput) {
      setMarketInput(markets[0].id);
    }
  }, [markets]);

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketInput) return;
    triggerBacktest(strategyInput, marketInput, daysInput);
  };

  // CSV Exporter Utility
  const triggerCSVExport = () => {
    if (!backtestResult || !backtestResult.trades) return;
    
    const headers = "TradeIndex,Direction,EntryPrice,ExitPrice,PnLEarned,Success\n";
    const rows = backtestResult.trades.map((t: any) => 
      `${t.index},${t.outcome},${t.price},${t.exitPrice},${t.pnl},${t.success}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Aegis_Backtest_Report_${strategyInput}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* FORM CONTROL PANEL CARD */}
      <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 flex flex-col gap-4">
        <div>
          <h2 className="font-sans text-base font-bold tracking-tight text-white flex items-center gap-1.5">
            <BarChart2 className="h-4.5 w-4.5 text-emerald-400" />
            BACKTESTING REPLAY LAB
          </h2>
          <p className="text-[11px] text-slate-500">Run historical quantitative analyses on live Polymarket CLOB schemas.</p>
        </div>

        <form onSubmit={handleLaunch} className="space-y-4 text-xs font-mono">
          {/* Strategy Selection */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">SELECT ALGO STRATEGY</label>
            <select
              value={strategyInput}
              onChange={(e) => setStrategyInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-white outline-none focus:border-slate-700 font-sans"
            >
              <option value="SCALPING">SCALPING MODULE</option>
              <option value="MOMENTUM">MOMENTUM TRACKER</option>
              <option value="MEAN_REVERSION">MEAN REVERSION ENGINE</option>
              <option value="BREAKOUT">SUPPORT/RESISTANCE BREAKOUT</option>
            </select>
          </div>

          {/* Market Selection */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">TARGET MARKET QUERY</label>
            <select
              value={marketInput}
              onChange={(e) => setMarketInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-white outline-none focus:border-slate-700 font-sans"
            >
              {markets.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>

          {/* Lookback Look */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">lookback history size (DAYS)</label>
            <input
              type="number"
              min={1}
              max={180}
              value={daysInput}
              onChange={(e) => setDaysInput(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-white outline-none focus:border-slate-700"
            />
          </div>

          <button
            type="submit"
            disabled={backtestLoading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold py-2.5 rounded transition-colors flex items-center justify-center gap-1.5"
          >
            {backtestLoading ? (
              <>
                <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                SIMULATING HISTORICAL TRADES...
              </>
            ) : (
              <>
                <PlayCircle className="h-4.5 w-4.5" />
                RUN TELEMETRY REPLAY
              </>
            )}
          </button>
        </form>
      </div>

      {/* RESULTS AND CHARTS DISPLAY COLUMN */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {backtestResult ? (
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2 flex-wrap gap-2">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold block uppercase">{backtestResult.strategy} COMPLETED</span>
                <h3 className="font-sans font-bold text-white text-xs leading-none mt-1">{backtestResult.marketName}</h3>
              </div>
              <button
                onClick={triggerCSVExport}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-805 text-slate-300 font-sans font-bold text-[10.5px] px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
              >
                <Download className="h-4 w-4" /> EXPORT CSV REPORT
              </button>
            </div>

            {/* Simulated Statistics Panel */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs p-3 bg-slate-900/30 rounded border border-slate-900">
              <div>
                <span className="text-slate-500 text-[10px] block">TOTAL TRADES FILED</span>
                <span className="text-slate-200 font-bold">{backtestResult.tradesPlaced} Trades</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">WIN RATE METRIC</span>
                <span className="text-emerald-400 font-bold">{backtestResult.winrate}% WR</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">MAX DRAWDOWN DRAW</span>
                <span className="text-rose-500 font-bold">{backtestResult.drawdown}% Drawdown</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">NET COMBINED ROI</span>
                <span className={`font-bold ${backtestResult.totalReturnPercent >= 0 ? "text-emerald-400" : "text-rose-500"}`}>
                  {backtestResult.totalReturnPercent >= 0 ? "+" : ""}{backtestResult.totalReturnPercent}% Return
                </span>
              </div>
            </div>

            {/* Chart of Simulated Backtest Performance Returns */}
            <TerminalChart
              data={backtestResult.equityHistory}
              title="Lookback Contract Price Progression Chart"
              isArea={true}
            />

            {/* Quick Trades summary table */}
            <div>
              <span className="text-[10px] font-mono font-semibold text-slate-400 block mb-2 uppercase">REPLAY FILL AUDIT</span>
              <div className="max-h-[140px] overflow-y-auto space-y-1 pr-1 font-mono text-[10.5px] scrollbar">
                {backtestResult.trades.slice(0, 15).map((t: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center bg-[#0c0d12] border border-slate-905 px-2.5 py-1.5 rounded">
                    <span className="text-slate-500">#{t.index}</span>
                    <span className="text-slate-300">Bought {t.outcome} contracts @ {t.price}c</span>
                    <span className="text-slate-400">Exit @ {t.exitPrice}c</span>
                    <span className={t.success ? "text-emerald-400 font-bold" : "text-rose-400"}>
                      {t.pnl >= 0 ? "+" : ""}${t.pnl}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-950 border border-slate-800 rounded-lg min-h-[350px]">
            <BarChart2 className="h-10 w-10 text-slate-700/60 mb-3" />
            <p className="font-semibold text-slate-400 text-xs text-center font-sans">No lookback reports initialized.</p>
            <p className="text-[10px] text-slate-500 max-w-[240px] mt-1.5 leading-relaxed font-sans">
              Select strategy parameters from the cockpit and click 'Run Telemetry' to reconstruct historic Polymarket contract cycles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
