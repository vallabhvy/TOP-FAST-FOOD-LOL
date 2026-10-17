"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import { sound } from "@/lib/sound";
import { AddChainModal } from "@/components/AddChainModal";
import { FeedbackModal } from "@/components/FeedbackModal";
import { DriveThruFooter } from "@/components/DriveThruFooter";

export default function AboutClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isAddChainOpen, setIsAddChainOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Interactive Simulator state (Fixed to $1 per review F8)
  const [simScore, setSimScore] = useState(12);
  const [simRank, setSimRank] = useState(2);
  const [simLog, setSimLog] = useState<string>(
    "Tap ▲ Boost $1 or ▼ Sabotage $1 to test the controls."
  );

  const handleSimBoost = () => {
    sound.playCashRegister();
    setSimScore((s) => s + 1);
    setSimRank(1);
    setSimLog("▲ +$1 Boosted! Pixel Burger gained +1 point and moved to #1.");
  };

  const handleSimSabotage = () => {
    sound.playSabotageBuzzer();
    setSimScore((s) => s - 1);
    setSimRank(3);
    setSimLog("▼ -$1 Sabotaged! Pixel Burger lost 1 point and dropped to #3.");
  };

  const resetSim = () => {
    sound.playClick();
    setSimScore(12);
    setSimRank(2);
    setSimLog("Simulator reset. Ready for your test vote.");
  };

  interface FaqItem {
    q: string;
    a: string;
    hasAddButton?: boolean;
  }

  const faqs: FaqItem[] = [
    {
      q: "Will actual food arrive at my house if I use this site?",
      a: "No. topfastfood.lol is a live community ranking and fan debate tool settled with small tips. If you're hungry, you'll still need to visit a real drive-thru window.",
    },
    {
      q: "How does the ranking work?",
      a: "$1 pushes your chain up a point (Boost). $1 pushes a rival down one point (Sabotage). The chain with the most points holds the #1 crown.",
    },
    {
      q: "What does the top backer get?",
      a: "When you boost a chain, your message and handle get pinned under the chain's name on the leaderboard as its top backer for everyone to see.",
    },
    {
      q: "What is the receipt?",
      a: "Every payment generates a drive-thru thermal receipt showing your order number, points change, and message. You can copy it, save it, or share it on X to recruit your friends or bait your rivals.",
    },
    {
      q: "Where does the money go?",
      a: "Payments are micro-tips that go directly to the site's creator to pay for server costs, database infrastructure, and hosting — not the restaurant corporations.",
    },
    {
      q: "Do I have to log in to vote?",
      a: "No! Guest checkout is fully supported. You can enter any display name or remain Anonymous. If you log in with your X account, your verified @handle is attached to your receipt and pinned message.",
    },
    {
      q: "What if my favourite restaurant is missing?",
      a: "You can suggest a chain by tapping 'Suggest one' on the leaderboard or clicking the button below. All submissions are reviewed to prevent duplicates before going live.",
      hasAddButton: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F7F3] text-[#1E2A3A] flex flex-col font-sans selection:bg-[#167A75] selection:text-white">
      {/* Header */}
      <header className="border-b border-[#E2E4DC] bg-[#FFFFFF] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 group cursor-pointer"
          >
            <img
              src="/logo.jpg"
              alt="topfastfood.lol logo"
              className="w-7 h-7 sm:w-8 sm:h-8 object-cover rounded-md border border-[#E2E4DC]"
            />
            <span className="text-lg sm:text-xl font-bold tracking-tight text-[#1E2A3A] group-hover:text-[#167A75] transition-colors">
              topfastfood<span className="text-[#167A75]">.lol</span>
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CBD2C4] hover:bg-[#EEF0EA] text-xs sm:text-sm font-medium text-[#1E2A3A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to ranking</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12 flex-1 w-full space-y-10">
        {/* Intro */}
        <section className="space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1E2A3A] tracking-tight">
            How it works
          </h1>
          <p className="text-base text-[#5A6878] leading-relaxed">
            The internet&apos;s fast food ranking, settled in dollars. No critics, no sponsored reviews, no corporate PR. Fans vote with $1 micro-tips to crown their favourite drive-thru or roast their rivals.
          </p>
        </section>

        {/* The Core Mechanics in 3 Steps */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#1E2A3A]">
            Three simple rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#FFFFFF] border border-[#E2E4DC] p-4 rounded-xl space-y-2 shadow-2xs">
              <div className="w-7 h-7 rounded-md bg-[#3B7A1F]/10 text-[#3B7A1F] font-bold text-xs flex items-center justify-center">
                ▲
              </div>
              <h3 className="font-bold text-sm text-[#1E2A3A]">1. Boost $1</h3>
              <p className="text-xs text-[#5A6878] leading-relaxed">
                Adds 1 point to your chain and moves it up the board. Attach a message to claim the top-backer slot.
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E2E4DC] p-4 rounded-xl space-y-2 shadow-2xs">
              <div className="w-7 h-7 rounded-md bg-[#B82E22]/10 text-[#B82E22] font-bold text-xs flex items-center justify-center">
                ▼
              </div>
              <h3 className="font-bold text-sm text-[#1E2A3A]">2. Sabotage $1</h3>
              <p className="text-xs text-[#5A6878] leading-relaxed">
                Removes 1 point from a rival chain to drag them down. Attach your roast to their activity log.
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E2E4DC] p-4 rounded-xl space-y-2 shadow-2xs">
              <div className="w-7 h-7 rounded-md bg-[#167A75]/10 text-[#167A75] font-bold text-xs flex items-center justify-center">
                🧾
              </div>
              <h3 className="font-bold text-sm text-[#1E2A3A]">3. Share the receipt</h3>
              <p className="text-xs text-[#5A6878] leading-relaxed">
                Get a thermal drive-thru receipt for every order. Share the link on X so your friends or rivals can respond.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Simulator (Section F8: Fixed to $1 matching live site) */}
        <section className="bg-[#FFFFFF] border border-[#E2E4DC] rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1E2A3A]">
                Try the controls
              </h2>
              <p className="text-xs text-[#5A6878]">
                Interactive demo — tests the ranking mechanics with zero real charges.
              </p>
            </div>
            <button
              onClick={resetSim}
              className="text-xs text-[#5A6878] hover:text-[#1E2A3A] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Simulator Display Card */}
          <div className="bg-[#F6F7F3] border border-[#E2E4DC] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-[#FFFFFF] border border-[#CBD2C4] flex items-center justify-center text-lg">
                🍔
              </div>
              <div>
                <div className="font-bold text-sm text-[#1E2A3A]">
                  Pixel Burger Joint
                </div>
                <div className="text-xs text-[#5A6878]">
                  Current standing: Rank #{simRank}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-between sm:justify-end">
              <div className="text-right">
                <div className="font-receipt text-lg font-bold text-[#1E2A3A]">
                  {simScore} points
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimBoost}
                  className="px-3 py-1.5 rounded-md bg-[#3B7A1F] hover:bg-[#2F6318] text-white text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <span>▲</span>
                  <span>Boost $1</span>
                </button>
                <button
                  onClick={handleSimSabotage}
                  className="px-3 py-1.5 rounded-md bg-[#B82E22] hover:bg-[#99251B] text-white text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <span>▼</span>
                  <span>Sabotage $1</span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-xs font-receipt text-[#5A6878] bg-[#EEF0EA] p-2.5 rounded-md">
            {simLog}
          </div>
        </section>

        {/* Questions FAQ (Section F12: titled 'Questions') */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#1E2A3A]">
            Questions
          </h2>

          <div className="space-y-2">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#FFFFFF] border border-[#E2E4DC] rounded-lg overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 flex items-center justify-between gap-4 font-bold text-sm text-[#1E2A3A] hover:bg-[#FAFBF9] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#7A8898] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#7A8898] flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-[#5A6878] leading-relaxed border-t border-[#F0F2EB]">
                      <p>{faq.a}</p>
                      {faq.hasAddButton && (
                        <button
                          onClick={() => setIsAddChainOpen(true)}
                          className="mt-3 px-3 py-1.5 rounded-md bg-[#167A75] text-white text-xs font-bold hover:bg-[#12625E] transition-colors cursor-pointer"
                        >
                          Suggest a chain
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Credits */}
        <section className="pt-4 border-t border-[#E2E4DC] text-xs text-[#5A6878] space-y-1">
          <p>
            Concept inspired by <a href="https://outbid.lol" target="_blank" rel="noopener noreferrer" className="text-[#167A75] font-bold hover:underline">Outbid.lol</a>. Built by <a href="https://x.com/vallabh_vy" target="_blank" rel="noopener noreferrer" className="text-[#167A75] font-bold hover:underline">@vallabh_vy</a>.
          </p>
          <p>
            Parody fan ranking under nominative fair use. Not affiliated with any restaurant corporation.
          </p>
        </section>
      </main>

      {/* Footer */}
      <DriveThruFooter onOpenFeedback={() => setIsFeedbackOpen(true)} />

      {/* Modals */}
      <AddChainModal
        isOpen={isAddChainOpen}
        onClose={() => setIsAddChainOpen(false)}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
}
