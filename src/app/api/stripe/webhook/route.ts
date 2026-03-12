import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string
): Promise<boolean> {
  const parts = sigHeader.split(',');
  let timestamp = '';
  const signatures: string[] = [];

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') timestamp = value;
    if (key === 'v1') signatures.push(value);
  }

  if (!timestamp || signatures.length === 0) return false;

  // Reject if timestamp is more than 5 minutes old
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
  if (age > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signedPayload)
  );

  const expectedSig = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return signatures.some((sig) => sig === expectedSig);
}

export async function POST(request: NextRequest) {
  const { env } = getRequestContext();
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET as string;
  const db = env.DB as D1Database;

  const body = await request.text();
  const sigHeader = request.headers.get('stripe-signature');

  if (!sigHeader) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const valid = await verifyStripeSignature(body, sigHeader, webhookSecret);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const event = JSON.parse(body) as { type: string; data: { object: any } };
  const now = new Date().toISOString();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan;
      const subscriptionId = session.subscription;
      const customerId = session.customer;

      if (userId && plan) {
        await db
          .prepare(
            'UPDATE users SET plan = ?, stripe_customer_id = ?, stripe_subscription_id = ?, updated_at = ? WHERE id = ?'
          )
          .bind(plan, customerId, subscriptionId, now, userId)
          .run();
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const status = subscription.status;

      if (status === 'active') {
        // Subscription is active - retrieve plan from price
        const priceId = subscription.items?.data?.[0]?.price?.id;
        const proPriceId = env.STRIPE_PRO_PRICE_ID as string;
        const premiumPriceId = env.STRIPE_PREMIUM_PRICE_ID as string;
        let plan = 'free';
        if (priceId === proPriceId) plan = 'pro';
        else if (priceId === premiumPriceId) plan = 'premium';

        await db
          .prepare(
            'UPDATE users SET plan = ?, stripe_subscription_id = ?, updated_at = ? WHERE stripe_customer_id = ?'
          )
          .bind(plan, subscription.id, now, customerId)
          .run();
      } else if (status === 'past_due' || status === 'unpaid') {
        await db
          .prepare(
            'UPDATE users SET plan = ?, updated_at = ? WHERE stripe_customer_id = ?'
          )
          .bind('free', now, customerId)
          .run();
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      await db
        .prepare(
          'UPDATE users SET plan = ?, stripe_subscription_id = NULL, updated_at = ? WHERE stripe_customer_id = ?'
        )
        .bind('free', now, customerId)
        .run();
      break;
    }
  }

  return NextResponse.json({ received: true });
}
