"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface FearGreedEntry {
  value: string;
  value_classification: string;
  timestamp: string;
}

function getColor(value: number): string {
  if (value <= 24) return "#ef4444"; // red-500
  if (value <= 44) return "#f97316"; // orange-500
  if (value <= 55) return "#eab308"; // yellow-500
  if (value <= 74) return "#4ade80"; // green-400
  return "#16a34a"; // green-600
}

function getColorClass(value: number): string {
  if (value <= 24) return "bg-red-500";
  if (value <= 44) return "bg-orange-500";
  if (value <= 55) return "bg-yellow-500";
  if (value <= 74) return "bg-green-400";
  return "bg-green-600";
}

function getTextColorClass(value: number): string {
  if (value <= 24) return "text-red-500";
  if (value <= 44) return "text-orange-500";
  if (value <= 55) return "text-yellow-500";
  if (value <= 74) return "text-green-400";
  return "text-green-600";
}

function SemiCircleGauge({ value }: { value: number }) {
  const size = 280;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10;

  // Arc from 180 degrees (left) to 0 degrees (right) — a semicircle
  const startAngle = Math.PI;
  const endAngle = 0;
  const totalAngle = Math.PI;

  // Background arc path
  const bgStartX = cx + radius * Math.cos(startAngle);
  const bgStartY = cy - radius * Math.sin(startAngle);
  const bgEndX = cx + radius * Math.cos(endAngle);
  const bgEndY = cy - radius * Math.sin(endAngle);
  const bgPath = `M ${bgStartX} ${bgStartY} A ${radius} ${radius} 0 0 1 ${bgEndX} ${bgEndY}`;

  // Value arc path
  const valueAngle = startAngle - (value / 100) * totalAngle;
  const valEndX = cx + radius * Math.cos(valueAngle);
  const valEndY = cy - radius * Math.sin(valueAngle);
  const largeArc = value / 100 > 0.5 ? 1 : 0;
  const valPath = `M ${bgStartX} ${bgStartY} A ${radius} ${radius} 0 ${largeArc} 1 ${valEndX} ${valEndY}`;

  // Needle position
  const needleLength = radius - 10;
  const needleX = cx + needleLength * Math.cos(valueAngle);
  const needleY = cy - needleLength * Math.sin(valueAngle);

  const color = getColor(value);

  return (
    <svg width={size} height={size / 2 + 40} viewBox={`0 0 ${size} ${size / 2 + 40}`} className="mx-auto">
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="25%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="75%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>

      {/* Background arc with gradient */}
      <path d={bgPath} fill="none" stroke="url(#gaugeGradient)" strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.25} />

      {/* Value arc */}
      <path d={valPath} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />

      {/* Needle */}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="white" strokeWidth={3} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={6} fill="white" />

      {/* Labels */}
      <text x={strokeWidth / 2} y={cy + 24} fill="#94a3b8" fontSize="12" textAnchor="start">0</text>
      <text x={cx} y={30} fill="#94a3b8" fontSize="12" textAnchor="middle">50</text>
      <text x={size - strokeWidth / 2} y={cy + 24} fill="#94a3b8" fontSize="12" textAnchor="end">100</text>
    </svg>
  );
}

