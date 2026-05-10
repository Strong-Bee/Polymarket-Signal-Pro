/**
 * Aegis Polymarket AI Terminal - TradingView Lightweight Responsive Chart
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { createChart, ColorType, AreaSeries, LineSeries } from "lightweight-charts";

interface TerminalChartProps {
  data: { time?: number | string; timestamp?: number; value: number }[];
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
      series = chart.addSeries(AreaSeries, {
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
      series = chart.addSeries(LineSeries, {
        color: "#ffaa00",
        lineWidth: 2,
        priceFormat: {
          type: "custom",
          formatter: (price: number) => `$${price.toLocaleString()}`
        }
      });
    }

    seriesRef.current = series;

    const processedData = [...data]
      .map(item => {
        let t = item.time ?? item.timestamp;
        let timeVal = typeof t === "number" ? t : new Date(t as string).getTime() / 1000;
        return { time: Math.floor(timeVal), value: item.value };
      })
      .filter(item => !isNaN(item.time) && !isNaN(item.value));

    // Sort data to satisfy lightweight-charts order specs (ascending order required)
    const sortedData = processedData.sort((a, b) => a.time - b.time);

    // Remove duplicates
    const uniqueData = sortedData.filter((item, index, arr) => {
      if (index === 0) return true;
      return item.time > arr[index - 1].time;
    });

    if (uniqueData.length > 0) {
      series.setData(uniqueData);
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
