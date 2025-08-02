/**
 * Multi-wallet connection component supporting MetaMask, Coinbase, and other wallets
 */

import React, { useState } from 'react';
import { Wallet, RefreshCw, ExternalLink, Copy, Shield, ChevronDown, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useMultiWallet } from '../hooks/useMultiWallet';

export function MultiWalletConnection() {
  const { 
    isConnected,
    connectedWallet,
    address, 
    balance, 
    chainId, 
    isConnecting, 
    error, 
    availableWallets,
    connectWallet, 
    disconnectWallet,
    switchWallet,
    updateBalance,
    demoMode 
  } = useMultiWallet();

  const [showWalletOptions, setShowWalletOptions] = useState(false);

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

  const getConnectedWallet = () => {
    return availableWallets.find(w => w.id === connectedWallet);
  };

  if (!isConnected) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {!showWalletOptions ? (
            <div className="space-y-3">
              {/* Primary wallet options */}
              {availableWallets.filter(w => w.id !== 'demo' && w.isInstalled).slice(0, 2).map((wallet) => (
                <Button
                  key={wallet.id}
                  onClick={() => connectWallet(wallet.id)}
                  disabled={isConnecting}
                  className="w-full bg-blue-600 hover:bg-blue-700 justify-start"
                >
                  {isConnecting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <span className="mr-2">{wallet.icon}</span>
                  )}
                  {isConnecting ? 'Connecting...' : `Connect ${wallet.name}`}
                </Button>
              ))}

              {/* Show more options button */}
              {availableWallets.length > 2 && (
                <Button
                  onClick={() => setShowWalletOptions(true)}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <ChevronDown className="h-4 w-4 mr-2" />
                  More Options
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-slate-300 font-medium">Choose Wallet:</h4>
                <Button
                  onClick={() => setShowWalletOptions(false)}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400"
                >
                  Back
                </Button>
              </div>
              
              {availableWallets.map((wallet) => (
                <Button
                  key={wallet.id}
                  onClick={() => connectWallet(wallet.id)}
                  disabled={isConnecting || !wallet.isInstalled}
                  variant="outline"
                  className="w-full justify-between border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span>{wallet.icon}</span>
                    <span>{wallet.name}</span>
                  </div>
                  {!wallet.isInstalled && wallet.id !== 'demo' && (
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                      Not Installed
                    </Badge>
                  )}
                  {wallet.id === 'demo' && (
                    <Badge className="bg-yellow-600 text-yellow-100 text-xs border-yellow-500">
                      Practice
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          )}
          
          <div className="pt-4 border-t border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Shield className="h-4 w-4" />
              <span>Secure, non-custodial connection</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Multiple wallet support for maximum flexibility
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const connectedWalletInfo = getConnectedWallet();

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={demoMode ? "text-yellow-400 border-yellow-400 bg-yellow-900/20" : "text-green-400 border-green-400 bg-green-900/20"}>
              {connectedWalletInfo?.name || 'Connected'}
            </Badge>
          </div>
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
                {!demoMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openEtherscan}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
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

          {/* Wallet switching */}
          {availableWallets.length > 1 && (
            <div>
              <span className="text-slate-400 text-sm">Switch Wallet</span>
              <div className="flex gap-2 mt-2">
                {availableWallets.filter(w => w.id !== connectedWallet && w.isInstalled).slice(0, 2).map((wallet) => (
                  <Button
                    key={wallet.id}
                    onClick={() => switchWallet(wallet.id)}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    <span className="mr-1">{wallet.icon}</span>
                    {wallet.name}
                  </Button>
                ))}
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
