"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Flame,
  Skull,
  MessageSquare,
  ArrowRight,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { FastFoodBrand, ActionType, CRTColorTheme } from "@/types";
import { sound } from "@/lib/sound";
import { UserAvatar } from "@/components/UserAvatar";
import { validateContent } from "@/lib/moderation";

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
  }) => void;
  theme: CRTColorTheme;
}

const PRESET_AMOUNTS = [1, 2, 5, 10];
const QUICK_LOCATIONS = [
  "Los Angeles, CA 🌴",
  "Austin, TX 🤠",
  "New York, NY 🗽",
  "Chicago, IL 🏙️",
  "Miami, FL 🏖️",
];

export const DriveThruModal: React.FC<DriveThruModalProps> = ({
  brand,
  initialAction = "BOOST",
  initialMessage = "",
  isOpen,
  onClose,
  onSubmit,
  theme,
}) => {
  const [actionType, setActionType] = useState<ActionType>(initialAction);
  const [amount, setAmount] = useState<number>(1);
  const [message, setMessage] = useState<string>(initialMessage);
  const [nickname, setNickname] = useState<string>("");
  const [xHandle, setXHandle] = useState<string>("");
  const [location, setLocation] = useState<string>("Austin, TX 🤠");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [moderationError, setModerationError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/geo")
      .then((res) => res.json())
      .then((data) => {
        if (data.location) {
          setLocation(data.location);
        }
      })
      .catch(() => {});
  }, []);

  if (!isOpen || !brand) return null;

  const isGreen = theme === "green";
  const glowText = isGreen
    ? "text-[#39ff14] glow-green"
    : "text-[#ffb000] glow-amber";
  const modalBorder =
    actionType === "BOOST" ? "border-emerald-500/60" : "border-rose-500/60";

  const handleActionToggle = (type: ActionType) => {
    setActionType(type);
    if (type === "BOOST") {
      sound.playDriveThruChime();
    } else {
      sound.playSabotageBuzzer();
    }
  };

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    sound.playClick();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanX = xHandle.trim().replace(/^@/, "");
    const cleanNick = nickname.trim();
    if (!cleanX && !cleanNick) return;

    const finalizedMessage =
      message.trim() ||
      (actionType === "BOOST"
        ? "King of fast food."
        : "Overrated grease puddle.");
    const finalizedAuthor = cleanX ? `@${cleanX}` : cleanNick;

    // 0. Automated Content Moderation Gate
    const msgValidation = validateContent(finalizedMessage, "message");
    if (!msgValidation.isValid) {
      setModerationError(msgValidation.reason || "Prohibited content detected.");
      sound.playSabotageBuzzer();
      return;
    }

    if (cleanNick) {
      const authorValidation = validateContent(cleanNick, "author");
      if (!authorValidation.isValid) {
        setModerationError(authorValidation.reason || "Invalid nickname format.");
        sound.playSabotageBuzzer();
        return;
      }
    }

    if (location.trim()) {
      const locValidation = validateContent(location.trim(), "location");
      if (!locValidation.isValid) {
        setModerationError(locValidation.reason || "Invalid city format.");
        sound.playSabotageBuzzer();
        return;
      }
    }

    setModerationError(null);
    setIsSubmitting(true);
    sound.playClick();

    // Instant local transaction (Dodo Payments to be integrated)
    sound.playCashRegister();
    setTimeout(() => {
      onSubmit({
        brandId: brand.id,
        actionType,
        amount,
        message: finalizedMessage,
        author: finalizedAuthor,
        location: location.trim() || undefined,
      });
      setIsSubmitting(false);
      setMessage("");
      setNickname("");
      setXHandle("");
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md bg-[#0a0f0c] border-2 ${modalBorder} rounded-xl shadow-2xl font-mono text-white p-4 sm:p-5`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-black uppercase text-white truncate max-w-[150px] sm:max-w-[200px]">
                {brand.name}
              </span>
              <span
                className={`text-xs font-bold ${brand.totalScore < 0 ? "text-rose-400" : glowText}`}
              >
                (
                {brand.totalScore < 0
                  ? `-$${Math.abs(brand.totalScore)}`
                  : `$${brand.totalScore}`}
                )
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-1"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {moderationError && (
            <div className="mb-2.5 p-2 rounded bg-rose-950/80 border border-rose-500/80 flex items-center gap-1.5 text-xs text-rose-300 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span className="font-bold">{moderationError}</span>
            </div>
          )}

          {/* Action Toggle: BOOST vs SABOTAGE */}
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <button
              type="button"
              onClick={() => handleActionToggle("BOOST")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border font-bold text-xs uppercase transition-all cursor-pointer ${
                actionType === "BOOST"
                  ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 bg-zinc-950/60"
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              BOOST (+${amount})
            </button>

            <button
              type="button"
              onClick={() => handleActionToggle("SABOTAGE")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border font-bold text-xs uppercase transition-all cursor-pointer ${
                actionType === "SABOTAGE"
                  ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                  : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 bg-zinc-950/60"
              }`}
            >
              <Skull className="w-3.5 h-3.5" />
              SABOTAGE (-${amount})
            </button>
          </div>

          {/* Amount Presets */}
          <div className="grid grid-cols-4 gap-2 mb-2.5">
            {PRESET_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleAmountSelect(val)}
                className={`py-1 rounded border font-mono font-bold text-xs transition-all cursor-pointer ${
                  amount === val
                    ? actionType === "BOOST"
                      ? "bg-emerald-500 border-emerald-400 text-black font-extrabold"
                      : "bg-rose-600 border-rose-500 text-white font-extrabold"
                    : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                ${val}
              </button>
            ))}
          </div>

          {/* Pinned Note / Trash Roast */}
          <div className="mb-2.5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {actionType === "BOOST" ? "Pinned Note" : "Trash Roast"}
              </label>
              <span className="text-[9px] text-zinc-500">
                {40 - message.length} chars
              </span>
            </div>
            <input
              type="text"
              maxLength={40}
              placeholder={
                actionType === "BOOST"
                  ? "e.g. Best late-night fries in existence"
                  : "e.g. Floor smells like soggy sponge"
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
            />
          </div>

          {/* Driver Identity (Name OR X Handle) */}
          <div className="mb-2.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase mb-1">
              <span>Driver Identity *</span>
              <span className="text-zinc-500 font-normal">
                Name OR X Handle
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                maxLength={30}
                required={!xHandle.trim()}
                placeholder="Name / Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
              />

              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs select-none">
                  @
                </span>
                <input
                  type="text"
                  maxLength={25}
                  required={!nickname.trim()}
                  placeholder="X_handle"
                  value={xHandle.replace(/^@/, "")}
                  onChange={(e) =>
                    setXHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded pl-6 pr-8 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                />
                {xHandle.trim() && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                    <UserAvatar handle={xHandle} size="xs" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Turf / City Origin */}
          <div className="mb-3.5">
            <div className="flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                Turf / City (Optional)
              </span>
            </div>
            <input
              type="text"
              maxLength={30}
              placeholder="e.g. Austin, TX 🤠"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
            />
          </div>

          {/* Zero Tolerance Notice */}
          <p className="text-[9px] text-zinc-500 mb-2 leading-tight">
            *Conduct: Hate speech, slurs, doxxing, and illegal content are strictly banned and purged with no refund.
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 rounded-lg font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg ${
              actionType === "BOOST"
                ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
                : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
            }`}
          >
            {isSubmitting ? (
              <span className="animate-pulse">TRANSMITTING...</span>
            ) : (
              <>
                <span>
                  {actionType === "BOOST" ? "TIP & BOOST" : "PAY & SABOTAGE"} ($
                  {amount}.00)
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
