/**
 * User dashboard component for authenticated users
 * - Adds header network indicator and a compact sidebar network dot for mobile visibility.
 * - Enhanced: persistent Live Mode toggle and status badge always visible across views.
 * - NEW: Mobile off-canvas sidebar that minimizes by default to ensure dashboard visibility.
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  User as UserIcon,
  Settings,
  LogOut,
  Crown,
  BarChart3,
  MessageSquare,
  BookOpen,
  CreditCard,
  History,
  Bell,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AffiliateBanner } from './AffiliateBanner';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import LiveModeToggle from './LiveModeToggle';
import { useLiveTrading } from '../hooks/useLiveTrading';

interface UserDashboardProps {
  /** Authenticated user info */
  user: {
    id: string;
    name: string;
    email: string;
    plan: 'free' | 'pro' | 'premium';
    avatar?: string | null;
  };
  /** Logout handler */
  onLogout: () => void;
  /** Router callback for switching dashboard pages */
  onNavigate: (page: string) => void;
  /** Routed content */
  children: React.ReactNode;
}

/**
 * UserDashboard - shell layout with header, sidebar, and main content.
 * Adds a small network status badge (dot + name) for transparency.
 * Enhanced to include Live Mode control and an always-visible status badge.
 * New responsive behavior: on small screens, the sidebar is off-canvas and hidden by default.
 */
