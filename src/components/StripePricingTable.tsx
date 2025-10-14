/**
 * Component: StripePricingTable
 * Purpose: Safely load Stripe's pricing-table.js and render the <stripe-pricing-table> custom element.
 * Notes:
 * - Reads publishable key and pricing table id from env with robust fallbacks.
 * - Avoids direct import.meta.env usage to prevent crashes in non-Vite builds.
 * - If required values are missing, shows a helpful message instead of breaking the app.
 */

import { useEffect, useMemo, useRef, useState } from 'react'

/** Configuration props for the pricing table embed */
export interface StripePricingTableProps {
  /** Optional: override publishable key (falls back to env or default) */
  publishableKey?: string
  /** Optional: override pricing table id (falls back to env or default) */
  pricingTableId?: string
  /** Optional: uniquely identify the user/session in Stripe Checkout (client_reference_id) */
  clientReferenceId?: string
  /** Optional: anchor id for scrolling */
  anchorId?: string
}

/**
 * Resolve environment variables from multiple sources without crashing in non-Vite builds.
 */
function readEnvVar(name: string): string | undefined {
  const w: any = typeof window !== 'undefined' ? window : undefined
  const fromWindow = w?.ENV?.[name]
  const fromProcess =
    typeof process !== 'undefined' ? (process as any)?.env?.[name] : undefined
  return fromWindow ?? fromProcess
}

/** Load the pricing-table.js exactly once */
let pricingTableLoader: Promise<void> | null = null
function loadPricingTableScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (pricingTableLoader) return pricingTableLoader

  pricingTableLoader = new Promise<void>((resolve, reject) => {
    // If already present, resolve.
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
 * StripePricingTable component renders the custom element after the script is loaded.
 */
export default function StripePricingTable(props: StripePricingTableProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)

  // Prefer env-based config; fall back to props; finally to provided live IDs if present.
  const publishableKey =
    props.publishableKey ||
    readEnvVar('VITE_STRIPE_PUBLISHABLE_KEY') ||
    'pk_live_51RnE4nIwahtgKmgJg6KC1VUrL2uvX305maXG6vSFuDviovfqqHJLqEFCbOln7kOF98fipYCqj5sh7jJBE1Scyoac00PCZ3Awzo'

  const pricingTableId =
    props.pricingTableId ||
    readEnvVar('VITE_STRIPE_PRICING_TABLE_ID') ||
    'prctbl_1SG2lhIwahtgKmgJQHToMFIc'

  // Generate a stable client reference (helps you match returns if you use success redirects)
  const clientRef = useMemo(() => {
    if (props.clientReferenceId) return props.clientReferenceId
    try {
      const existing = sessionStorage.getItem('client_ref_id')
      if (existing) return existing
      const gen = `client_${Math.random().toString(36).slice(2)}_${Date.now()}`
      sessionStorage.setItem('client_ref_id', gen)
      return gen
    } catch {
      return `client_${Date.now()}`
    }
  }, [props.clientReferenceId])

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

  // Render states
  if (!publishableKey || !pricingTableId) {
    return (
      <div
        id={props.anchorId}
        className="w-full rounded-md border border-slate-200/20 bg-slate-900/40 p-4 text-slate-200"
      >
        <p className="text-sm">
          Stripe configuration missing. Set VITE_STRIPE_PUBLISHABLE_KEY and
          VITE_STRIPE_PRICING_TABLE_ID in your environment, or pass them as props.
        </p>
      </div>
    )
  }

  return (
    <div id={props.anchorId} ref={containerRef} className="w-full">
      {ready ? (
        // React supports custom elements; attributes must be kebab-case
        // eslint-disable-next-line react/no-unknown-property
        <stripe-pricing-table
          // @ts-expect-error - Custom element attributes not in JSX IntrinsicElements
          publishable-key={publishableKey}
          // @ts-expect-error - Custom element attributes not in JSX IntrinsicElements
          pricing-table-id={pricingTableId}
          // @ts-expect-error - Custom element attributes not in JSX IntrinsicElements
          client-reference-id={clientRef}
        />
      ) : (
        <div className="w-full rounded-md border border-slate-200/20 bg-slate-900/40 p-6">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-700/50 mb-3" />
          <div className="h-24 animate-pulse rounded bg-slate-700/30" />
        </div>
      )}
    </div>
  )
}
