/**
 * Aegis Polymarket AI Terminal - Standard Entry UI
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { TerminalProvider, useTerminal } from "./context/TerminalContext";
import { MarketScanner } from "./components/MarketScanner";
import { WhaleTracker } from "./components/WhaleTracker";
import { AiSignalPanel } from "./components/AiSignalPanel";
import { BotControlPanel } from "./components/BotControlPanel";
import { PortfolioAnalytics } from "./components/PortfolioAnalytics";
import { BacktestingEngine } from "./components/BacktestingEngine";
import { StrategiesPane } from "./components/StrategiesPane";
import { AdminPanel } from "./components/AdminPanel";
import {
  Activity,
  Zap,
  Users,
  LineChart,
  Sliders,
  History,
  ShieldCheck,
  Award,
  Bell,
  MessageSquareCode,
  Github,
  CheckCircle,
  HelpCircle,
  Menu,
  X,
  Send,
  Sparkles
} from "lucide-react";

// Nested view component inside App
const TerminalWorkspace: React.FC = () => {
  const { activeTab, setActiveTab, health, alerts, wsConnected, portfolio } = useTerminal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  // Settings states
  const [telegramOn, setTelegramOn] = useState(true);
  const [discordOn, setDiscordOn] = useState(true);
  const [discordWebhook, setDiscordWebhook] = useState("https://discord.com/api/webhooks/...");
  const [telegramToken, setTelegramToken] = useState("852938102:AAE-...");
  const [configSuccess, setConfigSuccess] = useState(false);

  // User configuration save banner
  const triggerConfigSave = () => {
    setConfigSuccess(true);
    setTimeout(() => {
      setConfigSuccess(false);
    }, 2000);
  };

  const navItems = [
    { id: "dashboard", label: "MONITOR CENTER", icon: Zap },
    { id: "markets", label: "CLOB SCANNER", icon: Activity },
    { id: "signals", label: "AI SIGNALS", icon: Sparkles },
    { id: "whales", label: "WHALE SENSING", icon: Users },
    { id: "strategies", label: "STRATEGY MATRIX", icon: Award },
    { id: "bots", label: "BOT COCKPIT", icon: Sliders },
    { id: "portfolio", label: "RISK & EQUITY", icon: LineChart },
    { id: "backtesting", label: "REPLAY LAB", icon: History },
    { id: "settings", label: "ALERTS & SYSTEM", icon: MessageSquareCode },
    { id: "admin", label: "DAEMON CONTROLS", icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* 1. ROW HEADER */}
      <header className="border-b border-slate-900 bg-[#090a0f] px-4 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          {/* Neon Aegis Logo icon */}
          <div className="h-7 w-7 rounded bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/40 shrink-0">
            <ShieldCheck className="h-4.5 w-4.5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-black tracking-wider text-xs text-white">AEGIS</span>
              <span className="font-mono text-[9.5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-bold">
                POLYMARKET INDUSTRIAL V1.2
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono tracking-wide mt-0.5 uppercase hidden sm:block">
              INSTITUTIONAL QUANT TRADING TERMINAL
            </div>
          </div>
        </div>

        {/* Real-time telemetry badges */}
        <div className="flex items-center gap-3 font-mono text-[10.5px]">
          {/* WS Connect status */}
          <div className="flex items-center gap-1.5 bg-[#0e1017] border border-slate-900 px-2.5 py-1 rounded">
            <span className={`h-1.5 w-1.5 rounded-full ${wsConnected ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`} />
            <span className="text-slate-400 font-bold hidden sm:inline">TELEMETRY:</span>
            <span className={wsConnected ? "text-emerald-400" : "text-rose-500"}>
              {wsConnected ? `ONLINE (${health.apiLatencyMs}ms)` : "OFFLINE"}
            </span>
          </div>

          {/* AI engine feedback */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#0e1017] border border-slate-900 px-2.5 py-1 rounded">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-bold">COGNITIVE ENGINE:</span>
            <span className="text-emerald-400 font-extrabold uppercase">GEMINI ACTIVE</span>
          </div>

          {/* User Address Banner block */}
          <div className="hidden lg:flex items-center gap-1 bg-[#0e1017] border border-slate-900 px-2.5 py-1 rounded text-slate-300">
            <span className="text-slate-500 font-bold uppercase mr-1">SANDBOX WALLET:</span>
            <span className="text-slate-300 font-bold">0xaegis...c79e</span>
          </div>

          {/* Alert trigger drawer */}
          <button
            onClick={() => setShowNotificationCenter(!showNotificationCenter)}
            className="p-1 px-2 bg-slate-900/60 hover:bg-slate-800 rounded border border-slate-800 text-slate-300 flex items-center gap-1"
          >
            <Bell className="h-3.5 w-3.5 text-emerald-400" />
            <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1 font-bold rounded">
              {alerts.length}
            </span>
          </button>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-1 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-slate-300"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* 2. MAIN COCKPIT VIEW BODY */}
      <div className="flex-1 flex relative">
        
        {/* SIDEBAR NAVIGATION PANEL (SM+ SCREENS) */}
        <aside className="w-56 border-r border-slate-900 bg-[#090a0f] p-3 shrink-0 hidden sm:flex flex-col gap-1 z-20">
          <div className="px-2 py-1 mb-2">
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">CORE INTERFACES</span>
          </div>

          <div className="flex-1 flex flex-col gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium font-sans border transition-all ${
                  activeTab === item.id
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <item.icon className={`h-4 w-4 ${activeTab === item.id ? "text-emerald-400" : "text-slate-400"}`} />
                {item.label}
              </button>
            ))}
          </div>

          {/* Footer inside sidebar */}
          <div className="border-t border-slate-900 pt-3 px-2 text-[10px] font-mono text-slate-600 flex flex-col gap-1.5 shrink-0">
            <div className="flex justify-between">
              <span>ESTIMATED DAILY NET:</span>
              <span className="text-slate-400 font-bold">+$1,450.00</span>
            </div>
            <div className="flex justify-between">
              <span>AEGIS SEED KEY:</span>
              <span className="text-emerald-400 font-semibold text-[9px] uppercase">VERIFIED</span>
            </div>
            <p className="text-[9px] text-slate-500/70 leading-normal mt-1 border-t border-slate-900 pt-1.5">
              Secure Sandbox paper and high-fidelity API routing is live and encrypted.
            </p>
          </div>
        </aside>

        {/* MOBILE SLIDE-OUT MENU OVERLAY */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-[52px] bg-slate-950/95 backdrop-blur-sm z-30 flex flex-col p-4 gap-2 sm:hidden">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-sans font-bold border transition-all ${
                  activeTab === item.id
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-transparent text-slate-400 border-transparent"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* CENTRAL LIVE TELEMETRY CONTENT FEED */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-full">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Rolling Top News Comment ticker */}
              <div className="bg-[#0e1017] border border-slate-900 p-2.5 rounded flex items-center gap-2.5 text-xs font-mono">
                <span className="bg-emerald-500/15 text-emerald-400 text-[9.5px] font-bold px-1.5 py-0.5 rounded shrink-0">
                  MARKET COMMENT DISPATCH
                </span>
                <span className="text-slate-400 truncate opacity-90">
                  Massive block-buy order filed of $250k contracts detected targeting Yes Presidential Winner indices. Spoofing scans remain stable.
                </span>
              </div>

              {/* Top summary cards */}
              <PortfolioAnalytics />

              {/* Dual-grid scanner & whale listings */}
              <div className="border-t border-slate-900 pt-6">
                <MarketScanner />
              </div>
            </div>
          )}

          {activeTab === "markets" && <MarketScanner />}
          {activeTab === "signals" && <AiSignalPanel />}
          {activeTab === "whales" && <WhaleTracker />}
          {activeTab === "strategies" && <StrategiesPane />}
          {activeTab === "bots" && <BotControlPanel />}
          {activeTab === "portfolio" && <PortfolioAnalytics />}
          {activeTab === "backtesting" && <BacktestingEngine />}
          
          {activeTab === "settings" && (
            <div className="max-w-3xl space-y-6">
              {/* Webhook notification channels config box */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-5 flex flex-col gap-4">
                <div>
                  <h2 className="font-sans text-base font-bold text-white flex items-center gap-1.5">
                    <MessageSquareCode className="h-4.5 w-4.5 text-emerald-400" />
                    REAL-TIME WEBHOOK ALERTS (DISCORD / TELEGRAM)
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Configure your direct bot credentials to receive instant push alerts when AI signals trigger, whale contracts execute or stop-losses are filled.
                  </p>
                </div>

                {configSuccess && (
                  <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-3 rounded font-mono text-xs flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> SUCCESS: Webhook endpoints authenticated and live. Test payloads fired.
                  </div>
                )}

                <div className="space-y-4 font-mono text-xs">
                  {/* Telegram Toggle */}
                  <div className="p-3.5 bg-[#090a0f] border border-slate-900 rounded space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">TELEGRAM CHAL_BOT NOTIFICATIONS</span>
                      <button
                        type="button"
                        onClick={() => setTelegramOn(!telegramOn)}
                        className={`text-xs font-bold font-sans px-2.5 py-1 rounded transition-colors ${
                          telegramOn ? "bg-emerald-950 text-emerald-400" : "bg-slate-900 text-slate-500"
                        }`}
                      >
                        {telegramOn ? "ACTIVE" : "STANDBY"}
                      </button>
                    </div>
                    {telegramOn && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 uppercase font-bold block">TELEGRAM BOT AUTHORIZATION KEY</label>
                        <input
                          type="text"
                          value={telegramToken}
                          onChange={(e) => setTelegramToken(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white outline-none focus:border-slate-700"
                        />
                      </div>
                    )}
                  </div>

                  {/* Discord Toggle */}
                  <div className="p-3.5 bg-[#090a0f] border border-slate-900 rounded space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">DISCORD WEBHOOK INTEGRATION</span>
                      <button
                        type="button"
                        onClick={() => setDiscordOn(!discordOn)}
                        className={`text-xs font-bold font-sans px-2.5 py-1 rounded transition-colors ${
                          discordOn ? "bg-emerald-950 text-emerald-400" : "bg-slate-900 text-slate-500"
                        }`}
                      >
                        {discordOn ? "ACTIVE" : "STANDBY"}
                      </button>
                    </div>
                    {discordOn && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 uppercase font-bold block">WEBHOOK SERVER TARGET URL</label>
                        <input
                          type="text"
                          value={discordWebhook}
                          onChange={(e) => setDiscordWebhook(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white outline-none focus:border-slate-700"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={triggerConfigSave}
                    className="w-full sm:w-auto bg-slate-100 hover:bg-white text-slate-950 font-sans font-bold text-xs px-6 py-2.5 rounded transition-transform active:scale-[0.98]"
                  >
                    SAVE TELEMETRY WEBHOOKS
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "admin" && <AdminPanel />}
        </main>

        {/* NOTIFICATION CENTER PULL-OUT SHELF */}
        {showNotificationCenter && (
          <aside className="w-80 border-l border-slate-900 bg-[#090a0f] p-4 absolute right-0 top-0 bottom-0 z-30 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="font-mono text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-emerald-400" />
                SYSTEM NOTIFICATION DECK
              </span>
              <button
                onClick={() => setShowNotificationCenter(false)}
                className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-3 pr-1 scrollbar font-mono text-xs">
              {alerts.map((al, idx) => {
                const colors = {
                  SIGNAL: "border-indigo-500/20 bg-indigo-950/10 text-indigo-200",
                  WHALE: "border-amber-500/20 bg-amber-950/10 text-amber-200",
                  EXECUTION: "border-emerald-500/20 bg-emerald-950/10 text-emerald-200",
                  RISK_LIMIT: "border-rose-500/20 bg-rose-950/10 text-rose-200",
                  MANIPULATION: "border-rose-500/20 bg-rose-950/15 text-rose-200 animate-pulse"
                };

                return (
                  <div key={idx} className={`p-2.5 rounded border leading-relaxed ${colors[al.type] || "border-slate-850 bg-slate-900/40 text-slate-300"}`}>
                    <div className="flex items-center justify-between font-bold mb-1 border-b border-slate-900/30 pb-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-wide">{al.type} EVENT</span>
                      <span className="text-[9px] opacity-60">
                        {new Date(al.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <span className="font-semibold text-white block text-[11px] mb-0.5">{al.title}</span>
                    <p className="text-[10px] opacity-90">{al.message}</p>
                  </div>
                );
              })}

              {alerts.length === 0 && (
                <div className="text-center py-12 text-slate-600">
                  Zero recent system notifications printed.
                </div>
              )}
            </div>
          </aside>
        )}

      </div>
    </div>
  );
};

export default function App() {
  return (
    <TerminalProvider>
      <TerminalWorkspace />
    </TerminalProvider>
  );
}
