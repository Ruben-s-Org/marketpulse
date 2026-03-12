import { Metadata } from "next";

export const landingPageMetadata: Metadata = {
  title: "MarketPulse — Free Real-Time Stock, Crypto & Forex Dashboard",
  description:
    "Track stocks, crypto, and forex in one free dashboard. Real-time quotes, custom price alerts, portfolio tracking, and AI-powered market insights. No credit card required.",
  keywords: [
    "stock screener", "crypto alerts", "portfolio tracker", "market dashboard",
    "real-time stock quotes", "crypto price tracker", "forex rates",
    "free stock screener", "bitcoin price alerts", "investment dashboard",
  ],
  openGraph: {
    title: "MarketPulse — Free Real-Time Market Dashboard",
    description: "Track stocks, crypto, and forex in one free dashboard. Real-time data, custom alerts, and AI insights.",
    url: "https://marketpulse-cxg.pages.dev",
    siteName: "MarketPulse",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MarketPulse Dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MarketPulse — Free Real-Time Market Dashboard",
    description: "Stocks, crypto, and forex in one dashboard. Free real-time data and price alerts.",
    images: ["/og-image.png"],
    creator: "@MarketPulseApp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: "https://marketpulse-cxg.pages.dev" },
};

export const blogIndexMetadata: Metadata = {
  title: "MarketPulse Blog — Investing Tips, Crypto Guides & Market Analysis",
  description: "Learn about stock screening, crypto trading, forex analysis, and portfolio management. Free guides from MarketPulse.",
  openGraph: {
    title: "MarketPulse Blog — Investing Tips & Market Analysis",
    description: "Free guides on stock screening, crypto trading, and portfolio management.",
    url: "https://marketpulse-cxg.pages.dev/blog",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MarketPulse Blog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MarketPulse Blog — Investing Tips & Market Analysis",
    description: "Free guides on stock screening, crypto trading, and portfolio management.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: "https://marketpulse-cxg.pages.dev/blog" },
};
