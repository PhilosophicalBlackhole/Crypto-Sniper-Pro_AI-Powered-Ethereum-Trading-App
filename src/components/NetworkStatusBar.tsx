/**
 * NetworkStatusBar - top banner indicating current EVM network and quick switch to Mainnet.
 */

import React from 'react';
import { Globe, Zap, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

/**
 * Props for NetworkStatusBar
 */
interface NetworkStatusBarProps {
  isMainnet: boolean;
  networkName: string;
  isDetecting?: boolean;
  onSwitchToMainnet: () => Promise<boolean>;
}

/**
 * NetworkStatusBar
 * Shows the connected network and offers a one-click "Switch to Mainnet" action if not on mainnet.
 */
export function NetworkStatusBar({
  isMainnet,
  networkName,
  isDetecting = false,
  onSwitchToMainnet,
}: NetworkStatusBarProps) {
  return (
    <div
      className={`w-full rounded-lg border px-4 py-3 mb-4 ${
        isMainnet
          ? 'bg-emerald-900/20 border-emerald-600/40'
          : 'bg-indigo-900/20 border-indigo-600/40'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          {isMainnet ? (
            <Zap className="h-4 w-4 text-emerald-400" />
          ) : (
            <Globe className="h-4 w-4 text-indigo-400" />
          )}
          <div className="text-sm">
            <div className="text-white font-medium">
              {isDetecting ? 'Detecting network…' : networkName}
            </div>
            <div className="text-xs text-slate-400">
              {isMainnet
                ? 'Live trading enabled — real funds at risk'
                : 'Test environment — safe practice with test tokens'}
            </div>
          </div>
        </div>

        {!isMainnet && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <Button
              variant="outline"
              onClick={onSwitchToMainnet}
              className="bg-transparent border-emerald-500 text-emerald-300 hover:bg-emerald-600/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Switch to Mainnet
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NetworkStatusBar;
