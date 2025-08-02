/**
 * Subscription management hook
 */

import { useState, useEffect, useCallback } from 'react';
import { SUBSCRIPTION_PLANS, type Subscription, type SubscriptionPlan, type PaymentIntent } from '../types/subscription';

interface SubscriptionContextType {
  subscription: Subscription | null;
  plan: SubscriptionPlan;
  loading: boolean;
  error: string | null;
  canAccessFeature: (feature: keyof SubscriptionPlan['limits']) => boolean;
  upgradeToProPlan: () => Promise<PaymentIntent | null>;
  upgradeToPremiumPlan: () => Promise<PaymentIntent | null>;
  cancelSubscription: () => Promise<boolean>;
  updatePaymentMethod: (paymentMethodId: string) => Promise<boolean>;
}

export function useSubscription(userId?: string): SubscriptionContextType {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current subscription plan
  const plan = subscription ? SUBSCRIPTION_PLANS[subscription.planId] || SUBSCRIPTION_PLANS.free : SUBSCRIPTION_PLANS.free;

  /**
   * Load subscription data from storage/API
   */
  const loadSubscription = useCallback(async () => {
    if (!userId) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Check localStorage first
      const stored = localStorage.getItem(`cryptosniper_subscription_${userId}`);
      if (stored) {
        const sub = JSON.parse(stored);
        // Validate subscription is still active
        if (sub.currentPeriodEnd > Date.now() && sub.status === 'active') {
          setSubscription(sub);
          setLoading(false);
          return;
        }
      }

      // For creator account, give premium access
      if (userId === 'creator_admin_001') {
        const creatorSub: Subscription = {
          id: 'creator_subscription',
          userId: userId,
          planId: 'premium',
          status: 'active',
          currentPeriodStart: Date.now(),
          currentPeriodEnd: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year
          cancelAtPeriodEnd: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        setSubscription(creatorSub);
        localStorage.setItem(`cryptosniper_subscription_${userId}`, JSON.stringify(creatorSub));
      } else {
        // Regular users default to free plan
        setSubscription(null);
      }

    } catch (err) {
      console.error('Error loading subscription:', err);
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  /**
   * Check if user can access a specific feature
   */
  const canAccessFeature = useCallback((feature: keyof SubscriptionPlan['limits']): boolean => {
    return plan.limits[feature] as boolean;
  }, [plan]);

  /**
   * Upgrade to Pro plan
   */
  const upgradeToProPlan = useCallback(async (): Promise<PaymentIntent | null> => {
    if (!userId) return null;

    try {
      setLoading(true);
      
      // Create payment intent for Pro plan
      const paymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: SUBSCRIPTION_PLANS.pro.price * 100, // Amount in cents
        currency: 'usd',
        status: 'requires_payment_method',
        metadata: {
          userId,
          planId: 'pro',
          upgrade: true
        }
      };

      // In production, this would call your payment processor (Stripe, etc.)
      // For now, we'll simulate successful payment
      setTimeout(() => {
        const newSubscription: Subscription = {
          id: `sub_${Date.now()}`,
          userId,
          planId: 'pro',
          status: 'active',
          currentPeriodStart: Date.now(),
          currentPeriodEnd: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
          cancelAtPeriodEnd: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        setSubscription(newSubscription);
        localStorage.setItem(`cryptosniper_subscription_${userId}`, JSON.stringify(newSubscription));
      }, 2000);

      return paymentIntent;

    } catch (err) {
      console.error('Error upgrading to Pro:', err);
      setError('Failed to upgrade subscription');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Upgrade to Premium plan
   */
  const upgradeToPremiumPlan = useCallback(async (): Promise<PaymentIntent | null> => {
    if (!userId) return null;

    try {
      setLoading(true);
      
      const paymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: SUBSCRIPTION_PLANS.premium.price * 100,
        currency: 'usd',
        status: 'requires_payment_method',
        metadata: {
          userId,
          planId: 'premium',
          upgrade: true
        }
      };

      // Simulate payment processing
      setTimeout(() => {
        const newSubscription: Subscription = {
          id: `sub_${Date.now()}`,
          userId,
          planId: 'premium',
          status: 'active',
          currentPeriodStart: Date.now(),
          currentPeriodEnd: Date.now() + (30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        setSubscription(newSubscription);
        localStorage.setItem(`cryptosniper_subscription_${userId}`, JSON.stringify(newSubscription));
      }, 2000);

      return paymentIntent;

    } catch (err) {
      console.error('Error upgrading to Premium:', err);
      setError('Failed to upgrade subscription');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Cancel subscription
   */
  const cancelSubscription = useCallback(async (): Promise<boolean> => {
    if (!subscription) return false;

    try {
      setLoading(true);
      
      const updatedSubscription = {
        ...subscription,
        cancelAtPeriodEnd: true,
        updatedAt: Date.now()
      };

      setSubscription(updatedSubscription);
      localStorage.setItem(`cryptosniper_subscription_${userId}`, JSON.stringify(updatedSubscription));
      
      return true;

    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError('Failed to cancel subscription');
      return false;
    } finally {
      setLoading(false);
    }
  }, [subscription, userId]);

  /**
   * Update payment method
   */
  const updatePaymentMethod = useCallback(async (paymentMethodId: string): Promise<boolean> => {
    if (!subscription) return false;

    try {
      setLoading(true);
      
      // Update payment method logic would go here
      // For now, just return success
      return true;

    } catch (err) {
      console.error('Error updating payment method:', err);
      setError('Failed to update payment method');
      return false;
    } finally {
      setLoading(false);
    }
  }, [subscription]);

  return {
    subscription,
    plan,
    loading,
    error,
    canAccessFeature,
    upgradeToProPlan,
    upgradeToPremiumPlan,
    cancelSubscription,
    updatePaymentMethod
  };
}

export default useSubscription;
