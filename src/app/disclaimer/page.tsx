import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, Mail } from "lucide-react";
import { LegalTabs } from "@/components/LegalTabs";
import { DriveThruFooter } from "@/components/DriveThruFooter";

export const metadata: Metadata = {
  title: "Legal Disclaimers — topfastfood.lol",
  description:
    "Legal Disclaimers, Section 230 Safe Harbor compliance, Nominative Fair Use, and DMCA procedures for topfastfood.lol.",
};

export default function DisclaimerPage() {
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
        <LegalTabs activeTab="disclaimer" />

        <div className="border-b border-[#E2E4DC] pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EEF0EA] text-[#5A6878] text-xs font-medium mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Legal Disclaimer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A3A]">
            Disclaimers &amp; Safe Harbor
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6878] mt-1">
            Important legal information regarding parody ranking, fair use, and intermediary liability.
          </p>
        </div>

        <div className="space-y-6 text-sm text-[#5A6878] leading-relaxed">
          <section className="space-y-2 bg-[#FFFFFF] p-5 rounded-xl border border-[#E2E4DC]">
            <h2 className="text-base font-bold text-[#1E2A3A]">
              1. Parody, Satire &amp; Entertainment Only
            </h2>
            <p>
              topfastfood.lol is an independent parody and satirical website created solely for humor and public discussion. Rankings are generated through voluntary micro-payments by visitors and do not represent verified culinary evaluations, official restaurant statistics, or objective consumer quality standards.
            </p>
          </section>

          <section className="space-y-2 bg-[#FFFFFF] p-5 rounded-xl border border-[#E2E4DC]">
            <h2 className="text-base font-bold text-[#1E2A3A]">
              2. Trademark &amp; Nominative Fair Use
            </h2>
            <p>
              All restaurant brand names, trademarks, and trade dress referenced on topfastfood.lol belong exclusively to their respective owners. Reference to these brands is strictly nominative to identify the subject of public humor and fan debate. topfastfood.lol is not affiliated with, sponsored by, or endorsed by any restaurant chain.
            </p>
          </section>

          <section className="space-y-2 bg-[#FFFFFF] p-5 rounded-xl border border-[#E2E4DC]">
            <h2 className="text-base font-bold text-[#1E2A3A]">
              3. Section 230 Safe Harbor Notice
            </h2>
            <p>
              In accordance with 47 U.S.C. § 230 (the Communications Decency Act), topfastfood.lol is an interactive computer service provider and is not the publisher or speaker of user-submitted messages, roasts, or handles. Responsibility for user-generated content lies solely with the submitting user.
            </p>
          </section>

          <section className="space-y-2 bg-[#FFFFFF] p-5 rounded-xl border border-[#E2E4DC]">
            <h2 className="text-base font-bold text-[#1E2A3A]">
              4. Contact &amp; Takedown Requests
            </h2>
            <p>
              If you believe content on this site infringes your intellectual property or violates applicable law, please contact the creator at{" "}
              <a
                href="mailto:team@vyncrafts.com"
                className="text-[#167A75] font-bold hover:underline inline-flex items-center gap-1"
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
