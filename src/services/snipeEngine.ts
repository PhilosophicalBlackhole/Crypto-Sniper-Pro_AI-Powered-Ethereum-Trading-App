/**
 * Snipe Engine Service
 * Automated trading execution and strategy management
 */

import { createDexService, DexIntegrationService } from './dexIntegration';
import { createTokenMonitoringService, TokenMonitoringService } from './tokenMonitoring';

interface SnipeConfig {
  id: string;
  tokenAddress: string;
  symbol: string;
  targetPrice: number;
  amount: string;
  slippage: number;
  gasPrice: string;
  maxGasPrice: string;
  isActive: boolean;
  strategy: 'buy' | 'sell' | 'both';
  conditions: SnipeCondition[];
  createdAt: number;
}

interface SnipeCondition {
  type: 'price' | 'volume' | 'liquidity' | 'holders';
  operator: '>' | '<' | '=' | '>=' | '<=';
  value: number;
}

interface SnipeExecution {
  id: string;
  snipeId: string;
  tokenAddress: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: string;
  price: number;
  txHash: string;
  gasUsed: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  error?: string;
}

interface SnipeEngineOptions {
  maxConcurrentTrades: number;
  defaultSlippage: number;
  gasMultiplier: number;
  monitoringInterval: number;
}

/**
 * Snipe Engine Service for automated trading
 */
export class SnipeEngineService {
  private provider: any;
  private signer: any;
  private dexService: DexIntegrationService;
  private monitoringService: TokenMonitoringService;
  private snipeConfigs: Map<string, SnipeConfig> = new Map();
  private executedTrades: Map<string, SnipeExecution> = new Map();
  private isRunning: boolean = false;
  private executionInterval: NodeJS.Timeout | null = null;
  private options: SnipeEngineOptions;

  constructor(provider: any, signer: any, options: SnipeEngineOptions) {
    this.provider = provider;
    this.signer = signer;
    this.options = options;
    this.dexService = createDexService(provider, signer);
    this.monitoringService = createTokenMonitoringService(provider, {
      interval: options.monitoringInterval,
      priceAlerts: true,
      volumeAlerts: true,
      liquidityAlerts: true
    });
  }

  /**
   * Start the snipe engine
   */
  startEngine(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.monitoringService.startMonitoring();

    this.executionInterval = setInterval(async () => {
      await this.executeSnipeStrategies();
    }, 1000); // Check every second

    console.log('🚀 Snipe engine started');
  }

  /**
   * Stop the snipe engine
   */
  stopEngine(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.monitoringService.stopMonitoring();

    if (this.executionInterval) {
      clearInterval(this.executionInterval);
      this.executionInterval = null;
    }

    console.log('⏹️ Snipe engine stopped');
  }

