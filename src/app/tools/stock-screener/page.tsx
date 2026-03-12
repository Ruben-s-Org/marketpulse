"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  marketCap: number;
  sector: string;
}

const STOCKS: Stock[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: 227.48, change: 1.32, marketCap: 3480e9, sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 415.60, change: 0.87, marketCap: 3090e9, sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 174.25, change: -0.45, marketCap: 2140e9, sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 198.32, change: 1.75, marketCap: 2060e9, sector: "Consumer" },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 131.88, change: 3.21, marketCap: 3240e9, sector: "Technology" },
  { symbol: "META", name: "Meta Platforms Inc.", price: 595.40, change: -1.12, marketCap: 1510e9, sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.50, change: -2.34, marketCap: 793e9, sector: "Consumer" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", price: 232.15, change: 0.56, marketCap: 670e9, sector: "Finance" },
  { symbol: "V", name: "Visa Inc.", price: 311.20, change: 0.23, marketCap: 636e9, sector: "Finance" },
  { symbol: "JNJ", name: "Johnson & Johnson", price: 156.80, change: -0.18, marketCap: 378e9, sector: "Healthcare" },
  { symbol: "UNH", name: "UnitedHealth Group", price: 527.90, change: 0.95, marketCap: 486e9, sector: "Healthcare" },
  { symbol: "XOM", name: "Exxon Mobil Corp.", price: 108.45, change: -0.67, marketCap: 457e9, sector: "Energy" },
  { symbol: "PG", name: "Procter & Gamble", price: 168.30, change: 0.14, marketCap: 396e9, sector: "Consumer" },
  { symbol: "MA", name: "Mastercard Inc.", price: 478.60, change: 0.42, marketCap: 444e9, sector: "Finance" },
  { symbol: "CVX", name: "Chevron Corp.", price: 155.20, change: -1.05, marketCap: 284e9, sector: "Energy" },
  { symbol: "LLY", name: "Eli Lilly & Co.", price: 782.30, change: 2.15, marketCap: 743e9, sector: "Healthcare" },
  { symbol: "PFE", name: "Pfizer Inc.", price: 27.45, change: -0.82, marketCap: 155e9, sector: "Healthcare" },
  { symbol: "BAC", name: "Bank of America", price: 39.80, change: 0.31, marketCap: 310e9, sector: "Finance" },
  { symbol: "KO", name: "Coca-Cola Co.", price: 61.25, change: 0.08, marketCap: 264e9, sector: "Consumer" },
  { symbol: "COP", name: "ConocoPhillips", price: 112.60, change: -1.43, marketCap: 133e9, sector: "Energy" },
];

const SECTORS = ["All", "Technology", "Healthcare", "Finance", "Energy", "Consumer"];

const MARKET_CAP_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "$10B+", value: 10e9 },
  { label: "$100B+", value: 100e9 },
  { label: "$500B+", value: 500e9 },
  { label: "$1T+", value: 1e12 },
];

type SortKey = "symbol" | "name" | "price" | "change" | "marketCap" | "sector";

const formatMarketCap = (n: number) =>
  n >= 1e12
    ? `$${(n / 1e12).toFixed(2)}T`
    : n >= 1e9
    ? `$${(n / 1e9).toFixed(0)}B`
    : `$${(n / 1e6).toFixed(0)}M`;

