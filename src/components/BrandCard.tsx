"use client";

import React, { useState } from "react";
import { Flame, Skull, Crown, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { FastFoodBrand, ActionType, Transaction, CRTColorTheme } from "@/types";
import { sound } from "@/lib/sound";
import { UserAvatar } from "@/components/UserAvatar";

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
  onReceiptClick,
  theme,
}) => {
  const [showComments, setShowComments] = useState(false);

  const isGreen = theme === "green";
  const glowColor = isGreen
    ? "text-[#39ff14] glow-green"
    : "text-[#ffb000] glow-amber";
  const isTop1 = rank === 1;
  const isTop3 = rank <= 3;

  const totalVotes = brand.totalBoosts + brand.totalSabotages;
  const boostRatio =
    totalVotes > 0 ? (brand.totalBoosts / totalVotes) * 100 : 50;

  return (
    <div
      className={`group relative bg-zinc-950/80 border transition-all duration-200 rounded-lg flex flex-col overflow-hidden ${
        isTop1
          ? "border-amber-400/70 bg-gradient-to-r from-amber-950/20 via-zinc-950/80 to-zinc-950/80 shadow-[0_0_20px_rgba(251,191,36,0.15)]"
          : isTop3
            ? "border-zinc-700/80 hover:border-zinc-500"
            : "border-zinc-800/80 hover:border-zinc-700"
      }`}
    >
      {/* Top Main Row: Rank, Brand Info, Warchest & Action Buttons */}
      <div className="p-3.5 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Rank & Brand Info */}
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
          {/* Rank Badge */}
          <div
            className={`flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center font-bold text-base sm:text-lg border font-mono ${
              isTop1
                ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                : rank === 2
                  ? "bg-zinc-800/80 border-zinc-500 text-zinc-200"
                  : rank === 3
                    ? "bg-amber-900/30 border-amber-700 text-amber-500"
                    : "bg-zinc-900 border-zinc-800 text-zinc-500"
            }`}
          >
            {isTop1 ? <Crown className="w-5 h-5 text-amber-300" /> : `#${rank}`}
          </div>

          {/* Brand Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2
                onClick={() => {
                  sound.playClick();
                  onBrandClick(brand.id);
                }}
                className="text-base sm:text-xl font-bold uppercase tracking-tight text-white hover:underline cursor-pointer flex items-center gap-1.5"
              >
                {brand.name}
              </h2>
              <span className="text-[10px] text-zinc-500 uppercase px-2 py-0.5 border border-zinc-800 rounded bg-black/40">
                {brand.category}
              </span>
            </div>

            {/* Current Slogan (The Latest Pinned Note) */}
            <div className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm font-mono truncate">
              <span className="text-zinc-400 italic truncate">
                &quot;{brand.currentSlogan}&quot;
              </span>
              <span className="text-zinc-600 text-[11px] flex-shrink-0 flex items-center gap-1">
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
                  <span className="text-[10px] text-zinc-500 font-mono">
                    [{brand.location}]
                  </span>
                )}
              </span>
            </div>

            {/* Mini Sentiment Ratio Bar */}
            <div className="mt-2.5 flex items-center gap-2 max-w-xs">
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${boostRatio}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`${boostRatio.toFixed(0)}% Boosts`}
                />
                <div
                  style={{ width: `${100 - boostRatio}%` }}
                  className="bg-rose-500 h-full transition-all duration-500"
                  title={`${(100 - boostRatio).toFixed(0)}% Sabotages`}
                />
              </div>
              <span className="text-[10px] text-zinc-500 font-mono whitespace-nowrap">
                {brand.totalBoosts} 🌶️ / {brand.totalSabotages} ☠️
              </span>
            </div>
          </div>
        </div>

        {/* Right: Score & Quick Action Buttons */}
        <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-800/80">
          {/* Total Warchest Score */}
          <div className="text-left md:text-right">
            <div className="text-[10px] sm:text-xs text-zinc-500 uppercase font-mono tracking-wider">
              WARCHEST
            </div>
            <div
              className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
                brand.totalScore < 0 ? "text-rose-400" : glowColor
              }`}
            >
              {brand.totalScore < 0
                ? `-$${Math.abs(brand.totalScore)}`
                : `$${brand.totalScore}`}
            </div>
            <div className="text-[10px] text-zinc-600 font-mono">
              {brand.clicks} drive-thru hits
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Boost Button */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenOrder(brand, "BOOST");
              }}
              className="px-3 py-2 bg-emerald-950/40 hover:bg-emerald-600 hover:text-black border border-emerald-500/60 text-emerald-400 text-xs font-bold uppercase rounded transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.15)] active:scale-95"
              title="Tip to push this brand UP and pin your slogan"
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">BOOST</span> (+$1)
            </button>

            {/* Sabotage / Poison Button */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenOrder(brand, "SABOTAGE");
              }}
              className="px-3 py-2 bg-rose-950/40 hover:bg-rose-600 hover:text-white border border-rose-500/60 text-rose-400 text-xs font-bold uppercase rounded transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(244,63,94,0.15)] active:scale-95"
              title="Pay to drag this brand DOWN and post a roast"
            >
              <Skull className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SABOTAGE</span> (-$1)
            </button>
          </div>
        </div>
      </div>

      {/* View / Unview Comments Toggle Bar */}
      <div className="px-3.5 sm:px-5 py-2 border-t border-zinc-900 bg-black/40 flex items-center justify-between text-xs font-mono">
        <button
          onClick={() => {
            sound.playClick();
            setShowComments(!showComments);
          }}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer group/btn"
        >
          <MessageSquare className="w-3.5 h-3.5 text-zinc-500 group-hover/btn:text-amber-400 transition-colors" />
          <span className="font-bold">
            {showComments ? "Hide Comments" : `View Comments (${comments.length})`}
          </span>
          <span className="text-zinc-500 group-hover/btn:text-zinc-300 flex items-center">
            {showComments ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </span>
        </button>

        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
          <span className="text-emerald-400/90 font-bold">
            +{brand.totalBoosts}
          </span>
          <span>/</span>
          <span className="text-rose-400/90 font-bold">
            -{brand.totalSabotages}
          </span>
        </div>
      </div>

      {/* Comments List (When Expanded / Visible) */}
      {showComments && (
        <div className="border-t border-zinc-900 bg-black/60 p-3 sm:p-4 space-y-2">
          {comments.length > 0 ? (
            <div className="space-y-1.5 font-mono text-xs">
              {comments.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-zinc-900/60 border border-zinc-800/70 rounded p-2 sm:p-2.5 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Author Avatar + Handle */}
                      {tx.author.startsWith("@") &&
                      tx.author !== "@anon_driver" ? (
                        <a
                          href={`https://x.com/${tx.author.replace(/^@/, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-200 hover:text-sky-400 font-bold flex items-center gap-1 hover:underline text-xs"
                        >
                          <UserAvatar handle={tx.author} size="xs" />
                          <span>{tx.author}</span>
                        </a>
                      ) : (
                        <span className="text-zinc-300 font-bold text-xs">
                          {tx.author}
                        </span>
                      )}

                      {/* Action Type Badge */}
                      {tx.actionType === "BOOST" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 font-bold">
                          <Flame className="w-2.5 h-2.5 fill-current" />
                          +${tx.amount} BOOST
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-rose-950/70 text-rose-400 border border-rose-800/60 font-bold">
                          <Skull className="w-2.5 h-2.5" />
                          -${tx.amount} SABOTAGE
                        </span>
                      )}

                      {/* Location Origin Tag */}
                      {tx.location && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          [{tx.location}]
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                      <span>{tx.timestamp}</span>

                      {/* Thermal Receipt Button */}
                      <button
                        onClick={() => {
                          sound.playCashRegister();
                          onReceiptClick?.(tx);
                        }}
                        className="hover:text-amber-400 hover:underline flex items-center gap-1 text-zinc-400 cursor-pointer"
                        title="View drive-thru thermal receipt"
                      >
                        <span>{tx.receiptNumber}</span>
                      </button>
                    </div>
                  </div>

                  {/* Roast Message Body */}
                  <p className="text-zinc-200 text-xs pl-0.5 break-words">
                    &quot;{tx.message}&quot;
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-xs font-mono py-2 text-center">
              No comments yet for {brand.name}.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
