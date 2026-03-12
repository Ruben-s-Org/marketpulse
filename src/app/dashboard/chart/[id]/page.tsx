'use client';

export const runtime = 'edge';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { CandlestickChart, OHLCVData, IndicatorKey } from '@/components/candlestick-chart';

interface CoinInfo {
  id: string;
  name: string;
  symbol: string;
  image: { large: string; small: string; thumb: string };
  market_data: {
    current_price: { usd: number };
    price_change_percentage_24h: number;
    market_cap: { usd: number };
  };
}

type TimeRange = '1' | '7' | '30' | '90' | '365';

interface IndicatorConfig {
  id: string;
  label: string;
  type: 'sma' | 'ema';
  period: number;
  color: string;
  premium: boolean;
}

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: '1D', value: '1' },
  { label: '1W', value: '7' },
  { label: '1M', value: '30' },
  { label: '3M', value: '90' },
  { label: '1Y', value: '365' },
];

const INDICATORS: IndicatorConfig[] = [
  { id: 'sma20', label: 'SMA 20', type: 'sma', period: 20, color: '#f59e0b', premium: false },
  { id: 'sma50', label: 'SMA 50', type: 'sma', period: 50, color: '#8b5cf6', premium: false },
  { id: 'ema12', label: 'EMA 12', type: 'ema', period: 12, color: '#06b6d4', premium: false },
  { id: 'ema26', label: 'EMA 26', type: 'ema', period: 26, color: '#ec4899', premium: false },
  { id: 'rsi', label: 'RSI', type: 'sma', period: 14, color: '#10b981', premium: true },
  { id: 'macd', label: 'MACD', type: 'sma', period: 12, color: '#f43f5e', premium: true },
];

function formatPrice(price: number): string {
  if (price >= 1) return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  return '$' + price.toFixed(6);
}

function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return '$' + (cap / 1e12).toFixed(2) + 'T';
  if (cap >= 1e9) return '$' + (cap / 1e9).toFixed(2) + 'B';
  if (cap >= 1e6) return '$' + (cap / 1e6).toFixed(2) + 'M';
  return '$' + cap.toLocaleString();
}

export default function ChartPage() {
  const params = useParams();
  const id = params.id as string;

  const [timeRange, setTimeRange] = useState<TimeRange>('30');
  const [activeIndicators, setActiveIndicators] = useState<string[]>([]);
  const [ohlcData, setOhlcData] = useState<OHLCVData[]>([]);
  const [coinInfo, setCoinInfo] = useState<CoinInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPlan] = useState<'free' | 'pro' | 'premium'>('free');

  const fetchOHLC = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=${timeRange}`
      );
      if (!res.ok) throw new Error(`Failed to fetch OHLC data (${res.status})`);
      const rawData = await res.json();
      const ohlcvData: OHLCVData[] = (rawData as number[][]).map(
        ([timestamp, open, high, low, close]: number[]) => ({
          timestamp,
          open,
          high,
          low,
          close,
        })
      );
      setOhlcData(ohlcvData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
    } finally {
      setLoading(false);
    }
  }, [id, timeRange]);

  const fetchCoinInfo = useCallback(async () => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`
      );
      if (!res.ok) throw new Error('Failed to fetch coin info');
      const data = await res.json();
      setCoinInfo(data as CoinInfo);
    } catch {
      // Coin info is supplementary, don't block the page
    }
  }, [id]);

  useEffect(() => {
    fetchOHLC();
  }, [fetchOHLC]);

  useEffect(() => {
    fetchCoinInfo();
  }, [fetchCoinInfo]);

  const toggleIndicator = (indicatorId: string) => {
    const config = INDICATORS.find((i) => i.id === indicatorId);
    if (config?.premium && userPlan === 'free') return;
    setActiveIndicators((prev) =>
      prev.includes(indicatorId)
        ? prev.filter((i) => i !== indicatorId)
        : [...prev, indicatorId]
    );
  };

  const chartIndicators: IndicatorKey[] = activeIndicators
    .filter((id): id is IndicatorKey =>
      ['sma20', 'sma50', 'ema12', 'ema26', 'rsi', 'macd'].includes(id),
    );

  const change24h = coinInfo?.market_data?.price_change_percentage_24h ?? 0;
  const isPositive = change24h >= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-slate-800">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">
              MP
            </div>
            <span className="text-xl font-bold hidden sm:inline">MarketPulse</span>
          </a>
          <a
            href="/dashboard"
            className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </a>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-600 capitalize">
            {userPlan}
          </span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Asset Header */}
        {coinInfo && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <img
                src={coinInfo.image.small}
                alt={coinInfo.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{coinInfo.name}</h1>
                  <span className="text-sm text-slate-400 uppercase">{coinInfo.symbol}</span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-2xl font-bold">
                    {formatPrice(coinInfo.market_data.current_price.usd)}
                  </span>
                  <span
                    className={`text-sm font-medium px-2 py-0.5 rounded ${
                      isPositive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {change24h.toFixed(2)}%
                  </span>
                  <span className="text-sm text-slate-400 hidden sm:inline">
                    MCap: {formatMarketCap(coinInfo.market_data.market_cap.usd)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Time Range */}
          <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
            {TIME_RANGES.map((tr) => (
              <button
                key={tr.value}
                onClick={() => setTimeRange(tr.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  timeRange === tr.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {tr.label}
              </button>
            ))}
          </div>

          {/* Indicator Toggles */}
          <div className="flex flex-wrap gap-2">
            {INDICATORS.map((ind) => {
              const isActive = activeIndicators.includes(ind.id);
              const isLocked = ind.premium && userPlan === 'free';
              return (
                <button
                  key={ind.id}
                  onClick={() => toggleIndicator(ind.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                  } ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                  title={isLocked ? 'Premium feature' : ''}
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: ind.color }}
                  />
                  {ind.label}
                  {isLocked && (
                    <svg className="w-3 h-3 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart Area */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-8">
          {loading && (
            <div className="flex items-center justify-center" style={{ minHeight: 350 }}>
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-400">Loading chart data...</span>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center justify-center" style={{ minHeight: 350 }}>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-red-400 text-sm">{error}</p>
                <button
                  onClick={fetchOHLC}
                  className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {!loading && !error && ohlcData.length > 0 && (
            <>
              <div className="hidden md:block">
                <CandlestickChart data={ohlcData} indicators={chartIndicators} height={500} isPremium={userPlan === 'premium'} />
              </div>
              <div className="md:hidden">
                <CandlestickChart data={ohlcData} indicators={chartIndicators} height={350} isPremium={userPlan === 'premium'} />
              </div>
            </>
          )}

          {!loading && !error && ohlcData.length === 0 && (
            <div className="flex items-center justify-center" style={{ minHeight: 350 }}>
              <p className="text-slate-500 text-sm">No data available for this asset.</p>
            </div>
          )}
        </div>

        {/* Active Indicators Legend */}
        {activeIndicators.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-8">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Active Indicators
            </h3>
            <div className="flex flex-wrap gap-3">
              {activeIndicators.map((indId) => {
                const config = INDICATORS.find((i) => i.id === indId);
                if (!config) return null;
                return (
                  <div key={indId} className="flex items-center gap-2 text-sm text-slate-300">
                    <span
                      className="w-3 h-0.5 rounded inline-block"
                      style={{ backgroundColor: config.color }}
                    />
                    {config.label}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center font-bold text-[8px]">
              MP
            </div>
            MarketPulse
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
