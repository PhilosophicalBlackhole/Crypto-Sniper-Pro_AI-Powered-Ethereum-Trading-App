/**
 * Demo Trading Dashboard Component
 * Simulated trading interface for new visitors
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Play, Square, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';

interface DemoSnipe {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  buyPrice: number;
  sellPrice: number;
  currentPrice: number;
  status: 'monitoring' | 'executed' | 'failed';
  profit?: number;
}

/**
 * Demo trading dashboard with simulated data
 * Provides educational experience without real trading
 */
export function DemoTradingDashboard() {
  const [isEngineRunning, setIsEngineRunning] = useState(false);
  const [demoSnipes, setDemoSnipes] = useState<DemoSnipe[]>([
    {
      id: '1',
      tokenAddress: '0x1234...5678',
      tokenSymbol: 'DEMO',
      buyPrice: 0.001,
      sellPrice: 0.002,
      currentPrice: 0.0015,
      status: 'monitoring',
    },
    {
      id: '2',
      tokenAddress: '0x9876...5432',
      tokenSymbol: 'TEST',
      buyPrice: 0.0005,
      sellPrice: 0.001,
      currentPrice: 0.00075,
      status: 'executed',
      profit: 0.25,
    },
  ]);

  const [demoTrades] = useState([
    {
      id: '1',
      type: 'BUY',
      token: 'DEMO',
      amount: '1000',
      price: '0.001',
      timestamp: '2 minutes ago',
      status: 'Success',
      profit: '+$50',
    },
    {
      id: '2',
      type: 'SELL',
      token: 'TEST',
      amount: '500',
      price: '0.001',
      timestamp: '5 minutes ago',
      status: 'Success',
      profit: '+$25',
    },
  ]);

  /**
   * Simulate price updates for demo tokens
   */
  useEffect(() => {
    if (!isEngineRunning) return;

    const interval = setInterval(() => {
      setDemoSnipes(prev => prev.map(snipe => ({
        ...snipe,
        currentPrice: snipe.currentPrice + (Math.random() - 0.5) * 0.0001,
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, [isEngineRunning]);

  const handleStartEngine = () => {
    setIsEngineRunning(true);
  };

  const handleStopEngine = () => {
    setIsEngineRunning(false);
  };

  const handleUpgrade = () => {
    // This would trigger the upgrade modal
    alert('Upgrade to Pro to access real trading features!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Demo Warning Banner */}
        <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div>
              <h3 className="text-yellow-400 font-semibold">Demo Mode</h3>
              <p className="text-yellow-300 text-sm">
                This is a simulation. No real trades are executed. 
                <button 
                  onClick={handleUpgrade}
                  className="ml-2 text-yellow-400 hover:text-yellow-300 underline"
                >
                  Upgrade to Pro
                </button> 
                for real trading.
              </p>
            </div>
          </div>
        </div>

        {/* Engine Controls */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Demo Snipe Engine</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleStartEngine}
                disabled={isEngineRunning}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Engine
              </Button>
              <Button
                onClick={handleStopEngine}
                disabled={!isEngineRunning}
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Engine
              </Button>
              <Badge variant={isEngineRunning ? "default" : "secondary"}>
                {isEngineRunning ? 'Running' : 'Stopped'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Active Snipes */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Active Demo Snipes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoSnipes.map(snipe => (
                  <div key={snipe.id} className="border border-slate-600 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-white font-semibold">{snipe.tokenSymbol}</h4>
                        <p className="text-slate-400 text-sm">{snipe.tokenAddress}</p>
                      </div>
                      <Badge variant={snipe.status === 'executed' ? 'default' : 'secondary'}>
                        {snipe.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-slate-400">Buy:</span>
                        <p className="text-green-400">${snipe.buyPrice.toFixed(4)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Sell:</span>
                        <p className="text-red-400">${snipe.sellPrice.toFixed(4)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Current:</span>
                        <p className="text-white">${snipe.currentPrice.toFixed(4)}</p>
                      </div>
                    </div>
                    {snipe.profit && (
                      <div className="mt-2 pt-2 border-t border-slate-600">
                        <span className="text-green-400 text-sm">
                          Profit: +${snipe.profit.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={handleUpgrade}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
              >
                Add New Snipe (Pro Feature)
              </Button>
            </CardContent>
          </Card>

          {/* Demo Transaction History */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Demo Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {demoTrades.map(trade => (
                  <div key={trade.id} className="border border-slate-600 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={trade.type === 'BUY' ? 'default' : 'secondary'}>
                            {trade.type}
                          </Badge>
                          <span className="text-white font-medium">{trade.token}</span>
                        </div>
                        <div className="text-sm text-slate-400 mt-1">
                          {trade.amount} @ ${trade.price}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-semibold">{trade.profit}</div>
                        <div className="text-slate-400 text-sm">{trade.timestamp}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Demo Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-slate-400 text-sm">Demo Profits</p>
                  <p className="text-2xl font-bold text-green-400">+$125.50</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-slate-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-blue-400">87%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="text-slate-400 text-sm">Active Snipes</p>
                  <p className="text-2xl font-bold text-yellow-400">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade CTA */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-600">
          <CardContent className="p-6 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Ready for Real Trading?</h3>
            <p className="text-purple-200 mb-4">
              Upgrade to Pro and start making real profits with automated crypto sniping
            </p>
            <Button 
              onClick={handleUpgrade}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
            >
              Upgrade to Pro - $49/month
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
