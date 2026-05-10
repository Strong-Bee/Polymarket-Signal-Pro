/**
 * Aegis Polymarket AI Terminal - Whale Tracker Service
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useTerminal } from "../context/TerminalContext";
import { Copy, ShieldAlert, Award, TrendingUp, Users, RefreshCw } from "lucide-react";

export const WhaleTracker: React.FC = () => {
  const { whales, alerts } = useTerminal();
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Filter alert stream strictly to Whale detections
  const whaleAlerts = alerts.filter(a => a.type === "WHALE" || a.type === "MANIPULATION");

  const triggerCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopyFeedback(address);
    setTimeout(() => {
      setCopyFeedback(null);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* LEFT COLUMN: WHALE LEADERBOARD TABLE */}
      <div className="lg:col-span-2 flex flex-col rounded-lg border border-slate-800 bg-slate-950 p-4">
        <div className="mb-4">
          <h2 className="font-sans text-base font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-amber-500" />
            WHALE WALLET LEADERBOARD (POLYNOMIAL)
          </h2>
          <p className="text-[11px] text-slate-500">
            Realtime smart-money tracker aggregating wallet PnL, winrate analytics, and coordinated manipulation indicators.
          </p>
        </div>

        <div className="flex-1 overflow-x-auto min-h-[350px]">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-[11px] font-semibold">
                <th className="pb-2">LABEL / ADDR</th>
                <th className="pb-2 text-right">TOTAL PNL</th>
                <th className="pb-2 text-right">UNREALIZED</th>
                <th className="pb-2 text-right">WIN RATE</th>
                <th className="pb-2 text-right">VOLUME DEPLOYED</th>
                <th className="pb-2 text-right">TRADES #</th>
                <th className="pb-2 text-center">INTEGRITY ALIGN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {whales.map(w => (
                <tr key={w.address} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3">
                    <div className="font-sans font-semibold text-slate-200">{w.label || "Smart Wallet"}</div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                      <span>{w.address.slice(0, 6)}...{w.address.slice(-4)}</span>
                      <button
                        onClick={() => triggerCopyAddress(w.address)}
                        className="text-slate-500 hover:text-white transition-colors"
                        title="Copy addresses to clipboard"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      {copyFeedback === w.address && (
                        <span className="text-[9px] text-emerald-400 font-bold uppercase">COPIED</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-right font-semibold text-emerald-400">
                    +${w.totalPnl.toLocaleString()}
                  </td>
                  <td className={`py-3 text-right font-semibold ${w.unrealizedPnl >= 0 ? "text-emerald-400" : "text-rose-500"}`}>
                    {w.unrealizedPnl >= 0 ? "+" : ""}${w.unrealizedPnl.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-slate-300">{w.winrate}%</td>
                  <td className="py-3 text-right text-slate-300">
                    ${w.avgTradeSize.toLocaleString()} avg
                  </td>
                  <td className="py-3 text-right text-slate-500">{w.totalTrades}</td>
                  <td className="py-3 text-center">
                    {w.isCoordinated ? (
                      <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 text-[10px] px-1.5 py-0.5 rounded font-bold animate-pulse">
                        COORDINATED ACTIVITY
                      </span>
                    ) : (
                      <span className="bg-slate-950 text-slate-400 text-[10px] px-1.5 py-0.5 rounded font-medium border border-slate-900">
                        INDEPENDENT WHALE
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT COLUMN: WHALE EVENT HEARTBEAT & REAL-TIME WHALE ACTIVITY ALERTS */}
      <div className="flex flex-col rounded-lg border border-slate-800 bg-slate-950 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-mono text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3 text-amber-500 animate-spin" />
            LIVE WHALE TELEMETRY ALERTS
          </h3>
          <span className="text-[10px] text-slate-500 font-bold">SMART MONEY CONCEPTS</span>
        </div>

        {/* ALERTS FEED CONTAINER */}
        <div className="flex-1 overflow-y-auto space-y-3 max-h-[400px] pr-1">
          {whaleAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-3 rounded border font-mono text-xs ${
                alert.severity === "CRITICAL"
                  ? "bg-rose-950/20 border-rose-500/20 text-rose-200"
                  : "bg-amber-950/20 border-amber-500/20 text-amber-200"
              }`}
            >
              <div className="flex items-center justify-between font-bold mb-1">
                <span className="flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {alert.title}
                </span>
                <span className="text-[9px] opacity-60">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">{alert.message}</p>
            </div>
          ))}

          {whaleAlerts.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-xs">
              No whale movements or spoofings flagged in this block.
            </div>
          )}
        </div>

        {/* WHALE SENTIMENT ANALYSIS REPORT SUMMARY */}
        <div className="mt-4 border-t border-slate-900 pt-3 bg-slate-900/30 p-2.5 rounded">
          <span className="text-[10px] font-mono font-semibold text-slate-400 block mb-1">AGGREGATE SENTIMENT ANALYSIS</span>
          <div className="flex items-center justify-between text-xs font-mono">
            <span>WHALE POLARITY INDEX:</span>
            <span className="text-emerald-400 font-bold">78/100 (HIGH CONVICTION)</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-400 h-full w-[78%]" />
          </div>
        </div>
      </div>
    </div>
  );
};
