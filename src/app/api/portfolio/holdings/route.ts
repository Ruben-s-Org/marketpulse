import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, getSessionTokenFromCookies, generateId } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const { env } = getRequestContext();
  const jwtSecret = env.JWT_SECRET as string;
  const db = env.DB as D1Database;

  const token = getSessionTokenFromCookies(request.headers.get('cookie'));
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await verifySessionToken(token, jwtSecret);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as {
    portfolio_id: string;
    symbol: string;
    asset_type: string;
    quantity: number;
    avg_buy_price: number;
  };

  if (!body.portfolio_id || !body.symbol || !body.asset_type || !body.quantity || !body.avg_buy_price) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!['stock', 'crypto', 'forex'].includes(body.asset_type)) {
    return NextResponse.json({ error: 'Invalid asset_type' }, { status: 400 });
  }

  // Verify portfolio belongs to user
  const portfolio = await db
    .prepare('SELECT id FROM portfolios WHERE id = ? AND user_id = ?')
    .bind(body.portfolio_id, session.sub)
    .first();

  if (!portfolio) {
    return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
  }

  const id = generateId();
  await db
    .prepare(
      'INSERT INTO holdings (id, portfolio_id, symbol, asset_type, quantity, avg_buy_price) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .bind(id, body.portfolio_id, body.symbol.toUpperCase(), body.asset_type, body.quantity, body.avg_buy_price)
    .run();

  return NextResponse.json({ id, message: 'Holding added' }, { status: 201 });
}
