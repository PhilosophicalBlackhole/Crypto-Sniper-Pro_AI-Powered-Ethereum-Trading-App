/**
 * Advanced trading settings component with gas estimation, smart slippage, and batch configuration
 */

import React, { useState } from 'react';
import { Settings, Zap, Target, TrendingUp, Clock, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { HelpTooltip } from './HelpTooltip';
import { SnipeConfig } from '../types/trading';
import { useAdvancedTrading } from '../hooks/useAdvancedTrading';

interface AdvancedSettingsProps {
  config: SnipeConfig;
  onUpdate: (updates: Partial<SnipeConfig>) => void;
}

export function AdvancedSettings({ config, onUpdate }: AdvancedSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { gasEstimations, slippageCalculations, networkStats, estimateGas, calculateSmartSlippage } = useAdvancedTrading();

  const gasEstimation = gasEstimations.get(config.tokenAddress);
  const slippageCalc = slippageCalculations.get(config.tokenAddress);

  const handleGasSettingsChange = (field: string, value: any) => {
    onUpdate({
      gasSettings: {
        ...config.gasSettings,
        [field]: value,
      },
    });
  };

  const handleSlippageSettingsChange = (field: string, value: any) => {
    onUpdate({
      slippageSettings: {
        ...config.slippageSettings,
        [field]: value,
      },
    });
  };

  const handleAutoSellChange = (field: string, value: any) => {
    const currentAutoSell = config.autoSell || {
      enabled: false,
      profitTarget: 50,
      stopLoss: 20,
      trailingStop: { enabled: false, percentage: 5, activationPrice: 10 },
      partialSelling: { enabled: false, percentages: [25, 50], priceTargets: [20, 50] }
    };
    
    onUpdate({
      autoSell: {
        ...currentAutoSell,
        [field]: value,
      },
    });
  };

  const handleBatchSettingsChange = (field: string, value: any) => {
    onUpdate({
      batchSettings: {
        ...config.batchSettings,
        [field]: value,
      },
    });
  };

  const getCongestionColor = (congestion: string) => {
    switch (congestion) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
      >
        <Settings className="h-4 w-4 mr-2" />
        Advanced Settings
      </Button>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Trading Settings
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            Close
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs defaultValue="gas" className="w-full">
          <TabsList className="flex flex-col w-full bg-slate-800 h-auto p-2 gap-2">
            <TabsTrigger 
              value="gas" 
              className="w-full justify-start text-slate-300 text-sm px-4 py-3 rounded-md data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              Gas & Timing
            </TabsTrigger>
            <TabsTrigger 
              value="slippage" 
              className="w-full justify-start text-slate-300 text-sm px-4 py-3 rounded-md data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              Smart Slippage
            </TabsTrigger>
            <TabsTrigger 
              value="exit" 
              className="w-full justify-start text-slate-300 text-sm px-4 py-3 rounded-md data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              Exit Strategy
            </TabsTrigger>
            <TabsTrigger 
              value="batch" 
              className="w-full justify-start text-slate-300 text-sm px-4 py-3 rounded-md data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              Batch Trading
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gas" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-white font-medium">Network Status</span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={`${getCongestionColor(networkStats.networkCongestion)}`}>
                    {networkStats.networkCongestion.toUpperCase()}
                  </Badge>
                  <span className="text-slate-400 text-sm">
                    Base: {networkStats.baseFee.toFixed(1)} GWEI
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Label className="text-slate-300">Gas Mode</Label>
                    <HelpTooltip
                      title="Gas Price Mode"
                      content="Auto mode uses dynamic gas estimation based on network conditions. Manual mode uses your fixed settings."
                      size="md"
                    />
                  </div>
                  <Select
                    value={config.gasSettings.mode}
                    onValueChange={(value) => handleGasSettingsChange('mode', value)}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="auto">Auto (Recommended)</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Label className="text-slate-300">Max Gas Price</Label>
                    <HelpTooltip
                      title="Maximum Gas Price"
                      content="The highest gas price you're willing to pay. Protects against paying excessive fees during network congestion."
                      size="md"
                    />
                  </div>
                  <Input
                    type="number"
                    value={config.gasSettings.maxGasPrice}
                    onChange={(e) => handleGasSettingsChange('maxGasPrice', parseFloat(e.target.value))}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="GWEI"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Label className="text-slate-300">Priority Fee</Label>
                    <HelpTooltip
                      title="Priority Fee"
                      content="Extra fee to miners for faster transaction processing. Higher priority = faster execution."
                      size="md"
                    />
                  </div>
                  <Input
                    type="number"
                    value={config.gasSettings.priorityFee}
                    onChange={(e) => handleGasSettingsChange('priorityFee', parseFloat(e.target.value))}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="GWEI"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Label className="text-slate-300">Execution Timeout</Label>
                    <HelpTooltip
                      title="Execution Timeout"
                      content="Maximum time to wait for transaction confirmation before considering it failed and retrying."
                      size="md"
                    />
                  </div>
                  <Input
                    type="number"
                    value={config.gasSettings.executionTimeout}
                    onChange={(e) => handleGasSettingsChange('executionTimeout', parseInt(e.target.value))}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="Seconds"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Label className="text-slate-300">Retry Count</Label>
                  <HelpTooltip
                    title="Transaction Retries"
                    content="How many times to retry a failed transaction with higher gas prices. Increases success rate but costs more."
                    size="md"
                  />
                </div>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  value={config.gasSettings.retryCount}
                  onChange={(e) => handleGasSettingsChange('retryCount', parseInt(e.target.value))}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              {gasEstimation && (
                <div className="p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-400" />
                    <span className="text-white font-medium">Current Estimation</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Est. Cost:</span>
                      <div className="text-white font-semibold">{gasEstimation.estimatedCost.toFixed(6)} ETH</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Est. Time:</span>
                      <div className="text-white font-semibold">{gasEstimation.executionTime}s</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="slippage" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Label className="text-slate-300">Slippage Mode</Label>
                    <HelpTooltip
                      title="Slippage Mode"
                      content="Adaptive mode adjusts slippage based on market conditions. Fixed mode uses your set percentage."
                      size="md"
                    />
                  </div>
                  <Select
                    value={config.slippageSettings.mode}
                    onValueChange={(value) => handleSlippageSettingsChange('mode', value)}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="adaptive">Adaptive (Recommended)</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Label className="text-slate-300">Base Slippage</Label>
                    <HelpTooltip
                      title="Base Slippage"
                      content="Starting slippage percentage. Adaptive mode will adjust this based on market conditions."
                      size="md"
                    />
                  </div>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.slippageSettings.baseSlippage}
                    onChange={(e) => handleSlippageSettingsChange('baseSlippage', parseFloat(e.target.value))}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="%"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Label className="text-slate-300">Max Slippage</Label>
                    <HelpTooltip
                      title="Maximum Slippage"
                      content="Upper limit for slippage adjustment. Prevents excessive slippage during extreme market conditions."
                      size="md"
                    />
                  </div>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.slippageSettings.maxSlippage}
                    onChange={(e) => handleSlippageSettingsChange('maxSlippage', parseFloat(e.target.value))}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="%"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Label className="text-slate-300">Volatility Multiplier</Label>
                    <HelpTooltip
                      title="Volatility Multiplier"
                      content="Adjusts slippage based on price volatility. Higher values increase slippage during volatile periods."
                      size="md"
                    />
                  </div>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="5"
                    value={config.slippageSettings.volatilityMultiplier}
                    onChange={(e) => handleSlippageSettingsChange('volatilityMultiplier', parseFloat(e.target.value))}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>

              {slippageCalc && (
                <div className="p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-400" />
                    <span className="text-white font-medium">Smart Slippage Calculation</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Recommended:</span>
                      <div className="text-white font-semibold">{slippageCalc.recommendedSlippage.toFixed(2)}%</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Confidence:</span>
                      <div className="text-white font-semibold">{(slippageCalc.confidence * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="exit" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoSellEnabled"
                  checked={config.autoSell?.enabled || false}
                  onCheckedChange={(checked) => handleAutoSellChange('enabled', checked)}
                />
                <Label htmlFor="autoSellEnabled" className="text-slate-300">Enable Auto-Sell Strategy</Label>
              </div>

              {config.autoSell?.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <Label className="text-slate-300">Take Profit</Label>
                        <HelpTooltip
                          title="Take Profit Target"
                          content="Automatically sell when profit reaches this percentage. Secures gains during upward moves."
                          size="md"
                        />
                      </div>
                      <Input
                        type="number"
                        step="1"
                        value={config.autoSell?.profitTarget || 50}
                        onChange={(e) => handleAutoSellChange('profitTarget', parseFloat(e.target.value))}
                        className="bg-slate-800 border-slate-600 text-white"
                        placeholder="%"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <Label className="text-slate-300">Stop Loss</Label>
                        <HelpTooltip
                          title="Stop Loss Limit"
                          content="Automatically sell when loss reaches this percentage. Limits downside risk."
                          size="md"
                        />
                      </div>
                      <Input
                        type="number"
                        step="1"
                        value={config.autoSell?.stopLoss || 20}
                        onChange={(e) => handleAutoSellChange('stopLoss', parseFloat(e.target.value))}
                        className="bg-slate-800 border-slate-600 text-white"
                        placeholder="%"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <Switch
                        id="trailingStopEnabled"
                        checked={config.autoSell?.trailingStop?.enabled || false}
                        onCheckedChange={(checked) => 
                          handleAutoSellChange('trailingStop', { 
                            enabled: checked,
                            percentage: config.autoSell?.trailingStop?.percentage || 5,
                            activationPrice: config.autoSell?.trailingStop?.activationPrice || 10
                          })
                        }
                      />
                      <Label htmlFor="trailingStopEnabled" className="text-slate-300">Trailing Stop Loss</Label>
                      <HelpTooltip
                        title="Trailing Stop Loss"
                        content="Automatically adjusts stop loss as price moves in your favor. Locks in profits while allowing for continued upside."
                        size="md"
                      />
                    </div>

                    {config.autoSell?.trailingStop?.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-slate-300 text-sm">Trail Percentage</Label>
                          <Input
                            type="number"
                            step="0.5"
                            value={config.autoSell?.trailingStop?.percentage || 5}
                            onChange={(e) => 
                              handleAutoSellChange('trailingStop', { 
                                enabled: config.autoSell?.trailingStop?.enabled || false,
                                percentage: parseFloat(e.target.value),
                                activationPrice: config.autoSell?.trailingStop?.activationPrice || 10
                              })
                            }
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="%"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-300 text-sm">Activation Price</Label>
                          <Input
                            type="number"
                            step="1"
                            value={config.autoSell?.trailingStop?.activationPrice || 10}
                            onChange={(e) => 
                              handleAutoSellChange('trailingStop', { 
                                enabled: config.autoSell?.trailingStop?.enabled || false,
                                percentage: config.autoSell?.trailingStop?.percentage || 5,
                                activationPrice: parseFloat(e.target.value)
                              })
                            }
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="% profit"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <Switch
                        id="partialSellingEnabled"
                        checked={config.autoSell?.partialSelling?.enabled || false}
                        onCheckedChange={(checked) => 
                          handleAutoSellChange('partialSelling', { 
                            enabled: checked,
                            percentages: config.autoSell?.partialSelling?.percentages || [25, 50],
                            priceTargets: config.autoSell?.partialSelling?.priceTargets || [20, 50]
                          })
                        }
                      />
                      <Label htmlFor="partialSellingEnabled" className="text-slate-300">Partial Selling</Label>
                      <HelpTooltip
                        title="Partial Selling"
                        content="Sell portions of your position at different profit levels. Reduces risk while maintaining upside potential."
                        size="md"
                      />
                    </div>

                    {config.autoSell?.partialSelling?.enabled && (
                      <div className="space-y-2">
                        <div className="text-slate-400 text-sm">Sell 25% at 20% profit, 50% at 50% profit</div>
                        <div className="text-xs text-slate-500">Advanced partial selling configuration coming soon</div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="batch" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="batchEnabled"
                  checked={config.batchSettings.enabled}
                  onCheckedChange={(checked) => handleBatchSettingsChange('enabled', checked)}
                />
                <Label htmlFor="batchEnabled" className="text-slate-300">Enable Batch Trading</Label>
                <HelpTooltip
                  title="Batch Trading"
                  content="Process multiple trades in coordinated batches with optimized nonce management and gas prices."
                  size="md"
                />
              </div>

              {config.batchSettings.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <Label className="text-slate-300">Max Batch Size</Label>
                        <HelpTooltip
                          title="Maximum Batch Size"
                          content="Maximum number of transactions to process in a single batch. Larger batches may have higher failure rates."
                          size="md"
                        />
                      </div>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={config.batchSettings.maxBatchSize}
                        onChange={(e) => handleBatchSettingsChange('maxBatchSize', parseInt(e.target.value))}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <Label className="text-slate-300">Batch Delay</Label>
                        <HelpTooltip
                          title="Batch Delay"
                          content="Delay between transactions in a batch. Prevents nonce conflicts and reduces network stress."
                          size="md"
                        />
                      </div>
                      <Input
                        type="number"
                        min="100"
                        max="5000"
                        value={config.batchSettings.batchDelay}
                        onChange={(e) => handleBatchSettingsChange('batchDelay', parseInt(e.target.value))}
                        className="bg-slate-800 border-slate-600 text-white"
                        placeholder="ms"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <Label className="text-slate-300">Nonce Management</Label>
                        <HelpTooltip
                          title="Nonce Management"
                          content="Auto mode manages nonces automatically. Manual mode gives you control for complex strategies."
                          size="md"
                        />
                      </div>
                      <Select
                        value={config.batchSettings.nonceManagement}
                        onValueChange={(value) => handleBatchSettingsChange('nonceManagement', value)}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="auto">Auto (Recommended)</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <Label className="text-slate-300">Priority Level</Label>
                        <HelpTooltip
                          title="Priority Level"
                          content="Higher priority trades execute first in the batch queue. Use for time-sensitive opportunities."
                          size="md"
                        />
                      </div>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={config.batchSettings.priority}
                        onChange={(e) => handleBatchSettingsChange('priority', parseInt(e.target.value))}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-white font-medium">Batch Performance</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Success Rate:</span>
                        <div className="text-white font-semibold">94%</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Avg Time:</span>
                        <div className="text-white font-semibold">2.3s</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Gas Saved:</span>
                        <div className="text-white font-semibold">12%</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
