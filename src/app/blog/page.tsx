import Link from "next/link";
import { blogIndexMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = blogIndexMetadata;

const posts = [
  {
    slug: "best-free-stock-screeners-2026",
    title: "Best Free Stock Screeners in 2026: Find Winning Trades Faster",
    description: "Compare the top free stock screeners in 2026. Filter stocks by price, volume, market cap, and technical indicators.",
    date: "2026-03-12",
    category: "Investing Tools",
  },
  {
    slug: "how-to-set-up-crypto-price-alerts",
    title: "How to Set Up Crypto Price Alerts (Step-by-Step Guide)",
    description: "Learn how to set up free crypto price alerts for Bitcoin, Ethereum, and altcoins.",
    date: "2026-03-12",
    category: "Crypto",
  },
  {
    slug: "real-time-market-dashboard",
    title: "Real-Time Market Dashboard: Track Stocks, Crypto & Forex in One Place",
    description: "Stop switching between apps. Get real-time stock quotes, crypto prices, and forex rates in a single dashboard.",
    date: "2026-03-12",
    category: "Product",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">MP</div>
          <span className="text-xl font-bold">MarketPulse</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/blog" className="text-sm text-indigo-400 font-medium">Blog</Link>
          <Link href="/#pricing" className="text-sm text-slate-300 hover:text-white transition-colors">Pricing</Link>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-sm font-medium px-4 py-2 rounded-lg transition-colors">Sign In</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Blog</h1>
        <p className="text-slate-400 mb-12 text-lg">Investing guides, market analysis, and product updates.</p>

        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.slug} className="border border-slate-700/50 bg-slate-800/30 rounded-xl p-6 hover:border-indigo-500/50 transition-colors">
              <Link href={`/blog/${post.slug}`}>
                <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">{post.category}</span>
                <h2 className="text-2xl font-semibold mt-2 mb-3 hover:text-indigo-400 transition-colors">{post.title}</h2>
                <p className="text-slate-400 mb-4">{post.description}</p>
                <time className="text-sm text-slate-500">
                  {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </time>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
