/**
 * PerformanceWidget
 * - Summarizes trade outcomes from the provided transactions.
 * - Shows Pending / Successful / Failed counts, overall success rate,
 *   and buy-only success ratio. Provides quick access to full history.
 * - Enhancement: time-range selector (1h, 24h, 7d, 30d, All).
 */

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle, XCircle, Clock, Gauge, TrendingUp } from 'lucide-react';
import type { Transaction } from '../types/trading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface PerformanceWidgetProps {
  /** Transactions to aggregate (latest slice from dashboard is fine) */
  transactions: Transaction[];
  /** Optional callback to open the full history tab/page */
  onOpenHistory?: () => void;
}

type TimeRange = '1h' | '24h' | '7d' | '30d' | 'all';

/**
 * Return compact stat cell with icon, label and value
 */
function Stat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/30">
      <div className="flex items-center gap-2 text-slate-300 text-sm">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`mt-1 text-xl font-bold ${color || 'text-white'}`}>{value}</div>
    </div>
  );
}

/**
 * Filter transactions by a selected time range relative to Date.now()
 */
function filterByRange(items: Transaction[], range: TimeRange): Transaction[] {
  if (range === 'all') return items;
  const now = Date.now();
  const ranges: Record<Exclude<TimeRange, 'all'>, number> = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };
  const windowMs = ranges[range];
  const fromTs = now - windowMs;
  return items.filter((t) => t.timestamp >= fromTs);
}

/**
 * PerformanceWidget component
 */
export function PerformanceWidget({ transactions, onOpenHistory }: PerformanceWidgetProps) {
  // Local UI state for time range; default to 24h for meaningful signal
  const [range, setRange] = useState<TimeRange>('24h');

  // Compute filtered set once per render
  const filtered = useMemo(() => filterByRange(transactions, range), [transactions, range]);

  // Aggregate once per render from filtered set
  const summary = useMemo(() => {
    const total = filtered.length;

    const pending = filtered.filter((t) => t.status === 'pending').length;
    const success = filtered.filter((t) => t.status === 'success').length;
    const failed = filtered.filter((t) => t.status === 'failed').length;

    const buys = filtered.filter((t) => t.type === 'buy');
    const buySuccess = buys.filter((t) => t.status === 'success').length;
    const buyFailed = buys.filter((t) => t.status === 'failed').length;

    const completed = success + failed;
    const successRate = completed > 0 ? (success / completed) * 100 : 0;
    const buyCompleted = buySuccess + buyFailed;
    const buySuccessRate = buyCompleted > 0 ? (buySuccess / buyCompleted) * 100 : 0;

    return {
      total,
      pending,
      success,
      failed,
      successRate,
      buySuccess,
      buyFailed,
      buySuccessRate,
    };
  }, [filtered]);

  return (
    <Card className="bg-slate-900/20 backdrop-blur-sm border-slate-700/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sniping Performance
          </span>

          {/* Right side: range selector and total badge */}
          <div className="flex items-center gap-2">
            <Select value={range} onValueChange={(v: any) => setRange(v as TimeRange)}>
              <SelectTrigger className="h-8 w-32 bg-slate-800 border-slate-600 text-xs">
                <SelectValue placeholder="24h" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="1h">Last 1h</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7d</SelectItem>
                <SelectItem value="30d">Last 30d</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>

            <Badge variant="outline" className="bg-transparent border-slate-600 text-slate-300">
              {summary.total} total
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary.total === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-60" />
            <div>No trades in selected range.</div>
          </div>
        ) : (
          <>
            {/* Top stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Stat
                icon={<Clock className="h-4 w-4 text-amber-400" />}
                label="Pending"
                value={summary.pending}
                color="text-amber-300"
              />
              <Stat
                icon={<CheckCircle className="h-4 w-4 text-emerald-400" />}
                label="Successful"
                value={summary.success}
                color="text-emerald-300"
              />
              <Stat
                icon={<XCircle className="h-4 w-4 text-red-400" />}
                label="Failed"
                value={summary.failed}
                color="text-red-300"
              />
            </div>

            {/* Rates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <Gauge className="h-4 w-4" />
                    <span>Overall Success Rate</span>
                  </div>
                  <div className="text-white font-semibold">{summary.successRate.toFixed(1)}%</div>
                </div>
                <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${summary.successRate}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <Gauge className="h-4 w-4" />
                    <span>Buy Success (only)</span>
                  </div>
                  <div className="text-white font-semibold">{summary.buySuccessRate.toFixed(1)}%</div>
                </div>
                <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${summary.buySuccessRate}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  {summary.buySuccess} successful • {summary.buyFailed} failed
                </div>
              </div>
            </div>
          </>
        )}

        <div className="pt-1 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenHistory}
            className="bg-transparent border-slate-600 text-slate-300 hover:text-white"
          >
            Open History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default PerformanceWidget;
