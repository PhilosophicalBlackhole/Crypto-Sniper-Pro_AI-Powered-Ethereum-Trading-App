/**
 * Home (Trading Dashboard)
 * - Market Overview: high-level status and market metrics only (no snipe settings in Overview)
 * - Testnet: safe practice panel
 * - Mainnet: live trading controls (snipe settings)
 * - History: full transaction history
 */

import React, { useEffect, useState } from 'react';
import { MultiWalletConnection } from '../components/MultiWalletConnection';
import { TestnetPanel } from '../components/TestnetPanel';
import { BotStatus } from '../components/BotStatus';
import { AddSnipeForm } from '../components/AddSnipeForm';
import { SnipeConfigCard } from '../components/SnipeConfigCard';
import { TransactionHistory } from '../components/TransactionHistory';
import { LiveMarketData } from '../components/LiveMarketData';
import { GasStatus } from '../components/GasStatus';
import { useTrading } from '../hooks/useTrading';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { RealWalletConnection } from '../components/RealWalletConnection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import NetworkStatusBar from '../components/NetworkStatusBar';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { QuickGlance } from '../components/QuickGlance';
import PerformanceWidget from '../components/PerformanceWidget';
import { MarketChart } from '../components/MarketChart';

interface HomeProps {
  /** Optional authenticated user id (used when logged in) */
  userId?: string;
}

/**
 * Home component - full trading dashboard with tabs and network-aware styling
 */
