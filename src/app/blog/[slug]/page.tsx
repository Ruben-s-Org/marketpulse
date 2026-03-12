import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "@/data/blog-posts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} — MarketPulse Blog`,
    description: post.metaDescription,
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: "article",
      publishedTime: post.publishedAt,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
    },
    alternates: { canonical: `https://marketpulse-cxg.pages.dev/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedAt,
    author: {
      "@type": "Organization",
      name: "MarketPulse",
      url: "https://marketpulse-cxg.pages.dev",
    },
    publisher: {
      "@type": "Organization",
      name: "MarketPulse",
      url: "https://marketpulse-cxg.pages.dev",
      logo: {
        "@type": "ImageObject",
        url: "https://marketpulse-cxg.pages.dev/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://marketpulse-cxg.pages.dev/blog/${post.slug}`,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://marketpulse-cxg.pages.dev" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://marketpulse-cxg.pages.dev/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://marketpulse-cxg.pages.dev/blog/${post.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">MP</div>
          <span className="text-xl font-bold">MarketPulse</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/#features" className="text-sm text-slate-300 hover:text-white transition-colors">Features</Link>
          <Link href="/#pricing" className="text-sm text-slate-300 hover:text-white transition-colors">Pricing</Link>
          <Link href="/blog" className="text-sm text-slate-300 hover:text-white transition-colors">Blog</Link>
          <a href="/api/auth/google" className="bg-indigo-600 hover:bg-indigo-500 text-sm font-medium px-4 py-2 rounded-lg transition-colors inline-block">Sign In</a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-8 pb-32">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-slate-400 truncate max-w-xs">{post.title}</span>
        </nav>

        {/* Post Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full">{post.category}</span>
            <span className="text-xs text-slate-500">{post.readTime}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">{post.title}</h1>
          <p className="text-lg text-slate-400 mb-6">{post.excerpt}</p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>By MarketPulse Team</span>
            <span>&middot;</span>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </header>

        {/* Gradient Banner */}
        <div
          className="h-2 rounded-full mb-12"
          style={{
            background: `linear-gradient(90deg, ${post.ogGradient.from}, ${post.ogGradient.to})`,
          }}
        />

        {/* Post Content */}
        <article
          className="prose prose-invert prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-white
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-slate-300 prose-p:leading-relaxed
            prose-li:text-slate-300
            prose-strong:text-white
            prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:text-indigo-300
            prose-ul:my-4 prose-ol:my-4
            prose-table:border-collapse prose-th:bg-slate-800/50 prose-th:p-3 prose-th:text-left prose-th:border prose-th:border-slate-700
            prose-td:p-3 prose-td:border prose-td:border-slate-700
          "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA Section */}
        <div className="mt-16 p-8 bg-slate-800/50 border border-slate-700/50 rounded-xl text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to trade smarter?</h2>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto">
            MarketPulse gives you real-time data, AI insights, and portfolio tracking — everything you need in one dashboard.
          </p>
          <a
            href="/api/auth/google"
            className="bg-indigo-600 hover:bg-indigo-500 font-medium px-6 py-3 rounded-lg transition-colors inline-block"
          >
            Get Started Free
          </a>
        </div>

        {/* Related Posts */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">More from the blog</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {blogPosts
              .filter((p) => p.slug !== post.slug)
              .slice(0, 2)
              .map((related) => (
                <Link key={related.slug} href={`/blog/${related.slug}`} className="group">
                  <article className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-colors">
                    <div
                      className="h-32 flex items-center justify-center p-4"
                      style={{
                        background: `linear-gradient(135deg, ${related.ogGradient.from}, ${related.ogGradient.to})`,
                      }}
                    >
                      <h3 className="text-sm font-bold text-white text-center leading-snug">{related.title}</h3>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">{related.category}</span>
                        <span className="text-xs text-slate-500">{related.readTime}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{related.excerpt}</p>
                    </div>
                  </article>
                </Link>
              ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-slate-500">
          <span>MarketPulse 2026. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-slate-300 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
