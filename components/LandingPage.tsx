/**
 * Landing page component for CryptoSniperPro
 * Handles marketing, features showcase, and subscription signup
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  Star, 
  Check, 
  ArrowRight,
  Target,
  Clock,
  Award,
  BarChart3,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignUp: () => void;
  onLogin: () => void;
}

export function LandingPage({ onGetStarted, onSignUp, onLogin }: LandingPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'premium'>('pro');

  const features = [
    {
      icon: Target,
      title: "Smart Sniping",
      description: "AI-powered token sniping with precision timing and MEV protection"
    },
    {
      icon: Shield,
      title: "Secure & Non-Custodial",
      description: "Your keys, your crypto. We never hold your funds"
    },
    {
      icon: Clock,
      title: "Real-Time Monitoring",
      description: "24/7 market surveillance with instant execution"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Deep market insights and trading performance metrics"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join thousands of successful crypto traders"
    },
    {
      icon: BookOpen,
      title: "Educational Resources",
      description: "Learn from experts with comprehensive tutorials"
    }
  ];

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Demo trading mode',
        'Basic market data',
        'Limited snipe configs (3)',
        'Community access',
        'Basic tutorials'
      ],
      buttonText: 'Get Started Free',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29',
      period: 'month',
      description: 'For serious traders',
      features: [
        'Real trading with live funds',
        'Unlimited snipe configurations',
        'Advanced analytics & reporting',
        'Priority customer support',
        'All educational content',
        'Advanced gas optimization',
        'Multi-wallet support'
      ],
      buttonText: 'Start Pro Trial',
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$79',
      period: 'month',
      description: 'Maximum performance',
      features: [
        'Everything in Pro',
        'White-glove setup assistance',
        'Custom trading strategies',
        'Private Discord access',
        'Weekly strategy calls',
        'API access for automation',
        'Advanced risk management tools'
      ],
      buttonText: 'Go Premium',
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "DeFi Trader",
      content: "CryptoSniperPro helped me catch 3 100x tokens in the first month. The precision is incredible.",
      rating: 5
    },
    {
      name: "Sarah Williams",
      role: "Crypto Investor",
      content: "Finally, a tool that actually works. The MEV protection alone saved me thousands.",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Professional Trader",
      content: "The analytics and reporting features are game-changing. Best investment I've made.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 light:from-blue-50 light:via-indigo-50 light:to-purple-50 transition-colors duration-500">
      {/* Header */}
      <header className="border-b border-slate-800 dark:border-slate-800 light:border-slate-200 bg-slate-900/50 dark:bg-slate-900/50 light:bg-white/95 backdrop-blur-sm transition-colors duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CryptoSniper Pro</h1>
                <p className="text-slate-400 text-sm">Advanced Ethereum Sniping</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle className="text-slate-300 dark:text-slate-300 light:text-slate-600" />
              <Button 
                onClick={onLogin}
                variant="ghost" 
                className="text-slate-300 hover:text-white dark:text-slate-300 dark:hover:text-white light:text-slate-700 light:hover:text-slate-900 light:hover:bg-slate-100 transition-colors"
              >
                Login
              </Button>
              <Button 
                onClick={onSignUp}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-4 bg-blue-600 text-white">
              🚀 Now Live: Advanced Sniping Engine
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Never Miss a <span className="text-blue-400">Gem</span> Again
            </h1>
            <p className="text-xl text-slate-300 dark:text-slate-300 light:text-slate-600 mb-8 max-w-2xl mx-auto transition-colors">
              Professional-grade crypto sniping bot with AI-powered timing, MEV protection, 
              and institutional-level security. Join thousands of successful traders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
              >
                Try Free Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={onSignUp}
                size="lg"
                variant="outline"
                className="border-blue-500 text-blue-400 hover:bg-blue-500/10 text-lg px-8 py-3"
              >
                Start Pro Trial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Professional Trading Tools
            </h2>
            <p className="text-slate-400 text-lg">
              Everything you need to dominate the crypto markets
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Choose Your Trading Edge
            </h2>
            <p className="text-slate-400 text-lg">
              Start free, upgrade when you're ready to trade with real funds
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative ${
                  plan.popular 
                    ? 'border-blue-500 bg-slate-900 ring-2 ring-blue-500/20' 
                    : 'bg-slate-900 border-slate-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400">/{plan.period}</span>
                  </div>
                  <p className="text-slate-400">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-400" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => plan.id === 'free' ? onGetStarted() : onSignUp()}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-slate-400 text-lg">
              See what our community is saying
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-900 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-slate-400 text-sm">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Sniping?
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Join the elite traders who never miss an opportunity
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onSignUp}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={onGetStarted}
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 text-lg px-8 py-3"
              >
                Try Demo First
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold">CryptoSniper Pro</span>
          </div>
          <p className="text-slate-400 text-sm">
            © 2024 CryptoSniper Pro. All rights reserved. Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
