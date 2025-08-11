/**
 * authService - Unified authentication layer.
 * - Uses Supabase Auth when window.__ENV__ provides REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.
 * - Falls back to safe device-local demo auth (localStorage) when not configured.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Public user shape for the app */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'premium';
  avatar?: string | null;
}

/** Keys expected on window.__ENV__ for browser usage */
type EnvKeys = 'REACT_APP_SUPABASE_URL' | 'REACT_APP_SUPABASE_ANON_KEY';

/** Read value from window.__ENV__ safely */
function getEnvVar(key: EnvKeys): string | undefined {
  try {
    if (typeof window !== 'undefined') {
      return (window as any).__ENV__?.[key] || undefined;
    }
  } catch {
    // ignore
  }
  return undefined;
}

/** Memoized Supabase client when configured */
let supabase: SupabaseClient | null = null;

/**
 * Ensure a Supabase client is available when env is present.
 */
function ensureSupabase(): SupabaseClient | null {
  const url = getEnvVar('REACT_APP_SUPABASE_URL');
  const anon = getEnvVar('REACT_APP_SUPABASE_ANON_KEY');
  if (!url || !anon) return null;
  if (!supabase) {
    supabase = createClient(url, anon, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabase;
}

/** Demo local storage helpers (fallback) */
interface StoredCredentials {
  email: string;
  hashedPassword: string;
  name: string;
  plan: 'free' | 'pro' | 'premium';
  avatar?: string;
  createdAt: number;
}

function localKey(email: string): string {
  return `cryptosniper_creds_${email.trim().toLowerCase()}`;
}

/** Very basic demo hash (not for production) */
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const c = password.charCodeAt(i);
    hash = (hash << 5) - hash + c;
    hash |= 0;
  }
  return hash.toString(36);
}

const authService = {
  /**
   * Return true if managed auth (Supabase) is configured.
   */
  isManaged(): boolean {
    return !!ensureSupabase();
  },

  /**
   * Get current user if logged in (managed).
   * For demo fallback, reads cryptosniper_user from localStorage.
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const sb = ensureSupabase();
    if (sb) {
      const { data } = await sb.auth.getUser();
      const u = data?.user;
      if (!u) return null;
      const name = ((u.user_metadata as any)?.name as string) || u.email?.split('@')[0] || 'User';
      return {
        id: u.id,
        name,
        email: u.email || '',
        plan: 'free',
        avatar: null,
      };
    }
    try {
      const raw = localStorage.getItem('cryptosniper_user');
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },

  /**
   * Subscribe to auth changes (Supabase only). Returns unsubscribe.
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    const sb = ensureSupabase();
    if (!sb) {
      // No-op for demo mode
      return () => {};
    }
    const { data: listener } = sb.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = session.user;
        const name = ((u.user_metadata as any)?.name as string) || u.email?.split('@')[0] || 'User';
        callback({
          id: u.id,
          name,
          email: u.email || '',
          plan: 'free',
          avatar: null,
        });
      } else {
        callback(null);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  },

  /**
   * Sign up with email/password.
   * - For Supabase, returns user or null (when email confirmation required).
   * - For demo fallback, stores credentials on this device.
   */
  async signUp(
    name: string,
    email: string,
    password: string,
    plan: 'free' | 'pro' | 'premium'
  ): Promise<{ user: AuthUser | null; message?: string }> {
    const sb = ensureSupabase();
    if (sb) {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { name, plan } },
      });
      if (error) throw error;
      const u = data.user;
      if (!u) {
        return { user: null, message: 'Check your inbox to confirm your email.' };
      }
      return {
        user: {
          id: u.id,
          name,
          email: u.email || email,
          plan,
          avatar: null,
        },
        message: 'Account created.',
      };
    }
    // Demo fallback
    const key = localKey(email);
    if (localStorage.getItem(key)) {
      throw new Error('Account with this email already exists on this device');
    }
    const credentials: StoredCredentials = {
      email: email.trim(),
      hashedPassword: hashPassword(password),
      name: name.trim(),
      plan,
      createdAt: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(credentials));
    const user: AuthUser = {
      id: btoa(email.trim().toLowerCase()),
      name: name.trim(),
      email: email.trim(),
      plan,
      avatar: null,
    };
    localStorage.setItem('cryptosniper_user', JSON.stringify(user));
    return { user };
  },

  /**
   * Sign in with email/password.
   */
  async signIn(email: string, password: string): Promise<AuthUser> {
    const sb = ensureSupabase();
    if (sb) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const u = data.user;
      if (!u) throw new Error('Login failed');
      const name = ((u.user_metadata as any)?.name as string) || u.email?.split('@')[0] || 'User';
      return { id: u.id, name, email: u.email || email, plan: 'free', avatar: null };
    }
    // Demo fallback
    const key = localKey(email);
    const raw = localStorage.getItem(key);
    if (!raw) throw new Error('Account not found on this device. Please sign up first.');
    const creds = JSON.parse(raw) as StoredCredentials;
    if (hashPassword(password) !== creds.hashedPassword) throw new Error('Invalid email or password');
    const user: AuthUser = {
      id: btoa(email.trim().toLowerCase()),
      name: creds.name,
      email: creds.email,
      plan: creds.plan,
      avatar: null,
    };
    localStorage.setItem('cryptosniper_user', JSON.stringify(user));
    return user;
  },

  /**
   * Send a password reset email (Supabase managed).
   * Falls back to message in demo mode.
   */
  async resetPassword(email: string): Promise<{ ok: boolean; message: string }> {
    const sb = ensureSupabase();
    if (!sb) {
      return { ok: true, message: 'Demo mode: use the local reset to update password on this device.' };
    }
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : undefined;
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
    return { ok: true, message: 'If an account exists, a reset link has been sent to your email.' };
  },

  /**
   * Send a magic link/OTP sign-in (Supabase managed).
   */
  async sendMagicLink(email: string): Promise<{ ok: boolean; message: string }> {
    const sb = ensureSupabase();
    if (!sb) {
      return { ok: false, message: 'Magic link is only available with managed auth.' };
    }
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : undefined;
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    if (error) throw error;
    return { ok: true, message: 'Magic link sent. Check your inbox.' };
  },

  /**
   * Update password for the currently authenticated managed user.
   */
  async updatePassword(newPassword: string): Promise<{ ok: boolean; message: string }> {
    const sb = ensureSupabase();
    if (!sb) return { ok: false, message: 'Not available in demo mode.' };
    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return { ok: true, message: 'Password updated.' };
  },

  /**
   * Sign out the current user.
   */
  async signOut(): Promise<void> {
    const sb = ensureSupabase();
    if (sb) {
      await sb.auth.signOut();
      return;
    }
    localStorage.removeItem('cryptosniper_user');
  },
};

export default authService;
