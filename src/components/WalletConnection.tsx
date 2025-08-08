/**
 * Wallet connection and status component
 */

import React from 'react';
import { Wallet, RefreshCw, ExternalLink, Copy, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useWallet } from '../hooks/useWallet';

export function WalletConnection() {
  const { 
    isConnected, 
    address, 
    balance, 
    chainId, 
    isConnecting, 
    error, 
    connectWallet, 
    disconnectWallet,
    updateBalance,
    demoMode 
  } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  const openEtherscan = () => {
    if (address) {
      window.open(`https://etherscan.io/address/${address}`, '_blank');
    }
  };

  const getNetworkName = (id: number) => {
    switch (id) {
      case 1: return 'Ethereum Mainnet';
      case 5: return 'Goerli Testnet';
      case 11155111: return 'Sepolia Testnet';
      default: return `Network ${id}`;
    }
  };

  if (!isConnected) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Wallet className="h-5 w-5" />
            Wallet Connection
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <Button 
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                {window.ethereum ? 'Connect MetaMask' : 'Try Demo Mode'}
              </>
            )}
          </Button>
          {!window.ethereum && (
            <div className="text-center">
              <p className="text-xs text-slate-500 mt-2">
                MetaMask not detected. Demo mode will be activated.
              </p>
            </div>
          )}
          
          <div className="pt-4 border-t border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Shield className="h-4 w-4" />
              <span>Secure, non-custodial connection</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet
          </div>
          <Badge variant="outline" className={demoMode ? "text-yellow-400 border-yellow-400" : "text-green-400 border-green-400"}>
            {demoMode ? 'Demo Mode' : 'Connected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 text-sm">Address</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openEtherscan}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="font-mono text-white text-sm">
              {address && formatAddress(address)}
            </div>
          </div>

          <div>
            <span className="text-slate-400 text-sm">Balance</span>
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold text-lg">{balance} ETH</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={updateBalance}
                className="text-slate-400 hover:text-white"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {chainId && (
            <div>
              <span className="text-slate-400 text-sm">Network</span>
              <div className="text-white font-semibold">
                {getNetworkName(chainId)}
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={disconnectWallet}
          variant="outline"
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          Disconnect
        </Button>
      </CardContent>
    </Card>
  );
}
