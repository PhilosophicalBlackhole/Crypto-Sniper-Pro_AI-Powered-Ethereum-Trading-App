/**
 * GasStatus - compact network gas and congestion widget
 * Uses useAdvancedTrading() networkStats to show base/fast gas and congestion state.
 */

import React from 'react';
import { Zap, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useAdvancedTrading } from '../hooks/useAdvancedTrading';

/**
 * GasStatus component - small card showing current gas stats and quick refresh
 */
export function GasStatus() {
  const { networkStats, updateNetworkStats } = useAdvancedTrading();

  /**
   * Return tailwind color pair based on congestion
   */
  const getCongestionStyle = (lvl: 'low' | 'medium' | 'high') => {
    switch (lvl) {
      case 'low':
        return 'text-green-400 border-green-400';
      case 'medium':
        return 'text-yellow-400 border-yellow-400';
      case 'high':
        return 'text-red-400 border-red-400';
      default:
        return 'text-slate-400 border-slate-500';
    }
  };

  return (
    <Card className="bg-slate-900/20 backdrop-blur-sm border-slate-700/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Network Gas
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={updateNetworkStats}
            className="text-slate-400 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Congestion</span>
          <Badge variant="outline" className={`bg-transparent ${getCongestionStyle(networkStats.networkCongestion)}`}>
            {networkStats.networkCongestion.toUpperCase()}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800/60 rounded-lg">
            <div className="text-slate-400 text-xs">Base</div>
            <div className="text-white font-semibold">{networkStats.baseFee.toFixed(1)} GWEI</div>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-lg">
            <div className="text-slate-400 text-xs">Fast</div>
            <div className="text-white font-semibold">{networkStats.fastGasPrice.toFixed(1)} GWEI</div>
          </div>
        </div>
        <div className="text-xs text-slate-400">Avg block time ~ {networkStats.avgBlockTime.toFixed(1)}s</div>
      </CardContent>
    </Card>
  );
}
