/**
 * RealWalletConnection - production-grade MetaMask connector card
 * - Uses useMetaMask to connect and manage account/network.
 * - Clear error messages and mobile/desktop fallbacks.
 * - Provides Switch to Mainnet and Disconnect controls.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useMetaMask } from '../hooks/useMetaMask';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { toast } from 'sonner';
import { Wallet, PlugZap, LogOut, AlertTriangle, CheckCircle2, Globe, Copy } from 'lucide-react';

/** 
 * Copy helper
 * Copies text to clipboard with graceful fallback and toast feedback.
 */
function copyToClipboard(text: string) {
  try {
    navigator.clipboard.writeText(text);
    toast.success('Address copied');
  } catch {
    // fallback for older browsers
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    toast.success('Address copied');
  }
}

/**
 * RealWalletConnection component
 * - Shows connect/disconnect, network status, and switch-to-mainnet.
 */
function RealWalletConnection() {
  const {
    hasProvider,
    connect,
    disconnect,
    switchToMainnet,
    account,
    shortAccount,
    chainId,
    isMainnet,
    connecting,
    error,
    openInstallPage,
    openMobileDeepLink,
  } = useMetaMask();

  // Use global network status for consistent naming
  const { networkName } = useNetworkStatus();

  /** Handle connect flow with toast feedback */
  const handleConnect = async () => {
    const ok = await connect();
    if (ok) toast.success('MetaMask connected');
    else if (error) toast.error(error);
  };

  /** Handle switch-to-mainnet */
  const handleSwitch = async () => {
    const ok = await switchToMainnet();
    if (ok) toast.success('Switched to Ethereum Mainnet');
    else toast.error('Failed to switch network. Open MetaMask and try again.');
  };

  /** Clear local state "disconnect" */
  const handleDisconnect = () => {
    disconnect();
    toast('Disconnected wallet');
  };

  // Status badge for network
  const netBadge = isMainnet ? (
    <Badge className="bg-emerald-600 text-white border-emerald-500">Mainnet</Badge>
  ) : (
    <Badge variant="secondary" className="bg-slate-700 text-slate-200 border-slate-600">
      {networkName || `Chain ${chainId ?? ''}`}
    </Badge>
  );

  return (
    <Card className="bg-slate-900/30 backdrop-blur-sm border-slate-700/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            MetaMask Wallet
          </span>
          {netBadge}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error banner */}
        {error && (
          <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-900/20 text-amber-200 text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {/* Connected state */}
        {account ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <div className="text-slate-300 text-sm">Connected</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono text-sm">{shortAccount}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(account)}
                  className="bg-transparent border-slate-600 text-slate-300 hover:text-white"
                  title="Copy address"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isMainnet && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-900/20 border border-amber-500/40">
                <div className="flex items-center gap-2 text-amber-300 text-sm">
                  <Globe className="h-4 w-4" />
                  <span>
                    You are on {networkName || 'a test network'}. Switch to Ethereum Mainnet to enable live trading.
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSwitch}
                  className="bg-transparent border-emerald-500 text-emerald-300 hover:bg-emerald-600/10"
                >
                  Switch to Mainnet
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleDisconnect}
                className="bg-transparent border-slate-600 text-slate-300 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          // Disconnected state
          <div className="space-y-3">
            {!hasProvider && (
              <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-900/20 text-amber-200 text-sm">
                MetaMask not detected. Install the extension (desktop) or open with the MetaMask app (mobile).
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button
                onClick={handleConnect}
                disabled={connecting}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                <PlugZap className={`h-4 w-4 mr-2 ${connecting ? 'animate-spin' : ''}`} />
                {connecting ? 'Connecting…' : 'Connect MetaMask'}
              </Button>

              <Button
                variant="outline"
                onClick={openInstallPage}
                className="bg-transparent border-slate-600 text-slate-300 hover:text-white w-full sm:w-auto"
              >
                Install MetaMask
              </Button>

              <Button
                variant="outline"
                onClick={openMobileDeepLink}
                className="bg-transparent border-slate-600 text-slate-300 hover:text-white w-full sm:w-auto"
              >
                Open in MetaMask
              </Button>
            </div>

            <div className="text-xs text-slate-400">
              Tip: If you don’t see a prompt, open the MetaMask extension popup and check for a pending request.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { RealWalletConnection };
export default RealWalletConnection;
