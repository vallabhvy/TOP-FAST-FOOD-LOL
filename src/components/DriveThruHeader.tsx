"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Volume2, VolumeX } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sound } from "@/lib/sound";
import { Logo } from "@/components/Logo";

interface HeaderProps {
  // Props kept for compatibility
  theme?: string;
  recentTransactions?: any[];
  setTheme?: (t: any) => void;
  totalWarchest?: number;
}

export const DriveThruHeader: React.FC<HeaderProps> = () => {
  const [user, setUser] = useState<any>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user || null);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const handleTwitterLogin = async () => {
    if (!supabase) return;
    const redirectUrl =
      typeof window !== "undefined"
        ? window.location.origin + window.location.pathname
        : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "x" as any,
      options: {
        redirectTo: redirectUrl,
      },
    });
    if (error) {
      await supabase.auth.signInWithOAuth({
        provider: "twitter",
        options: {
          redirectTo: redirectUrl,
        },
      });
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      sound.playClick();
    }
  };

  return (
    <header className="border-b border-white/[0.08] bg-[#0A0E1A]/75 backdrop-blur-xl sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          title="topfastfood.lol"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg blur-xs opacity-50 group-hover:opacity-100 transition duration-300"></div>
            <Logo className="relative w-8 h-8 rounded-lg shadow-md" size={32} />
          </div>
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
            topfastfood<span className="text-cyan-400">.lol</span>
          </span>
        </Link>

        {/* Navigation & User Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title={soundEnabled ? "Mute audio" : "Enable 8-bit sound"}
            aria-label={soundEnabled ? "Mute audio" : "Enable audio"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* How it works */}
          <Link
            href="/about"
            className="px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            How it works
          </Link>

          {/* Log in / User */}
          {user ? (
            <button
              onClick={handleLogout}
              title="Sign out"
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.06] hover:bg-rose-500/20 hover:border-rose-500/40 text-slate-200 hover:text-rose-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              @
              {user.user_metadata?.user_name ||
                user.user_metadata?.preferred_username ||
                "user"}
            </button>
          ) : (
            <button
              onClick={handleTwitterLogin}
              className="px-3.5 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              <span>Log in</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