export default function StockScreenerPage() {
  const [sector, setSector] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minMarketCap, setMinMarketCap] = useState(0);
  const [maxMarketCap, setMaxMarketCap] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "symbol" || key === "name" || key === "sector");
    }
  };

  const filtered = useMemo(() => {
    let list = [...STOCKS];

    if (sector !== "All") list = list.filter((s) => s.sector === sector);

    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) list = list.filter((s) => s.price >= min);
    if (!isNaN(max)) list = list.filter((s) => s.price <= max);

    if (minMarketCap > 0) list = list.filter((s) => s.marketCap >= minMarketCap);
    if (maxMarketCap > 0) list = list.filter((s) => s.marketCap <= maxMarketCap);

    list.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });

    return list;
  }, [sector, minPrice, maxPrice, minMarketCap, maxMarketCap, sortKey, sortAsc]);

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <span className="text-slate-600 ml-1">&#8597;</span>;
    return <span className="text-indigo-400 ml-1">{sortAsc ? "\u25B2" : "\u25BC"}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">MP</div>
          <span className="text-xl font-bold">MarketPulse</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/tools/currency-converter" className="text-sm text-slate-300 hover:text-white transition-colors">Currency Converter</Link>
          <Link href="/tools/crypto-calculator" className="text-sm text-slate-300 hover:text-white transition-colors">Crypto Calculator</Link>
          <Link href="/blog" className="text-sm text-slate-300 hover:text-white transition-colors">Blog</Link>
          <Link href="/api/auth/google" className="bg-indigo-600 hover:bg-indigo-500 text-sm font-medium px-4 py-2 rounded-lg transition-colors">Sign In</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Stock Screener</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Filter and sort stocks by price, market cap, sector, and daily performance. Find the stocks that match your criteria.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-8">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Filters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {SECTORS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Min Price ($)</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                min="0"
                step="any"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Max Price ($)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Any"
                min="0"
                step="any"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Min Market Cap</label>
              <select
                value={minMarketCap}
                onChange={(e) => setMinMarketCap(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {MARKET_CAP_OPTIONS.map((o) => (
                  <option key={o.label} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Max Market Cap</label>
              <select
                value={maxMarketCap}
                onChange={(e) => setMaxMarketCap(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value={0}>Any</option>
                {MARKET_CAP_OPTIONS.slice(1).map((o) => (
                  <option key={o.label} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-400 mb-4">{filtered.length} stock{filtered.length !== 1 ? "s" : ""} found</p>

        {/* Table - Desktop */}
        <div className="hidden md:block bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                {([
                  ["symbol", "Symbol"],
                  ["name", "Name"],
                  ["price", "Price"],
                  ["change", "Change %"],
                  ["marketCap", "Market Cap"],
                  ["sector", "Sector"],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="text-left text-sm font-medium text-slate-400 px-6 py-4 cursor-pointer hover:text-white transition-colors select-none"
                  >
                    {label}
                    <SortIcon column={key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((stock) => (
                <tr key={stock.symbol} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4 font-semibold text-indigo-400">{stock.symbol}</td>
                  <td className="px-6 py-4 text-slate-200">{stock.name}</td>
                  <td className="px-6 py-4 font-medium">${stock.price.toFixed(2)}</td>
                  <td className={`px-6 py-4 font-medium ${stock.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 text-slate-300">{formatMarketCap(stock.marketCap)}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-300">{stock.sector}</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No stocks match your filters. Try adjusting your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cards - Mobile */}
        <div className="md:hidden space-y-3 mb-8">
          {filtered.map((stock) => (
            <div key={stock.symbol} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold text-indigo-400 mr-2">{stock.symbol}</span>
                  <span className="text-sm text-slate-400">{stock.name}</span>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-300">{stock.sector}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">${stock.price.toFixed(2)}</span>
                <span className={`font-medium ${stock.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">Mkt Cap: {formatMarketCap(stock.marketCap)}</p>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No stocks match your filters. Try adjusting your criteria.
            </div>
          )}
        </div>

        {/* About */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-4">About This Tool</h2>
          <p className="text-slate-400 mb-4">
            Our free stock screener lets you filter and sort stocks by price, market capitalization, sector, and daily performance.
            Use the filters above to narrow down stocks that match your investment criteria across Technology, Healthcare, Finance, Energy, and Consumer sectors.
          </p>
          <p className="text-slate-400 mb-6">
            Want real-time stock alerts and advanced screening?
            <Link href="/api/auth/google" className="text-indigo-400 hover:text-indigo-300 ml-1">Sign up for MarketPulse</Link> to unlock live data, custom watchlists, and price alerts.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/tools/currency-converter" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Currency Converter &rarr;
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
