import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Investment Profit Calculator — ROI & P&L | MarketPulse",
  description:
    "Calculate your investment profit or loss, ROI percentage, and break-even price. Free calculator for stocks, crypto, and forex trades with fee support.",
  keywords: [
    "profit calculator", "investment calculator", "ROI calculator",
    "stock profit calculator", "crypto profit calculator", "trading calculator",
    "profit and loss calculator", "break even calculator",
  ],
  openGraph: {
    title: "Free Investment Profit Calculator — ROI & P&L",
    description: "Calculate profit/loss, ROI, and break-even for any trade. Free calculator for stocks, crypto, and forex.",
    url: "https://marketpulse.app/tools/profit-calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Investment Profit Calculator — ROI & P&L",
    description: "Calculate profit/loss, ROI, and break-even for any trade.",
  },
  alternates: { canonical: "https://marketpulse.app/tools/profit-calculator" },
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
            name: "MarketPulse Investment Profit Calculator",
            url: "https://marketpulse.app/tools/profit-calculator",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            description: "Free investment profit/loss and ROI calculator for stocks, crypto, and forex.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      {children}
    </>
  );
}
