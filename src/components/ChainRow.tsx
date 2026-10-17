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
  onSelectMobile,
}) => {
  const visual = getBrandVisual(brand.id, brand.category);
  const totalVotes = brand.totalBoosts + brand.totalSabotages;
  const isNoActivity = totalVotes === 0 && brand.totalScore === 0;
  const isUnderAttack = totalVotes > 0 && brand.totalSabotages > brand.totalBoosts;

  return (
    <div className="group bg-[#FFFFFF] border border-[#E2E4DC] hover:border-[#CBD2C4] hover:bg-[#FAFBF9] rounded-lg p-3 sm:px-4 sm:py-3.5 transition-all flex items-center justify-between gap-3 shadow-2xs">
      {/* Left: Rank, Visual Emoji, Chain Name & State Badge */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        {/* Rank Number */}
        <div className="w-6 sm:w-8 font-receipt text-sm sm:text-base font-bold text-[#5A6878] text-right flex-shrink-0">
          {rank}
        </div>

        {/* Visual Emoji Badge */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-[#F6F7F3] border border-[#E2E4DC] flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
          {visual.emoji}
        </div>

        {/* Chain Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/chain/${brand.id}`}
              className="font-bold text-sm sm:text-base text-[#1E2A3A] hover:text-[#167A75] hover:underline truncate"
            >
              {brand.name}
            </Link>

            {/* State Tags (Real data only per Section 5.3) */}
            {isNoActivity ? (
              <span className="text-[11px] text-[#7A8898] italic hidden md:inline">
                Be the first to back {brand.name}
              </span>
            ) : isUnderAttack ? (
              <span className="text-[10px] font-bold text-[#B82E22] bg-[#B82E22]/10 border border-[#B82E22]/30 px-1.5 py-0.5 rounded">
                Under attack
              </span>
            ) : null}

            {isTied && (
              <span className="text-[10px] font-medium text-[#5A6878] bg-[#EEF0EA] px-1.5 py-0.5 rounded">
                Tied
              </span>
            )}
          </div>

          {/* Subtext: Category, Top Backer Message & Thread link */}
          <div className="text-xs text-[#5A6878] truncate mt-0.5 flex items-center gap-2">
            <span className="uppercase text-[10px] tracking-wider font-medium text-[#7A8898]">
              {brand.category}
            </span>
            {brand.currentSlogan &&
              brand.currentSlogan !== "Waiting for inaugural claim..." && (
                <>
                  <span>•</span>
                  <span className="italic truncate text-[#1E2A3A]">
                    &quot;{brand.currentSlogan}&quot;
                  </span>
                </>
              )}
            <span>•</span>
            <Link
              href={`/chain/${brand.id}`}
              className="text-[11px] text-[#167A75] hover:underline flex items-center gap-1 font-medium flex-shrink-0"
              title={`View ${brand.name} thread & receipts`}
            >
              <MessageSquare className="w-3 h-3 text-[#167A75]" />
              <span>Thread</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Right: Single Score Number & Boost / Sabotage Action Buttons */}
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        {/* Score (Single number per row per review F3) */}
        <div className="text-right min-w-[40px] sm:min-w-[50px]">
          <div className="font-receipt text-base sm:text-lg font-bold text-[#1E2A3A]">
            {brand.totalScore}
          </div>
          <div className="text-[10px] text-[#7A8898] uppercase tracking-wider font-medium">
            {brand.totalScore === 1 || brand.totalScore === -1 ? "pt" : "pts"}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Boost Button */}
          <button
            onClick={() => onOpenOrder(brand, "BOOST")}
            className="px-2.5 sm:px-3 py-1.5 rounded-md bg-[#3B7A1F] hover:bg-[#2F6318] text-white text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-2xs"
            title={`Boost ${brand.name} for $1`}
          >
            <span>▲</span>
            <span className="hidden sm:inline">Boost</span>
            <span>$1</span>
          </button>

          {/* Sabotage Button */}
          <button
            onClick={() => onOpenOrder(brand, "SABOTAGE")}
            className="px-2.5 sm:px-3 py-1.5 rounded-md bg-[#B82E22] hover:bg-[#99251B] text-white text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-2xs"
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
