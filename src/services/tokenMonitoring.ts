/**
 * Token Monitoring Service
 * Real-time price tracking and alerts using native Web3
 */

interface TokenData {
  address: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  holders: number;
  lastUpdated: number;
}

interface PriceAlert {
  id: string;
  tokenAddress: string;
  symbol: string;
  type: 'above' | 'below' | 'change';
  threshold: number;
  isActive: boolean;
  triggered: boolean;
  createdAt: number;
}

interface MonitoringOptions {
  interval: number; // Update interval in milliseconds
  priceAlerts: boolean;
  volumeAlerts: boolean;
  liquidityAlerts: boolean;
}

/**
 * Token Monitoring Service for real-time price tracking
 */
export class TokenMonitoringService {
  private provider: any;
  private monitoredTokens: Map<string, TokenData> = new Map();
  private priceAlerts: Map<string, PriceAlert> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private options: MonitoringOptions;

  constructor(provider: any, options: MonitoringOptions) {
    this.provider = provider;
    this.options = options;
  }

  /**
   * Start monitoring tokens
   */
  startMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      await this.updateAllTokens();
      this.checkPriceAlerts();
    }, this.options.interval);

    console.log('🔄 Token monitoring started');
  }

  /**
   * Stop monitoring tokens
   */
  stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    console.log('⏹️ Token monitoring stopped');
  }

  /**
   * Add token to monitoring list
   */
  async addToken(tokenAddress: string): Promise<void> {
    try {
      const tokenData = await this.fetchTokenData(tokenAddress);
      this.monitoredTokens.set(tokenAddress, tokenData);
      console.log(`✅ Added token ${tokenData.symbol} to monitoring`);
    } catch (error) {
      console.error('Error adding token to monitoring:', error);
      throw new Error(`Failed to add token: ${error}`);
    }
  }

  /**
   * Remove token from monitoring
   */
  removeToken(tokenAddress: string): void {
    this.monitoredTokens.delete(tokenAddress);
    
    // Remove related alerts
    Array.from(this.priceAlerts.entries()).forEach(([id, alert]) => {
      if (alert.tokenAddress === tokenAddress) {
        this.priceAlerts.delete(id);
      }
    });

    console.log(`❌ Removed token from monitoring: ${tokenAddress}`);
  }

  /**
   * Get current token data
   */
  getTokenData(tokenAddress: string): TokenData | null {
    return this.monitoredTokens.get(tokenAddress) || null;
  }

  /**
   * Get all monitored tokens
   */
  getAllTokens(): TokenData[] {
    return Array.from(this.monitoredTokens.values());
  }

  /**
   * Add price alert
   */
  addPriceAlert(
    tokenAddress: string,
    symbol: string,
    type: 'above' | 'below' | 'change',
    threshold: number
  ): string {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: PriceAlert = {
      id: alertId,
      tokenAddress,
      symbol,
      type,
      threshold,
      isActive: true,
      triggered: false,
      createdAt: Date.now()
    };

    this.priceAlerts.set(alertId, alert);
    console.log(`🔔 Price alert created for ${symbol}`);
    
    return alertId;
  }

  /**
   * Remove price alert
   */
  removePriceAlert(alertId: string): void {
    this.priceAlerts.delete(alertId);
    console.log(`🔕 Price alert removed: ${alertId}`);
  }

  /**
   * Get all price alerts
   */
  getPriceAlerts(): PriceAlert[] {
    return Array.from(this.priceAlerts.values());
  }

  /**
   * Fetch token data from blockchain
   */
  private async fetchTokenData(tokenAddress: string): Promise<TokenData> {
    try {
      // Get token info
      const symbol = await this.getTokenSymbol(tokenAddress);
      const price = await this.getTokenPrice(tokenAddress);
      const volume = await this.getTokenVolume(tokenAddress);
      const liquidity = await this.getTokenLiquidity(tokenAddress);

      return {
        address: tokenAddress,
        symbol,
        price,
        priceChange24h: Math.random() * 20 - 10, // Mock data
        volume24h: volume,
        marketCap: price * 1000000, // Mock calculation
        liquidity,
        holders: Math.floor(Math.random() * 10000), // Mock data
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.error('Error fetching token data:', error);
      throw error;
    }
  }

  /**
   * Get token symbol
   */
  private async getTokenSymbol(tokenAddress: string): Promise<string> {
    try {
      const symbolCall = {
        to: tokenAddress,
        data: '0x95d89b41' // symbol()
      };

      const result = await this.provider.request({
        method: 'eth_call',
        params: [symbolCall, 'latest']
      });

      return this.decodeString(result);
    } catch (error) {
      return 'UNKNOWN';
    }
  }

  /**
   * Get token price (simplified)
   */
  private async getTokenPrice(tokenAddress: string): Promise<number> {
    try {
      // In production, you'd call a price oracle or DEX
      // For now, returning mock price with some volatility
      return Math.random() * 100 + 1;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get token volume (simplified)
   */
  private async getTokenVolume(tokenAddress: string): Promise<number> {
    try {
      // Mock volume data
      return Math.random() * 1000000;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get token liquidity (simplified)
   */
  private async getTokenLiquidity(tokenAddress: string): Promise<number> {
    try {
      // Mock liquidity data
      return Math.random() * 500000;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Update all monitored tokens
   */
  private async updateAllTokens(): Promise<void> {
    const updatePromises = Array.from(this.monitoredTokens.keys()).map(async (tokenAddress) => {
      try {
        const updatedData = await this.fetchTokenData(tokenAddress);
        this.monitoredTokens.set(tokenAddress, updatedData);
      } catch (error) {
        console.error(`Error updating token ${tokenAddress}:`, error);
      }
    });

    await Promise.all(updatePromises);
  }

  /**
   * Check price alerts
   */
  private checkPriceAlerts(): void {
    this.priceAlerts.forEach((alert) => {
      if (!alert.isActive || alert.triggered) return;

      const tokenData = this.monitoredTokens.get(alert.tokenAddress);
      if (!tokenData) return;

      let shouldTrigger = false;

      switch (alert.type) {
        case 'above':
          shouldTrigger = tokenData.price > alert.threshold;
          break;
        case 'below':
          shouldTrigger = tokenData.price < alert.threshold;
          break;
        case 'change':
          shouldTrigger = Math.abs(tokenData.priceChange24h) > alert.threshold;
          break;
      }

      if (shouldTrigger) {
        alert.triggered = true;
        this.triggerAlert(alert, tokenData);
      }
    });
  }

  /**
   * Trigger price alert
   */
  private triggerAlert(alert: PriceAlert, tokenData: TokenData): void {
    console.log(`🚨 Price alert triggered: ${alert.symbol} - ${alert.type} ${alert.threshold}`);
    
    // You can add notification logic here
    // For example, browser notifications, email, etc.
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Price Alert: ${alert.symbol}`, {
        body: `Price is ${alert.type} ${alert.threshold}`,
        icon: '/favicon.ico'
      });
    }
  }

  /**
   * Decode hex string to readable string
   */
  private decodeString(hex: string): string {
    try {
      const bytes = hex.slice(2);
      const length = parseInt(bytes.slice(64, 128), 16);
      const data = bytes.slice(128, 128 + length * 2);
      return Buffer.from(data, 'hex').toString('utf8');
    } catch (error) {
      return 'Unknown';
    }
  }
}

/**
 * Factory function to create TokenMonitoringService
 */
export function createTokenMonitoringService(
  provider: any,
  options: MonitoringOptions
): TokenMonitoringService {
  return new TokenMonitoringService(provider, options);
}
