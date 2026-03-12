"use client";

import Link from "next/link";
import { useState } from "react";

const CURRENCY_PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CHF",
  "EUR/GBP", "EUR/JPY", "GBP/JPY", "AUD/JPY", "NZD/USD",
  "USD/CAD", "EUR/AUD", "EUR/CHF",
];

function getPipValue(pair: string, lotSize: number): number {
  const quote = pair.split("/")[1];
  if (quote === "JPY") {
    return (lotSize * 0.01) / 110;
  }
  return lotSize * 0.0001;
}

export default function ForexCalculatorPage() {
  const [tab, setTab] = useState<"position" | "pip">("position");

  // Position Size Calculator state
  const [balance, setBalance] = useState("10000");
  const [riskPct, setRiskPct] = useState("2");
  const [stopLoss, setStopLoss] = useState("50");
  const [posPair, setPosPair] = useState("EUR/USD");

  // Pip Value Calculator state
  const [pipPair, setPipPair] = useState("EUR/USD");
  const [lotType, setLotType] = useState("100000");

  // Position size calculations
  const balanceNum = parseFloat(balance) || 0;
  const riskPctNum = parseFloat(riskPct) || 0;
  const stopLossNum = parseFloat(stopLoss) || 0;
  const riskAmount = balanceNum * riskPctNum / 100;
  const pipValuePos = getPipValue(posPair, 100000);
  const positionUnits =
    stopLossNum > 0 && pipValuePos > 0
      ? riskAmount / (stopLossNum * pipValuePos)
      : 0;
  const positionLots = positionUnits / 100000;

  // Pip value calculations
  const lotSizeNum = parseFloat(lotType) || 100000;
  const pipValue = getPipValue(pipPair, lotSizeNum);

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
          <Link href="/tools/crypto-calculator" className="text-sm text-slate-300 hover:text-white transition-colors">Crypto Fear Index</Link>
          <Link href="/blog" className="text-sm text-slate-300 hover:text-white transition-colors">Blog</Link>
          <Link href="/api/auth/google" className="bg-indigo-600 hover:bg-indigo-500 text-sm font-medium px-4 py-2 rounded-lg transition-colors">Sign In</Link>
        </div>
        <Link href="/api/auth/google" className="md:hidden bg-indigo-600 hover:bg-indigo-500 text-sm font-medium px-4 py-2 rounded-lg transition-colors">Sign In</Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Forex Calculator
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Calculate position size, risk amount, and pip values for any major forex currency pair.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-1 flex">
            <button
              onClick={() => setTab("position")}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${
                tab === "position"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Position Size
            </button>
            <button
              onClick={() => setTab("pip")}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${
                tab === "pip"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Pip Value
            </button>
          </div>
        </div>

        {/* Position Size Calculator */}
        {tab === "position" && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 mb-8">
            <h2 className="text-xl font-semibold mb-6">Position Size Calculator</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Account Balance ($)</label>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  min="0"
                  step="any"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Risk Percentage (%)</label>
                <input
                  type="number"
                  value={riskPct}
                  onChange={(e) => setRiskPct(e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Stop Loss (pips)</label>
                <input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  min="0"
                  step="1"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Currency Pair</label>
                <select
                  value={posPair}
                  onChange={(e) => setPosPair(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {CURRENCY_PAIRS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {balanceNum > 0 && riskPctNum > 0 && stopLossNum > 0 && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="bg-slate-900/50 rounded-lg p-6">
                  <p className="text-sm text-slate-400 mb-1">Risk Amount</p>
                  <p className="text-3xl font-bold text-indigo-400">
                    ${riskAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-6">
                  <p className="text-sm text-slate-400 mb-1">Position Size (units)</p>
                  <p className="text-3xl font-bold text-indigo-400">
                    {Math.round(positionUnits).toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-6">
                  <p className="text-sm text-slate-400 mb-1">Position Size (lots)</p>
                  <p className="text-3xl font-bold text-indigo-400">
                    {positionLots.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pip Value Calculator */}
        {tab === "pip" && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 mb-8">
            <h2 className="text-xl font-semibold mb-6">Pip Value Calculator</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Currency Pair</label>
                <select
                  value={pipPair}
                  onChange={(e) => setPipPair(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {CURRENCY_PAIRS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Lot Size</label>
                <select
                  value={lotType}
                  onChange={(e) => setLotType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="100000">Standard (100,000)</option>
                  <option value="10000">Mini (10,000)</option>
                  <option value="1000">Micro (1,000)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Account Currency</label>
                <select
                  disabled
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-indigo-500 transition-colors opacity-60"
                >
                  <option>USD</option>
                </select>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="bg-slate-900/50 rounded-lg p-6 inline-block min-w-[280px]">
                <p className="text-sm text-slate-400 mb-1">Pip Value (USD)</p>
                <p className="text-4xl font-bold text-indigo-400">
                  ${pipValue.toFixed(4)}
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  per pip for {pipPair} at {lotSizeNum.toLocaleString()} units
                </p>
              </div>
            </div>
          </div>
        )}

        {/* About Section */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">About This Tool</h2>
          <p className="text-slate-400 mb-4">
            Our free forex calculator helps you determine the correct position size based on your account balance, risk tolerance, and stop loss distance.
            Proper position sizing is the cornerstone of risk management in forex trading.
          </p>
          <p className="text-slate-400 mb-6">
            Want real-time forex alerts and advanced risk management tools?
            <Link href="/api/auth/google" className="text-indigo-400 hover:text-indigo-300 ml-1">Sign up for MarketPulse</Link> and take your trading to the next level.
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
