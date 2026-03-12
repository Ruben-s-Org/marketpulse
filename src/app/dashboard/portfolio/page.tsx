'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  plan: 'free' | 'pro' | 'premium';
}

interface Holding {
  id: string;
  portfolio_id: string;
  symbol: string;
  asset_type: 'stock' | 'crypto' | 'forex';
  quantity: number;
  avg_buy_price: number;
  created_at: string;
}

interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  holdings: Holding[];
  created_at: string;
}

interface PriceMap {
  [symbol: string]: { price: number; change24h: number; sparkline?: number[] };
}

const COLORS = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#c084fc',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  '#f59e0b', '#ef4444', '#ec4899', '#f97316',
];

function formatPrice(price: number): string {
  if (price >= 1) return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  return '$' + price.toFixed(6);
}

function formatValue(val: number): string {
  if (val >= 1e6) return '$' + (val / 1e6).toFixed(2) + 'M';
  if (val >= 1e3) return '$' + (val / 1e3).toFixed(2) + 'K';
  return formatPrice(val);
}

export default function PortfolioPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [prices, setPrices] = useState<PriceMap>({});
  const [showAddHolding, setShowAddHolding] = useState(false);
  const [addingHolding, setAddingHolding] = useState(false);
  const [newHolding, setNewHolding] = useState({ symbol: '', asset_type: 'crypto', quantity: '', avg_buy_price: '' });
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

  const fetchPortfolios = useCallback(async () => {
    try {
      const res = await fetch('/api/portfolio');
      if (res.ok) {
        const data = (await res.json()) as { portfolios: Portfolio[] };
        setPortfolios(data.portfolios);
      }
    } catch { /* silent */ }
  }, []);

  const fetchPrices = useCallback(async (holdings: Holding[]) => {
    const cryptoSymbols = holdings.filter(h => h.asset_type === 'crypto').map(h => h.symbol.toLowerCase());
    const stockSymbols = holdings.filter(h => h.asset_type === 'stock').map(h => h.symbol);

    const newPrices: PriceMap = {};

    // Fetch crypto prices
    if (cryptoSymbols.length > 0) {
      try {
        const res = await fetch('/api/market/crypto');
        if (res.ok) {
          const cryptos = (await res.json()) as Array<{
            symbol: string;
            current_price: number;
            price_change_percentage_24h: number;
            sparkline_in_7d?: { price: number[] };
          }>;
          for (const c of cryptos) {
            if (cryptoSymbols.includes(c.symbol.toLowerCase())) {
              newPrices[c.symbol.toUpperCase()] = {
                price: c.current_price,
                change24h: c.price_change_percentage_24h,
                sparkline: c.sparkline_in_7d?.price,
              };
            }
          }
        }
      } catch { /* silent */ }
    }

    // Fetch stock prices
    if (stockSymbols.length > 0) {
      try {
        const res = await fetch(`/api/market/stocks?search=${stockSymbols.join(',')}`);
        if (res.ok) {
          const stocks = (await res.json()) as Array<{
            symbol: string;
            price: number;
            changePercent: number;
          }>;
          for (const s of stocks) {
            newPrices[s.symbol.toUpperCase()] = {
              price: s.price,
              change24h: s.changePercent,
            };
          }
        }
      } catch { /* silent */ }
    }

    // Fetch forex prices
    const forexSymbols = holdings.filter(h => h.asset_type === 'forex').map(h => h.symbol);
    if (forexSymbols.length > 0) {
      try {
        const res = await fetch('/api/market/forex');
        if (res.ok) {
          const forex = (await res.json()) as { rates: Record<string, number> };
          for (const symbol of forexSymbols) {
            const rate = forex.rates[symbol];
            if (rate) {
              newPrices[symbol.toUpperCase()] = { price: rate, change24h: 0 };
            }
          }
        }
      } catch { /* silent */ }
    }

    setPrices(newPrices);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => setUser(data as User))
      .catch(() => (window.location.href = '/'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  useEffect(() => {
    const allHoldings = portfolios.flatMap(p => p.holdings);
    if (allHoldings.length > 0) {
      fetchPrices(allHoldings);
      const interval = setInterval(() => fetchPrices(allHoldings), 60000);
      return () => clearInterval(interval);
    }
  }, [portfolios, fetchPrices]);

  async function createDefaultPortfolio() {
    const res = await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'My Portfolio' }),
    });
    if (res.ok) await fetchPortfolios();
  }

  async function addHolding() {
    if (!portfolios[0]) return;
    setAddingHolding(true);
    try {
      const res = await fetch('/api/portfolio/holdings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio_id: portfolios[0].id,
          symbol: newHolding.symbol,
          asset_type: newHolding.asset_type,
          quantity: parseFloat(newHolding.quantity),
          avg_buy_price: parseFloat(newHolding.avg_buy_price),
        }),
      });
      if (res.ok) {
        setNewHolding({ symbol: '', asset_type: 'crypto', quantity: '', avg_buy_price: '' });
        setShowAddHolding(false);
        await fetchPortfolios();
      }
    } catch { /* silent */ }
    setAddingHolding(false);
  }

  async function removeHolding(id: string) {
    await fetch(`/api/portfolio/holdings/${id}`, { method: 'DELETE' });
    await fetchPortfolios();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const allHoldings = portfolios.flatMap(p => p.holdings);
  const holdingsWithValue = allHoldings.map(h => {
    const priceData = prices[h.symbol.toUpperCase()];
    const currentPrice = priceData?.price || 0;
    const currentValue = h.quantity * currentPrice;
    const costBasis = h.quantity * h.avg_buy_price;
    const pnl = currentValue - costBasis;
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    return { ...h, currentPrice, currentValue, costBasis, pnl, pnlPercent, change24h: priceData?.change24h || 0, sparkline: priceData?.sparkline };
  });

  const totalValue = holdingsWithValue.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCost = holdingsWithValue.reduce((sum, h) => sum + h.costBasis, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  const allocationData = holdingsWithValue
    .filter(h => h.currentValue > 0)
    .map(h => ({ name: h.symbol, value: h.currentValue }))
    .sort((a, b) => b.value - a.value);

  const selectedHolding = selectedChart ? holdingsWithValue.find(h => h.id === selectedChart) : null;
  const sparklineData = selectedHolding?.sparkline
    ? selectedHolding.sparkline.filter((_, i) => i % 6 === 0).map((price, i) => ({ i, price }))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-slate-800">
        <div className="flex items-center gap-2">
          <a href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">MP</div>
            <span className="text-xl font-bold">MarketPulse</span>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="text-sm text-slate-300 hover:text-white transition-colors">Dashboard</a>
          <a href="/dashboard/portfolio" className="text-sm text-white font-medium">Portfolio</a>
          <a href="/dashboard/watchlist" className="text-sm text-slate-300 hover:text-white transition-colors">Watchlist</a>
          <a href="/dashboard/alerts" className="text-sm text-slate-300 hover:text-white transition-colors">Alerts</a>
          <a href="/api/auth/logout" className="text-sm text-slate-400 hover:text-white transition-colors">Sign Out</a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Portfolio</h1>
          {portfolios.length > 0 && (
            <button
              onClick={() => setShowAddHolding(true)}
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Add Holding
            </button>
          )}
        </div>

        {/* Create portfolio if none */}
        {portfolios.length === 0 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
            <div className="text-4xl mb-4">&#128200;</div>
            <h2 className="text-xl font-semibold mb-2">No Portfolio Yet</h2>
            <p className="text-slate-400 mb-6">Create your first portfolio to start tracking your investments.</p>
            <button
              onClick={createDefaultPortfolio}
              className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              Create Portfolio
            </button>
          </div>
        )}

        {portfolios.length > 0 && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <p className="text-xs text-slate-400 mb-1">Total Value</p>
                <p className="text-2xl font-bold">{formatValue(totalValue)}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <p className="text-xs text-slate-400 mb-1">Total Cost</p>
                <p className="text-2xl font-bold text-slate-300">{formatValue(totalCost)}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <p className="text-xs text-slate-400 mb-1">Total P&L</p>
                <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalPnl >= 0 ? '+' : ''}{formatValue(totalPnl)}
                </p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <p className="text-xs text-slate-400 mb-1">Return</p>
                <p className={`text-2xl font-bold ${totalPnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Allocation + Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Allocation Pie */}
              {allocationData.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <h2 className="text-sm font-semibold text-slate-300 mb-4">Allocation</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {allocationData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        formatter={(value) => [formatValue(Number(value)), 'Value']}
                        labelStyle={{ color: '#94a3b8' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {allocationData.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-xs text-slate-400">
                          {item.name} ({((item.value / totalValue) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Historical Chart */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-slate-300 mb-4">7-Day Price Chart</h2>
                {!selectedChart && (
                  <div className="flex items-center justify-center h-[250px] text-slate-500 text-sm">
                    Select a holding below to view its chart
                  </div>
                )}
                {sparklineData && sparklineData.length > 0 && (
                  <>
                    <p className="text-xs text-slate-400 mb-2">{selectedHolding?.symbol}</p>
                    <ResponsiveContainer width="100%" height={230}>
                      <AreaChart data={sparklineData}>
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="i" hide />
                        <YAxis
                          domain={['auto', 'auto']}
                          tickFormatter={(v: number) => formatPrice(v)}
                          width={80}
                          tick={{ fill: '#64748b', fontSize: 11 }}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                          formatter={(value) => [formatPrice(Number(value)), 'Price']}
                          labelFormatter={() => ''}
                        />
                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke="#6366f1"
                          fill="url(#chartGrad)"
                          strokeWidth={2}
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </>
                )}
                {selectedChart && !sparklineData && (
                  <div className="flex items-center justify-center h-[250px] text-slate-500 text-sm">
                    No chart data available for this asset
                  </div>
                )}
              </div>
            </div>

            {/* Add Holding Modal */}
            {showAddHolding && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md">
                  <h2 className="text-lg font-semibold mb-4">Add Holding</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Symbol</label>
                      <input
                        type="text"
                        value={newHolding.symbol}
                        onChange={e => setNewHolding({ ...newHolding, symbol: e.target.value.toUpperCase() })}
                        placeholder="BTC, AAPL, EUR..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Asset Type</label>
                      <select
                        value={newHolding.asset_type}
                        onChange={e => setNewHolding({ ...newHolding, asset_type: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="crypto">Crypto</option>
                        <option value="stock">Stock</option>
                        <option value="forex">Forex</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Quantity</label>
                      <input
                        type="number"
                        step="any"
                        value={newHolding.quantity}
                        onChange={e => setNewHolding({ ...newHolding, quantity: e.target.value })}
                        placeholder="0.5"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Average Buy Price ($)</label>
                      <input
                        type="number"
                        step="any"
                        value={newHolding.avg_buy_price}
                        onChange={e => setNewHolding({ ...newHolding, avg_buy_price: e.target.value })}
                        placeholder="50000"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowAddHolding(false)}
                      className="flex-1 border border-slate-600 hover:border-slate-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addHolding}
                      disabled={addingHolding || !newHolding.symbol || !newHolding.quantity || !newHolding.avg_buy_price}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {addingHolding ? 'Adding...' : 'Add Holding'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Holdings Table */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50">
                <h2 className="text-sm font-semibold text-slate-300">Holdings ({allHoldings.length})</h2>
              </div>
              {holdingsWithValue.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No holdings yet. Add your first holding to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50 text-xs text-slate-400">
                        <th className="text-left px-4 py-3 font-medium">Asset</th>
                        <th className="text-right px-4 py-3 font-medium">Quantity</th>
                        <th className="text-right px-4 py-3 font-medium">Avg Price</th>
                        <th className="text-right px-4 py-3 font-medium">Current Price</th>
                        <th className="text-right px-4 py-3 font-medium">Value</th>
                        <th className="text-right px-4 py-3 font-medium">P&L</th>
                        <th className="text-right px-4 py-3 font-medium">24h</th>
                        <th className="text-right px-4 py-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdingsWithValue.map(h => (
                        <tr
                          key={h.id}
                          className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer ${selectedChart === h.id ? 'bg-slate-800/40' : ''}`}
                          onClick={() => setSelectedChart(selectedChart === h.id ? null : h.id)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                h.asset_type === 'crypto' ? 'bg-amber-500/20 text-amber-400' :
                                h.asset_type === 'stock' ? 'bg-indigo-500/20 text-indigo-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {h.symbol.slice(0, 2)}
                              </div>
                              <span className="font-medium text-sm">{h.symbol}</span>
                              <span className="text-xs text-slate-500 capitalize">{h.asset_type}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm">{h.quantity}</td>
                          <td className="px-4 py-3 text-right text-sm text-slate-400">{formatPrice(h.avg_buy_price)}</td>
                          <td className="px-4 py-3 text-right text-sm">{h.currentPrice > 0 ? formatPrice(h.currentPrice) : '—'}</td>
                          <td className="px-4 py-3 text-right text-sm font-medium">{h.currentValue > 0 ? formatValue(h.currentValue) : '—'}</td>
                          <td className={`px-4 py-3 text-right text-sm font-medium ${h.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {h.currentPrice > 0 ? (
                              <>
                                {h.pnl >= 0 ? '+' : ''}{formatValue(h.pnl)}
                                <span className="text-xs ml-1">({h.pnlPercent >= 0 ? '+' : ''}{h.pnlPercent.toFixed(1)}%)</span>
                              </>
                            ) : '—'}
                          </td>
                          <td className={`px-4 py-3 text-right text-xs font-medium ${h.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {h.change24h !== 0 ? `${h.change24h >= 0 ? '+' : ''}${h.change24h.toFixed(2)}%` : '—'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={(e) => { e.stopPropagation(); removeHolding(h.id); }}
                              className="text-slate-500 hover:text-red-400 text-xs transition-colors"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
