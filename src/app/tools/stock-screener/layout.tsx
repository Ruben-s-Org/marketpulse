import type { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Free Stock Screener — Filter Stocks by Price, Market Cap & Sector | MarketPulse",
  description:
    "Screen and filter stocks by price, market cap, sector, and performance. Live data on top stocks with sortable columns and real-time filtering.",
  keywords: [
    "stock screener", "free stock screener", "stock filter",
    "filter stocks by sector", "stock screener by market cap",
    "stock screener by price", "best stock screener", "stock scanner",
    "stock market screener", "equity screener",
  ],
  openGraph: {
    title: "Free Stock Screener — Filter Stocks by Price, Market Cap & Sector",
    description: "Screen and filter stocks by price, market cap, sector, and daily performance. Sortable columns and real-time filtering.",
    url: "https://marketpulse-cxg.pages.dev/tools/stock-screener",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Stock Screener — Filter Stocks by Price, Market Cap & Sector",
    description: "Screen and filter stocks by price, market cap, sector, and daily performance.",
  },
  alternates: { canonical: "https://marketpulse-cxg.pages.dev/tools/stock-screener" },
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
            name: "MarketPulse Stock Screener",
            url: "https://marketpulse-cxg.pages.dev/tools/stock-screener",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            description: "Free stock screener to filter stocks by price, market cap, sector, and performance.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Tools", url: "/tools" }, { name: "Stock Screener", url: "/tools/stock-screener" }]} />
      {children}
    </>
  );
}
