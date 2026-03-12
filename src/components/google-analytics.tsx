"use client";

import Script from "next/script";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}

export function trackSignup(method: string = "google") {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "sign_up", { method });
  }
}

export function trackBeginCheckout(plan: string, value: number) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "begin_checkout", {
      currency: "USD",
      value,
      items: [{ item_id: plan, item_name: `MarketPulse ${plan}`, price: value, quantity: 1 }],
    });
  }
}

export function trackPurchase(plan: string, value: number, transactionId: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: transactionId,
      currency: "USD",
      value,
      items: [{ item_id: plan, item_name: `MarketPulse ${plan}`, price: value, quantity: 1 }],
    });
  }
}

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}
