"use client";

import React from "react";
import { FastFoodBrand, ActionType } from "@/types";
import { Crown, Flame, Skull, Trophy, Sparkles, ChevronRight } from "lucide-react";
import { getBrandVisual } from "@/lib/brandMeta";
import { sound } from "@/lib/sound";

interface PodiumShowcaseProps {
  brands: FastFoodBrand[];
  onOpenOrder: (brand: FastFoodBrand, action: ActionType) => void;
  onBrandClick: (brandId: string) => void;
}

export const PodiumShowcase: React.FC<PodiumShowcaseProps> = ({
  brands,
  onOpenOrder,
  onBrandClick,
}) => {
  if (brands.length < 3) return null;

  const first = brands[0];
  const second = brands[1];
  const third = brands[2];

  const firstVisual = getBrandVisual(first.id, first.category);
  const secondVisual = getBrandVisual(second.id, second.category);
  const thirdVisual = getBrandVisual(third.id, third.category);

  return (
    <section className="w-full mb-8 relative">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none rounded-2xl" />
      
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-lg font-mono font-extrabold tracking-tight text-white uppercase flex items-center gap-2">
              PODIUM OF GLORY
              <span className="text-[10px] font-normal text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10">
                TOP 3 TITANS
              </span>
            </h2>
            <p className="text-[10px] sm:text-xs text-zinc-400 font-mono">
              The highest ranked fast food chains holding the crown.
            </p>
          </div>
        </div>
      </div>

      {/* 3-Column Podium Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-end">
        {/* --- SECOND PLACE (#2 SILVER) --- */}
        <div className="order-2 md:order-1 relative rounded-xl border border-zinc-700/80 bg-gradient-to-b from-zinc-900/90 via-zinc-950/90 to-zinc-950 p-4 flex flex-col justify-between transition-all duration-300 hover:border-zinc-500 hover:shadow-[0_0_25px_rgba(161,161,170,0.15)] group">
          {/* Rank Badge */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800/90 border border-zinc-600 text-zinc-200 font-mono font-bold text-xs shadow-sm">
              <span className="text-zinc-400">#2</span>
              <span>SILVER</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase px-2 py-0.5 rounded border border-zinc-800 bg-black/40">
              {second.category}
            </span>
          </div>

          {/* Brand Info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform flex-shrink-0">
              {secondVisual.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <h3
                onClick={() => {
                  sound.playClick();
                  onBrandClick(second.id);
                }}
                className="font-mono font-bold text-base sm:text-lg text-white hover:text-zinc-200 cursor-pointer truncate hover:underline"
              >
                {second.name}
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Score: <span className="text-white font-bold">{second.totalScore > 0 ? `+${second.totalScore}` : second.totalScore}</span> pts
              </p>
            </div>
          </div>

          {/* Slogan Note */}
          <div className="bg-black/50 border border-zinc-800/80 rounded-lg p-2.5 mb-3 min-h-[50px] flex flex-col justify-center">
            <p className="text-xs italic text-zinc-300 truncate">
              &quot;{second.currentSlogan}&quot;
            </p>
            <span className="text-[10px] text-zinc-500 mt-0.5 truncate">
              — {second.sloganAuthor}
            </span>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800/60">
            <button
              onClick={() => onOpenOrder(second, "BOOST")}
              className="py-1.5 px-2 rounded-lg bg-emerald-950/40 border border-emerald-600/40 hover:bg-emerald-600 hover:text-black text-emerald-400 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5" /> +$1 BOOST
            </button>
            <button
              onClick={() => onOpenOrder(second, "SABOTAGE")}
              className="py-1.5 px-2 rounded-lg bg-rose-950/40 border border-rose-600/40 hover:bg-rose-600 hover:text-white text-rose-400 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
            >
              <Skull className="w-3.5 h-3.5" /> -$1 ROAST
            </button>
          </div>
        </div>

        {/* --- FIRST PLACE (#1 GOLD CHAMPION - ELEVATED) --- */}
        <div className="order-1 md:order-2 relative rounded-2xl border-2 border-amber-400/90 bg-gradient-to-b from-amber-950/40 via-zinc-950/95 to-zinc-950 p-5 md:-translate-y-2 flex flex-col justify-between shadow-[0_0_35px_rgba(245,158,11,0.25)] transition-all duration-300 hover:shadow-[0_0_45px_rgba(245,158,11,0.35)] group">
          {/* Crown & Shimmer Accent */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-mono font-black text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-bounce">
            <Crown className="w-4 h-4 fill-black" />
            <span>REIGNING CHAMPION</span>
          </div>

          {/* Top Row: Rank & Category */}
          <div className="flex items-center justify-between mb-3 mt-1">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/20 border border-amber-400 text-amber-300 font-mono font-bold text-xs shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: "6s" }} />
              <span>#1 GOLD CROWN</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 uppercase px-2 py-0.5 rounded border border-amber-500/40 bg-amber-950/30">
              {first.category}
            </span>
          </div>

          {/* Brand Info */}
          <div className="flex items-center gap-3.5 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-yellow-500/10 border-2 border-amber-400/80 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform flex-shrink-0">
              {firstVisual.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <h3
                onClick={() => {
                  sound.playClick();
                  onBrandClick(first.id);
                }}
                className="font-mono font-extrabold text-lg sm:text-xl text-amber-200 hover:text-white cursor-pointer truncate hover:underline"
              >
                {first.name}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 font-mono">
                Crown Score: <span className="text-amber-300 font-black text-base">{first.totalScore > 0 ? `+${first.totalScore}` : first.totalScore}</span> pts
              </p>
            </div>
          </div>

          {/* Slogan Note */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 mb-3.5 min-h-[55px] flex flex-col justify-center">
            <p className="text-xs sm:text-sm italic text-amber-100 font-mono truncate">
              &quot;{first.currentSlogan}&quot;
            </p>
            <span className="text-[11px] text-amber-400/80 mt-0.5 truncate font-mono">
              — {first.sloganAuthor}
            </span>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-amber-500/20">
            <button
              onClick={() => onOpenOrder(first, "BOOST")}
              className="py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-black font-mono text-xs font-black shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-black" /> DEFEND TITLE
            </button>
            <button
              onClick={() => onOpenOrder(first, "SABOTAGE")}
              className="py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-mono text-xs font-black shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Skull className="w-4 h-4" /> DETHRONE
            </button>
          </div>
        </div>

        {/* --- THIRD PLACE (#3 BRONZE) --- */}
        <div className="order-3 relative rounded-xl border border-amber-900/60 bg-gradient-to-b from-zinc-900/90 via-zinc-950/90 to-zinc-950 p-4 flex flex-col justify-between transition-all duration-300 hover:border-amber-700/80 hover:shadow-[0_0_25px_rgba(180,83,9,0.15)] group">
          {/* Rank Badge */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/40 border border-amber-800 text-amber-400 font-mono font-bold text-xs shadow-sm">
              <span className="text-amber-600">#3</span>
              <span>BRONZE</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase px-2 py-0.5 rounded border border-zinc-800 bg-black/40">
              {third.category}
            </span>
          </div>

          {/* Brand Info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-amber-900/50 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform flex-shrink-0">
              {thirdVisual.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <h3
                onClick={() => {
                  sound.playClick();
                  onBrandClick(third.id);
                }}
                className="font-mono font-bold text-base sm:text-lg text-white hover:text-amber-200 cursor-pointer truncate hover:underline"
              >
                {third.name}
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Score: <span className="text-white font-bold">{third.totalScore > 0 ? `+${third.totalScore}` : third.totalScore}</span> pts
              </p>
            </div>
          </div>

          {/* Slogan Note */}
          <div className="bg-black/50 border border-zinc-800/80 rounded-lg p-2.5 mb-3 min-h-[50px] flex flex-col justify-center">
            <p className="text-xs italic text-zinc-300 truncate">
              &quot;{third.currentSlogan}&quot;
            </p>
            <span className="text-[10px] text-zinc-500 mt-0.5 truncate">
              — {third.sloganAuthor}
            </span>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800/60">
            <button
              onClick={() => onOpenOrder(third, "BOOST")}
              className="py-1.5 px-2 rounded-lg bg-emerald-950/40 border border-emerald-600/40 hover:bg-emerald-600 hover:text-black text-emerald-400 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5" /> +$1 BOOST
            </button>
            <button
              onClick={() => onOpenOrder(third, "SABOTAGE")}
              className="py-1.5 px-2 rounded-lg bg-rose-950/40 border border-rose-600/40 hover:bg-rose-600 hover:text-white text-rose-400 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
            >
              <Skull className="w-3.5 h-3.5" /> -$1 ROAST
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
