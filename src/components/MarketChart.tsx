/**
 * Market chart component with live price data from CoinGecko
 * - Enhanced: optional P&L display in ETH and USD side-by-side
 */

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface MarketDataProps {
  coinId?: string;
  className?: string;
  /** Optional P&L in ETH to display alongside price */
  pnlEth?: number;
  /** Optional P&L in USD (if not provided and coinId is ethereum, will be computed) */
  pnlUsd?: number;
  /** Optional chart height in pixels for the embedded widget (default 200) */
  chartHeight?: number;
}

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
}

export function MarketChart({ coinId = 'ethereum', className = '', pnlEth, pnlUsd, chartHeight = 200 }: MarketDataProps) {
  const [coinData, setCoinData] = useState<CoinData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const fetchCoinData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}&order=market_cap_desc&per_page=1&page=1&sparkline=false&price_change_percentage=1h%2C24h`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }
      
      const data = await response.json();
      if (data && data.length > 0) {
        setCoinData(data[0]);
        setLastUpdated(Date.now());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoinData();
    
    // Update every 30 seconds
    const interval = setInterval(fetchCoinData, 30000);
    return () => clearInterval(interval);
  }, [coinId]);

  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return `$${price.toFixed(8)}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    }
    if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    }
    return `$${(value / 1e3).toFixed(2)}K`;
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  // Derive USD P&L if not provided and coin is ETH
  const derivedPnlUsd = (() => {
    if (typeof pnlUsd === 'number') return pnlUsd;
    if (typeof pnlEth === 'number' && coinData && coinId === 'ethereum') {
      return pnlEth * coinData.current_price;
    }
    return undefined;
  })();

  return (
    <Card className={`bg-slate-900 border-slate-800 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Market Data
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchCoinData}
            disabled={loading}
            className="text-slate-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        {coinData && (
          <>
            {/* Main Price Display */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold text-white">
                  {coinData.symbol.toUpperCase()}
                </span>
                <Badge variant="outline" className="text-slate-400">
                  {coinData.name}
                </Badge>
              </div>
              <div className="text-3xl font-bold text-white">
                {formatPrice(coinData.current_price)}
              </div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-slate-500">
                    Last: {lastUpdated > 0 ? new Date(lastUpdated).toLocaleTimeString() : 'Loading...'}
                  </span>
                </div>
                <span className="text-xs text-slate-600">•</span>
                <span className="text-xs text-slate-500">API delay ~30s</span>
              </div>
            </div>

            {/* Price Changes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-slate-400 text-sm">1h Change</div>
                <div className={`flex items-center justify-center gap-1 font-semibold ${getPriceChangeColor(coinData.price_change_percentage_1h_in_currency || 0)}`}>
                  {getPriceChangeIcon(coinData.price_change_percentage_1h_in_currency || 0)}
                  {(coinData.price_change_percentage_1h_in_currency || 0).toFixed(2)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-400 text-sm">24h Change</div>
                <div className={`flex items-center justify-center gap-1 font-semibold ${getPriceChangeColor(coinData.price_change_percentage_24h)}`}>
                  {getPriceChangeIcon(coinData.price_change_percentage_24h)}
                  {coinData.price_change_percentage_24h.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Market Stats */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-800 rounded-lg">
              <div>
                <div className="text-slate-400 text-xs">24h High</div>
                <div className="text-white font-semibold">{formatPrice(coinData.high_24h)}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs">24h Low</div>
                <div className="text-white font-semibold">{formatPrice(coinData.low_24h)}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs">Market Cap</div>
                <div className="text-white font-semibold">{formatMarketCap(coinData.market_cap)}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs">24h Volume</div>
                <div className="text-white font-semibold">{formatMarketCap(coinData.total_volume)}</div>
              </div>
            </div>

            {/* CoinGecko Chart Widget */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-slate-400 text-sm">Price Chart (7 Days)</div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-slate-500">~30s delay</span>
                  </div>
                </div>
              </div>
              
              {/* Buffer Zone Indicator */}
              <div className="relative">
                <div
                  dangerouslySetInnerHTML={{
                    __html: `
                      <gecko-coin-price-chart-widget
                        locale="en"
                        dark-mode="true"
                        outlined="true"
                        coin-id="${coinId}"
                        initial-currency="usd"
                        height="${chartHeight}">
                      </gecko-coin-price-chart-widget>
                    `
                  }}
                />
                
                {/* Delay Overlay */}
                <div className="absolute top-2 right-2 bg-slate-800/90 backdrop-blur-sm rounded-lg px-2 py-1 border border-slate-700">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-slate-400">Data delayed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional P&L row */}
            {typeof pnlEth === 'number' && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg border ${pnlEth >= 0 ? 'border-emerald-600 bg-emerald-900/20' : 'border-red-600 bg-red-900/20'}`}>
                  <div className="text-slate-300 text-xs">P&L (ETH)</div>
                  <div className={`text-lg font-semibold ${pnlEth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pnlEth >= 0 ? '+' : ''}{pnlEth.toFixed(6)} ETH
                  </div>
                </div>
                <div className={`p-3 rounded-lg border ${((derivedPnlUsd ?? 0) >= 0 ? 'border-emerald-600 bg-emerald-900/20' : 'border-red-600 bg-red-900/20')}`}>
                  <div className="text-slate-300 text-xs">P&L (USD)</div>
                  <div className={`text-lg font-semibold ${((derivedPnlUsd ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400')}`}>
                    {derivedPnlUsd !== undefined ? `${derivedPnlUsd >= 0 ? '+' : ''}$${derivedPnlUsd.toFixed(2)}` : '—'}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {loading && !coinData && (
          <div className="text-center py-8 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading market data...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
