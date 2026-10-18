import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import { LegalTabs } from "@/components/LegalTabs";
import { DriveThruFooter } from "@/components/DriveThruFooter";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Privacy Policy — topfastfood.lol",
  description:
    "Privacy Policy for topfastfood.lol. How we handle anonymous voting data, X OAuth identity, and payments.",
};

export default function PrivacyPage() {
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
        <LegalTabs activeTab="privacy" />

        <div className="border-b border-white/[0.08] pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Updated: October 2026</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            topfastfood.lol respects your privacy. We collect minimal data necessary to run the ranking.
          </p>
        </div>

        <div className="space-y-5 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2 glass-card p-5 sm:p-6 rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              1. What We Collect
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300">
              <li>
                <strong className="text-white font-bold">Optional X (Twitter) Account Info:</strong> If you log in via X, we receive your public username and display name to attach to your receipts and messages.
              </li>
              <li>
                <strong className="text-white font-bold">Payment Data:</strong> Payments are processed by certified third-party payment providers (e.g. Dodo Payments). We never store or handle your credit card numbers.
              </li>
              <li>
                <strong className="text-white font-bold">Anonymous Interaction Data:</strong> Basic technical logs (such as IP addresses for DDoS protection and rate limiting).
              </li>
            </ul>
          </section>

          <section className="space-y-2 glass-card p-5 sm:p-6 rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              2. How We Use Data
            </h2>
            <p>
              Data is used exclusively to display live leaderboard standings, attribute top-backer notes, and print shareable receipts. We do not sell your personal data to data brokers or third-party advertisers.
            </p>
          </section>

          <section className="space-y-2 glass-card p-5 sm:p-6 rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              3. Cookies and Local Storage
            </h2>
            <p>
              We use minimal local storage purely to maintain your authentication session and prevent vote-spamming. No invasive tracking cookies are placed on your device.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <DriveThruFooter />
    </div>
  );
}
