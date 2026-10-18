import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, Mail } from "lucide-react";
import { LegalTabs } from "@/components/LegalTabs";
import { DriveThruFooter } from "@/components/DriveThruFooter";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Legal Disclaimers — topfastfood.lol",
  description:
    "Legal Disclaimers, Section 230 Safe Harbor compliance, Nominative Fair Use, and DMCA procedures for topfastfood.lol.",
};

export default function DisclaimerPage() {
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
        <LegalTabs activeTab="disclaimer" />

        <div className="border-b border-white/[0.08] pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Legal Disclaimer</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Disclaimers &amp; Safe Harbor
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Important legal information regarding parody ranking, fair use, and intermediary liability.
          </p>
        </div>

        <div className="space-y-5 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2 glass-card p-5 sm:p-6 rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              1. Parody, Satire &amp; Entertainment Only
            </h2>
            <p>
              topfastfood.lol is an independent parody and satirical website created solely for humor and public discussion. Rankings are generated through voluntary micro-payments by visitors and do not represent verified culinary evaluations, official restaurant statistics, or objective consumer quality standards.
            </p>
          </section>

          <section className="space-y-2 glass-card p-5 sm:p-6 rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              2. Trademark &amp; Nominative Fair Use
            </h2>
            <p>
              All restaurant brand names, trademarks, and trade dress referenced on topfastfood.lol belong exclusively to their respective owners. Reference to these brands is strictly nominative to identify the subject of public humor and fan debate. topfastfood.lol is not affiliated with, sponsored by, or endorsed by any restaurant chain.
            </p>
          </section>

          <section className="space-y-2 glass-card p-5 sm:p-6 rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              3. Section 230 Safe Harbor Notice
            </h2>
            <p>
              In accordance with 47 U.S.C. § 230 (the Communications Decency Act), topfastfood.lol is an interactive computer service provider and is not the publisher or speaker of user-submitted messages, roasts, or handles. Responsibility for user-generated content lies solely with the submitting user.
            </p>
          </section>

          <section className="space-y-2 glass-card p-5 sm:p-6 rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              4. Contact &amp; Takedown Requests
            </h2>
            <p>
              If you believe content on this site infringes your intellectual property or violates applicable law, please contact the creator at{" "}
              <a
                href="mailto:team@vyncrafts.com"
                className="text-cyan-400 font-bold hover:underline inline-flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" /> team@vyncrafts.com
              </a>{" "}
              with details. Valid requests will be processed promptly.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <DriveThruFooter />
    </div>
  );
}
