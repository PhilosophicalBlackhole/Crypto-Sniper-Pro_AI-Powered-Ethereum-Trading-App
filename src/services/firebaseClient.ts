/**
 * firebaseClient.ts
 * - Safe, lazy Firebase initialization for browser.
 * - Reads config from window.__ENV__ to avoid bundling secrets.
 * - Exposes helpers to check availability and get Auth instance.
 */

import { initializeApp, type FirebaseOptions, getApps } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

/**
 * Get a value from window.__ENV__ safely.
 */
function getEnv(key: string): string | undefined {
  try {
    if (typeof window !== 'undefined') {
      return (window as any).__ENV__?.[key];
    }
  } catch {
    // ignore
  }
  return undefined;
}

/**
 * Build Firebase config from environment. Returns undefined if incomplete.
 */
function getFirebaseConfig(): FirebaseOptions | undefined {
  const apiKey = getEnv('FIREBASE_API_KEY');
  const authDomain = getEnv('FIREBASE_AUTH_DOMAIN');
  const projectId = getEnv('FIREBASE_PROJECT_ID');
  const appId = getEnv('FIREBASE_APP_ID');

  if (apiKey && authDomain && projectId && appId) {
    return {
      apiKey,
      authDomain,
      projectId,
      appId,
    };
  }
  return undefined;
}

/**
 * Whether Firebase is enabled (all config parts present).
 */
export function isFirebaseEnabled(): boolean {
  return !!getFirebaseConfig();
}

/**
 * Initialize Firebase app (idempotent) and return Auth instance.
 * Returns null if config is not present.
 */
export function initFirebaseAuth(): Auth | null {
  const config = getFirebaseConfig();
  if (!config) return null;

  if (getApps().length === 0) {
    initializeApp(config);
  }
  return getAuth();
}
