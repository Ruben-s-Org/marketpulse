import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, getSessionTokenFromCookies } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const { env } = getRequestContext();
  const jwtSecret = env.JWT_SECRET as string;
  const stripeKey = env.STRIPE_SECRET_KEY as string;
  const db = env.DB as D1Database;

  const PRICE_IDS: Record<string, string> = {
    pro: env.STRIPE_PRO_PRICE_ID as string,
    premium: env.STRIPE_PREMIUM_PRICE_ID as string,
  };

  const token = getSessionTokenFromCookies(request.headers.get('cookie'));
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await verifySessionToken(token, jwtSecret);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as { plan?: string };
  const plan = body.plan as string;

  if (!plan || !PRICE_IDS[plan]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const user = await db
    .prepare('SELECT id, email, stripe_customer_id FROM users WHERE id = ?')
    .bind(session.sub)
    .first<{ id: string; email: string; stripe_customer_id: string | null }>();

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Create or reuse Stripe customer
  let customerId = user.stripe_customer_id;
  if (!customerId) {
    const customerRes = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: user.email,
        'metadata[user_id]': user.id,
      }),
    });

    if (!customerRes.ok) {
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    const customer = (await customerRes.json()) as { id: string };
    customerId = customer.id;

    await db
      .prepare('UPDATE users SET stripe_customer_id = ?, updated_at = ? WHERE id = ?')
      .bind(customerId, new Date().toISOString(), user.id)
      .run();
  }

  // Build the origin for success/cancel URLs
  const origin = new URL(request.url).origin;

  // Create checkout session
  const checkoutRes = await fetch(
    'https://api.stripe.com/v1/checkout/sessions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: customerId!,
        mode: 'subscription',
        'line_items[0][price]': PRICE_IDS[plan],
        'line_items[0][quantity]': '1',
        success_url: `${origin}/dashboard?checkout=success`,
        cancel_url: `${origin}/dashboard?checkout=cancelled`,
        'metadata[user_id]': user.id,
        'metadata[plan]': plan,
      }),
    }
  );

  if (!checkoutRes.ok) {
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }

  const checkoutSession = (await checkoutRes.json()) as { url: string };

  return NextResponse.json({ url: checkoutSession.url });
}
