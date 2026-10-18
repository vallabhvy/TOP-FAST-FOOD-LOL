"use client";

import React from "react";
import { FastFoodBrand, ActionType } from "@/types";
import { getBrandVisual } from "@/lib/brandMeta";
import { Crown, Sparkles } from "lucide-react";

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
  const isZeroBoard =
    !leader || (leader.totalScore === 0 && leader.totalBoosts === 0 && leader.totalSabotages === 0);

  if (isZeroBoard || !leader) {
    return (
      <div className="w-full my-6 text-center">
        <div className="relative inline-block w-full max-w-lg mx-auto">
          {/* Radiant ambient glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-amber-600/30 rounded-2xl blur-xl opacity-60"></div>

          <div className="relative backdrop-blur-2xl bg-gradient-to-b from-amber-500/15 via-slate-900/80 to-slate-950/90 border border-amber-400/30 rounded-2xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Leaderboard Status</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 tracking-tight uppercase">
              No champion yet
            </h2>
            <p className="text-sm font-medium text-slate-300 mt-2 max-w-md mx-auto">
              The first $1 decides #1. Boost your favourite chain below to claim the crown.
            </p>
          </div>
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
      <div className="relative inline-block w-full max-w-lg mx-auto transition-transform hover:-translate-y-1 duration-300">
        {/* Radiant golden backdrop glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/40 via-yellow-400/30 to-amber-600/40 rounded-2xl blur-xl opacity-75"></div>

        <div className="relative backdrop-blur-2xl bg-gradient-to-b from-amber-500/20 via-slate-900/85 to-slate-950/95 border border-amber-400/40 rounded-2xl p-6 sm:p-7 shadow-[0_16px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.25)]">
          {/* Marquee Header */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-amber-950 bg-gradient-to-r from-amber-300 to-yellow-300 px-3 py-0.5 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.5)]">
              <Crown className="w-3.5 h-3.5 fill-current" />
              #1 Ranked
            </span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {leader.category}
            </span>
          </div>

          {/* Chain Name & Visual */}
          <div
            onClick={() => onBrandClick(leader.id)}
            className="cursor-pointer group flex items-center justify-center gap-3 my-2"
          >
            <span className="text-3xl sm:text-4xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
              {visual.emoji}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white group-hover:text-amber-300 transition-colors">
              {leader.name}
            </h2>
          </div>

          {/* Score in Points */}
          <div className="font-receipt text-lg sm:text-xl font-bold text-amber-400 my-1 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">
            {leader.totalScore} {leader.totalScore === 1 ? "point" : "points"}
          </div>

          {/* Top Backer Note */}
          <div className="my-3.5 py-2.5 px-3.5 bg-white/[0.05] backdrop-blur-md rounded-xl border border-white/10 text-xs sm:text-sm text-slate-200">
            {hasBacker ? (
              <div>
                <span className="italic font-medium text-amber-200">
                  &quot;{leader.currentSlogan}&quot;
                </span>
                <span className="text-xs text-slate-400 block sm:inline sm:ml-1 mt-0.5">
                  — top backer <span className="text-white font-bold">{leader.sloganAuthor}</span>
                </span>
              </div>
            ) : (
              <span className="italic text-slate-400">
                No top backer yet. Boost to put your message here.
              </span>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={() => onOpenOrder(leader, "BOOST")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>▲</span>
              <span>Boost $1</span>
            </button>
            <button
              onClick={() => onOpenOrder(leader, "SABOTAGE")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(244,63,94,0.35)] transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>▼</span>
              <span>Sabotage $1</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
