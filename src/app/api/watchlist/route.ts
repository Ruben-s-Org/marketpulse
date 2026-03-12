import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, getSessionTokenFromCookies, generateId } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { env } = getRequestContext();
  const jwtSecret = env.JWT_SECRET as string;
  const db = env.DB as D1Database;

  const token = getSessionTokenFromCookies(request.headers.get('cookie'));
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await verifySessionToken(token, jwtSecret);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const watchlist = await db
    .prepare('SELECT * FROM watchlist WHERE user_id = ? ORDER BY created_at DESC')
    .bind(session.sub)
    .all();

  return NextResponse.json({ watchlist: watchlist.results });
}

export async function POST(request: NextRequest) {
  const { env } = getRequestContext();
  const jwtSecret = env.JWT_SECRET as string;
  const db = env.DB as D1Database;

  const token = getSessionTokenFromCookies(request.headers.get('cookie'));
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await verifySessionToken(token, jwtSecret);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as {
    symbol: string;
    asset_type: string;
  };

  if (!body.symbol || !body.asset_type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!['stock', 'crypto', 'forex'].includes(body.asset_type)) {
    return NextResponse.json({ error: 'Invalid asset_type' }, { status: 400 });
  }

  // Check for duplicate
  const existing = await db
    .prepare('SELECT id FROM watchlist WHERE user_id = ? AND symbol = ? AND asset_type = ?')
    .bind(session.sub, body.symbol.toUpperCase(), body.asset_type)
    .first();

  if (existing) {
    return NextResponse.json({ error: 'Already on watchlist' }, { status: 409 });
  }

  const id = generateId();
  await db
    .prepare('INSERT INTO watchlist (id, user_id, symbol, asset_type) VALUES (?, ?, ?, ?)')
    .bind(id, session.sub, body.symbol.toUpperCase(), body.asset_type)
    .run();

  return NextResponse.json({ id, message: 'Added to watchlist' }, { status: 201 });
}
