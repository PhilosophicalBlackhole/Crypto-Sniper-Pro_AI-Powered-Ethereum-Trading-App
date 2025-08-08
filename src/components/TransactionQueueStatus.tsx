/**
 * Transaction queue status component showing batch processing and nonce management
 */

import React from 'react';
import { Clock, Zap, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { useAdvancedTrading } from '../hooks/useAdvancedTrading';

export function TransactionQueueStatus() {
  const { transactionQueue, networkStats, processQueue } = useAdvancedTrading();

  const queuedCount = transactionQueue.filter(tx => tx.status === 'queued').length;
  const processingCount = transactionQueue.filter(tx => tx.status === 'processing').length;
  const confirmedCount = transactionQueue.filter(tx => tx.status === 'confirmed').length;
  const failedCount = transactionQueue.filter(tx => tx.status === 'failed').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued': return <Clock className="h-3 w-3 text-yellow-400" />;
      case 'processing': return <RefreshCw className="h-3 w-3 text-blue-400 animate-spin" />;
      case 'confirmed': return <CheckCircle className="h-3 w-3 text-green-400" />;
      case 'failed': return <XCircle className="h-3 w-3 text-red-400" />;
      default: return <Clock className="h-3 w-3 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued': return 'text-yellow-400 border-yellow-400';
      case 'processing': return 'text-blue-400 border-blue-400';
      case 'confirmed': return 'text-green-400 border-green-400';
      case 'failed': return 'text-red-400 border-red-400';
      default: return 'text-slate-400 border-slate-400';
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  if (transactionQueue.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Zap className="h-5 w-5" />
            Transaction Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-400">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No transactions in queue</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/30 backdrop-blur-sm border-slate-700/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Transaction Queue
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-slate-300 border-slate-600">
              {transactionQueue.length} total
            </Badge>
            <Button
              onClick={processQueue}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Queue Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Queue Status</span>
              <Badge className={`${processingCount > 0 ? 'bg-blue-600' : 'bg-slate-600'} text-white`}>
                {processingCount > 0 ? 'Processing' : 'Idle'}
              </Badge>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-yellow-400" />
                <span className="text-slate-300">{queuedCount} queued</span>
              </div>
              <div className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3 text-blue-400" />
                <span className="text-slate-300">{processingCount} processing</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-400" />
                <span className="text-slate-300">{confirmedCount} confirmed</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="h-3 w-3 text-red-400" />
                <span className="text-slate-300">{failedCount} failed</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Network</span>
              <Badge className={`${
                networkStats.networkCongestion === 'low' ? 'bg-green-600' :
                networkStats.networkCongestion === 'medium' ? 'bg-yellow-600' :
                'bg-red-600'
              } text-white`}>
                {networkStats.networkCongestion}
              </Badge>
            </div>
            <div className="mt-2 text-xs text-slate-300">
              <div>Base: {networkStats.baseFee.toFixed(1)} GWEI</div>
              <div>Fast: {networkStats.fastGasPrice.toFixed(1)} GWEI</div>
            </div>
          </div>
        </div>

        {/* Processing Progress */}
        {processingCount > 0 && (
          <div className="p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 text-sm">Processing Batch</span>
              <span className="text-slate-400 text-xs">{processingCount} of {transactionQueue.length}</span>
            </div>
            <Progress 
              value={(processingCount / transactionQueue.length) * 100} 
              className="h-2"
            />
          </div>
        )}

        {/* Transaction List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {transactionQueue.slice(0, 10).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-2 bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(tx.status)}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">
                      {tx.type.toUpperCase()}
                    </span>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-400">
                    Nonce: {tx.nonce} | Priority: {tx.priority}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="text-xs text-slate-400">
                  {formatTime(tx.createdAt)}
                </div>
                {tx.retryCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-orange-400">
                    <AlertTriangle className="h-2 w-2" />
                    Retry {tx.retryCount}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {transactionQueue.length > 10 && (
            <div className="text-center py-2 text-slate-400 text-sm">
              ... {transactionQueue.length - 10} more transactions
            </div>
          )}
        </div>

        {/* Gas Cost Estimation */}
        <div className="p-3 bg-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">Estimated Costs</span>
            <span className="text-slate-400 text-xs">Based on current queue</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Total Gas:</span>
              <div className="text-white font-semibold">
                {(transactionQueue.reduce((sum, tx) => sum + tx.gasSettings.estimatedCost, 0)).toFixed(6)} ETH
              </div>
            </div>
            <div>
              <span className="text-slate-400">Est. Time:</span>
              <div className="text-white font-semibold">
                {Math.max(...transactionQueue.map(tx => tx.gasSettings.executionTime))}s
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
