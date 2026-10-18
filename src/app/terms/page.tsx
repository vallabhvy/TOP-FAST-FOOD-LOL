import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale, Mail, ShieldAlert } from "lucide-react";
import { LegalTabs } from "@/components/LegalTabs";
import { DriveThruFooter } from "@/components/DriveThruFooter";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Terms & Conditions — topfastfood.lol",
  description:
    "Terms of Service, entertainment rules, non-refundable policy, age requirements, and community standards for topfastfood.lol.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Header */}
      <header className="border-b border-white/[0.08] bg-[#0A0E1A]/75 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-amber-400 rounded-xl blur-md opacity-30 group-hover:opacity-70 transition-opacity" />
              <Logo className="w-8 h-8 relative" size={32} />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              topfastfood<span className="text-cyan-400">.lol</span>
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-pill text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Back to ranking</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-10 flex-1 w-full space-y-8">
        <LegalTabs activeTab="terms" />

        <div className="border-b border-white/[0.08] pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Updated: October 2026</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Please read these terms carefully before participating on topfastfood.lol.
          </p>
        </div>

        <div className="space-y-5 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2 glass-card p-5 sm:p-6 rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              1. Paid Parody Entertainment &amp; No Corporate Affiliation
            </h2>
            <p>
              topfastfood.lol is an independent satirical commentary, parody, and entertainment platform. It is <strong className="text-white">not an official survey, scientific poll, or corporate rating</strong>.
            </p>
            <p>
              Paying to &quot;Boost&quot; or &quot;Sabotage&quot; a fast food chain constitutes a voluntary, non-refundable digital entertainment micro-purchase that updates an algorithmic game score. No restaurant chain or corporation sponsors, endorses, administers, or receives proceeds from this service. All funds go directly to the independent site creator to defray hosting, security, and bandwidth costs.
            </p>
          </section>

          <section className="space-y-2 glass-card p-5 sm:p-6 rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              2. Strict Age Policy (18+)
            </h2>
            <p>
              You must be at least 18 years of age (or the age of majority in your jurisdiction) to initiate micro-transactions on topfastfood.lol. By clicking &quot;Pay&quot;, you represent and warrant that you are legally competent and authorized to use the chosen payment rail (credit card or UPI).
            </p>
          </section>

          <section className="space-y-2 glass-card p-5 sm:p-6 rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              3. Strictly Non-Refundable Policy &amp; Chargebacks
            </h2>
            <p>
              Because score modifications, receipt generation, and real-time public broadcasts take effect instantaneously upon payment confirmation, <strong className="text-white">all transactions are final and strictly non-refundable</strong>.
            </p>
            <p>
              Initiating fraudulent chargebacks or payment disputes for completed digital entertainment services is a violation of these Terms and may result in permanent IP blacklisting and removal of associated public entries.
            </p>
          </section>

          <section className="space-y-2 glass-card p-5 sm:p-6 rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                4. Prohibited Content &amp; Defamation Defense
              </h2>
            </div>
            <p>
              Satirical opinion, comedic banter, and subjective food critiques (&quot;tastes like rubber&quot;, &quot;cold fries&quot;, &quot;overpriced&quot;) are welcome. However, users are strictly prohibited from submitting:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li><strong className="text-white">Factual allegations of health violations</strong> (e.g. claims of food poisoning, disease outbreaks, pests, contamination).</li>
              <li><strong className="text-white">Allegations of criminal conduct</strong> against restaurants, franchises, or individual staff members.</li>
              <li><strong className="text-white">Named employees or personal identification</strong> (doxxing, phone numbers, addresses, social profiles).</li>
              <li><strong className="text-white">Hate speech, slurs, harassment, or threats of violence.</strong></li>
            </ul>
            <p className="text-xs text-slate-400">
              Submissions violating these rules will be removed without refund. Any user can flag questionable posts using the &quot;Report&quot; button on every comment.
            </p>
          </section>

          <section className="space-y-2 glass-card p-5 sm:p-6 rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              5. Fan Slogans Are Unofficial User Submissions
            </h2>
            <p>
              Taglines, mottos, and slogans displayed beneath brand names are submitted by anonymous third-party fans who backed the chain. They do not constitute official corporate marketing statements, endorsements, or announcements by the restaurants.
            </p>
          </section>

          <section className="space-y-2 glass-card p-5 sm:p-6 rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              6. Nominative Fair Use &amp; Takedown Requests
            </h2>
            <p>
              Brand names and trade designations are used strictly under the doctrine of nominative fair use to identify the subjects of public fan debate.
            </p>
            <p>
              If you represent a brand or copyright owner and have inquiries or takedown requests, please email{" "}
              <a
                href="mailto:team@vyncrafts.com"
                className="text-cyan-400 font-bold hover:underline inline-flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" /> team@vyncrafts.com
              </a>
              . All verified requests will be handled promptly.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <DriveThruFooter />
    </div>
  );
}
