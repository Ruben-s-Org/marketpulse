interface CloudflareEnv {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  JWT_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRO_PRICE_ID: string;
  STRIPE_PREMIUM_PRICE_ID: string;
  ALPHA_VANTAGE_API_KEY: string;
  FINNHUB_API_KEY: string;
  NEWS_API_KEY: string;
}
