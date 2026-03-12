import { MetadataRoute } from "next";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

function getBlogSlugs(): { slug: string; lastModified: string }[] {
  try {
    const blogDir = join(process.cwd(), "content", "blog");
    const files = readdirSync(blogDir).filter((f) => f.endsWith(".md"));
    return files.map((file) => {
      const slug = file.replace(/\.md$/, "");
      const filePath = join(blogDir, file);
      const stat = statSync(filePath);
      // Try to extract date from frontmatter, fallback to file mtime
      const raw = readFileSync(filePath, "utf-8");
      const dateMatch = raw.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})["']?/m);
      const lastModified = dateMatch ? dateMatch[1] : stat.mtime.toISOString().split("T")[0];
      return { slug, lastModified };
    });
  } catch {
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://marketpulse.app";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/tools/currency-converter`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/tools/crypto-calculator`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/tools/profit-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  const blogPosts = getBlogSlugs();
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.lastModified),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages];
}
