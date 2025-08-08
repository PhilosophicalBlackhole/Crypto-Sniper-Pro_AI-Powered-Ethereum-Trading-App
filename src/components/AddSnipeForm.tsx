/**
 * Form component for adding new snipe configurations
 */

import React, { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { HelpTooltip } from './HelpTooltip';
import { SnipeConfig } from '../types/trading';

interface AddSnipeFormProps {
  onAdd: (config: Omit<SnipeConfig, 'id'>) => void;
}

export function AddSnipeForm({ onAdd }: AddSnipeFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    tokenAddress: '',
    targetPrice: 0.001,
    maxPrice: 0.002,
    amount: 0.05,
    slippage: 12,
    gasPrice: 25,
    maxGas: 300000,
    enabled: false,
    gasSettings: {
      mode: 'auto' as const,
      maxGasPrice: 100,
      priorityFee: 2,
      executionTimeout: 120,
      retryCount: 3,
    },
    slippageSettings: {
      mode: 'adaptive' as const,
      baseSlippage: 10,
      maxSlippage: 25,
      liquidityThreshold: 100000,
      volatilityMultiplier: 1.5,
    },
    autoSell: {
      enabled: false,
      profitTarget: 50,
      stopLoss: -20,
      trailingStop: {
        enabled: false,
        percentage: 5,
        activationPrice: 20,
      },
      partialSelling: {
        enabled: false,
        percentages: [25, 50],
        priceTargets: [20, 50],
      },
    },
    batchSettings: {
      enabled: false,
      maxBatchSize: 3,
      batchDelay: 200,
      nonceManagement: 'auto' as const,
      priority: 5,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tokenAddress || !formData.tokenAddress.startsWith('0x')) {
      alert('Please enter a valid token address');
      return;
    }

    onAdd(formData);
    setFormData({
      tokenAddress: '',
      targetPrice: 0.001,
      maxPrice: 0.002,
      amount: 0.05,
      slippage: 12,
      gasPrice: 25,
      maxGas: 300000,
      enabled: false,
      gasSettings: {
        mode: 'auto' as const,
        maxGasPrice: 100,
        priorityFee: 2,
        executionTimeout: 120,
        retryCount: 3,
      },
      slippageSettings: {
        mode: 'adaptive' as const,
        baseSlippage: 10,
        maxSlippage: 25,
        liquidityThreshold: 100000,
        volatilityMultiplier: 1.5,
      },
      autoSell: {
        enabled: false,
        profitTarget: 50,
        stopLoss: -20,
        trailingStop: {
          enabled: false,
          percentage: 5,
          activationPrice: 20,
        },
        partialSelling: {
          enabled: false,
          percentages: [25, 50],
          priceTargets: [20, 50],
        },
      },
      batchSettings: {
        enabled: false,
        maxBatchSize: 3,
        batchDelay: 200,
        nonceManagement: 'auto' as const,
        priority: 5,
      },
    });
    setIsOpen(false);
  };

  const validateAddress = (address: string) => {
    return address.startsWith('0x') && address.length === 42;
  };

  if (!isOpen) {
    return (
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/50 border-dashed border-2">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <div className="p-3 bg-blue-600 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Add Snipe Target</h3>
              <p className="text-slate-400 text-sm">Configure a token to monitor and snipe</p>
            </div>
            <Button
              onClick={() => setIsOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
            >
              <Target className="h-4 w-4 mr-2" />
              Create New Target
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/30 backdrop-blur-sm border-slate-700/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Target className="h-5 w-5" />
          New Snipe Configuration
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tokenAddress" className="text-slate-300">Token Address *</Label>
            <Input
              id="tokenAddress"
              type="text"
              placeholder="0x..."
              value={formData.tokenAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, tokenAddress: e.target.value }))}
              className={`bg-slate-800 border-slate-600 text-white ${
                formData.tokenAddress && !validateAddress(formData.tokenAddress) 
                  ? 'border-red-500' 
                  : ''
              }`}
              required
            />
            {formData.tokenAddress && !validateAddress(formData.tokenAddress) && (
              <p className="text-red-400 text-xs mt-1">Please enter a valid Ethereum address</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="targetPrice" className="text-slate-300">Target Price (USD)</Label>
              <Input
                id="targetPrice"
                type="number"
                step="0.00000001"
                value={formData.targetPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, targetPrice: parseFloat(e.target.value) }))}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="maxPrice" className="text-slate-300">Max Price (USD)</Label>
              <Input
                id="maxPrice"
                type="number"
                step="0.00000001"
                value={formData.maxPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, maxPrice: parseFloat(e.target.value) }))}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount" className="text-slate-300">Amount (ETH)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="slippage" className="text-slate-300">Slippage (%)</Label>
              <Input
                id="slippage"
                type="number"
                step="0.1"
                min="0.1"
                max="50"
                value={formData.slippage}
                onChange={(e) => setFormData(prev => ({ ...prev, slippage: parseFloat(e.target.value) }))}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gasPrice" className="text-slate-300">Gas Price (GWEI)</Label>
              <Input
                id="gasPrice"
                type="number"
                step="1"
                min="1"
                value={formData.gasPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, gasPrice: parseFloat(e.target.value) }))}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="maxGas" className="text-slate-300">Max Gas Limit</Label>
              <Input
                id="maxGas"
                type="number"
                step="1000"
                min="21000"
                value={formData.maxGas}
                onChange={(e) => setFormData(prev => ({ ...prev, maxGas: parseInt(e.target.value) }))}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-3 p-4 bg-slate-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <Switch
                id="autoSellEnabled"
                checked={formData.autoSell.enabled}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    autoSell: { ...prev.autoSell, enabled: checked }
                  }))
                }
              />
              <Label htmlFor="autoSellEnabled" className="text-slate-300">Enable Auto-Sell</Label>
            </div>
            
            {formData.autoSell.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profitTarget" className="text-slate-300">Profit Target (%)</Label>
                  <Input
                    id="profitTarget"
                    type="number"
                    step="1"
                    value={formData.autoSell.profitTarget}
                    onChange={(e) => 
                      setFormData(prev => ({ 
                        ...prev, 
                        autoSell: { ...prev.autoSell, profitTarget: parseFloat(e.target.value) }
                      }))
                    }
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="stopLoss" className="text-slate-300">Stop Loss (%)</Label>
                  <Input
                    id="stopLoss"
                    type="number"
                    step="1"
                    value={formData.autoSell.stopLoss}
                    onChange={(e) => 
                      setFormData(prev => ({ 
                        ...prev, 
                        autoSell: { ...prev.autoSell, stopLoss: parseFloat(e.target.value) }
                      }))
                    }
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
            />
            <Label htmlFor="enabled" className="text-slate-300">Start Sniping Immediately</Label>
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!validateAddress(formData.tokenAddress)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Snipe Target
            </Button>
            <Button 
              type="button" 
              onClick={() => setIsOpen(false)}
              variant="outline" 
              className="border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
