/**
 * Trading and sniping bot type definitions
 */

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  price?: number;
  priceChange24h?: number;
  volume24h?: number;
  liquidity?: number;
  marketCap?: number;
}

export interface SnipeConfig {
  id: string;
  tokenAddress: string;
  targetPrice: number;
  maxPrice: number;
  amount: number;
  slippage: number;
  gasPrice: number;
  maxGas: number;
  enabled: boolean;
  // Advanced gas management
  gasSettings: {
    mode: 'auto' | 'manual';
    maxGasPrice: number;
    priorityFee: number;
    executionTimeout: number; // seconds
    retryCount: number;
  };
  // Smart slippage adjustment
  slippageSettings: {
    mode: 'fixed' | 'adaptive';
    baseSlippage: number;
    maxSlippage: number;
    liquidityThreshold: number;
    volatilityMultiplier: number;
  };
  // Stop-loss and take-profit
  autoSell?: {
    enabled: boolean;
    profitTarget: number;
    stopLoss: number;
    trailingStop: {
      enabled: boolean;
      percentage: number;
      activationPrice: number;
    };
    partialSelling: {
      enabled: boolean;
      percentages: number[];
      priceTargets: number[];
    };
  };
  // Batch sniping
  batchSettings: {
    enabled: boolean;
    maxBatchSize: number;
    batchDelay: number; // ms between transactions
    nonceManagement: 'auto' | 'manual';
    priority: number; // 1-10, higher = more priority
  };
}

export interface Transaction {
  id: string;
  hash: string;
  type: 'buy' | 'sell';
  tokenAddress: string;
  tokenSymbol: string;
  amount: number;
  price: number;
  gasUsed: number;
  gasPrice: number;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
  profit?: number;
}

export interface MarketData {
  tokenAddress: string;
  price: number;
  priceChange1m: number;
  priceChange5m: number;
  priceChange1h: number;
  volume1h: number;
  liquidity: number;
  holders: number;
  timestamp: number;
}

export interface BotStatus {
  isRunning: boolean;
  activeSnipes: number;
  totalTransactions: number;
  totalProfit: number;
  successRate: number;
  uptime: number;
  gasEstimator: {
    currentBaseFee: number;
    recommendedGasPrice: number;
    fastGasPrice: number;
    networkCongestion: 'low' | 'medium' | 'high';
  };
  transactionQueue: {
    pending: number;
    processing: number;
    failed: number;
    nextNonce: number;
  };
}

export interface GasEstimation {
  baseFee: number;
  maxFeePerGas: number;
  maxPriorityFeePerGas: number;
  gasLimit: number;
  estimatedCost: number;
  executionTime: number;
  confidence: number;
}

export interface TransactionQueueItem {
  id: string;
  snipeConfigId: string;
  type: 'buy' | 'sell';
  priority: number;
  nonce: number;
  gasSettings: GasEstimation;
  status: 'queued' | 'processing' | 'confirmed' | 'failed';
  createdAt: number;
  executedAt?: number;
  retryCount: number;
}

export interface SlippageCalculation {
  baseSlippage: number;
  adjustedSlippage: number;
  liquidityFactor: number;
  volatilityFactor: number;
  recommendedSlippage: number;
  confidence: number;
}
