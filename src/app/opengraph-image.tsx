import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MarketPulse — Free Real-Time Market Dashboard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: "bold",
              color: "white",
            }}
          >
            MP
          </div>
          <span style={{ fontSize: "48px", fontWeight: "bold", color: "white" }}>
            MarketPulse
          </span>
        </div>
        <p
          style={{
            fontSize: "28px",
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          Real-time stocks, crypto & forex in one free dashboard.
          AI insights, custom alerts, and portfolio tracking.
        </p>
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "40px",
          }}
        >
          {["Stocks", "Crypto", "Forex", "AI Insights"].map((label) => (
            <div
              key={label}
              style={{
                padding: "10px 24px",
                borderRadius: "9999px",
                background: "rgba(99, 102, 241, 0.2)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                color: "#a5b4fc",
                fontSize: "18px",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
