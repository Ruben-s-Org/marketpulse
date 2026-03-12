import type { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Free Forex Position Size & Pip Calculator | MarketPulse",
  description:
    "Calculate forex position size, pip value, and risk per trade instantly. Free position sizing calculator for forex traders with support for all major currency pairs.",
  keywords: [
    "forex calculator", "position size calculator", "pip calculator",
    "forex position sizing", "pip value calculator", "forex risk calculator",
    "lot size calculator", "forex trading calculator", "forex tools",
  ],
  openGraph: {
    title: "Free Forex Position Size & Pip Calculator",
    description: "Calculate forex position size, pip value, and risk per trade. Free calculator for all major currency pairs.",
    url: "https://marketpulse-cxg.pages.dev/tools/forex-calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Forex Position Size & Pip Calculator",
    description: "Calculate forex position size, pip value, and risk per trade instantly.",
  },
  alternates: { canonical: "https://marketpulse-cxg.pages.dev/tools/forex-calculator" },
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
            name: "MarketPulse Forex Position Size & Pip Calculator",
            url: "https://marketpulse-cxg.pages.dev/tools/forex-calculator",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            description: "Free forex position size and pip value calculator for traders.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Tools", url: "/tools" }, { name: "Forex Calculator", url: "/tools/forex-calculator" }]} />
      {children}
    </>
  );
}
