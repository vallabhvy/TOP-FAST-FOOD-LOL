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
import { Logo } from "@/components/Logo";

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
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Header */}
      <header className="border-b border-white/[0.08] bg-[#0A0E1A]/75 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-amber-400 rounded-xl blur-md opacity-30 group-hover:opacity-70 transition-opacity" />
              <Logo className="w-8 h-8 relative" size={32} />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              topfastfood<span className="text-cyan-400">.lol</span>
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-pill text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Back to ranking</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12 flex-1 w-full space-y-10">
        {/* Intro */}
        <section className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold tracking-wide">
            <span>⚡ THE LIVE INTERNET DRIVE-THRU</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            How it works
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            The internet&apos;s fast food ranking, settled in dollars. No critics, no sponsored reviews, no corporate PR. Fans vote with $1 micro-tips to crown their favourite drive-thru or roast their rivals.
          </p>
        </section>

        {/* The Core Mechanics in 3 Steps */}
        <section className="space-y-4">
          <h2 className="text-lg font-extrabold text-white tracking-tight">
            Three simple rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-2xl space-y-3 border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-black text-xs flex items-center justify-center">
                ▲
              </div>
              <h3 className="font-extrabold text-sm text-white">1. Boost $1</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Adds 1 point to your chain and moves it up the board. Attach a message to claim the top-backer slot.
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-3 border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 font-black text-xs flex items-center justify-center">
                ▼
              </div>
              <h3 className="font-extrabold text-sm text-white">2. Sabotage $1</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Removes 1 point from a rival chain to drag them down. Attach your roast to their activity log.
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-3 border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-black text-xs flex items-center justify-center">
                🧾
              </div>
              <h3 className="font-extrabold text-sm text-white">3. Share the receipt</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Get a thermal drive-thru receipt for every order. Share the link on X so your friends or rivals can respond.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Simulator (Section F8: Fixed to $1 matching live site) */}
        <section className="glass-panel rounded-2xl p-5 sm:p-7 space-y-4 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Try the controls
              </h2>
              <p className="text-xs text-slate-300">
                Interactive demo — tests the ranking mechanics with zero real charges.
              </p>
            </div>
            <button
              onClick={resetSim}
              className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer glass-pill px-2.5 py-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Simulator Display Card */}
          <div className="bg-slate-950/70 border border-white/10 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-xl shadow-inner">
                🍔
              </div>
              <div>
                <div className="font-black text-sm text-white">
                  Pixel Burger Joint
                </div>
                <div className="text-xs text-amber-300 font-semibold">
                  Current standing: Rank #{simRank}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 justify-between sm:justify-end">
              <div className="text-right">
                <div className="font-receipt text-xl font-black text-white">
                  {simScore} <span className="text-xs font-medium text-slate-400 uppercase">points</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimBoost}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                >
                  <span>▲</span>
                  <span>Boost $1</span>
                </button>
                <button
                  onClick={handleSimSabotage}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(244,63,94,0.35)]"
                >
                  <span>▼</span>
                  <span>Sabotage $1</span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-xs font-mono text-cyan-300 bg-slate-950/80 border border-white/10 p-3 rounded-xl">
            {simLog}
          </div>
        </section>

        {/* Questions FAQ (Section F12: titled 'Questions') */}
        <section className="space-y-4">
          <h2 className="text-lg font-extrabold text-white tracking-tight">
            Questions
          </h2>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="glass-card border border-white/[0.08] rounded-xl overflow-hidden transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4.5 flex items-center justify-between gap-4 font-bold text-sm text-white hover:bg-white/[0.03] cursor-pointer transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4.5 pb-4.5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/[0.08]">
                      <p>{faq.a}</p>
                      {faq.hasAddButton && (
                        <button
                          onClick={() => setIsAddChainOpen(true)}
                          className="mt-3 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.35)] cursor-pointer"
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
        <section className="pt-4 border-t border-white/[0.08] text-xs text-slate-400 space-y-1.5">
          <p>
            Concept inspired by <a href="https://outbid.lol" target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-semibold hover:underline">Outbid.lol</a>. Built by <a href="https://x.com/vallabh_vy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-semibold hover:underline">@vallabh_vy</a>.
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