  /**
   * Add snipe configuration
   */
  async addSnipeConfig(config: Omit<SnipeConfig, 'id' | 'createdAt'>): Promise<string> {
    const snipeId = `snipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const snipeConfig: SnipeConfig = {
      ...config,
      id: snipeId,
      createdAt: Date.now()
    };

    this.snipeConfigs.set(snipeId, snipeConfig);

    // Add token to monitoring
    await this.monitoringService.addToken(config.tokenAddress);

    // Create price alert
    this.monitoringService.addPriceAlert(
      config.tokenAddress,
      config.symbol,
      config.strategy === 'buy' ? 'below' : 'above',
      config.targetPrice
    );

    console.log(`✅ Snipe config added: ${config.symbol} at ${config.targetPrice}`);
    return snipeId;
  }

  /**
   * Remove snipe configuration
   */
  removeSnipeConfig(snipeId: string): void {
    const config = this.snipeConfigs.get(snipeId);
    if (config) {
      this.snipeConfigs.delete(snipeId);
      console.log(`❌ Snipe config removed: ${config.symbol}`);
    }
  }

  /**
   * Get snipe configuration
   */
  getSnipeConfig(snipeId: string): SnipeConfig | null {
    return this.snipeConfigs.get(snipeId) || null;
  }

  /**
   * Get all snipe configurations
   */
  getAllSnipeConfigs(): SnipeConfig[] {
    return Array.from(this.snipeConfigs.values());
  }

  /**
   * Toggle snipe configuration active status
   */
  toggleSnipeConfig(snipeId: string): void {
    const config = this.snipeConfigs.get(snipeId);
    if (config) {
      config.isActive = !config.isActive;
      console.log(`🔄 Snipe config ${config.symbol} ${config.isActive ? 'activated' : 'deactivated'}`);
    }
  }

  /**
   * Get executed trades
   */
  getExecutedTrades(): SnipeExecution[] {
    return Array.from(this.executedTrades.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get trade statistics
   */
  getTradeStats(): {
    totalTrades: number;
    successfulTrades: number;
    failedTrades: number;
    totalVolume: number;
    successRate: number;
  } {
    const trades = this.getExecutedTrades();
    const successful = trades.filter(t => t.status === 'success').length;
    const failed = trades.filter(t => t.status === 'failed').length;
    const totalVolume = trades.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    return {
      totalTrades: trades.length,
      successfulTrades: successful,
      failedTrades: failed,
      totalVolume,
      successRate: trades.length > 0 ? (successful / trades.length) * 100 : 0
    };
  }

  /**
   * Execute snipe strategies
   */
  private async executeSnipeStrategies(): Promise<void> {
    const activeConfigs = Array.from(this.snipeConfigs.values()).filter(c => c.isActive);
    
    for (const config of activeConfigs) {
      try {
        await this.checkAndExecuteSnipe(config);
      } catch (error) {
        console.error(`Error executing snipe for ${config.symbol}:`, error);
      }
    }
  }

  /**
   * Check conditions and execute snipe
   */
  private async checkAndExecuteSnipe(config: SnipeConfig): Promise<void> {
    const tokenData = this.monitoringService.getTokenData(config.tokenAddress);
    if (!tokenData) return;

    // Check if conditions are met
    const conditionsMet = this.checkSnipeConditions(config, tokenData);
    if (!conditionsMet) return;

    // Check price target
    const priceConditionMet = this.checkPriceCondition(config, tokenData.price);
    if (!priceConditionMet) return;

    // Execute the trade
    await this.executeTrade(config, tokenData);
  }

  /**
   * Check snipe conditions
   */
  private checkSnipeConditions(config: SnipeConfig, tokenData: any): boolean {
    return config.conditions.every(condition => {
      const value = this.getConditionValue(condition.type, tokenData);
      return this.evaluateCondition(value, condition.operator, condition.value);
    });
  }

  /**
   * Check price condition
   */
  private checkPriceCondition(config: SnipeConfig, currentPrice: number): boolean {
    switch (config.strategy) {
      case 'buy':
        return currentPrice <= config.targetPrice;
      case 'sell':
        return currentPrice >= config.targetPrice;
      case 'both':
        return Math.abs(currentPrice - config.targetPrice) <= config.targetPrice * 0.01; // 1% tolerance
      default:
        return false;
    }
  }

  /**
   * Get condition value from token data
   */
  private getConditionValue(type: string, tokenData: any): number {
    switch (type) {
      case 'price':
        return tokenData.price;
      case 'volume':
        return tokenData.volume24h;
      case 'liquidity':
        return tokenData.liquidity;
      case 'holders':
        return tokenData.holders;
      default:
        return 0;
    }
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case '>':
        return value > threshold;
      case '<':
        return value < threshold;
      case '=':
        return value === threshold;
      case '>=':
        return value >= threshold;
      case '<=':
        return value <= threshold;
      default:
        return false;
    }
  }

  /**
   * Execute trade
   */
  private async executeTrade(config: SnipeConfig, tokenData: any): Promise<void> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const execution: SnipeExecution = {
      id: executionId,
      snipeId: config.id,
      tokenAddress: config.tokenAddress,
      symbol: config.symbol,
      type: config.strategy === 'sell' ? 'sell' : 'buy',
      amount: config.amount,
      price: tokenData.price,
      txHash: '',
      gasUsed: '0',
      status: 'pending',
      timestamp: Date.now()
    };

    this.executedTrades.set(executionId, execution);

    try {
      // Check for honeypot
      const isHoneypot = await this.dexService.isHoneypot(config.tokenAddress);
      if (isHoneypot) {
        throw new Error('Token appears to be a honeypot');
      }

      // Execute swap
      const txHash = await this.dexService.executeSwap({
        tokenIn: execution.type === 'buy' ? '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' : config.tokenAddress, // WETH or token
        tokenOut: execution.type === 'buy' ? config.tokenAddress : '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Token or WETH
        amountIn: config.amount,
        slippage: config.slippage,
        recipient: await this.signer.getAddress()
      });

      execution.txHash = txHash;
      execution.status = 'success';
      
      // Deactivate snipe after successful execution
      config.isActive = false;

      console.log(`✅ Trade executed: ${config.symbol} - ${execution.type} - ${txHash}`);
    } catch (error: any) {
      execution.status = 'failed';
      execution.error = error.message;
      console.error(`❌ Trade failed: ${config.symbol} - ${error.message}`);
    }

    this.executedTrades.set(executionId, execution);
  }
}

/**
 * Factory function to create SnipeEngineService
 */
export function createSnipeEngineService(
  provider: any,
  signer: any,
  options: SnipeEngineOptions
): SnipeEngineService {
  return new SnipeEngineService(provider, signer, options);
}
