"use client";

import React, { useState } from "react";
import { X, Share2, Copy, Check } from "lucide-react";
import { Transaction } from "@/types";
import { sound } from "@/lib/sound";
import { UserAvatar } from "@/components/UserAvatar";

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
    ? `I just spent $${transaction.amount} on topfastfood.lol to BOOST ${transaction.brandName} to #${brandRank}! "${transaction.message}" 🍟 Settle the beef here:`
    : `I just spent $${transaction.amount} on topfastfood.lol to SABOTAGE ${transaction.brandName}! "${transaction.message}" ☠️ Fight back here:`;

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent("https://topfastfood.lol")}`;

  const copyReceiptText = () => {
    sound.playClick();
    const textReceipt = `
========================================
           TOPFASTFOOD.LOL
     OFFICIAL DRIVE-THRU RECEIPT
========================================
ORDER: #${transaction.receiptNumber}
DATE:  ${new Date().toLocaleDateString()}
TIME:  ${new Date().toLocaleTimeString()}
----------------------------------------
ITEM:   1x PETTY ${transaction.actionType}
TARGET: ${transaction.brandName.toUpperCase()}
NOTE:   "${transaction.message}"
DRIVER: ${transaction.author}
----------------------------------------
TOTAL DAMAGE:  $${transaction.amount}.00
STATUS:        TRANSACTION CONFIRMED
CURRENT RANK:  #${brandRank}
========================================
RANKINGS DECIDED BY COLD PETTY CASH.
VISIT: HTTPS://TOPFASTFOOD.LOL
========================================
`.trim();

    navigator.clipboard.writeText(textReceipt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md">
        {/* Receipt Container Styled like Thermal Paper */}
        <div className="bg-[#f7f5e8] text-zinc-900 font-mono p-6 sm:p-7 shadow-2xl rounded-sm border-t-8 border-dashed border-zinc-400 relative selection:bg-zinc-800 selection:text-white">
          {/* Close button */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="absolute top-3 right-3 text-zinc-400 hover:text-black cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Receipt Header */}
          <div className="text-center border-b border-dashed border-zinc-400 pb-4 mb-4">
            <div className="font-extrabold text-2xl tracking-tighter uppercase font-mono">
              TOPFASTFOOD.LOL
            </div>
            <div className="text-xs tracking-widest text-zinc-600 uppercase mt-0.5">
              *** DRIVE-THRU PETTY TURF WAR ***
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              STORE #0001 • REGISTER #3 • LANE 1
            </div>
            <div className="text-[11px] text-zinc-500">
              ORDER: <span className="font-bold text-zinc-800">{transaction.receiptNumber}</span>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2 text-xs border-b border-dashed border-zinc-400 pb-4 mb-4">
            <div className="flex justify-between font-bold">
              <span>ITEM</span>
              <span>AMOUNT</span>
            </div>
            <div className="flex justify-between">
              <span className="truncate pr-2">
                1x {isBoost ? "PETTY BRAND BOOST 🌶️" : "GREASE SABOTAGE ☠️"}
              </span>
              <span className="font-bold">${transaction.amount}.00</span>
            </div>
            <div className="text-zinc-600 pl-3 italic">
              Target: <span className="font-bold text-black">{transaction.brandName}</span>
            </div>
            <div className="text-zinc-600 pl-3">
              Order Note: &quot;{transaction.message}&quot;
            </div>
            <div className="text-zinc-600 pl-3 text-[11px] flex items-center gap-1.5 pt-0.5">
              <span>Driver:</span>
              {transaction.author.startsWith("@") && transaction.author !== "@anon_driver" ? (
                <a
                  href={`https://x.com/${transaction.author.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-black hover:underline flex items-center gap-1"
                >
                  <UserAvatar handle={transaction.author} size="xs" className="border-zinc-400" />
                  <span>{transaction.author}</span>
                </a>
              ) : (
                <span className="font-bold text-black">{transaction.author}</span>
              )}
            </div>
            {transaction.location && (
              <div className="text-zinc-600 pl-3 text-[11px] pt-0.5">
                Turf: <span className="font-bold text-black">{transaction.location}</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-b border-dashed border-zinc-400 pb-4 mb-4">
            <div className="flex justify-between items-center text-sm font-bold">
              <span>SUBTOTAL</span>
              <span>${transaction.amount}.00</span>
            </div>
            <div className="flex justify-between items-center text-xs text-zinc-500">
              <span>CONVICTION TAX</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between items-center text-lg font-extrabold mt-1 pt-1 border-t border-zinc-300">
              <span>TOTAL BILLED</span>
              <span>${transaction.amount}.00</span>
            </div>
          </div>

          {/* Verdict Banner */}
          <div className="bg-zinc-200/80 p-2.5 rounded text-center mb-4 text-xs font-bold uppercase tracking-wider text-zinc-800">
            {transaction.brandName} is currently ranked #{brandRank}!
          </div>

          {/* Fake Barcode */}
          <div className="text-center py-2 border-b border-dashed border-zinc-400 mb-5">
            <div className="font-mono text-3xl tracking-widest text-zinc-800 select-none overflow-hidden h-9">
              ||| | |||| | ||| |||| | || |||||
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 tracking-widest">
              TX-SECURE-{transaction.id.toUpperCase()}
            </div>
          </div>

          {/* Social Share & Copy Buttons */}
          <div className="space-y-2">
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className="w-full py-2.5 px-4 bg-black hover:bg-zinc-800 text-white rounded font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer text-center"
            >
              <Share2 className="w-4 h-4" />
              POST RECEIPT TO X / TWITTER
            </a>

            <button
              onClick={copyReceiptText}
              className="w-full py-2 px-4 border border-zinc-400 hover:bg-zinc-200 text-zinc-800 rounded font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  COPIED TO CLIPBOARD!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  COPY RECEIPT TEXT (FOR REDDIT/DISCORD)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
