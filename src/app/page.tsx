export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">
            MP
          </div>
          <span className="text-xl font-bold">MarketPulse</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-sm text-slate-300 hover:text-white transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-sm text-slate-300 hover:text-white transition-colors">
            Pricing
          </a>
          <a
            href="/api/auth/google"
            className="bg-indigo-600 hover:bg-indigo-500 text-sm font-medium px-4 py-2 rounded-lg transition-colors inline-block"
          >
            Sign In with Google
          </a>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-block mb-4 px-3 py-1 text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
            Real-Time Market Data
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
            Your Financial Intelligence{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Command Center
            </span>
          </h1>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Track stocks, crypto, and forex in real-time. Get AI-powered insights,
            set custom alerts, and manage your portfolio — all in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/api/auth/google"
              className="bg-indigo-600 hover:bg-indigo-500 font-medium px-6 py-3 rounded-lg transition-colors text-base inline-block"
            >
              Get Started Free
            </a>
            <button className="border border-slate-600 hover:border-slate-500 font-medium px-6 py-3 rounded-lg transition-colors text-base text-slate-300">
              View Demo
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <section id="features" className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-4 text-green-400 text-lg">
              $
            </div>
            <h3 className="text-lg font-semibold mb-2">Real-Time Quotes</h3>
            <p className="text-sm text-slate-400">
              Live stock, crypto, and forex prices from multiple data sources.
              Never miss a market move.
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-4 text-amber-400 text-lg">
              !
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Alerts</h3>
            <p className="text-sm text-slate-400">
              Set price thresholds and get notified instantly. Never miss your
              target entry or exit.
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400 text-lg">
              AI
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
            <p className="text-sm text-slate-400">
              Market sentiment analysis and trend predictions powered by AI.
              Make informed decisions.
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mt-32">
          <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-center text-slate-400 mb-12 max-w-lg mx-auto">
            Start free, upgrade when you need more.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-1">Free</h3>
              <p className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal text-slate-400">/mo</span></p>
              <ul className="space-y-2 text-sm text-slate-400 mb-6">
                <li>Basic stock & crypto quotes</li>
                <li>3 price alerts</li>
                <li>1 portfolio</li>
              </ul>
              <a
                href="/api/auth/google"
                className="block w-full text-center border border-slate-600 hover:border-slate-500 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Get Started
              </a>
            </div>
            <div className="bg-indigo-950/50 border-2 border-indigo-500/50 rounded-xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-xs font-medium px-3 py-1 rounded-full">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold mb-1">Pro</h3>
              <p className="text-3xl font-bold mb-4">$9.99<span className="text-sm font-normal text-slate-400">/mo</span></p>
              <ul className="space-y-2 text-sm text-slate-300 mb-6">
                <li>Real-time data</li>
                <li>Unlimited alerts</li>
                <li>Unlimited portfolios</li>
                <li>Email notifications</li>
              </ul>
              <a
                href="/api/auth/google"
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-500 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Upgrade to Pro
              </a>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-1">Premium</h3>
              <p className="text-3xl font-bold mb-4">$49.99<span className="text-sm font-normal text-slate-400">/mo</span></p>
              <ul className="space-y-2 text-sm text-slate-400 mb-6">
                <li>Everything in Pro</li>
                <li>AI market insights</li>
                <li>Advanced screeners</li>
                <li>Priority support</li>
              </ul>
              <a
                href="/api/auth/google"
                className="block w-full text-center border border-slate-600 hover:border-slate-500 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Go Premium
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-slate-500">
          <span>MarketPulse 2026. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
