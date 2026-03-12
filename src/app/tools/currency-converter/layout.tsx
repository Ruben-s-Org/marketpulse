import type { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Free Currency Converter — Real-Time Exchange Rates | MarketPulse",
  description:
    "Convert between 20+ currencies with live exchange rates from the European Central Bank. Free forex converter with 30-day rate history chart.",
  keywords: [
    "currency converter", "exchange rate calculator", "forex converter",
    "usd to eur", "currency exchange", "live exchange rates",
    "free currency converter", "forex rates today",
  ],
  openGraph: {
    title: "Free Currency Converter — Real-Time Exchange Rates",
    description: "Convert between 20+ currencies with live ECB exchange rates. Free 30-day rate history chart.",
    url: "https://marketpulse-cxg.pages.dev/tools/currency-converter",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Currency Converter — Real-Time Exchange Rates",
    description: "Convert between 20+ currencies with live ECB exchange rates.",
  },
  alternates: { canonical: "https://marketpulse-cxg.pages.dev/tools/currency-converter" },
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
            name: "MarketPulse Currency Converter",
            url: "https://marketpulse-cxg.pages.dev/tools/currency-converter",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            description: "Free real-time currency converter with 30-day rate history.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Tools", url: "/tools" }, { name: "Currency Converter", url: "/tools/currency-converter" }]} />
      {children}
    </>
  );
}
