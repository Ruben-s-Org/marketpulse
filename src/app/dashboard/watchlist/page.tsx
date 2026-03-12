'use client';

import { useEffect, useState, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  plan: 'free' | 'pro' | 'premium';
}

interface WatchlistItem {
  id: string;
  symbol: string;
  asset_type: 'stock' | 'crypto' | 'forex';
  created_at: string;
}

interface PriceInfo {
  price: number;
  change24h: number;
}

function formatPrice(price: number): string {
  if (price >= 1) return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  return '$' + price.toFixed(6);
}

export default function WatchlistPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [prices, setPrices] = useState<Record<string, PriceInfo>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({ symbol: '', asset_type: 'crypto' });

  const fetchWatchlist = useCallback(async () => {
    try {
      const res = await fetch('/api/watchlist');
      if (res.ok) {
        const data = (await res.json()) as { watchlist: WatchlistItem[] };
        setWatchlist(data.watchlist);
      }
    } catch { /* silent */ }
  }, []);

  const fetchPrices = useCallback(async (items: WatchlistItem[]) => {
    const newPrices: Record<string, PriceInfo> = {};

    const cryptoItems = items.filter(i => i.asset_type === 'crypto');
    const stockItems = items.filter(i => i.asset_type === 'stock');
    const forexItems = items.filter(i => i.asset_type === 'forex');

    if (cryptoItems.length > 0) {
      try {
        const res = await fetch('/api/market/crypto');
        if (res.ok) {
          const cryptos = (await res.json()) as Array<{
            symbol: string;
            current_price: number;
            price_change_percentage_24h: number;
          }>;
          for (const c of cryptos) {
            const sym = c.symbol.toUpperCase();
            if (cryptoItems.some(i => i.symbol === sym)) {
              newPrices[sym] = { price: c.current_price, change24h: c.price_change_percentage_24h };
            }
          }
        }
      } catch { /* silent */ }
    }

    if (stockItems.length > 0) {
      try {
        const res = await fetch(`/api/market/stocks?search=${stockItems.map(i => i.symbol).join(',')}`);
        if (res.ok) {
          const stocks = (await res.json()) as Array<{ symbol: string; price: number; changePercent: number }>;
          for (const s of stocks) {
            newPrices[s.symbol.toUpperCase()] = { price: s.price, change24h: s.changePercent };
          }
        }
      } catch { /* silent */ }
    }

    if (forexItems.length > 0) {
      try {
        const res = await fetch('/api/market/forex');
        if (res.ok) {
          const forex = (await res.json()) as { rates: Record<string, number> };
          for (const item of forexItems) {
            const rate = forex.rates[item.symbol];
            if (rate) newPrices[item.symbol] = { price: rate, change24h: 0 };
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

  useEffect(() => { fetchWatchlist(); }, [fetchWatchlist]);

  useEffect(() => {
    if (watchlist.length > 0) {
      fetchPrices(watchlist);
      const interval = setInterval(() => fetchPrices(watchlist), 60000);
      return () => clearInterval(interval);
    }
  }, [watchlist, fetchPrices]);

  async function addToWatchlist() {
    setAdding(true);
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        setNewItem({ symbol: '', asset_type: 'crypto' });
        setShowAdd(false);
        await fetchWatchlist();
      }
    } catch { /* silent */ }
    setAdding(false);
  }

  async function removeFromWatchlist(id: string) {
    await fetch(`/api/watchlist/${id}`, { method: 'DELETE' });
    await fetchWatchlist();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

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
          <a href="/dashboard/portfolio" className="text-sm text-slate-300 hover:text-white transition-colors">Portfolio</a>
          <a href="/dashboard/watchlist" className="text-sm text-white font-medium">Watchlist</a>
          <a href="/dashboard/alerts" className="text-sm text-slate-300 hover:text-white transition-colors">Alerts</a>
          <a href="/api/auth/logout" className="text-sm text-slate-400 hover:text-white transition-colors">Sign Out</a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Watchlist</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Symbol
          </button>
        </div>

        {/* Add Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Add to Watchlist</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Symbol</label>
                  <input
                    type="text"
                    value={newItem.symbol}
                    onChange={e => setNewItem({ ...newItem, symbol: e.target.value.toUpperCase() })}
                    placeholder="BTC, AAPL, EUR..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Asset Type</label>
                  <select
                    value={newItem.asset_type}
                    onChange={e => setNewItem({ ...newItem, asset_type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="crypto">Crypto</option>
                    <option value="stock">Stock</option>
                    <option value="forex">Forex</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAdd(false)}
                  className="flex-1 border border-slate-600 hover:border-slate-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addToWatchlist}
                  disabled={adding || !newItem.symbol}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {adding ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Watchlist Table */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          {watchlist.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <div className="text-4xl mb-4">&#128065;</div>
              <p>Your watchlist is empty. Add symbols to track their prices.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 text-xs text-slate-400">
                    <th className="text-left px-4 py-3 font-medium">Symbol</th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-right px-4 py-3 font-medium">Price</th>
                    <th className="text-right px-4 py-3 font-medium">24h Change</th>
                    <th className="text-right px-4 py-3 font-medium">Added</th>
                    <th className="text-right px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist.map(item => {
                    const priceInfo = prices[item.symbol];
                    return (
                      <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              item.asset_type === 'crypto' ? 'bg-amber-500/20 text-amber-400' :
                              item.asset_type === 'stock' ? 'bg-indigo-500/20 text-indigo-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {item.symbol.slice(0, 2)}
                            </div>
                            <span className="font-medium text-sm">{item.symbol}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-400 capitalize">{item.asset_type}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium">
                          {priceInfo ? formatPrice(priceInfo.price) : '—'}
                        </td>
                        <td className={`px-4 py-3 text-right text-sm font-medium ${
                          priceInfo && priceInfo.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {priceInfo && priceInfo.change24h !== 0
                            ? `${priceInfo.change24h >= 0 ? '+' : ''}${priceInfo.change24h.toFixed(2)}%`
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-slate-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => removeFromWatchlist(item.id)}
                            className="text-slate-500 hover:text-red-400 text-xs transition-colors"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
