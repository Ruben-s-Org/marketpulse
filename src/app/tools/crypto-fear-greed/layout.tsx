import type { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Crypto Fear & Greed Index — Live Market Sentiment | MarketPulse",
  description:
    "Track the Crypto Fear & Greed Index in real time. Understand crypto market sentiment with a live gauge, 30-day history chart, and breakdowns of fear and greed drivers.",
  keywords: [
    "crypto fear and greed index", "crypto fear greed", "bitcoin fear and greed",
    "crypto market sentiment", "fear and greed index today", "crypto sentiment indicator",
    "bitcoin sentiment", "crypto greed index", "fear greed crypto live",
    "cryptocurrency fear index",
  ],
  openGraph: {
    title: "Crypto Fear & Greed Index — Live Market Sentiment",
    description: "Live Crypto Fear & Greed Index with 30-day history. Gauge crypto market sentiment from Extreme Fear to Extreme Greed.",
    url: "https://marketpulse-cxg.pages.dev/tools/crypto-fear-greed",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypto Fear & Greed Index — Live Market Sentiment",
    description: "Live Crypto Fear & Greed Index with 30-day history. Gauge crypto market sentiment instantly.",
  },
  alternates: { canonical: "https://marketpulse-cxg.pages.dev/tools/crypto-fear-greed" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "MarketPulse Crypto Fear & Greed Index",
            url: "https://marketpulse-cxg.pages.dev/tools/crypto-fear-greed",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            description: "Live Crypto Fear & Greed Index with 30-day sentiment history and market analysis.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Tools", url: "/tools" }, { name: "Crypto Fear & Greed Index", url: "/tools/crypto-fear-greed" }]} />
      {children}
    </>
  );
}
