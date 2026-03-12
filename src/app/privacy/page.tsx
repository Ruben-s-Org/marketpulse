import Link from "next/link";

export const runtime = "edge";

export const metadata = {
  title: "Privacy Policy — MarketPulse",
  description: "MarketPulse privacy policy. How we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">MP</div>
          <span className="text-xl font-bold">MarketPulse</span>
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-slate-400 mb-4">Last updated: March 12, 2026</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">1. Information We Collect</h2>
            <p>When you sign up for MarketPulse, we collect your name, email address, and profile picture via Google OAuth. We do not store your Google password.</p>
            <p>We also collect usage data such as pages visited, features used, and alerts configured to improve our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide and maintain the MarketPulse service</li>
              <li>Send price alerts and notifications you configure</li>
              <li>Process payments for premium plans</li>
              <li>Improve our product and user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">3. Data Storage</h2>
            <p>Your data is stored securely on Cloudflare infrastructure. We use industry-standard encryption for data in transit and at rest.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Google OAuth for authentication</li>
              <li>Stripe for payment processing</li>
              <li>CoinGecko, Frankfurter, and other public APIs for market data</li>
            </ul>
            <p>Each third-party service has its own privacy policy governing the data they collect.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">5. Data Deletion</h2>
            <p>You can request deletion of your account and all associated data by contacting us. We will process deletion requests within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">6. Contact</h2>
            <p>For privacy-related questions, contact us at privacy@marketpulse.app.</p>
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
