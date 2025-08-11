/**
 * ActiveTradesPanel
 * - Shows pending and most recent trades in a compact, readable card.
 * - Provides a CTA to open the full Trade History view.
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import type { Transaction } from '../types/trading';

interface ActiveTradesPanelProps {
  /** List of transactions (pending + recent) */
  transactions: Transaction[];
  /** Max items to display */
  maxItems?: number;
  /** Callback to open the full history tab/page */
  onOpenHistory?: () => void;
}

/**
 * Return a lucide status icon for a transaction status
 */
function StatusIcon({ status }: { status: Transaction['status'] }) {
  if (status === 'pending') {
    return <Clock className="h-4 w-4 text-amber-400" />;
  }
  if (status === 'success') {
    return <CheckCircle className="h-4 w-4 text-emerald-400" />;
  }
  if (status === 'failed') {
    return <XCircle className="h-4 w-4 text-red-400" />;
  }
  return <Clock className="h-4 w-4 text-slate-400" />;
}

/**
 * ActiveTradesPanel component
 * - Sorts by timestamp desc
 * - Prioritizes pending at the top by grouping, then recent finalized
 */
export function ActiveTradesPanel({
  transactions,
  maxItems = 5,
  onOpenHistory,
}: ActiveTradesPanelProps) {
  // Prepare list: pending first (desc), then others (desc)
  const items = useMemo(() => {
    const pending = transactions
      .filter((t) => t.status === 'pending')
      .sort((a, b) => b.timestamp - a.timestamp);

    const others = transactions
      .filter((t) => t.status !== 'pending')
      .sort((a, b) => b.timestamp - a.timestamp);

    return [...pending, ...others].slice(0, maxItems);
  }, [transactions, maxItems]);

  return (
    <Card className="bg-slate-900/20 backdrop-blur-sm border-slate-700/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Active Trades
          </span>

          {/* Count badge */}
          <Badge variant="outline" className="bg-transparent border-slate-600 text-slate-300">
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-60" />
            <div>No active or recent trades</div>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/30"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: type + symbol + status */}
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusIcon status={tx.status} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white text-sm font-semibold whitespace-nowrap">
                          {tx.type.toUpperCase()}
                        </span>
                        {tx.tokenSymbol && (
                          <span className="text-slate-300 text-xs">{tx.tokenSymbol}</span>
                        )}
                        <Badge
                          variant={
                            tx.status === 'success'
                              ? 'default'
                              : tx.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="text-[10px] px-2 py-0.5"
                        >
                          {tx.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {new Date(tx.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right: compact numbers */}
                  <div className="text-right shrink-0">
                    <div className="text-white text-sm font-medium">
                      {tx.amount.toFixed(4)} ETH
                    </div>
                    <div className="text-slate-400 text-xs">@ ${tx.price.toFixed(8)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <div className="pt-2 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenHistory}
            className="bg-transparent border-slate-600 text-slate-300 hover:text-white"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ActiveTradesPanel;
