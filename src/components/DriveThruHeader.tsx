"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Flame, Skull } from "lucide-react";
import { CRTColorTheme, Transaction } from "@/types";
import { sound } from "@/lib/sound";

interface HeaderProps {
  theme: CRTColorTheme;
  recentTransactions: Transaction[];
  setTheme?: (t: CRTColorTheme) => void;
  totalWarchest?: number;
}

export const DriveThruHeader: React.FC<HeaderProps> = ({
  theme,
  recentTransactions,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [activeTxIndex, setActiveTxIndex] = useState(0);

  useEffect(() => {
    if (recentTransactions.length <= 1) return;
    const tickerInterval = setInterval(() => {
      setActiveTxIndex((prev) => (prev + 1) % recentTransactions.length);
    }, 4500);
    return () => clearInterval(tickerInterval);
  }, [recentTransactions.length]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
    if (!nextMuted) {
      sound.playDriveThruChime();
    }
  };

  const isGreen = theme === "green";
  const glowClass = isGreen
    ? "glow-green text-[#39ff14]"
    : "glow-amber text-[#ffb000]";
  const borderClass = isGreen ? "border-[#39ff14]/30" : "border-[#ffb000]/30";

  const currentTx = recentTransactions[activeTxIndex] || recentTransactions[0];

  return (
    <header
      className={`border-b ${borderClass} bg-black/80 backdrop-blur-md sticky top-0 z-30`}
    >
      {/* Main Branding Banner */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1
              className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter uppercase font-mono ${glowClass}`}
            >
              TOPFASTFOOD<span className="text-white">.LOL</span>
            </h1>

            {/* Audio SFX Toggle Icon right next to the logo */}
            <button
              onClick={toggleMute}
              className="p-1.5 sm:p-2 rounded border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center active:scale-95"
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
              aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              )}
            </button>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 font-mono max-w-2xl">
            <span className="text-[#39ff14] font-bold">+$1 to Boost</span> a
            fast food chain or{" "}
            <span className="text-[#ff3344] font-bold">-$1 to Sabotage</span>{" "}
            it.
          </p>
        </div>

        {/* Live Intercom Order Feed Ticket */}
        {currentTx && (
          <div
            className={`bg-zinc-950/90 border ${
              currentTx.actionType === "BOOST"
                ? "border-emerald-500/40"
                : "border-rose-500/40"
            } p-3 rounded-lg max-w-md w-full shadow-lg relative overflow-hidden transition-all duration-300`}
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-bold flex items-center gap-1">
                {currentTx.actionType === "BOOST" ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-emerald-400" /> RECENT
                    BOOST (+${currentTx.amount})
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <Skull className="w-3.5 h-3.5" /> RECENT SABOTAGE (-$
                    {currentTx.amount})
                  </span>
                )}
              </span>
              <span className="text-zinc-500">{currentTx.receiptNumber}</span>
            </div>
            <p className="text-xs text-white font-mono truncate">
              <span className="font-bold text-amber-300">
                {currentTx.brandName}:
              </span>{" "}
              &quot;{currentTx.message}&quot;
            </p>
            <div className="text-[10px] text-zinc-500 mt-1 flex justify-between">
              <span className="truncate pr-2">
                By {currentTx.author}{" "}
                {currentTx.location ? `[${currentTx.location}]` : ""}
              </span>
              <span className="flex-shrink-0">{currentTx.timestamp}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
