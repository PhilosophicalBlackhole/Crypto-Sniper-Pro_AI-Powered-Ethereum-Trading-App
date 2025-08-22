/**
 * useLiveTrading - global Live Mode state and risk controls for real mainnet trading.
 * - Persists mode and metrics in localStorage so services can read without React.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import realTradingService from '../services/realTradingService';

/**
 * LocalStorage keys to coordinate state with non-React services
 */
const STORAGE_KEYS = {
  liveMode: 'live_trading_mode',
  startingBalanceEth: 'live_trading_starting_balance_eth',
  realizedProfitEth: 'live_trading_realized_profit_eth',
  realizedProfitUsd: 'live_trading_realized_profit_usd',
} as const;

interface LiveTradingState {
  /** Whether Live Mode is enabled by the user */
  liveMode: boolean;
  /** Starting ETH balance captured when Live Mode was enabled */
  startingBalanceEth: number | null;
  /** Realized P&L locked on completed closes */
  realizedProfitEth: number;
  realizedProfitUsd: number;
}

interface UseLiveTradingReturn extends LiveTradingState {
  /** Toggle Live Mode; when enabling, captures starting balance */
  setLiveMode: (on: boolean) => Promise<void>;
  /** Reset starting balance to current wallet ETH (safety recalibration) */
  recaptureStartingBalance: () => Promise<void>;
  /** Record realized profit (positive/negative) and update ETH+USD totals */
  lockRealizedProfit: (profitEth: number, ethUsdPrice?: number) => void;
  /**
   * Check if a real mainnet buy of amountEth can execute without dropping
   * balance below startingBalanceEth. Returns false when it should be blocked.
   */
  canExecuteRealBuy: (amountEth: number) => Promise<boolean>;
}

/**
 * Read a number from localStorage safely
 */
function readNumber(key: string, fallback = 0): number {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Write a number to localStorage
 */
function writeNumber(key: string, value: number) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // ignore
  }
}

/**
 * useLiveTrading hook
 */
export function useLiveTrading(): UseLiveTradingReturn {
  const [liveMode, setLiveModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.liveMode) === '1';
    } catch {
      return false;
    }
  });

  const [startingBalanceEth, setStartingBalanceEth] = useState<number | null>(() => {
    const val = readNumber(STORAGE_KEYS.startingBalanceEth, NaN);
    return Number.isFinite(val) ? val : null;
  });

  const [realizedProfitEth, setRealizedProfitEth] = useState<number>(
    () => readNumber(STORAGE_KEYS.realizedProfitEth, 0)
  );
  const [realizedProfitUsd, setRealizedProfitUsd] = useState<number>(
    () => readNumber(STORAGE_KEYS.realizedProfitUsd, 0)
  );

  // Sync from localStorage on mount in case service touched it
  useEffect(() => {
    const mode = localStorage.getItem(STORAGE_KEYS.liveMode) === '1';
    const start = readNumber(STORAGE_KEYS.startingBalanceEth, NaN);
    const pEth = readNumber(STORAGE_KEYS.realizedProfitEth, 0);
    const pUsd = readNumber(STORAGE_KEYS.realizedProfitUsd, 0);
    setLiveModeState(mode);
    setStartingBalanceEth(Number.isFinite(start) ? start : null);
    setRealizedProfitEth(pEth);
    setRealizedProfitUsd(pUsd);
  }, []);

  /**
   * Persist and update Live Mode. On enable, capture starting balance from wallet.
   */
  const setLiveMode = useCallback(async (on: boolean) => {
    try {
      if (on) {
        // Ensure trading service is initialized and on correct network
        await realTradingService.initialize(true);
        const balance = await realTradingService.getETHBalance();
        setStartingBalanceEth(balance);
        writeNumber(STORAGE_KEYS.startingBalanceEth, balance);

        localStorage.setItem(STORAGE_KEYS.liveMode, '1');
        setLiveModeState(true);
        toast.success('Live Mode enabled', {
          description: `Starting balance captured: ${balance.toFixed(6)} ETH`,
        });
      } else {
        localStorage.setItem(STORAGE_KEYS.liveMode, '0');
        setLiveModeState(false);
        toast('Live Mode disabled', {
          description: 'Real trading actions will be blocked.',
        });
      }
    } catch (err) {
      console.error('Failed to toggle Live Mode:', err);
      toast.error('Failed to toggle Live Mode');
    }
  }, []);

  /**
   * Re-capture starting balance from wallet for safety recalibration
   */
  const recaptureStartingBalance = useCallback(async () => {
    try {
      await realTradingService.initialize(true);
      const balance = await realTradingService.getETHBalance();
      setStartingBalanceEth(balance);
      writeNumber(STORAGE_KEYS.startingBalanceEth, balance);
      toast.success('Starting balance updated', {
        description: `${balance.toFixed(6)} ETH`,
      });
    } catch (err) {
      console.error('Failed to recapture starting balance:', err);
      toast.error('Could not read wallet balance');
    }
  }, []);

  /**
   * Lock realized profit after a close
   */
  const lockRealizedProfit = useCallback((profitEth: number, ethUsdPrice?: number) => {
    const usd = (ethUsdPrice ?? 0) * profitEth;
    setRealizedProfitEth(prev => {
      const next = prev + profitEth;
      writeNumber(STORAGE_KEYS.realizedProfitEth, next);
      return next;
    });
    setRealizedProfitUsd(prev => {
      const next = prev + usd;
      writeNumber(STORAGE_KEYS.realizedProfitUsd, next);
      return next;
    });
    toast.success('Profit locked', {
      description: `${profitEth >= 0 ? '+' : ''}${profitEth.toFixed(6)} ETH (${usd >= 0 ? '+' : ''}$${usd.toFixed(2)})`,
    });
  }, []);

  /**
   * Risk gate for buys: ensure (currentBalance - amountEth) >= startingBalanceEth
   */
  const canExecuteRealBuy = useCallback(async (amountEth: number) => {
    try {
      if (!liveMode) return false;
      if (startingBalanceEth == null) return false;

      await realTradingService.initialize(true);
      const balance = await realTradingService.getETHBalance();
      const postBuy = balance - Math.max(0, amountEth);
      const allowed = postBuy >= startingBalanceEth - 1e-9; // tiny epsilon
      if (!allowed) {
        toast.warning('Trade blocked by risk guard', {
          description: 'This buy would reduce your balance below starting amount.',
        });
      }
      return allowed;
    } catch (err) {
      console.error('Risk check failed:', err);
      return false;
    }
  }, [liveMode, startingBalanceEth]);

  return useMemo(() => ({
    liveMode,
    startingBalanceEth,
    realizedProfitEth,
    realizedProfitUsd,
    setLiveMode,
    recaptureStartingBalance,
    lockRealizedProfit,
    canExecuteRealBuy,
  }), [
    liveMode,
    startingBalanceEth,
    realizedProfitEth,
    realizedProfitUsd,
    setLiveMode,
    recaptureStartingBalance,
    lockRealizedProfit,
    canExecuteRealBuy
  ]);
}
