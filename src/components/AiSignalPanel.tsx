/**
 * Aegis Polymarket AI Terminal - AI Signal Engine Analysis UI
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useTerminal } from "../context/TerminalContext";
import { BrainCircuit, Play, ArrowUpRight, TrendingUp, Sparkles, MessageCircle, RefreshCw } from "lucide-react";

export const AiSignalPanel: React.FC = () => {
  const { signals, markets, generateAICommentary, aiCommentary, aiCommentaryLoading, selectedMarketId } = useTerminal();

  // Find the currently selected market to analyze
  const activeMarket = markets.find(m => m.id === selectedMarketId) || markets[0];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* LEFT COLUMN: ACTIVE SIGNAL DIRECTORY */}
      <div className="lg:col-span-2 flex flex-col rounded-lg border border-slate-800 bg-slate-950 p-4">
        <div className="mb-4">
          <h2 className="font-sans text-base font-bold tracking-tight text-white flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-emerald-400" />
            AI REALTIME QUANT SIGNAL ENGINE
          </h2>
          <p className="text-[11px] text-slate-500">
            Automated signals generated via neural orderbook imbalance overlays, whale sweeps, and volatility breakout analysis.
          </p>
        </div>

        {/* Signals List Table */}
        <div className="flex-1 overflow-x-auto min-h-[300px]">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-[11px] font-semibold">
                <th className="pb-2">TIMESTAMP</th>
                <th className="pb-2">MARKET SOURCE</th>
                <th className="pb-2">SIGNAL ACTION</th>
                <th className="pb-2 text-right">CONFIDENCE</th>
                <th className="pb-2 text-right">EXPECTED ROI</th>
                <th className="pb-2 text-center">WHALE BLOCK</th>
                <th className="pb-2">REASONING DISPATCH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {signals.map(s => {
                const actionColors = {
                  BUY_YES: "text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded",
                  BUY_NO: "text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 px-1 py-0.5 rounded",
                  HOLD: "text-slate-400 bg-slate-800 px-1 py-0.5 rounded",
                  EXIT: "text-amber-500 font-semibold bg-amber-500/10 border border-amber-500/20 px-1 py-0.5 rounded"
                };

                return (
                  <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 text-slate-500 pr-2">
                      {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 font-sans font-medium text-slate-200 line-clamp-1 max-w-[180px] pt-4 leading-tight">
                      {s.marketName}
                    </td>
                    <td className="py-3">
                      <span className={actionColors[s.action]}>{s.action}</span>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-200">{s.confidence}%</td>
                    <td className="py-3 text-right font-bold text-emerald-400">+{s.expectedROI}%</td>
                    <td className="py-3 text-center">
                      {s.whaleDetected ? (
                        <span className="bg-amber-500/10 text-amber-500 text-[10px] px-1 rounded font-semibold">CONFIRMED</span>
                      ) : (
                        <span className="text-slate-600 text-[10px]">NONE</span>
                      )}
                    </td>
                    <td className="py-3 text-[11px] text-slate-400 max-w-[280px] line-clamp-1 truncate pr-2 pt-4">
                      {s.reasoning}
                    </td>
                  </tr>
                );
              })}
              {signals.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">Wait for quantitative system triggers to fire.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT COLUMN: INTERACTIVE GERMINI COGNITIVE OVERLAY */}
      {activeMarket && (
        <div className="flex flex-col rounded-lg border border-slate-800 bg-slate-950 p-4">
          <div className="mb-3 flex items-center justify-between border-b border-slate-900 pb-2">
            <h3 className="font-sans text-xs font-bold text-white uppercase flex items-center gap-1.5ClassName">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              INTELLIGENT NEURAL COMMENTARY
            </h3>
            <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">
              Gemini AI Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 font-sans text-xs max-h-[350px] pr-1 scrollbar">
            {aiCommentary ? (
              <div className="text-slate-300 leading-relaxed space-y-3 prose prose-invert">
                {/* Format markdown split segments appropriately */}
                {aiCommentary.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 text-slate-500">
                <BrainCircuit className="h-8 w-8 text-indigo-500/40 mb-3 animate-pulse" />
                <p className="font-semibold text-xs text-slate-400">Zero AI Report Compiled Yet</p>
                <p className="text-[10px] text-slate-500 max-w-[190px] mt-1">Select a market from directory and summon dynamic expert telemetry.</p>
              </div>
            )}
          </div>

          {/* GENERATE BUTTON CONSOLE */}
          <div className="mt-4 border-t border-slate-900 pt-3">
            <p className="text-[10px] font-mono text-slate-500 mb-2 leading-tight">
              TARGET QUERY: <span className="text-slate-300">{activeMarket.title}</span>
            </p>
            <button
              onClick={() => generateAICommentary(activeMarket.id)}
              disabled={aiCommentaryLoading}
              className={`w-full py-2.5 rounded font-sans font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                aiCommentaryLoading
                  ? "bg-slate-900 text-slate-500 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-950/40"
              }`}
            >
              {aiCommentaryLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  ANALYZING ORDER LADDERS...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  COMPILE COGNITIVE SCANS
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
