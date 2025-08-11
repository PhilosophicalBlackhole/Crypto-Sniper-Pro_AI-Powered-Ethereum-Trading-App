/**
 * QuickGlance - compact KPI bar for Mainnet/Testnet with sticky option and preferences
 * Enhancements:
 * - Tooltips for metric labels (shadcn Tooltip)
 * - Auto-close preferences upon change with a small "Preferences saved" toast
 * - Retains outside click, Escape, and scroll-to-close behaviors
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Network, Zap, Target, Gauge, Settings, HelpCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useAdvancedTrading } from '../hooks/useAdvancedTrading';
import { BotStatus as BotStatusType } from '../types/trading';
import { toast } from 'sonner';

type MetricKey = 'network' | 'fastGas' | 'activeSnipes' | 'successRate';

interface QuickGlanceProps {
  /** Current bot status to display minimal metrics */
  botStatus: BotStatusType;
  /** Whether connected to Ethereum Mainnet */
  isMainnet: boolean;
  /** Friendly network name for non-mainnet environments */
  networkName: string;
  /** Enable sticky positioning */
  sticky?: boolean;
  /** Top offset in pixels (only used if sticky is true) */
  offsetTopPx?: number;
  /** When true, automatically close preferences panel on scroll */
  closeOnScroll?: boolean;
}

/**
 * Return a concise help text for a given metric key (tooltip content).
 */
function getMetricHelp(key: MetricKey): string {
  switch (key) {
    case 'network':
      return 'Your current chain. Mainnet is required for live trading.';
    case 'fastGas':
      return 'Estimated fast gas price (GWEI) for quicker confirmations.';
    case 'activeSnipes':
      return 'Number of enabled snipe configurations currently monitoring.';
    case 'successRate':
      return 'Percentage of recent snipes that executed successfully.';
    default:
      return '';
  }
}

/**
 * QuickGlance component - small horizontal KPI row with optional sticky behavior and preferences.
 */
