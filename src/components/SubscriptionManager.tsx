/**
 * Comprehensive subscription and billing management component
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CreditCard, 
  Crown, 
  Check, 
  X, 
  Zap, 
  Shield, 
  Star,
  Wallet,
  TrendingUp,
  Users,
  AlertTriangle
} from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { SUBSCRIPTION_PLANS } from '../types/subscription';
import { paymentService } from '../services/paymentService';
import { realTradingService } from '../services/realTradingService';

interface SubscriptionManagerProps {
  userId: string;
  onPlanChange?: (planId: string) => void;
}

export function SubscriptionManager({ userId, onPlanChange }: SubscriptionManagerProps) {
  const { 
    subscription, 
    plan, 
    loading, 
    upgradeToProPlan, 
    upgradeToPremiumPlan, 
    cancelSubscription 
  } = useSubscription(userId);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'premium' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'crypto'>('stripe');
  const [realTradingConnected, setRealTradingConnected] = useState(false);

  // Initialize payment service
  useEffect(() => {
    paymentService.initialize();
  }, []);

  // Check real trading connection for premium users
  useEffect(() => {
    if (plan.limits.realTrading) {
      checkRealTradingConnection();
    }
  }, [plan.limits.realTrading]);

  const checkRealTradingConnection = async () => {
    const connected = await realTradingService.initialize(true);
    setRealTradingConnected(connected);
  };

  const handleUpgrade = async (planType: 'pro' | 'premium') => {
    try {
      setPaymentLoading(true);
      setSelectedPlan(planType);
      setShowPaymentOptions(true);
    } catch (error) {
      console.error('Error initiating upgrade:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const processPayment = async () => {
    if (!selectedPlan) return;

    try {
      setPaymentLoading(true);

      let paymentIntent;
      if (selectedPlan === 'pro') {
        paymentIntent = await upgradeToProPlan();
      } else {
        paymentIntent = await upgradeToPremiumPlan();
      }

      if (paymentIntent) {
        // Simulate payment processing
        if (paymentMethod === 'stripe') {
          // In production, would use Stripe Elements
          setTimeout(() => {
            setShowPaymentOptions(false);
            setSelectedPlan(null);
            onPlanChange?.(selectedPlan);
          }, 2000);
        } else if (paymentMethod === 'crypto') {
          // Process crypto payment
          const amount = selectedPlan === 'pro' ? 0.008 : 0.028; // ETH equivalent
          const txHash = await paymentService.processCryptoPayment(amount, 'ETH', '');
          if (txHash) {
            setShowPaymentOptions(false);
            setSelectedPlan(null);
            onPlanChange?.(selectedPlan);
          }
        }
      }
    } catch (error) {
      console.error('Payment processing error:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      await cancelSubscription();
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Current Plan
            </div>
            {subscription && (
              <Badge 
                variant={subscription.status === 'active' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {subscription.status}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">{plan.name} Plan</h3>
              <p className="text-slate-400">${plan.price}/month</p>
            </div>
            {plan.id !== 'free' && subscription && (
              <div className="text-right">
                <p className="text-sm text-slate-400">Next billing</p>
                <p className="text-white font-medium">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Plan Features */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-300">Included Features:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Real Trading Status for Premium Users */}
          {plan.limits.realTrading && (
            <Alert className={realTradingConnected ? 'border-green-600 bg-green-900/20' : 'border-yellow-600 bg-yellow-900/20'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {realTradingConnected ? (
                  <span className="text-green-400">✅ Real trading enabled - Connected to Ethereum mainnet</span>
                ) : (
                  <span className="text-yellow-400">⚠️ Connect your wallet to enable real trading on mainnet</span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(SUBSCRIPTION_PLANS).map((planOption) => {
          const isCurrent = plan.id === planOption.id;
          const isUpgrade = plan.price < planOption.price;
          
          return (
            <Card 
              key={planOption.id} 
              className={`relative ${
                planOption.id === 'pro' 
                  ? 'border-blue-500 bg-slate-900' 
                  : planOption.id === 'premium'
                  ? 'border-purple-500 bg-slate-900'
                  : 'border-slate-700 bg-slate-900'
              }`}
            >
              {planOption.id === 'pro' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  Most Popular
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-center text-white">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {planOption.id === 'premium' && <Crown className="h-5 w-5 text-purple-400" />}
                    {planOption.id === 'pro' && <Zap className="h-5 w-5 text-blue-400" />}
                    {planOption.id === 'free' && <Star className="h-5 w-5 text-slate-400" />}
                    {planOption.name}
                  </div>
                  <div className="text-3xl font-bold">
                    ${planOption.price}
                    <span className="text-lg text-slate-400">/mo</span>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {planOption.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Max Configs:</span>
                    <span>{planOption.limits.maxSnipeConfigs === -1 ? 'Unlimited' : planOption.limits.maxSnipeConfigs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Trades:</span>
                    <span>{planOption.limits.maxDailyTrades === -1 ? 'Unlimited' : planOption.limits.maxDailyTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Real Trading:</span>
                    <span>{planOption.limits.realTrading ? '✅' : '❌'}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {isCurrent ? (
                    <div className="space-y-2">
                      <Button 
                        className="w-full bg-slate-600 cursor-not-allowed"
                        disabled
                      >
                        Current Plan
                      </Button>
                      {subscription && planOption.id !== 'free' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          className="w-full text-red-400 border-red-600 hover:bg-red-600"
                        >
                          Cancel Subscription
                        </Button>
                      )}
                    </div>
                  ) : isUpgrade ? (
                    <Button
                      className={`w-full ${
                        planOption.id === 'pro' 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                      onClick={() => handleUpgrade(planOption.id as 'pro' | 'premium')}
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? 'Processing...' : `Upgrade to ${planOption.name}`}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full border-slate-600 text-slate-400 cursor-not-allowed"
                      disabled
                    >
                      Downgrade Not Available
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Options Modal */}
      {showPaymentOptions && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Complete Payment</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPaymentOptions(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-slate-800 rounded-lg">
                <h3 className="text-xl font-bold text-white">
                  {SUBSCRIPTION_PLANS[selectedPlan].name} Plan
                </h3>
                <p className="text-3xl font-bold text-blue-400 mt-2">
                  ${SUBSCRIPTION_PLANS[selectedPlan].price}/month
                </p>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">Choose Payment Method:</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('stripe')}
                    className="h-16 flex-col gap-1"
                  >
                    <CreditCard className="h-5 w-5" />
                    <span className="text-xs">Credit Card</span>
                  </Button>
                  
                  <Button
                    variant={paymentMethod === 'crypto' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('crypto')}
                    className="h-16 flex-col gap-1"
                  >
                    <Wallet className="h-5 w-5" />
                    <span className="text-xs">Crypto (ETH)</span>
                  </Button>
                </div>
              </div>

              {/* Payment Details */}
              <div className="text-xs text-slate-400 space-y-1">
                {paymentMethod === 'stripe' ? (
                  <>
                    <p>💳 Secure payment processing by Stripe</p>
                    <p>🔒 Your payment info is never stored</p>
                    <p>🔄 Cancel anytime, no long-term commitment</p>
                  </>
                ) : (
                  <>
                    <p>🪙 Pay with Ethereum directly</p>
                    <p>💰 Price: ~{selectedPlan === 'pro' ? '0.008' : '0.028'} ETH</p>
                    <p>🔒 Transaction sent to secure creator wallet</p>
                  </>
                )}
              </div>

              {/* Creator Earnings Notice */}
              <Alert className="border-green-600 bg-green-900/20">
                <TrendingUp className="h-4 w-4" />
                <AlertDescription className="text-sm text-green-400">
                  💚 Your payment directly supports the creator and platform development
                </AlertDescription>
              </Alert>

              {/* Process Payment */}
              <Button
                onClick={processPayment}
                disabled={paymentLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {paymentLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing Payment...
                  </div>
                ) : (
                  `Pay $${SUBSCRIPTION_PLANS[selectedPlan].price} & Upgrade`
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default SubscriptionManager;
