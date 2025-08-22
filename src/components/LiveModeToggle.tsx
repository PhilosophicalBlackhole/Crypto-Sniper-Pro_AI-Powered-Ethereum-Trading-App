/**
 * LiveModeToggle - sidebar control to enable/disable Live Mode (real mainnet trades)
 */

import React from 'react';
import { Card, CardContent } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Shield, Zap, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useLiveTrading } from '../hooks/useLiveTrading';

interface LiveModeToggleProps {
  /** Compact variant (optional) */
  compact?: boolean;
}

/**
 * LiveModeToggle component with status badge and recapture control
 */
export function LiveModeToggle({ compact = false }: LiveModeToggleProps) {
  const { isMainnet, networkName } = useNetworkStatus();
  const { liveMode, startingBalanceEth, setLiveMode, recaptureStartingBalance } = useLiveTrading();

  const statusBadge = liveMode ? (
    <Badge className="bg-emerald-600 text-white border-emerald-500">LIVE TRADING ACTIVE</Badge>
  ) : (
    <Badge variant="secondary" className="bg-slate-700 text-slate-200 border-slate-600">LIVE TRADING STOPPED</Badge>
  );

  return (
    <Card className="bg-slate-900/60 border-slate-700">
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-slate-300" />
            <Label className="text-slate-200 font-medium">Live Mode</Label>
          </div>
          <Switch
            checked={liveMode}
            onCheckedChange={(v) => setLiveMode(v)}
            aria-label="Toggle Live Mode"
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          {statusBadge}
          {!isMainnet && (
            <div className="flex items-center gap-1 text-amber-300 text-[11px]">
              <AlertTriangle className="h-3 w-3" />
              <span>{networkName}</span>
            </div>
          )}
        </div>

        {liveMode && (
          <div className="mt-3 text-xs text-slate-400">
            Starting balance: <span className="text-slate-200">{startingBalanceEth?.toFixed(6) ?? '—'} ETH</span>
          </div>
        )}

        {liveMode && (
          <div className="mt-3 flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={recaptureStartingBalance}
              className="bg-transparent border-slate-600 text-slate-300 hover:text-white"
              title="Re-capture current wallet balance as the new starting point"
            >
              <Zap className="h-4 w-4 mr-1" />
              Recapture
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LiveModeToggle;
