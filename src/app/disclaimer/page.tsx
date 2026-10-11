import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, Mail, AlertCircle } from "lucide-react";
import { LegalTabs } from "@/components/LegalTabs";

export const metadata: Metadata = {
  title: "Legal Disclaimers & Safe Harbor | TOPFASTFOOD.LOL",
  description:
    "Official Legal Disclaimers, Section 230 Safe Harbor compliance, Nominative Fair Use, and DMCA takedown procedures for TOPFASTFOOD.LOL.",
};

export default function DisclaimerPage() {
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
                LEGAL • SAFE HARBOR
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

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-10 flex-1 w-full space-y-8 relative z-10">
        {/* Navigation Tabs at Top */}
        <LegalTabs activeTab="disclaimer" />

        <div className="border-b border-zinc-800 pb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>OFFICIAL SAFE HARBOR &amp; STATUTORY NOTICE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase text-white glow-green">
            LEGAL DISCLAIMERS &amp; SAFE HARBOR
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-sans leading-relaxed">
            TOPFASTFOOD.LOL operates as an interactive digital entertainment service, satirical community poll, and expressive forum. Below are the statutory protections, trademark notices, and safe-harbor standards governing this service.
          </p>
        </div>

        <div className="space-y-6 text-xs text-zinc-300 font-sans leading-relaxed">
          {/* Section 1 */}
          <div className="bg-zinc-950/90 border border-zinc-800 p-5 rounded-lg space-y-2">
            <h2 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="text-amber-400">1.</span> Nominative Fair Use &amp; Trademark Protection
            </h2>
            <p>
              All restaurant brand names, registered trademarks®, unregistered service marks™, trade dress, and company logos referenced on <strong>topfastfood.lol</strong> belong exclusively to their respective corporate trademark holders.
            </p>
            <p>
              Use of these commercial names on this platform is strictly for <strong>nominative identification, commentary, parody, and user-generated community polling</strong> under United States trademark law (including the Lanham Act, 15 U.S.C. § 1125, and First Amendment doctrines). TOPFASTFOOD.LOL is not endorsed by, sponsored by, or commercially affiliated with McDonald&apos;s Corporation, The Wendy&apos;s Company, Yum! Brands (Taco Bell, KFC, Pizza Hut), Chick-fil-A, Inc., or any other fast-food enterprise.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-zinc-950/90 border border-zinc-800 p-5 rounded-lg space-y-2">
            <h2 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="text-amber-400">2.</span> Section 230 Safe Harbor &amp; User-Generated Speech
            </h2>
            <p>
              Leaderboard slogans, intercom transmissions, roast notes, and reply threads represent the subjective speech and personal opinions of independent third-party users.
            </p>
            <p>
              Under <strong>47 U.S.C. § 230(c)(1)</strong> of the Communications Decency Act and international intermediary liability protections, TOPFASTFOOD.LOL acts strictly as an interactive computer service provider and is immune from liability for content provided by another information content provider. We do not independently verify or endorse factual assertions regarding food safety, hygiene, or commercial practices.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-zinc-950/90 border border-zinc-800 p-5 rounded-lg space-y-2">
            <h2 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="text-amber-400">3.</span> Digital Entertainment Services (No Gambling / No Bribes)
            </h2>
            <p>
              Transactions processed on this site constitute voluntary digital micro-tips for expressive speech, community participation, and digital thermal receipt generation. Transactions do not confer securities, commercial equity, real-world advertising agreements, or chances to win prize payouts. This platform does not operate real-money wagering, sports betting, or games of chance. All contributions are final and strictly non-refundable.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-zinc-950/90 border border-zinc-800 p-5 rounded-lg space-y-2">
            <h2 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="text-amber-400">4.</span> Content Moderation &amp; Zero-Tolerance Conduct
            </h2>
            <p>
              Our platform enforces strict automated and human content moderation to protect community safety. The following conduct is strictly prohibited:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Hate speech, racial, religious, sexual, or ethnic slurs</li>
              <li>Doxxing (publishing real names, private phone numbers, physical addresses, or confidential details)</li>
              <li>Threats of physical harm, stalking, or harassment</li>
              <li>Malicious spamming or automated bot submissions</li>
            </ul>
            <p className="pt-1">
              We reserve the absolute right to purge, edit, or quarantine any brand, roast message, or user handle that violates community standards without prior notice and with <strong>zero refund</strong>.
            </p>
          </div>

          {/* Section 5: Cease & Desist, Notice & Takedown Procedure */}
          <div className="bg-zinc-950/90 border border-emerald-500/50 p-5 rounded-lg space-y-3">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>5. Cease &amp; Desist, Trademark Inquiries &amp; Content Removal Protocol</span>
            </h2>
            <p>
              We respect intellectual property rights and community safety. If you are a trademark owner, authorized legal counsel, restaurant brand representative, or individual who requests the modification, takedown, or removal of any user-submitted comment, roast, or trademark reference, please reach out to us directly before initiating litigation or filing suit.
            </p>
            <p className="text-zinc-400">
              We pledge to promptly investigate all good-faith inquiries and voluntarily remove or modify content that violates legitimate rights or community standards.
            </p>
            <div className="bg-black/90 border border-emerald-500/30 rounded p-4 text-zinc-300 font-mono text-xs space-y-2">
              <div>
                <strong className="text-emerald-400">Official Legal &amp; Takedown Contact:</strong>{" "}
                <a href="mailto:team@vyncrafts.com" className="text-white hover:text-emerald-400 underline font-bold">
                  team@vyncrafts.com
                </a>
              </div>
              <div>
                <strong>Subject Line:</strong> &quot;[LEGAL NOTICE / TAKEDOWN REQUEST] - TOPFASTFOOD.LOL&quot;
              </div>
              <div className="text-[11px] text-zinc-400">
                <strong>Please Provide:</strong> (1) The specific URL or transaction receipt number, (2) the trademark or content in dispute, and (3) your contact details and basis for the removal request.
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">
              Terms &amp; Conditions &rarr;
            </Link>
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
              Privacy Policy &rarr;
            </Link>
          </div>
          <div>© {new Date().getFullYear()} TOPFASTFOOD.LOL</div>
        </div>
      </main>
    </div>
  );
}
