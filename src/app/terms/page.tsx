import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { LegalTabs } from "@/components/LegalTabs";
import { DriveThruFooter } from "@/components/DriveThruFooter";

export const metadata: Metadata = {
  title: "Terms & Conditions — topfastfood.lol",
  description:
    "Terms of Service, entertainment rules, age policy, and community standards for topfastfood.lol.",
};

export default function TermsPage() {
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
        <LegalTabs activeTab="terms" />

        <div className="border-b border-[#E2E4DC] pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EEF0EA] text-[#5A6878] text-xs font-medium mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Updated: October 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A3A]">
            Terms &amp; Conditions
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6878] mt-1">
            Please read these terms carefully before participating on topfastfood.lol.
          </p>
        </div>

        <div className="space-y-6 text-sm text-[#5A6878] leading-relaxed">
          <section className="space-y-2 bg-[#FFFFFF] p-5 rounded-xl border border-[#E2E4DC]">
            <h2 className="text-base font-bold text-[#1E2A3A]">
              1. Nature of the Service &amp; Non-Refundable Micro-Tips
            </h2>
            <p>
              topfastfood.lol is an independent satirical commentary, parody, and entertainment platform. Paying $1 to boost or sabotage a restaurant chain constitutes a voluntary, non-refundable entertainment micro-tip.
            </p>
            <p>
              <strong className="text-[#1E2A3A]">Where the money goes:</strong> All micro-tips go directly to the site&apos;s independent creator to cover hosting, maintenance, and server bandwidth costs. No money is paid to, shared with, or endorsed by any restaurant corporation.
            </p>
          </section>

          <section className="space-y-2 bg-[#FFFFFF] p-5 rounded-xl border border-[#E2E4DC]">
            <h2 className="text-base font-bold text-[#1E2A3A]">
              2. Age Policy &amp; Eligibility
            </h2>
            <p>
              You must be at least 18 years old, or the legal age of majority in your jurisdiction, or have the express permission and supervision of a parent or legal guardian to make payments on this site. By submitting a payment, you represent and warrant that you meet this requirement.
            </p>
          </section>

          <section className="space-y-2 bg-[#FFFFFF] p-5 rounded-xl border border-[#E2E4DC]">
            <h2 className="text-base font-bold text-[#1E2A3A]">
              3. Community Conduct &amp; Content Moderation
            </h2>
            <p>
              Users may attach optional short messages to their orders. We maintain a zero-tolerance policy for hate speech, threats, harassment, doxxing, personal private phone numbers/addresses, and spam. Messages violating these rules will be rejected or removed without refund.
            </p>
          </section>

          <section className="space-y-2 bg-[#FFFFFF] p-5 rounded-xl border border-[#E2E4DC]">
            <h2 className="text-base font-bold text-[#1E2A3A]">
              4. Nominative Fair Use of Trademarks
            </h2>
            <p>
              All restaurant names, marks, logos, and trademarks displayed on this site (including McDonald&apos;s, Wendy&apos;s, Taco Bell, Chick-fil-A, etc.) are the property of their respective owners. Their reference on this website is strictly for nominative identification, public discourse, parody, and satirical community ranking under United States trademark law and fair use doctrines.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <DriveThruFooter onOpenFeedback={() => {}} />
    </div>
  );
}
