/**
 * Aegis Polymarket AI Terminal - Developer Admin Telemetry monitor
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useTerminal } from "../context/TerminalContext";
import { ShieldCheck, HardDrive, Cpu, Activity, AlertTriangle, Terminal } from "lucide-react";

export const AdminPanel: React.FC = () => {
  const { health, alerts, tradeLogs } = useTerminal();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* LEFT COLUMN: HARDWARE AND PROCESS STATISTICS */}
      <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 flex flex-col gap-4">
        <div>
          <h2 className="font-sans text-base font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
            <Activity className="h-4.5 w-4.5 text-emerald-400" />
            AEGIS DAEMON TELEMETRY
          </h2>
          <p className="text-[11px] text-slate-500 mt-1">Live RAM, CPU, and endpoint request ping metrics.</p>
        </div>

        {/* Dashboard Gauges */}
        <div className="space-y-4 font-mono text-xs">
          {/* CPU Usage Gauge */}
          <div className="space-y-1.5 bg-slate-905/40 p-3 rounded border border-slate-900">
            <div className="flex justify-between font-bold text-slate-400">
              <span className="flex items-center gap-1"><Cpu className="h-3.5 w-3.5 text-slate-400" /> CPU USAGE:</span>
              <span className="text-white">{health.cpuUsagePercent}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all duration-500"
                style={{ width: `${health.cpuUsagePercent}%` }}
              />
            </div>
          </div>

          {/* Memory Gauge */}
          <div className="space-y-1.5 bg-slate-905/40 p-3 rounded border border-slate-900">
            <div className="flex justify-between font-bold text-slate-400">
              <span className="flex items-center gap-1"><HardDrive className="h-3.5 w-3.5 text-slate-400" /> MEMORY LEAK GUARD:</span>
              <span className="text-white">{health.memoryUsageMb} MB / 512 MB</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all duration-500"
                style={{ width: `${(health.memoryUsageMb / 512) * 100}%` }}
              />
            </div>
          </div>

          {/* Sockets Count */}
          <div className="flex justify-between items-center bg-slate-905/40 p-3 rounded border border-slate-900">
            <span className="text-slate-400 font-bold">ACTIVE WS WORKERS:</span>
            <span className="text-xl font-bold text-emerald-400">{health.activeSocketsCount} Sockets</span>
          </div>

          {/* Sockets Count */}
          <div className="flex justify-between items-center bg-slate-905/40 p-3 rounded border border-slate-900">
            <span className="text-slate-400 font-bold">API CONCLAVE LATENCY:</span>
            <span className="text-xl font-bold text-emerald-400">{health.apiLatencyMs} ms</span>
          </div>
        </div>
      </div>

      {/* MID COLUMN: BACKEND NODE SYSTEM LOGS */}
      <div className="lg:col-span-2 flex flex-col rounded-lg border border-slate-800 bg-slate-950 p-4">
        <h3 className="font-mono text-xs font-bold tracking-wider text-slate-400 uppercase mb-4 flex items-center gap-1.5">
          <Terminal className="h-4 w-4 text-emerald-400" />
          CORE RUNTIME SYSLOG TRAIL
        </h3>

        {/* Syslog table */}
        <div className="flex-1 overflow-y-auto max-h-[350px] space-y-2 pr-1 scrollbar font-mono text-[10.5px]">
          {alerts.map((al, idx) => {
            const levelColors = {
              INFO: "text-emerald-400 font-bold",
              WARNING: "text-amber-400 font-bold",
              CRITICAL: "text-rose-500 font-bold"
            };

            return (
              <div key={idx} className="p-2 bg-[#0c0d12] border border-slate-905 rounded leading-relaxed text-slate-300">
                <span className="text-slate-500 mr-2">
                  [{new Date(al.timestamp).toLocaleTimeString()}]
                </span>
                <span className={`mr-2 uppercase text-[9px] px-1 bg-slate-900 rounded ${levelColors[al.severity]}`}>
                  {al.severity}
                </span>
                <span className="font-bold text-white mr-1.5">{al.title}:</span>
                <span className="text-slate-400">{al.message}</span>
              </div>
            );
          })}

          {alerts.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              Zero logs printed this session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
