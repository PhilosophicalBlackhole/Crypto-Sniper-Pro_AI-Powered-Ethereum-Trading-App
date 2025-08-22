/**
 * useEthPrice - lightweight ETH->USD price fetcher using CoinGecko
 */

import { useEffect, useState } from 'react';

interface UseEthPrice {
  price: number | null;
  lastUpdated: number | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetch ETH price every 30s
 */
export function useEthPrice(): UseEthPrice {
  const [price, setPrice] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      if (!res.ok) throw new Error('Failed to fetch ETH price');
      const data = await res.json();
      const p = Number(data?.ethereum?.usd);
      if (Number.isFinite(p)) {
        setPrice(p);
        setLastUpdated(Date.now());
      } else {
        throw new Error('Invalid price response');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load price');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    const id = setInterval(fetchPrice, 30000);
    return () => clearInterval(id);
  }, []);

  return { price, lastUpdated, loading, error };
}