export function QuickGlance({
  botStatus,
  isMainnet,
  networkName,
  sticky = false,
  offsetTopPx = 16,
  closeOnScroll = true,
}: QuickGlanceProps) {
  const { networkStats } = useAdvancedTrading();

  /** Persist user-selected metrics */
  const STORAGE_KEY = 'quick_glance_metrics';

  /** Default to all four metrics */
  const defaultMetrics: MetricKey[] = ['network', 'fastGas', 'activeSnipes', 'successRate'];

  const [selected, setSelected] = useState<MetricKey[]>(defaultMetrics);
  const [showPrefs, setShowPrefs] = useState(false);

  // Refs to manage outside click for Preferences
  const prefsRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Load preferences on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MetricKey[];
        if (Array.isArray(parsed) && parsed.length >= 2) {
          setSelected(parsed);
        }
      }
    } catch {
      // ignore malformed
    }
  }, []);

  // Save preferences when selected changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    } catch {
      // ignore storage errors
    }
  }, [selected]);

  /**
   * Toggle a metric in preferences with a minimum of 2 preserved.
   * Auto-closes preferences and shows a small confirmation toast.
   */
  const toggleMetric = (key: MetricKey) => {
    setSelected((prev) => {
      const has = prev.includes(key);

      // If removing, keep at least two
      if (has) {
        if (prev.length <= 2) {
          toast.warning('Keep at least two metrics', { duration: 1200 });
          return prev;
        }
        const next = prev.filter((k) => k !== key);
        // Acknowledge and close
        setShowPrefs(false);
        toast.success('Preferences saved', { duration: 1200 });
        return next;
      }

      // Add
      const next = [...prev, key];
      // Acknowledge and close
      setShowPrefs(false);
      toast.success('Preferences saved', { duration: 1200 });
      return next;
    });
  };

  /**
   * Close preferences when clicking outside or pressing Escape.
   */
  useEffect(() => {
    if (!showPrefs) return;

    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const panel = prefsRef.current;
      const trigger = triggerRef.current;
      const isInsidePanel = !!panel && panel.contains(target);
      const isOnTrigger = !!trigger && trigger.contains(target);
      if (!isInsidePanel && !isOnTrigger) {
        setShowPrefs(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPrefs(false);
      }
    };

    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showPrefs]);

  /**
   * Auto-close preferences on scroll to avoid a "sticky open" feel,
   * especially when the container is sticky.
   */
  useEffect(() => {
    if (!showPrefs || !closeOnScroll) return;
    const onScroll = () => setShowPrefs(false);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [showPrefs, closeOnScroll]);

  /**
   * Render a small help icon + tooltip next to a label text.
   * Note: We removed the native title attribute to prevent duplicate browser tooltips.
   */
  const LabelHelp = ({ text, helpKey }: { text: string; helpKey: MetricKey }) => (
    <div className="flex items-center gap-1">
      <span>{text}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="p-0.5 rounded text-slate-500 hover:text-slate-300"
            aria-label={`${text} help`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-slate-800 border-slate-700 text-slate-200">
          {getMetricHelp(helpKey)}
        </TooltipContent>
      </Tooltip>
    </div>
  );

  /** Memoize metric blocks for clean mapping */
  const metricBlocks = useMemo(() => {
    const blocks: Record<MetricKey, JSX.Element> = {
      network: (
        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <Network className="h-4 w-4" />
            <LabelHelp text="Network" helpKey="network" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-full ${isMainnet ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <Badge variant="outline" className="bg-transparent border-slate-600 text-slate-200">
              {isMainnet ? 'Mainnet' : networkName}
            </Badge>
          </div>
        </div>
      ),
      fastGas: (
        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <Zap className="h-4 w-4" />
            <LabelHelp text="Fast Gas" helpKey="fastGas" />
          </div>
          <div className="text-white font-semibold">{networkStats.fastGasPrice.toFixed(1)} GWEI</div>
        </div>
      ),
      activeSnipes: (
        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <Target className="h-4 w-4" />
            <LabelHelp text="Active Snipes" helpKey="activeSnipes" />
          </div>
          <div className="text-white font-semibold">{botStatus.activeSnipes}</div>
        </div>
      ),
      successRate: (
        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <Gauge className="h-4 w-4" />
            <LabelHelp text="Success Rate" helpKey="successRate" />
          </div>
          <div className="text-white font-semibold">{botStatus.successRate.toFixed(1)}%</div>
        </div>
      ),
    };
    return blocks;
  }, [botStatus.activeSnipes, botStatus.successRate, isMainnet, networkName, networkStats.fastGasPrice]);

  // Sticky classes and styles
  const stickyClasses = sticky ? 'sticky z-30 supports-[backdrop-filter]:bg-slate-900/50' : '';
  const stickyStyle = sticky ? ({ top: `${offsetTopPx}px` } as React.CSSProperties) : undefined;

  return (
    <TooltipProvider delayDuration={200}>
      <Card className={`bg-slate-900/20 backdrop-blur-sm border-slate-700/20 ${stickyClasses}`} style={stickyStyle}>
        {/* Settings trigger */}
        <div className="relative">
          <div className="absolute right-3 top-3">
            <Button
              ref={triggerRef}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              onClick={() => setShowPrefs((v) => !v)}
              aria-expanded={showPrefs}
              aria-controls="quick-glance-preferences"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Preferences floating panel */}
          <div className="absolute right-3 top-3 z-40">
            {showPrefs && (
              <div
                ref={prefsRef}
                id="quick-glance-preferences"
                className="w-64 p-3 rounded-lg border border-slate-700/60 bg-slate-900/90 backdrop-blur-md shadow-xl"
              >
                <div className="text-slate-200 text-sm font-medium mb-2">Quick Glance Preferences</div>
                <div className="space-y-3">
                  {(['network', 'fastGas', 'activeSnipes', 'successRate'] as MetricKey[]).map((key) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={`qg-${key}`} className="text-slate-300 capitalize">
                        {key === 'fastGas'
                          ? 'Fast Gas'
                          : key === 'activeSnipes'
                          ? 'Active Snipes'
                          : key === 'successRate'
                          ? 'Success Rate'
                          : 'Network'}
                      </Label>
                      <Switch id={`qg-${key}`} checked={selected.includes(key)} onCheckedChange={() => toggleMetric(key)} />
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-slate-400">Keep at least two metrics enabled.</div>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          {/* Responsive grid based on count */}
          <div
            className={`grid gap-3 ${
              selected.length <= 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : selected.length === 3
                ? 'grid-cols-1 sm:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}
          >
            {selected.map((key) => (
              <React.Fragment key={key}>{metricBlocks[key]}</React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
