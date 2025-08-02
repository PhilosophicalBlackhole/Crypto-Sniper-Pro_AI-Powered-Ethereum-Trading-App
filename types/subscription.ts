/**
 * Subscription and payment types for CryptoSniper Pro
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: 'USD' | 'ETH';
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    maxSnipeConfigs: number;
    maxDailyTrades: number;
    realTrading: boolean;
    mevProtection: boolean;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
  };
}

export interface PaymentProvider {
  id: string;
  name: string;
  type: 'stripe' | 'coinbase' | 'paypal' | 'crypto';
  enabled: boolean;
  testMode: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  trialEnd?: number;
  paymentMethod?: PaymentMethod;
  createdAt: number;
  updatedAt: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'crypto' | 'paypal';
  last4?: string;
  brand?: string;
  cryptoAddress?: string;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentDate?: number;
  dueDate: number;
  description: string;
  invoiceUrl?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret?: string;
  paymentMethod?: PaymentMethod;
  metadata: Record<string, any>;
}

// Predefined subscription plans
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Demo trading',
      'Testnet access',
      'Basic tutorials',
      '5 saved configs',
      'Community access'
    ],
    limits: {
      maxSnipeConfigs: 5,
      maxDailyTrades: 10,
      realTrading: false,
      mevProtection: false,
      prioritySupport: false,
      advancedAnalytics: false
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Real mainnet trading',
      'Unlimited configs',
      'Advanced analytics',
      'Priority support',
      'All tutorials',
      'Discord access'
    ],
    limits: {
      maxSnipeConfigs: -1, // unlimited
      maxDailyTrades: 100,
      realTrading: true,
      mevProtection: false,
      prioritySupport: true,
      advancedAnalytics: true
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Everything in Pro',
      'MEV protection',
      'Custom strategies',
      'Dedicated support',
      'Early access features',
      'Personal consultation'
    ],
    limits: {
      maxSnipeConfigs: -1,
      maxDailyTrades: -1, // unlimited
      realTrading: true,
      mevProtection: true,
      prioritySupport: true,
      advancedAnalytics: true
    }
  }
};
