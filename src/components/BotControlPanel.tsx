/**
 * Aegis Polymarket AI Terminal - Automated Trade Bot Control Panel
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useTerminal } from "../context/TerminalContext";
import { BotConfig, BotStrategy } from "../types/trading";
import { Play, Pause, Settings, ShieldAlert, BadgeInfo, Sliders, RefreshCw } from "lucide-react";

export const BotControlPanel: React.FC = () => {
  const { bots, updateBot, tradeLogs } = useTerminal();
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  
  // Local edit inputs
  const [alloc, setAlloc] = useState<number>(5000);
  const [sl, setSl] = useState<number>(3.0);
  const [tp, setTp] = useState<number>(6.0);

  const startEditing = (bot: BotConfig) => {
    setEditingBotId(bot.id);
    setAlloc(bot.allocationSize);
    setSl(bot.stopLossPercent);
    setTp(bot.takeProfitPercent);
  };

  const handleSave = (botId: string, currentActive: boolean) => {
    updateBot(botId, currentActive, sl, tp, alloc);
    setEditingBotId(null);
  };

  const toggleBotState = (bot: BotConfig) => {
    updateBot(bot.id, !bot.isActive, bot.stopLossPercent, bot.takeProfitPercent, bot.allocationSize);
  };

  // Compile bot fill events
  const botFills = tradeLogs.filter(log => log.botId);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* LEFT COLUMN: ACTIVE BOTS DIRECTORY AND ENGINE */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
          <div className="mb-4">
            <h2 className="font-sans text-base font-bold tracking-tight text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-400" />
              INTELLIGENT TRADE ALGORITHMS (AEGIS-BOT)
            </h2>
            <p className="text-[11px] text-slate-500">
              Manage automatic order fills. Bots monitor active neural signal triggers for instant high-frequency execution.
            </p>
          </div>

          <div className="space-y-4">
            {bots.map(bot => {
              const isEditing = editingBotId === bot.id;
              const winrate = bot.tradesCount > 0 ? Math.floor((bot.profitableTradesCount / bot.tradesCount) * 100) : 0;
              
              return (
                <div
                  key={bot.id}
                  className={`p-4 rounded-lg border transition-all ${
                    bot.isActive
                      ? "bg-slate-900/60 border-slate-700/60"
                      : "bg-slate-950/40 border-slate-900"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${bot.isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-700"}`} />
                      <div>
                        <h3 className="font-sans font-bold text-slate-100 flex items-center gap-1.5 leading-none">
                          {bot.name}
                          <span className="font-mono text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                            {bot.strategy}
                          </span>
                        </h3>
                        <span className="text-[10px] font-mono text-slate-500">
                          TARGET FEED: {bot.marketId === "ALL" ? "ALL HOT MARKETS" : bot.marketId}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleBotState(bot)}
                        className={`px-3 py-1 text-xs font-sans font-bold rounded flex items-center gap-1 transition-colors ${
                          bot.isActive
                            ? "bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 border border-rose-500/30"
                            : "bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {bot.isActive ? (
                          <>
                            <Pause className="h-3 w-3" /> SUSPEND
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3" /> DEPLOY
                          </>
                        )}
                      </button>

                      {!isEditing && (
                        <button
                          onClick={() => startEditing(bot)}
                          className="p-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                          title="Tweak parameters"
                        >
                          <Settings className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* FORM INTERACTIVE ROW */}
                  {isEditing ? (
                    <div className="bg-[#090a0f] p-3 rounded border border-slate-900 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 font-bold block">ALLOC SIZE ($)</label>
                        <input
                          type="number"
                          value={alloc}
                          onChange={(e) => setAlloc(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white outline-none focus:border-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 font-bold block">STOP LOSS (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={sl}
                          onChange={(e) => setSl(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white outline-none focus:border-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 font-bold block">TAKE PROFIT (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={tp}
                          onChange={(e) => setTp(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white outline-none focus:border-slate-700"
                        />
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleSave(bot.id, bot.isActive)}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-1.5 rounded text-xs"
                        >
                          APPLY
                        </button>
                        <button
                          onClick={() => setEditingBotId(null)}
                          className="px-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-xs"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 font-mono text-xs">
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase block">DEPLOYED POWER</span>
                        <span className="text-slate-300 font-bold">${bot.allocationSize.toLocaleString()} Max</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase block">LIMIT GUARDS</span>
                        <span className="text-slate-300 font-bold">SL: {bot.stopLossPercent}% | TP: {bot.takeProfitPercent}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase block">TOTAL TRADES #</span>
                        <span className="text-slate-300 font-bold">{bot.tradesCount} Placed ({winrate}% WR)</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase block">CUMULATIVE RETURNS</span>
                        <span className={`font-bold ${bot.totalPnl >= 0 ? "text-emerald-400" : "text-rose-500"}`}>
                          {bot.totalPnl >= 0 ? "+" : ""}${bot.totalPnl.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: RECENT BOT RUNTIME EXECUTION LOGGER */}
      <div className="flex flex-col rounded-lg border border-slate-800 bg-slate-950 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-mono text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
            AEGIS-BOT RUNTIME EXECUTION LOG
          </h3>
          <span className="text-[10px] text-slate-500 font-bold">LATENCY MONITORED</span>
        </div>

        {/* Trade Executions Feed */}
        <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[400px] pr-1">
          {botFills.map(fill => (
            <div key={fill.id} className="p-3 bg-[#0c0d12] border border-slate-900 rounded font-mono text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-300 uppercase">{fill.botName || "Aegis Core"}</span>
                <span className="text-[10px] text-slate-400 font-semibold bg-slate-800 px-1 py-0.5 rounded">
                  {fill.executionLatencyMs}ms FILL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal mb-1.5">
                Filled {fill.shares.toLocaleString()} contracts of <span className="font-bold text-slate-200">{fill.outcome}</span> on {fill.marketName} at {fill.price}c.
              </p>
              <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase">
                <span>Value: ${(fill.totalValue).toLocaleString()}</span>
                <span>{new Date(fill.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
              {fill.exitReason && (
                <div className="mt-1.5 border-t border-slate-900 pt-1 flex justify-between text-[10px] font-bold">
                  <span className="text-slate-500">EXIT CODE:</span>
                  <span className={fill.exitReason === "TAKE_PROFIT" ? "text-emerald-400" : "text-rose-500"}>
                    {fill.exitReason} ({fill.pnlEarned && fill.pnlEarned >= 0 ? "+" : ""}${fill.pnlEarned})
                  </span>
                </div>
              )}
            </div>
          ))}

          {botFills.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs">
              Deploy a bot and watch real-time fill events appear.
            </div>
          )}
        </div>

        {/* COOLDOWN AND SAFE BANNER */}
        <div className="mt-4 border border-rose-950/30 bg-rose-950/10 rounded p-3 text-rose-200 font-mono text-[11px] flex gap-2">
          <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" />
          <div>
            <span className="font-semibold block">INTELLIGENT RISK PROTECTION</span>
            Aegis-Bot has anti-overtrade, slippage limit bounds of 1c, and a hard 1,500 USD daily exposure stop active by default.
          </div>
        </div>
      </div>
    </div>
  );
};
