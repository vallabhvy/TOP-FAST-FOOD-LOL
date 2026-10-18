"use client";

import React, { useState } from "react";
import { X, Share2, Copy, Check } from "lucide-react";
import { Transaction } from "@/types";
import { sound } from "@/lib/sound";

interface ReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  brandRank: number;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  isOpen,
  onClose,
  brandRank,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !transaction) return null;

  const isBoost = transaction.actionType === "BOOST";
  const shareText = isBoost
    ? `I just boosted ${transaction.brandName} with $${transaction.amount} on topfastfood.lol! "${transaction.message}" Now ranked #${brandRank}. Defend your favourites:`
    : `I just sabotaged ${transaction.brandName} with $${transaction.amount} on topfastfood.lol! "${transaction.message}" Now ranked #${brandRank}. Fight back:`;

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(`https://topfastfood.lol/chain/${transaction.brandId}`)}`;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).toUpperCase();
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const receiptPlain = `
TOPFASTFOOD.LOL
TRANSACTION RECEIPT
------------------------------
ORDER #${transaction.receiptNumber}
${dateStr}  ${timeStr}

${isBoost ? "BOOST" : "SABOTAGE"} ${transaction.brandName.toUpperCase()}
AMOUNT   $${transaction.amount}.00
POINTS   ${isBoost ? `+${transaction.amount}` : `-${transaction.amount}`}

${transaction.brandName.toUpperCase()}  now #${brandRank}

"${transaction.message}"
- ${transaction.author}
------------------------------
${transaction.brandName} fan? Fight back:
topfastfood.lol/chain/${transaction.brandId}
------------------------------
SETTLED ON TOPFASTFOOD.LOL
`.trim();

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(receiptPlain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm sm:max-w-md">
        {/* Modern Glass Receipt Container */}
        <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_70px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] rounded-2xl p-6 sm:p-7 font-receipt text-slate-100 relative">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Receipt Top */}
          <div className="text-center pb-3 border-b border-dashed border-white/15">
            <div className="font-black text-xl tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300">
              TOPFASTFOOD.LOL
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mt-0.5 font-sans">
              Digital Verified Receipt
            </div>
          </div>

          {/* Receipt Meta */}
          <div className="py-3 border-b border-dashed border-white/15 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">ORDER</span>
              <span className="font-bold text-white">#{transaction.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{dateStr}</span>
              <span className="text-slate-300">{timeStr}</span>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="py-3 border-b border-dashed border-white/15 text-xs space-y-2">
            <div className="flex justify-between font-bold text-sm">
              <span className={isBoost ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]"}>
                {isBoost ? "▲ BOOST" : "▼ SABOTAGE"} {transaction.brandName.toUpperCase()}
              </span>
              <span className="text-white">${transaction.amount}.00</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>POINTS</span>
              <span className="font-bold text-white">
                {isBoost ? `+${transaction.amount}` : `-${transaction.amount}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>CURRENT RANK</span>
              <span className="font-bold text-cyan-300">#{brandRank}</span>
            </div>
          </div>

          {/* Note / Message */}
          <div className="py-3 border-b border-dashed border-white/15 text-xs">
            <div className="italic text-sm text-slate-200 mb-1">
              &quot;{transaction.message}&quot;
            </div>
            <div className="text-right text-slate-400 font-mono">
              — {transaction.author}
            </div>
          </div>

          {/* Call to Action for Rivals */}
          <div className="py-3 border-b border-dashed border-white/15 text-center text-xs text-slate-400">
            <div>{transaction.brandName} fan? Fight back:</div>
            <div className="font-bold text-cyan-400 mt-0.5">
              topfastfood.lol/chain/{transaction.brandId}
            </div>
          </div>

          {/* Receipt Footer */}
          <div className="text-center pt-3 text-xs tracking-wider font-bold text-slate-400 uppercase">
            SETTLED IN DOLLARS • THANK YOU
          </div>

          {/* Action Buttons */}
          <div className="mt-5 space-y-2 font-sans">
            <div className="grid grid-cols-2 gap-2">
              <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center shadow-[0_0_15px_rgba(6,182,212,0.35)]"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share to X</span>
              </a>

              <button
                onClick={handleCopy}
                className="py-2.5 px-3 rounded-xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy text"}</span>
              </button>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-white/10"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
