import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, getSessionTokenFromCookies } from '@/lib/auth';

export const runtime = 'edge';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { env } = getRequestContext();
  const jwtSecret = env.JWT_SECRET as string;
  const db = env.DB as D1Database;

  const token = getSessionTokenFromCookies(request.headers.get('cookie'));
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await verifySessionToken(token, jwtSecret);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as { quantity?: number; avg_buy_price?: number };

  // Verify holding belongs to user's portfolio
  const holding = await db
    .prepare(
      `SELECT h.id FROM holdings h
       JOIN portfolios p ON h.portfolio_id = p.id
       WHERE h.id = ? AND p.user_id = ?`
    )
    .bind(id, session.sub)
    .first();

  if (!holding) {
    return NextResponse.json({ error: 'Holding not found' }, { status: 404 });
  }

  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (body.quantity !== undefined) {
    updates.push('quantity = ?');
    values.push(body.quantity);
  }
  if (body.avg_buy_price !== undefined) {
    updates.push('avg_buy_price = ?');
    values.push(body.avg_buy_price);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  updates.push("updated_at = datetime('now')");
  values.push(id);

  await db
    .prepare(`UPDATE holdings SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  return NextResponse.json({ message: 'Holding updated' });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { env } = getRequestContext();
  const jwtSecret = env.JWT_SECRET as string;
  const db = env.DB as D1Database;

  const token = getSessionTokenFromCookies(request.headers.get('cookie'));
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await verifySessionToken(token, jwtSecret);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const holding = await db
    .prepare(
      `SELECT h.id FROM holdings h
       JOIN portfolios p ON h.portfolio_id = p.id
       WHERE h.id = ? AND p.user_id = ?`
    )
    .bind(id, session.sub)
    .first();

  if (!holding) {
    return NextResponse.json({ error: 'Holding not found' }, { status: 404 });
  }

  await db.prepare('DELETE FROM holdings WHERE id = ?').bind(id).run();

  return NextResponse.json({ message: 'Holding deleted' });
}
