/**
 * Real Trading Dashboard Component
 * Professional trading interface with real functionality
 */
import { MarketGauge } from './MarketGauge';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Target, 
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useRealMetaMask } from '../hooks/useRealMetaMask';
import { createSnipeEngineService, SnipeEngineService } from '../services/snipeEngine';

interface SnipeConfig {
  id: string;
  tokenAddress: string;
  symbol: string;
  targetPrice: number;
  amount: string;
  slippage: number;
  gasPrice: string;
  maxGasPrice: string;
  isActive: boolean;
  strategy: 'buy' | 'sell' | 'both';
  conditions: Array<{
    type: 'price' | 'volume' | 'liquidity' | 'holders';
    operator: '>' | '<' | '=' | '>=' | '<=';
    value: number;
  }>;
  createdAt: number;
}

interface SnipeExecution {
  id: string;
  snipeId: string;
  tokenAddress: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: string;
  price: number;
  txHash: string;
  gasUsed: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  error?: string;
}

/**
 * Real Trading Dashboard with automated sniping capabilities
 */
export function RealTradingDashboard() {
  const { provider, address, isConnected } = useRealMetaMask();
  const [snipeEngine, setSnipeEngine] = useState<SnipeEngineService | null>(null);
  const [isEngineRunning, setIsEngineRunning] = useState(false);
  const [snipeConfigs, setSnipeConfigs] = useState<SnipeConfig[]>([]);
  const [executedTrades, setExecutedTrades] = useState<SnipeExecution[]>([]);
  const [showAddSnipe, setShowAddSnipe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New snipe form state
  const [newSnipe, setNewSnipe] = useState({
    tokenAddress: '',
    symbol: '',
    targetPrice: '',
    amount: '',
    slippage: '1',
    gasPrice: '20',
    maxGasPrice: '100',
    strategy: 'buy' as 'buy' | 'sell' | 'both'
  });

  // Initialize snipe engine
  useEffect(() => {
    if (isConnected && provider && address) {
      try {
        const engine = createSnipeEngineService(provider, provider, {
          maxConcurrentTrades: 5,
          defaultSlippage: 1,
          gasMultiplier: 1.2,
          monitoringInterval: 5000
        });
        setSnipeEngine(engine);
      } catch (error) {
        console.error('Failed to initialize snipe engine:', error);
        setError('Failed to initialize trading engine');
      }
    }
  }, [isConnected, provider, address]);

  // Update data periodically
  useEffect(() => {
    if (!snipeEngine) return;

    const interval = setInterval(() => {
      setSnipeConfigs(snipeEngine.getAllSnipeConfigs());
      setExecutedTrades(snipeEngine.getExecutedTrades());
    }, 2000);

    return () => clearInterval(interval);
  }, [snipeEngine]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!snipeEngine) return { totalTrades: 0, successfulTrades: 0, failedTrades: 0, totalVolume: 0, successRate: 0 };
    return snipeEngine.getTradeStats();
  }, [snipeEngine, executedTrades]);

  /**
   * Start/Stop snipe engine
   */
  const toggleEngine = () => {
    if (!snipeEngine) return;

    if (isEngineRunning) {
      snipeEngine.stopEngine();
      setIsEngineRunning(false);
      setSuccess('Snipe engine stopped');
    } else {
      snipeEngine.startEngine();
      setIsEngineRunning(true);
      setSuccess('Snipe engine started');
    }
  };

  /**
   * Add new snipe configuration
   */
  const handleAddSnipe = async () => {
    if (!snipeEngine) return;

    try {
      setError(null);
      
      const config = {
        tokenAddress: newSnipe.tokenAddress,
        symbol: newSnipe.symbol || 'UNKNOWN',
        targetPrice: parseFloat(newSnipe.targetPrice),
        amount: newSnipe.amount,
        slippage: parseFloat(newSnipe.slippage),
        gasPrice: newSnipe.gasPrice,
        maxGasPrice: newSnipe.maxGasPrice,
        isActive: true,
        strategy: newSnipe.strategy,
        conditions: []
      };

      await snipeEngine.addSnipeConfig(config);
      setSnipeConfigs(snipeEngine.getAllSnipeConfigs());
      setShowAddSnipe(false);
      setNewSnipe({
        tokenAddress: '',
        symbol: '',
        targetPrice: '',
        amount: '',
        slippage: '1',
        gasPrice: '20',
        maxGasPrice: '100',
        strategy: 'buy'
      });
      setSuccess('Snipe configuration added successfully');
    } catch (error: any) {
      setError(error.message || 'Failed to add snipe configuration');
    }
  };

  /**
   * Remove snipe configuration
   */
  const handleRemoveSnipe = (snipeId: string) => {
    if (!snipeEngine) return;
    
    snipeEngine.removeSnipeConfig(snipeId);
    setSnipeConfigs(snipeEngine.getAllSnipeConfigs());
    setSuccess('Snipe configuration removed');
  };

  /**
   * Toggle snipe configuration
   */
  const handleToggleSnipe = (snipeId: string) => {
    if (!snipeEngine) return;
    
    snipeEngine.toggleSnipeConfig(snipeId);
    setSnipeConfigs(snipeEngine.getAllSnipeConfigs());
  };

  /**
   * Format price for display
   */
  const formatPrice = (price: number): string => {
    return price < 1 ? price.toFixed(6) : price.toFixed(2);
  };

  /**
   * Format timestamp
   */
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-slate-400">Please connect your MetaMask wallet to access trading features</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <Alert className="border-red-500/50 bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500/50 bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-400">{success}</AlertDescription>
        </Alert>
      )}

      {/* Engine Status */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Snipe Engine
              </CardTitle>
              <CardDescription>
                Status: {isEngineRunning ? 'Running' : 'Stopped'}
              </CardDescription>
            </div>
            <Button
              onClick={toggleEngine}
              variant={isEngineRunning ? 'destructive' : 'default'}
              className="flex items-center gap-2"
            >
              {isEngineRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isEngineRunning ? 'Stop' : 'Start'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalTrades}</div>
              <div className="text-sm text-slate-400">Total Trades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.successfulTrades}</div>
              <div className="text-sm text-slate-400">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{stats.failedTrades}</div>
              <div className="text-sm text-slate-400">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.successRate.toFixed(1)}%</div>
              <div className="text-sm text-slate-400">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Trading Interface */}
      <Tabs defaultValue="snipes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="snipes">Snipe Configs</TabsTrigger>
          <TabsTrigger value="history">Trade History</TabsTrigger>
        </TabsList>

        <TabsContent value="snipes" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Snipe Configurations</CardTitle>
                <Button
                  onClick={() => setShowAddSnipe(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Snipe
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {snipeConfigs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">No snipe configurations yet</p>
                  <p className="text-slate-500 text-sm mt-2">Add your first snipe to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {snipeConfigs.map((config) => (
                    <div
                      key={config.id}
                      className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-white font-medium">{config.symbol}</div>
                          <div className="text-slate-400 text-sm">{config.tokenAddress.slice(0, 10)}...</div>
                        </div>
                        <div>
                          <div className="text-white">${formatPrice(config.targetPrice)}</div>
                          <div className="text-slate-400 text-sm">{config.amount} ETH</div>
                        </div>
                        <Badge variant={config.isActive ? 'default' : 'secondary'}>
                          {config.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="text-slate-300">
                          {config.strategy}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleSnipe(config.id)}
                          className="bg-transparent"
                        >
                          {config.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveSnipe(config.id)}
                          className="bg-transparent text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Snipe Form */}
          {showAddSnipe && (
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Add New Snipe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tokenAddress" className="text-slate-300">Token Address</Label>
                    <Input
                      id="tokenAddress"
                      value={newSnipe.tokenAddress}
                      onChange={(e) => setNewSnipe({ ...newSnipe, tokenAddress: e.target.value })}
                      placeholder="0x..."
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="symbol" className="text-slate-300">Symbol</Label>
                    <Input
                      id="symbol"
                      value={newSnipe.symbol}
                      onChange={(e) => setNewSnipe({ ...newSnipe, symbol: e.target.value })}
                      placeholder="TOKEN"
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="targetPrice" className="text-slate-300">Target Price ($)</Label>
                    <Input
                      id="targetPrice"
                      type="number"
                      value={newSnipe.targetPrice}
                      onChange={(e) => setNewSnipe({ ...newSnipe, targetPrice: e.target.value })}
                      placeholder="0.00"
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount" className="text-slate-300">Amount (ETH)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newSnipe.amount}
                      onChange={(e) => setNewSnipe({ ...newSnipe, amount: e.target.value })}
                      placeholder="0.1"
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slippage" className="text-slate-300">Slippage (%)</Label>
                    <Input
                      id="slippage"
                      type="number"
                      value={newSnipe.slippage}
                      onChange={(e) => setNewSnipe({ ...newSnipe, slippage: e.target.value })}
                      placeholder="1"
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="strategy" className="text-slate-300">Strategy</Label>
                  <Select value={newSnipe.strategy} onValueChange={(value) => setNewSnipe({ ...newSnipe, strategy: value as 'buy' | 'sell' | 'both' })}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddSnipe(false)}
                    className="bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddSnipe}>
                    Add Snipe
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Trade History</CardTitle>
            </CardHeader>
            <CardContent>
              {executedTrades.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">No trades executed yet</p>
                  <p className="text-slate-500 text-sm mt-2">Your trading history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {executedTrades.map((trade) => (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {trade.status === 'success' ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : trade.status === 'failed' ? (
                            <XCircle className="h-5 w-5 text-red-400" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-400" />
                          )}
                          <div>
                            <div className="text-white font-medium">{trade.symbol}</div>
                            <div className="text-slate-400 text-sm">{formatTime(trade.timestamp)}</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-white">{trade.type.toUpperCase()}</div>
                          <div className="text-slate-400 text-sm">{trade.amount} ETH</div>
                        </div>
                        <div>
                          <div className="text-white">${formatPrice(trade.price)}</div>
                          <div className="text-slate-400 text-sm">Price</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={trade.status === 'success' ? 'default' : trade.status === 'failed' ? 'destructive' : 'secondary'}>
                          {trade.status}
                        </Badge>
                        {trade.txHash && (
                          <div className="text-slate-400 text-sm mt-1">
                            <a
                              href={`https://etherscan.io/tx/${trade.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-400"
                            >
                              View on Etherscan
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
