/**
 * Authentication modal component with login and signup functionality
 * - Uses Supabase (managed) via authService when configured, otherwise device-local demo auth.
 * - Includes device-local reset flow and Supabase email reset/magic link when available.
 * - Explicit autocomplete/name attributes to reduce unintended autofill.
 */

import React, { useEffect, useState } from 'react';
import { X, Eye, EyeOff, User as UserIcon, Lock, Mail, Link as LinkIcon, KeyRound } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import authService, { type AuthUser } from '../services/authService';

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

/**
 * Map AuthUser to app user shape.
 */
function toUser(u: AuthUser): User {
  return { id: u.id, name: u.name, email: u.email, plan: u.plan, avatar: u.avatar ?? null };
}

/**
 * AuthModal component
 */
export function AuthModal({ isOpen, onClose, defaultTab, onSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Managed auth available?
  const [managed, setManaged] = useState(false);
  useEffect(() => {
    setManaged(authService.isManaged());
  }, []);

  // Forms
  const [loginForm, setLoginForm] = useState({ email: '', password: '', rememberMe: true });
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: 'free' as 'free' | 'pro' | 'premium',
  });

  // Local reset (demo) UI
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [resetConfirmPass, setResetConfirmPass] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);

  if (!isOpen) return null;

  /**
   * Handle login using managed auth when available, else demo fallback.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!loginForm.email || !loginForm.password) throw new Error('Please fill in all fields');
      const u = await authService.signIn(loginForm.email.trim(), loginForm.password);
      if (loginForm.rememberMe) {
        localStorage.setItem('cryptosniper_remember_me', 'true');
      } else {
        localStorage.removeItem('cryptosniper_remember_me');
      }
      onSuccess(toUser(u));
      setLoginForm({ email: '', password: '', rememberMe: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle signup using managed auth when available, else demo fallback.
   */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!signupForm.name || !signupForm.email || !signupForm.password) {
        throw new Error('Please fill in all required fields');
      }
      if (signupForm.password !== signupForm.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (signupForm.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const { user, message } = await authService.signUp(
        signupForm.name.trim(),
        signupForm.email.trim(),
        signupForm.password,
        signupForm.plan
      );

      if (user) {
        onSuccess(toUser(user));
      } else if (message) {
        setError(message);
      }
      setSignupForm({ name: '', email: '', password: '', confirmPassword: '', plan: 'free' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send magic link (managed only).
   */
  const handleMagicLink = async () => {
    try {
      setLoading(true);
      setError('');
      if (!loginForm.email) throw new Error('Enter your email to receive a magic link');
      const res = await authService.sendMagicLink(loginForm.email.trim());
      setError(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Begin reset. Managed: send email reset; Demo: move to step 2 (set new password).
   */
  const handleBeginReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (!resetEmail) {
      setResetError('Please enter your email');
      return;
    }
    if (managed) {
      try {
        const res = await authService.resetPassword(resetEmail.trim());
        setShowReset(false);
        setActiveTab('login');
        setError(res.message || 'Password reset link sent.');
      } catch (err) {
        setResetError(err instanceof Error ? err.message : 'Failed to send reset email');
      }
      return;
    }
    setResetStep(2);
  };

  /**
   * Complete reset in demo mode by updating the stored local hash.
   */
  const handleCompleteReset = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (!resetNewPass || resetNewPass.length < 6) {
      setResetError('Password must be at least 6 characters long');
      return;
    }
    if (resetNewPass !== resetConfirmPass) {
      setResetError('Passwords do not match');
      return;
    }
    try {
      const key = `cryptosniper_creds_${resetEmail.trim().toLowerCase()}`;
      const stored = localStorage.getItem(key);
      if (!stored) {
        setResetError('Account not found on this device.');
        return;
      }
      // lightweight hash (demo)
      let hash = 0;
      for (let i = 0; i < resetNewPass.length; i++) {
        const c = resetNewPass.charCodeAt(i);
        hash = (hash << 5) - hash + c;
        hash |= 0;
      }
      const creds = JSON.parse(stored);
      const updated = { ...creds, hashedPassword: hash.toString(36) };
      localStorage.setItem(key, JSON.stringify(updated));
      setShowReset(false);
      setResetEmail('');
      setResetNewPass('');
      setResetConfirmPass('');
      setResetStep(1);
      setActiveTab('login');
      setError('Password updated. Please sign in.');
    } catch {
      setResetError('Failed to update password');
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
          <CardTitle className="text-white text-center">Welcome to CryptoSniper</CardTitle>
          <CardDescription className="text-center">
            {activeTab === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Mode helper */}
          <p className="text-[11px] text-slate-500 mb-3">
            {managed
              ? 'Managed Auth enabled (Supabase). Cross-device sign-in and email recovery available.'
              : 'Demo mode: accounts are stored on this device only. Use the same browser to sign back in.'}
          </p>

          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
              <TabsTrigger value="login" className="text-slate-300 data-[state=active]:text-white">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-slate-300 data-[state=active]:text-white">
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Login */}
            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-slate-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="login-email"
                      name="cs_email_login"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="pl-10 bg-slate-800 border-slate-600 text-white"
                      autoComplete="username"
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
                      name="cs_password_login"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="pl-10 pr-10 bg-slate-800 border-slate-600 text-white"
                      autoComplete="current-password"
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={loginForm.rememberMe}
                      onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                      className="rounded border-slate-600 bg-slate-800 text-blue-600"
                    />
                    Remember me
                  </label>

                  <div className="flex items-center gap-3">
                    {managed && (
                      <button
                        type="button"
                        onClick={handleMagicLink}
                        className="text-xs text-emerald-300 hover:underline flex items-center gap-1"
                        title="Send a sign-in link to your email"
                      >
                        <LinkIcon className="h-3.5 w-3.5" />
                        Magic link
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowReset(true);
                        setResetEmail(loginForm.email);
                        setResetError('');
                        setResetStep(1);
                      }}
                      className="text-xs text-blue-400 hover:underline"
                      title={managed ? 'Send a password reset email' : 'Reset password stored on this device'}
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-md p-3">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            {/* Signup */}
            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleSignup} className="space-y-4" autoComplete="off">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-slate-300">
                    Full Name
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signup-name"
                      name="cs_name_signup"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      className="pl-10 bg-slate-800 border-slate-600 text-white"
                      autoComplete="name"
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
                      name="cs_email_signup"
                      type="email"
                      placeholder="Enter your email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      className="pl-10 bg-slate-800 border-slate-600 text-white"
                      autoComplete="email"
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
                      name="cs_password_signup"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      className="pl-10 pr-10 bg-slate-800 border-slate-600 text-white"
                      autoComplete="new-password"
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
                  <Label htmlFor="signup-password2" className="text-slate-300">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signup-password2"
                      type="password"
                      placeholder="Confirm your password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      className="pl-10 bg-slate-800 border-slate-600 text-white"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-md p-3">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Forgot Password Modal */}
      {showReset && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-slate-900 border-slate-700">
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReset(false)}
                className="absolute top-2 right-2 h-8 w-8 p-0 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
              <CardTitle className="text-white text-center">Reset Password</CardTitle>
              <CardDescription className="text-center">
                {managed ? 'Enter your email to receive a reset link.' : 'Update the password stored on this device.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resetStep === 1 && (
                <form onSubmit={handleBeginReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-slate-300">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your account email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="pl-10 bg-slate-800 border-slate-600 text-white"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>
                  {resetError && (
                    <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-md p-3">
                      {resetError}
                    </div>
                  )}
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {managed ? 'Send Reset Email' : 'Continue'}
                  </Button>
                </form>
              )}
              {!managed && resetStep === 2 && (
                <form onSubmit={handleCompleteReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-pass" className="text-slate-300">
                      New Password
                    </Label>
                    <Input
                      id="new-pass"
                      type="password"
                      placeholder="New password"
                      value={resetNewPass}
                      onChange={(e) => setResetNewPass(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-pass2" className="text-slate-300">
                      Confirm New Password
                    </Label>
                    <Input
                      id="new-pass2"
                      type="password"
                      placeholder="Confirm password"
                      value={resetConfirmPass}
                      onChange={(e) => setResetConfirmPass(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  {resetError && (
                    <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-md p-3">
                      {resetError}
                    </div>
                  )}
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    Update Password
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
