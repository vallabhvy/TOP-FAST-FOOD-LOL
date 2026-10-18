"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { FastFoodBrand, ActionType } from "@/types";
import { getBrandVisual } from "@/lib/brandMeta";

interface ChainRowProps {
  brand: FastFoodBrand;
  rank: number;
  isTied?: boolean;
  onOpenOrder: (brand: FastFoodBrand, action: ActionType) => void;
  onSelectMobile?: (brand: FastFoodBrand) => void;
}

export const ChainRow: React.FC<ChainRowProps> = ({
  brand,
  rank,
  isTied = false,
  onOpenOrder,
}) => {
  const visual = getBrandVisual(brand.id, brand.category);
  const totalVotes = brand.totalBoosts + brand.totalSabotages;
  const isNoActivity = totalVotes === 0 && brand.totalScore === 0;
  const isUnderAttack = totalVotes > 0 && brand.totalSabotages > brand.totalBoosts;

  return (
    <div className="group bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] hover:border-white/20 hover:bg-slate-800/70 rounded-xl p-3 sm:px-4 sm:py-3.5 transition-all duration-200 flex items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-0.5">
      {/* Left: Rank, Visual Emoji, Chain Name & State Badge */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        {/* Rank Number */}
        <div
          className={`w-6 sm:w-8 font-receipt text-sm sm:text-base font-bold text-right flex-shrink-0 ${
            rank === 1 ? "text-amber-400 font-black" : "text-slate-400"
          }`}
        >
          {rank}
        </div>

        {/* Visual Emoji Badge */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-lg sm:text-xl flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
          {visual.emoji}
        </div>

        {/* Chain Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/chain/${brand.id}`}
              className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors truncate"
            >
              {brand.name}
            </Link>

            {/* State Tags */}
            {isNoActivity ? (
              <span className="text-[11px] text-slate-400 italic hidden md:inline">
                Be the first to back {brand.name}
              </span>
            ) : isUnderAttack ? (
              <span className="text-[10px] font-bold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.2)]">
                Under attack
              </span>
            ) : null}

            {isTied && (
              <span className="text-[10px] font-medium text-slate-300 bg-white/10 border border-white/10 px-2 py-0.5 rounded-full">
                Tied
              </span>
            )}
          </div>

          {/* Subtext: Category, Top Backer Message & Thread link */}
          <div className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-2">
            <span className="uppercase text-[10px] tracking-wider font-semibold text-slate-400">
              {brand.category}
            </span>
            {brand.currentSlogan &&
              brand.currentSlogan !== "Waiting for inaugural claim..." && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="italic truncate text-slate-300">
                    &quot;{brand.currentSlogan}&quot;
                  </span>
                </>
              )}
            <span className="text-slate-600">•</span>
            <Link
              href={`/chain/${brand.id}`}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-semibold flex-shrink-0"
              title={`View ${brand.name} thread & receipts`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Thread</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Right: Single Score Number & Boost / Sabotage Action Buttons */}
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        {/* Score */}
        <div className="text-right min-w-[40px] sm:min-w-[50px]">
          <div className="font-receipt text-base sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
            {brand.totalScore}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
            {brand.totalScore === 1 || brand.totalScore === -1 ? "pt" : "pts"}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Boost Button */}
          <button
            onClick={() => onOpenOrder(brand, "BOOST")}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
            title={`Boost ${brand.name} for $1`}
          >
            <span>▲</span>
            <span className="hidden sm:inline">Boost</span>
            <span>$1</span>
          </button>

          {/* Sabotage Button */}
          <button
            onClick={() => onOpenOrder(brand, "SABOTAGE")}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_20px_rgba(244,63,94,0.5)]"
            title={`Sabotage ${brand.name} for $1`}
          >
            <span>▼</span>
            <span className="hidden sm:inline">Sabotage</span>
            <span>$1</span>
          </button>
        </div>
      </div>
    </div>
  );
};
