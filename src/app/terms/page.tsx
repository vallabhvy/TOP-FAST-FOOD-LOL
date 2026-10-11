import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Scale, FileText } from "lucide-react";
import { LegalTabs } from "@/components/LegalTabs";

export const metadata: Metadata = {
  title: "Terms & Conditions | TOPFASTFOOD.LOL",
  description:
    "Terms of Service, entertainment rules, nominative fair use, and community standards for TOPFASTFOOD.LOL.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen crt-screen text-zinc-100 flex flex-col font-mono relative selection:bg-emerald-500 selection:text-black">
      <div className="fixed inset-0 scanlines pointer-events-none z-40 opacity-75" />

      {/* Header */}
      <header className="border-b border-[#39ff14]/30 bg-black/85 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <img
              src="/logo.jpg"
              alt="TOPFASTFOOD.LOL Logo"
              className="w-10 h-10 object-contain rounded border border-zinc-800 group-hover:border-emerald-400 transition-colors"
            />
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tighter text-[#39ff14] glow-green font-mono leading-none">
                TOPFASTFOOD<span className="text-white">.LOL</span>
              </span>
              <span className="text-[10px] text-zinc-500 tracking-wider">
                LEGAL • TERMS OF SERVICE
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 transition-all font-bold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO DRIVE-THRU</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-10 flex-1 w-full space-y-8 relative z-10">
        {/* Navigation Tabs at Top */}
        <LegalTabs activeTab="terms" />
        <div className="border-b border-zinc-800 pb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-bold mb-3">
            <Scale className="w-3.5 h-3.5" />
            <span>LAST UPDATED: OCTOBER 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase text-white glow-green">
            TERMS &amp; CONDITIONS
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-sans">
            Please read these Terms carefully before using TOPFASTFOOD.LOL. By accessing or interacting with our drive-thru leaderboard, you agree to be bound by these terms.
          </p>
        </div>

        <div className="space-y-6 text-xs text-zinc-300 font-sans leading-relaxed">
          {/* Section 1 */}
          <div className="bg-zinc-950/90 border border-zinc-800 p-5 rounded-lg space-y-2">
            <h2 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="text-amber-400">01.</span> Entertainment &amp; Parody Service
            </h2>
            <p>
              TOPFASTFOOD.LOL is an interactive digital entertainment experience, comedy leaderboard, and user-generated community poll. No commercial food items, restaurant franchise equity, or real-world catering services are provided. All point totals, ranks, and badges represent community entertainment.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-zinc-950/90 border border-zinc-800 p-5 rounded-lg space-y-2">
            <h2 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="text-amber-400">02.</span> Nominative Fair Use &amp; Trademarks
            </h2>
            <p>
              All restaurant names, marks, logos, and trademarks displayed on this site (including but not limited to McDonald&apos;s, Wendy&apos;s, Taco Bell, Chick-fil-A, In-N-Out, etc.) are the exclusive property of their respective owners. Their reference on this website is strictly for nominative identification, public discourse, parody, and satirical community ranking purposes under United States trademark law and fair use doctrines. TOPFASTFOOD.LOL is an independent platform and is not affiliated with, endorsed by, or sponsored by any restaurant chain.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-zinc-950/90 border border-zinc-800 p-5 rounded-lg space-y-2">
            <h2 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="text-amber-400">03.</span> Micro-Tips, Boosts &amp; Sabotages (Non-Refundable)
            </h2>
            <p>
              Voluntary contributions made via our payment providers constitute digital micro-tips for expressively ranking chains and printing virtual digital receipts. These contributions do not represent securities, investments, or commercial advertising contracts. Due to the real-time nature of leaderboard scores and instant digital receipt creation, all completed transactions are strictly final and non-refundable.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-zinc-950/90 border border-zinc-800 p-5 rounded-lg space-y-2">
            <h2 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="text-amber-400">04.</span> User Conduct &amp; Content Moderation (Section 230)
            </h2>
            <p>
              User-submitted slogans, intercom messages, and roasts reflect the subjective views of anonymous third-party users. Under 47 U.S.C. § 230, TOPFASTFOOD.LOL operates as an interactive computer service provider. We strictly prohibit:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Hate speech, racial, religious, or ethnic slurs</li>
              <li>Doxxing (publishing private phone numbers, home addresses, or real-life identities)</li>
              <li>Threats of physical harm or violence</li>
              <li>Illegal content or automated spamming attacks</li>
            </ul>
            <p className="pt-1">
              Violating content will be immediately quarantined, hidden, or permanently deleted without notice.
            </p>
          </div>

          {/* Section 5 */}
          <div className="bg-zinc-950/90 border border-zinc-800 p-5 rounded-lg space-y-2">
            <h2 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="text-amber-400">05.</span> Fair-Use Rate Limiting &amp; System Integrity
            </h2>
            <p>
              Users agree not to execute automated bots, crawlers, or stress scripts against our APIs. A strict rate limit of 100 requests per minute per IP address is enforced across all submission endpoints. Excessive requests will be automatically throttled with HTTP 429 status codes.
            </p>
          </div>

          {/* Section 6 */}
          <div className="bg-zinc-950/90 border border-emerald-500/40 p-5 rounded-lg space-y-2">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="text-emerald-400">06.</span> Cease &amp; Desist, Trademark Infringement &amp; Removal Requests
            </h2>
            <p>
              If you represent a restaurant enterprise, trademark registrant, or third party requesting the alteration, quarantine, or removal of any user-submitted content or brand reference, you agree to submit a formal notice to our legal operations team at <a href="mailto:team@vyncrafts.com" className="text-emerald-400 underline font-bold">team@vyncrafts.com</a> prior to initiating formal litigation or seeking injunctive relief. We will review and act upon all substantiated notices in good faith.
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
              Read Privacy Policy &rarr;
            </Link>
            <Link href="/about" className="hover:text-emerald-400 transition-colors">
              About TOPFASTFOOD.LOL &rarr;
            </Link>
          </div>
          <div>© {new Date().getFullYear()} TOPFASTFOOD.LOL</div>
        </div>
      </main>
    </div>
  );
}
