/**
 * Wix integration utilities for CryptoSniperPro
 */

export interface WixUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  avatar?: string;
}

export class WixIntegration {
  private static instance: WixIntegration;
  private isWixEnvironment: boolean;

  constructor() {
    this.isWixEnvironment = typeof window !== 'undefined' && window.location.hostname.includes('wix');
  }

  static getInstance(): WixIntegration {
    if (!WixIntegration.instance) {
      WixIntegration.instance = new WixIntegration();
    }
    return WixIntegration.instance;
  }

  /**
   * Check if running in Wix environment
   */
  isWix(): boolean {
    return this.isWixEnvironment;
  }

  /**
   * Get current Wix member
   */
  async getCurrentMember(): Promise<WixUser | null> {
    if (!this.isWixEnvironment) {
      return null;
    }

    try {
      // Call Wix backend function
      const response = await fetch('/_functions/getCurrentMember', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get Wix member:', error);
    }

    return null;
  }

  /**
   * Save snipe configuration to Wix database
   */
  async saveSnipeConfig(config: any): Promise<boolean> {
    if (!this.isWixEnvironment) {
      return false;
    }

    try {
      const response = await fetch('/_functions/saveSnipeConfig', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(config)
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to save snipe config:', error);
      return false;
    }
  }

  /**
   * Get user's snipe configurations
   */
  async getSnipeConfigs(): Promise<any[]> {
    if (!this.isWixEnvironment) {
      return [];
    }

    try {
      const response = await fetch('/_functions/getSnipeConfigs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get snipe configs:', error);
    }

    return [];
  }

  /**
   * Redirect to Wix pricing plans
   */
  redirectToUpgrade(planType: 'pro' | 'premium'): void {
    if (this.isWixEnvironment) {
      // Redirect to Wix pricing plans page
      window.location.href = `/pricing?plan=${planType}`;
    }
  }

  /**
   * Initialize Wix integration
   */
  async initialize(): Promise<void> {
    if (!this.isWixEnvironment) {
      return;
    }

    // Set up Wix-specific configurations
    console.log('Initializing Wix integration...');
    
    // Wait for Wix to be ready
    if (typeof window !== 'undefined' && (window as any).wixDevelopersAnalytics) {
      console.log('Wix environment detected');
    }
  }
}

export default WixIntegration;
