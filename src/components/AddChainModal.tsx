"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { CRTColorTheme } from "@/types";
import { sound } from "@/lib/sound";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { UserAvatar } from "@/components/UserAvatar";

interface AddChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: CRTColorTheme;
  currentUserHandle?: string;
}

const CATEGORIES = [
  "Burgers",
  "Chicken",
  "Mexican",
  "Pizza",
  "Sandwiches",
  "Late Night",
  "Desserts",
  "Coffee",
];

const ACCENT_COLORS = [
  { name: "Golden Amber", hex: "#f59e0b" },
  { name: "Crimson Red", hex: "#ef4444" },
  { name: "Neon Green", hex: "#10b981" },
  { name: "Electric Blue", hex: "#0ea5e9" },
  { name: "Retro Purple", hex: "#a855f7" },
];

export const AddChainModal: React.FC<AddChainModalProps> = ({
  isOpen,
  onClose,
  theme = "green",
  currentUserHandle = "",
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Burgers");
  const [slogan, setSlogan] = useState("");
  const [author, setAuthor] = useState("");
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0].hex);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-detect logged in Supabase user / X handle
  const [user, setUser] = useState<any>(null);
  const [xHandle, setXHandle] = useState<string>("");

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user || null);
        if (session?.user) {
          const handle =
            session.user.user_metadata?.user_name ||
            session.user.user_metadata?.preferred_username ||
            session.user.email?.split("@")[0] ||
            "user";
          const fullHandle = handle.startsWith("@") ? handle : `@${handle}`;
          setXHandle(fullHandle);
          setAuthor(fullHandle);
        } else if (currentUserHandle) {
          const formatted = currentUserHandle.startsWith("@")
            ? currentUserHandle
            : `@${currentUserHandle}`;
          setXHandle(formatted);
          setAuthor(formatted);
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          const handle =
            session.user.user_metadata?.user_name ||
            session.user.user_metadata?.preferred_username ||
            session.user.email?.split("@")[0] ||
            "user";
          const fullHandle = handle.startsWith("@") ? handle : `@${handle}`;
          setXHandle(fullHandle);
          setAuthor(fullHandle);
        } else {
          setXHandle("");
          setAuthor("");
        }
      });

      return () => subscription.unsubscribe();
    } else if (currentUserHandle) {
      const formatted = currentUserHandle.startsWith("@")
        ? currentUserHandle
        : `@${currentUserHandle}`;
      setAuthor(formatted);
    }
  }, [currentUserHandle]);

  if (!isOpen) return null;

  const isGreen = theme === "green";
  const glowText = isGreen
    ? "text-[#39ff14] glow-green"
    : "text-[#ffb000] glow-amber";
  const borderColor = isGreen ? "border-[#39ff14]/40" : "border-[#ffb000]/40";

  const handleTwitterLogin = async () => {
    sound.playClick();
    if (!supabase) return;
    const redirectUrl =
      typeof window !== "undefined"
        ? window.location.origin + window.location.pathname
        : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "x" as any,
      options: { redirectTo: redirectUrl },
    });
    if (error) {
      await supabase.auth.signInWithOAuth({
        provider: "twitter",
        options: { redirectTo: redirectUrl },
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage(
        "Please enter a valid chain name (at least 2 characters).",
      );
      return;
    }

    const trimmedSlogan = slogan.trim() || `Waiting for inaugural claim...`;
    const finalAuthor = (xHandle || author || "AnonymousFan").trim();

    setIsSubmitting(true);
    sound.playClick();

    try {
      // 1. Dispatch notification to Web3Forms inbox
      const web3FormData = new FormData();
      web3FormData.append("access_key", "f139beb4-ae4a-4838-8aba-d50af8577d88");
      web3FormData.append("subject", `[TOPFASTFOOD Chain Suggestion] ${trimmedName}`);
      web3FormData.append("from_name", "TOPFASTFOOD Chain Bot");
      web3FormData.append("chain_name", trimmedName);
      web3FormData.append("category", category);
      web3FormData.append("initial_slogan", trimmedSlogan);
      web3FormData.append("submitted_by", finalAuthor);
      web3FormData.append("accent_color", accentColor);
      web3FormData.append("submitted_at", new Date().toISOString());

      const web3Promise = fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: web3FormData,
      }).catch((err) => {
        console.warn("Web3Forms transmission warning:", err);
      });

      // 2. Queue in backend database for review
      const dbPromise = fetch("/api/add-chain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          category,
          actionType: "BOOST",
          amount: 1,
          message: trimmedSlogan,
          author: finalAuthor,
          accentColor,
        }),
      });

      const [res] = await Promise.all([dbPromise, web3Promise]);
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          data.error || "Failed to submit chain. Please try again.",
        );
        return;
      }

      sound.playCashRegister();
      setIsSuccess(true);
    } catch {
      setErrorMessage("Network error occurred. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    sound.playClick();
    setName("");
    setSlogan("");
    setErrorMessage(null);
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div
        className={`bg-zinc-950 border ${borderColor} rounded-xl max-w-lg w-full p-6 text-zinc-100 font-mono shadow-2xl relative overflow-hidden`}
      >
        {/* Modal Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          /* Success Screen */
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                CHAIN SUBMITTED FOR REVIEW!
              </h3>
              <p className="text-xs text-zinc-300 font-sans max-w-sm mx-auto leading-relaxed">
                Thank you! <strong>&quot;{name}&quot;</strong> has been submitted
                to the review queue with credit to{" "}
                <span className="text-sky-400 font-bold">
                  {xHandle || author || "you"}
                </span>
                . Our team will verify it first to keep the leaderboard spam-free
                before activating it on the live scoreboard!
              </p>
            </div>

            <div className="pt-3">
              <button
                onClick={handleResetAndClose}
                className="w-full py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
              >
                AWESOME, BACK TO LEADERBOARD
              </button>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                  PROPOSE A RESTAURANT
                </span>
              </div>
              <h2
                className={`text-xl font-extrabold uppercase tracking-tight ${glowText}`}
              >
                ADD A FAST FOOD CHAIN
              </h2>
            </div>

            {/* Mandatory Review Policy Banner */}
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-3 text-[11px] text-zinc-300 flex items-start gap-2.5 font-sans leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300">REVIEW NOTICE:</strong> All
                proposed chains will be <strong>reviewed by us first</strong>{" "}
                before being published on the live leaderboard to prevent troll
                entries, duplicates, or spam.
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-rose-950/40 border border-rose-500/50 rounded-lg p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Chain Name Input */}
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Restaurant / Chain Name *</span>
                <span className="text-zinc-600 font-normal">
                  e.g. In-N-Out, Jollibee
                </span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter restaurant name..."
                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
                Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setCategory(cat);
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer border ${
                      category === cat
                        ? "bg-emerald-950 text-emerald-300 border-emerald-500"
                        : "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Initial Slogan or Roast */}
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Why It Belongs Here / Rally Slogan</span>
                <span className="text-zinc-600 font-normal">Optional</span>
              </label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="e.g. Best seasoned curly fries on earth"
                maxLength={90}
                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>

            {/* Submitter Name / X Handle (Automatic when logged in) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Your X Handle</span>
                  {user ? (
                    <span className="text-emerald-400 text-[10px] font-bold">
                      ✓ Connected
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleTwitterLogin}
                      className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono cursor-pointer"
                    >
                      <svg
                        className="w-2.5 h-2.5 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      Login with X
                    </button>
                  )}
                </label>

                {user ? (
                  /* Auto-filled Connected X Handle Badge */
                  <div className="w-full bg-sky-950/30 border border-sky-800/60 rounded-lg px-3 py-2 text-xs text-sky-300 font-mono flex items-center justify-between">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <svg
                        className="w-3.5 h-3.5 fill-current text-sky-400 flex-shrink-0"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      <span className="font-bold truncate">
                        {xHandle || `@${author}`}
                      </span>
                    </div>
                    <UserAvatar handle={xHandle || author} size="xs" />
                  </div>
                ) : (
                  /* Fallback input for guest users */
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. @BurgerFan or Anonymous"
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                )}
              </div>

              {/* Accent Color Picker */}
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
                  Chain Theme Color
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {ACCENT_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setAccentColor(col.hex)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                        accentColor === col.hex
                          ? "border-white scale-110 shadow-sm"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Rate limit note */}
            <div className="text-[10px] text-zinc-500 text-center">
              Fair-use rate limit: Max 100 requests per minute per user.
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>SUBMITTING TO REVIEW QUEUE...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>SUBMIT CHAIN FOR REVIEW</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
