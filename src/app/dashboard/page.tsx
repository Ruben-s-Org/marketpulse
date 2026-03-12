'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  plan: 'free' | 'pro' | 'premium';
  created_at: string;
}

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

interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
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
          <linearGradient id={positive ? 'sparkGreen' : 'sparkRed'} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={positive ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
            <stop offset="100%" stopColor={positive ? '#22c55e' : '#ef4444'} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="p"
          stroke={positive ? '#22c55e' : '#ef4444'}
          fill={`url(#${positive ? 'sparkGreen' : 'sparkRed'})`}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cryptos, setCryptos] = useState<CryptoAsset[]>([]);
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [forex, setForex] = useState<ForexData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('crypto');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockSearchResults, setStockSearchResults] = useState<StockSearchResult[]>([]);
  const [stockSearching, setStockSearching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null);

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
  }, []);

  const searchStocks = useCallback(async (query: string) => {
    if (query.length < 1) {
      setStockSearchResults([]);
      return;
    }
    setStockSearching(true);
    try {
      const res = await fetch(`/api/market/stocks/search?q=${encodeURIComponent(query)}`);
      if (res.ok) setStockSearchResults((await res.json()) as StockSearchResult[]);
    } catch { /* silent */ }
    setStockSearching(false);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') setCheckoutStatus('success');
    if (params.get('checkout') === 'cancelled') setCheckoutStatus('cancelled');

    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => setUser(data as User))
      .catch(() => (window.location.href = '/'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMarketData();
    const refreshRate = user?.plan === 'free' ? 60000 : 30000;
    const interval = setInterval(fetchMarketData, refreshRate);
    return () => clearInterval(interval);
  }, [fetchMarketData, user?.plan]);

  async function handleUpgrade(plan: 'pro' | 'premium') {
    setUpgrading(plan);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
    } catch {
      alert('Failed to start checkout');
    } finally {
      setUpgrading(null);
    }
  }

  async function handleManageBilling() {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
    } catch {
      alert('Failed to open billing portal');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const planColors = {
    free: 'bg-slate-600',
    pro: 'bg-indigo-600',
    premium: 'bg-amber-600',
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">
            MP
          </div>
          <span className="text-xl font-bold">MarketPulse</span>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-slate-500">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${planColors[user.plan]} capitalize`}>
            {user.plan}
          </span>
          <div className="flex items-center gap-2">
            {user.avatar_url && (
              <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
            )}
            <span className="text-sm text-slate-300 hidden sm:inline">{user.name}</span>
          </div>
          <a
            href="/dashboard/alerts"
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            Alerts
          </a>
          <a
            href="/api/auth/logout"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Sign Out
          </a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Checkout status banner */}
        {checkoutStatus === 'success' && (
          <div className="mb-6 bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-green-300 text-sm">
            Payment successful! Your plan has been upgraded.
          </div>
        )}
        {checkoutStatus === 'cancelled' && (
          <div className="mb-6 bg-amber-500/20 border border-amber-500/30 rounded-lg p-4 text-amber-300 text-sm">
            Checkout was cancelled. You can upgrade anytime.
          </div>
        )}

        {/* Market Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
            />
          )}
          {activeTab === 'stocks' && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search stocks (e.g. AAPL, Tesla)..."
                value={stockSearchQuery}
                onChange={(e) => {
                  setStockSearchQuery(e.target.value);
                  searchStocks(e.target.value);
                }}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-72"
              />
              {stockSearchResults.length > 0 && stockSearchQuery && (
                <div className="absolute top-full mt-1 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto">
                  {stockSearchResults.map((r) => (
                    <button
                      key={r.symbol}
                      onClick={async () => {
                        setStockSearchQuery('');
                        setStockSearchResults([]);
                        const res = await fetch(`/api/market/stocks?search=${encodeURIComponent(r.symbol)}`);
                        if (res.ok) {
                          const newQuotes = (await res.json()) as StockQuote[];
                          setStocks((prev) => {
                            const existing = new Set(prev.map((s) => s.symbol));
                            return [...prev, ...newQuotes.filter((q) => !existing.has(q.symbol))];
                          });
                        }
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-700/50 transition-colors border-b border-slate-700/30 last:border-b-0"
                    >
                      <span className="text-sm font-medium text-white">{r.symbol}</span>
                      <span className="text-xs text-slate-400 ml-2">{r.name}</span>
                      <span className="text-xs text-slate-500 ml-1">({r.exchange})</span>
                    </button>
                  ))}
                </div>
              )}
              {stockSearching && (
                <div className="absolute right-3 top-2.5">
                  <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
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
                        {s.volume > 0 ? formatMarketCap(s.volume) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-300 hidden lg:table-cell">
                        {formatPrice(s.dayLow)} — {formatPrice(s.dayHigh)}
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

        {/* Subscription Management */}
        {user.plan === 'free' && (
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-2">Upgrade Your Plan</h2>
            <p className="text-sm text-slate-300 mb-4">
              Get faster refresh rates (30s vs 60s), unlimited alerts, and more.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleUpgrade('pro')}
                disabled={!!upgrading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {upgrading === 'pro' ? 'Redirecting...' : 'Pro - $9.99/mo'}
              </button>
              <button
                onClick={() => handleUpgrade('premium')}
                disabled={!!upgrading}
                className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {upgrading === 'premium' ? 'Redirecting...' : 'Premium - $49.99/mo'}
              </button>
            </div>
          </div>
        )}

        {user.plan !== 'free' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-2">Billing</h2>
            <p className="text-sm text-slate-400 mb-4">
              You&apos;re on the <span className="text-white font-medium capitalize">{user.plan}</span> plan.
              Refresh rate: 30 seconds.
            </p>
            <button
              onClick={handleManageBilling}
              className="border border-slate-600 hover:border-slate-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Manage Billing
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
