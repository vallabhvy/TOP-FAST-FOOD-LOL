import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import { LegalTabs } from "@/components/LegalTabs";
import { DriveThruFooter } from "@/components/DriveThruFooter";

export const metadata: Metadata = {
  title: "Privacy Policy — topfastfood.lol",
  description:
    "Privacy Policy for topfastfood.lol. How we handle anonymous voting data, X OAuth identity, and payments.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F6F7F3] text-[#1E2A3A] flex flex-col font-sans selection:bg-[#167A75] selection:text-white">
      {/* Header */}
      <header className="border-b border-[#E2E4DC] bg-[#FFFFFF] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <img
              src="/logo.jpg"
              alt="topfastfood.lol logo"
              className="w-7 h-7 sm:w-8 sm:h-8 object-cover rounded-md border border-[#E2E4DC]"
            />
            <span className="text-lg sm:text-xl font-bold tracking-tight text-[#1E2A3A] group-hover:text-[#167A75] transition-colors">
              topfastfood<span className="text-[#167A75]">.lol</span>
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CBD2C4] hover:bg-[#EEF0EA] text-xs sm:text-sm font-medium text-[#1E2A3A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to ranking</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-10 flex-1 w-full space-y-8">
        <LegalTabs activeTab="privacy" />

        <div className="border-b border-[#E2E4DC] pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EEF0EA] text-[#5A6878] text-xs font-medium mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Updated: October 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A3A]">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6878] mt-1">
            topfastfood.lol respects your privacy. We collect minimal data necessary to run the ranking.
          </p>
        </div>

        <div className="space-y-6 text-sm text-[#5A6878] leading-relaxed">
          <section className="space-y-2 bg-[#FFFFFF] p-5 rounded-xl border border-[#E2E4DC]">
            <h2 className="text-base font-bold text-[#1E2A3A]">
              1. What We Collect
            </h2>
            <ul className="list-disc list-inside space-y-1 text-[#5A6878]">
              <li>
                <strong className="text-[#1E2A3A]">Optional X (Twitter) Account Info:</strong> If you log in via X, we receive your public username and display name to attach to your receipts and messages.
              </li>
              <li>
                <strong className="text-[#1E2A3A]">Payment Data:</strong> Payments are processed by certified third-party payment providers (e.g. Dodo Payments). We never store or handle your credit card numbers.
              </li>
              <li>
                <strong className="text-[#1E2A3A]">Anonymous Interaction Data:</strong> Basic technical logs (such as IP addresses for DDoS protection and rate limiting).
              </li>
            </ul>
          </section>

          <section className="space-y-2 bg-[#FFFFFF] p-5 rounded-xl border border-[#E2E4DC]">
            <h2 className="text-base font-bold text-[#1E2A3A]">
              2. How We Use Data
            </h2>
            <p>
              Data is used exclusively to display live leaderboard standings, attribute top-backer notes, and print shareable receipts. We do not sell your personal data to data brokers or third-party advertisers.
            </p>
          </section>

          <section className="space-y-2 bg-[#FFFFFF] p-5 rounded-xl border border-[#E2E4DC]">
            <h2 className="text-base font-bold text-[#1E2A3A]">
              3. Cookies and Local Storage
            </h2>
            <p>
              We use minimal local storage purely to maintain your authentication session and prevent vote-spamming. No invasive tracking cookies are placed on your device.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <DriveThruFooter onOpenFeedback={() => {}} />
    </div>
  );
}
