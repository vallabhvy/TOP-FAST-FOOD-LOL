"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Volume2, VolumeX, Scale, ShieldCheck, FileText } from "lucide-react";
import { CRTColorTheme, Transaction } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sound } from "@/lib/sound";

interface HeaderProps {
  theme: CRTColorTheme;
  recentTransactions?: Transaction[];
  setTheme?: (t: CRTColorTheme) => void;
  totalWarchest?: number;
}

export const DriveThruHeader: React.FC<HeaderProps> = ({
  theme,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user || null);
      });
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });
      return () => subscription.unsubscribe();
    }
  }, []);



  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
    if (!nextMuted) {
      sound.playDriveThruChime();
    }
  };

  const handleTwitterLogin = async () => {
    sound.playClick();
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "x" as any,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.warn("Fallback to legacy twitter provider:", error);
      await supabase.auth.signInWithOAuth({
        provider: "twitter",
        options: {
          redirectTo: window.location.origin,
        },
      });
    }
  };

  const handleLogout = async () => {
    sound.playClick();
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const isGreen = theme === "green";
  const glowClass = isGreen
    ? "glow-green text-[#39ff14]"
    : "glow-amber text-[#ffb000]";
  const borderClass = isGreen ? "border-[#39ff14]/30" : "border-[#ffb000]/30";



  return (
    <header
      className={`border-b ${borderClass} bg-black/80 backdrop-blur-md sticky top-0 z-30`}
    >
      {/* Main Branding Banner */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">
        {/* Brand Bar & Quick Controls */}
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {/* Logo, Heading, and Action Buttons in a continuous row */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Logo + Title LOCKED horizontally side-by-side */}
            <Link
              href="/"
              onClick={() => sound.playClick()}
              className="flex items-center gap-2 sm:gap-3 shrink-0 group"
              title="TOPFASTFOOD.LOL - Home"
            >
              <img
                src="/logo.jpg"
                alt="TOPFASTFOOD.LOL Logo"
                className="w-8 h-8 sm:w-11 sm:h-11 md:w-14 md:h-14 object-contain rounded border border-zinc-800 shrink-0 group-hover:border-zinc-700 transition-all"
              />
              <h1
                className={`text-base sm:text-2xl md:text-4xl font-extrabold tracking-tighter uppercase font-mono whitespace-nowrap ${glowClass}`}
              >
                TOPFASTFOOD<span className="text-white">.LOL</span>
              </h1>
            </Link>

            {/* Quick Action Buttons placed right next to the heading */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Music / Audio SFX Toggle */}
              <button
                onClick={toggleMute}
                className="p-1 sm:p-2 rounded border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center active:scale-95"
                title={isMuted ? "Unmute Sound" : "Mute Sound"}
                aria-label={isMuted ? "Unmute sound" : "Mute sound"}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-400" />
                )}
              </button>

              {/* Login / User Info Button */}
              {user ? (
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="px-2 py-1 sm:p-2 rounded border border-sky-900/50 bg-sky-950/30 text-sky-400 hover:text-white hover:bg-rose-950/30 hover:border-rose-900/50 transition-all cursor-pointer flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold truncate max-w-[100px] sm:max-w-none"
                >
                  @
                  {user.user_metadata?.user_name ||
                    user.user_metadata?.preferred_username ||
                    "user"}
                </button>
              ) : (
                <button
                  onClick={handleTwitterLogin}
                  className="px-2 py-1 sm:p-2 rounded border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-sky-400 transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-mono group"
                >
                  <svg
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current group-hover:text-sky-400 text-zinc-500"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  <span>LOGIN</span>
                </button>
              )}

              {/* About Page Link */}
              <Link
                href="/about"
                onClick={() => sound.playClick()}
                className="px-1.5 py-1 sm:px-2.5 sm:py-2 rounded border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 transition-all cursor-pointer flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold"
                title="What is this site? About TOPFASTFOOD.LOL"
              >
                ABOUT [?]
              </Link>
            </div>
          </div>

          <p className="text-[10px] sm:text-xs text-zinc-400 font-mono">
            <span className="text-[#39ff14] font-bold">+$1 to Boost</span> or{" "}
            <span className="text-[#ff3344] font-bold">-$1 to Sabotage</span>.
          </p>
        </div>

        {/* Legal Policies Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 self-start md:self-center">
          <Link
            href="/disclaimer"
            onClick={() => sound.playClick()}
            className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 hover:border-emerald-500/50 text-zinc-400 hover:text-emerald-400 transition-all font-mono text-[10px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
            title="Legal Disclaimers & Safe Harbor"
          >
            <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-500" />
            <span>DISCLAIMER</span>
          </Link>

          <Link
            href="/terms"
            onClick={() => sound.playClick()}
            className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 hover:border-emerald-500/50 text-zinc-400 hover:text-emerald-400 transition-all font-mono text-[10px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
            title="Terms & Conditions"
          >
            <Scale className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-500" />
            <span>TERMS</span>
          </Link>

          <Link
            href="/privacy"
            onClick={() => sound.playClick()}
            className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 hover:border-emerald-500/50 text-zinc-400 hover:text-emerald-400 transition-all font-mono text-[10px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
            title="Privacy Policy"
          >
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-500" />
            <span>PRIVACY</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
