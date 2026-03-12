import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, getSessionTokenFromCookies } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { env } = getRequestContext();
  const jwtSecret = env.JWT_SECRET as string;
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
    .prepare(
      'SELECT id, email, name, avatar_url, plan, created_at FROM users WHERE id = ?'
    )
    .bind(session.sub)
    .first();

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}
