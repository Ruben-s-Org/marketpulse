import { clearSessionCookie } from '@/lib/auth';

export const runtime = 'edge';

export async function GET() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
      'Set-Cookie': clearSessionCookie(),
    },
  });
}
