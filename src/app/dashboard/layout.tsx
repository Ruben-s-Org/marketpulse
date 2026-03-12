import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — MarketPulse",
  description:
    "Real-time stock, crypto, and forex dashboard. Track prices, manage your portfolio, set price alerts, and get AI-powered market insights.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <noscript>
        <div style={{ padding: "2rem", color: "#fff", background: "#0f172a" }}>
          <h1>MarketPulse Dashboard</h1>
          <p>
            Track real-time stock, crypto, and forex prices. Manage your
            portfolio, set custom price alerts, and get AI-powered market
            insights.
          </p>
          <p>Please enable JavaScript to use the dashboard.</p>
        </div>
      </noscript>
      {children}
    </>
  );
}
