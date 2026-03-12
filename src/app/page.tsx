"use client";

import { useState } from "react";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Is MarketPulse really free?",
      a: "Yes. The free tier gives you basic stock and crypto quotes, 3 price alerts, and 1 portfolio — no credit card required. Upgrade only when you need real-time data, unlimited alerts, or AI insights.",
    },
    {
      q: "Where does the market data come from?",
      a: "We aggregate data from trusted financial APIs including CoinGecko, Alpha Vantage, Finnhub, and Frankfurter. This gives you broad coverage across stocks, crypto, forex, and commodities.",
    },
    {
      q: "How real-time is the data?",
      a: "Free-tier quotes have a short delay (typically 15 minutes for stocks, near-real-time for crypto). Pro and Premium subscribers get true real-time streaming data with sub-second updates.",
    },
    {
      q: "Can I set price alerts?",
      a: "Absolutely. Free users get 3 alerts, Pro users get unlimited alerts with email notifications, and Premium users also get SMS and push notifications.",
    },
    {
      q: "How is MarketPulse different from TradingView?",
      a: "MarketPulse combines stocks, crypto, and forex in a single clean dashboard without the complexity. We offer AI-powered insights out of the box, a generous free tier with no ads, and a focus on actionable intelligence over charting.",
    },
    {
      q: "Is my data secure?",
      a: "Yes. All connections are encrypted with SSL/TLS. We never sell your data to third parties, and your portfolio information is stored encrypted at rest. We follow industry-standard security practices.",
    },
  ];

  const comparisonFeatures = [
    { name: "Stocks + Crypto + Forex", mp: true, tv: true, fv: false, yf: true, cg: false },
    { name: "Free tier", mp: true, tv: true, fv: true, yf: true, cg: true },
    { name: "Price alerts", mp: true, tv: true, fv: false, yf: true, cg: true },
    { name: "AI insights", mp: true, tv: false, fv: false, yf: false, cg: false },
    { name: "No ads", mp: true, tv: false, fv: false, yf: false, cg: false },
    { name: "Portfolio tracking", mp: true, tv: true, fv: false, yf: true, cg: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Nav */}
      <nav className="flex flex-wrap items-center justify-between px-6 py-4 max-w-7xl mx-auto gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">
            MP
          </div>
          <span className="text-xl font-bold">MarketPulse</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <a href="#features" className="text-sm text-slate-300 hover:text-white transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-sm text-slate-300 hover:text-white transition-colors">
            Pricing
          </a>
          <a href="/tools/currency-converter" className="text-sm text-slate-300 hover:text-white transition-colors">
            Tools
          </a>
          <a href="/blog" className="text-sm text-slate-300 hover:text-white transition-colors">
            Blog
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
      <main className="max-w-7xl mx-auto px-6 pt-16 sm:pt-20 pb-24 sm:pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-block mb-4 px-3 py-1 text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
            Real-Time Market Data
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Your Financial Intelligence{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Command Center
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Track stocks, crypto, and forex in real-time. Get AI-powered insights,
            set custom alerts, and manage your portfolio — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/api/auth/google"
              className="bg-indigo-600 hover:bg-indigo-500 font-medium px-6 py-3 rounded-lg transition-colors text-base inline-block"
            >
              Get Started Free
            </a>
            <a
              href="/dashboard?demo=true"
              className="border border-slate-600 hover:border-slate-500 font-medium px-6 py-3 rounded-lg transition-colors text-base text-slate-300 inline-block"
            >
              View Demo
            </a>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
            <span className="font-medium text-slate-400">Powered by</span>
            {["CoinGecko", "Alpha Vantage", "Finnhub", "Frankfurter"].map((source) => (
              <span
                key={source}
                className="px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/40 text-slate-400"
              >
                {source}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-slate-400">SSL Secured</span>
          </div>
        </div>

        {/* Feature Cards */}
        <section id="features" className="mt-28 sm:mt-32 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-4 text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Real-Time Quotes</h3>
            <p className="text-sm text-slate-400">
              Live stock, crypto, and forex prices from multiple data sources.
              Never miss a market move.
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-4 text-amber-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Alerts</h3>
            <p className="text-sm text-slate-400">
              Set price thresholds and get notified instantly. Never miss your
              target entry or exit.
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c-1 2-2 3-3 3 1 0 2 1 3 3 1-2 2-3 3-3-1 0-2-1-3-3z"/><path d="M5 9c-.5 1-1 1.5-1.5 1.5.5 0 1 .5 1.5 1.5.5-1 1-1.5 1.5-1.5-.5 0-1-.5-1.5-1.5z"/><path d="M19 9c-.5 1-1 1.5-1.5 1.5.5 0 1 .5 1.5 1.5.5-1 1-1.5 1.5-1.5-.5 0-1-.5-1.5-1.5z"/><path d="M12 15c-1 2-2 3-3 3 1 0 2 1 3 3 1-2 2-3 3-3-1 0-2-1-3-3z"/></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
            <p className="text-sm text-slate-400">
              Market sentiment analysis and trend predictions powered by AI.
              Make informed decisions.
            </p>
          </div>
        </section>

        {/* Social Proof */}
        <section className="mt-28 sm:mt-32">
          <p className="text-center text-sm font-medium text-indigo-400 mb-2 tracking-wide uppercase">
            Social Proof
          </p>
          <h2 className="text-3xl font-bold text-center mb-4">
            Trusted by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              2,000+
            </span>{" "}
            investors
          </h2>
          <p className="text-center text-slate-400 mb-12 max-w-lg mx-auto">
            See what our users are saying about MarketPulse.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Sarah Chen",
                role: "Day Trader",
                quote:
                  "MarketPulse replaced three apps for me. I track my crypto, stocks, and forex all in one dashboard. The alerts alone have saved me thousands.",
              },
              {
                name: "James Rodriguez",
                role: "Portfolio Manager",
                quote:
                  "The AI insights are surprisingly accurate. I got an early heads-up on a sector rotation that my Bloomberg terminal missed. Incredible value for the price.",
              },
              {
                name: "Priya Patel",
                role: "Retail Investor",
                quote:
                  "I was paying $30/mo for TradingView and still using Yahoo Finance on the side. MarketPulse does both, better, and the free tier covers most of what I need.",
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-sm">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed flex-1">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex gap-0.5 mt-4 text-amber-400 text-xs">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mt-28 sm:mt-32">
          <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-center text-slate-400 mb-12 max-w-lg mx-auto">
            Start free, upgrade when you need more.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-1">Free</h3>
              <p className="text-3xl font-bold mb-4">
                $0<span className="text-sm font-normal text-slate-400">/mo</span>
              </p>
              <ul className="space-y-2 text-sm text-slate-400 mb-6">
                <li>Basic stock &amp; crypto quotes</li>
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
              <p className="text-3xl font-bold mb-4">
                $9.99<span className="text-sm font-normal text-slate-400">/mo</span>
              </p>
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
              <p className="text-3xl font-bold mb-4">
                $49.99<span className="text-sm font-normal text-slate-400">/mo</span>
              </p>
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

        {/* FAQ */}
        <section className="mt-28 sm:mt-32 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Frequently Asked Questions</h2>
          <p className="text-center text-slate-400 mb-12 max-w-lg mx-auto">
            Everything you need to know about MarketPulse.
          </p>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-medium hover:bg-slate-800/80 transition-colors"
                >
                  <span>{faq.q}</span>
                  <svg
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-slate-400 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mt-28 sm:mt-32">
          <h2 className="text-3xl font-bold text-center mb-4">How We Compare</h2>
          <p className="text-center text-slate-400 mb-12 max-w-lg mx-auto">
            See how MarketPulse stacks up against the competition.
          </p>
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Feature</th>
                  <th className="text-center py-3 px-3 font-semibold text-indigo-400 whitespace-nowrap">
                    MarketPulse
                  </th>
                  <th className="text-center py-3 px-3 text-slate-400 font-medium whitespace-nowrap">
                    TradingView
                  </th>
                  <th className="text-center py-3 px-3 text-slate-400 font-medium whitespace-nowrap">
                    Finviz
                  </th>
                  <th className="text-center py-3 px-3 text-slate-400 font-medium whitespace-nowrap">
                    Yahoo Finance
                  </th>
                  <th className="text-center py-3 px-3 text-slate-400 font-medium whitespace-nowrap">
                    CoinGecko
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feat) => (
                  <tr key={feat.name} className="border-b border-slate-800/50">
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{feat.name}</td>
                    {[feat.mp, feat.tv, feat.fv, feat.yf, feat.cg].map((val, ci) => (
                      <td key={ci} className="text-center py-3 px-3">
                        {val ? (
                          <span className={`inline-block ${ci === 0 ? "text-green-400" : "text-slate-500"}`}>
                            <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        ) : (
                          <span className="text-slate-600">
                            <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Newsletter */}
        <section className="mt-28 sm:mt-32 max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay ahead of the market</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Get weekly market recaps, trending assets, and exclusive insights delivered to your inbox.
          </p>
          <form action="#" className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 px-4 py-3 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 font-medium px-6 py-3 rounded-lg transition-colors text-sm whitespace-nowrap"
            >
              Join Newsletter
            </button>
          </form>
          <p className="text-xs text-slate-600 mt-3">No spam. Unsubscribe anytime.</p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <span>MarketPulse 2026. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy
            </a>
            <a href="/terms" className="hover:text-slate-300 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
