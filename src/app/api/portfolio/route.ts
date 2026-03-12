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

  const portfolios = await db
    .prepare('SELECT * FROM portfolios WHERE user_id = ? ORDER BY created_at ASC')
    .bind(session.sub)
    .all();

  // For each portfolio, get holdings
  const results = [];
  for (const portfolio of portfolios.results) {
    const holdings = await db
      .prepare('SELECT * FROM holdings WHERE portfolio_id = ? ORDER BY created_at DESC')
      .bind(portfolio.id)
      .all();
    results.push({ ...portfolio, holdings: holdings.results });
  }

  return NextResponse.json({ portfolios: results });
}

export async function POST(request: NextRequest) {
  const { env } = getRequestContext();
  const jwtSecret = env.JWT_SECRET as string;
  const db = env.DB as D1Database;

  const token = getSessionTokenFromCookies(request.headers.get('cookie'));
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await verifySessionToken(token, jwtSecret);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as { name?: string };
  const name = body.name || 'Default';

  const id = generateId();
  await db
    .prepare('INSERT INTO portfolios (id, user_id, name) VALUES (?, ?, ?)')
    .bind(id, session.sub, name)
    .run();

  return NextResponse.json({ id, name, message: 'Portfolio created' }, { status: 201 });
}
