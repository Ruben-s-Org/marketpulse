import { NextResponse } from 'next/server';

export const runtime = 'edge';

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
}

const POPULAR_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK-B',
  'JPM', 'V', 'UNH', 'XOM', 'JNJ', 'WMT', 'MA', 'PG', 'HD', 'CVX',
  'MRK', 'ABBV', 'KO', 'PEP', 'COST', 'AVGO', 'LLY',
];

const STOCK_NAMES: Record<string, string> = {
  AAPL: 'Apple', MSFT: 'Microsoft', GOOGL: 'Alphabet', AMZN: 'Amazon',
  NVDA: 'NVIDIA', META: 'Meta Platforms', TSLA: 'Tesla', 'BRK-B': 'Berkshire Hathaway',
  JPM: 'JPMorgan Chase', V: 'Visa', UNH: 'UnitedHealth', XOM: 'ExxonMobil',
  JNJ: 'Johnson & Johnson', WMT: 'Walmart', MA: 'Mastercard', PG: 'Procter & Gamble',
  HD: 'Home Depot', CVX: 'Chevron', MRK: 'Merck', ABBV: 'AbbVie',
  KO: 'Coca-Cola', PEP: 'PepsiCo', COST: 'Costco', AVGO: 'Broadcom', LLY: 'Eli Lilly',
};

interface YahooQuoteResult {
  meta: {
    symbol: string;
    regularMarketPrice: number;
    chartPreviousClose: number;
    regularMarketVolume?: number;
    regularMarketDayHigh?: number;
    regularMarketDayLow?: number;
  };
}

interface YahooChartResponse {
  chart: {
    result: YahooQuoteResult[] | null;
    error: { code: string; description: string } | null;
  };
}

async function fetchStockBatch(symbols: string[]): Promise<StockQuote[]> {
  const quotes: StockQuote[] = [];

  // Fetch in parallel batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (symbol) => {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
          { headers: { 'User-Agent': 'MarketPulse/1.0' } }
        );
        if (!res.ok) return null;
        const data = (await res.json()) as YahooChartResponse;
        if (!data.chart.result?.[0]) return null;
        const meta = data.chart.result[0].meta;
        const price = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose;
        const change = price - prevClose;
        const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

        return {
          symbol,
          name: STOCK_NAMES[symbol] || symbol,
          price,
          change,
          changePercent,
          volume: meta.regularMarketVolume || 0,
          marketCap: 0,
          previousClose: prevClose,
          dayHigh: meta.regularMarketDayHigh || price,
          dayLow: meta.regularMarketDayLow || price,
        } satisfies StockQuote;
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        quotes.push(result.value);
      }
    }
  }

  return quotes;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');

    let symbols = POPULAR_STOCKS;

    if (search) {
      // Search for a specific stock by symbol
      const searchUpper = search.toUpperCase().trim();
      // Check if it's in our known list or treat as a direct symbol
      const matchingKnown = POPULAR_STOCKS.filter(
        (s) =>
          s.includes(searchUpper) ||
          (STOCK_NAMES[s] || '').toUpperCase().includes(searchUpper)
      );
      if (matchingKnown.length > 0) {
        symbols = matchingKnown;
      } else {
        // Try the search term as a direct symbol
        symbols = [searchUpper];
      }
    }

    const quotes = await fetchStockBatch(symbols);

    return NextResponse.json(quotes, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
