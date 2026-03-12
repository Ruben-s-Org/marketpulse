"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

const CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "MXN",
  "BRL", "KRW", "SGD", "HKD", "NOK", "SEK", "DKK", "NZD", "ZAR", "TRY",
];

interface RateHistory {
  date: string;
  rate: number;
}

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [result, setResult] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<RateHistory[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const convert = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`
      );
      const data = await res.json() as { rates: Record<string, number>; date: string };
      const r = data.rates[to];
      setRate(r);
      setResult(parseFloat(amount) * r);
      setLastUpdated(data.date);
    } catch {
      setResult(null);
    }
    setLoading(false);
  }, [amount, from, to]);

  const fetchHistory = useCallback(async () => {
    try {
      const end = new Date().toISOString().split("T")[0];
      const start = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
      const res = await fetch(
        `https://api.frankfurter.dev/v1/${start}..${end}?base=${from}&symbols=${to}`
      );
      const data = await res.json() as { rates: Record<string, Record<string, number>> };
      const points: RateHistory[] = Object.entries(data.rates).map(
        ([date, rates]) => ({
          date,
          rate: (rates as Record<string, number>)[to],
        })
      );
      setHistory(points);
    } catch {
      setHistory([]);
    }
  }, [from, to]);

  useEffect(() => {
    convert();
    fetchHistory();
  }, [convert, fetchHistory]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const maxRate = history.length ? Math.max(...history.map((h) => h.rate)) : 0;
  const minRate = history.length ? Math.min(...history.map((h) => h.rate)) : 0;
  const range = maxRate - minRate || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">MP</div>
          <span className="text-xl font-bold">MarketPulse</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/tools/crypto-calculator" className="text-sm text-slate-300 hover:text-white transition-colors">Crypto Calculator</Link>
          <Link href="/tools/profit-calculator" className="text-sm text-slate-300 hover:text-white transition-colors">Profit Calculator</Link>
          <Link href="/blog" className="text-sm text-slate-300 hover:text-white transition-colors">Blog</Link>
          <Link href="/api/auth/google" className="bg-indigo-600 hover:bg-indigo-500 text-sm font-medium px-4 py-2 rounded-lg transition-colors">Sign In</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Currency Converter
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Convert between 20+ world currencies with real-time exchange rates from the European Central Bank.
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="any"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex items-end gap-2">
              <div>
                <label className="block text-sm text-slate-400 mb-2">From</label>
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={swap}
                className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors mb-0"
                title="Swap currencies"
              >
                ⇄
              </button>
              <div>
                <label className="block text-sm text-slate-400 mb-2">To</label>
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {result !== null && (
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-400 mb-1">
                {parseFloat(amount).toLocaleString()} {from} =
              </p>
              <p className="text-4xl font-bold text-indigo-400">
                {loading ? "..." : result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {to}
              </p>
              {rate && (
                <p className="text-sm text-slate-500 mt-2">
                  1 {from} = {rate.toFixed(4)} {to} · Updated {lastUpdated}
                </p>
              )}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">30-Day Rate History</h2>
            <div className="h-48 flex items-end gap-[2px]">
              {history.map((h) => {
                const height = ((h.rate - minRate) / range) * 100;
                return (
                  <div
                    key={h.date}
                    className="flex-1 bg-indigo-500/60 hover:bg-indigo-400 rounded-t transition-colors relative group"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  >
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-700 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">
                      {h.date}: {h.rate.toFixed(4)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>{history[0]?.date}</span>
              <span>{history[history.length - 1]?.date}</span>
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-4">About This Tool</h2>
          <p className="text-slate-400 mb-4">
            Our free currency converter uses real-time exchange rates from the European Central Bank via the Frankfurter API.
            Rates are updated daily on business days.
          </p>
          <p className="text-slate-400 mb-6">
            Need real-time alerts when a currency hits your target rate?
            <Link href="/api/auth/google" className="text-indigo-400 hover:text-indigo-300 ml-1">Sign up for MarketPulse</Link> and set custom forex alerts with instant email notifications.
          </p>
          <div className="flex gap-4">
            <Link href="/tools/crypto-calculator" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Crypto Calculator →
            </Link>
            <Link href="/tools/profit-calculator" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Profit Calculator →
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
