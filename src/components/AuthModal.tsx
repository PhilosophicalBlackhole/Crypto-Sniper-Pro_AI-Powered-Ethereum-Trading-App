/**
 * Authentication modal component with login and signup functionality
 */

import React, { useState } from 'react';
import { X, Eye, EyeOff, User, Lock, Mail, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'premium';
  avatar?: string | null;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab: 'login' | 'signup';
  onSuccess: (user: User) => void;
}

interface StoredCredentials {
  email: string;
  hashedPassword: string;
  name: string;
  plan: 'free' | 'pro' | 'premium';
  avatar?: string;
  createdAt: number;
}

export function AuthModal({ isOpen, onClose, defaultTab, onSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: true
  });

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: 'free' as 'free' | 'pro' | 'premium'
  });

  if (!isOpen) return null;

  /**
   * Simple hash function for password storage (demo purposes)
   * In production, use proper bcrypt or similar
   */
  const hashPassword = (password: string): string => {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  };

  /**
   * Get stored user credentials from localStorage
   */
  const getStoredCredentials = (email: string): StoredCredentials | null => {
    try {
      const stored = localStorage.getItem(`cryptosniper_creds_${email}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading stored credentials:', error);
      return null;
    }
  };

  /**
   * Store user credentials in localStorage
   */
  const storeCredentials = (email: string, credentials: StoredCredentials): void => {
    try {
      localStorage.setItem(`cryptosniper_creds_${email}`, JSON.stringify(credentials));
    } catch (error) {
      console.error('Error storing credentials:', error);
    }
  };

  /**
   * Handle user login
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate input
      if (!loginForm.email || !loginForm.password) {
        throw new Error('Please fill in all fields');
      }

      // Special handling for creator account
      const isCreator = loginForm.email === 'cryptosniper.pro@proton.me';
      if (isCreator && loginForm.password === 'Aptyhnub2025%67') {
        // Creator login with full Pro access
        const creatorUser: User = {
          id: 'creator_admin_001',
          name: 'CryptoSniper Creator',
          email: 'cryptosniper.pro@proton.me',
          plan: 'premium', // Full premium access
          avatar: null
        };

        // Store creator session
        if (loginForm.rememberMe) {
          localStorage.setItem('cryptosniper_remember_me', 'true');
        }

        onSuccess(creatorUser);
        setLoginForm({ email: '', password: '', rememberMe: true });
        return;
      }

      // Regular user login flow
      const storedCreds = getStoredCredentials(loginForm.email);
      if (!storedCreds) {
        throw new Error('Account not found. Please sign up first.');
      }

      // Verify password
      const hashedInput = hashPassword(loginForm.password);
      if (hashedInput !== storedCreds.hashedPassword) {
        throw new Error('Invalid email or password');
      }

      // Create user object
      const user: User = {
        id: btoa(loginForm.email), // Simple ID generation
        name: storedCreds.name,
        email: loginForm.email,
        plan: storedCreds.plan,
        avatar: storedCreds.avatar
      };

      // Store remember me preference
      if (loginForm.rememberMe) {
        localStorage.setItem('cryptosniper_remember_me', 'true');
      }

      // Call success handler
      onSuccess(user);
      
      // Reset form
      setLoginForm({ email: '', password: '', rememberMe: true });
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user signup
   */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate input
      if (!signupForm.name || !signupForm.email || !signupForm.password) {
        throw new Error('Please fill in all required fields');
      }

      if (signupForm.password !== signupForm.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (signupForm.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Check if user already exists
      const existingCreds = getStoredCredentials(signupForm.email);
      if (existingCreds) {
        throw new Error('Account with this email already exists');
      }

      // Store new credentials
      const credentials: StoredCredentials = {
        email: signupForm.email,
        hashedPassword: hashPassword(signupForm.password),
        name: signupForm.name,
        plan: signupForm.plan,
        createdAt: Date.now()
      };

      storeCredentials(signupForm.email, credentials);

      // Create user object
      const user: User = {
        id: btoa(signupForm.email),
        name: signupForm.name,
        email: signupForm.email,
        plan: signupForm.plan
      };

      // Call success handler
      onSuccess(user);
      
      // Reset form
      setSignupForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        plan: 'free'
      });
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 h-8 w-8 p-0 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-white text-center">
            Welcome to CryptoSniper
          </CardTitle>
          <CardDescription className="text-center">
            {activeTab === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
              <TabsTrigger value="login" className="text-slate-300 data-[state=active]:text-white">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-slate-300 data-[state=active]:text-white">
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-slate-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="pl-10 bg-slate-800 border-slate-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-slate-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="pl-10 pr-10 bg-slate-800 border-slate-600 text-white"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-2 h-6 w-6 p-0 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={loginForm.rememberMe}
                    onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                    className="rounded border-slate-600 bg-slate-800 text-blue-600"
                  />
                  <Label htmlFor="remember-me" className="text-sm text-slate-300">
                    Remember me
                  </Label>
                </div>

                {error && (
                  <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-md p-3">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                {/* Creator Quick Login */}
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLoginForm({
                        email: 'cryptosniper.pro@proton.me',
                        password: 'Aptyhnub2025%67',
                        rememberMe: true
                      });
                    }}
                    className="w-full text-xs border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                  >
                    👑 Creator Login (Auto-fill)
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-slate-300">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      className="pl-10 bg-slate-800 border-slate-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-slate-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      className="pl-10 bg-slate-800 border-slate-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-slate-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password (min 6 chars)"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      className="pl-10 pr-10 bg-slate-800 border-slate-600 text-white"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-2 h-6 w-6 p-0 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-slate-300">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      className="pl-10 bg-slate-800 border-slate-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Plan Selection</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={signupForm.plan === 'free' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSignupForm({ ...signupForm, plan: 'free' })}
                      className="text-xs"
                    >
                      Free
                    </Button>
                    <Button
                      type="button"
                      variant={signupForm.plan === 'pro' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSignupForm({ ...signupForm, plan: 'pro' })}
                      className="text-xs"
                    >
                      <Crown className="h-3 w-3 mr-1" />
                      Pro
                    </Button>
                    <Button
                      type="button"
                      variant={signupForm.plan === 'premium' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSignupForm({ ...signupForm, plan: 'premium' })}
                      className="text-xs"
                    >
                      Premium
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-md p-3">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="text-center">
          <p className="text-xs text-slate-400">
            By signing up, you agree to our terms of service and privacy policy
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
