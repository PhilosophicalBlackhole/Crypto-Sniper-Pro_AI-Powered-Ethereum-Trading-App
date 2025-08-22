/**
 * AdvancedSettings
 * - Edit advanced trading settings for a single SnipeConfig.
 * - Focus: Auto-Sell and Partial Selling with inline validation ensuring SELL above BUY rule:
 *   all sell price targets must be strictly greater than 0% (relative to buy price).
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { AlertTriangle, Plus, Minus } from 'lucide-react';
import { SnipeConfig } from '../types/trading';

interface AdvancedSettingsProps {
  /** Current configuration to edit */
  config: SnipeConfig;
  /** Emits partial updates to parent card */
  onUpdate: (updates: Partial<SnipeConfig>) => void;
}

/**
 * Compute validation info for Auto-Sell and Partial Selling
 * - Ensures profit and partial price targets are greater than 0%
 * - Ensures partial percentages total is at most 100%
 */
function useAutoSellValidation(cfg: SnipeConfig) {
  const auto = cfg.autoSell;
  return useMemo(() => {
    const errors: string[] = [];
    let ok = true;
    if (auto?.enabled) {
      if (typeof auto.profitTarget !== 'number' || auto.profitTarget <= 0) {
        ok = false;
        errors.push('Profit target must be greater than 0%.');
      }
      if (auto?.partialSelling?.enabled) {
        const prices = auto.partialSelling.priceTargets || [];
        const invalidIdx = prices.findIndex((p) => typeof p !== 'number' || p <= 0);
        if (invalidIdx !== -1) {
          ok = false;
          errors.push('All partial sell price targets must be greater than 0%.');
        }
        // Optional: sum of percentages at most 100
        const sumPct = (auto.partialSelling.percentages || []).reduce(
          (a, b) => a + (Number.isFinite(b) ? b : 0),
          0
        );
        if (sumPct > 100) {
          ok = false;
          errors.push('Partial sell percentages should sum to at most 100%.');
        }
      }
    }
    return { ok, errors };
  }, [auto]);
}

/**
 * AdvancedSettings component
 * - Inline, real-time validation with clear messages.
 * - Minimal but focused UI on Auto-Sell/Partial Selling to satisfy SELL-above-BUY rule.
 */
