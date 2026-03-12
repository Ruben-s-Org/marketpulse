import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, getSessionTokenFromCookies } from '@/lib/auth';

export const runtime = 'edge';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { env } = getRequestContext();
  const jwtSecret = env.JWT_SECRET as string;
  const db = env.DB as D1Database;

  const token = getSessionTokenFromCookies(request.headers.get('cookie'));
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await verifySessionToken(token, jwtSecret);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await db
    .prepare('DELETE FROM alerts WHERE id = ? AND user_id = ?')
    .bind(params.id, session.sub)
    .run();

  if (result.meta.changes === 0) {
    return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Alert deleted' });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { env } = getRequestContext();
  const jwtSecret = env.JWT_SECRET as string;
  const db = env.DB as D1Database;

  const token = getSessionTokenFromCookies(request.headers.get('cookie'));
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await verifySessionToken(token, jwtSecret);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as { is_active?: number };

  await db
    .prepare('UPDATE alerts SET is_active = ? WHERE id = ? AND user_id = ?')
    .bind(body.is_active ?? 1, params.id, session.sub)
    .run();

  return NextResponse.json({ message: 'Alert updated' });
}
