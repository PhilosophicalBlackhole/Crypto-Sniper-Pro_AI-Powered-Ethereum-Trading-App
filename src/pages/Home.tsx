/**
 * Page: Home
 * Purpose: Provide a meaningful landing with hero, features, and an in-page Billing section.
 * Notes:
 * - Keeps content visible on the home page (no extra routes).
 * - Includes a billing section using the Stripe Pricing Table embed.
 */

import BillingPage from '../components/BillingPage'
import { useUserPlan } from '../store/useUserPlan'
import { Rocket, ShieldCheck, Wallet } from 'lucide-react'
import { Toaster } from 'sonner'

export default function HomePage() {
  const { plan } = useUserPlan()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Toaster position="top-center" richColors />
      {/* Hero */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              CryptoSniper Pro
            </h1>
            <p className="mt-3 text-slate-300">
              Advanced Ethereum sniping tools and curated strategies. Upgrade your edge with Pro or Premium.
              You are currently on <span className="font-semibold uppercase">{plan}</span>.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#billing"
                className="rounded-md bg-sky-600 px-5 py-2.5 font-medium text-white hover:bg-sky-500"
              >
                Go Pro
              </a>
              <a
                href="#features"
                className="rounded-md border border-slate-600 px-5 py-2.5 font-medium text-slate-200 hover:bg-slate-800/60"
              >
                Learn more
              </a>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-800">
            <img
              src="https://pub-cdn.sider.ai/u/U0KAHY9O4N/web-coder/685fc6490385cdf9803e9fae/resource/fff48990-03ee-4adc-bc8f-d46de74da39d.jpg"
              className="object-cover w-full h-60 md:h-80"
              alt="Trading dashboard preview"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <Rocket className="h-6 w-6 text-sky-400" />
            <h3 className="mt-2 font-semibold">Lightning execution</h3>
            <p className="text-sm text-slate-300">
              Optimized flow for rapid entries with clear confirmations.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <ShieldCheck className="h-6 w-6 text-green-400" />
            <h3 className="mt-2 font-semibold">Safety first</h3>
            <p className="text-sm text-slate-300">
              Smart checks and alerts to reduce avoidable mistakes.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <Wallet className="h-6 w-6 text-amber-400" />
            <h3 className="mt-2 font-semibold">Wallet friendly</h3>
            <p className="text-sm text-slate-300">
              Works great with MetaMask; upgrade unlocks advanced strategies.
            </p>
          </div>
        </div>
      </section>

      {/* Billing */}
      <section id="billing" className="container mx-auto px-4 py-12">
        <BillingPage />
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-sm text-slate-500">
        © {new Date().getFullYear()} CryptoSniper Pro. All rights reserved.
      </footer>
    </div>
  )
}
