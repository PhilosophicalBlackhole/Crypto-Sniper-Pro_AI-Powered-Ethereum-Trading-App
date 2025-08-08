import { HashRouter, Route, Routes } from 'react-router';
import React, { useState, useEffect } from 'react';
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
type AppState = 'landing' | 'demo' | 'authenticated';

interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'premium';
  avatar?: string | null;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Check for stored user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('cryptosniper_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setAppState('authenticated');
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('cryptosniper_user');
      }
    }
  }, []);

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
                  // Update user plan in state
                  setUser(prev => prev ? { ...prev, plan: planId as any } : null);
                  // Show success message
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
