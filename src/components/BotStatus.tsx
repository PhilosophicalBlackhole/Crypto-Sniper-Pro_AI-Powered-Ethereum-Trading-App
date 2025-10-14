/**
 * Bot status and control component
 * - Enhanced: show Total P&L in ETH and USD side by side
 */

import React from 'react';
import { Play, Pause, BarChart3, TrendingUp, Zap, Activity, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BotStatus as BotStatusType } from '../types/trading';
import { HelpTooltip } from './HelpTooltip';
import { useEthPrice } from '../hooks/useEthPrice';

interface BotStatusProps {
  status: BotStatusType;
  onStart: () => void;
  onStop: () => void;
  /**
   * When false, bot controls are disabled (e.g., on testnets).
   */
  isMainnet?: boolean;
}

/**
 * BotStatus - shows bot KPIs and lets user start/stop.
 * Disables controls when not on Mainnet for transparency and safety.
 * Displays P&L in ETH and USD for clarity.
 */
export function BotStatus({ status, onStart, onStop, isMainnet = true }: BotStatusProps) {
  const [currentUptime, setCurrentUptime] = React.useState(0);
  const { price: ethUsd } = useEthPrice();

  // Update uptime every second when bot is running
  React.useEffect(() => {
    if (!status.isRunning) {
      setCurrentUptime(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentUptime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [status.isRunning]);

  /**
   * Format P&L in ETH with more precision so small values are visible.
   */
  const formatProfitEth = (profit: number) => {
    const sign = profit >= 0 ? '+' : '';
    return `${sign}${profit.toFixed(6)} ETH`;
  };

  /**
   * Convert ETH P&L to USD if price known
   */
  const formatProfitUsd = (profitEth: number) => {
    if (!ethUsd || !Number.isFinite(ethUsd)) return '—';
    const usd = profitEth * ethUsd;
    const sign = usd >= 0 ? '+' : '';
    return `${sign}$${usd.toFixed(2)}`;
  };

  const controlsDisabled = !isMainnet;

  return (
    <Card className="bg-slate-900/30 backdrop-blur-sm border-slate-700/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Bot Status
            {!isMainnet && (
              <Badge className="bg-amber-600 text-white">Testnet</Badge>
            )}
          </div>
          <Badge
            variant={status.isRunning ? "default" : "secondary"}
            className={status.isRunning ? "bg-green-600" : "bg-slate-600"}
          >
            {status.isRunning ? 'Running' : 'Stopped'}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
     
        {/* Control Button */}
        <div className="flex items-center gap-2">
          <Button
            onClick={status.isRunning ? onStop : onStart}
            disabled={controlsDisabled}
            title={controlsDisabled ? 'Switch to Ethereum Mainnet to control the bot' : undefined}
            className={`w-full ${
              status.isRunning
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            } ${controlsDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {status.isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop Bot
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Bot
              </>
            )}
          </Button>
          <HelpTooltip
            title="Why disabled?"
            content="Bot controls are disabled on testnets to prevent accidental live trading flows. Switch to Mainnet to start."
            size="sm"
          />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-slate-800 rounded-lg">
            <div className="text-2xl font-bold text-white">{status.activeSnipes}</div>
            <div className="text-xs text-slate-400">Active Snipes</div>
          </div>
          <div className="text-center p-3 bg-slate-800 rounded-lg">
            <div className="text-2xl font-bold text-white">{status.totalTransactions}</div>
            <div className="text-xs text-slate-400">Total Trades</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Success Rate</span>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-slate-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${status.successRate}%` }}
                />
              </div>
              <span className="text-white font-semibold text-sm">
                {status.successRate.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Dual currency P&L */}
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Total P&amp;L</span>
            <div className="text-right">
              <div className={`${status.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'} font-semibold`}>
                {formatProfitEth(status.totalProfit)}
              </div>
              <div className="text-slate-300 text-xs">
                {formatProfitUsd(status.totalProfit)}
              </div>
            </div>
          </div>

          {status.isRunning && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Uptime</span>
              <span className="text-white font-semibold text-sm">
                {formatUptime(currentUptime)}
              </span>
            </div>
          )}
        </div>

        {/* Clarify simulation when not on Mainnet */}
        {!isMainnet && (
          <div className="text-[10px] text-right text-slate-500">
            P&amp;L shown is simulated while on test networks or in demo mode.
          </div>
        )}

        {/* Quick Stats */}
        <div className="pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              <span>Monitoring</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>Real-time</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>Auto-execute</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  /**
   * Format uptime in h m
   */
  function formatUptime(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}
