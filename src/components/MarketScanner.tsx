/**
 * Aegis Polymarket AI Terminal - Market Scanner and Order Book Panel
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useTerminal } from "../context/TerminalContext";
import { PolymarketMarket, MarketCategory } from "../types/trading";
import { TrendingUp, AlertTriangle, Zap, ShieldAlert, Award, ArrowUpRight, Plus, Minus } from "lucide-react";

export const MarketScanner: React.FC = () => {
  const { markets, selectedMarketId, setSelectedMarketId, placeManualTrade } = useTerminal();
  const [filterCategory, setFilterCategory] = useState<"ALL" | MarketCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [outcomeSelect, setOutcomeSelect] = useState<"YES" | "NO">("YES");
  const [tradeShares, setTradeShares] = useState<number>(1000);

  // Selected market reference
  const activeMarket = markets.find(m => m.id === selectedMarketId) || markets[0];

  const filteredMarkets = markets.filter(m => {
    const matchesCategory = filterCategory === "ALL" || m.category === filterCategory;
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* LEFT COLUMN: ACTIVE MARKET DIRECTORY */}
      <div className="lg:col-span-2 flex flex-col rounded-lg border border-slate-800 bg-slate-950 p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-sans text-base font-bold tracking-tight text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              POLYMARKET REAL-TIME SCANNER
            </h2>
            <p className="text-[11px] text-slate-500">Live Gamma contract prices, liquidity pools, and orderbook metrics.</p>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {(["ALL", "POLITICS", "CRYPTO", "TECH", "SCIENCE"] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2 py-1 text-[10px] font-mono tracking-wider transition-colors uppercase rounded-sm ${
                  filterCategory === cat
                    ? "bg-slate-800 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search active prediction queries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-slate-700"
          />
        </div>

        {/* Directory Table */}
        <div className="flex-1 overflow-x-auto min-h-[350px]">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-[11px] font-semibold">
                <th className="pb-2">MARKET QUERY</th>
                <th className="pb-2 text-right">YES (prob)</th>
                <th className="pb-2 text-right">NO (prob)</th>
                <th className="pb-2 text-right">VOL (24H)</th>
                <th className="pb-2 text-right">LIQUIDITY</th>
                <th className="pb-2 text-center">ANOMALY STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {filteredMarkets.map(m => {
                const isSelected = m.id === selectedMarketId;
                return (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedMarketId(m.id)}
                    className={`cursor-pointer transition-colors hover:bg-slate-900/60 ${
                      isSelected ? "bg-slate-900/90 border-l-2 border-emerald-400" : ""
                    }`}
                  >
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-1.5">
                        {m.isHot && (
                          <span className="bg-amber-500/10 text-amber-500 text-[9px] px-1 font-semibold rounded">HOT</span>
                        )}
                        {m.isTrending && (
                          <span className="bg-emerald-500/10 text-emerald-500 text-[9px] px-1 font-semibold rounded">TRENDING</span>
                        )}
                        <span className="text-slate-200 text-xs font-medium line-clamp-1">{m.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase mt-0.5">{m.category} • Resolves {m.resolutionDate}</div>
                    </td>
                    <td className="py-2.5 text-right font-semibold text-emerald-400">{(m.yesPrice * 100).toFixed(0)}%</td>
                    <td className="py-2.5 text-right font-semibold text-rose-500">{(m.noPrice * 100).toFixed(0)}%</td>
                    <td className="py-2.5 text-right text-slate-300">${(m.volume24h / 1000).toFixed(0)}k</td>
                    <td className="py-2.5 text-right text-slate-400">${(m.liquidity / 1000).toFixed(0)}k</td>
                    <td className="py-2.5 text-center">
                      {m.isManipulated ? (
                        <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-500 text-[10px] px-1.5 py-0.5 font-semibold rounded animate-pulse-red">
                          <ShieldAlert className="h-3 w-3" /> MANIPULATED FLOW
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded font-medium">STABLE CLOB</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredMarkets.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">No matching market scanner feeds detected.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT COLUMN: REALTIME ORDERBOOK & COLD EXECUTION WIDGET */}
      {activeMarket && (
        <div className="flex flex-col gap-4">
          {/* ORDERBOOK BOX */}
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <h3 className="font-mono text-xs font-bold tracking-wider text-slate-400 uppercase mb-3 flex items-center justify-between">
              <span>REAL-TIME CLOB DEEP BOOK</span>
              <span className="text-[10px] text-slate-500">IMBALANCE: {(activeMarket.orderBookYes.imbalance * 100).toFixed(1)}%</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* ASKS (Sells) */}
              <div>
                <span className="text-[10px] font-mono font-semibold text-rose-500 uppercase block mb-1">ASKS (YES SELLS)</span>
                <div className="space-y-1 font-mono text-[11px]">
                  {activeMarket.orderBookYes.asks.slice(0, 5).map((l, idx) => (
                    <div key={idx} className="flex justify-between hover:bg-slate-900 px-1 py-0.5 rounded">
                      <span className="text-slate-400">{(l.price * 100).toFixed(0)}c</span>
                      <span className="text-slate-500">{l.size.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* BIDS (Buys) */}
              <div>
                <span className="text-[10px] font-mono font-semibold text-emerald-400 uppercase block mb-1">BIDS (YES BUYS)</span>
                <div className="space-y-1 font-mono text-[11px]">
                  {activeMarket.orderBookYes.bids.slice(0, 5).map((l, idx) => (
                    <div key={idx} className="flex justify-between hover:bg-slate-900 px-1 py-0.5 rounded">
                      <span className="text-emerald-400">{(l.price * 100).toFixed(0)}c</span>
                      <span className="text-slate-500">{l.size.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 border-t border-slate-900 pt-2 flex justify-between font-mono text-[10px] text-slate-500">
              <span>SPREAD: {(activeMarket.orderBookYes.spread * 100).toFixed(1)}c</span>
              <span>VOLATILITY RATIO: {activeMarket.volatility}%</span>
            </div>
          </div>

          {/* MANUAL ORDER PLACEMENT BOX */}
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <h3 className="font-sans text-xs font-bold text-white uppercase mb-4 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-emerald-400" />
              AEGIS INSTANT ORDER filling
            </h3>

            {/* YES / NO Outcome Toggle */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setOutcomeSelect("YES")}
                className={`py-2 text-xs font-mono font-bold tracking-wider rounded uppercase transition-colors ${
                  outcomeSelect === "YES"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                YES ({(activeMarket.yesPrice * 100).toFixed(0)}c)
              </button>
              <button
                onClick={() => setOutcomeSelect("NO")}
                className={`py-2 text-xs font-mono font-bold tracking-wider rounded uppercase transition-colors ${
                  outcomeSelect === "NO"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                NO ({(activeMarket.noPrice * 100).toFixed(0)}c)
              </button>
            </div>

            {/* Input Shares Slider */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">CONTRACT AMOUNT:</span>
                <span className="text-white font-bold">{tradeShares.toLocaleString()} Shares</span>
              </div>
              <input
                type="range"
                min={100}
                max={50000}
                step={100}
                value={tradeShares}
                onChange={(e) => setTradeShares(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
              <div className="flex gap-1.5 justify-between">
                {[1000, 5000, 10000, 25000].map(val => (
                  <button
                    key={val}
                    onClick={() => setTradeShares(val)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-300 py-1 rounded"
                  >
                    {val >= 1000 ? `${val/1000}k` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="bg-[#090a0f] p-3 rounded border border-slate-900 font-mono text-xs space-y-2 mb-4 text-slate-400">
              <div className="flex justify-between">
                <span>ESTIMATED UNIT PRICE:</span>
                <span className="text-slate-200">
                  {outcomeSelect === "YES" ? activeMarket.yesPrice : activeMarket.noPrice} USD
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-900 pt-1.5 font-bold text-white">
                <span>TOTAL COST REQUIRE:</span>
                <span className="text-emerald-400">
                  ${(tradeShares * (outcomeSelect === "YES" ? activeMarket.yesPrice : activeMarket.noPrice)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* BUY ACTION TRIGGER */}
            <button
              onClick={() => placeManualTrade(activeMarket.id, outcomeSelect, "BUY", tradeShares)}
              className="w-full bg-slate-100 hover:bg-white text-slate-950 font-sans font-bold text-xs py-2.5 rounded transition-transform active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              FILL DEPLOYMENT ORDER
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
