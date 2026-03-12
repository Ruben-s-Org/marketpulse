import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, getSessionTokenFromCookies } from '@/lib/auth';

export const runtime = 'edge';

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

  const item = await db
    .prepare('SELECT id FROM watchlist WHERE id = ? AND user_id = ?')
    .bind(id, session.sub)
    .first();

  if (!item) {
    return NextResponse.json({ error: 'Watchlist item not found' }, { status: 404 });
  }

  await db.prepare('DELETE FROM watchlist WHERE id = ?').bind(id).run();

  return NextResponse.json({ message: 'Removed from watchlist' });
}
