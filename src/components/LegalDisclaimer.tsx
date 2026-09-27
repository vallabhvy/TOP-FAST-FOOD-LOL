"use client";

import React, { useState } from "react";
import { ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { CRTColorTheme } from "@/types";

interface LegalDisclaimerProps {
  theme: CRTColorTheme;
}

export const LegalDisclaimer: React.FC<LegalDisclaimerProps> = ({ theme }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isGreen = theme === "green";
  const glowText = isGreen ? "text-[#39ff14]" : "text-[#ffb000]";

  return (
    <footer className="mt-16 border-t border-zinc-900 bg-black/95 text-zinc-500 font-mono text-xs py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Short Summary Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] pb-4 border-b border-zinc-900">
          <div className="flex items-center gap-2 text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              TOPFASTFOOD.LOL is a parody &amp; community entertainment poll. Nominative Fair Use applied.
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer text-[11px] uppercase tracking-wider"
          >
            <span>{isExpanded ? "Hide Legal Disclaimers" : "Read Legal Disclaimers & Safe Harbor"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Detailed Legal Protection */}
        {isExpanded && (
          <div className="space-y-3 pt-2 text-[11px] text-zinc-400 bg-zinc-950 p-4 rounded-lg border border-zinc-900">
            <div>
              <span className={`font-bold uppercase ${glowText}`}>1. Nominative Fair Use &amp; Trademark:</span>
              <p className="mt-0.5">
                All restaurant names, trademarks™, and registered® trademarks referenced on topfastfood.lol are the property of their respective trademark holders. Use of these names on this platform is solely for nominative identification, parody, and user-generated community ranking purposes. TOPFASTFOOD.LOL is not endorsed by, sponsored by, or affiliated with McDonald&apos;s, Wendy&apos;s, Taco Bell, or any other fast-food enterprise.
              </p>
            </div>

            <div>
              <span className={`font-bold uppercase ${glowText}`}>2. Defamation &amp; User-Generated Speech (Section 230 / Safe Harbor):</span>
              <p className="mt-0.5">
                Slogans and comments attached to rank transactions represent subjective opinions submitted by anonymous third-party users. TOPFASTFOOD.LOL acts as an interactive computer service provider under 47 U.S.C. § 230 and international safe-harbor standards. We do not endorse defamatory claims or factual assertions regarding food safety. To request the removal of a comment or trademark reference, please submit a notice to legal@topfastfood.lol.
              </p>
            </div>

            <div>
              <span className={`font-bold uppercase ${glowText}`}>3. Digital Entertainment Services (No Gaming / No Bribes):</span>
              <p className="mt-0.5">
                Transactions on this platform constitute voluntary digital micro-tips for entertainment, expressive speech, and community poll participation. Transactions do not confer securities, gambling payouts, advertising contracts, or corporate equity. All contributions are final and strictly non-refundable.
              </p>
            </div>

            <div>
              <span className={`font-bold uppercase ${glowText}`}>4. Content Moderation &amp; Zero-Tolerance Conduct:</span>
              <p className="mt-0.5">
                Hate speech, racial or religious slurs, doxxing (publishing real names, phone numbers, or private addresses), threats, and illegal content are strictly banned. The platform reserves the absolute right to purge, delete, or quarantine any brand, comment, or identity that violates community standards without notice and with ZERO REFUND.
              </p>
            </div>
          </div>
        )}

        {/* Copyright notice */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-zinc-600">
          <div>
            © {new Date().getFullYear()} TOPFASTFOOD.LOL • The Petty Drive-Thru Turf War • All rights reserved.
          </div>
          <div>
            Zero food critics were consulted in the creation of this leaderboard.
          </div>
        </div>
      </div>
    </footer>
  );
};
