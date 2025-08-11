/**
 * Bot status and control component
 */

import React from 'react';
import { Play, Pause, BarChart3, TrendingUp, Zap, Activity, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BotStatus as BotStatusType } from '../types/trading';
import { HelpTooltip } from './HelpTooltip';

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
 */
export function BotStatus({ status, onStart, onStop, isMainnet = true }: BotStatusProps) {
  const [currentUptime, setCurrentUptime] = React.useState(0);

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

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatProfit = (profit: number) => {
    const sign = profit >= 0 ? '+' : '';
    return `${sign}${profit.toFixed(4)} ETH`;
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
        {/* Environment warning when not on mainnet */}
        {!isMainnet && (
          <div className="p-3 bg-amber-900/20 border border-amber-500/40 rounded-lg text-amber-300 text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Mainnet Required</div>
              <div className="text-amber-200/90 text-xs">
                Live bot controls are only available on Ethereum Mainnet. Use the Switch to Mainnet action from the banner to enable trading.
              </div>
            </div>
          </div>
        )}

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

          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Total P&amp;L</span>
            <span className={`font-semibold ${
              status.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatProfit(status.totalProfit)}
            </span>
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
}
