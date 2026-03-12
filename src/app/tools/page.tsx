import Link from "next/link";

const tools = [
  {
    name: "Currency Converter",
    description: "Convert between 20+ world currencies with real-time exchange rates from the European Central Bank.",
    href: "/tools/currency-converter",
    icon: "\u{1F4B1}",
    color: "bg-green-500/20 text-green-400",
  },
  {
    name: "Crypto Calculator",
    description: "Convert Bitcoin, Ethereum & 50+ cryptocurrencies to any fiat currency with live CoinGecko prices.",
    href: "/tools/crypto-calculator",
    icon: "\u{20BF}",
    color: "bg-amber-500/20 text-amber-400",
  },
  {
    name: "Profit Calculator",
    description: "Calculate investment returns, compound interest, and profit & loss for any asset.",
    href: "/tools/profit-calculator",
    icon: "\u{1F4CA}",
    color: "bg-indigo-500/20 text-indigo-400",
  },
  {
    name: "Stock Screener",
    description: "Filter stocks by price, market cap, sector, and performance. Find your next trade.",
    href: "/tools/stock-screener",
    icon: "\u{1F50D}",
    color: "bg-cyan-500/20 text-cyan-400",
  },
  {
    name: "Forex Calculator",
    description: "Calculate position size, pip value, and margin requirements for forex trades.",
    href: "/tools/forex-calculator",
    icon: "\u{1F4D0}",
    color: "bg-purple-500/20 text-purple-400",
  },
  {
    name: "Crypto Fear & Greed Index",
    description: "Live crypto market sentiment index with a real-time gauge and 30-day history chart.",
    href: "/tools/crypto-fear-greed",
    icon: "\u{1F631}",
    color: "bg-red-500/20 text-red-400",
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">MP</div>
          <span className="text-xl font-bold">MarketPulse</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard?demo=true" className="text-sm text-slate-300 hover:text-white transition-colors">Dashboard</Link>
          <Link href="/blog" className="text-sm text-slate-300 hover:text-white transition-colors">Blog</Link>
          <Link href="/api/auth/google" className="bg-indigo-600 hover:bg-indigo-500 text-sm font-medium px-4 py-2 rounded-lg transition-colors">Sign In</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-3 py-1 text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
            100% Free
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Financial Tools
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Powerful calculators, converters, and screeners to help you make smarter financial decisions. No sign-up required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-500/5 group"
            >
              <div className={`w-12 h-12 rounded-lg ${tool.color} flex items-center justify-center mb-4 text-xl`}>
                {tool.icon}
              </div>
              <h2 className="text-lg font-semibold mb-2 group-hover:text-indigo-400 transition-colors">
                {tool.name}
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                {tool.description}
              </p>
              <span className="inline-flex items-center gap-1 mt-4 text-sm text-indigo-400 group-hover:text-indigo-300 transition-colors">
                Use tool
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-3">Want more?</h2>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto">
            Sign up for MarketPulse to unlock real-time alerts, portfolio tracking, AI-powered insights, and more.
          </p>
          <Link
            href="/api/auth/google"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 font-medium px-6 py-3 rounded-lg transition-colors text-sm"
          >
            Get Started Free
          </Link>
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
