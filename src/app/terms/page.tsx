import Link from "next/link";

export const runtime = "edge";

export const metadata = {
  title: "Terms of Service — MarketPulse",
  description: "MarketPulse terms of service. Understand your rights and responsibilities when using our financial data platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">MP</div>
          <span className="text-xl font-bold">MarketPulse</span>
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-slate-400 mb-4">Last updated: March 12, 2026</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using MarketPulse (the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use the Service.</p>
            <p>These Terms apply to all visitors, users, and others who access or use the Service. By creating an account or continuing to use MarketPulse, you confirm that you are at least 18 years old and have the legal capacity to enter into this agreement.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">2. Description of Service</h2>
            <p>MarketPulse is a financial data SaaS platform that provides real-time and historical market data, price alerts, portfolio tracking, and analytics tools for stocks, cryptocurrencies, and other financial instruments.</p>
            <p>The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time with reasonable notice where practicable.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">3. User Accounts</h2>
            <p>To access certain features of the Service you must create an account. You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Providing accurate and up-to-date account information</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
            <p>We reserve the right to suspend or terminate accounts that violate these Terms or that have been inactive for an extended period.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">4. Subscription and Payments</h2>
            <p>MarketPulse offers the following subscription tiers:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><span className="text-white font-medium">Free</span> — Limited access to market data, basic watchlists, and a limited number of price alerts.</li>
              <li><span className="text-white font-medium">Pro</span> — Full access to real-time data, unlimited alerts, advanced charting, and priority data refresh rates.</li>
              <li><span className="text-white font-medium">Premium</span> — Everything in Pro, plus API access, portfolio analytics, institutional-grade data feeds, and dedicated support.</li>
            </ul>
            <p>Paid subscriptions are billed on a recurring monthly or annual basis. All payments are processed securely through Stripe. By subscribing, you authorize us to charge your payment method on a recurring basis until you cancel.</p>
            <p>You may cancel your subscription at any time from your account settings. Cancellations take effect at the end of the current billing period — no partial refunds are issued for unused time unless required by applicable law. We reserve the right to change pricing with at least 30 days&apos; advance notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">5. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Scrape, mirror, or systematically download data from the platform without written permission</li>
              <li>Reverse engineer, decompile, or attempt to extract source code from the Service</li>
              <li>Use automated means (bots, crawlers, scrapers) to access the Service in a manner that exceeds reasonable personal use</li>
              <li>Circumvent any rate limits, access controls, or subscription restrictions</li>
              <li>Redistribute or resell market data obtained through the Service to third parties</li>
              <li>Engage in any activity that is unlawful, harmful, or that violates the rights of others</li>
            </ul>
            <p>Violation of these restrictions may result in immediate account termination and, where applicable, legal action.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">6. Intellectual Property</h2>
            <p>The Service, including its design, code, trademarks, logos, and proprietary data compilations, is owned by MarketPulse and is protected by copyright, trademark, and other intellectual property laws.</p>
            <p>You are granted a limited, non-exclusive, non-transferable license to access and use the Service for your personal or internal business purposes. This license does not include the right to sublicense, resell, or create derivative works based on the Service or its data.</p>
            <p>Any feedback, suggestions, or ideas you provide about the Service may be used by us without obligation to compensate you.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">7. Disclaimer</h2>
            <p>All market data, prices, charts, news, and other financial information provided through MarketPulse are for <span className="text-white font-medium">informational purposes only</span>. Nothing on the Service constitutes financial, investment, legal, or tax advice.</p>
            <p>MarketPulse does not recommend the purchase or sale of any security, cryptocurrency, or other financial instrument. Past performance of any asset displayed on the platform is not indicative of future results. You should consult a qualified financial advisor before making any investment decisions.</p>
            <p>Market data is sourced from third-party providers. While we strive for accuracy, we do not guarantee that data is complete, timely, or error-free. MarketPulse is not liable for any trading losses or financial decisions made based on information displayed on the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">8. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, MarketPulse and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of profits, data, or goodwill — arising out of or in connection with your use of or inability to use the Service.</p>
            <p>Our total liability to you for any claims arising under these Terms shall not exceed the greater of (a) the amount you paid to MarketPulse in the twelve months preceding the claim, or (b) USD $100.</p>
            <p>Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, so some of the above may not apply to you.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">9. Changes to Terms</h2>
            <p>We may update these Terms from time to time. When we do, we will revise the &quot;Last updated&quot; date at the top of this page and, for material changes, notify you via email or an in-app notice at least 14 days before the changes take effect.</p>
            <p>Your continued use of the Service after the effective date of any changes constitutes your acceptance of the revised Terms. If you do not agree to the updated Terms, you must stop using the Service and cancel your subscription if applicable.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">10. Contact</h2>
            <p>If you have any questions about these Terms, please contact us at <a href="mailto:support@marketpulse.app" className="text-indigo-400 hover:text-indigo-300 transition-colors">support@marketpulse.app</a>.</p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-slate-500">
          <span>MarketPulse 2026. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
