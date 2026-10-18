"use client";

import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Crown, Flame, User, Sparkles, Shuffle } from "lucide-react";
import { FastFoodBrand, ActionType } from "@/types";
import { sound } from "@/lib/sound";
import { validateContent } from "@/lib/moderation";
import { supabase } from "@/lib/supabase";

interface DriveThruModalProps {
  brand: FastFoodBrand | null;
  initialAction?: ActionType;
  initialMessage?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: {
    brandId: string;
    actionType: ActionType;
    amount: number;
    message: string;
    author: string;
    location?: string;
    country?: string;
    paymentMethod?: string;
  }) => Promise<string | undefined> | void;
  theme?: string;
}

const PRESET_AMOUNTS = [1, 2, 5, 10];

const RANDOM_ANON_NAMES = [
  "@FryLord",
  "@BurgerBandit",
  "@NuggetNinja",
  "@SauceBoss",
  "@DriveThruGhost",
  "@CrispyFan",
  "@SaltySpud",
  "@ShakeShifter",
  "@DipMaster",
  "@MidnightMuncher",
  "@PattyPatrol",
  "@ComboCraver",
  "@SpicyRider",
  "@CheesyKing",
];

export const DriveThruModal: React.FC<DriveThruModalProps> = ({
  brand,
  initialAction = "BOOST",
  initialMessage = "",
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [actionType, setActionType] = useState<ActionType>(initialAction);
  const [amount, setAmount] = useState<number>(1);
  const [message, setMessage] = useState<string>(initialMessage);
  const [authorName, setAuthorName] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">(() => {
    if (typeof window !== "undefined") {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        if (tz.includes("Calcutta") || tz.includes("Kolkata") || navigator.language === "en-IN") {
          return "upi";
        }
      } catch {}
    }
    return "card";
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const handleRollRandomName = () => {
    sound.playClick();
    const randomName =
      RANDOM_ANON_NAMES[Math.floor(Math.random() * RANDOM_ANON_NAMES.length)];
    setAuthorName(randomName);
    setModerationError(null);
  };

  useEffect(() => {
    setActionType(initialAction);
  }, [initialAction]);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user || null);
        if (session?.user) {
          const handle =
            session.user.user_metadata?.user_name ||
            session.user.user_metadata?.preferred_username;
          if (handle) setAuthorName(`@${handle}`);
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          const handle =
            session.user.user_metadata?.user_name ||
            session.user.user_metadata?.preferred_username;
          if (handle) setAuthorName(`@${handle}`);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  if (!isOpen || !brand) return null;

  const isBoost = actionType === "BOOST";
  const headerBg = isBoost
    ? "bg-gradient-to-r from-emerald-600 to-teal-600"
    : "bg-gradient-to-r from-rose-600 to-red-600";
  const buttonBg = isBoost
    ? "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black shadow-[0_0_25px_rgba(16,185,129,0.45)]"
    : "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-black shadow-[0_0_25px_rgba(244,63,94,0.45)]";

  const newProjectedScore = isBoost ? brand.totalScore + amount : brand.totalScore - amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalizedMessage =
      message.trim() ||
      (isBoost ? "King of fast food." : "Overrated grease puddle.");

    const rawAuthor = authorName.trim();
    if (!rawAuthor) {
      setModerationError(
        "An anonymous username is compulsory. Please enter a nickname or tap 'Roll Name'."
      );
      sound.playSabotageBuzzer();
      return;
    }

    const finalizedAuthor = rawAuthor.startsWith("@") ? rawAuthor : `@${rawAuthor}`;

    // Content moderation
    const msgValidation = validateContent(finalizedMessage, "message");
    if (!msgValidation.isValid) {
      setModerationError(
        msgValidation.reason ||
          "That message breaks the rules (no slurs, threats or personal info). Edit it, or boost without a message."
      );
      sound.playSabotageBuzzer();
      return;
    }

    if (rawAuthor) {
      const authorValidation = validateContent(rawAuthor, "author");
      if (!authorValidation.isValid) {
        setModerationError(authorValidation.reason || "Invalid display name format.");
        sound.playSabotageBuzzer();
        return;
      }
    }

    setModerationError(null);
    setIsSubmitting(true);
    sound.playClick();

    try {
      const errorMsg = await onSubmit({
        brandId: brand.id,
        actionType,
        amount,
        message: finalizedMessage,
        author: finalizedAuthor,
        country: paymentMethod === "upi" ? "IN" : "US",
        paymentMethod,
      });

      if (errorMsg) {
        setModerationError(errorMsg);
        setIsSubmitting(false);
        sound.playSabotageBuzzer();
        return;
      }

      sound.playCashRegister();
      setMessage("");
    } catch {
      setModerationError("Payments aren't working right now. Nothing was charged. Try again in a few minutes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-md max-h-[min(94vh,640px)] flex flex-col bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] overflow-hidden text-slate-100 my-auto">
        {/* Header Bar (Pinned) */}
        <div className={`${headerBg} text-white px-4 py-2.5 flex items-center justify-between shadow-md flex-shrink-0`}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-wide">
              {isBoost ? "▲ BOOST" : "▼ SABOTAGE"} {brand.name.toUpperCase()}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Toggle Switch (Pinned) */}
        <div className="grid grid-cols-2 px-3 pt-2 pb-1 gap-1.5 flex-shrink-0 bg-slate-900/60 border-b border-white/5">
          <button
            type="button"
            onClick={() => setActionType("BOOST")}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isBoost
                ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                : "bg-white/[0.05] text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span>▲</span>
            <span>Boost $1 (+1 pt)</span>
          </button>
          <button
            type="button"
            onClick={() => setActionType("SABOTAGE")}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              !isBoost
                ? "bg-gradient-to-r from-rose-500 to-red-600 text-white font-black shadow-[0_0_12px_rgba(244,63,94,0.35)]"
                : "bg-white/[0.05] text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span>▼</span>
            <span>Sabotage $1 (-1 pt)</span>
          </button>
        </div>

        {/* Form Form Body (Scrollable Middle + Pinned Footer) */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-3.5 space-y-2.5 custom-scrollbar">
            {moderationError && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{moderationError}</span>
              </div>
            )}

            {/* Amount Selection Chips & Points Preview */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Amount
                </label>
                <span className="text-[11px] font-mono text-cyan-300 font-semibold">
                  {isBoost ? `+${amount}` : `-${amount}`} pts → {newProjectedScore} pts
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setAmount(val);
                      sound.playClick();
                    }}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      amount === val
                        ? "border-cyan-400 bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                        : "border-white/10 bg-white/[0.05] hover:bg-white/10 text-slate-200"
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Rail Toggle: Global Cards vs Google Pay UPI */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("card");
                    sound.playClick();
                  }}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === "card"
                      ? "border-cyan-400 bg-cyan-500/15 text-white shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                      : "border-white/10 bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>💳</span>
                    <span>Cards &amp; Apple/GPay</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Global checkout (USD)</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("upi");
                    sound.playClick();
                  }}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === "upi"
                      ? "border-emerald-400 bg-emerald-500/15 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                      : "border-white/10 bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5 text-emerald-300">
                    <span>⚡</span>
                    <span>Google Pay / UPI</span>
                  </div>
                  <div className="text-[10px] text-emerald-400/80 mt-0.5">GPay, PhonePe, QR (INR)</div>
                </button>
              </div>
            </div>

            {/* Highlighted Comment Section (Slogan when Boosting, Roast when Sabotaging) */}
            {isBoost ? (
              <div className="p-2.5 rounded-xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/30 to-slate-900/60 shadow-[0_0_15px_rgba(16,185,129,0.15)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/30" />
                    <span>Your Slogan</span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      TOP BACKER
                    </span>
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400/80">
                    {message.length}/80
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={80}
                  placeholder="e.g. Best curly fries on earth, undisputed king"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950/80 border border-emerald-500/40 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 shadow-inner"
                />
                <p className="text-[10px] text-emerald-300/80 leading-tight">
                  👑 Pinned under {brand.name} as Top Fan Slogan (unofficial fan commentary)
                </p>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl border border-rose-500/40 bg-gradient-to-b from-rose-950/30 to-slate-900/60 shadow-[0_0_15px_rgba(244,63,94,0.15)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
                    <span>Public Roast</span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      ROAST FEED
                    </span>
                  </label>
                  <span className="text-[10px] font-mono text-rose-400/80">
                    {message.length}/80
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={80}
                  placeholder="e.g. Overrated grease puddle with broken machines"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950/80 border border-rose-500/40 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 shadow-inner"
                />
                <p className="text-[10px] text-rose-300/80 leading-tight">
                  🔥 Permanently logged on {brand.name}&apos;s live activity feed &amp; receipts!
                </p>
              </div>
            )}

            {/* Identity: Anonymous Username (Compulsory) or Logged in */}
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Username</span>
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Compulsory
                  </span>
                </label>
                {user ? (
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    @{user.user_metadata?.user_name || "user"}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      supabase?.auth.signInWithOAuth({
                        provider: "twitter",
                        options: {
                          redirectTo: typeof window !== "undefined" ? window.location.href : undefined,
                        },
                      });
                    }}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                    <span>Or sign in with X</span>
                  </button>
                )}
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  required
                  maxLength={30}
                  placeholder={user ? "e.g. @yourhandle" : "Enter anonymous nickname"}
                  value={authorName}
                  onChange={(e) => {
                    setAuthorName(e.target.value);
                    if (moderationError && e.target.value.trim()) setModerationError(null);
                  }}
                  className={`flex-1 bg-slate-950/70 border ${
                    !authorName.trim() && moderationError
                      ? "border-amber-400 focus:border-amber-400 focus:ring-amber-400/50"
                      : "border-white/15 focus:border-cyan-400 focus:ring-cyan-400"
                  } rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1`}
                />
                <button
                  type="button"
                  onClick={handleRollRandomName}
                  title="Roll a random anonymous handle"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all active:scale-95 cursor-pointer whitespace-nowrap shadow-sm"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Roll Name</span>
                </button>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="font-bold text-amber-300">⚠️ Compulsory:</span>
                <span>Type any handle or tap Roll Name. No account required.</span>
              </div>
            </div>
          </div>

          {/* Submit Button & Subtext (Pinned Bottom Footer) */}
          <div className="flex-shrink-0 p-3 bg-slate-950/90 border-t border-white/10 backdrop-blur-md">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 px-4 rounded-xl ${buttonBg} text-xs sm:text-sm transition-all active:scale-98 cursor-pointer disabled:opacity-50`}
            >
              {isSubmitting
                ? "Connecting to gateway..."
                : paymentMethod === "upi"
                  ? isBoost
                    ? `Pay $${amount} via UPI / GPay & Boost`
                    : `Pay $${amount} via UPI / GPay & Sabotage`
                  : isBoost
                    ? `Pay $${amount} and boost`
                    : `Pay $${amount} and sabotage`}
            </button>
            <div className="text-center text-[10px] text-slate-400 mt-2 space-y-1">
              <p>
                Voluntary non-refundable entertainment micro-tip • 18+ • Not affiliated with {brand.name}.
              </p>
              <p className="text-[9px] text-slate-500">
                By clicking Pay, you agree to the{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline text-slate-400 hover:text-white">Terms</a>
                {" "}and{" "}
                <a href="/disclaimer" target="_blank" rel="noopener noreferrer" className="underline text-slate-400 hover:text-white">Disclaimer</a>.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