export function AdvancedSettings({ config, onUpdate }: AdvancedSettingsProps) {
  const { ok, errors } = useAutoSellValidation(config);

  const auto = config.autoSell || {
    enabled: false,
    profitTarget: 50,
    stopLoss: -20,
    trailingStop: { enabled: false, percentage: 5, activationPrice: 20 },
    partialSelling: { enabled: false, percentages: [25, 50], priceTargets: [20, 50] },
  };

  const partial = auto.partialSelling || {
    enabled: false,
    percentages: [25, 50],
    priceTargets: [20, 50],
  };

  /** Update a field inside autoSell object */
  const updateAuto = (patch: Partial<NonNullable<SnipeConfig['autoSell']>>) => {
    onUpdate({ autoSell: { ...auto, ...patch } });
  };

  /** Update a field inside partialSelling */
  const updatePartial = (
    patch: Partial<NonNullable<SnipeConfig['autoSell']>['partialSelling']>
  ) => {
    updateAuto({ partialSelling: { ...partial, ...patch } });
  };

  /** Add a new partial row */
  const addPartialRow = () => {
    updatePartial({
      percentages: [...(partial.percentages || []), 10],
      priceTargets: [...(partial.priceTargets || []), 5],
    });
  };

  /** Remove a partial row by index */
  const removePartialRow = (idx: number) => {
    const pct = [...(partial.percentages || [])];
    const prc = [...(partial.priceTargets || [])];
    pct.splice(idx, 1);
    prc.splice(idx, 1);
    updatePartial({ percentages: pct, priceTargets: prc });
  };

  /** Update row values */
  const updatePartialRow = (
    idx: number,
    field: 'percentages' | 'priceTargets',
    value: number
  ) => {
    if (field === 'percentages') {
      const arr = [...(partial.percentages || [])];
      arr[idx] = value;
      updatePartial({ percentages: arr });
    } else {
      const arr = [...(partial.priceTargets || [])];
      arr[idx] = value;
      updatePartial({ priceTargets: arr });
    }
  };

  const sumPercentages = (partial.percentages || []).reduce(
    (a, b) => a + (Number.isFinite(b) ? b : 0),
    0
  );
  const hasPartialPriceError = (partial.priceTargets || []).some(
    (p) => typeof p !== 'number' || p <= 0
  );
  const sumPctError = sumPercentages > 100;

  return (
    <Card className="bg-slate-900/30 backdrop-blur-sm border-slate-700/30">
      <CardHeader>
        <CardTitle className="text-white">Advanced Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto-Sell Toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id="autoSellEnabled-adv"
            checked={auto.enabled}
            onCheckedChange={(checked) => updateAuto({ enabled: checked })}
          />
          <Label htmlFor="autoSellEnabled-adv" className="text-slate-300">
            Enable Auto-Sell
          </Label>
        </div>

        {/* Auto-Sell Block */}
        {auto.enabled && (
          <div className="space-y-4 p-3 rounded-lg bg-slate-800 border border-slate-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profitTarget-adv" className="text-slate-300">
                  Profit Target (%)
                </Label>
                <Input
                  id="profitTarget-adv"
                  type="number"
                  step={0.1}
                  min={0.1}
                  value={auto.profitTarget}
                  onChange={(e) =>
                    updateAuto({ profitTarget: parseFloat(e.target.value) })
                  }
                  className={`bg-slate-700 border-slate-600 text-white ${
                    !ok && auto.profitTarget <= 0 ? 'border-red-500' : ''
                  }`}
                />
              </div>
              <div>
                <Label htmlFor="stopLoss-adv" className="text-slate-300">
                  Stop Loss (%)
                </Label>
                <Input
                  id="stopLoss-adv"
                  type="number"
                  step={0.5}
                  min={-95}
                  max={0}
                  value={auto.stopLoss}
                  onChange={(e) =>
                    updateAuto({ stopLoss: parseFloat(e.target.value) })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Trailing stop */}
            <div className="flex items-center space-x-2">
              <Switch
                id="trailingStopEnabled-adv"
                checked={auto.trailingStop?.enabled || false}
                onCheckedChange={(checked) =>
                  updateAuto({
                    trailingStop: {
                      ...(auto.trailingStop || { percentage: 5, activationPrice: 20 }),
                      enabled: checked,
                    },
                  })
                }
              />
              <Label htmlFor="trailingStopEnabled-adv" className="text-slate-300">
                Enable Trailing Stop
              </Label>
            </div>
            {auto.trailingStop?.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trailingPct-adv" className="text-slate-300">
                    Trailing %
                  </Label>
                  <Input
                    id="trailingPct-adv"
                    type="number"
                    step={0.1}
                    min={0.1}
                    value={auto.trailingStop?.percentage ?? 5}
                    onChange={(e) =>
                      updateAuto({
                        trailingStop: {
                          ...(auto.trailingStop || { enabled: true, activationPrice: 20 }),
                          percentage: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="activationPct-adv" className="text-slate-300">
                    Activation Price (%)
                  </Label>
                  <Input
                    id="activationPct-adv"
                    type="number"
                    step={0.1}
                    min={0.1}
                    value={auto.trailingStop?.activationPrice ?? 20}
                    onChange={(e) =>
                      updateAuto({
                        trailingStop: {
                          ...(auto.trailingStop || { enabled: true, percentage: 5 }),
                          activationPrice: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            )}

            {/* Partial selling */}
            <div className="flex items-center space-x-2">
              <Switch
                id="partialSellEnabled-adv"
                checked={partial.enabled || false}
                onCheckedChange={(checked) => updatePartial({ enabled: checked })}
              />
              <Label htmlFor="partialSellEnabled-adv" className="text-slate-300">
                Enable Partial Selling
              </Label>
            </div>

            {partial.enabled && (
              <div className="space-y-3 p-3 rounded-lg bg-slate-900 border border-slate-700">
                {(partial.percentages || []).map((pct, idx) => {
                  const pt = (partial.priceTargets || [])[idx] ?? 5;
                  const priceError = !(typeof pt === 'number') || pt <= 0;
                  return (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-5">
                        <Label className="text-slate-300">Sell Portion (%)</Label>
                        <Input
                          type="number"
                          step={1}
                          min={1}
                          max={100}
                          value={pct}
                          onChange={(e) =>
                            updatePartialRow(idx, 'percentages', parseFloat(e.target.value))
                          }
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div className="col-span-5">
                        <Label className="text-slate-300">At Profit Target (%)</Label>
                        <Input
                          type="number"
                          step={0.1}
                          min={0.1}
                          value={pt}
                          onChange={(e) =>
                            updatePartialRow(idx, 'priceTargets', parseFloat(e.target.value))
                          }
                          className={`bg-slate-700 border-slate-600 text-white ${
                            priceError ? 'border-red-500' : ''
                          }`}
                        />
                        {priceError && (
                          <div className="text-xs text-red-400 mt-1">
                            Price target must be greater than 0%.
                          </div>
                        )}
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePartialRow(idx)}
                          className="bg-transparent border-slate-600 text-slate-300 hover:text-white w-full"
                        >
                          <Minus className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    onClick={addPartialRow}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Partial Step
                  </Button>
                  <div className={`text-xs ${sumPctError ? 'text-amber-300' : 'text-slate-400'}`}>
                    Total portion: {sumPercentages}% {sumPctError && '(should be at most 100%)'}
                  </div>
                </div>

                {!ok && errors.length > 0 && (
                  <div className="mt-2 p-2 rounded-md bg-red-900/25 border border-red-500/50 text-red-200 text-xs flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                    <div>
                      {errors.map((e, i) => (
                        <div key={i}>• {e}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AdvancedSettings;
