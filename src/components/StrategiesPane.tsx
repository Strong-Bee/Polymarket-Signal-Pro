/**
 * Aegis Polymarket AI Terminal - Strategy Optimizer Pane
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useTerminal } from "../context/TerminalContext";
import { BotStrategy } from "../types/trading";
import { AlertCircle, ToggleLeft, ToggleRight, Sparkles, Award } from "lucide-react";

interface OptimizationLog {
  id: string;
  strategy: BotStrategy;
  text: string;
  timestamp: number;
}

export const StrategiesPane: React.FC = () => {
  const { bots, updateBot } = useTerminal();
  const [optimizerActive, setOptimizerActive] = useState(false);
  const [optLogs, setOptLogs] = useState<OptimizationLog[]>([]);

  // Trigger simulated optimizer parameters modifications block
  const handleAutoOptimize = () => {
    setOptimizerActive(true);
    
    setTimeout(() => {
      // Tweak existing bots sl/tp settings slightly for maximum returns yield
      bots.forEach(bot => {
        const driftSl = Number((bot.stopLossPercent + (Math.random() - 0.5) * 0.4).toFixed(1));
        const driftTp = Number((bot.takeProfitPercent + (Math.random() - 0.5) * 0.8).toFixed(1));
        updateBot(bot.id, bot.isActive, Math.max(1, driftSl), Math.max(2, driftTp), bot.allocationSize);
      });

      const newLog: OptimizationLog = {
        id: `opt-${Date.now()}`,
        strategy: "SCALPING",
        text: "Neural optimizer deployed. Adjusted Scalping parameters SL to 2.8%, TP to 5.4% based on liquidity volatility trends.",
        timestamp: Date.now()
      };

      setOptLogs(prev => [newLog, ...prev]);
      setOptimizerActive(false);
    }, 1500);
  };

  const strategiesList: { name: string; key: BotStrategy; desc: string; score: number; winrate: number }[] = [
    { name: "CLOB Scalping Loop", key: "SCALPING", desc: "Captures micro cent spreads via bid/ask imbalance within microseconds.", score: 92, winrate: 76 },
    { name: "Volume Velocity Momentum", key: "MOMENTUM", desc: "Rides rapid retail contract accumulation trends on hot breaking news.", score: 84, winrate: 68 },
    { name: "SMC Mean Reversion", key: "MEAN_REVERSION", desc: "Fills counter-trend contracts near extreme boundary support corridors.", score: 89, winrate: 71 },
    { name: "Volatility Breakout Eng", key: "BREAKOUT", desc: "Enters contracts instantly upon wide spread expansions.", score: 78, winrate: 61 }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* STRATEGIES OVERVIEW DIRECTORY */}
      <div className="lg:col-span-2 flex flex-col rounded-lg border border-slate-800 bg-slate-950 p-4">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-sans text-base font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
              <Award className="h-4.5 w-4.5 text-emerald-400" />
              STRATEGY ALLOCATION MATRIX
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">Available risk models, historic score matrix, and automated allocation settings.</p>
          </div>

          <button
            onClick={handleAutoOptimize}
            disabled={optimizerActive}
            className={`px-3 py-1.5 rounded font-sans font-bold text-xs flex items-center gap-1.5 transition-all ${
              optimizerActive
                ? "bg-slate-900 border border-slate-800 text-slate-500"
                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-950/20"
            }`}
          >
            <Sparkles className="h-4 w-4 animate-pulse" />
            {optimizerActive ? "CALIBRATING MODELS..." : "AUTO-OPTIMIZE ENGINE"}
          </button>
        </div>

        {/* Catalog list */}
        <div className="space-y-4">
          {strategiesList.map(strat => {
            const botRef = bots.find(b => b.strategy === strat.key);
            const isDeployed = botRef?.isActive || false;

            return (
              <div key={strat.key} className="p-4 border border-slate-900 bg-slate-900/30 rounded-lg flex items-center justify-between flex-wrap sm:flex-nowrap gap-4">
                <div className="space-y-1">
                  <span className="font-mono text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">
                    SCORE: {strat.score}/100
                  </span>
                  <h3 className="font-sans font-bold text-slate-200 mt-1 leading-none">{strat.name}</h3>
                  <p className="text-[11px] text-slate-500 max-w-[420px] leading-relaxed">{strat.desc}</p>
                </div>

                <div className="flex items-center gap-6 shrink-0 font-mono text-xs">
                  <div className="text-right">
                    <span className="text-slate-500 text-[10px] uppercase block">HISTORIC WIN</span>
                    <span className="text-slate-300 font-bold">{strat.winrate}% WR</span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">TRIGGER STATUS</span>
                    <button
                      onClick={() => {
                        if (botRef) {
                          updateBot(botRef.id, !botRef.isActive, botRef.stopLossPercent, botRef.takeProfitPercent, botRef.allocationSize);
                        }
                      }}
                      className="text-slate-300 hover:text-white transition-colors"
                    >
                      {isDeployed ? (
                        <div className="flex items-center gap-1 text-emerald-400">
                          <ToggleRight className="h-6 w-6" />
                          <span className="text-[10px] font-bold">DEPLOYED</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-500">
                          <ToggleLeft className="h-6 w-6" />
                          <span className="text-[10px] font-bold">SLEEP</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* OPTIMIZER RUNTIME EVENT MONITOR LOG */}
      <div className="flex flex-col rounded-lg border border-slate-800 bg-slate-950 p-4">
        <h3 className="font-mono text-xs font-bold tracking-wider text-slate-400 uppercase mb-4">
          OPTIMIZER RUNTIME ENGINE LOG
        </h3>

        <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[350px] pr-1">
          {optLogs.map(log => (
            <div key={log.id} className="p-3 bg-[#090a0f] border border-slate-900 rounded font-mono text-xs leading-relaxed">
              <div className="flex items-center justify-between mb-1.5 font-bold text-[10px]">
                <span className="text-emerald-400 uppercase">CALIBRATION DISPATCH</span>
                <span className="text-slate-500">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{log.text}</p>
            </div>
          ))}

          {optLogs.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs">
              <AlertCircle className="h-8 w-8 text-slate-700/50 mx-auto mb-2 animate-pulse" />
              Optimizer idle. Re-run calibrations to analyze orderbook slippages and log updates.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
