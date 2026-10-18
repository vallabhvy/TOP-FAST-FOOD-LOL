"use client";

import React, { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
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

          {/* Message field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Add a message (optional)
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {message.length}/80
              </span>
            </div>
            <input
              type="text"
              maxLength={80}
              placeholder={
                isBoost
                  ? "e.g. Best fries on earth, fight me"
                  : "e.g. Overrated grease puddle"
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/15 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              One line rule: no slurs, threats or personal info.
            </p>
          </div>

          {/* Name / Display Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Your name
            </label>
            <input
              type="text"
              maxLength={30}
              placeholder={user ? "e.g. @yourhandle" : "e.g. BurgerFan or leave for Anonymous"}
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/15 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {user
                ? `Logged in via X`
                : "No account required. Display name or 'Anonymous'."}
            </p>
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
