/**
 * Subscription management hook
 * - Loads and persists subscription data in localStorage.
 * - Auto-downgrades to Free when a subscription expires (except for creator override).
 * - Provides helpers for plan upgrades, cancellation, and payment method updates.
 */

import { useState, useEffect, useCallback } from 'react';
import { SUBSCRIPTION_PLANS, type Subscription, type SubscriptionPlan, type PaymentIntent } from '../types/subscription';

/** Hook return shape for subscription context */
interface SubscriptionContextType {
  /** Current subscription or null if none/expired */
  subscription: Subscription | null;
  /** Derived plan object (free when no active subscription unless creator) */
  plan: SubscriptionPlan;
  /** Loading state for async operations */
  loading: boolean;
  /** Human-readable error message */
  error: string | null;
  /** Check if user can access a limited feature */
  canAccessFeature: (feature: keyof SubscriptionPlan['limits']) => boolean;
  /** Request upgrade to Pro plan (simulated) */
  upgradeToProPlan: () => Promise<PaymentIntent | null>;
  /** Request upgrade to Premium plan (simulated) */
  upgradeToPremiumPlan: () => Promise<PaymentIntent | null>;
  /** Schedule cancel at period end */
  cancelSubscription: () => Promise<boolean>;
  /** Update payment method identifier */
  updatePaymentMethod: (paymentMethodId: string) => Promise<boolean>;
}

/** Determine if a subscription is currently active and not expired */
function isActive(sub?: Subscription | null): boolean {
  return !!sub && sub.status === 'active' && sub.currentPeriodEnd > Date.now();
}

/** LocalStorage key builder */
function subKey(userId: string) {
  return `cryptosniper_subscription_${userId}`;
}

export function useSubscription(userId?: string): SubscriptionContextType {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derived plan: if active subscription found, use it; otherwise free
  const plan = subscription
    ? SUBSCRIPTION_PLANS[subscription.planId] || SUBSCRIPTION_PLANS.free
    : SUBSCRIPTION_PLANS.free;

  /**
   * Load subscription data from storage/API
   * - Validates expiry and active status
   * - Creator gets a long-lived Premium override
   */
  const loadSubscription = useCallback(async () => {
    if (!userId) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Creator override: grant premium for 1 year (never auto-downgrade here)
      if (userId === 'creator_admin_001') {
        const creatorSub: Subscription = {
          id: 'creator_subscription',
          userId,
          planId: 'premium',
          status: 'active',
          currentPeriodStart: Date.now(),
          currentPeriodEnd: Date.now() + 365 * 24 * 60 * 60 * 1000,
          cancelAtPeriodEnd: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setSubscription(creatorSub);
        try {
          localStorage.setItem(subKey(userId), JSON.stringify(creatorSub));
        } catch {
          // ignore storage errors
        }
        return;
      }

      // Regular users: check localStorage and validate
      const stored = localStorage.getItem(subKey(userId));
      if (stored) {
        try {
          const sub = JSON.parse(stored) as Subscription;
          if (isActive(sub)) {
            setSubscription(sub);
            return;
          }
          // Clean up expired/stale subscription
          localStorage.removeItem(subKey(userId));
        } catch {
          // Malformed storage; remove it
          localStorage.removeItem(subKey(userId));
        }
      }

      // No active subscription
      setSubscription(null);
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
   * Auto-expire: when a non-creator subscription has an end time in the future,
   * schedule a timeout to invalidate it right at expiry, update state and storage.
   */
  useEffect(() => {
    if (!userId) return;
    if (userId === 'creator_admin_001') return; // never auto-downgrade creator
    if (!subscription) return;

    // If already not active, clear now and storage
    if (!isActive(subscription)) {
      setSubscription(null);
      try {
        localStorage.removeItem(subKey(userId));
      } catch {
        // ignore
      }
      return;
    }

    const msUntilEnd = Math.max(0, subscription.currentPeriodEnd - Date.now());
    const timer = window.setTimeout(() => {
      setSubscription(null);
      try {
        localStorage.removeItem(subKey(userId));
      } catch {
        // ignore
      }
    }, msUntilEnd);

    return () => window.clearTimeout(timer);
  }, [userId, subscription?.id, subscription?.currentPeriodEnd, subscription?.status]);

  /**
   * Check if user can access a specific feature based on current plan limits.
   */
  const canAccessFeature = useCallback(
    (feature: keyof SubscriptionPlan['limits']): boolean => {
      return plan.limits[feature] as boolean;
    },
    [plan]
  );

  /**
   * Upgrade to Pro plan (simulation)
   * - Creates a payment intent and simulates activation after 2s.
   * - Persists to localStorage under the user's key.
   */
  const upgradeToProPlan = useCallback(async (): Promise<PaymentIntent | null> => {
    if (!userId) return null;

    try {
      setLoading(true);

      const paymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: SUBSCRIPTION_PLANS.pro.price * 100,
        currency: 'usd',
        status: 'requires_payment_method',
        metadata: {
          userId,
          planId: 'pro',
          upgrade: true,
        },
      };

      // Simulate processor confirmation -> activate subscription
      setTimeout(() => {
        const newSubscription: Subscription = {
          id: `sub_${Date.now()}`,
          userId,
          planId: 'pro',
          status: 'active',
          currentPeriodStart: Date.now(),
          currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
          cancelAtPeriodEnd: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        setSubscription(newSubscription);
        try {
          localStorage.setItem(subKey(userId), JSON.stringify(newSubscription));
        } catch {
          // ignore write errors
        }
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
   * Upgrade to Premium plan (simulation)
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
          upgrade: true,
        },
      };

      // Simulate activation
      setTimeout(() => {
        const newSubscription: Subscription = {
          id: `sub_${Date.now()}`,
          userId,
          planId: 'premium',
          status: 'active',
          currentPeriodStart: Date.now(),
          currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
          cancelAtPeriodEnd: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        setSubscription(newSubscription);
        try {
          localStorage.setItem(subKey(userId), JSON.stringify(newSubscription));
        } catch {
          // ignore write errors
        }
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
   * Cancel subscription at period end (simulation)
   */
  const cancelSubscription = useCallback(async (): Promise<boolean> => {
    if (!subscription || !userId) return false;

    try {
      setLoading(true);

      const updatedSubscription = {
        ...subscription,
        cancelAtPeriodEnd: true,
        updatedAt: Date.now(),
      };

      setSubscription(updatedSubscription);
      try {
        localStorage.setItem(subKey(userId), JSON.stringify(updatedSubscription));
      } catch {
        // ignore write errors
      }

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
   * Update payment method (simulation)
   */
  const updatePaymentMethod = useCallback(async (_paymentMethodId: string): Promise<boolean> => {
    if (!subscription) return false;

    try {
      setLoading(true);
      // In real implementation, send payment method to backend
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
    updatePaymentMethod,
  };
}

export default useSubscription;
