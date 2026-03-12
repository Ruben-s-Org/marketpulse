import type { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Free Crypto Calculator — Live Bitcoin & Ethereum Prices | MarketPulse",
  description:
    "Convert between Bitcoin, Ethereum, Solana and other cryptocurrencies to USD, EUR, GBP. Live prices, 24h change, market cap, and volume from CoinGecko.",
  keywords: [
    "crypto calculator", "bitcoin converter", "ethereum calculator",
    "crypto to usd", "btc to usd", "eth to usd", "crypto price calculator",
    "cryptocurrency converter", "live crypto prices",
  ],
  openGraph: {
    title: "Free Crypto Calculator — Live Bitcoin & Ethereum Prices",
    description: "Convert crypto to fiat with live CoinGecko prices. 24h change, market cap, and volume included.",
    url: "https://marketpulse.app/tools/crypto-calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Crypto Calculator — Live Bitcoin & Ethereum Prices",
    description: "Convert crypto to fiat with live CoinGecko prices.",
  },
  alternates: { canonical: "https://marketpulse.app/tools/crypto-calculator" },
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
            name: "MarketPulse Crypto Calculator",
            url: "https://marketpulse.app/tools/crypto-calculator",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            description: "Free cryptocurrency calculator with live prices from CoinGecko.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Tools", url: "/tools" }, { name: "Crypto Calculator", url: "/tools/crypto-calculator" }]} />
      {children}
    </>
  );
}
