import { ImageResponse } from "next/og";
import { blogPosts } from "@/data/blog-posts";

export const runtime = "edge";
export const alt = "MarketPulse Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "#0f172a",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 48,
          }}
        >
          MarketPulse Blog
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: `linear-gradient(135deg, ${post.ogGradient.from}, ${post.ogGradient.to})`,
          padding: 60,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
              color: "white",
            }}
          >
            MP
          </div>
          <span style={{ fontSize: 24, fontWeight: 700, color: "white" }}>
            MarketPulse
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex" }}>
            <span
              style={{
                fontSize: 14,
                background: "rgba(255,255,255,0.2)",
                color: "white",
                padding: "4px 12px",
                borderRadius: 20,
              }}
            >
              {post.category}
            </span>
          </div>
          <h1
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.2,
              maxWidth: 900,
            }}
          >
            {post.title}
          </h1>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 18, color: "rgba(255,255,255,0.7)" }}>
            marketpulse.com/blog
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
