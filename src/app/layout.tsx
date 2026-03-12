import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "MarketPulse — Real-Time Financial Intelligence",
  description:
    "Track stocks, crypto, and forex in real-time. AI-powered insights, custom alerts, and portfolio tracking. Free to start.",
  keywords: [
    "stock market",
    "crypto prices",
    "forex rates",
    "financial dashboard",
    "portfolio tracker",
    "price alerts",
    "market intelligence",
  ],
  openGraph: {
    title: "MarketPulse — Real-Time Financial Intelligence",
    description:
      "Track stocks, crypto, and forex in real-time with AI-powered insights.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
