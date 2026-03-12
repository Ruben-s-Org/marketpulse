interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
}

interface Alert {
  id: string;
  user_id: string;
  symbol: string;
  asset_type: string;
  condition: string;
  target_value: number;
  is_active: number;
}

interface UserEmail {
  email: string;
}

interface CoinGeckoMarket {
  symbol: string;
  current_price: number;
}

interface ForexResponse {
  rates: Record<string, number>;
}

async function fetchCryptoPrices(): Promise<Map<string, number>> {
  const prices = new Map<string, number>();
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1'
    );
    if (res.ok) {
      const data = (await res.json()) as CoinGeckoMarket[];
      for (const coin of data) {
        prices.set(coin.symbol.toUpperCase(), coin.current_price);
      }
    }
  } catch { /* skip */ }
  return prices;
}

interface YahooChartResponse {
  chart: {
    result: Array<{ meta: { symbol: string; regularMarketPrice: number } }> | null;
  };
}

async function fetchStockPrices(symbols: string[]): Promise<Map<string, number>> {
  const prices = new Map<string, number>();
  // Batch fetch in groups of 5
  for (let i = 0; i < symbols.length; i += 5) {
    const batch = symbols.slice(i, i + 5);
    const results = await Promise.allSettled(
      batch.map(async (symbol) => {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
          { headers: { 'User-Agent': 'MarketPulse-AlertChecker/1.0' } }
        );
        if (!res.ok) return null;
        const data = (await res.json()) as YahooChartResponse;
        const price = data.chart.result?.[0]?.meta?.regularMarketPrice;
        if (price !== undefined) prices.set(symbol.toUpperCase(), price);
        return null;
      })
    );
    void results;
  }
  return prices;
}

async function fetchForexRates(): Promise<Map<string, number>> {
  const prices = new Map<string, number>();
  try {
    const res = await fetch(
      'https://api.frankfurter.dev/latest?base=USD&symbols=EUR,GBP,JPY,CAD,AUD,CHF,CNY,INR,MXN,BRL'
    );
    if (res.ok) {
      const data = (await res.json()) as ForexResponse;
      for (const [currency, rate] of Object.entries(data.rates)) {
        prices.set(currency, rate);
      }
    }
  } catch { /* skip */ }
  return prices;
}

async function sendAlertEmail(
  env: Env,
  email: string,
  alert: Alert,
  currentPrice: number
): Promise<void> {
  if (!env.RESEND_API_KEY) return;

  const conditionText = alert.condition === 'above' ? 'risen above' : 'fallen below';

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'MarketPulse Alerts <alerts@marketpulse-cxg.pages.dev>',
      to: [email],
      subject: `Price Alert: ${alert.symbol} has ${conditionText} $${alert.target_value}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1;">MarketPulse Alert</h2>
          <p><strong>${alert.symbol}</strong> (${alert.asset_type}) has ${conditionText} your target of <strong>$${alert.target_value.toLocaleString()}</strong>.</p>
          <p>Current price: <strong>$${currentPrice.toLocaleString()}</strong></p>
          <p style="margin-top: 20px;">
            <a href="https://marketpulse-cxg.pages.dev/dashboard/alerts" style="background: #6366f1; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">View Alerts</a>
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">You received this because you set up a price alert on MarketPulse.</p>
        </div>
      `,
    }),
  });
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // Fetch all active alerts
    const alertsResult = await env.DB
      .prepare('SELECT * FROM alerts WHERE is_active = 1 AND triggered_at IS NULL')
      .all<Alert>();

    if (!alertsResult.results || alertsResult.results.length === 0) return;

    // Collect stock symbols from alerts
    const stockSymbols = alertsResult.results
      .filter((a) => a.asset_type === 'stock')
      .map((a) => a.symbol.toUpperCase());

    // Fetch current prices
    const [cryptoPrices, forexRates, stockPrices] = await Promise.all([
      fetchCryptoPrices(),
      fetchForexRates(),
      stockSymbols.length > 0 ? fetchStockPrices(Array.from(new Set(stockSymbols))) : Promise.resolve(new Map<string, number>()),
    ]);

    const now = new Date().toISOString();
    const triggeredAlerts: { alert: Alert; currentPrice: number }[] = [];

    for (const alert of alertsResult.results) {
      let currentPrice: number | undefined;

      if (alert.asset_type === 'crypto') {
        currentPrice = cryptoPrices.get(alert.symbol.toUpperCase());
      } else if (alert.asset_type === 'forex') {
        currentPrice = forexRates.get(alert.symbol.toUpperCase());
      } else if (alert.asset_type === 'stock') {
        currentPrice = stockPrices.get(alert.symbol.toUpperCase());
      }

      if (currentPrice === undefined) continue;

      let triggered = false;
      if (alert.condition === 'above' && currentPrice >= alert.target_value) {
        triggered = true;
      } else if (alert.condition === 'below' && currentPrice <= alert.target_value) {
        triggered = true;
      }

      if (triggered) {
        triggeredAlerts.push({ alert, currentPrice });
      }
    }

    // Process triggered alerts
    for (const { alert, currentPrice } of triggeredAlerts) {
      // Mark as triggered
      await env.DB
        .prepare('UPDATE alerts SET triggered_at = ?, is_active = 0 WHERE id = ?')
        .bind(now, alert.id)
        .run();

      // Get user email
      const user = await env.DB
        .prepare('SELECT email FROM users WHERE id = ?')
        .bind(alert.user_id)
        .first<UserEmail>();

      if (user?.email) {
        ctx.waitUntil(sendAlertEmail(env, user.email, alert, currentPrice));
      }
    }
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    return new Response('MarketPulse Alert Checker is running.', { status: 200 });
  },
};
