/**
 * Aegis Polymarket AI Terminal - TradingView Lightweight Responsive Chart
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { createChart, ColorType } from "lightweight-charts";

interface TerminalChartProps {
  data: { time: number | string; value: number }[];
  title?: string;
  isArea?: boolean;
}

export const TerminalChart: React.FC<TerminalChartProps> = ({ data, title = "YES Contract Price History", isArea = true }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create responsive chart object
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0c0d12" },
        textColor: "#9ca3af",
        fontFamily: "JetBrains Mono, monospace"
      },
      grid: {
        vertLines: { color: "rgba(31, 41, 55, 0.5)" },
        horzLines: { color: "rgba(31, 41, 55, 0.5)" }
      },
      width: chartContainerRef.current.clientWidth || 500,
      height: 280,
      timeScale: {
        borderColor: "rgba(55, 65, 81, 0.6)",
        timeVisible: true,
        secondsVisible: false
      },
      rightPriceScale: {
        borderColor: "rgba(55, 65, 81, 0.6)"
      }
    }) as any;

    chartRef.current = chart;

    let series;
    if (isArea) {
      series = chart.addAreaSeries({
        lineColor: "#00ff88",
        topColor: "rgba(0, 255, 136, 0.25)",
        bottomColor: "rgba(0, 255, 136, 0.0)",
        lineWidth: 2,
        priceFormat: {
          type: "custom",
          formatter: (price: number) => `$${price.toFixed(2)}`
        }
      });
    } else {
      series = chart.addLineSeries({
        color: "#ffaa00",
        lineWidth: 2,
        priceFormat: {
          type: "custom",
          formatter: (price: number) => `$${price.toLocaleString()}`
        }
      });
    }

    seriesRef.current = series;

    // Sort data to satisfy lightweight-charts order specs (ascending order required)
    const sortedData = [...data].sort((a, b) => {
      const aTime = typeof a.time === "number" ? a.time : new Date(a.time).getTime() / 1000;
      const bTime = typeof b.time === "number" ? b.time : new Date(b.time).getTime() / 1000;
      return aTime - bTime;
    });

    // Formatting times appropriately as numbers (seconds timestamps)
    const formattedData = sortedData.map(item => ({
      time: typeof item.time === "number" ? item.time : Math.floor(new Date(item.time).getTime() / 1000),
      value: item.value
    }));

    if (formattedData.length > 0) {
      series.setData(formattedData);
    }

    // Auto-fit content dynamically
    chart.timeScale().fitContent();

    // Setup resize observer for true responsive density
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || !chartRef.current || !chartContainerRef.current) return;
      const { width } = entries[0].contentRect;
      chartRef.current.resize(width, 280);
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data, isArea]);

  return (
    <div className="rounded-lg border border-slate-800 bg-[#0c0d12] p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-mono text-xs font-semibold tracking-wider text-slate-400 uppercase">{title}</h3>
        <span className="font-mono text-[10px] text-slate-500">LIVE FEED FEEDER</span>
      </div>
      <div ref={chartContainerRef} className="w-full h-[280px]" />
    </div>
  );
};
