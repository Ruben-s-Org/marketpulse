"use client";

import Link from "next/link";
import { useState } from "react";

export default function ProfitCalculatorPage() {
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [investmentFee, setInvestmentFee] = useState("");
  const [exitFee, setExitFee] = useState("");

  const buy = parseFloat(buyPrice) || 0;
  const sell = parseFloat(sellPrice) || 0;
  const qty = parseFloat(quantity) || 0;
  const entryFee = parseFloat(investmentFee) || 0;
  const closeFee = parseFloat(exitFee) || 0;

  const totalCost = buy * qty + entryFee;
  const totalRevenue = sell * qty - closeFee;
  const profitLoss = totalRevenue - totalCost;
  const roi = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
  const breakEven = qty > 0 ? (totalCost + closeFee) / qty : 0;

  const hasInput = buy > 0 && sell > 0 && qty > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">MP</div>
          <span className="text-xl font-bold">MarketPulse</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/tools/currency-converter" className="text-sm text-slate-300 hover:text-white transition-colors">Currency Converter</Link>
          <Link href="/tools/crypto-calculator" className="text-sm text-slate-300 hover:text-white transition-colors">Crypto Calculator</Link>
          <Link href="/blog" className="text-sm text-slate-300 hover:text-white transition-colors">Blog</Link>
          <Link href="/api/auth/google" className="bg-indigo-600 hover:bg-indigo-500 text-sm font-medium px-4 py-2 rounded-lg transition-colors">Sign In</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Investment Profit Calculator
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Calculate your profit or loss, ROI percentage, and break-even price for any stock, crypto, or forex trade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
            <h2 className="text-lg font-semibold mb-6">Trade Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Buy Price ($)</label>
                <input
                  type="number"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="any"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Sell Price ($)</label>
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="any"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="any"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Entry Fee ($)</label>
                  <input
                    type="number"
                    value={investmentFee}
                    onChange={(e) => setInvestmentFee(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="any"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Exit Fee ($)</label>
                  <input
                    type="number"
                    value={exitFee}
                    onChange={(e) => setExitFee(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="any"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`bg-slate-800/50 border rounded-xl p-8 ${
              hasInput
                ? profitLoss >= 0
                  ? "border-green-500/50"
                  : "border-red-500/50"
                : "border-slate-700/50"
            }`}>
              <h2 className="text-lg font-semibold mb-6">Results</h2>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Profit / Loss</p>
                  <p className={`text-3xl font-bold ${
                    !hasInput ? "text-slate-500" : profitLoss >= 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    {hasInput
                      ? `${profitLoss >= 0 ? "+" : ""}$${profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : "$0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Return on Investment (ROI)</p>
                  <p className={`text-3xl font-bold ${
                    !hasInput ? "text-slate-500" : roi >= 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    {hasInput ? `${roi >= 0 ? "+" : ""}${roi.toFixed(2)}%` : "0.00%"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 mb-1">Total Cost</p>
                  <p className="font-semibold">${hasInput ? totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Total Revenue</p>
                  <p className="font-semibold">${hasInput ? totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Break-Even Price</p>
                  <p className="font-semibold">${hasInput ? breakEven.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "0.00"}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Total Fees</p>
                  <p className="font-semibold">${(entryFee + closeFee).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 mt-8">
          <h2 className="text-xl font-semibold mb-4">About This Tool</h2>
          <p className="text-slate-400 mb-4">
            Use this free investment profit calculator to quickly determine your potential profit or loss on any trade.
            Enter your buy price, sell price, and quantity to see your ROI, break-even price, and total P&L including fees.
          </p>
          <p className="text-slate-400 mb-6">
            Track your actual portfolio performance over time with real market data.
            <Link href="/api/auth/google" className="text-indigo-400 hover:text-indigo-300 ml-1">Sign up for MarketPulse</Link> to get portfolio tracking, price alerts, and AI-powered insights.
          </p>
          <div className="flex gap-4">
            <Link href="/tools/currency-converter" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Currency Converter →
            </Link>
            <Link href="/tools/crypto-calculator" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Crypto Calculator →
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
