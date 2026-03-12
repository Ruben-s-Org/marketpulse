import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, getSessionTokenFromCookies, generateId } from '@/lib/auth';

export const runtime = 'edge';

const ALERT_LIMITS: Record<string, number> = {
  free: 2,
  pro: 50,
  premium: 999999,
};

export async function GET(request: NextRequest) {
  const { env } = getRequestContext();
  const jwtSecret = env.JWT_SECRET as string;
  const db = env.DB as D1Database;

  const token = getSessionTokenFromCookies(request.headers.get('cookie'));
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await verifySessionToken(token, jwtSecret);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const alerts = await db
    .prepare('SELECT * FROM alerts WHERE user_id = ? ORDER BY created_at DESC')
    .bind(session.sub)
    .all();

  const user = await db
    .prepare('SELECT plan FROM users WHERE id = ?')
    .bind(session.sub)
    .first<{ plan: string }>();

  const limit = ALERT_LIMITS[user?.plan || 'free'];

  return NextResponse.json({
    alerts: alerts.results,
    limit,
    used: alerts.results.length,
  });
}

export async function POST(request: NextRequest) {
  const { env } = getRequestContext();
  const jwtSecret = env.JWT_SECRET as string;
  const db = env.DB as D1Database;

  const token = getSessionTokenFromCookies(request.headers.get('cookie'));
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await verifySessionToken(token, jwtSecret);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await db
    .prepare('SELECT plan FROM users WHERE id = ?')
    .bind(session.sub)
    .first<{ plan: string }>();

  const limit = ALERT_LIMITS[user?.plan || 'free'];

  const currentCount = await db
    .prepare('SELECT COUNT(*) as count FROM alerts WHERE user_id = ?')
    .bind(session.sub)
    .first<{ count: number }>();

  if ((currentCount?.count || 0) >= limit) {
    return NextResponse.json(
      { error: `Alert limit reached (${limit}). Upgrade your plan for more alerts.` },
      { status: 403 }
    );
  }

  const body = (await request.json()) as {
    symbol: string;
    asset_type: string;
    condition: string;
    target_value: number;
  };

  if (!body.symbol || !body.asset_type || !body.condition || !body.target_value) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const id = generateId();
  await db
    .prepare(
      'INSERT INTO alerts (id, user_id, symbol, asset_type, condition, target_value) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .bind(id, session.sub, body.symbol.toUpperCase(), body.asset_type, body.condition, body.target_value)
    .run();

  return NextResponse.json({ id, message: 'Alert created' }, { status: 201 });
}
