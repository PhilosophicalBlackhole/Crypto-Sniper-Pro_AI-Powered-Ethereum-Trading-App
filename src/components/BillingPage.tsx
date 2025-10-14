/**
 * Component: BillingPage
 * Purpose: Present upgrade options and embed Stripe Pricing Table. Auto-updates local plan after successful return.
 * Behavior:
 * - "Choose Pro/Premium" stores an "upgrade_intent" and scrolls to pricing table.
 * - On load, if the URL indicates an upgrade success (e.g., #/?upgrade=success), applies the stored intent to user plan.
 * - Uses Sonner toasts for feedback, falls back cleanly if env config is missing.
 */

import { useEffect, useMemo } from 'react'
import StripePricingTable from './StripePricingTable'
import { useUserPlan, type PlanTier } from '../store/useUserPlan'
import { Crown, Check, Zap } from 'lucide-react'
import { toast } from 'sonner'

/** Props for BillingPage */
interface BillingPageProps {
  /** Optional user id/email if you maintain users */
  userId?: string
  userEmail?: string
}

/**
 * Parse hash query parameters because we use hash-based routing (HashRouter).
 * Example: https://site/#/?upgrade=success
 */
function getHashQuery(): Record<string, string> {
  try {
    const hash = window.location.hash || ''
    const idx = hash.indexOf('?')
    const query = idx >= 0 ? hash.slice(idx + 1) : ''
    const sp = new URLSearchParams(query)
    const out: Record<string, string> = {}
    sp.forEach((v, k) => (out[k] = v))
    return out
  } catch {
    return {}
  }
}

/**
 * Smoothly scroll to an element id.
 */
function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function BillingPage(props: BillingPageProps) {
  const { plan, setPlan } = useUserPlan()

  // Stable client ref for Stripe attribute (helps correlate returns)
  const clientRef = useMemo(() => {
    try {
      const base = props.userId || 'anon'
      const existing = sessionStorage.getItem('client_ref_id')
      return existing || `${base}_${Date.now()}`
    } catch {
      return `anon_${Date.now()}`
    }
  }, [props.userId])

  // Apply upgrade on return from Stripe if URL contains upgrade=success
  useEffect(() => {
    const q = getHashQuery()
    if (q.upgrade === 'success') {
      let tier: PlanTier | null = null
      try {
        const stored = localStorage.getItem('upgrade_intent')
        if (stored === 'pro' || stored === 'premium') tier = stored
      } catch {
        // ignore
      }
      // Fall back to pro if unknown
      const applied = tier || 'pro'
      setPlan(applied)
      try {
        localStorage.removeItem('upgrade_intent')
      } catch {
        // ignore
      }
      toast.success(`Upgraded to ${applied.toUpperCase()} successfully`)
      // Clean the URL to avoid re-triggering on refresh
      try {
        const cleanHash = window.location.hash.split('?')[0]
        history.replaceState(null, '', `${window.location.pathname}${cleanHash}`)
      } catch {
        // ignore
      }
    }
  }, [setPlan])

  function choosePlanIntent(tier: PlanTier) {
    try {
      localStorage.setItem('upgrade_intent', tier)
    } catch {
      // ignore
    }
    scrollToId('pricing-table')
  }

  return (
    <section className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Crown className="h-6 w-6 text-yellow-400" /> Billing &amp; Upgrades
        </h2>
        <p className="text-slate-300">
          Your current plan: <span className="font-semibold uppercase">{plan}</span>
        </p>
      </div>

      {/* Plan cards with feature highlights */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-sky-400" />
            <h3 className="font-semibold text-white">Free</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-400 mt-0.5" /> Basic tutorials
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-400 mt-0.5" /> Limited dashboard
            </li>
          </ul>
          <button
            className="mt-4 w-full rounded-md border border-slate-600/50 bg-slate-800/60 px-4 py-2 text-slate-200 hover:bg-slate-800"
            onClick={() => toast.info('You are already on Free')}
          >
            Current
          </button>
        </div>

        <div className="rounded-xl border border-slate-600/60 bg-slate-900/60 p-5 ring-1 ring-sky-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-5 w-5 text-yellow-400" />
            <h3 className="font-semibold text-white">Pro</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-400 mt-0.5" /> Advanced tutorials
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-400 mt-0.5" /> Extra strategies pack
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-400 mt-0.5" /> Priority updates
            </li>
          </ul>
          <button
            className="mt-4 w-full rounded-md bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-500"
            onClick={() => choosePlanIntent('pro')}
          >
            Choose Pro
          </button>
        </div>

        <div className="rounded-xl border border-amber-500/50 bg-slate-900/60 p-5 ring-1 ring-amber-500/40">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-5 w-5 text-amber-400" />
            <h3 className="font-semibold text-white">Premium</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-400 mt-0.5" /> All Pro features
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-400 mt-0.5" /> 1:1 strategy sessions
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-400 mt-0.5" /> Early access to tools
            </li>
          </ul>
          <button
            className="mt-4 w-full rounded-md bg-amber-500 px-4 py-2 font-medium text-black hover:bg-amber-400"
            onClick={() => choosePlanIntent('premium')}
          >
            Choose Premium
          </button>
        </div>
      </div>

      {/* Embedded Stripe Pricing Table */}
      <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-4">
        <h4 className="mb-2 text-white font-semibold">Complete your purchase</h4>
        <p className="mb-4 text-sm text-slate-300">
          We use Stripe for secure checkout. You&apos;ll be redirected back here after payment.
          Set your Pricing Table success URL in Stripe to: <span className="font-mono text-slate-200">#/&#63;upgrade=success</span>
        </p>
        <StripePricingTable anchorId="pricing-table" clientReferenceId={clientRef} />
      </div>
    </section>
  )
}
