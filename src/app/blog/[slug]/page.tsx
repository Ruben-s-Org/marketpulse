import { notFound } from "next/navigation";
import Link from "next/link";
import { BlogPostSchema } from "@/components/structured-data";
import type { Metadata } from "next";
import { readFileSync } from "fs";
import { join } from "path";

interface BlogPostData {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  image: string;
}

const posts: Record<string, BlogPostData> = {
  "best-free-stock-screeners-2026": {
    slug: "best-free-stock-screeners-2026",
    title: "Best Free Stock Screeners in 2026: Find Winning Trades Faster",
    description: "Compare the top free stock screeners in 2026. Filter stocks by price, volume, market cap, and technical indicators.",
    date: "2026-03-12",
    category: "Investing Tools",
    image: "/blog/stock-screener-hero.png",
  },
  "how-to-set-up-crypto-price-alerts": {
    slug: "how-to-set-up-crypto-price-alerts",
    title: "How to Set Up Crypto Price Alerts (Step-by-Step Guide)",
    description: "Learn how to set up free crypto price alerts for Bitcoin, Ethereum, and altcoins.",
    date: "2026-03-12",
    category: "Crypto",
    image: "/blog/crypto-alerts-hero.png",
  },
  "real-time-market-dashboard": {
    slug: "real-time-market-dashboard",
    title: "Real-Time Market Dashboard: Track Stocks, Crypto & Forex in One Place",
    description: "Stop switching between apps. Get real-time stock quotes, crypto prices, and forex rates in a single dashboard.",
    date: "2026-03-12",
    category: "Product",
    image: "/blog/dashboard-hero.png",
  },
};

export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) return {};

  return {
    title: `${post.title} | MarketPulse Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://marketpulse.app/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      images: [{ url: post.image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.image],
    },
    alternates: { canonical: `https://marketpulse.app/blog/${post.slug}` },
  };
}

function getMarkdownContent(slug: string): string {
  try {
    const filePath = join(process.cwd(), "content", "blog", `${slug}.md`);
    const raw = readFileSync(filePath, "utf-8");
    // Strip frontmatter
    const content = raw.replace(/^---[\s\S]*?---\n/, "");
    return content;
  } catch {
    return "";
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) notFound();

  const content = getMarkdownContent(slug);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <BlogPostSchema title={post.title} description={post.description} slug={post.slug} date={post.date} image={post.image} />

      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">MP</div>
          <span className="text-xl font-bold">MarketPulse</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/blog" className="text-sm text-slate-300 hover:text-white transition-colors">Blog</Link>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-sm font-medium px-4 py-2 rounded-lg transition-colors">Sign In</button>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-16">
        <header className="mb-10">
          <Link href="/blog" className="text-sm text-indigo-400 hover:text-indigo-300 mb-4 inline-block">&larr; Back to Blog</Link>
          <span className="block text-xs font-medium text-indigo-400 uppercase tracking-wider mt-4">{post.category}</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">{post.title}</h1>
          <p className="text-slate-400 text-lg">{post.description}</p>
          <time className="block mt-4 text-sm text-slate-500">
            {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </time>
        </header>

        <div className="prose prose-invert prose-indigo max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-indigo-400 prose-strong:text-white prose-li:text-slate-300">
          {/* Render raw markdown content as pre-formatted for now.
              TODO: Add remark/rehype or next-mdx-remote for proper markdown rendering */}
          <div className="whitespace-pre-wrap text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(content) }} />
        </div>

        <div className="mt-16 p-8 bg-indigo-950/50 border border-indigo-500/30 rounded-xl text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to track the markets?</h2>
          <p className="text-slate-400 mb-6">Get real-time stocks, crypto, and forex data in one free dashboard.</p>
          <Link href="/" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
            Try MarketPulse Free
          </Link>
        </div>
      </article>
    </div>
  );
}

function simpleMarkdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-10 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-indigo-400 hover:text-indigo-300 underline">$1</a>')
    .replace(/^\- (.+)$/gm, '<li class="ml-4">$1</li>')
    .replace(/^(?!<[h|l|u|o|d])((?!^\s*$).+)$/gm, '<p class="mb-4">$1</p>')
    .replace(/\n{2,}/g, "\n");
}
