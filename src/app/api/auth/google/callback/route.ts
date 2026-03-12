import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest } from 'next/server';
import { createSessionToken, createSessionCookie, generateId } from '@/lib/auth';

export const runtime = 'edge';

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

export async function GET(request: NextRequest) {
  const { env } = getRequestContext();
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error || !code) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/?error=auth_failed' },
    });
  }

  const clientId = env.GOOGLE_CLIENT_ID as string;
  const clientSecret = env.GOOGLE_CLIENT_SECRET as string;
  const redirectUri = env.GOOGLE_REDIRECT_URI as string;
  const jwtSecret = env.JWT_SECRET as string;
  const db = env.DB as D1Database;

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/?error=token_exchange_failed' },
    });
  }

  const tokens: GoogleTokenResponse = await tokenRes.json();

  // Fetch user profile
  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userRes.ok) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/?error=profile_fetch_failed' },
    });
  }

  const profile: GoogleUserInfo = await userRes.json();

  // Upsert user in D1
  const existing = await db
    .prepare('SELECT id FROM users WHERE google_id = ?')
    .bind(profile.sub)
    .first<{ id: string }>();

  let userId: string;
  const now = new Date().toISOString();

  if (existing) {
    userId = existing.id;
    await db
      .prepare(
        'UPDATE users SET email = ?, name = ?, avatar_url = ?, updated_at = ? WHERE id = ?'
      )
      .bind(profile.email, profile.name, profile.picture, now, userId)
      .run();
  } else {
    userId = generateId();
    await db
      .prepare(
        'INSERT INTO users (id, email, name, avatar_url, google_id, plan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(userId, profile.email, profile.name, profile.picture, profile.sub, 'free', now, now)
      .run();
  }

  // Create session
  const token = await createSessionToken(userId, profile.email, jwtSecret);

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/dashboard',
      'Set-Cookie': createSessionCookie(token),
    },
  });
}
