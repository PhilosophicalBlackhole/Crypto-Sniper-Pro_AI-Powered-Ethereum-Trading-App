/**
 * Market overview component showing multiple cryptocurrencies
 */

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Eye, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

import { MarketGauge } from './MarketGauge';

export function MarketOverviewTab() {
  return (
    <div className="space-y-6">
      <MarketGauge coinId="ethereum" />
      {/* Other Market Overview content (e.g., Sniping Performance, etc.) */}
    </div>
  );
}

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

interface MarketOverviewProps {
  onSelectCoin?: (coinId: string) => void;
  className?: string;
}

export function MarketOverview({ onSelectCoin, className = '' }: MarketOverviewProps) {
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set(['ethereum', 'bitcoin']));

  const popularCoins = [
    'bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana', 
    'chainlink', 'polygon', 'uniswap', 'shiba-inu', 'pepe'
  ];

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${popularCoins.join(',')}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`
      );
      
      if (response.ok) {
        const data = await response.json();
        setCryptos(data);
      }
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

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

  const toggleWatchlist = (coinId: string) => {
    setWatchlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(coinId)) {
        newSet.delete(coinId);
      } else {
        newSet.add(coinId);
      }
      return newSet;
    });
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  return (
    <Card className={`bg-slate-900 border-slate-800 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <TrendingUp className="h-5 w-5" />
          Market Overview
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {cryptos.map((crypto) => (
            <div
              key={crypto.id}
              className="flex items-center justify-between p-3 bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={crypto.image} 
                  alt={crypto.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{crypto.symbol.toUpperCase()}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWatchlist(crypto.id)}
                      className={`h-6 w-6 p-0 ${watchlist.has(crypto.id) ? 'text-yellow-400' : 'text-slate-400'}`}
                    >
                      <Star className={`h-3 w-3 ${watchlist.has(crypto.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                  <div className="text-slate-400 text-sm">{crypto.name}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-white font-semibold">
                  {formatPrice(crypto.current_price)}
                </div>
                <div className={`text-sm flex items-center gap-1 ${getPriceChangeColor(crypto.price_change_percentage_24h)}`}>
                  {crypto.price_change_percentage_24h > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {crypto.price_change_percentage_24h.toFixed(2)}%
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-slate-400 text-xs">MCap</div>
                  <div className="text-white text-sm">{formatMarketCap(crypto.market_cap)}</div>
                </div>
                {onSelectCoin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectCoin(crypto.id)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {cryptos.length === 0 && !loading && (
          <div className="text-center py-8 text-slate-400">
            <p>Unable to load market data</p>
            <Button
              onClick={fetchMarketData}
              variant="outline"
              size="sm"
              className="mt-2 border-slate-600 text-slate-300"
            >
              Retry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
