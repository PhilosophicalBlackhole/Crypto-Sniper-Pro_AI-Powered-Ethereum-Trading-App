/**
 * Individual snipe configuration card component
 * - Enforces RULE: Sell targets must be above buy target (in our model: profit/partial targets > 0%).
 * - Shows toast feedback on failed Start attempts instead of silently disabling.
 */

import React, { useState } from 'react';
import { Target, Settings, Trash2, Play, Pause, TrendingUp, TrendingDown, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { HelpTooltip } from './HelpTooltip';
import { AdvancedSettings } from './AdvancedSettings';
import { SavedConfigsManager } from './SavedConfigsManager';
import { SnipeConfig, MarketData } from '../types/trading';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { toast } from 'sonner';

interface SnipeConfigCardProps {
  /** Snipe config this card controls */
  config: SnipeConfig;
  /** Optional live market data for the token */
  marketData?: MarketData;
  /** Update handler for this config */
  onUpdate: (id: string, updates: Partial<SnipeConfig>) => void;
  /** Remove handler for this config */
  onRemove: (id: string) => void;
  /** Optional: move card up in the list */
  onMoveUp?: () => void;
  /** Optional: move card down in the list */
  onMoveDown?: () => void;
  /** Optional: whether the card can move up (disables control) */
  canMoveUp?: boolean;
  /** Optional: whether the card can move down (disables control) */
  canMoveDown?: boolean;
}

/**
 * Check SELL > BUY rule for a given config (percentage-based model)
 * - Auto-sell profitTarget must be > 0% when enabled.
 * - Partial selling priceTargets must all be > 0% when enabled.
 */
function checkSellTargetsRule(cfg: SnipeConfig): { ok: boolean; msg?: string } {
  const auto = cfg?.autoSell;
  if (!auto?.enabled) return { ok: true };
  if (typeof auto.profitTarget === 'number' && auto.profitTarget <= 0) {
    return { ok: false, msg: 'Profit target must be greater than 0% so sell price is above the buy price.' };
  }
  if (auto.partialSelling?.enabled) {
    const invalid = (auto.partialSelling.priceTargets || []).some((p) => typeof p === 'number' && p <= 0);
    if (invalid) {
      return { ok: false, msg: 'All partial sell price targets must be greater than 0%.' };
    }
  }
  return { ok: true };
}

/**
 * SnipeConfigCard - shows and edits one snipe configuration.
 * - Gated actions: Save and Start require Ethereum Mainnet. Pause is always allowed.
 * - Enforces SELL > BUY rule at enable/start time and during edit mode.
 * - Shows global toasts on invalid Start attempts for better UX.
 */
export function SnipeConfigCard({ config, marketData, onUpdate, onRemove, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: SnipeConfigCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editConfig, setEditConfig] = useState(config);
  const [userConfirmed, setUserConfirmed] = useState(false);

  // Network gating for live actions
  const { isMainnet, networkName, switchToMainnet } = useNetworkStatus();

  /** Save current edits back to parent */
  const handleSave = () => {
    const sellRule = checkSellTargetsRule(editConfig);
    if (!sellRule.ok) {
      toast.error(sellRule.msg || 'Sell targets must be greater than the buy target.');
      return;
    }
    if (!isMainnet) {
      toast.warning('Switch to Ethereum Mainnet to save live sniping changes.');
      return;
    }
    onUpdate(config.id, editConfig);
    setIsEditing(false);
    toast.success('Configuration saved');
  };

  /** Cancel editing, restore original */
  const handleCancel = () => {
    setEditConfig(config);
    setIsEditing(false);
  };

  /** Handle toggle button click with gating and toast feedback */
  const handleToggleClick = () => {
    if (config.enabled) {
      // Pause is always allowed
      onUpdate(config.id, { enabled: false });
      toast('Sniping paused');
      return;
    }
    // Attempt to start
    if (!isMainnet) {
      toast.warning(`You are on ${networkName || 'a test network'}. Switch to Ethereum Mainnet to start.`);
      return;
    }
    const sellRule = checkSellTargetsRule(config);
    if (!sellRule.ok) {
      toast.error(sellRule.msg || 'Fix your sell targets before starting.');
      return;
    }
    if (!isConfigurationValid()) {
      toast.error(getValidationMessage() || 'Please fix your configuration first.');
      return;
    }
    onUpdate(config.id, { enabled: true });
    toast.success('Sniping started');
  };

  /** Format price for display */
  const formatPrice = (price: number) => {
    return price.toFixed(8);
  };

  /** Color token for price change */
  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  // Validation for safe trading
  const isConfigurationValid = () => {
    const sellRule = checkSellTargetsRule(config);
    return (
      config.targetPrice > 0 &&
      config.maxPrice > 0 &&
      config.amount > 0 &&
      config.slippage > 0 &&
      config.maxPrice >= config.targetPrice &&
      config.amount <= 10 && // Reasonable max amount
      config.slippage <= 50 && // Reasonable max slippage
      sellRule.ok &&
      userConfirmed
    );
  };

  /** Get UX message for validation failure */
  const getValidationMessage = () => {
    const sellRule = checkSellTargetsRule(config);
    if (config.targetPrice <= 0) return 'Please set a target price';
    if (config.maxPrice <= 0) return 'Please set a maximum price';
    if (config.amount <= 0) return 'Please set an amount to trade';
    if (config.slippage <= 0) return 'Please set slippage tolerance';
    if (config.maxPrice < config.targetPrice) return 'Max price must be >= target price';
    if (config.amount > 10) return 'Amount seems too high (>10 ETH)';
    if (config.slippage > 50) return 'Slippage seems too high (>50%)';
    if (!sellRule.ok) return sellRule.msg || 'Sell targets must be greater than the buy target.';
    if (!userConfirmed) return 'Please confirm your settings below';
    return '';
  };

  const sellRuleForEdit = checkSellTargetsRule(editConfig);
  const startButtonLabel = !isMainnet
    ? 'Switch to Mainnet to Start'
    : isConfigurationValid()
      ? 'Start Sniping'
      : !sellRuleForEdit.ok
        ? 'Fix Sell Targets First'
        : 'Configure Settings First';

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <span className="font-mono text-sm">
              {config.tokenAddress.slice(0, 8)}...{config.tokenAddress.slice(-6)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={config.enabled ? 'default' : 'secondary'}
              className={config.enabled ? 'bg-green-600 text-white border-green-500' : 'bg-slate-600 text-slate-200 border-slate-500'}
            >
              {config.enabled ? 'Active' : 'Inactive'}
            </Badge>

            {/* Optional manual reordering controls (shown only when callbacks are provided) */}
            {(onMoveUp || onMoveDown) && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMoveUp}
                  disabled={!canMoveUp}
                  title={canMoveUp ? 'Move up' : 'At top'}
                  className="text-slate-400 hover:text-white disabled:opacity-40"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMoveDown}
                  disabled={!canMoveDown}
                  title={canMoveDown ? 'Move down' : 'At bottom'}
                  className="text-slate-400 hover:text-white disabled:opacity-40"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-slate-400 hover:text-white"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(config.id)}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {marketData && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-800 rounded-lg">
            <div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-xs">Current Price</span>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-slate-600">~{Math.floor((Date.now() - marketData.timestamp) / 1000)}s ago</span>
                </div>
              </div>
              <div className="text-white font-semibold">${formatPrice(marketData.price)}</div>
            </div>
            <div>
              <span className="text-slate-400 text-xs">5m Change</span>
              <div className={`font-semibold flex items-center gap-1 ${getPriceChangeColor(marketData.priceChange5m)}`}>
                {marketData.priceChange5m > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {marketData.priceChange5m.toFixed(2)}%
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-xs">Liquidity</span>
              <div className="text-white font-semibold">${(marketData.liquidity / 1000).toFixed(0)}K</div>
            </div>
            <div>
              <span className="text-slate-400 text-xs">Holders</span>
              <div className="text-white font-semibold">{marketData.holders.toLocaleString()}</div>
            </div>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            {/* Network gating helper when not on mainnet */}
            {!isMainnet && (
              <div className="p-3 bg-amber-900/20 border border-amber-500/40 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5" />
                  <div className="text-amber-200 text-sm">
                    You are on {networkName || 'a test network'}. Saving live sniping changes is only available on Ethereum Mainnet.
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={switchToMainnet}
                        className="bg-transparent border-emerald-500 text-emerald-300 hover:bg-emerald-600/10"
                      >
                        Switch to Mainnet
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SELL > BUY rule warning during edit (even before mainnet) */}
            {!sellRuleForEdit.ok && (
              <div className="p-3 bg-red-900/25 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {sellRuleForEdit.msg || 'Sell targets must be greater than the buy target.'}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Label htmlFor="targetPrice" className="text-slate-300">Target Price</Label>
                  <HelpTooltip
                    title="Target Price"
                    content="The ideal price you want to buy the token at. The bot will try to execute trades at or below this price."
                    size="md"
                  />
                </div>
                <Input
                  id="targetPrice"
                  type="number"
                  step="0.00000001"
                  value={editConfig.targetPrice}
                  onChange={(e) => setEditConfig(prev => ({ ...prev, targetPrice: parseFloat(e.target.value) }))}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Label htmlFor="maxPrice" className="text-slate-300">Max Price</Label>
                  <HelpTooltip
                    title="Maximum Price"
                    content="The highest price you're willing to pay. This acts as a safety limit to prevent buying at extremely high prices during volatile moments."
                    size="md"
                  />
                </div>
                <Input
                  id="maxPrice"
                  type="number"
                  step="0.00000001"
                  value={editConfig.maxPrice}
                  onChange={(e) => setEditConfig(prev => ({ ...prev, maxPrice: parseFloat(e.target.value) }))}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Label htmlFor="amount" className="text-slate-300">Amount (ETH)</Label>
                  <HelpTooltip
                    title="Trade Amount"
                    content="How much ETH you want to spend on this token. This is the total amount that will be used to buy the token when the conditions are met."
                    size="md"
                  />
                </div>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={editConfig.amount}
                  onChange={(e) => setEditConfig(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Label htmlFor="slippage" className="text-slate-300">Slippage (%)</Label>
                  <HelpTooltip
                    title="Slippage Tolerance"
                    content="The maximum price difference you'll accept between when you submit the trade and when it executes. Higher slippage = more likely to execute but potentially worse price."
                    size="md"
                  />
                </div>
                <Input
                  id="slippage"
                  type="number"
                  step="0.1"
                  value={editConfig.slippage}
                  onChange={(e) => setEditConfig(prev => ({ ...prev, slippage: parseFloat(e.target.value) }))}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={editConfig.enabled}
                onCheckedChange={(checked) => setEditConfig(prev => ({ ...prev, enabled: checked }))}
              />
              <Label htmlFor="enabled" className="text-slate-300">Enable Sniping</Label>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={!isMainnet || !sellRuleForEdit.ok}
                title={
                  !isMainnet
                    ? 'Switch to Ethereum Mainnet to save live sniping changes'
                    : !sellRuleForEdit.ok
                    ? (sellRuleForEdit.msg || 'Sell targets must be greater than the buy target.')
                    : undefined
                }
                className={`bg-green-600 hover:bg-green-700 ${!isMainnet || !sellRuleForEdit.ok ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                Save Changes
              </Button>
              <Button onClick={handleCancel} variant="outline" className="bg-transparent border-slate-600 text-slate-300">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-4">
              {/* Current vs Target Price Comparison */}
              <div className="p-3 bg-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 text-sm">Current Price:</span>
                    <HelpTooltip
                      title="Current Market Price"
                      content="The current trading price of this token on the market. This updates in real-time."
                      size="md"
                    />
                  </div>
                  <div className="text-white font-semibold">${formatPrice(0.00009850)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 text-sm">Your Target:</span>
                    <HelpTooltip
                      title="Your Target Price"
                      content="The price you want to buy at. The bot will execute when the market price reaches this level."
                      size="md"
                    />
                  </div>
                  <div className="text-white font-semibold">${formatPrice(config.targetPrice)}</div>
                </div>
                <div className="mt-2 text-xs">
                  {config.targetPrice > 0.00009850 ? (
                    <span className="text-red-400">⚠️ Target above current price - may execute immediately</span>
                  ) : (
                    <span className="text-green-400">✓ Waiting for price to drop to target</span>
                  )}
                </div>
              </div>

              {/* Configuration Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Max Price:</span>
                    <HelpTooltip
                      title="Maximum Price"
                      content="The highest price you're willing to pay. This acts as a safety limit to prevent buying at extremely high prices during volatile moments."
                      size="md"
                    />
                  </div>
                  <div className="text-white font-semibold">${formatPrice(config.maxPrice)}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Amount:</span>
                    <HelpTooltip
                      title="Trade Amount"
                      content="How much ETH you want to spend on this token. This is the total amount that will be used to buy the token when the conditions are met."
                      size="md"
                    />
                  </div>
                  <div className="text-white font-semibold">{config.amount} ETH</div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Slippage:</span>
                    <HelpTooltip
                      title="Slippage Tolerance"
                      content="The maximum price difference you'll accept between when you submit the trade and when it executes. Higher slippage = more likely to execute but potentially worse price."
                      size="md"
                    />
                  </div>
                  <div className="text-white font-semibold">{config.slippage}%</div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Status:</span>
                    <HelpTooltip
                      title="Snipe Status"
                      content="Whether this snipe configuration is actively monitoring the market for your target price."
                      size="md"
                    />
                  </div>
                  <div className="text-white font-semibold">
                    {config.enabled ? 'Active' : 'Paused'}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Saved Configs Manager */}
              <SavedConfigsManager
                currentConfig={config}
                onLoadConfig={(loadedConfig) => {
                  onUpdate(config.id, {
                    targetPrice: loadedConfig.targetPrice,
                    maxPrice: loadedConfig.maxPrice,
                    amount: loadedConfig.amount,
                    slippage: loadedConfig.slippage,
                    gasPrice: loadedConfig.gasPrice,
                    maxGas: loadedConfig.maxGas,
                    gasSettings: loadedConfig.gasSettings,
                    slippageSettings: loadedConfig.slippageSettings,
                    autoSell: loadedConfig.autoSell,
                    batchSettings: loadedConfig.batchSettings,
                  });
                }}
              />

              <AdvancedSettings
                config={config}
                onUpdate={(updates) => onUpdate(config.id, updates)}
              />

              {/* Safety Confirmation */}
              {!config.enabled && (
                <div className="p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold text-sm">Safety Check</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="confirm-settings"
                        checked={userConfirmed}
                        onCheckedChange={setUserConfirmed}
                      />
                      <Label htmlFor="confirm-settings" className="text-yellow-300 text-sm">
                        I have reviewed my settings and understand the risks
                      </Label>
                    </div>
                    {!isConfigurationValid() && (
                      <div className="text-red-400 text-xs mt-1">
                        ⚠️ {getValidationMessage()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button
                onClick={handleToggleClick}
                className={`w-full ${
                  config.enabled
                    ? 'bg-red-600 hover:bg-red-700'
                    : isMainnet
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-600'
                } ${!config.enabled && !isMainnet ? 'opacity-60 cursor-not-allowed' : ''}`}
                aria-disabled={!config.enabled && (!isMainnet || !userConfirmed)}
              >
                {config.enabled ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Sniping
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    {startButtonLabel}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
