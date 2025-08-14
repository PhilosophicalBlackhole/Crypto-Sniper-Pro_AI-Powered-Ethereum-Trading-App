import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { MultiWalletConnection } from './MultiWalletConnection';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

export function RealWalletConnection() {
  const { isMainnet, networkName, switchToMainnet } = useNetworkStatus();
  return (
    <div className="space-y-3">
      {!isMainnet && (
        <Card className="bg-amber-900/20 border-amber-500/40">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-200 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>You are on {networkName || 'a test network'}. Switch to Ethereum Mainnet for live trading.</span>
            </div>
            <Button variant="outline" onClick={switchToMainnet} className="bg-transparent border-amber-400 text-amber-300 hover:bg-amber-500/10">
              Switch to Mainnet
            </Button>
          </CardContent>
        </Card>
      )}
      <MultiWalletConnection />
    </div>
  );
}
