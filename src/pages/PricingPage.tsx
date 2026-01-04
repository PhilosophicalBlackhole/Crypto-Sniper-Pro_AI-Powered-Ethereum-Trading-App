/**
 * Page: PricingPage
 * Purpose: Embed Stripe Pricing Table with success/cancel URLs compatible with hash-based routing.
 * Notes:
 * - Uses the Stripe custom element <stripe-pricing-table> after loading its script.
 * - Reads env from window.__ENV__ or process.env with safe fallbacks.
 * - Success and cancel URLs default to SPA hash paths (e.g., #/?upgrade=success).
 */

import React, { useEffect, useMemo, useState } from 'react'

/** Props for the PricingPage component */
export interface PricingPageProps {
  /** Optional override for Stripe publishable key */
  publishableKey?: string
  /** Optional override for Pricing Table ID */
  pricingTableId?: string
  /** Optional success redirect URL (defaults to origin + "#/?upgrade=success") */
  successUrl?: string
  /** Optional cancel redirect URL (defaults to origin + "#/?upgrade=canceled") */
  cancelUrl?: string
  /** Optional client reference id passed to Stripe */
  clientReferenceId?: string
  /** Optional custom title */
  title?: string
  /** Optional custom subtitle/description */
  description?: string
}

/** Safely read environment variables from window.__ENV__ or process.env */
function readEnvVar(name: string): string | undefined {
  const w: any = typeof window !== 'undefined' ? window : undefined
  const fromWindow = w?.__ENV__?.[name]
  const fromProcess =
    typeof process !== 'undefined' ? (process as any)?.env?.[name] : undefined
  return fromWindow ?? fromProcess
}

/** Load Stripe pricing-table.js exactly once per session */
let pricingTableLoader: Promise<void> | null = null
function loadPricingTableScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (pricingTableLoader) return pricingTableLoader

  pricingTableLoader = new Promise<void>((resolve, reject) => {
    if (document.querySelector('script[src="https://js.stripe.com/v3/pricing-table.js"]')) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/pricing-table.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Stripe pricing-table.js'))
    document.head.appendChild(script)
  })

  return pricingTableLoader
}

/**
 * PricingPage - Self-contained page that renders the Stripe Pricing Table custom element.
 * - Uses hash-based success and cancel URLs for SPA compatibility.
 * - Shows a small skeleton until the Stripe script is ready.
 */
export default function PricingPage({
  publishableKey: pkOverride,
  pricingTableId: ptOverride,
  successUrl: successUrlOverride,
  cancelUrl: cancelUrlOverride,
  clientReferenceId,
  title = 'Upgrade your plan',
  description = "We use Stripe for secure checkout. You'll be redirected back here after payment.",
}: PricingPageProps) {
  const [ready, setReady] = useState(false)

  // Resolve configuration from props or environment fallbacks
  const publishableKey =
    pkOverride ||
    readEnvVar('REACT_APP_STRIPE_PUBLISHABLE_KEY') ||
    readEnvVar('VITE_STRIPE_PUBLISHABLE_KEY') ||
    ''

  const pricingTableId =
    ptOverride ||
    readEnvVar('REACT_APP_STRIPE_PRICING_TABLE_ID') ||
    readEnvVar('VITE_STRIPE_PRICING_TABLE_ID') ||
    ''

  // Default to hash URLs to work with HashRouter / SPA hosting
  const { successUrl, cancelUrl } = useMemo(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    return {
      successUrl:
        successUrlOverride ||
        readEnvVar('REACT_APP_STRIPE_SUCCESS_URL') ||
        `${base}/#/?upgrade=success`,
      cancelUrl:
        cancelUrlOverride ||
        readEnvVar('REACT_APP_STRIPE_CANCEL_URL') ||
        `${base}/#/?upgrade=canceled`,
    }
  }, [successUrlOverride, cancelUrlOverride])

  // Stable client-reference-id for Stripe metadata correlation
  const clientRef = useMemo(() => {
    if (clientReferenceId) return clientReferenceId
    try {
      const existing = sessionStorage.getItem('client_ref_id')
      if (existing) return existing
      const gen = `client_${Math.random().toString(36).slice(2)}_${Date.now()}`
      sessionStorage.setItem('client_ref_id', gen)
      return gen
    } catch {
      return `client_${Date.now()}`
    }
  }, [clientReferenceId])

  // Load the pricing-table script once
  useEffect(() => {
    let alive = true
    loadPricingTableScript()
      .then(() => {
        if (!alive) return
        setReady(true)
      })
      .catch(() => {
        if (!alive) return
        setReady(false)
      })
    return () => {
      alive = false
    }
  }, [])

  // Guardrails: show a friendly message if keys are not configured
  const missingConfig = !publishableKey || !pricingTableId

  return (
    <section className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          {title}
        </h2>
        <p className="text-slate-300">{description}</p>
        <p className="mt-1 text-xs text-slate-400">
          Success URL should be set to: <span className="font-mono text-slate-200">#/&#63;upgrade=success</span>
        </p>
      </div>

      {/* Embed or fallback */}
      <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-4">
        {missingConfig ? (
          <div className="w-full rounded-md border border-slate-200/20 bg-slate-900/40 p-4 text-slate-200">
            <p className="text-sm">
              Stripe configuration missing. Provide REACT_APP_STRIPE_PUBLISHABLE_KEY and
              REACT_APP_STRIPE_PRICING_TABLE_ID in your environment, or pass them as props to PricingPage.
            </p>
          </div>
        ) : ready ? (
          // React supports custom elements. Attributes must be kebab-case.
          // eslint-disable-next-line react/no-unknown-property
          <stripe-pricing-table
            // @ts-expect-error - Custom element attributes are not typed in JSX IntrinsicElements
            publishable-key={publishableKey}
            // @ts-expect-error - Custom element attributes are not typed in JSX IntrinsicElements
            pricing-table-id={pricingTableId}
            // @ts-expect-error - Custom element attributes are not typed in JSX IntrinsicElements
            client-reference-id={clientRef}
            // @ts-expect-error - Custom element attributes are not typed in JSX IntrinsicElements
            success-url={successUrl}
            // @ts-expect-error - Custom element attributes are not typed in JSX IntrinsicElements
            cancel-url={cancelUrl}
          />
        ) : (
          <div className="w-full rounded-md border border-slate-200/20 bg-slate-900/40 p-6">
            <div className="h-6 w-40 animate-pulse rounded bg-slate-700/50 mb-3" />
            <div className="h-24 animate-pulse rounded bg-slate-700/30" />
          </div>
        )}
      </div>
    </section>
  )
}
