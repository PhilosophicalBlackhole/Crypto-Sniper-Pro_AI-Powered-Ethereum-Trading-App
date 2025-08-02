/**
 * Main trading dashboard page
 */

import React from 'react';
import '../components/AnimatedBackground.css';
import { RealWalletConnection } from '../components/RealWalletConnection';
import { RealTradingDashboard } from '../components/RealTradingDashboard';
import { DemoTradingDashboard } from '../components/DemoTradingDashboard';
import { BotStatus } from '../components/BotStatus';
import { AddSnipeForm } from '../components/AddSnipeForm';
import { SnipeConfigCard } from '../components/SnipeConfigCard';
import { TransactionHistory } from '../components/TransactionHistory';
import { TestnetPanel } from '../components/TestnetPanel';
import { LiveMarketData } from '../components/LiveMarketData';
import { GuidedTour } from '../components/GuidedTour';
import { TransactionQueueStatus } from '../components/TransactionQueueStatus';
import { DynamicBackground } from '../components/DynamicBackground';
import { ParallaxElements } from '../components/ParallaxElements';
import { LiveVisualEffects } from '../components/LiveVisualEffects';
import { useRealMetaMask } from '../hooks/useRealMetaMask';
import { useTrading } from '../hooks/useTrading';
import { Button } from '../components/ui/button';
import { Zap, Shield, TrendingUp } from 'lucide-react';

interface HomeProps {
  userId?: string;
}

export default function Home({ userId }: HomeProps = {}) {
  const { isConnected } = useRealMetaMask();
  const {
    snipeConfigs,
    transactions,
    marketData,
    botStatus,
    addSnipeConfig,
    updateSnipeConfig,
    removeSnipeConfig,
    startBot,
    stopBot,
    addDemoData,
  } = useTrading();

  return (
    <div className="min-h-screen relative bg-transparent">
      <DynamicBackground />
      <ParallaxElements />
      <LiveVisualEffects marketTrend="up" intensity={0.7} />
      {/* Header */}
      <div className="border-b border-slate-800/50 bg-slate-900/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white">CryptoSniper Pro</h1>
                <p className="text-slate-400 text-sm lg:text-base">Advanced Ethereum Sniping Bot</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Shield className="h-4 w-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <TrendingUp className="h-4 w-4" />
                <span>Real-time</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative bg-transparent">


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Wallet & Bot Status */}
          <div className="space-y-6">
            <div className="wallet-connection">
              <RealWalletConnection />
            </div>
            
            {isConnected && (
              <div className="bot-status">
                <BotStatus
                  status={botStatus}
                  onStart={startBot}
                  onStop={stopBot}
                />
              </div>
            )}

            <div className="testnet-panel">
              <TestnetPanel />
            </div>
          </div>

          {/* Middle Column - Snipe Configurations */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Snipe Targets</h2>
              <div className="flex items-center gap-3">
                {snipeConfigs.length === 0 && (
                  <Button
                    onClick={addDemoData}
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                  >
                    Load Demo Data
                  </Button>
                )}
                <div className="text-sm text-slate-400">
                  {snipeConfigs.length} configured
                </div>
              </div>
            </div>

            {isConnected && (
              <div className="add-snipe-form">
                <AddSnipeForm onAdd={addSnipeConfig} />
              </div>
            )}

            <div className="space-y-4">
              {snipeConfigs.map((config) => (
                <SnipeConfigCard
                  key={config.id}
                  config={config}
                  marketData={marketData.get(config.tokenAddress)}
                  onUpdate={updateSnipeConfig}
                  onRemove={removeSnipeConfig}
                />
              ))}
            </div>

            {snipeConfigs.length === 0 && isConnected && (
              <div className="text-center py-12 text-slate-400">
                <Zap className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-semibold mb-2">No Snipe Targets</h3>
                <p className="text-sm">Add your first token to start sniping</p>
              </div>
            )}
          </div>

          {/* Right Column - Market Data & Transaction History */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Market & Activity</h2>
            <div className="market-data">
              <LiveMarketData />
            </div>
            <TransactionQueueStatus />
            <TransactionHistory transactions={transactions} />
          </div>
        </div>

        {/* Welcome Message for Non-Connected Users */}
        {!isConnected && (
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <div className="p-4 bg-blue-600/60 backdrop-blur-sm rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Welcome to CryptoSniper Pro
              </h2>
              <p className="text-xl text-slate-400 mb-8">
                Advanced Ethereum sniping bot with real-time monitoring and automated trading
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/30">
                  <Shield className="h-8 w-8 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Secure</h3>
                  <p className="text-slate-400 text-sm">Non-custodial. Your keys, your crypto.</p>
                </div>
                <div className="p-6 bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/30">
                  <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Fast</h3>
                  <p className="text-slate-400 text-sm">Lightning-fast execution with MEV protection.</p>
                </div>
                <div className="p-6 bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/30">
                  <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Smart</h3>
                  <p className="text-slate-400 text-sm">Advanced algorithms for optimal timing.</p>
                </div>
              </div>
              <p className="text-slate-400">
                Connect your MetaMask wallet to get started
              </p>
            </div>
          </div>
        )}
      </div>
      
      <GuidedTour />
    </div>
  );
}
