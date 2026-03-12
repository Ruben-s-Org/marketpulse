"use client";

import React, { useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OHLCVData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export type IndicatorKey =
  | "sma20"
  | "sma50"
  | "ema12"
  | "ema26"
  | "rsi"
  | "macd";

export interface CandlestickChartProps {
  data: OHLCVData[];
  indicators?: IndicatorKey[];
  height?: number;
  /** If false, RSI and MACD are gated behind an upgrade CTA. */
  isPremium?: boolean;
}

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const BULL = "#22c55e";
const BEAR = "#ef4444";

const INDICATOR_COLORS: Record<string, string> = {
  sma20: "#fbbf24", // amber-400
  sma50: "#60a5fa", // blue-400
  ema12: "#c084fc", // purple-400
  ema26: "#f472b6", // pink-400
  macdLine: "#60a5fa",
  signal: "#f97316",
};

// ---------------------------------------------------------------------------
// Indicator calculation helpers
// ---------------------------------------------------------------------------

function calcSMA(closes: number[], period: number): (number | null)[] {
  return closes.map((_, i) => {
    if (i < period - 1) return null;
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += closes[j];
    return sum / period;
  });
}

function calcEMA(closes: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const out: (number | null)[] = new Array(closes.length).fill(null);
  if (closes.length < period) return out;
  // Seed with SMA of first `period` values
  let sum = 0;
  for (let i = 0; i < period; i++) sum += closes[i];
  out[period - 1] = sum / period;
  for (let i = period; i < closes.length; i++) {
    out[i] = closes[i] * k + (out[i - 1] as number) * (1 - k);
  }
  return out;
}

function calcRSI(closes: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = new Array(closes.length).fill(null);
  if (closes.length < period + 1) return out;

  let gainSum = 0;
  let lossSum = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gainSum += diff;
    else lossSum -= diff;
  }
  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff >= 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

interface MACDResult {
  macdLine: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
}

function calcMACD(closes: number[]): MACDResult {
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const macdLine: (number | null)[] = closes.map((_, i) =>
    ema12[i] != null && ema26[i] != null
      ? (ema12[i] as number) - (ema26[i] as number)
      : null,
  );

  // Signal = EMA9 of the non-null MACD values, then re-align
  const macdValues = macdLine.filter((v) => v != null) as number[];
  const signalRaw = calcEMA(macdValues, 9);
  const signal: (number | null)[] = new Array(closes.length).fill(null);
  let idx = 0;
  for (let i = 0; i < closes.length; i++) {
    if (macdLine[i] != null) {
      signal[i] = signalRaw[idx] ?? null;
      idx++;
    }
  }

  const histogram: (number | null)[] = closes.map((_, i) =>
    macdLine[i] != null && signal[i] != null
      ? (macdLine[i] as number) - (signal[i] as number)
      : null,
  );

  return { macdLine, signal, histogram };
}

// ---------------------------------------------------------------------------
// Custom shapes for candle body and wicks
// ---------------------------------------------------------------------------

function CandleBody(props: { x?: number; y?: number; width?: number; height?: number; payload?: { bullish?: boolean } }) {
  const { x, y, width, height, payload } = props;
  if (x == null || y == null || width == null || height == null) return null;
  const fill = payload?.bullish ? BULL : BEAR;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={Math.max(Math.abs(height), 1)}
      fill={fill}
      stroke={fill}
      strokeWidth={0.5}
      rx={1}
    />
  );
}

