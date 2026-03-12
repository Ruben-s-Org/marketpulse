import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, getSessionTokenFromCookies } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const { env } = getRequestContext();
  const jwtSecret = env.JWT_SECRET as string;
  const stripeKey = env.STRIPE_SECRET_KEY as string;
  const db = env.DB as D1Database;

  const token = getSessionTokenFromCookies(request.headers.get('cookie'));
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await verifySessionToken(token, jwtSecret);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await db
    .prepare('SELECT stripe_customer_id FROM users WHERE id = ?')
    .bind(session.sub)
    .first<{ stripe_customer_id: string | null }>();

  if (!user?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No billing account found' },
      { status: 400 }
    );
  }

  const origin = new URL(request.url).origin;

  const portalRes = await fetch(
    'https://api.stripe.com/v1/billing_portal/sessions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: user.stripe_customer_id,
        return_url: `${origin}/dashboard`,
      }),
    }
  );

  if (!portalRes.ok) {
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }

  const portalSession = (await portalRes.json()) as { url: string };

  return NextResponse.json({ url: portalSession.url });
}