export default function CryptoFearGreedPage() {
  const [data, setData] = useState<FearGreedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("https://api.alternative.me/fng/?limit=30");
        if (!res.ok) throw new Error("Failed to fetch data");
        const json = await res.json() as { data: FearGreedEntry[] };
        setData(json.data);
      } catch {
        setError("Unable to load Fear & Greed Index data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const current = data[0];
  const currentValue = current ? parseInt(current.value) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">MP</div>
          <span className="text-xl font-bold">MarketPulse</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/tools/currency-converter" className="text-sm text-slate-300 hover:text-white transition-colors">Currency Converter</Link>
          <Link href="/tools/stock-screener" className="text-sm text-slate-300 hover:text-white transition-colors">Stock Screener</Link>
          <Link href="/tools/crypto-calculator" className="text-sm text-slate-300 hover:text-white transition-colors">Crypto Calculator</Link>
          <Link href="/blog" className="text-sm text-slate-300 hover:text-white transition-colors">Blog</Link>
          <Link href="/api/auth/google" className="bg-indigo-600 hover:bg-indigo-500 text-sm font-medium px-4 py-2 rounded-lg transition-colors">Sign In</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Crypto Fear &amp; Greed Index
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Gauge the overall sentiment of the cryptocurrency market in real time. Are traders fearful or greedy right now?
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-16 mb-8 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400">Loading market sentiment data...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-8 mb-8 text-center">
            <p className="text-red-400 text-lg mb-2">Something went wrong</p>
            <p className="text-slate-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-sm font-medium px-6 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main gauge */}
        {!loading && !error && current && (
          <>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 mb-8">
              <div className="flex flex-col items-center">
                <SemiCircleGauge value={currentValue} />
                <p className={`text-6xl font-bold mt-2 ${getTextColorClass(currentValue)}`}>
                  {currentValue}
                </p>
                <p className={`text-2xl font-semibold mt-1 ${getTextColorClass(currentValue)}`}>
                  {current.value_classification}
                </p>
                <p className="text-sm text-slate-500 mt-3">
                  Updated {new Date(parseInt(current.timestamp) * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> Extreme Fear (0-24)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500" /> Fear (25-44)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-500" /> Neutral (45-55)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400" /> Greed (56-74)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-600" /> Extreme Greed (75-100)</span>
              </div>
            </div>

            {/* 30-day history */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 mb-8">
              <h2 className="text-xl font-semibold mb-6">30-Day Sentiment History</h2>
              <div className="space-y-1.5">
                {data.map((entry, i) => {
                  const val = parseInt(entry.value);
                  const date = new Date(parseInt(entry.timestamp) * 1000);
                  const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  return (
                    <div key={i} className="flex items-center gap-3 group">
                      <span className="text-xs text-slate-500 w-16 shrink-0 text-right">{dateStr}</span>
                      <div className="flex-1 h-6 bg-slate-900/50 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all ${getColorClass(val)}`}
                          style={{ width: `${val}%`, opacity: 0.8 }}
                        />
                        <span className="absolute inset-y-0 left-2 flex items-center text-xs font-medium text-white/90">
                          {val} — {entry.value_classification}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Explanation section */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">What Is the Fear &amp; Greed Index?</h2>
          <p className="text-slate-400 mb-4">
            The Crypto Fear &amp; Greed Index measures overall market sentiment on a scale from 0 (Extreme Fear) to 100 (Extreme Greed). When the market is fearful, it may signal a buying opportunity. When the market is greedy, a correction could be near.
          </p>
          <p className="text-slate-400 mb-4">The index is calculated from six weighted factors:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-indigo-400 mb-1">Volatility (25%)</h3>
              <p className="text-xs text-slate-500">Compares current Bitcoin volatility and max drawdowns against 30- and 90-day averages.</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-indigo-400 mb-1">Market Momentum / Volume (25%)</h3>
              <p className="text-xs text-slate-500">Measures current volume and momentum vs. 30- and 90-day averages.</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-indigo-400 mb-1">Social Media (15%)</h3>
              <p className="text-xs text-slate-500">Analyzes crypto-related hashtags, posts, and engagement rates on social platforms.</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-indigo-400 mb-1">Surveys (15%)</h3>
              <p className="text-xs text-slate-500">Weekly crypto polling surveys gauging investor sentiment directly.</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-indigo-400 mb-1">Bitcoin Dominance (10%)</h3>
              <p className="text-xs text-slate-500">Rising BTC dominance signals fear as investors flee altcoins for safety.</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-indigo-400 mb-1">Google Trends (10%)</h3>
              <p className="text-xs text-slate-500">Tracks search volume for Bitcoin-related queries and their sentiment.</p>
            </div>
          </div>
        </div>

        {/* About / CTA section */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-4">About This Tool</h2>
          <p className="text-slate-400 mb-4">
            This tool pulls live data from the Alternative.me Fear &amp; Greed Index API, updated daily. Use it as one signal among many when evaluating market conditions.
          </p>
          <p className="text-slate-400 mb-6">
            Want to get notified when the index hits Extreme Fear or Extreme Greed?
            <Link href="/api/auth/google" className="text-indigo-400 hover:text-indigo-300 ml-1">Sign up for MarketPulse</Link> and set custom sentiment alerts with instant email notifications.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/tools/currency-converter" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Currency Converter &rarr;
            </Link>
            <Link href="/tools/stock-screener" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Stock Screener &rarr;
            </Link>
            <Link href="/tools/crypto-calculator" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Crypto Calculator &rarr;
            </Link>
            <Link href="/tools/profit-calculator" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Profit Calculator &rarr;
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-slate-500">
          <span>MarketPulse 2026. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
