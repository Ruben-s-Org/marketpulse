import { MetadataRoute } from "next";

const blogPosts = [
  { slug: "best-free-stock-screeners-2026", lastModified: "2026-03-12" },
  { slug: "how-to-set-up-crypto-price-alerts", lastModified: "2026-03-12" },
  { slug: "real-time-market-dashboard", lastModified: "2026-03-12" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://marketpulse.app";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.lastModified),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages];
}
