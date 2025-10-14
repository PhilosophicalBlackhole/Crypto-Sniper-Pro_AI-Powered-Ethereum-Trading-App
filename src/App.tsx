import { HashRouter, Route, Routes } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { UserDashboard } from './components/UserDashboard';
import { TransactionHistory } from './components/TransactionHistory';
import { ThemeProvider } from './components/ThemeProvider';
import { DynamicBackground } from './components/DynamicBackground';
import { MobileAffiliateBanner } from './components/MobileAffiliateBanner';
import { TokenTicker } from './components/TokenTicker';
import { SubscriptionManager } from './components/SubscriptionManager';
import { TutorialsPage } from './components/TutorialsPage';
import Home from './pages/Home';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { Toaster, toast } from 'sonner';
// NEW: plan + subscription sync
import { useSubscription } from './hooks/useSubscription';
import { useUserPlan } from './store/useUserPlan';

type AppState = 'landing' | 'demo' | 'authenticated';

interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'premium';
  avatar?: string | null;
}

/**
 * App - root of the application with routing, theme, background, and global toasts.
 * - Adds a safety check to invalidate any legacy "creator_admin_001" sessions.
 * - NEW: Keeps user's plan in sync across subscription, store, and local session.
 */
export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Network status for global notifications
  const { chainId, isMainnet, networkName } = useNetworkStatus();
  const lastChainIdRef = useRef<number | null>(null);

  // NEW: Access store plan and subscription for synchronization
  const { plan: storePlan, setPlan: setStorePlan } = useUserPlan();
  const { subscription } = useSubscription(user?.id);

  // Toast on network change
  useEffect(() => {
    const prev = lastChainIdRef.current;
    if (chainId === prev) return;

    if (chainId == null) {
      if (prev != null) {
        toast('Wallet disconnected', {
          description: 'No active network detected.',
        });
      }
    } else if (isMainnet) {
      toast.success('Switched to Ethereum Mainnet', {
        description: 'Live trading enabled — real funds at risk.',
      });
    } else {
      toast.warning(`Connected to ${networkName}`, {
        description: 'Test environment — safe practice with test tokens.',
      });
    }

    lastChainIdRef.current = chainId;
  }, [chainId, isMainnet, networkName]);

  // Check for stored user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('cryptosniper_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser) as User;

        // Security: invalidate any legacy creator session that may have been stored previously
        if (userData?.id === 'creator_admin_001') {
          localStorage.removeItem('cryptosniper_user');
          localStorage.removeItem('cryptosniper_remember_me');
        } else {
          setUser(userData);
          setAppState('authenticated');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('cryptosniper_user');
      }
    }
  }, []);

  /**
   * Plan synchronizer
   * Purpose: derive an effective plan primarily from subscription and persist across session.
   * Priority:
   * 1) Creator override (premium)
   * 2) Active subscription planId (pro|premium)
   * 3) Otherwise: free
   * Side-effects:
   * - Persist updated plan to cryptosniper_user
   * - Keep the local plan store aligned (forces 'free' if no active subscription)
   */
  useEffect(() => {
    if (!user) return;

    // Evaluate active subscription (ignore expired or inactive)
    const isActiveSub = !!(
      subscription &&
      subscription.status === 'active' &&
      subscription.currentPeriodEnd > Date.now()
    );

    const subPlan = isActiveSub ? (subscription.planId as User['plan']) : undefined;

    let next: User['plan'] = user.plan;

    if (user.id === 'creator_admin_001') {
      next = 'premium';
    } else if (subPlan === 'premium' || subPlan === 'pro') {
      next = subPlan;
    } else {
      // No active subscription: force Free (auto-downgrade)
      next = 'free';
    }

    // Persist user.plan when changed
    if (next !== user.plan) {
      setUser((prev) => (prev ? { ...prev, plan: next } : prev));
      try {
        const raw = localStorage.getItem('cryptosniper_user');
        if (raw) {
          const saved = JSON.parse(raw);
          saved.plan = next;
          localStorage.setItem('cryptosniper_user', JSON.stringify(saved));
        }
      } catch {
        // ignore storage errors
      }
    }

    // Keep the local plan store aligned with effective plan
    if (storePlan !== next) {
      setStorePlan(next as any);
    }
  }, [user, subscription?.planId, subscription?.status, subscription?.currentPeriodEnd, storePlan, setStorePlan]);

  /**
   * Pre-expiry notifications
   * - Show toast reminders as a subscription approaches expiry (7d, 3d, 1d, 12h, 1h).
   * - Excludes the creator override.
   * - Uses a per-(user,subscription) localStorage key to avoid duplicate reminders.
   */
  useEffect(() => {
    if (!user) return;
    if (user.id === 'creator_admin_001') return;
    if (!subscription || subscription.status !== 'active') return;

    const now = Date.now();
    const msLeft = subscription.currentPeriodEnd - now;
    if (msLeft <= 0) return;

    const DAY = 24 * 60 * 60 * 1000;
    const HOUR = 60 * 60 * 1000;
    const thresholds: Array<{ label: string; ms: number }> = [
      { label: '7d', ms: 7 * DAY },
      { label: '3d', ms: 3 * DAY },
      { label: '1d', ms: DAY },
      { label: '12h', ms: 12 * HOUR },
      { label: '1h', ms: HOUR },
    ];

    // Determine the current threshold reached
    let currentLabel: string | null = null;
    for (const t of thresholds) {
      if (msLeft <= t.ms) {
        currentLabel = t.label;
        break;
      }
    }
    if (!currentLabel) {
      // Clear previous notice tracker when out of window (>7d)
      try {
        localStorage.removeItem(`cryptosniper_expiry_notice_${user.id}_${subscription.id}`);
      } catch {
        // ignore
      }
      return;
    }

    const key = `cryptosniper_expiry_notice_${user.id}_${subscription.id}`;
    let prev: string | null = null;
    try {
      prev = localStorage.getItem(key);
    } catch {
      // ignore
    }
    if (prev === currentLabel) return;

    // Helper to format a concise duration
    const formatDuration = (ms: number) => {
      if (ms <= 0) return '0m';
      if (ms >= DAY) {
        const d = Math.floor(ms / DAY);
        const h = Math.floor((ms % DAY) / HOUR);
        return h > 0 ? `${d}d ${h}h` : `${d}d`;
      }
      if (ms >= HOUR) {
        const h = Math.floor(ms / HOUR);
        const m = Math.floor((ms % HOUR) / (60 * 1000));
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
      }
      const m = Math.max(1, Math.floor(ms / (60 * 1000)));
      return `${m}m`;
    };

    const planName = subscription.planId === 'premium' ? 'Premium' : 'Pro';
    toast.warning(`${planName} plan expiring soon`, {
      description: `Your ${planName} plan expires in ${formatDuration(msLeft)}. Renew to avoid auto-downgrade to Free.`,
      duration: 8000,
    });

    try {
      localStorage.setItem(key, currentLabel);
    } catch {
      // ignore
    }
  }, [user, subscription?.id, subscription?.status, subscription?.currentPeriodEnd]);

  const handleGetStarted = () => {
    setAppState('demo');
  };

  const handleSignUp = () => {
    setAuthModalTab('signup');
    setShowAuthModal(true);
  };

  const handleLogin = () => {
    setAuthModalTab('login');
    setShowAuthModal(true);
  };

  /**
   * Handle successful authentication: persist user session
   */
  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    setAppState('authenticated');
    setShowAuthModal(false);

    // Store user session
    localStorage.setItem('cryptosniper_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setAppState('landing');
    setCurrentPage('dashboard');

    // Clear stored session
    localStorage.removeItem('cryptosniper_user');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  /**
   * Render content according to app state and selection.
   */
  const renderContent = () => {
    if (appState === 'demo') {
      // Demo mode - show demo dashboard (no real wallet connection)
      return <Home />;
    }

    if (appState === 'authenticated' && user) {
      // Authenticated users get real trading access
      return (
        <UserDashboard
          user={user}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        >
          {currentPage === 'dashboard' && <Home userId={user.id} />}
          {currentPage === 'history' && (
            <div className="container mx-auto px-4 py-6">
              <TransactionHistory
                transactions={[]}
                userId={user.id}
                showPagination={true}
                maxDisplayed={25}
              />
            </div>
          )}
          {currentPage === 'tutorials' && (
            <TutorialsPage userId={user.id} />
          )}
          {currentPage === 'community' && (
            <div className="text-center py-16">
              <div className="max-w-4xl mx-auto p-8 bg-slate-900/40 backdrop-blur-md rounded-lg border border-slate-700/40 shadow-xl">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Community Hub</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-8">Connect with other crypto snipers and share strategies</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-800/30 rounded-lg border border-slate-600/40">
                    <h3 className="text-lg font-semibold text-white mb-3">Discord Server</h3>
                    <p className="text-slate-200 text-sm mb-4">Join our active Discord community for real-time discussions and alerts.</p>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Coming Soon
                    </button>
                  </div>

                  <div className="p-6 bg-slate-800/30 rounded-lg border border-slate-600/40">
                    <h3 className="text-lg font-semibold text-white mb-3">Trading Signals</h3>
                    <p className="text-slate-200 text-sm mb-4">Access premium trading signals and market analysis.</p>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Coming Soon
                    </button>
                  </div>

                  <div className="p-6 bg-slate-800/30 rounded-lg border border-slate-600/40">
                    <h3 className="text-lg font-semibold text-white mb-3">Leaderboard</h3>
                    <p className="text-slate-200 text-sm mb-4">See top performers and compete with other members.</p>
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                      Coming Soon
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {currentPage === 'billing' && (
            <div className="container mx-auto px-4 py-6">
              <SubscriptionManager
                userId={user.id}
                onPlanChange={(planId) => {
                  // Update user plan in state and persist
                  setUser((prev) => {
                    const next = prev ? { ...prev, plan: planId as any } : prev;
                    if (next) {
                      try {
                        localStorage.setItem('cryptosniper_user', JSON.stringify(next));
                      } catch {
                        // ignore storage errors
                      }
                    }
                    return next as User | null;
                  });
                  // Keep the local store aligned
                  setStorePlan(planId as any);
                  // Feedback
                  console.log(`Successfully upgraded to ${planId} plan`);
                }}
              />
            </div>
          )}

        </UserDashboard>
      );
    }

    return (
      <LandingPage
        onGetStarted={handleGetStarted}
        onSignUp={handleSignUp}
        onLogin={handleLogin}
      />
    );
  };

  return (
    <ThemeProvider>
      {/* Global Toaster for notifications */}
      <Toaster position="top-right" richColors />
      <div className="min-h-screen relative">
        <DynamicBackground />

        {/* Token Ticker - Shows at top of page */}
        <TokenTicker />

        {/* Mobile Affiliate Banner */}
        <MobileAffiliateBanner />

        <HashRouter>
          <div>
            <Routes>
              <Route path="/" element={renderContent()} />
            </Routes>
          </div>

          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            defaultTab={authModalTab}
            onSuccess={handleAuthSuccess}
          />
        </HashRouter>
      </div>
    </ThemeProvider>
  );
}
