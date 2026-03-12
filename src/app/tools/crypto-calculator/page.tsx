"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

const TOP_CRYPTOS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "tether", symbol: "USDT", name: "Tether" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "usd-coin", symbol: "USDC", name: "USD Coin" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot" },
];

const FIAT_CURRENCIES = ["usd", "eur", "gbp", "jpy", "aud", "cad", "chf", "inr"];

interface CryptoData {
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
}

export default function CryptoCalculatorPage() {
  const [amount, setAmount] = useState("1");
  const [crypto, setCrypto] = useState("bitcoin");
  const [fiat, setFiat] = useState("usd");
  const [direction, setDirection] = useState<"crypto-to-fiat" | "fiat-to-crypto">("crypto-to-fiat");
  const [data, setData] = useState<CryptoData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPrice = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${crypto}?localization=false&tickers=false&community_data=false&developer_data=false`
      );
      const json = await res.json() as {
        market_data: {
          current_price: Record<string, number>;
          price_change_percentage_24h: number;
          market_cap: Record<string, number>;
          total_volume: Record<string, number>;
        };
      };
      setData({
        price: json.market_data.current_price[fiat],
        change24h: json.market_data.price_change_percentage_24h,
        marketCap: json.market_data.market_cap[fiat],
        volume24h: json.market_data.total_volume[fiat],
      });
    } catch {
      setData(null);
    }
    setLoading(false);
  }, [crypto, fiat]);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  const selectedCrypto = TOP_CRYPTOS.find((c) => c.id === crypto)!;
  const parsedAmount = parseFloat(amount) || 0;

  const result =
    data && parsedAmount > 0
      ? direction === "crypto-to-fiat"
        ? parsedAmount * data.price
        : parsedAmount / data.price
      : null;

  const formatNumber = (n: number) =>
    n >= 1e9
      ? `${(n / 1e9).toFixed(2)}B`
      : n >= 1e6
      ? `${(n / 1e6).toFixed(2)}M`
      : n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">MP</div>
          <span className="text-xl font-bold">MarketPulse</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/tools/currency-converter" className="text-sm text-slate-300 hover:text-white transition-colors">Currency Converter</Link>
          <Link href="/tools/profit-calculator" className="text-sm text-slate-300 hover:text-white transition-colors">Profit Calculator</Link>
          <Link href="/blog" className="text-sm text-slate-300 hover:text-white transition-colors">Blog</Link>
          <Link href="/api/auth/google" className="bg-indigo-600 hover:bg-indigo-500 text-sm font-medium px-4 py-2 rounded-lg transition-colors">Sign In</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Crypto Calculator
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Convert between cryptocurrencies and fiat currencies with live prices from CoinGecko. See 24h change, market cap, and volume.
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 mb-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setDirection("crypto-to-fiat")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                direction === "crypto-to-fiat" ? "bg-indigo-600" : "bg-slate-700 hover:bg-slate-600"
              }`}
            >
              Crypto → Fiat
            </button>
            <button
              onClick={() => setDirection("fiat-to-crypto")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                direction === "fiat-to-crypto" ? "bg-indigo-600" : "bg-slate-700 hover:bg-slate-600"
              }`}
            >
              Fiat → Crypto
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div>
              <label className="block text-sm text-slate-400 mb-2">Cryptocurrency</label>
              <select
                value={crypto}
                onChange={(e) => setCrypto(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {TOP_CRYPTOS.map((c) => (
                  <option key={c.id} value={c.id}>{c.symbol} — {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Fiat Currency</label>
              <select
                value={fiat}
                onChange={(e) => setFiat(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {FIAT_CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          {result !== null && data && (
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-400 mb-1">
                {parsedAmount.toLocaleString()} {direction === "crypto-to-fiat" ? selectedCrypto.symbol : fiat.toUpperCase()} =
              </p>
              <p className="text-4xl font-bold text-indigo-400">
                {loading
                  ? "..."
                  : direction === "crypto-to-fiat"
                  ? `${fiat.toUpperCase()} ${result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `${result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${selectedCrypto.symbol}`}
              </p>
            </div>
          )}
        </div>

        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
              <p className="text-sm text-slate-400 mb-1">24h Change</p>
              <p className={`text-2xl font-bold ${data.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                {data.change24h >= 0 ? "+" : ""}{data.change24h.toFixed(2)}%
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
              <p className="text-sm text-slate-400 mb-1">Market Cap</p>
              <p className="text-2xl font-bold">${formatNumber(data.marketCap)}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
              <p className="text-sm text-slate-400 mb-1">24h Volume</p>
              <p className="text-2xl font-bold">${formatNumber(data.volume24h)}</p>
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-4">About This Tool</h2>
          <p className="text-slate-400 mb-4">
            Our free crypto calculator uses live price data from CoinGecko to convert between popular cryptocurrencies and fiat currencies.
            Prices update in real-time and include 24-hour price change, market cap, and trading volume.
          </p>
          <p className="text-slate-400 mb-6">
            Want to get notified when Bitcoin or Ethereum hits a specific price?
            <Link href="/api/auth/google" className="text-indigo-400 hover:text-indigo-300 ml-1">Sign up for MarketPulse</Link> and set unlimited crypto price alerts.
          </p>
          <div className="flex gap-4">
            <Link href="/tools/currency-converter" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Currency Converter →
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
