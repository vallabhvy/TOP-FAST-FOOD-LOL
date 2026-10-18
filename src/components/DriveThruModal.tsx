"use client";

import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Crown, Flame, User, Sparkles } from "lucide-react";
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
  }) => Promise<string | undefined> | void;
  theme?: string;
}

const PRESET_AMOUNTS = [1, 2, 5, 10];

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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

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
    const finalizedAuthor = rawAuthor
      ? rawAuthor.startsWith("@")
        ? rawAuthor
        : rawAuthor
      : "Anonymous";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className={`${headerBg} text-white px-5 py-3.5 flex items-center justify-between shadow-md`}>
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-wide">
              {isBoost ? "▲ BOOST" : "▼ SABOTAGE"} {brand.name.toUpperCase()}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toggle Switch */}
        <div className="grid grid-cols-2 p-3.5 pb-0 gap-2">
          <button
            type="button"
            onClick={() => setActionType("BOOST")}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isBoost
                ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                : "bg-white/[0.05] text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span>▲</span>
            <span>Boost $1 (+1 pt)</span>
          </button>
          <button
            type="button"
            onClick={() => setActionType("SABOTAGE")}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              !isBoost
                ? "bg-gradient-to-r from-rose-500 to-red-600 text-white font-black shadow-[0_0_15px_rgba(244,63,94,0.35)]"
                : "bg-white/[0.05] text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span>▼</span>
            <span>Sabotage $1 (-1 pt)</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {moderationError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{moderationError}</span>
            </div>
          )}

          {/* Amount Selection Chips */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Choose amount
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setAmount(val);
                    sound.playClick();
                  }}
                  className={`py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                    amount === val
                      ? "border-cyan-400 bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                      : "border-white/10 bg-white/[0.05] hover:bg-white/10 text-slate-200"
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>

            {/* Live Rank Preview */}
            <div className="mt-2.5 text-xs text-slate-300 font-medium bg-white/[0.04] border border-white/10 p-2.5 rounded-xl">
              {isBoost ? `+${amount}` : `-${amount}`} points. {brand.name} will have{" "}
              <span className="font-bold text-cyan-300">{newProjectedScore} points</span>.
            </div>
          </div>

          {/* Highlighted Comment Section (Slogan when Boosting, Roast when Sabotaging) */}
          {isBoost ? (
            <div className="p-3.5 rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-950/40 to-slate-900/60 shadow-[0_0_25px_rgba(16,185,129,0.2)] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-emerald-400 fill-emerald-400/30" />
                  <span>Your Slogan / Endorsement</span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    TOP BACKER
                  </span>
                </label>
                <span className="text-[11px] font-mono text-emerald-400/80">
                  {message.length}/80
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90 leading-snug">
                👑 <strong>Claim the spotlight:</strong> Your slogan is pinned directly under {brand.name} on the homepage as its official Top Backer motto!
              </p>
              <input
                type="text"
                maxLength={80}
                placeholder="e.g. Best curly fries on earth, undisputed king"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-950/80 border border-emerald-500/40 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 shadow-inner"
              />
              <p className="text-[10px] text-slate-400">
                Rule: one line, no hate speech, threats, or private info.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl border-2 border-rose-500/50 bg-gradient-to-b from-rose-950/40 to-slate-900/60 shadow-[0_0_25px_rgba(244,63,94,0.2)] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-400 fill-rose-400/30" />
                  <span>Public Roast</span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    ROAST FEED
                  </span>
                </label>
                <span className="text-[11px] font-mono text-rose-400/80">
                  {message.length}/80
                </span>
              </div>
              <p className="text-[11px] text-rose-200/90 leading-snug">
                🔥 <strong>Leave a burn:</strong> Your roast gets permanently logged on {brand.name}&apos;s live activity feed and printed receipts!
              </p>
              <input
                type="text"
                maxLength={80}
                placeholder="e.g. Overrated grease puddle with broken machines"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-950/80 border border-rose-500/40 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 shadow-inner"
              />
              <p className="text-[10px] text-slate-400">
                Rule: one line, no hate speech, threats, or private info.
              </p>
            </div>
          )}

          {/* Identity: Anonymous or Logged in */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Author Display Name</span>
              </label>
              {user ? (
                <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Logged in as @{user.user_metadata?.user_name || "user"}
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
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1.5 font-semibold cursor-pointer"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  <span>Sign in with X (optional)</span>
                </button>
              )}
            </div>

            <input
              type="text"
              maxLength={30}
              placeholder={user ? "e.g. @yourhandle" : "Enter display nickname, or leave empty for 'Anonymous'"}
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full bg-slate-950/70 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />

            <div className="flex items-start gap-1.5 text-[11px] text-slate-400 bg-white/[0.03] p-2 rounded-lg border border-white/[0.06]">
              <span className="font-bold text-cyan-300 flex-shrink-0">✓ Anonymous or Logged in:</span>
              <span>No account needed! Vote 100% anonymously with any nickname, or sign in with X to show your verified @handle.</span>
            </div>
          </div>

          {/* Submit Button & Subtext */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-xl ${buttonBg} text-sm transition-all active:scale-98 cursor-pointer disabled:opacity-50`}
            >
              {isSubmitting
                ? "Connecting..."
                : isBoost
                  ? `Pay $${amount} and boost`
                  : `Pay $${amount} and sabotage`}
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-2">
              Your ${amount} goes to the site&apos;s creator, not the restaurant.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
