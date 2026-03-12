import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    const res = await fetch(
      'https://api.frankfurter.dev/latest?base=USD&symbols=EUR,GBP,JPY,CAD,AUD,CHF,CNY,INR,MXN,BRL',
      { headers: { Accept: 'application/json' } }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch forex data' },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch forex data' },
      { status: 500 }
    );
  }
}
