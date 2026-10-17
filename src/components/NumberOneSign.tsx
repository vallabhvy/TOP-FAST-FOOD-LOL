"use client";

import React from "react";
import { FastFoodBrand, ActionType } from "@/types";
import { getBrandVisual } from "@/lib/brandMeta";

interface NumberOneSignProps {
  leader: FastFoodBrand | null;
  onOpenOrder: (brand: FastFoodBrand, action: ActionType) => void;
  onBrandClick: (brandId: string) => void;
}

export const NumberOneSign: React.FC<NumberOneSignProps> = ({
  leader,
  onOpenOrder,
  onBrandClick,
}) => {
  // If no leader or all chains are at 0 score with no votes
  const isZeroBoard =
    !leader || (leader.totalScore === 0 && leader.totalBoosts === 0 && leader.totalSabotages === 0);

  if (isZeroBoard || !leader) {
    return (
      <div className="w-full my-6 text-center">
        <div className="inline-block w-full max-w-lg mx-auto bg-[#FFB000] border-2 border-[#1E2A3A] rounded-xl p-5 shadow-[4px_4px_0px_#1E2A3A]">
          <div className="text-xs font-bold uppercase tracking-widest text-[#1E2A3A] mb-1">
            Leaderboard Status
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1E2A3A] tracking-tight uppercase">
            No champion yet
          </h2>
          <p className="text-sm font-medium text-[#1E2A3A] mt-1">
            The first $1 decides #1. Boost your favourite chain below to claim the crown.
          </p>
        </div>
      </div>
    );
  }

  const visual = getBrandVisual(leader.id, leader.category);
  const hasBacker =
    leader.sloganAuthor &&
    leader.sloganAuthor !== "Unclaimed" &&
    leader.currentSlogan &&
    leader.currentSlogan !== "Waiting for inaugural claim...";

  return (
    <div className="w-full my-6 text-center">
      <div className="inline-block w-full max-w-lg mx-auto bg-[#FFB000] border-2 border-[#1E2A3A] rounded-xl p-5 sm:p-6 shadow-[4px_4px_0px_#1E2A3A] transition-transform hover:-translate-y-0.5">
        {/* Marquee Header */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1E2A3A] bg-[#FFFFFF]/30 px-2.5 py-0.5 rounded-full border border-[#1E2A3A]/20">
            #1 Ranked
          </span>
          <span className="text-xs font-medium text-[#1E2A3A]/80 uppercase">
            {leader.category}
          </span>
        </div>

        {/* Chain Name & Visual */}
        <div
          onClick={() => onBrandClick(leader.id)}
          className="cursor-pointer group flex items-center justify-center gap-2.5 my-1"
        >
          <span className="text-3xl sm:text-4xl">{visual.emoji}</span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#1E2A3A] group-hover:underline">
            {leader.name}
          </h2>
        </div>

        {/* Score in Points */}
        <div className="font-receipt text-lg sm:text-xl font-bold text-[#1E2A3A] my-1">
          {leader.totalScore} {leader.totalScore === 1 ? "point" : "points"}
        </div>

        {/* Top Backer Note */}
        <div className="my-3 py-2 px-3 bg-[#FFFFFF]/40 rounded-lg border border-[#1E2A3A]/10 text-xs sm:text-sm text-[#1E2A3A]">
          {hasBacker ? (
            <div>
              <span className="italic font-medium">&quot;{leader.currentSlogan}&quot;</span>
              <span className="text-xs text-[#1E2A3A]/80 block sm:inline sm:ml-1 mt-0.5">
                — top backer {leader.sloganAuthor}
              </span>
            </div>
          ) : (
            <span className="italic text-[#1E2A3A]/80">
              No top backer yet. Boost to put your message here.
            </span>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={() => onOpenOrder(leader, "BOOST")}
            className="px-4 py-2 rounded-lg bg-[#3B7A1F] hover:bg-[#2F6318] text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>▲</span>
            <span>Boost $1</span>
          </button>
          <button
            onClick={() => onOpenOrder(leader, "SABOTAGE")}
            className="px-4 py-2 rounded-lg bg-[#B82E22] hover:bg-[#99251B] text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>▼</span>
            <span>Sabotage $1</span>
          </button>
        </div>
      </div>
    </div>
  );
};
