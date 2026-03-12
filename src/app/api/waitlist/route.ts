import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Valid email required" }, { status: 400 });
    }

    const { env } = getRequestContext();
    const db = env.DB as D1Database;
    const id = crypto.randomUUID();

    await db
      .prepare(
        "INSERT INTO waitlist (id, email) VALUES (?, ?) ON CONFLICT(email) DO NOTHING"
      )
      .bind(id, email.toLowerCase().trim())
      .run();

    // Send welcome email immediately (drip step 0)
    const resendKey = env.RESEND_API_KEY as string;
    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "MarketPulse <hello@marketpulse-cxg.pages.dev>",
          to: [email.toLowerCase().trim()],
          subject: "Welcome to MarketPulse — Your Market Intelligence Awaits",
          html: welcomeEmailHtml(),
        }),
      });

      // Mark step 0 sent
      await db
        .prepare(
          "UPDATE waitlist SET last_drip_step = 0, last_drip_sent_at = datetime('now') WHERE email = ?"
        )
        .bind(email.toLowerCase().trim())
        .run();
    }

    return Response.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    // Duplicate email is fine
    if (msg.includes("UNIQUE")) {
      return Response.json({ success: true });
    }
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

function welcomeEmailHtml(): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:linear-gradient(135deg,#1e293b,#312e81);border-radius:16px;padding:40px;border:1px solid #334155;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:30px;">
        <div style="width:36px;height:36px;background:#6366f1;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:14px;">MP</div>
        <span style="color:#fff;font-size:20px;font-weight:bold;">MarketPulse</span>
      </div>

      <h1 style="color:#fff;font-size:28px;margin:0 0 16px;">Welcome to MarketPulse!</h1>
      <p style="color:#cbd5e1;font-size:16px;line-height:1.6;margin:0 0 20px;">
        You're now on the waitlist for the most powerful free financial intelligence platform. Here's what you'll get access to:
      </p>

      <div style="background:#1e293b;border-radius:12px;padding:20px;margin:20px 0;">
        <div style="color:#a5b4fc;font-weight:600;margin-bottom:12px;">What's Coming:</div>
        <ul style="color:#94a3b8;font-size:14px;line-height:2;margin:0;padding-left:20px;">
          <li><strong style="color:#fff;">Real-time market data</strong> — stocks, crypto, and forex</li>
          <li><strong style="color:#fff;">Smart price alerts</strong> — never miss a move</li>
          <li><strong style="color:#fff;">Portfolio tracking</strong> — P&L at a glance</li>
          <li><strong style="color:#fff;">AI-powered insights</strong> — make smarter decisions</li>
        </ul>
      </div>

      <p style="color:#cbd5e1;font-size:16px;line-height:1.6;">
        We'll send you updates as we roll out new features. In the meantime, here's a quick look at what the markets are doing today.
      </p>

      <div style="text-align:center;margin:30px 0;">
        <a href="https://marketpulse-cxg.pages.dev" style="display:inline-block;background:#6366f1;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;">
          Explore MarketPulse
        </a>
      </div>

      <p style="color:#64748b;font-size:12px;text-align:center;margin:30px 0 0;">
        You received this because you joined the MarketPulse waitlist.<br>
        <a href="https://marketpulse-cxg.pages.dev/api/waitlist/unsubscribe" style="color:#6366f1;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
