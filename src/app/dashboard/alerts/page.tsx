'use client';

import { useEffect, useState } from 'react';

interface Alert {
  id: string;
  symbol: string;
  asset_type: string;
  condition: string;
  target_value: number;
  is_active: number;
  triggered_at: string | null;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  avatar_url: string;
  plan: 'free' | 'pro' | 'premium';
}

export default function AlertsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [limit, setLimit] = useState(2);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    symbol: '',
    asset_type: 'crypto',
    condition: 'above',
    target_value: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    try {
      const [userRes, alertsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/alerts'),
      ]);
      if (!userRes.ok) { window.location.href = '/'; return; }
      setUser((await userRes.json()) as User);
      if (alertsRes.ok) {
        const data = (await alertsRes.json()) as { alerts: Alert[]; limit: number };
        setAlerts(data.alerts);
        setLimit(data.limit);
      }
    } catch { /* silent */ }
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          target_value: parseFloat(form.target_value),
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error: string };
        setError(data.error);
        return;
      }
      setShowForm(false);
      setForm({ symbol: '', asset_type: 'crypto', condition: 'above', target_value: '' });
      await fetchData();
    } catch {
      setError('Failed to create alert');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
    await fetchData();
  }

  async function handleToggle(id: string, currentActive: number) {
    await fetch(`/api/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: currentActive ? 0 : 1 }),
    });
    await fetchData();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const planColors = { free: 'bg-slate-600', pro: 'bg-indigo-600', premium: 'bg-amber-600' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-slate-800">
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">
              MP
            </div>
            <span className="text-xl font-bold">MarketPulse</span>
          </a>
          <span className="text-slate-600">|</span>
          <span className="text-sm text-slate-400">Alerts</span>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${planColors[user.plan]} capitalize`}>
            {user.plan}
          </span>
          <a href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
            Dashboard
          </a>
          <a href="/api/auth/logout" className="text-sm text-slate-400 hover:text-white transition-colors">
            Sign Out
          </a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Price Alerts</h1>
            <p className="text-sm text-slate-400 mt-1">
              {alerts.length} / {limit >= 999999 ? 'Unlimited' : limit} alerts used
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {showForm ? 'Cancel' : '+ New Alert'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Create Alert Form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Create Alert</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Symbol</label>
                <input
                  type="text"
                  value={form.symbol}
                  onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                  placeholder="BTC, ETH, AAPL..."
                  required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Asset Type</label>
                <select
                  value={form.asset_type}
                  onChange={(e) => setForm({ ...form, asset_type: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="crypto">Crypto</option>
                  <option value="stock">Stock</option>
                  <option value="forex">Forex</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Condition</label>
                <select
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="above">Price Above</option>
                  <option value="below">Price Below</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Price ($)</label>
                <input
                  type="number"
                  step="any"
                  value={form.target_value}
                  onChange={(e) => setForm({ ...form, target_value: e.target.value })}
                  placeholder="100000"
                  required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {submitting ? 'Creating...' : 'Create Alert'}
            </button>
          </form>
        )}

        {/* Alerts List */}
        <div className="space-y-3">
          {alerts.length === 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
              <p className="text-slate-400 mb-2">No alerts yet</p>
              <p className="text-sm text-slate-500">Create your first price alert to get notified when assets hit your targets.</p>
            </div>
          )}
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-slate-800/50 border rounded-xl p-4 flex items-center justify-between ${
                alert.is_active ? 'border-slate-700/50' : 'border-slate-800/50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${
                  alert.triggered_at ? 'bg-amber-400' : alert.is_active ? 'bg-green-400' : 'bg-slate-600'
                }`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{alert.symbol}</span>
                    <span className="text-xs text-slate-500 capitalize bg-slate-800 px-2 py-0.5 rounded">
                      {alert.asset_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {alert.condition === 'above' ? 'Price above' : 'Price below'}{' '}
                    <span className="text-white font-medium">${alert.target_value.toLocaleString()}</span>
                    {alert.triggered_at && (
                      <span className="text-amber-400 ml-2">
                        Triggered {new Date(alert.triggered_at).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(alert.id, alert.is_active)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded transition-colors"
                >
                  {alert.is_active ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => handleDelete(alert.id)}
                  className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Plan upsell */}
        {user.plan === 'free' && alerts.length >= 2 && (
          <div className="mt-6 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-xl p-5 text-center">
            <p className="text-sm text-slate-300 mb-3">
              You&apos;ve reached the free tier limit of 2 alerts. Upgrade for more.
            </p>
            <a
              href="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-block"
            >
              Upgrade Plan
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
