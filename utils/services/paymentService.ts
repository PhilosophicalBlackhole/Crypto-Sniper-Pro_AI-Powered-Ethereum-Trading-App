/**
 * Payment service for handling subscriptions and payments
 */

import { PaymentIntent, PaymentMethod, Subscription } from '../types/subscription';

export interface PaymentConfig {
  stripePublishableKey: string;
  coinbaseApiKey?: string;
  paypalClientId?: string;
  creatorWalletAddress: string; // Your wallet address for receiving payments
  webhookSecret: string;
}

class PaymentService {
  private config: PaymentConfig;
  private initialized = false;

  constructor() {
    // Browser-safe environment variable access with fallbacks
    this.config = {
      stripePublishableKey: this.getEnvVar('REACT_APP_STRIPE_PUBLISHABLE_KEY') || 'pk_test_demo_stripe_key',
      coinbaseApiKey: this.getEnvVar('REACT_APP_COINBASE_API_KEY'),
      paypalClientId: this.getEnvVar('REACT_APP_PAYPAL_CLIENT_ID'),
      creatorWalletAddress: this.getEnvVar('REACT_APP_CREATOR_WALLET') || '0x742d35Cc6634C0532925a3b8D6Cd9b3F4c1a7f8D', // Your actual wallet
      webhookSecret: this.getEnvVar('REACT_APP_WEBHOOK_SECRET') || 'whsec_test_demo_secret'
    };
  }

  /**
   * Safe environment variable access for browser
   */
  private getEnvVar(key: string): string | undefined {
    try {
      // Check if we're in browser environment
      if (typeof window !== 'undefined') {
        // For browser environment, try to access from window object or fallback
        return (window as any).__ENV__?.[key] || undefined;
      }
      // For server-side rendering (shouldn't happen in this case)
      return undefined;
    } catch (error) {
      console.warn(`Failed to access environment variable ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Initialize payment providers
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize Stripe
      if (this.config.stripePublishableKey && window.Stripe) {
        const stripe = window.Stripe(this.config.stripePublishableKey);
        (window as any).stripeInstance = stripe;
      }

      // Initialize other payment providers as needed
      // PayPal, Coinbase Commerce, etc.

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize payment service:', error);
    }
  }

  /**
   * Create payment intent for subscription
   */
  async createPaymentIntent(
    amount: number,
    currency: string,
    planId: string,
    userId: string
  ): Promise<PaymentIntent | null> {
    try {
      // In production, this would call your backend API
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          planId,
          userId,
          creatorWallet: this.config.creatorWalletAddress
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      
      // Fallback for demo - simulate payment intent
      return {
        id: `pi_demo_${Date.now()}`,
        amount: amount * 100, // Convert to cents
        currency: currency.toLowerCase(),
        status: 'requires_payment_method',
        metadata: {
          planId,
          userId,
          creatorWallet: this.config.creatorWalletAddress
        }
      };
    }
  }

  /**
   * Process payment with Stripe
   */
  async processStripePayment(
    paymentIntentId: string,
    paymentMethod: PaymentMethod
  ): Promise<boolean> {
    try {
      const stripe = (window as any).stripeInstance;
      if (!stripe) throw new Error('Stripe not initialized');

      const { error } = await stripe.confirmCardPayment(paymentIntentId, {
        payment_method: {
          card: paymentMethod,
          billing_details: {
            // Add billing details
          },
        },
      });

      if (error) {
        console.error('Stripe payment error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error processing Stripe payment:', error);
      return false;
    }
  }

  /**
   * Process crypto payment
   */
  async processCryptoPayment(
    amount: number,
    currency: 'ETH' | 'BTC',
    userWallet: string
  ): Promise<string | null> {
    try {
      // For ETH payments
      if (currency === 'ETH' && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });

        const transactionParameters = {
          to: this.config.creatorWalletAddress,
          from: accounts[0],
          value: (amount * Math.pow(10, 18)).toString(16), // Convert ETH to wei
          gasPrice: '0x5208', // 21000 gwei
          gas: '0x5208', // 21000 gas limit
        };

        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [transactionParameters],
        });

        return txHash;
      }

      return null;
    } catch (error) {
      console.error('Error processing crypto payment:', error);
      return null;
    }
  }

  /**
   * Verify payment webhook
   */
  async verifyWebhook(payload: string, signature: string): Promise<boolean> {
    try {
      // Verify webhook signature
      // This would use Stripe's webhook verification in production
      return true;
    } catch (error) {
      console.error('Error verifying webhook:', error);
      return false;
    }
  }

  /**
   * Handle successful payment
   */
  async handleSuccessfulPayment(
    paymentIntentId: string,
    userId: string,
    planId: string
  ): Promise<Subscription | null> {
    try {
      // Create or update subscription
      const subscription: Subscription = {
        id: `sub_${Date.now()}`,
        userId,
        planId,
        status: 'active',
        currentPeriodStart: Date.now(),
        currentPeriodEnd: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
        cancelAtPeriodEnd: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Store subscription
      localStorage.setItem(`cryptosniper_subscription_${userId}`, JSON.stringify(subscription));

      // Send confirmation email (in production)
      // await this.sendConfirmationEmail(userId, subscription);

      // Update creator earnings tracking
      await this.trackCreatorEarnings(paymentIntentId, planId);

      return subscription;
    } catch (error) {
      console.error('Error handling successful payment:', error);
      return null;
    }
  }

  /**
   * Track creator earnings
   */
  private async trackCreatorEarnings(paymentIntentId: string, planId: string): Promise<void> {
    try {
      const earnings = {
        id: paymentIntentId,
        planId,
        amount: planId === 'pro' ? 29 : 99,
        currency: 'USD',
        timestamp: Date.now(),
        walletAddress: this.config.creatorWalletAddress
      };

      // Store earnings record
      const existingEarnings = JSON.parse(localStorage.getItem('cryptosniper_creator_earnings') || '[]');
      existingEarnings.push(earnings);
      localStorage.setItem('cryptosniper_creator_earnings', JSON.stringify(existingEarnings));

    } catch (error) {
      console.error('Error tracking creator earnings:', error);
    }
  }

  /**
   * Get creator earnings summary
   */
  async getCreatorEarnings(): Promise<{
    total: number;
    monthly: number;
    subscribers: number;
  }> {
    try {
      const earnings = JSON.parse(localStorage.getItem('cryptosniper_creator_earnings') || '[]');
      const now = Date.now();
      const monthAgo = now - (30 * 24 * 60 * 60 * 1000);

      const total = earnings.reduce((sum: number, earning: any) => sum + earning.amount, 0);
      const monthly = earnings
        .filter((earning: any) => earning.timestamp > monthAgo)
        .reduce((sum: number, earning: any) => sum + earning.amount, 0);
      
      // Count active subscribers
      const subscribers = Object.keys(localStorage)
        .filter(key => key.startsWith('cryptosniper_subscription_'))
        .filter(key => {
          const sub = JSON.parse(localStorage.getItem(key) || '{}');
          return sub.status === 'active' && sub.currentPeriodEnd > now;
        }).length;

      return { total, monthly, subscribers };
    } catch (error) {
      console.error('Error getting creator earnings:', error);
      return { total: 0, monthly: 0, subscribers: 0 };
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;
