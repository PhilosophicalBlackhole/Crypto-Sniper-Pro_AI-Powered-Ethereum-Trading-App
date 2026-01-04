/**
 * File: LegalFooter.tsx
 * Purpose: Provide site-wide access to Terms of Service and Privacy Policy content
 * via a persistent footer with modal overlays. Keeps legal requirements visible
 * on the landing page and throughout the app without changing routes.
 */

import React, { useState } from 'react';

/**
 * LegalFooter
 * Renders a small footer bar with "Terms of Service" and "Privacy Policy" links.
 * Clicking a link opens a full-screen overlay containing the relevant document.
 */
export function LegalFooter(): JSX.Element {
  const [open, setOpen] = useState<'terms' | 'privacy' | null>(null);

  /**
   * Close any open legal modal.
   */
  const closeModal = (): void => setOpen(null);

  /**
   * Render the modal shell with given title and body content.
   */
  const renderModal = (
    kind: 'terms' | 'privacy',
    title: string,
    body: React.ReactNode
  ): JSX.Element | null => {
    if (open !== kind) return null;

    return (
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/95 p-6 shadow-2xl">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="mt-1 text-xs text-slate-400">
                Last updated: December 2024
              </p>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-slate-200">
            {body}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-md border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render Terms of Service content.
   */
  const termsBody = (
    <>
      <p>
        CryptoSniper Pro (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) provides
        tools and educational materials for interacting with blockchain
        networks. By accessing or using this site or application
        (collectively, the &quot;Service&quot;), you agree to these Terms of
        Service.
      </p>
      <h3 className="mt-4 text-base font-semibold text-white">1. No financial advice</h3>
      <p>
        The Service is provided for informational and educational purposes only
        and does not constitute investment, trading, or financial advice. You
        are solely responsible for your own decisions and for complying with
        all applicable laws and regulations in your jurisdiction.
      </p>

      <h3 className="mt-4 text-base font-semibold text-white">2. Eligibility</h3>
      <p>
        You must be of legal age to use the Service in your country of
        residence. By using the Service, you represent that you meet this
        requirement.
      </p>

      <h3 className="mt-4 text-base font-semibold text-white">3. Risk disclosure</h3>
      <p>
        Trading digital assets involves significant risk, including the possible
        loss of all capital. Smart contracts and blockchain networks may fail,
        be attacked, or behave unexpectedly. You understand and accept these
        risks when using the Service, including any automated or &quot;sniping&quot;
        functionality.
      </p>

      <h3 className="mt-4 text-base font-semibold text-white">4. Non-custodial nature</h3>
      <p>
        We do not custody your funds. You remain in full control of your
        wallets and private keys at all times. You are responsible for securing
        your devices, wallets, and recovery phrases.
      </p>

      <h3 className="mt-4 text-base font-semibold text-white">5. Third-party services</h3>
      <p>
        The Service may integrate third-party providers such as wallet
        extensions, RPC providers, analytics tools, payment processors, and
        authentication services (e.g., Supabase, Auth0, Stripe). Your use of
        such services is governed by their respective terms and policies.
      </p>

      <h3 className="mt-4 text-base font-semibold text-white">6. Acceptable use</h3>
      <p>
        You agree not to use the Service for any unlawful activity, including
        but not limited to money laundering, terrorist financing, or sanctions
        evasion, and not to interfere with or disrupt the Service or its
        infrastructure.
      </p>

      <h3 className="mt-4 text-base font-semibold text-white">7. Disclaimer of warranties</h3>
      <p>
        The Service is provided &quot;as is&quot; and &quot;as available&quot; without
        warranties of any kind, express or implied. We do not guarantee
        uptime, performance, or profitability.
      </p>

      <h3 className="mt-4 text-base font-semibold text-white">8. Limitation of liability</h3>
      <p>
        To the maximum extent permitted by law, we will not be liable for any
        indirect, incidental, special, consequential, or exemplary damages,
        including loss of profits, arising from or relating to your use of the
        Service.
      </p>

      <h3 className="mt-4 text-base font-semibold text-white">9. Changes to these terms</h3>
      <p>
        We may update these Terms of Service from time to time. Changes are
        effective when posted. Continued use of the Service after changes
        become effective constitutes acceptance of the updated terms.
      </p>

      <h3 className="mt-4 text-base font-semibold text-white">10. Contact</h3>
      <p>
        If you have questions about these Terms, you can reach us at:
        Support@CryptoSniper.pro 
      </p>
    </>
  );

  /**
   * Render Privacy Policy content.
   */
  const privacyBody = (
    <>
      <p>
        This Privacy Policy describes how CryptoSniper Pro (&quot;we&quot;,
        &quot;our&quot;, &quot;us&quot;) collects, uses, and protects information in
        connection with the Service.
      </p>

      <h3 className="mt-4 text-base font-semibold text-white">1. Information we collect</h3>
      <p>
        We may collect limited information when you use the Service, such as:
      </p>
      <ul className="ml-5 list-disc space-y-1 text-sm">
        <li>Wallet addresses and network metadata required to connect and display balances.</li>
        <li>Basic account details (e.g., email, display name) when you sign up via Supabase or other providers.</li>
        <li>Usage and diagnostic data to improve performance and reliability.</li>
      </ul>

      <h3 className="mt-4 text-base font-semibold text-white">2. How we use information</h3>
      <p>We use collected information to:</p>
      <ul className="ml-5 list-disc space-y-1 text-sm">
        <li>Provide and maintain the Service and its features.</li>
        <li>Authenticate users and manage subscriptions and billing.</li>
        <li>Monitor performance, detect abuse, and improve user experience.</li>
      </ul>

      <h3 className="mt-4 text-base font-semibold text-white">3. Cookies and analytics</h3>
      <p>
        The Service may use cookies or similar technologies and may integrate
        third-party analytics providers. You can adjust your browser settings to
        manage or block cookies, but some features may not function correctly if
        cookies are disabled.
      </p>

      <h3 className="mt-4 text-base font-semibold text-white">4. Third-party services</h3>
      <p>
        We rely on third-party providers (such as Supabase for authentication,
        Stripe for payments, and wallet providers) to deliver core
        functionality. These providers may process data as described in their
        own privacy policies, which you should review independently.
      </p>

      <h3 className="mt-4 text-base font-semibold text-white">5. Data security</h3>
      <p>
        We apply reasonable technical and organizational measures to protect
        information. However, no system is completely secure, and we cannot
        guarantee absolute security of data transmitted over the internet.
      </p>

      <h3 className="mt-4 text-base font-semibold text-white">6. Your choices</h3>
      <p>
        You may disconnect wallets, close your account, or stop using the
        Service at any time. Some information may be retained as required for
        legal, accounting, or security purposes.
      </p>

      <h3 className="mt-4 text-base font-semibold text-white">7. International transfers</h3>
      <p>
        Depending on your location, data may be processed in countries that may
        have different data protection laws than your jurisdiction.
      </p>

      <h3 className="mt-4 text-base font-semibold text-white">8. Changes to this policy</h3>
      <p>
        We may update this Privacy Policy from time to time. Changes are
        effective when posted. Continued use of the Service after changes
        become effective constitutes acceptance of the updated policy.
      </p>

      <h3 className="mt-4 text-base font-semibold text-white">9. Contact</h3>
      <p>
        For privacy-related questions or requests, contact:
        Support@CryptoSniper.Pro
      </p>
    </>
  );

  return (
    <>
      {/* Footer bar visible on all pages */}
      <footer className="border-t border-slate-800 bg-slate-950/80 px-4 py-3 text-xs text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 sm:flex-row">
          <span className="text-center sm:text-left">
            © {new Date().getFullYear()} CryptoSniper Pro. Not financial advice.
          </span>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setOpen('terms')}
              className="underline-offset-4 hover:text-slate-200 hover:underline"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => setOpen('privacy')}
              className="underline-offset-4 hover:text-slate-200 hover:underline"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {renderModal('terms', 'Terms of Service', termsBody)}
      {renderModal('privacy', 'Privacy Policy', privacyBody)}
    </>
  );
}
