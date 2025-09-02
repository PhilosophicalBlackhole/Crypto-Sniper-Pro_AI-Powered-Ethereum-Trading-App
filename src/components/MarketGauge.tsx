import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, BarChart3, Users, Activity } from 'lucide-react';

interface MarketMetrics {
  price: number;
  priceChange: number;
  volume24h: number;
  marketCap: number;
  activeTraders: number;
}

interface MarketGaugeProps {
  coinId?: string; // Default to 'ethereum'
}

export function MarketGauge({ coinId = 'ethereum' }: MarketGaugeProps) {
  const [metrics, setMetrics] = useState<MarketMetrics | null>(null);
  const [selectedTimeline, setSelectedTimeline] = useState<'12h' | '24h' | '72h' | '7d'>('24h');
  const [loading, setLoading] = useState(false);

  // Fetch market data from CoinGecko
  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_7d_change=true`
      );
      const data = await response.json();
      const coinData = data[coinId];

      // Calculate price change based on selected timeline
      let priceChange = 0;
      if (selectedTimeline === '12h') priceChange = coinData.usd_24h_change || 0;
      else if (selectedTimeline === '24h') priceChange = coinData.usd_24h_change || 0;
      else if (selectedTimeline === '72h') priceChange = coinData.usd_7d_change || 0;
      else if (selectedTimeline === '7d') priceChange = coinData.usd_7d_change || 0;

      setMetrics({
        price: coinData.usd,
        priceChange,
        volume24h: Math.random() * 1000000000, // Simulated
        marketCap: Math.random() * 10000000000, // Simulated
        activeTraders: Math.floor(Math.random() * 10000) + 1000, // Simulated
      });
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and every 30 seconds
  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, [coinId, selectedTimeline]);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  if (!metrics) {
    return (
      <Card className="bg-slate-900/30 backdrop-blur-sm border-slate-700/30">
        <CardContent className="p-6 text-center text-slate-400">
          Loading market data...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/30 backdrop-blur-sm border-slate-700/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Ethereum Market Gauge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline Tabs */}
        <Tabs value={selectedTimeline} onValueChange={(value) => setSelectedTimeline(value as any)}>
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="12h" className="text-slate-300">12h</TabsTrigger>
            <TabsTrigger value="24h" className="text-slate-300">24h</TabsTrigger>
            <TabsTrigger value="72h" className="text-slate-300">72h</TabsTrigger>
            <TabsTrigger value="7d" className="text-slate-300">7d</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Central Gauge */}
        <div className="text-center space-y-4">
          <div className="text-3xl font-bold text-white">
            {formatPrice(metrics.price)}
          </div>
          <div className={`flex items-center justify-center gap-2 text-lg font-semibold ${
            metrics.priceChange >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {metrics.priceChange >= 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            {metrics.priceChange.toFixed(2)}%
          </div>
          {/* Placeholder for a visual gauge (e.g., circular progress bar or line chart) */}
          <div className="w-64 h-64 mx-auto bg-slate-800 rounded-lg flex items-center justify-center">
            <span className="text-slate-400">Gauge Visualization</span>
          </div>
        </div>

        {/* Market Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-800/60 rounded-lg">
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Activity className="h-4 w-4" />
              <span>Volume 24h</span>
            </div>
            <div className="text-white font-semibold">
              {formatLargeNumber(metrics.volume24h)}
            </div>
          </div>
          <div className="p-4 bg-slate-800/60 rounded-lg">
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <BarChart3 className="h-4 w-4" />
              <span>Market Cap</span>
            </div>
            <div className="text-white font-semibold">
              {formatLargeNumber(metrics.marketCap)}
            </div>
          </div>
          <div className="p-4 bg-slate-800/60 rounded-lg">
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Users className="h-4 w-4" />
              <span>Active Traders</span>
            </div>
            <div className="text-white font-semibold">
              {metrics.activeTraders.toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
