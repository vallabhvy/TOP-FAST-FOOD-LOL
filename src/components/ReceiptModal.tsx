"use client";

import React, { useState } from "react";
import { X, Share2, Copy, Check } from "lucide-react";
import { Transaction } from "@/types";
import { sound } from "@/lib/sound";
import { supabase } from "@/lib/supabase";

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
drive-thru window #1
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
THANK YOU. COME AGAIN.
`.trim();

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(receiptPlain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTwitterLogin = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "x" as any,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm sm:max-w-md">
        {/* Receipt Container */}
        <div className="bg-[#FFFFFF] border border-[#CBD2C4] shadow-2xl rounded-sm p-6 sm:p-7 font-receipt text-[#1E2A3A] relative">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="absolute top-3 right-3 text-[#7A8898] hover:text-[#1E2A3A] cursor-pointer p-1"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Receipt Top */}
          <div className="text-center pb-3 border-b border-dashed border-[#B8BCB2]">
            <div className="font-extrabold text-xl tracking-tight uppercase">
              TOPFASTFOOD.LOL
            </div>
            <div className="text-xs text-[#5A6878] uppercase mt-0.5">
              drive-thru window #1
            </div>
          </div>

          {/* Receipt Meta */}
          <div className="py-3 border-b border-dashed border-[#B8BCB2] text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-[#5A6878]">ORDER</span>
              <span className="font-bold">#{transaction.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5A6878]">{dateStr}</span>
              <span>{timeStr}</span>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="py-3 border-b border-dashed border-[#B8BCB2] text-xs space-y-2">
            <div className="flex justify-between font-bold text-sm">
              <span className={isBoost ? "text-[#3B7A1F]" : "text-[#B82E22]"}>
                {isBoost ? "▲ BOOST" : "▼ SABOTAGE"} {transaction.brandName.toUpperCase()}
              </span>
              <span>${transaction.amount}.00</span>
            </div>
            <div className="flex justify-between text-[#5A6878]">
              <span>POINTS</span>
              <span className="font-bold text-[#1E2A3A]">
                {isBoost ? `+${transaction.amount}` : `-${transaction.amount}`}
              </span>
            </div>
            <div className="flex justify-between text-[#5A6878]">
              <span>CURRENT RANK</span>
              <span className="font-bold text-[#1E2A3A]">#{brandRank}</span>
            </div>
          </div>

          {/* Note / Message */}
          <div className="py-3 border-b border-dashed border-[#B8BCB2] text-xs">
            <div className="italic font-serif text-sm text-[#1E2A3A] mb-1">
              &quot;{transaction.message}&quot;
            </div>
            <div className="text-right text-[#5A6878] font-mono">
              — {transaction.author}
            </div>
          </div>

          {/* Call to Action for Rivals */}
          <div className="py-3 border-b border-dashed border-[#B8BCB2] text-center text-xs text-[#5A6878]">
            <div>{transaction.brandName} fan? Fight back:</div>
            <div className="font-bold text-[#167A75] mt-0.5">
              topfastfood.lol/chain/{transaction.brandId}
            </div>
          </div>

          {/* Receipt Footer */}
          <div className="text-center pt-3 text-xs tracking-wider font-bold text-[#5A6878] uppercase">
            THANK YOU. COME AGAIN.
          </div>

          {/* Action Buttons */}
          <div className="mt-5 space-y-2 font-sans">
            <div className="grid grid-cols-2 gap-2">
              <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="py-2 px-3 rounded-lg bg-[#1E2A3A] hover:bg-[#167A75] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share to X</span>
              </a>

              <button
                onClick={handleCopy}
                className="py-2 px-3 rounded-lg border border-[#CBD2C4] hover:bg-[#EEF0EA] text-[#1E2A3A] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#3B7A1F]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy text"}</span>
              </button>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-full py-2 rounded-lg bg-[#EEF0EA] hover:bg-[#E2E4DC] text-[#1E2A3A] text-xs font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
