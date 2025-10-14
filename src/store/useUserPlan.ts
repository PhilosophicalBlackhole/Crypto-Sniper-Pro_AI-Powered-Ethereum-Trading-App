/**
 * Store: useUserPlan
 * Purpose: Persist and expose user's subscription plan across the app with localStorage.
 */

import { create } from 'zustand'

/** Allowed plan names */
export type PlanTier = 'free' | 'pro' | 'premium'

/** Store shape for plan management */
interface UserPlanState {
  plan: PlanTier
  setPlan: (next: PlanTier) => void
}

/**
 * Initialize plan from localStorage with a safe default.
 */
function getInitialPlan(): PlanTier {
  try {
    const raw = localStorage.getItem('user_plan')
    if (raw === 'pro' || raw === 'premium' || raw === 'free') return raw
  } catch {
    // ignore read errors
  }
  return 'free'
}

/**
 * Zustand store with small persistence logic.
 */
export const useUserPlan = create<UserPlanState>((set) => ({
  plan: getInitialPlan(),
  setPlan: (next) => {
    try {
      localStorage.setItem('user_plan', next)
    } catch {
      // ignore write errors
    }
    set({ plan: next })
  },
}))