export default function Home({ userId }: HomeProps) {
  // Trading state and actions
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
  } = useTrading(userId);

  // Initial UX demo data
  useEffect(() => {
    if (snipeConfigs.length === 0) {
      addDemoData();
    }
  }, [snipeConfigs.length, addDemoData]);

  // Network status and switch action
  const { chainId, isMainnet, networkName, isDetecting, switchToMainnet } = useNetworkStatus();

  // Visual background based on network
  const bgGradient = isMainnet
    ? 'from-emerald-950 via-slate-900 to-emerald-950'
    : 'from-indigo-950 via-slate-900 to-indigo-950';

  // Tab state (persist per session)
  const [tab, setTab] = useState<string>(() => sessionStorage.getItem('dashboard_tab') || 'overview');
  useEffect(() => {
    sessionStorage.setItem('dashboard_tab', tab);
  }, [tab]);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} p-6 transition-colors`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
            CryptoSniper Pro
          </h1>
          <p className="text-slate-300 mt-1">
            Advanced Ethereum Trading Dashboard
          </p>
        </div>

        {/* Network Status + Switch to Mainnet prompt */}
        <NetworkStatusBar
          isMainnet={isMainnet}
          networkName={networkName}
          isDetecting={isDetecting}
          onSwitchToMainnet={switchToMainnet}
        />

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          {/* Lighten the tabs container for better background visibility */}
          <TabsList className="w-full flex flex-wrap gap-2 bg-slate-900/20 border border-slate-700/20 p-2 rounded-lg">
            <TabsTrigger
              value="overview"
              className="px-4 py-2 text-slate-300 data-[state=active]:bg-slate-800 data-[state=active]:text-white rounded-md"
            >
              MARKET OVERVIEW
            </TabsTrigger>
            <TabsTrigger
              value="testnet"
              className="px-4 py-2 text-slate-300 data-[state=active]:bg-slate-800 data-[state=active]:text-white rounded-md"
            >
              TESTNET
            </TabsTrigger>
            <TabsTrigger
              value="mainnet"
              className="px-4 py-2 text-slate-300 data-[state=active]:bg-slate-800 data-[state=active]:text-white rounded-md"
            >
              MAINNET
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="px-4 py-2 text-slate-300 data-[state=active]:bg-slate-800 data-[state=active]:text-white rounded-md"
            >
              TRADE HISTORY
            </TabsTrigger>
          </TabsList>

          {/* MARKET OVERVIEW: high-level only */}
          {/* data-glass="light" scopes translucent overrides so the carousel remains visible */}
          <TabsContent value="overview" className="mt-6 space-y-6" data-glass="light">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-6">
                {/* Wallet */}
                <MultiWalletConnection />
                {/* Gas (kept only in Overview and Testnet) */}
                <GasStatus />
              </div>

              {/* Bot status + Performance widget */}
              <div className="space-y-6">
                <BotStatus status={botStatus} onStart={startBot} onStop={stopBot} isMainnet={isMainnet} />
                <PerformanceWidget
                  transactions={transactions}
                  onOpenHistory={() => setTab('history')}
                />
              </div>

              {/* Live market data + Price Chart with P&L strip */}
              <div className="space-y-6">
                <LiveMarketData />
                {/* Wire P&L in ETH; MarketChart will derive USD automatically for Ethereum */}
                <MarketChart pnlEth={botStatus.totalProfit} />
              </div>
            </div>

            {/* Guidance banner: direct users to Mainnet / History tabs */}
            <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="text-slate-300 text-sm">
                Manage Snipe Targets and Transaction Queue in the Mainnet tab. View the full ledger in Trade History.
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setTab('mainnet')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Open Mainnet
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setTab('history')}
                  className="bg-transparent border-slate-600 text-slate-300 hover:text-white"
                >
                  View History
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TESTNET */}
          <TabsContent value="testnet" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-6">
                <MultiWalletConnection />
                <GasStatus />
              </div>
              <div className="lg:col-span-2">
                <TestnetPanel />
              </div>
            </div>

            {/* Quick Glance - non-sticky on Testnet to avoid overlap */}
            <QuickGlance
              botStatus={botStatus}
              isMainnet={isMainnet}
              networkName={networkName}
              sticky={false}
              closeOnScroll={true}
            />
          </TabsContent>

          {/* MAINNET */}
          <TabsContent value="mainnet" className="relative mt-6 space-y-6">
            {/* Corner ribbon indicating testnet when user is not on mainnet */}
            {!isMainnet && (
              <div className="pointer-events-none absolute -top-2 -right-10 rotate-45 z-10">
                <div className="bg-amber-600 text-white text-xs font-semibold px-10 py-1 shadow-lg tracking-wider">
                  TESTNET
                </div>
              </div>
            )}

            {/* Compact inline alert for easy switching */}
            {!isMainnet && (
              <div className="flex items-center justify-between p-3 bg-amber-900/20 border border-amber-500/40 rounded-lg">
                <div className="flex items-center gap-2 text-amber-300 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>You are on {networkName || 'a test network'}. Switch to Ethereum Mainnet to enable live trading controls.</span>
                </div>
                <Button
                  variant="outline"
                  onClick={switchToMainnet}
                  className="bg-transparent border-emerald-500 text-emerald-300 hover:bg-emerald-600/10"
                >
                  Switch to Mainnet
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-6">
                {/* Real wallet connection with inline switch to mainnet */}
                <RealWalletConnection />
                {/* GasStatus removed from Mainnet to avoid duplication */}
              </div>

              {/* Bot status + Performance widget */}
              <div className="space-y-6">
                <BotStatus status={botStatus} onStart={startBot} onStop={stopBot} isMainnet={isMainnet} />
                <PerformanceWidget
                  transactions={transactions}
                  onOpenHistory={() => setTab('history')}
                />
              </div>

              {/* Market Overview CTA + Price Chart with P&L */}
              <div className="space-y-6">
                <Card className="bg-slate-900/20 backdrop-blur-sm border-slate-700/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <TrendingUp className="h-5 w-5" />
                      Market Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-slate-300 text-sm">
                        The Market Overview is available in the MARKET OVERVIEW tab. Use the top ticker for a quick glance.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setTab('overview')}
                        className="bg-transparent border-slate-600 text-slate-300 hover:text-white"
                      >
                        Open Market Overview
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Wire P&L in ETH; MarketChart will derive USD automatically for Ethereum */}
                <MarketChart pnlEth={botStatus.totalProfit} />
              </div>
            </div>

            {/* Quick Glance - minimal KPIs for Mainnet (sticky with preferences) */}
            <QuickGlance
              botStatus={botStatus}
              isMainnet={isMainnet}
              networkName={networkName}
              sticky
              offsetTopPx={16}
              closeOnScroll={true}
            />

            {/* Snipe configs (kept on Mainnet) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <AddSnipeForm onAdd={addSnipeConfig} />
              </div>
              <div className="lg:col-span-2 space-y-6">
                {snipeConfigs.length === 0 ? (
                  <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-6 text-center text-slate-400">
                    No snipe targets yet. Create one to start monitoring opportunities.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                )}
              </div>
            </div>
          </TabsContent>

          {/* TRADE HISTORY */}
          <TabsContent value="history" className="mt-6">
            <TransactionHistory
              transactions={transactions}
              userId={userId}
              showPagination={false}
              maxDisplayed={25}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
