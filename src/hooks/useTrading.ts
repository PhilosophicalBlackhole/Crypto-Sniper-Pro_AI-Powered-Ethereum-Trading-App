/**
 * Custom hook for trading and sniping functionality
 */

import { useState, useCallback, useEffect } from 'react';
import { SnipeConfig, Transaction, MarketData, BotStatus } from '../types/trading';
import { useTestnet } from './useTestnet';
import { transactionStorage } from '../services/transactionStorage';

export function useTrading(userId?: string) {
  const { isTestnet, web3Service } = useTestnet();
  const [snipeConfigs, setSnipeConfigs] = useState<SnipeConfig[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Add some demo data for better UX
  const addDemoData = useCallback(() => {
    const demoConfig: SnipeConfig = {
      id: 'demo-1',
      tokenAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      targetPrice: 0.00234,
      maxPrice: 0.00250,
      amount: 0.5,
      slippage: 12,
      gasPrice: 25,
      maxGas: 500000,
      enabled: true,
      gasSettings: {
        mode: 'auto',
        maxGasPrice: 100,
        priorityFee: 2,
        executionTimeout: 120,
        retryCount: 3,
      },
      slippageSettings: {
        mode: 'adaptive',
        baseSlippage: 12,
        maxSlippage: 25,
        liquidityThreshold: 100000,
        volatilityMultiplier: 1.5,
      },
      autoSell: {
        enabled: true,
        profitTarget: 50,
        stopLoss: -15,
        trailingStop: {
          enabled: true,
          percentage: 5,
          activationPrice: 25,
        },
        partialSelling: {
          enabled: true,
          percentages: [25, 50],
          priceTargets: [30, 60],
        },
      },
      batchSettings: {
        enabled: true,
        maxBatchSize: 3,
        batchDelay: 200,
        nonceManagement: 'auto',
        priority: 7,
      },
    };
    
    setSnipeConfigs([demoConfig]);
    
    // Add some demo transactions
    const demoTransactions: Transaction[] = [
      {
        id: 'demo-tx-1',
        hash: '0x1234567890abcdef1234567890abcdef12345678',
        type: 'buy',
        tokenAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        tokenSymbol: 'UNI',
        amount: 0.5,
        price: 0.00234,
        gasUsed: 180000,
        gasPrice: 25,
        timestamp: Date.now() - 300000,
        status: 'success',
        profit: 0.0123,
      },
      {
        id: 'demo-tx-2',
        hash: '0xabcdef1234567890abcdef1234567890abcdef12',
        type: 'buy',
        tokenAddress: '0xa0b86a33e6776d6e94c13c6e2c2c72b6b5b7e6d3',
        tokenSymbol: 'PEPE',
        amount: 0.2,
        price: 0.00001234,
        gasUsed: 165000,
        gasPrice: 22,
        timestamp: Date.now() - 600000,
        status: 'success',
        profit: -0.0045,
      },
    ];
    
    setTransactions(demoTransactions);
  }, []);
  const [marketData, setMarketData] = useState<Map<string, MarketData>>(new Map());
  const [botStatus, setBotStatus] = useState<BotStatus>({
    isRunning: false,
    activeSnipes: 0,
    totalTransactions: 0,
    totalProfit: 0,
    successRate: 0,
    uptime: 0,
  });

  const addSnipeConfig = useCallback((config: Omit<SnipeConfig, 'id'>) => {
    const newConfig: SnipeConfig = {
      ...config,
      id: Date.now().toString(),
    };
    setSnipeConfigs(prev => [...prev, newConfig]);
  }, []);

  const updateSnipeConfig = useCallback((id: string, updates: Partial<SnipeConfig>) => {
    setSnipeConfigs(prev => 
      prev.map(config => 
        config.id === id ? { ...config, ...updates } : config
      )
    );
  }, []);

  const removeSnipeConfig = useCallback((id: string) => {
    setSnipeConfigs(prev => prev.filter(config => config.id !== id));
  }, []);

  // Load dashboard transactions on mount
  useEffect(() => {
    if (userId) {
      const dashboardTransactions = transactionStorage.getDashboardTransactions(userId);
      setTransactions(dashboardTransactions);
      
      // Cleanup old transactions periodically
      transactionStorage.cleanupOldTransactions(userId);
    }
  }, [userId]);

  const simulateTransaction = useCallback(async (
    type: 'buy' | 'sell',
    tokenAddress: string,
    amount: number,
    price: number
  ): Promise<Transaction> => {
    // Simulate transaction execution
    const transaction: Transaction = {
      id: Date.now().toString(),
      hash: `0x${Math.random().toString(16).slice(2)}`,
      type,
      tokenAddress,
      tokenSymbol: 'TOKEN',
      amount,
      price,
      gasUsed: Math.floor(Math.random() * 100000) + 21000,
      gasPrice: Math.floor(Math.random() * 50) + 20,
      timestamp: Date.now(),
      status: 'pending',
      profit: type === 'sell' ? (Math.random() - 0.3) * amount : undefined
    };

    // Add to local state immediately
    setTransactions(prev => [transaction, ...prev.slice(0, 9)]); // Keep only 10 in local state
    
    // Save to persistent storage if user is logged in
    if (userId) {
      transactionStorage.saveTransaction(userId, transaction);
    }

    // Simulate transaction confirmation
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      const confirmedTransaction = { 
        ...transaction, 
        status: success ? 'success' as const : 'failed' as const,
        profit: success && type === 'buy' ? (Math.random() - 0.3) * amount * price : transaction.profit
      };
      
      // Update local state
      setTransactions(prev => 
        prev.map(tx => 
          tx.id === transaction.id ? confirmedTransaction : tx
        )
      );
      
      // Update persistent storage
      if (userId) {
        transactionStorage.saveTransaction(userId, confirmedTransaction);
      }
    }, 2000 + Math.random() * 3000);

    return transaction;
  }, [userId]);

  const startBot = useCallback(() => {
    setBotStatus(prev => ({ ...prev, isRunning: true }));
  }, []);

  const stopBot = useCallback(() => {
    setBotStatus(prev => ({ ...prev, isRunning: false }));
  }, []);

  // Simulate market data updates
  useEffect(() => {
    const interval = setInterval(() => {
      snipeConfigs.forEach(config => {
        const currentData = marketData.get(config.tokenAddress);
        const basePrice = currentData?.price || Math.random() * 0.001 + 0.0001;
        const priceChange = (Math.random() - 0.5) * 0.1;
        
        const newData: MarketData = {
          tokenAddress: config.tokenAddress,
          price: basePrice * (1 + priceChange),
          priceChange1m: (Math.random() - 0.5) * 5,
          priceChange5m: (Math.random() - 0.5) * 15,
          priceChange1h: (Math.random() - 0.5) * 30,
          volume1h: Math.random() * 1000000,
          liquidity: Math.random() * 5000000,
          holders: Math.floor(Math.random() * 10000) + 100,
          timestamp: Date.now(),
        };

        setMarketData(prev => new Map(prev.set(config.tokenAddress, newData)));

        // Check for snipe opportunities
        if (config.enabled && botStatus.isRunning && newData.price <= config.targetPrice) {
          simulateTransaction('buy', config.tokenAddress, config.amount, newData.price);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [snipeConfigs, marketData, botStatus.isRunning, simulateTransaction]);

  // Update bot status
  useEffect(() => {
    const activeSnipes = snipeConfigs.filter(config => config.enabled).length;
    const successfulTxs = transactions.filter(tx => tx.status === 'success').length;
    const totalTxs = transactions.filter(tx => tx.status !== 'pending').length;
    const totalProfit = transactions
      .filter(tx => tx.status === 'success' && tx.profit)
      .reduce((sum, tx) => sum + (tx.profit || 0), 0);

    setBotStatus(prev => ({
      ...prev,
      activeSnipes,
      totalTransactions: totalTxs,
      totalProfit,
      successRate: totalTxs > 0 ? (successfulTxs / totalTxs) * 100 : 0,
    }));
  }, [snipeConfigs, transactions]);

  return {
    snipeConfigs,
    transactions,
    marketData,
    botStatus,
    addSnipeConfig,
    updateSnipeConfig,
    removeSnipeConfig,
    simulateTransaction,
    startBot,
    stopBot,
    addDemoData,
  };
}
