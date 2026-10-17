"use client";

import React from "react";
import { Transaction, FastFoodBrand } from "@/types";
import { Flame, Skull, Trophy, Zap, Radio } from "lucide-react";

interface LiveTickerProps {
  transactions?: Transaction[];
  leader?: FastFoodBrand;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({
  transactions = [],
  leader,
}) => {
  // Fallback broadcast items when there are no recent transactions in DB
  const defaultBroadcasts = [
    {
      id: "b-1",
      icon: <Flame className="w-3.5 h-3.5 text-amber-400 inline" />,
      text: "WAR OF THE FRIES IS LIVE: Boost your favorite chain or sabotage the grease puddle!",
      tag: "ARENA ACTIVE",
      color: "text-amber-300",
    },
    {
      id: "b-2",
      icon: <Trophy className="w-3.5 h-3.5 text-yellow-400 inline" />,
      text: leader
        ? `REIGNING CHAMPION: ${leader.name.toUpperCase()} holds the throne at score ${leader.totalScore}`
        : "THE THRONE IS EMPTY: Drop the inaugural $1 boost to claim #1 rank!",
      tag: "TITLE FIGHT",
      color: "text-yellow-300",
    },
    {
      id: "b-3",
      icon: <Zap className="w-3.5 h-3.5 text-emerald-400 inline" />,
      text: "INSTANT IMPACT: +$1 to Boost (+1 pt) or -$1 to Sabotage (-1 pt) with pinned custom roast!",
      tag: "HOW IT WORKS",
      color: "text-emerald-300",
    },
    {
      id: "b-4",
      icon: <Skull className="w-3.5 h-3.5 text-rose-400 inline" />,
      text: "HEAVY SABOTAGE DETECTED: Don't let your burger rival take the crown without a fight!",
      tag: "RIVALRY",
      color: "text-rose-400",
    },
  ];

  // If real transactions exist, format them into thrilling marquee items
  const tickerItems =
    transactions.length > 0
      ? transactions.slice(0, 10).map((tx) => ({
          id: tx.id,
          icon:
            tx.actionType === "BOOST" ? (
              <Flame className="w-3.5 h-3.5 text-emerald-400 inline animate-pulse" />
            ) : (
              <Skull className="w-3.5 h-3.5 text-rose-400 inline animate-pulse" />
            ),
          text: `${tx.author || "Anon"} dropped $${tx.amount} to ${
            tx.actionType === "BOOST" ? "BOOST" : "SABOTAGE"
          } ${tx.brandName}! "${tx.message || ""}"`,
          tag: tx.actionType === "BOOST" ? `+$${tx.amount}` : `-$${tx.amount}`,
          color: tx.actionType === "BOOST" ? "text-emerald-400" : "text-rose-400",
        }))
      : defaultBroadcasts;

  // Duplicate items for a seamless continuous CSS marquee scroll
  const marqueeItems = [...tickerItems, ...tickerItems];

  return (
    <div className="w-full bg-zinc-950/95 border-b border-zinc-800/80 backdrop-blur-md relative z-20 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto flex items-center h-9 sm:h-10 px-2 sm:px-4">
        {/* Live Badge Anchor */}
        <div className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 pr-3 border-r border-zinc-800 bg-zinc-950 z-10 shadow-[4px_0_12px_rgba(0,0,0,0.8)]">
          <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-rose-500"></span>
          </span>
          <span className="text-[10px] sm:text-xs font-mono font-extrabold uppercase tracking-widest text-zinc-300 flex items-center gap-1">
            <Radio className="w-3 h-3 text-rose-500 hidden sm:inline" />
            LIVE <span className="hidden xs:inline text-rose-500">WIRE</span>
          </span>
        </div>

        {/* Scrolling Marquee Container */}
        <div className="relative flex-1 overflow-hidden h-full flex items-center mask-marquee">
          <div className="flex items-center gap-6 sm:gap-8 whitespace-nowrap animate-marquee hover:[animation-play-state:paused] cursor-default">
            {marqueeItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="flex items-center gap-2 text-xs font-mono group"
              >
                <span className="flex items-center">{item.icon}</span>
                <span
                  className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900/90 ${item.color}`}
                >
                  {item.tag}
                </span>
                <span className="text-zinc-300 group-hover:text-white transition-colors text-[11px] sm:text-xs">
                  {item.text}
                </span>
                <span className="text-zinc-700 mx-2 select-none">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
