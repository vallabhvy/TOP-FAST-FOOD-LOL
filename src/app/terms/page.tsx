import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { LegalTabs } from "@/components/LegalTabs";
import { DriveThruFooter } from "@/components/DriveThruFooter";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Terms & Conditions — topfastfood.lol",
  description:
    "Terms of Service, entertainment rules, age policy, and community standards for topfastfood.lol.",
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
              1. Nature of the Service &amp; Non-Refundable Micro-Tips
            </h2>
            <p>
              topfastfood.lol is an independent satirical commentary, parody, and entertainment platform. Paying $1 to boost or sabotage a restaurant chain constitutes a voluntary, non-refundable entertainment micro-tip.
            </p>
            <p>
              <strong className="text-white font-bold">Where the money goes:</strong> All micro-tips go directly to the site&apos;s independent creator to cover hosting, maintenance, and server bandwidth costs. No money is paid to, shared with, or endorsed by any restaurant corporation.
            </p>
          </section>

          <section className="space-y-2 glass-card p-5 sm:p-6 rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              2. Age Policy &amp; Eligibility
            </h2>
            <p>
              You must be at least 18 years old, or the legal age of majority in your jurisdiction, or have the express permission and supervision of a parent or legal guardian to make payments on this site. By submitting a payment, you represent and warrant that you meet this requirement.
            </p>
          </section>

          <section className="space-y-2 glass-card p-5 sm:p-6 rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              3. Community Conduct &amp; Content Moderation
            </h2>
            <p>
              Users may attach optional short messages to their orders. We maintain a zero-tolerance policy for hate speech, threats, harassment, doxxing, personal private phone numbers/addresses, and spam. Messages violating these rules will be rejected or removed without refund.
            </p>
          </section>

          <section className="space-y-2 glass-card p-5 sm:p-6 rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              4. Nominative Fair Use of Trademarks
            </h2>
            <p>
              All restaurant names, marks, logos, and trademarks displayed on this site (including McDonald&apos;s, Wendy&apos;s, Taco Bell, Chick-fil-A, etc.) are the property of their respective owners. Their reference on this website is strictly for nominative identification, public discourse, parody, and satirical community ranking under United States trademark law and fair use doctrines.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <DriveThruFooter />
    </div>
  );
}
