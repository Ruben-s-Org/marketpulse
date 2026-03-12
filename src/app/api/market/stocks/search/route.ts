import { NextResponse } from 'next/server';

export const runtime = 'edge';

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

interface YahooAutoComplete {
  quotes: Array<{
    symbol: string;
    shortname?: string;
    longname?: string;
    quoteType: string;
    exchange: string;
  }>;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&listsCount=0`,
      { headers: { 'User-Agent': 'MarketPulse/1.0' } }
    );

    if (!res.ok) {
      return NextResponse.json([], { status: 200 });
    }

    const data = (await res.json()) as YahooAutoComplete;
    const results: SearchResult[] = (data.quotes || [])
      .filter((q) => q.quoteType === 'EQUITY')
      .map((q) => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        type: q.quoteType,
        exchange: q.exchange,
      }));

    return NextResponse.json(results, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
