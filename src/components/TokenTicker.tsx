/**
 * Horizontal token ticker component showing live cryptocurrency prices
 */

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

interface TokenTickerProps {
  className?: string;
}

export function TokenTicker({ className = '' }: TokenTickerProps) {
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(false);

  // Ensure animation styles are loaded
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scroll-left {
        0% { transform: translateX(0%); }
        100% { transform: translateX(-25%); }
      }
      .ticker-scroll {
        animation: scroll-left 60s linear infinite;
      }
      .ticker-scroll:hover {
        animation-play-state: paused;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const popularCoins = [
    'bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana', 
    'chainlink', 'polygon', 'uniswap', 'shiba-inu', 'pepe'
  ];

  const fetchTickerData = async () => {
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
      console.error('Failed to fetch ticker data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickerData();
    const interval = setInterval(fetchTickerData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return `$${price.toFixed(8)}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  if (loading && cryptos.length === 0) {
    return (
      <div className={`bg-slate-900/90 border-b border-slate-700 py-3 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-slate-400 text-sm">Loading market data...</span>
        </div>
      </div>
    );
  }

  // Fallback data if API fails
  if (cryptos.length === 0) {
    const fallbackCryptos = [
      { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', current_price: 118346, price_change_percentage_24h: 0.37, image: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400' },
      { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', current_price: 3771.67, price_change_percentage_24h: 3.51, image: 'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628' },
      { id: 'binancecoin', symbol: 'BNB', name: 'BNB', current_price: 760.44, price_change_percentage_24h: 2.61, image: 'https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1696501970' },
      { id: 'solana', symbol: 'SOL', name: 'Solana', current_price: 186.30, price_change_percentage_24h: 4.92, image: 'https://coin-images.coingecko.com/coins/images/4128/large/solana.png?1718769756' },
      { id: 'cardano', symbol: 'ADA', name: 'Cardano', current_price: 0.871697, price_change_percentage_24h: 4.62, image: 'https://coin-images.coingecko.com/coins/images/975/large/cardano.png?1696502090' }
    ];
    
    return (
      <div className={`bg-slate-900/90 border-b border-slate-700 py-3 overflow-hidden ${className}`}>
        <div className="relative token-ticker-container">
          <div 
            className="flex ticker-scroll whitespace-nowrap" 
            style={{ 
              width: 'max-content',
              animation: 'scroll-left 60s linear infinite'
            }}
          >
            {[...Array(4)].map((_, setIndex) => (
              <div key={setIndex} className="flex">
                {fallbackCryptos.map((crypto) => (
                  <div key={`${setIndex}-${crypto.id}`} className="flex items-center gap-2 mx-8 flex-shrink-0">
                    <img 
                      src={crypto.image} 
                      alt={crypto.name}
                      className="w-5 h-5 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = 'https://pub-cdn.sider.ai/u/U0KAHY9O4N/web-coder/685fc6490385cdf9803e9fae/resource/da80cda5-d55c-4008-a8a2-63f3def1f5c4.jpg';
                      }}
                    />
                    <span className="text-white font-semibold text-sm">
                      {crypto.symbol.toUpperCase()}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {formatPrice(crypto.current_price)}
                    </span>
                    <div className={`flex items-center gap-1 text-sm font-medium ${getPriceChangeColor(crypto.price_change_percentage_24h)}`}>
                      {getPriceChangeIcon(crypto.price_change_percentage_24h)}
                      {crypto.price_change_percentage_24h.toFixed(2)}%
                    </div>
                    <span className="text-slate-500 mx-2">|</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Update indicator */}
          <div className="absolute top-0 right-4 flex items-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
            <span className="text-xs text-slate-400">Using cached data</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-900/90 border-b border-slate-700 py-3 overflow-hidden ${className}`}>
      <div className="relative token-ticker-container">
        {/* Scrolling ticker container with inline animation backup */}
        <div 
          className="flex animate-scroll-left ticker-scroll whitespace-nowrap" 
          style={{ 
            width: 'max-content',
            animation: 'scroll-left 60s linear infinite'
          }}
        >
          {/* Create multiple sets for continuous scroll */}
          {[...Array(4)].map((_, setIndex) => (
            <div key={setIndex} className="flex">
              {cryptos.map((crypto) => (
                <div key={`${setIndex}-${crypto.id}`} className="flex items-center gap-2 mx-8 flex-shrink-0">
                  <img 
                    src={crypto.image} 
                    alt={crypto.name}
                    className="w-5 h-5 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = 'https://pub-cdn.sider.ai/u/U0KAHY9O4N/web-coder/685fc6490385cdf9803e9fae/resource/1faa3ca7-913b-4f51-8e41-9e60393fef76.jpg';
                    }}
                  />
                  <span className="text-white font-semibold text-sm">
                    {crypto.symbol.toUpperCase()}
                  </span>
                  <span className="text-white font-medium text-sm">
                    {formatPrice(crypto.current_price)}
                  </span>
                  <div className={`flex items-center gap-1 text-sm font-medium ${getPriceChangeColor(crypto.price_change_percentage_24h)}`}>
                    {getPriceChangeIcon(crypto.price_change_percentage_24h)}
                    {crypto.price_change_percentage_24h.toFixed(2)}%
                  </div>
                  <span className="text-slate-500 mx-2">|</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Update indicator */}
        {loading && (
          <div className="absolute top-0 right-4 flex items-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></div>
            <span className="text-xs text-slate-400">Updating...</span>
          </div>
        )}
      </div>
    </div>
  );
}
