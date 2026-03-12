import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const { env } = getRequestContext();
  const db = env.DB as D1Database;

  let body: { email?: string; source?: string };
  try {
    body = (await request.json()) as { email?: string; source?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { email, source } = body;

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const sourcePage = source || '/';

  try {
    await db
      .prepare('INSERT INTO email_waitlist (id, email, source_page) VALUES (?, ?, ?)')
      .bind(id, email.toLowerCase().trim(), sourcePage)
      .run();

    return NextResponse.json({ message: "You're on the list!", alreadyExists: false });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('UNIQUE constraint failed') || message.includes('SQLITE_CONSTRAINT')) {
      return NextResponse.json({ message: 'Already on the list!', alreadyExists: true });
    }
    console.error('Waitlist insert error:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  const { env } = getRequestContext();
  const db = env.DB as D1Database;

  const result = await db
    .prepare('SELECT COUNT(*) as count FROM email_waitlist')
    .first<{ count: number }>();

  return NextResponse.json({ count: result?.count ?? 0 });
}
