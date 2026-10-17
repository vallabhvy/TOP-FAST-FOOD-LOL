"use client";

import React from "react";
import { Flame, Skull, Crown, MessageSquare, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { FastFoodBrand, ActionType, Transaction, CRTColorTheme } from "@/types";
import { sound } from "@/lib/sound";
import { UserAvatar } from "@/components/UserAvatar";
import { getBrandVisual } from "@/lib/brandMeta";
import Link from "next/link";

interface BrandCardProps {
  brand: FastFoodBrand;
  rank: number;
  comments?: Transaction[];
  onOpenOrder: (brand: FastFoodBrand, action: ActionType) => void;
  onBrandClick: (brandId: string) => void;
  onReceiptClick?: (transaction: Transaction) => void;
  theme: CRTColorTheme;
}

export const BrandCard: React.FC<BrandCardProps> = ({
  brand,
  rank,
  comments = [],
  onOpenOrder,
  onBrandClick,
  theme,
}) => {
  const isGreen = theme === "green";
  const glowColor = isGreen
    ? "text-[#39ff14] glow-green"
    : "text-[#ffb000] glow-amber";
  const isTop1 = rank === 1;
  const isTop3 = rank <= 3;

  const totalVotes = brand.totalBoosts + brand.totalSabotages;
  const boostRatio =
    totalVotes > 0 ? (brand.totalBoosts / totalVotes) * 100 : 50;

  const visual = getBrandVisual(brand.id, brand.category);

  // Status Badge Logic
  let statusBadge = null;
  if (isTop1 && brand.totalScore > 0) {
    statusBadge = (
      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/40 bg-amber-950/40 shadow-[0_0_8px_rgba(251,191,36,0.2)]">
        <Crown className="w-3 h-3 text-amber-300" /> REIGNING CHAMP
      </span>
    );
  } else if (brand.totalScore > 0) {
    statusBadge = (
      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-950/30">
        <TrendingUp className="w-3 h-3 text-emerald-400" /> ON FIRE
      </span>
    );
  } else if (brand.totalScore < 0) {
    statusBadge = (
      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/30 bg-rose-950/30">
        <TrendingDown className="w-3 h-3 text-rose-400" /> UNDER SIEGE
      </span>
    );
  } else if (totalVotes === 0) {
    statusBadge = (
      <span className="text-[10px] font-mono text-zinc-500 px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-950">
        UNCLAIMED
      </span>
    );
  }

  return (
    <div
      className={`group relative bg-gradient-to-b from-zinc-900/80 via-zinc-950/90 to-zinc-950 border transition-all duration-300 rounded-xl flex flex-col overflow-hidden backdrop-blur-md ${
        isTop1
          ? "border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.15)] hover:border-amber-300 hover:shadow-[0_0_35px_rgba(251,191,36,0.25)]"
          : isTop3
            ? "border-zinc-700/80 hover:border-zinc-500 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]"
            : "border-zinc-800/80 hover:border-zinc-700 hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]"
      }`}
    >
      {/* Top Main Row: Rank, Brand Info, Warchest & Action Buttons */}
      <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Rank, Avatar & Brand Info */}
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
          {/* Rank Badge */}
          <div
            className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg border font-mono transition-transform group-hover:scale-105 ${
              isTop1
                ? "bg-gradient-to-br from-amber-500/30 to-amber-700/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                : rank === 2
                  ? "bg-zinc-800/90 border-zinc-500 text-zinc-200"
                  : rank === 3
                    ? "bg-amber-950/40 border-amber-700 text-amber-500"
                    : "bg-zinc-900 border-zinc-800 text-zinc-500"
            }`}
          >
            {isTop1 ? <Crown className="w-5 h-5 text-amber-300" /> : `#${rank}`}
          </div>

          {/* Brand Signature Visual Avatar */}
          <div
            className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl border border-zinc-800 bg-zinc-900/90 shadow-inner group-hover:scale-105 transition-transform"
            style={{
              borderColor: isTop1 ? "#f59e0b" : visual.borderColor + "55",
              boxShadow: `0 0 14px ${visual.bgGlow}`,
            }}
          >
            {visual.emoji}
          </div>

          {/* Brand Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2
                onClick={() => {
                  sound.playClick();
                  onBrandClick(brand.id);
                }}
                className="text-base sm:text-xl font-bold uppercase tracking-tight text-white hover:text-amber-300 hover:underline cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                {brand.name}
              </h2>
              <span className="text-[10px] text-zinc-500 uppercase px-2 py-0.5 border border-zinc-800 rounded bg-black/40 font-mono">
                {brand.category}
              </span>
              {statusBadge}
            </div>

            {/* Current Slogan (The Latest Pinned Roast Note) */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono truncate">
              <span className="text-zinc-300 italic truncate">
                &quot;{brand.currentSlogan}&quot;
              </span>
              <span className="text-zinc-500 text-[11px] flex-shrink-0 flex items-center gap-1">
                —
                {brand.sloganAuthor.startsWith("@") &&
                brand.sloganAuthor !== "@anon_driver" ? (
                  <a
                    href={`https://x.com/${brand.sloganAuthor.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-sky-400 hover:underline flex items-center gap-1 transition-colors"
                  >
                    <UserAvatar handle={brand.sloganAuthor} size="xs" />
                    <span>{brand.sloganAuthor}</span>
                  </a>
                ) : (
                  <span>{brand.sloganAuthor}</span>
                )}
                {brand.location && (
                  <span className="text-[10px] text-zinc-600 font-mono">
                    [{brand.location}]
                  </span>
                )}
              </span>
            </div>

            {/* Tug-of-War Battle Sentiment Bar */}
            <div className="mt-2 flex items-center gap-2.5 max-w-sm">
              <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden flex border border-zinc-800/80 p-[1px]">
                {totalVotes === 0 ? (
                  <div className="w-full bg-zinc-800/60 h-full rounded-full" />
                ) : (
                  <>
                    <div
                      style={{ width: `${boostRatio}%` }}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full transition-all duration-500 rounded-l-full shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                    />
                    <div
                      style={{ width: `${100 - boostRatio}%` }}
                      className="bg-gradient-to-r from-rose-500 to-rose-700 h-full transition-all duration-500 rounded-r-full shadow-[0_0_6px_rgba(244,63,94,0.5)]"
                    />
                  </>
                )}
              </div>
              <span className="text-[10px] text-zinc-400 font-mono whitespace-nowrap">
                {totalVotes === 0 ? (
                  <span className="text-zinc-600">0 strikes</span>
                ) : (
                  <>
                    <span className="text-emerald-400 font-bold">+{brand.totalBoosts}</span>
                    <span className="text-zinc-600 mx-1">/</span>
                    <span className="text-rose-400 font-bold">-{brand.totalSabotages}</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Score & Quick Action Buttons */}
        <div className="flex items-center justify-between lg:justify-end gap-3 sm:gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-zinc-800/80">
          {/* Total Warchest Score */}
          <div className="text-left lg:text-right flex-shrink-0">
            <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">
              WARCHEST
            </div>
            <div
              className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
                brand.totalScore < 0
                  ? "text-rose-400 glow-red"
                  : brand.totalScore > 0
                    ? glowColor
                    : "text-zinc-400"
              }`}
            >
              {brand.totalScore < 0
                ? `-$${Math.abs(brand.totalScore)}`
                : `$${brand.totalScore}`}
            </div>
            <div className="text-[10px] text-zinc-600 font-mono">
              {brand.clicks || 0} hits
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Boost Button */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenOrder(brand, "BOOST");
              }}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-950/60 to-emerald-900/40 hover:from-emerald-500 hover:to-emerald-400 hover:text-black border border-emerald-500/50 text-emerald-400 text-xs font-mono font-bold uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.2)] active:scale-95"
              title="Tip to push this brand UP and pin your slogan"
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>BOOST</span> <span className="font-mono text-[11px]">(+$1)</span>
            </button>

            {/* Sabotage / Roast Button */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenOrder(brand, "SABOTAGE");
              }}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-rose-950/60 to-rose-900/40 hover:from-rose-600 hover:to-rose-500 hover:text-white border border-rose-500/50 text-rose-400 text-xs font-mono font-bold uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.2)] active:scale-95"
              title="Pay to drag this brand DOWN and post a roast"
            >
              <Skull className="w-3.5 h-3.5" />
              <span>ROAST</span> <span className="font-mono text-[11px]">(-$1)</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Comments / Threaded Notes Bar */}
      <Link href={`/chain/${brand.id}`} onClick={() => sound.playClick()}>
        <div className="px-4 sm:px-5 py-2.5 border-t border-zinc-900/90 bg-black/40 hover:bg-zinc-900/60 transition-colors flex items-center justify-between text-xs font-mono cursor-pointer group/link">
          <div className="flex items-center gap-2 text-zinc-400 group-hover/link:text-amber-300 transition-colors">
            <MessageSquare className="w-3.5 h-3.5 text-zinc-500 group-hover/link:text-amber-400 transition-colors" />
            <span className="font-bold">
              View Roast Log &amp; Threaded Replies ({comments.length})
            </span>
            <span className="text-zinc-600 group-hover/link:text-amber-400 group-hover/link:translate-x-0.5 transition-all">
              &rarr;
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
            <span className="text-emerald-400 font-bold">
              +{brand.totalBoosts} boosts
            </span>
            <span>•</span>
            <span className="text-rose-400 font-bold">
              -{brand.totalSabotages} roasts
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};