export function UserDashboard({ user, onLogout, onNavigate, children }: UserDashboardProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // NEW: Mobile sidebar state
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Network status for header indicator
  const { isMainnet, networkName } = useNetworkStatus();

  // Live trading state for persistent sidebar badge
  const { liveMode } = useLiveTrading();

  // Calculate menu position when opening
  useEffect(() => {
    if (showUserMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right + window.scrollX
      });
    }
  }, [showUserMenu]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // NEW: Close mobile sidebar on Esc
  useEffect(() => {
    if (!isMobileSidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileSidebarOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMobileSidebarOpen]);

  /** Get plan badge including creator badge */
  const getPlanBadge = () => {
    if (user.id === 'creator_admin_001') {
      return <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">👑 Creator</Badge>;
    }
    switch (user.plan) {
      case 'free':
        return <Badge variant="secondary" className="bg-slate-600 text-white">Free</Badge>;
      case 'pro':
        return <Badge className="bg-blue-600 text-white">Pro</Badge>;
      case 'premium':
        return <Badge className="bg-purple-600 text-white">Premium</Badge>;
      default:
        return <Badge variant="secondary" className="bg-slate-600 text-white">Free</Badge>;
    }
  };

  /** Navigation items */
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Trading Dashboard',
      icon: BarChart3,
      available: true
    },
    {
      id: 'history',
      label: 'Trade History',
      icon: History,
      available: true
    },
    {
      id: 'tutorials',
      label: 'Tutorials',
      icon: BookOpen,
      available: true
    },
    {
      id: 'community',
      label: 'Community',
      icon: MessageSquare,
      available: user.plan !== 'free' || user.id === 'creator_admin_001'
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: CreditCard,
      available: true
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      available: true
    }
  ];

  const networkDotClass = isMainnet ? 'bg-emerald-400' : 'bg-amber-400';
  const liveBadge = liveMode
    ? <Badge className="bg-emerald-600 text-white border-emerald-500">LIVE TRADING ACTIVE</Badge>
    : <Badge variant="secondary" className="bg-slate-700 text-slate-200 border-slate-600">LIVE TRADING STOPPED</Badge>;

  /**
   * Handle navigation click: navigate and close the mobile sidebar if open.
   */
  const handleNavClick = (page: string) => {
    onNavigate(page);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-transparent text-white dark:text-white light:text-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-slate-900/80 dark:bg-slate-900/80 light:bg-white/95 backdrop-blur-md border-b border-slate-700/60 dark:border-slate-700/60 light:border-slate-200/60 shadow-lg transition-colors duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* NEW: Mobile hamburger to open sidebar */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-white hover:text-white hover:bg-white/20 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open menu"
                aria-expanded={isMobileSidebarOpen}
                aria-controls="app-sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="p-2 bg-blue-600 rounded-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white dark:text-white transition-colors drop-shadow-lg">CryptoSniper Pro</h1>
                <p className="text-white dark:text-slate-300 text-sm transition-colors font-bold drop-shadow-md">
                  {user.id === 'creator_admin_001' ? '👑 Creator Dashboard' : 'Member Dashboard'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Small network status badge (desktop) */}
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700"
                title={isMainnet ? 'Ethereum Mainnet — live trading' : `${networkName} — test environment`}
              >
                <span className={`h-2 w-2 rounded-full ${networkDotClass}`} />
                <span className="text-xs text-slate-300">{isMainnet ? 'Mainnet' : networkName}</span>
              </div>

              {/* Live Mode mini badge (mobile) */}
              <div className="sm:hidden">
                {liveBadge}
              </div>

              {/* Theme Toggle */}
              <ThemeToggle className="text-white dark:text-slate-300" />

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-white hover:bg-white/20 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 relative transition-colors duration-200"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  3
                </span>
              </Button>

              {/* User Menu */}
              <div className="relative">
                <Button
                  ref={buttonRef}
                  variant="ghost"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden lg:block">
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-xs text-slate-300">{user.email}</div>
                  </div>
                  {getPlanBadge()}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Portal-rendered dropdown menu */}
              {showUserMenu && createPortal(
                <div
                  ref={menuRef}
                  className="fixed w-56 bg-slate-900 border border-slate-700 shadow-xl rounded-md z-50"
                  style={{
                    top: `${menuPosition.top}px`,
                    right: `${menuPosition.right}px`,
                  }}
                >
                  <div className="p-2">
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('profile');
                        }}
                        className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                      >
                        <UserIcon className="h-4 w-4 mr-2" />
                        Profile Settings
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('billing');
                        }}
                        className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Billing & Plans
                      </Button>
                      <hr className="my-2 border-slate-700" />
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>,
                document.body
              )}
            </div>
          </div>
        </div>
      </header>

      {/* NEW: Mobile backdrop when sidebar open */}
      <div
        className={`fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileSidebarOpen(false)}
        aria-hidden={!isMobileSidebarOpen}
      />

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside
          id="app-sidebar"
          className={`w-64 bg-slate-900 border-r border-slate-700 min-h-screen
            transform transition-transform duration-300
            fixed md:static inset-y-0 left-0 z-40
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
          aria-hidden={!isMobileSidebarOpen}
        >
          {/* NEW: Mobile-only close bar */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 md:hidden">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-800 border border-slate-700"
              title={isMainnet ? 'Ethereum Mainnet — live trading' : `${networkName} — test environment`}
            >
              <span className={`h-2 w-2 rounded-full ${networkDotClass}`} />
              <span className="text-xs text-slate-300">{isMainnet ? 'Mainnet' : networkName}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close menu"
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Compact network dot for mobile (since header badge is hidden on small screens) */}
          <div className="p-4 sm:hidden">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-800 border border-slate-700"
              title={isMainnet ? 'Ethereum Mainnet — live trading' : `${networkName} — test environment`}
            >
              <span className={`h-2 w-2 rounded-full ${networkDotClass}`} />
              <span className="text-xs text-slate-300">{isMainnet ? 'Mainnet' : networkName}</span>
            </div>
          </div>

          {/* Persistent Live Mode status badge */}
          <div className="px-4 pt-4">
            <div className="sticky top-4 z-10">{/* keep visible on scroll */}
              <div className="mb-3">
                {liveBadge}
              </div>
              <LiveModeToggle compact />
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => item.available && handleNavClick(item.id)}
                disabled={!item.available}
                className={`w-full justify-start ${
                  item.available
                    ? 'text-white hover:text-white hover:bg-white/20 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 font-bold drop-shadow-lg'
                    : 'text-slate-300 dark:text-slate-500 opacity-50 cursor-not-allowed'
                }`}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
                {!item.available && (
                  <Badge variant="outline" className="ml-auto text-xs border-amber-400 text-amber-400 bg-transparent">
                    Pro
                  </Badge>
                )}
              </Button>
            ))}
          </nav>

          {/* Upgrade prompt for free users (not creator) */}
          {user.plan === 'free' && user.id !== 'creator_admin_001' && (
            <Card className="m-4 bg-gradient-to-br from-blue-900/60 to-purple-900/60 backdrop-blur-md border-blue-500/60">
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <Crown className="h-8 w-8 mx-auto text-blue-400" />
                  <div>
                    <h3 className="text-white font-semibold">Upgrade to Pro</h3>
                    <p className="text-slate-300 text-sm">
                      Unlock real trading & advanced features
                    </p>
                  </div>
                  <Button
                    onClick={() => handleNavClick('billing')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Upgrade Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Affiliate Banner */}
          <div className="m-4 mt-6">
            <AffiliateBanner />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-transparent md:ml-0">
          {children}
        </main>
      </div>
    </div>
  );
}
