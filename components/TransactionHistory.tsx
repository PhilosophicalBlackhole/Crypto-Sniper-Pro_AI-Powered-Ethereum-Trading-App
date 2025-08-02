/**
 * Transaction history component with filtering and visibility controls
 */

import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, TrendingDown, CheckCircle, XCircle, AlertTriangle, Eye, EyeOff, Filter, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Transaction } from '../types/trading';
import { transactionStorage } from '../services/transactionStorage';

interface TransactionHistoryProps {
  transactions: Transaction[];
  userId?: string;
  showPagination?: boolean;
  maxDisplayed?: number;
}

export function TransactionHistory({ 
  transactions, 
  userId, 
  showPagination = false, 
  maxDisplayed = 25 
}: TransactionHistoryProps) {
  const [visibleColumns, setVisibleColumns] = useState({
    timestamp: true,
    type: true,
    token: true,
    amount: true,
    price: true,
    gasUsed: true,
    status: true,
    profit: true,
  });

  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed' | 'pending'>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageData, setPageData] = useState({
    transactions: transactions,
    page: 0,
    totalPages: 1,
    totalTransactions: transactions.length
  });
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    pending: 0,
    totalProfit: 0,
    successRate: 0
  });

  // Load paginated data when page changes or userId is available
  useEffect(() => {
    if (userId && showPagination) {
      const data = transactionStorage.getTransactionHistory(userId, currentPage);
      setPageData(data);
      
      const userStats = transactionStorage.getTransactionStats(userId);
      setStats(userStats);
    } else {
      // Use passed transactions for dashboard view
      setPageData({
        transactions: transactions.slice(0, maxDisplayed),
        page: 0,
        totalPages: Math.ceil(transactions.length / maxDisplayed),
        totalTransactions: transactions.length
      });
    }
  }, [userId, currentPage, transactions, showPagination, maxDisplayed]);

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const filteredTransactions = pageData.transactions.filter(tx => {
    if (filterStatus === 'all') return true;
    return tx.status === filterStatus;
  });

  const handleExportHistory = () => {
    if (userId) {
      const exportData = transactionStorage.exportTransactionHistory(userId);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cryptosniper-history-${userId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <Card className="bg-slate-900/30 backdrop-blur-sm border-slate-700/30">
      <CardHeader>
        <CardTitle className="text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Title and count */}
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 flex-shrink-0" />
              <span className="whitespace-nowrap">Transaction History</span>
              {showPagination && stats.total > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {stats.total}
                </Badge>
              )}
            </div>
            
            {/* Controls - wrap on mobile */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-28 h-8 bg-slate-800 border-slate-600 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Column Visibility Controls - hide labels on mobile */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleColumn('timestamp')}
                  className={`h-8 px-2 text-xs ${visibleColumns.timestamp ? 'text-white' : 'text-slate-500'}`}
                  title="Toggle Timestamp"
                >
                  {visibleColumns.timestamp ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span className="ml-1 hidden sm:inline">Time</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleColumn('gasUsed')}
                  className={`h-8 px-2 text-xs ${visibleColumns.gasUsed ? 'text-white' : 'text-slate-500'}`}
                  title="Toggle Gas Info"
                >
                  {visibleColumns.gasUsed ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span className="ml-1 hidden sm:inline">Gas</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleColumn('profit')}
                  className={`h-8 px-2 text-xs ${visibleColumns.profit ? 'text-white' : 'text-slate-500'}`}
                  title="Toggle Profit/Loss"
                >
                  {visibleColumns.profit ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span className="ml-1 hidden sm:inline">P&L</span>
                </Button>
              </div>
              
              {/* Export button for full history view */}
              {showPagination && userId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportHistory}
                  className="h-8 border-slate-600 text-slate-300 hover:text-white"
                  title="Export Transaction History"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>
              {filterStatus === 'all' 
                ? 'No transactions yet. Start sniping to see your trading history!' 
                : `No ${filterStatus} transactions found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="bg-slate-800 rounded-lg p-3">
                {/* Mobile-first responsive layout */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  
                  {/* Main transaction info - always visible */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getStatusIcon(tx.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white text-sm font-medium whitespace-nowrap">
                          {tx.type.toUpperCase()}
                        </span>
                        {visibleColumns.token && (
                          <span className="text-slate-400 text-xs whitespace-nowrap">
                            {tx.tokenSymbol}
                          </span>
                        )}
                        {visibleColumns.status && (
                          <Badge 
                            variant={tx.status === 'success' ? 'default' : tx.status === 'failed' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {tx.status}
                          </Badge>
                        )}
                      </div>
                      {visibleColumns.timestamp && (
                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(tx.timestamp).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transaction details - responsive grid */}
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-4 text-sm">
                    
                    {/* Amount & Price */}
                    {visibleColumns.amount && (
                      <div className="text-left sm:text-right">
                        <div className="text-white font-medium">
                          {tx.amount.toFixed(4)} ETH
                        </div>
                        {visibleColumns.price && (
                          <div className="text-slate-400 text-xs">
                            @ ${tx.price.toFixed(8)}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Gas Info */}
                    {visibleColumns.gasUsed && (
                      <div className="text-left sm:text-right">
                        <div className="text-slate-400 text-xs">
                          Gas: {(tx.gasUsed / 1000).toFixed(0)}K
                        </div>
                        <div className="text-slate-400 text-xs">
                          {tx.gasPrice} GWEI
                        </div>
                      </div>
                    )}
                    
                    {/* Profit/Loss - full width on mobile if present */}
                    {visibleColumns.profit && tx.profit !== undefined && (
                      <div className="text-left sm:text-right col-span-2 sm:col-span-1">
                        <div className={`font-medium ${tx.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.profit >= 0 ? '+' : ''}${tx.profit.toFixed(2)}
                        </div>
                        <div className="text-slate-400 text-xs">
                          {tx.profit >= 0 ? 'Profit' : 'Loss'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination for full history view */}
        {showPagination && pageData.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-slate-700">
            <div className="text-sm text-slate-400 text-center sm:text-left">
              Page {pageData.page + 1} of {pageData.totalPages}
              {stats.total > 0 && (
                <span className="block sm:inline">
                  <span className="hidden sm:inline"> (</span>
                  {stats.total} total transactions
                  <span className="hidden sm:inline">)</span>
                </span>
              )}
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="border-slate-600 text-slate-300 min-w-[80px]"
              >
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(pageData.totalPages - 1, prev + 1))}
                disabled={currentPage === pageData.totalPages - 1}
                className="border-slate-600 text-slate-300 min-w-[80px]"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Stats summary for full history view */}
        {showPagination && stats.total > 0 && (
          <div className="mt-4 p-4 bg-slate-800 rounded-lg">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-2">
                <div className="text-green-400 font-semibold text-lg">{stats.successful}</div>
                <div className="text-xs text-slate-400 whitespace-nowrap">Successful</div>
              </div>
              <div className="text-center p-2">
                <div className="text-red-400 font-semibold text-lg">{stats.failed}</div>
                <div className="text-xs text-slate-400 whitespace-nowrap">Failed</div>
              </div>
              <div className="text-center p-2">
                <div className={`font-semibold text-lg ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${stats.totalProfit.toFixed(2)}
                </div>
                <div className="text-xs text-slate-400 whitespace-nowrap">Total P&L</div>
              </div>
              <div className="text-center p-2">
                <div className="text-blue-400 font-semibold text-lg">{stats.successRate.toFixed(1)}%</div>
                <div className="text-xs text-slate-400 whitespace-nowrap">Success Rate</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
