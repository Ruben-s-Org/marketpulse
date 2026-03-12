import type { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Free Financial Tools — Currency Converter, Crypto Calculator & More | MarketPulse",
  description:
    "Free financial tools: currency converter, crypto calculator, profit calculator, stock screener, forex calculator, and crypto Fear & Greed Index. No sign-up required.",
  keywords: [
    "free financial tools", "currency converter", "crypto calculator",
    "stock screener", "forex calculator", "profit calculator",
    "crypto fear and greed", "financial calculators", "investment tools",
    "free trading tools",
  ],
  openGraph: {
    title: "Free Financial Tools | MarketPulse",
    description: "Free currency converter, crypto calculator, stock screener, forex calculator, and more. No sign-up required.",
    url: "https://marketpulse-cxg.pages.dev/tools",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Financial Tools | MarketPulse",
    description: "Free currency converter, crypto calculator, stock screener, forex calculator, and more.",
  },
  alternates: { canonical: "https://marketpulse-cxg.pages.dev/tools" },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Tools", url: "/tools" }]} />
      {children}
    </>
  );
}
