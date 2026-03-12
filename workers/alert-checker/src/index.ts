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

interface WaitlistRow {
  id: string;
  email: string;
  subscribed_at: string;
  last_drip_step: number;
}

// ── Price Alert Logic ────────────────────────────────────────────

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

async function processAlerts(env: Env, ctx: ExecutionContext): Promise<void> {
  const alertsResult = await env.DB
    .prepare('SELECT * FROM alerts WHERE is_active = 1 AND triggered_at IS NULL')
    .all<Alert>();

  if (!alertsResult.results || alertsResult.results.length === 0) return;

  const [cryptoPrices, forexRates] = await Promise.all([
    fetchCryptoPrices(),
    fetchForexRates(),
  ]);

  const now = new Date().toISOString();
  const triggeredAlerts: { alert: Alert; currentPrice: number }[] = [];

  for (const alert of alertsResult.results) {
    let currentPrice: number | undefined;

    if (alert.asset_type === 'crypto') {
      currentPrice = cryptoPrices.get(alert.symbol.toUpperCase());
    } else if (alert.asset_type === 'forex') {
      currentPrice = forexRates.get(alert.symbol.toUpperCase());
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

  for (const { alert, currentPrice } of triggeredAlerts) {
    await env.DB
      .prepare('UPDATE alerts SET triggered_at = ?, is_active = 0 WHERE id = ?')
      .bind(now, alert.id)
      .run();

    const user = await env.DB
      .prepare('SELECT email FROM users WHERE id = ?')
      .bind(alert.user_id)
      .first<UserEmail>();

    if (user?.email) {
      ctx.waitUntil(sendAlertEmail(env, user.email, alert, currentPrice));
    }
  }
}

// ── Drip Campaign Logic ──────────────────────────────────────────

const DRIP_SCHEDULE = [
  { step: 1, delayDays: 3, subject: 'Track Your Portfolio Like a Pro — Free' },
  { step: 2, delayDays: 7, subject: "Free Tools You'll Actually Use Every Day" },
  { step: 3, delayDays: 14, subject: 'Unlock the Full Power of MarketPulse' },
];

async function sendDripEmail(env: Env, to: string, subject: string, html: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MarketPulse <hello@marketpulse-cxg.pages.dev>',
        to: [to],
        subject,
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function processDripCampaign(env: Env, ctx: ExecutionContext): Promise<void> {
  // Only run drip once per hour (check if minute is 0-4 since cron runs every 5 min)
  const now = new Date();
  if (now.getUTCMinutes() > 4) return;

  for (const drip of DRIP_SCHEDULE) {
    const subscribers = await env.DB.prepare(
      `SELECT id, email, subscribed_at, last_drip_step FROM waitlist
       WHERE unsubscribed = 0
         AND last_drip_step = ?
         AND julianday('now') - julianday(subscribed_at) >= ?
       LIMIT 50`
    )
      .bind(drip.step - 1, drip.delayDays)
      .all<WaitlistRow>();

    if (!subscribers.results || subscribers.results.length === 0) continue;

    for (const sub of subscribers.results) {
      const html = getDripHtml(drip.step);
      const sent = await sendDripEmail(env, sub.email, drip.subject, html);

      if (sent) {
        ctx.waitUntil(
          env.DB.prepare(
            "UPDATE waitlist SET last_drip_step = ?, last_drip_sent_at = datetime('now') WHERE id = ?"
          )
            .bind(drip.step, sub.id)
            .run()
        );
      }
    }
  }
}

function getDripHtml(step: number): string {
  switch (step) {
    case 1: return day3FeatureHighlight();
    case 2: return day7FreeTools();
    case 3: return day14ProConversion();
    default: return '';
  }
}

// ── Main Export ───────────────────────────────────────────────────

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    await Promise.all([
      processAlerts(env, ctx),
      processDripCampaign(env, ctx),
    ]);
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    return new Response('MarketPulse Alert Checker + Drip Campaign is running.', { status: 200 });
  },
};

// ── Email Templates ──────────────────────────────────────────────

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:linear-gradient(135deg,#1e293b,#312e81);border-radius:16px;padding:40px;border:1px solid #334155;">
      <div style="margin-bottom:30px;">
        <div style="width:36px;height:36px;background:#6366f1;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:14px;">MP</div>
        <span style="color:#fff;font-size:20px;font-weight:bold;vertical-align:middle;margin-left:10px;">MarketPulse</span>
      </div>
      ${content}
      <p style="color:#64748b;font-size:12px;text-align:center;margin:30px 0 0;">
        You received this because you joined the MarketPulse waitlist.<br>
        <a href="https://marketpulse-cxg.pages.dev/api/waitlist/unsubscribe" style="color:#6366f1;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function day3FeatureHighlight(): string {
  return emailWrapper(`
    <h1 style="color:#fff;font-size:26px;margin:0 0 16px;">Track Your Portfolio Like a Pro</h1>
    <p style="color:#cbd5e1;font-size:16px;line-height:1.6;margin:0 0 20px;">
      Did you know most investors check their portfolio 10+ times a day? With MarketPulse, you get everything in one place.
    </p>
    <div style="background:#1e293b;border-radius:12px;padding:20px;margin:20px 0;">
      <div style="color:#a5b4fc;font-weight:600;margin-bottom:12px;">Portfolio Tracker Features:</div>
      <ul style="color:#94a3b8;font-size:14px;line-height:2;margin:0;padding-left:20px;">
        <li><strong style="color:#fff;">Multi-asset tracking</strong> — stocks, crypto, and forex in one view</li>
        <li><strong style="color:#fff;">Real-time P&L</strong> — see your gains and losses instantly</li>
        <li><strong style="color:#fff;">Smart alerts</strong> — get notified when prices hit your targets</li>
        <li><strong style="color:#fff;">Performance charts</strong> — visualize your portfolio over time</li>
      </ul>
    </div>
    <div style="background:#1e293b;border-radius:12px;padding:20px;margin:20px 0;">
      <div style="color:#a5b4fc;font-weight:600;margin-bottom:8px;">Smart Alerts</div>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0;">
        Set custom price thresholds for any asset. When Bitcoin drops below $60K or Tesla breaks $300 — you'll know immediately via email.
      </p>
    </div>
    <div style="text-align:center;margin:30px 0;">
      <a href="https://marketpulse-cxg.pages.dev" style="display:inline-block;background:#6366f1;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;">
        Try It Free
      </a>
    </div>
  `);
}

function day7FreeTools(): string {
  return emailWrapper(`
    <h1 style="color:#fff;font-size:26px;margin:0 0 16px;">Free Tools You'll Use Every Day</h1>
    <p style="color:#cbd5e1;font-size:16px;line-height:1.6;margin:0 0 20px;">
      MarketPulse isn't just a dashboard — it's a toolkit. Here are the free tools our users love most:
    </p>
    <div style="background:#1e293b;border-radius:12px;padding:20px;margin:20px 0;">
      <div style="color:#22c55e;font-weight:600;font-size:18px;margin-bottom:4px;">Currency Converter</div>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0;">
        Convert between 150+ currencies with real-time exchange rates. Perfect for travelers, remote workers, and international investors.
      </p>
    </div>
    <div style="background:#1e293b;border-radius:12px;padding:20px;margin:20px 0;">
      <div style="color:#f59e0b;font-weight:600;font-size:18px;margin-bottom:4px;">Stock Screener</div>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0;">
        Filter through thousands of stocks by price, volume, market cap, and more. Find your next investment in seconds.
      </p>
    </div>
    <div style="background:#1e293b;border-radius:12px;padding:20px;margin:20px 0;">
      <div style="color:#a78bfa;font-weight:600;font-size:18px;margin-bottom:4px;">Crypto Tracker</div>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0;">
        Track 100+ cryptocurrencies with live prices from CoinGecko. See market cap, volume, and 24h changes at a glance.
      </p>
    </div>
    <p style="color:#cbd5e1;font-size:16px;line-height:1.6;margin:20px 0;">
      All of these are <strong style="color:#fff;">completely free</strong> — no credit card required.
    </p>
    <div style="text-align:center;margin:30px 0;">
      <a href="https://marketpulse-cxg.pages.dev" style="display:inline-block;background:#6366f1;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;">
        Explore Free Tools
      </a>
    </div>
  `);
}

function day14ProConversion(): string {
  return emailWrapper(`
    <h1 style="color:#fff;font-size:26px;margin:0 0 16px;">Ready to Level Up?</h1>
    <p style="color:#cbd5e1;font-size:16px;line-height:1.6;margin:0 0 20px;">
      You've been with us for two weeks now. If you're serious about making smarter investment decisions, here's what MarketPulse Pro unlocks:
    </p>
    <div style="background:linear-gradient(135deg,#312e81,#1e1b4b);border-radius:12px;padding:24px;margin:20px 0;border:1px solid #6366f1;">
      <div style="color:#a5b4fc;font-weight:700;font-size:20px;margin-bottom:16px;">MarketPulse Pro — $9.99/mo</div>
      <ul style="color:#c7d2fe;font-size:15px;line-height:2.2;margin:0;padding-left:20px;">
        <li><strong style="color:#fff;">Unlimited price alerts</strong> — never miss a move</li>
        <li><strong style="color:#fff;">Unlimited portfolios</strong> — separate strategies, one view</li>
        <li><strong style="color:#fff;">Real-time email notifications</strong> — instant alert delivery</li>
        <li><strong style="color:#fff;">Advanced market data</strong> — deeper insights, faster updates</li>
        <li><strong style="color:#fff;">Priority support</strong> — we're here when you need us</li>
      </ul>
    </div>
    <div style="background:#1e293b;border-radius:12px;padding:20px;margin:20px 0;">
      <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:0;">
        <strong style="color:#f59e0b;">Limited offer:</strong> Early waitlist members get <strong style="color:#fff;">30% off their first 3 months</strong>. That's just $6.99/mo for Pro-level market intelligence.
      </p>
    </div>
    <div style="text-align:center;margin:30px 0;">
      <a href="https://marketpulse-cxg.pages.dev/api/auth/google" style="display:inline-block;background:#6366f1;color:#fff;padding:16px 40px;border-radius:10px;text-decoration:none;font-weight:700;font-size:18px;">
        Claim Your 30% Discount
      </a>
      <p style="color:#94a3b8;font-size:13px;margin-top:10px;">Sign up now, upgrade anytime.</p>
    </div>
  `);
}
