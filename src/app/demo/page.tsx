'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';

interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
}

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
}

interface ForexData {
  base: string;
  date: string;
  rates: Record<string, number>;
}

type TabType = 'crypto' | 'stocks' | 'forex';

function formatPrice(price: number): string {
  if (price >= 1) return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  return '$' + price.toFixed(6);
}

function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return '$' + (cap / 1e12).toFixed(2) + 'T';
  if (cap >= 1e9) return '$' + (cap / 1e9).toFixed(2) + 'B';
  if (cap >= 1e6) return '$' + (cap / 1e6).toFixed(2) + 'M';
  return '$' + cap.toLocaleString();
}

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const sampled = data.filter((_, i) => i % 4 === 0).map((price, i) => ({ i, p: price }));
  return (
    <ResponsiveContainer width={100} height={32}>
      <AreaChart data={sampled}>
        <defs>
          <linearGradient id={positive ? 'demoSparkGreen' : 'demoSparkRed'} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={positive ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
            <stop offset="100%" stopColor={positive ? '#22c55e' : '#ef4444'} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="p"
          stroke={positive ? '#22c55e' : '#ef4444'}
          fill={`url(#${positive ? 'demoSparkGreen' : 'demoSparkRed'})`}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function DemoDashboard() {
  const [cryptos, setCryptos] = useState<CryptoAsset[]>([]);
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [forex, setForex] = useState<ForexData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('crypto');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMarketData = useCallback(async () => {
    try {
      const [cryptoRes, stocksRes, forexRes] = await Promise.all([
        fetch('/api/market/crypto'),
        fetch('/api/market/stocks'),
        fetch('/api/market/forex'),
      ]);
      if (cryptoRes.ok) setCryptos((await cryptoRes.json()) as CryptoAsset[]);
      if (stocksRes.ok) setStocks((await stocksRes.json()) as StockQuote[]);
      if (forexRes.ok) setForex((await forexRes.json()) as ForexData);
      setLastUpdated(new Date());
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  const filteredCryptos = cryptos.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topMovers = [...cryptos]
    .sort((a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h))
    .slice(0, 5);

  const forexPairs = forex
    ? Object.entries(forex.rates).map(([currency, rate]) => ({
        pair: `USD/${currency}`,
        rate,
        currency,
      }))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-lg">Loading demo...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Demo Banner */}
      <div className="bg-amber-500/90 text-black px-4 py-3 text-center text-sm font-medium">
        <span>You&apos;re viewing a demo. </span>
        <span className="hidden sm:inline">Sign up for free to save alerts and track your portfolio. </span>
        <a
          href="/api/auth/google"
          className="inline-flex items-center gap-1 bg-black text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-gray-800 transition-colors ml-2"
        >
          Sign Up Free &rarr;
        </a>
      </div>

      {/* Nav */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">
            MP
          </div>
          <span className="text-xl font-bold">MarketPulse</span>
          <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium ml-1">
            Demo
          </span>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-slate-500 hidden sm:inline">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <a
            href="/api/auth/google"
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            Sign Up
          </a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Market Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-8">
          {cryptos.slice(0, 3).map((c) => (
            <div key={c.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <img src={c.image} alt={c.name} className="w-5 h-5 rounded-full" />
                <p className="text-xs text-slate-400">{c.symbol.toUpperCase()}</p>
              </div>
              <p className="text-lg font-bold">{formatPrice(c.current_price)}</p>
              <p className={`text-xs font-medium ${c.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {c.price_change_percentage_24h >= 0 ? '+' : ''}{c.price_change_percentage_24h?.toFixed(2)}%
              </p>
            </div>
          ))}
          {stocks.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[8px] font-bold text-indigo-400">S</div>
                <p className="text-xs text-slate-400">{stocks[0].symbol}</p>
              </div>
              <p className="text-lg font-bold">{formatPrice(stocks[0].price)}</p>
              <p className={`text-xs font-medium ${stocks[0].changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stocks[0].changePercent >= 0 ? '+' : ''}{stocks[0].changePercent.toFixed(2)}%
              </p>
            </div>
          )}
          {forex && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-2">EUR/USD</p>
              <p className="text-lg font-bold">{(1 / forex.rates.EUR).toFixed(4)}</p>
              <p className="text-xs text-slate-500">{forex.date}</p>
            </div>
          )}
        </div>

        {/* Top Movers */}
        {topMovers.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 mb-8">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">Biggest Movers (24h)</h2>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {topMovers.map((c) => (
                <div key={c.id} className="flex-shrink-0 bg-slate-900/50 rounded-lg px-4 py-3 min-w-[140px]">
                  <div className="flex items-center gap-2 mb-1">
                    <img src={c.image} alt={c.name} className="w-4 h-4 rounded-full" />
                    <span className="text-xs font-medium">{c.symbol.toUpperCase()}</span>
                  </div>
                  <p className={`text-sm font-bold ${c.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {c.price_change_percentage_24h >= 0 ? '+' : ''}{c.price_change_percentage_24h?.toFixed(2)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs + Search */}
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('crypto')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'crypto' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Crypto
            </button>
            <button
              onClick={() => setActiveTab('stocks')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'stocks' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Stocks
            </button>
            <button
              onClick={() => setActiveTab('forex')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'forex' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Forex
            </button>
          </div>
          {activeTab === 'crypto' && (
            <input
              type="text"
              placeholder="Search crypto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
            />
          )}
        </div>

        {/* Crypto Table */}
        {activeTab === 'crypto' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 text-xs text-slate-400">
                    <th className="text-left px-4 py-3 font-medium">#</th>
                    <th className="text-left px-4 py-3 font-medium">Name</th>
                    <th className="text-right px-4 py-3 font-medium">Price</th>
                    <th className="text-right px-4 py-3 font-medium">24h %</th>
                    <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Market Cap</th>
                    <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">Volume</th>
                    <th className="text-right px-4 py-3 font-medium hidden md:table-cell">7d Chart</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCryptos.map((c, i) => (
                    <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-500">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <img src={c.image} alt={c.name} className="w-6 h-6 rounded-full" />
                          <span className="font-medium text-sm">{c.name}</span>
                          <span className="text-xs text-slate-500 uppercase">{c.symbol}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">{formatPrice(c.current_price)}</td>
                      <td className={`px-4 py-3 text-right text-sm font-medium ${
                        c.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {c.price_change_percentage_24h >= 0 ? '+' : ''}{c.price_change_percentage_24h?.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-300 hidden md:table-cell">
                        {formatMarketCap(c.market_cap)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-300 hidden lg:table-cell">
                        {formatMarketCap(c.total_volume)}
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        {c.sparkline_in_7d?.price && (
                          <div className="flex justify-end">
                            <MiniSparkline
                              data={c.sparkline_in_7d.price}
                              positive={c.price_change_percentage_24h >= 0}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredCryptos.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                {cryptos.length === 0 ? 'Loading crypto data...' : 'No results found'}
              </div>
            )}
          </div>
        )}

        {/* Stocks Table */}
        {activeTab === 'stocks' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 text-xs text-slate-400">
                    <th className="text-left px-4 py-3 font-medium">#</th>
                    <th className="text-left px-4 py-3 font-medium">Symbol</th>
                    <th className="text-right px-4 py-3 font-medium">Price</th>
                    <th className="text-right px-4 py-3 font-medium">Change</th>
                    <th className="text-right px-4 py-3 font-medium">% Change</th>
                    <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Volume</th>
                    <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">Day Range</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((s, i) => (
                    <tr key={s.symbol} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-500">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                            {s.symbol.slice(0, 2)}
                          </div>
                          <span className="font-medium text-sm">{s.name}</span>
                          <span className="text-xs text-slate-500">{s.symbol}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">{formatPrice(s.price)}</td>
                      <td className={`px-4 py-3 text-right text-sm font-medium ${
                        s.change >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}
                      </td>
                      <td className={`px-4 py-3 text-right text-sm font-medium ${
                        s.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-300 hidden md:table-cell">
                        {s.volume > 0 ? formatMarketCap(s.volume) : '\u2014'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-300 hidden lg:table-cell">
                        {formatPrice(s.dayLow)} \u2014 {formatPrice(s.dayHigh)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {stocks.length === 0 && (
              <div className="text-center py-12 text-slate-500">Loading stock data...</div>
            )}
          </div>
        )}

        {/* Forex Table */}
        {activeTab === 'forex' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 text-xs text-slate-400">
                    <th className="text-left px-4 py-3 font-medium">Pair</th>
                    <th className="text-right px-4 py-3 font-medium">Rate</th>
                    <th className="text-right px-4 py-3 font-medium">Inverse</th>
                  </tr>
                </thead>
                <tbody>
                  {forexPairs.map((fp) => (
                    <tr key={fp.currency} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-sm">{fp.pair}</td>
                      <td className="px-4 py-3 text-right text-sm">{fp.rate.toFixed(4)}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-400">{(1 / fp.rate).toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {forexPairs.length === 0 && (
              <div className="text-center py-12 text-slate-500">Loading forex data...</div>
            )}
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Like what you see?</h2>
          <p className="text-sm text-slate-300 mb-4">
            Sign up for free to set custom alerts, track your portfolio, and get faster refresh rates.
          </p>
          <a
            href="/api/auth/google"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Get Started Free &rarr;
          </a>
        </div>
      </main>
    </div>
  );
}
