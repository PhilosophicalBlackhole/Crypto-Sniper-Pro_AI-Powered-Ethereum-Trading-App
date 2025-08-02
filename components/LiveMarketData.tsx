/**
 * Live market data integration component
 */

import React, { useEffect, useState } from 'react';
import { MarketChart } from './MarketChart';
import { MarketOverview } from './MarketOverview';

export function LiveMarketData() {
  const [selectedCoin, setSelectedCoin] = useState('ethereum');

  useEffect(() => {
    // Load CoinGecko widget script
    const script = document.createElement('script');
    script.src = 'https://widgets.coingecko.com/gecko-coin-price-chart-widget.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://widgets.coingecko.com/gecko-coin-price-chart-widget.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <MarketChart coinId={selectedCoin} />
      <MarketOverview onSelectCoin={setSelectedCoin} />
    </div>
  );
}
