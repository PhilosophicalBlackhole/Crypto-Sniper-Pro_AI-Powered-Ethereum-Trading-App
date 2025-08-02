/**
 * Real MetaMask wallet connection component
 * Handles actual wallet connection without external dependencies
 */

import React from 'react';
import { Wallet, AlertCircle, Loader2, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { useRealMetaMask } from '../hooks/useRealMetaMask';

/**
 * Component for connecting to real MetaMask wallet
 * Displays wallet status, balance, and connection controls
 */
export function RealWalletConnection() {
  const {
    isConnected,
    address,
    balance,
    chainId,
    connect,
    disconnect,
    switchNetwork,
    error,
    isLoading,
  } = useRealMetaMask();

  /**
   * Copy address to clipboard
   */
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  /**
   * Get network name from chain ID
   */
  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet';
      case 5:
        return 'Goerli Testnet';
      case 11155111:
        return 'Sepolia Testnet';
      case 137:
        return 'Polygon';
      case 56:
        return 'BSC';
      default:
        return chainId ? `Chain ${chainId}` : 'Unknown';
    }
  };

  /**
   * Check if on Ethereum mainnet
   */
  const isMainnet = chainId === 1;

  /**
   * Get network status color
   */
  const getNetworkColor = () => {
    if (isMainnet) return 'text-green-400';
    if (chainId === 5 || chainId === 11155111) return 'text-yellow-400';
    return 'text-orange-400';
  };

  /**
   * Retry connection
   */
  const handleRetry = () => {
    connect();
  };

  return (
    <Card className="bg-slate-900/30 backdrop-blur-sm border-slate-700/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          MetaMask Wallet
        </CardTitle>
        <CardDescription className="text-slate-400">
          Connect your MetaMask wallet to start trading
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-400">
              {error}
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* MetaMask Installation Check */}
        {typeof window !== 'undefined' && (!window.ethereum || !window.ethereum.isMetaMask) && (
          <Alert className="bg-amber-900/20 border-amber-500/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-amber-400">
              MetaMask is not detected. Please install the{' '}
              <a
                href="https://metamask.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-amber-300"
              >
                MetaMask extension
              </a>
              {' '}and refresh the page.
            </AlertDescription>
          </Alert>
        )}

        {/* Connection Status */}
        {!isConnected ? (
          <div className="text-center py-6">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-400 mb-4">
              Connect your MetaMask wallet to get started
            </p>
            <Button
              onClick={connect}
              disabled={isLoading || (typeof window !== 'undefined' && (!window.ethereum || !window.ethereum.isMetaMask))}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect MetaMask
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Connection Success */}
            <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-400">
                <Wallet className="h-4 w-4" />
                <span className="text-sm font-medium">Wallet Connected</span>
              </div>
            </div>

            {/* Wallet Info */}
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Address</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="text-slate-400 hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-white font-mono text-sm break-all">
                {address}
              </p>
            </div>

            {/* Balance */}
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Balance</span>
                <span className="text-white font-semibold">
                  {balance} ETH
                </span>
              </div>
            </div>

            {/* Network */}
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Network</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getNetworkColor()}`}>
                    {getNetworkName(chainId)}
                  </span>
                  {!isMainnet && chainId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => switchNetwork(1)}
                      disabled={isLoading}
                      className="text-orange-400 border-orange-400 hover:bg-orange-400/10"
                    >
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        'Switch to Mainnet'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={disconnect}
                className="bg-transparent border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                Disconnect
              </Button>
              {address && (
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
                  className="bg-transparent border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Etherscan
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
