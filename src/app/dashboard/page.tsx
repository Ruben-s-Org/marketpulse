'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  plan: 'free' | 'pro' | 'premium';
  created_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null);

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
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${planColors[user.plan]} capitalize`}>
            {user.plan}
          </span>
          <div className="flex items-center gap-2">
            {user.avatar_url && (
              <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
            )}
            <span className="text-sm text-slate-300">{user.name}</span>
          </div>
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

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Welcome back, {user.name?.split(' ')[0]}</h1>
          <p className="text-slate-400 text-sm">
            Your financial intelligence dashboard
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-1">Account Plan</p>
            <p className="text-xl font-bold capitalize">{user.plan}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-1">Alerts Active</p>
            <p className="text-xl font-bold">0 / {user.plan === 'free' ? '2' : user.plan === 'pro' ? '50' : 'Unlimited'}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-1">Portfolios</p>
            <p className="text-xl font-bold">0</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-1">Watchlist</p>
            <p className="text-xl font-bold">0 assets</p>
          </div>
        </div>

        {/* Market Overview Placeholder */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Market Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">BTC / USD</p>
              <p className="text-lg font-bold text-green-400">Coming soon</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">S&P 500</p>
              <p className="text-lg font-bold text-green-400">Coming soon</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">EUR / USD</p>
              <p className="text-lg font-bold text-green-400">Coming soon</p>
            </div>
          </div>
        </div>

        {/* Subscription Management */}
        {user.plan === 'free' && (
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-2">Upgrade Your Plan</h2>
            <p className="text-sm text-slate-300 mb-4">
              Unlock real-time data, unlimited alerts, and more.
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