function WickShape(props: { x?: number; y?: number; width?: number; height?: number }) {
  const { x, y, width, height } = props;
  if (x == null || y == null || width == null || height == null) return null;
  const cx = x + width / 2;
  return (
    <line
      x1={cx}
      y1={y}
      x2={cx}
      y2={y + Math.max(Math.abs(height), 0)}
      stroke="#94a3b8"
      strokeWidth={1}
    />
  );
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------

interface CandlePayload {
  date?: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  bullish?: boolean;
}

function CandleTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: CandlePayload }> }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 shadow-lg">
      <p className="mb-1 font-medium text-slate-100">{d.date}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        <span>Open</span>
        <span className="text-right font-mono">{d.open?.toFixed(2)}</span>
        <span>High</span>
        <span className="text-right font-mono">{d.high?.toFixed(2)}</span>
        <span>Low</span>
        <span className="text-right font-mono">{d.low?.toFixed(2)}</span>
        <span>Close</span>
        <span className="text-right font-mono">{d.close?.toFixed(2)}</span>
        {d.volume != null && (
          <>
            <span>Volume</span>
            <span className="text-right font-mono">
              {d.volume.toLocaleString()}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CandlestickChart({
  data,
  indicators = [],
  height = 500,
  isPremium = false,
}: CandlestickChartProps) {
  const showRSI = indicators.includes("rsi");
  const showMACD = indicators.includes("macd");
  const overlayIndicators = indicators.filter(
    (i) => i !== "rsi" && i !== "macd",
  );

  // Premium gating
  const rsiGated = showRSI && !isPremium;
  const macdGated = showMACD && !isPremium;
  const rsiAllowed = showRSI && isPremium;
  const macdAllowed = showMACD && isPremium;

  // Layout: main chart + optional sub-chart panels
  const panelCount = (rsiAllowed ? 1 : 0) + (macdAllowed ? 1 : 0);
  const mainPct = panelCount === 0 ? 100 : panelCount === 1 ? 70 : 55;
  const subPct = panelCount === 0 ? 0 : panelCount === 1 ? 30 : 22.5;
  const mainHeight = Math.round((height * mainPct) / 100);
  const subHeight = Math.round((height * subPct) / 100);

  // Build enriched chart data with indicator values
  const chartData = useMemo(() => {
    if (!data.length) return [];
    const closes = data.map((d) => d.close);

    const sma20 = overlayIndicators.includes("sma20")
      ? calcSMA(closes, 20)
      : null;
    const sma50 = overlayIndicators.includes("sma50")
      ? calcSMA(closes, 50)
      : null;
    const ema12 = overlayIndicators.includes("ema12")
      ? calcEMA(closes, 12)
      : null;
    const ema26 = overlayIndicators.includes("ema26")
      ? calcEMA(closes, 26)
      : null;
    const rsi = rsiAllowed ? calcRSI(closes) : null;
    const macd = macdAllowed ? calcMACD(closes) : null;

    return data.map((d, i) => {
      const bullish = d.close >= d.open;
      return {
        ...d,
        date: new Date(d.timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        bodyRange: [
          Math.min(d.open, d.close),
          Math.max(d.open, d.close),
        ] as [number, number],
        wickRange: [d.low, d.high] as [number, number],
        bullish,
        ...(sma20 && { sma20: sma20[i] }),
        ...(sma50 && { sma50: sma50[i] }),
        ...(ema12 && { ema12: ema12[i] }),
        ...(ema26 && { ema26: ema26[i] }),
        ...(rsi && { rsi: rsi[i] }),
        ...(macd && {
          macdLine: macd.macdLine[i],
          signal: macd.signal[i],
          histogram: macd.histogram[i],
        }),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, overlayIndicators.join(","), rsiAllowed, macdAllowed]);

  // Empty state
  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-sm text-slate-500"
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  // Y-axis domain
  const yMin = Math.min(...data.map((d) => d.low));
  const yMax = Math.max(...data.map((d) => d.high));
  const yPad = (yMax - yMin) * 0.05;

  const hasVolume = data.some((d) => d.volume != null);
  const maxVolume = hasVolume
    ? Math.max(...data.map((d) => d.volume ?? 0))
    : 1;

  return (
    <div className="w-full" style={{ height }}>
      {/* ----------------------------------------------------------------- */}
      {/* Main candlestick chart                                            */}
      {/* ----------------------------------------------------------------- */}
      <ResponsiveContainer width="100%" height={mainHeight}>
        <ComposedChart
          data={chartData}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(100,116,139,0.3)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={{ stroke: "#334155" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="price"
            domain={[yMin - yPad, yMax + yPad]}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => v.toFixed(2)}
            width={64}
          />
          {hasVolume && (
            <YAxis
              yAxisId="volume"
              orientation="right"
              domain={[0, maxVolume * 4]}
              hide
            />
          )}

          <Tooltip content={<CandleTooltip />} />

          {/* Volume bars (background, semi-transparent) */}
          {hasVolume && (
            <Bar
              yAxisId="volume"
              dataKey="volume"
              barSize={6}
              isAnimationActive={false}
              opacity={0.15}
            >
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.bullish ? BULL : BEAR} />
              ))}
            </Bar>
          )}

          {/* Wicks — thin range bars from low to high */}
          <Bar
            yAxisId="price"
            dataKey="wickRange"
            barSize={1}
            isAnimationActive={false}
            shape={<WickShape />}
          />

          {/* Candle bodies — range bars from min(open,close) to max(open,close) */}
          <Bar
            yAxisId="price"
            dataKey="bodyRange"
            barSize={8}
            isAnimationActive={false}
            shape={<CandleBody />}
          />

          {/* Overlay indicator lines */}
          {overlayIndicators.includes("sma20") && (
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="sma20"
              stroke={INDICATOR_COLORS.sma20}
              dot={false}
              strokeWidth={1.5}
              connectNulls
              isAnimationActive={false}
            />
          )}
          {overlayIndicators.includes("sma50") && (
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="sma50"
              stroke={INDICATOR_COLORS.sma50}
              dot={false}
              strokeWidth={1.5}
              connectNulls
              isAnimationActive={false}
            />
          )}
          {overlayIndicators.includes("ema12") && (
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="ema12"
              stroke={INDICATOR_COLORS.ema12}
              dot={false}
              strokeWidth={1.5}
              connectNulls
              isAnimationActive={false}
            />
          )}
          {overlayIndicators.includes("ema26") && (
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="ema26"
              stroke={INDICATOR_COLORS.ema26}
              dot={false}
              strokeWidth={1.5}
              connectNulls
              isAnimationActive={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* ----------------------------------------------------------------- */}
      {/* RSI sub-chart                                                     */}
      {/* ----------------------------------------------------------------- */}
      {rsiAllowed && (
        <ResponsiveContainer width="100%" height={subHeight}>
          <ComposedChart
            data={chartData}
            margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(100,116,139,0.2)"
              vertical={false}
            />
            <XAxis dataKey="date" hide />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              ticks={[30, 50, 70]}
              width={64}
            />
            <ReferenceLine
              y={70}
              stroke="#ef4444"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
            <ReferenceLine
              y={30}
              stroke="#22c55e"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
            <Line
              type="monotone"
              dataKey="rsi"
              stroke="#a78bfa"
              dot={false}
              strokeWidth={1.5}
              connectNulls
              isAnimationActive={false}
            />
            <Tooltip
              labelFormatter={() => ""}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [
                typeof value === "number" ? value.toFixed(2) : String(value),
                "RSI",
              ]}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: 8,
                fontSize: 11,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MACD sub-chart                                                    */}
      {/* ----------------------------------------------------------------- */}
      {macdAllowed && (
        <ResponsiveContainer width="100%" height={subHeight}>
          <ComposedChart
            data={chartData}
            margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(100,116,139,0.2)"
              vertical={false}
            />
            <XAxis dataKey="date" hide />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={64}
            />
            <ReferenceLine y={0} stroke="#475569" />
            <Bar dataKey="histogram" barSize={4} isAnimationActive={false}>
              {chartData.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={
                    (entry.histogram ?? 0) >= 0
                      ? "rgba(34,197,94,0.6)"
                      : "rgba(239,68,68,0.6)"
                  }
                />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="macdLine"
              stroke={INDICATOR_COLORS.macdLine}
              dot={false}
              strokeWidth={1.5}
              connectNulls
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="signal"
              stroke={INDICATOR_COLORS.signal}
              dot={false}
              strokeWidth={1.5}
              connectNulls
              isAnimationActive={false}
            />
            <Tooltip
              labelFormatter={() => ""}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                typeof value === "number" ? value.toFixed(4) : String(value),
                name === "macdLine"
                  ? "MACD"
                  : name === "signal"
                    ? "Signal"
                    : "Histogram",
              ]}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: 8,
                fontSize: 11,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Gated premium CTA for RSI / MACD                                  */}
      {/* ----------------------------------------------------------------- */}
      {(rsiGated || macdGated) && (
        <div className="relative mt-2">
          {/* Blurred placeholder chart silhouette */}
          <div className="h-24 overflow-hidden rounded-lg border border-slate-700 bg-slate-900/80">
            <div className="flex h-full w-full items-center justify-center blur-sm">
              <svg
                viewBox="0 0 200 60"
                className="h-full w-full opacity-20"
                preserveAspectRatio="none"
              >
                <polyline
                  points="0,40 20,35 40,38 60,20 80,25 100,15 120,30 140,22 160,28 180,18 200,25"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-slate-900/60 backdrop-blur-[2px]">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <svg
                className="h-4 w-4 text-amber-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              {rsiGated && macdGated
                ? "RSI & MACD"
                : rsiGated
                  ? "RSI"
                  : "MACD"}{" "}
              — Premium Feature
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Upgrade to Premium to unlock advanced technical indicators
            </p>
            <button className="mt-3 rounded-md bg-amber-500 px-4 py-1.5 text-xs font-semibold text-slate-900 transition-colors hover:bg-amber-400">
              Upgrade to Premium
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandlestickChart;
