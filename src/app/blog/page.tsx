import { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "MarketPulse Blog — Financial Markets Insights & Guides",
  description: "Expert guides on stocks, crypto, forex trading, and financial tools. Learn to invest smarter with MarketPulse.",
  openGraph: {
    title: "MarketPulse Blog — Financial Markets Insights & Guides",
    description: "Expert guides on stocks, crypto, forex trading, and financial tools.",
    type: "website",
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">MP</div>
          <span className="text-xl font-bold">MarketPulse</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/#features" className="text-sm text-slate-300 hover:text-white transition-colors">Features</Link>
          <Link href="/#pricing" className="text-sm text-slate-300 hover:text-white transition-colors">Pricing</Link>
          <Link href="/blog" className="text-sm text-white font-medium">Blog</Link>
          <a href="/api/auth/google" className="bg-indigo-600 hover:bg-indigo-500 text-sm font-medium px-4 py-2 rounded-lg transition-colors inline-block">Sign In</a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-16 pb-32">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">MarketPulse Blog</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">Expert guides on stocks, crypto, forex, and financial tools to help you invest smarter.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <article className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-colors">
                <div className="h-48 flex items-center justify-center p-6" style={{ background: `linear-gradient(135deg, ${post.ogGradient.from}, ${post.ogGradient.to})` }}>
                  <h3 className="text-lg font-bold text-white text-center leading-snug">{post.title}</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">{post.category}</span>
                    <span className="text-xs text-slate-500">{post.readTime}</span>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-3">{post.excerpt}</p>
                  <div className="mt-4 text-sm text-indigo-400 group-hover:text-indigo-300 transition-colors">Read more &rarr;</div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </main>

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
