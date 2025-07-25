/**
 * Trading mode selector - switches between testnet and mainnet based on subscription
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  TestTube, 
  Zap, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Globe,
  Wallet,
  TrendingUp
} from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import realTradingService from '../services/realTradingService';

export type TradingMode = 'demo' | 'testnet' | 'mainnet';

interface TradingModeSelectorProps {
  currentMode: TradingMode;
  onModeChange: (mode: TradingMode) => void;
  userId?: string;
}

export function TradingModeSelector({ currentMode, onModeChange, userId }: TradingModeSelectorProps) {
  const { plan, canAccessFeature } = useSubscription(userId);
  const [connecting, setConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    testnet: boolean;
    mainnet: boolean;
    networkInfo?: any;
  }>({
    testnet: false,
    mainnet: false
  });

  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    try {
      // Check testnet connection
      const testnetConnected = await realTradingService.initialize(false);
      
      // Check mainnet connection (only for premium users)
      let mainnetConnected = false;
      let networkInfo = null;
      
      if (canAccessFeature('realTrading')) {
        mainnetConnected = await realTradingService.initialize(true);
        networkInfo = await realTradingService.getNetworkInfo();
      }

      setConnectionStatus({
        testnet: testnetConnected,
        mainnet: mainnetConnected,
        networkInfo
      });
    } catch (error) {
      console.error('Error checking connections:', error);
    }
  };

  const handleModeChange = async (mode: TradingMode) => {
    if (mode === currentMode) return;

    // Check if user has access to the requested mode
    if (mode === 'mainnet' && !canAccessFeature('realTrading')) {
      alert('Mainnet trading requires a Pro or Premium subscription. Please upgrade your plan.');
      return;
    }

    try {
      setConnecting(true);

      if (mode === 'mainnet') {
        const connected = await realTradingService.initialize(true);
        if (!connected) {
          alert('Failed to connect to mainnet. Please check your wallet connection.');
          return;
        }
      }

      onModeChange(mode);
      await checkConnections();
    } catch (error) {
      console.error('Error changing trading mode:', error);
      alert('Failed to switch trading mode. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const getModeIcon = (mode: TradingMode) => {
    switch (mode) {
      case 'demo': return <TestTube className="h-5 w-5" />;
      case 'testnet': return <Globe className="h-5 w-5" />;
      case 'mainnet': return <Zap className="h-5 w-5" />;
      default: return <TestTube className="h-5 w-5" />;
    }
  };

  const getModeColor = (mode: TradingMode) => {
    switch (mode) {
      case 'demo': return 'text-slate-400';
      case 'testnet': return 'text-blue-400';
      case 'mainnet': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const isMainnetAvailable = canAccessFeature('realTrading');
  const canConnectMainnet = isMainnetAvailable && window.ethereum;

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Trading Mode
          </div>
          <Badge 
            variant={currentMode === 'mainnet' ? 'default' : 'secondary'}
            className={`${getModeColor(currentMode)}`}
          >
            {currentMode.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="p-3 bg-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">Current Mode</span>
            {connectionStatus.networkInfo && (
              <Badge variant="outline" className="text-xs">
                Chain ID: {connectionStatus.networkInfo.chainId}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getModeIcon(currentMode)}
            <span className="text-white font-medium capitalize">{currentMode}</span>
            {currentMode === 'mainnet' && connectionStatus.mainnet && (
              <CheckCircle className="h-4 w-4 text-green-400" />
            )}
          </div>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 gap-3">
          
          {/* Demo Mode */}
          <Button
            variant={currentMode === 'demo' ? 'default' : 'outline'}
            onClick={() => handleModeChange('demo')}
            disabled={connecting}
            className="h-auto p-4 justify-start"
          >
            <div className="flex items-center gap-3 w-full">
              <TestTube className="h-5 w-5 text-slate-400" />
              <div className="flex-1 text-left">
                <div className="font-medium">Demo Mode</div>
                <div className="text-xs text-slate-400">
                  Simulated trading with fake data
                </div>
              </div>
              <div className="text-xs text-green-400">Free</div>
            </div>
          </Button>

          {/* Testnet Mode */}
          <Button
            variant={currentMode === 'testnet' ? 'default' : 'outline'}
            onClick={() => handleModeChange('testnet')}
            disabled={connecting}
            className="h-auto p-4 justify-start"
          >
            <div className="flex items-center gap-3 w-full">
              <Globe className="h-5 w-5 text-blue-400" />
              <div className="flex-1 text-left">
                <div className="font-medium">Testnet Mode</div>
                <div className="text-xs text-slate-400">
                  Practice with test tokens (Goerli/Sepolia)
                </div>
              </div>
              <div className="flex items-center gap-1">
                {connectionStatus.testnet ? (
                  <CheckCircle className="h-3 w-3 text-green-400" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-yellow-400" />
                )}
                <span className="text-xs text-green-400">Free</span>
              </div>
            </div>
          </Button>

          {/* Mainnet Mode */}
          <Button
            variant={currentMode === 'mainnet' ? 'default' : 'outline'}
            onClick={() => handleModeChange('mainnet')}
            disabled={connecting || !isMainnetAvailable}
            className={`h-auto p-4 justify-start ${
              !isMainnetAvailable ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-center gap-3 w-full">
              <Zap className="h-5 w-5 text-green-400" />
              <div className="flex-1 text-left">
                <div className="font-medium flex items-center gap-2">
                  Mainnet Mode
                  {!isMainnetAvailable && <Badge variant="destructive" className="text-xs">Pro+</Badge>}
                </div>
                <div className="text-xs text-slate-400">
                  Real trading with actual funds
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isMainnetAvailable && connectionStatus.mainnet ? (
                  <CheckCircle className="h-3 w-3 text-green-400" />
                ) : isMainnetAvailable ? (
                  <AlertTriangle className="h-3 w-3 text-yellow-400" />
                ) : (
                  <Shield className="h-3 w-3 text-red-400" />
                )}
                <span className="text-xs text-blue-400">
                  {isMainnetAvailable ? 'Pro+' : 'Upgrade'}
                </span>
              </div>
            </div>
          </Button>
        </div>

        {/* Status Messages */}
        <div className="space-y-2">
          {currentMode === 'demo' && (
            <Alert className="border-slate-600 bg-slate-800/50">
              <TestTube className="h-4 w-4" />
              <AlertDescription className="text-xs">
                💡 Demo mode uses simulated data. No real funds or transactions involved.
              </AlertDescription>
            </Alert>
          )}

          {currentMode === 'testnet' && (
            <Alert className="border-blue-600 bg-blue-900/20">
              <Globe className="h-4 w-4" />
              <AlertDescription className="text-xs">
                🧪 Connected to testnet. Use test ETH from faucets to practice trading safely.
              </AlertDescription>
            </Alert>
          )}

          {currentMode === 'mainnet' && connectionStatus.mainnet && (
            <Alert className="border-green-600 bg-green-900/20">
              <Zap className="h-4 w-4" />
              <AlertDescription className="text-xs">
                ⚡ LIVE TRADING ENABLED - Real funds at risk. Trade carefully!
              </AlertDescription>
            </Alert>
          )}

          {!isMainnetAvailable && (
            <Alert className="border-yellow-600 bg-yellow-900/20">
              <TrendingUp className="h-4 w-4" />
              <AlertDescription className="text-xs">
                🚀 Upgrade to Pro or Premium to unlock real mainnet trading with live funds.
              </AlertDescription>
            </Alert>
          )}

          {!window.ethereum && currentMode !== 'demo' && (
            <Alert className="border-red-600 bg-red-900/20">
              <Wallet className="h-4 w-4" />
              <AlertDescription className="text-xs">
                ⚠️ MetaMask wallet not detected. Please install MetaMask to use testnet or mainnet modes.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Connection Status */}
        {connecting && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-sm text-slate-400">Connecting...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TradingModeSelector;
