"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Flame,
  Skull,
  Receipt,
  HelpCircle,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Plus,
} from "lucide-react";
import { sound } from "@/lib/sound";
import { AddChainModal } from "@/components/AddChainModal";

export default function AboutClient() {
  const [isMuted, setIsMuted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0); // first open by default
  const [isAddChainOpen, setIsAddChainOpen] = useState(false);

  // Interactive Simulator state
  const [simBrand, setSimBrand] = useState("Pixel Burger Joint");
  const [simScore, setSimScore] = useState(120);
  const [simRank, setSimRank] = useState(2);
  const [simLog, setSimLog] = useState<string>(
    "Click BOOST or SABOTAGE to test the controls!",
  );
  const [simLastAction, setSimLastAction] = useState<
    "BOOST" | "SABOTAGE" | null
  >(null);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
    if (!nextMuted) {
      sound.playDriveThruChime();
    }
  };

  const handleSimBoost = () => {
    sound.playCashRegister();
    setSimScore((s) => s + 5);
    setSimRank(1);
    setSimLastAction("BOOST");
    setSimLog("🔥 +$5 BOOST! Pixel Burger surged up to Rank #1!");
  };

  const handleSimSabotage = () => {
    sound.playSabotageBuzzer();
    setSimScore((s) => Math.max(0, s - 5));
    setSimRank(3);
    setSimLastAction("SABOTAGE");
    setSimLog(
      "💀 -$5 SABOTAGE! Someone called the fries cold! Dropped to Rank #3!",
    );
  };

  const resetSim = () => {
    sound.playClick();
    setSimScore(120);
    setSimRank(2);
    setSimLastAction(null);
    setSimLog("Simulator reset. Ready for your order!");
  };

  const faqs = [
    {
      q: "Will actual food arrive at my house if I use this site?",
      a: "Nope! No scooters or delivery bags are coming to your door. TOPFASTFOOD.LOL is a live gaming scoreboard and comedy poll. It's built for bragging rights and defending your favorite snacks. If you're actually hungry, you'll still need to visit a real drive-thru!",
      icon: "🚗",
    },
    {
      q: "Why are people boosting and sabotaging restaurants?",
      a: "Because arguing about who makes the best French fries is one of the most intense debates on earth! Instead of just arguing in comment sections, this site gives you a live scoreboard where fans can push their favorite chain to #1 or push their rival down.",
      icon: "🍟",
    },
    {
      q: "What does 'Boost' and 'Sabotage' mean?",
      a: "Think of it like a video game health bar: BOOST (+) gives points to a restaurant so it climbs higher on the leaderboard. SABOTAGE (-) takes points away from a restaurant to drop its rank. The restaurant with the highest score sits proudly at #1.",
      icon: "⚡",
    },
    {
      q: "What is the 'Intercom Message' and 'Receipt'?",
      a: "Whenever you boost or sabotage, you get to speak into the virtual 'Drive-Thru Speaker' and leave a message (like 'Extra crispy fries forever!' or 'Your milkshake machine never works!'). The system then prints out a greasy retro pixel-art receipt that you can save or post on Twitter/X to flex your victory.",
      icon: "🧾",
    },
    {
      q: "Can I use the site for free?",
      a: "YES! Browsing the live leaderboard, reading the hilarious roast messages, inspecting restaurant battle stats, and listening to the retro diner arcade audio is 100% free.",
      icon: "🎉",
    },
    {
      q: "How do I log in with Twitter / X?",
      a: "Just click the 'LOGIN' button at the top of the page. It connects with your X account so your actual username and avatar appear on your receipts and intercom messages instead of being anonymous.",
      icon: "🐦",
    },
    {
      q: "What if my favorite fast food place is missing?",
      a: "You can click '+ ADD A CHAIN' directly next to the search bar on the home page or click the button below! All submissions will be reviewed by our team first to prevent troll entries, duplicates, or spam before going live on the official leaderboard.",
      icon: "➕",
      hasAddButton: true,
    },
  ];

  return (
    <div className="min-h-screen crt-screen text-zinc-100 flex flex-col font-mono relative selection:bg-emerald-500 selection:text-black">
      {/* Scanline overlay */}
      <div className="fixed inset-0 scanlines pointer-events-none z-40 opacity-75" />

      {/* Retro Navigation Header */}
      <header className="border-b border-[#39ff14]/30 bg-black/85 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            onClick={() => sound.playClick()}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <img
              src="/logo.jpg"
              alt="TOPFASTFOOD.LOL Logo"
              className="w-10 h-10 object-contain rounded border border-zinc-800 group-hover:border-emerald-400 transition-colors"
            />
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tighter text-[#39ff14] glow-green font-mono leading-none">
                TOPFASTFOOD<span className="text-white">.LOL</span>
              </span>
              <span className="text-[10px] text-zinc-500 tracking-wider">
                DRIVE-THRU TURF WAR
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="p-1.5 rounded border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer"
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
              aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            <Link
              href="/"
              onClick={() => sound.playClick()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 transition-all font-bold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>BACK TO LEADERBOARD</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-10 flex-1 w-full space-y-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white glow-green">
            WHAT IS <span className="text-[#39ff14]">TOPFASTFOOD.LOL</span>?
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans">
            Imagine an online video game arcade where every fast food restaurant
            in the world is thrown into a giant wrestling arena. There are{" "}
            <strong>zero food critics in fancy suits</strong>, and{" "}
            <strong>no fake reviews</strong>. Instead, real people use quick
            votes and micro-tips to decide who wears the{" "}
            <strong>#1 crown</strong>!
          </p>
        </div>

        {/* 4 Super Simple Steps Card Grid */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              HOW THE GAME WORKS IN 4 EASY STEPS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1 */}
            <div className="bg-zinc-950/90 border border-zinc-800 hover:border-emerald-500/40 p-5 rounded-lg transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-amber-400 font-bold">
                  STEP 01
                </span>
                <span className="text-2xl">🍔</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Pick Your Fast Food Champion
              </h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Are you loyal to McDonald&apos;s salty fries, Wendy&apos;s spicy
                nuggets, Taco Bell&apos;s late-night burritos, or Chick-fil-A?
                Find your favorite restaurant on the live ranking board.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-zinc-950/90 border border-zinc-800 hover:border-emerald-500/40 p-5 rounded-lg transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-emerald-400 font-bold">
                  STEP 02
                </span>
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Boost It (+) OR Sabotage It (-)
              </h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                <span className="text-emerald-400 font-bold">BOOST (+)</span>{" "}
                gives your chain points to launch it up toward #1.
                <br />
                <span className="text-rose-400 font-bold">
                  SABOTAGE (-)
                </span>{" "}
                takes points away from a rival to pull them down the
                leaderboard!
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-zinc-950/90 border border-zinc-800 hover:border-emerald-500/40 p-5 rounded-lg transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-sky-400 font-bold">
                  STEP 03
                </span>
                <span className="text-2xl">📢</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Shout Into the Drive-Thru Speaker
              </h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Whenever you order, type a funny note or roast. It broadcasts
                across the top of the website on the live intercom ticker for
                everyone on the internet to see.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-zinc-950/90 border border-zinc-800 hover:border-emerald-500/40 p-5 rounded-lg transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-purple-400 font-bold">
                  STEP 04
                </span>
                <span className="text-2xl">🧾</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Get Your Greasy Digital Receipt
              </h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                The virtual retro thermal printer spits out an official
                pixel-art receipt with your rank, order number, and roast. You
                can download it or share it on X!
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Try-It-Now Simulator Sandbox */}
        <section className="bg-zinc-950 border-2 border-dashed border-[#39ff14]/30 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div>
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> INTERACTIVE TEST SIMULATOR
              </span>
              <h3 className="text-xl font-bold text-white uppercase mt-0.5">
                TRY THE CONTROLS YOURSELF
              </h3>
            </div>
            <button
              onClick={resetSim}
              className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset Simulator
            </button>
          </div>

          <p className="text-xs text-zinc-400 font-sans">
            Try clicking the <strong>BOOST</strong> and{" "}
            <strong>SABOTAGE</strong> buttons below to see how points and ranks
            update in real time:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Mock Chain Card */}
            <div className="md:col-span-2 bg-black border border-zinc-800 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div
                  className={`w-10 h-10 rounded flex items-center justify-center font-bold text-base transition-colors ${
                    simRank === 1
                      ? "bg-amber-400 text-black border border-amber-300 shadow-md shadow-amber-500/20"
                      : "bg-zinc-900 text-zinc-400 border border-zinc-700"
                  }`}
                >
                  #{simRank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {simBrand}
                    </span>
                    {simRank === 1 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold">
                        👑 #1 KING
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                    <span>
                      Warchest:{" "}
                      <strong className="text-emerald-400">${simScore}</strong>
                    </span>
                    <span>•</span>
                    <span className="text-zinc-500">Demo Mode</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleSimBoost}
                  className="flex-1 sm:flex-initial px-3 py-2 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all shadow-sm shadow-emerald-900/50"
                >
                  <Flame className="w-3.5 h-3.5 fill-emerald-400" />+ BOOST ($5)
                </button>
                <button
                  onClick={handleSimSabotage}
                  className="flex-1 sm:flex-initial px-3 py-2 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500 text-rose-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all shadow-sm shadow-rose-900/50"
                >
                  <Skull className="w-3.5 h-3.5" />- SABOTAGE ($5)
                </button>
              </div>
            </div>

            {/* Live Terminal Log readout */}
            <div className="bg-black/90 border border-zinc-800 p-3 rounded-lg text-[11px] h-full flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">
                  &gt; DRIVE-THRU INTERCOM FEED
                </span>
                <p
                  className={`transition-colors font-mono ${
                    simLastAction === "BOOST"
                      ? "text-emerald-400"
                      : simLastAction === "SABOTAGE"
                        ? "text-rose-400"
                        : "text-zinc-400"
                  }`}
                >
                  {simLog}
                </p>
              </div>
              <div className="text-[10px] text-zinc-600 mt-2">
                SFX: Synthesized 8-Bit Web Audio
              </div>
            </div>
          </div>
        </section>

        {/* FAQ - Explain Like I'm 12 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
            <HelpCircle className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              QUESTIONS A 12-YEAR-OLD (OR YOUR GRANDMA) MIGHT ASK
            </h2>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => {
                      sound.playClick();
                      setOpenFaq(isOpen ? null : index);
                    }}
                    className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 text-sm font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base">{faq.icon}</span>
                      <span>{faq.q}</span>
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-zinc-300 font-sans leading-relaxed border-t border-zinc-900 bg-zinc-900/20">
                      <div>{faq.a}</div>
                      {faq.hasAddButton && (
                        <div className="pt-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setIsAddChainOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 font-mono text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ PROPOSE A CHAIN FOR REVIEW</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Big Retro CTA Banner */}
        <section className="text-center py-10 px-6 rounded-xl border border-emerald-500/40 bg-gradient-to-b from-zinc-950 to-black space-y-4 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-white tracking-tight glow-green">
            READY TO JOIN THE DRIVE-THRU TURF WAR?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto font-sans">
            Jump in now, check out who is winning #1, and make sure your
            favorite fast food doesn&apos;t get dethroned!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              onClick={() => sound.playClick()}
              className="w-full sm:w-auto px-6 py-3 rounded bg-[#39ff14] hover:bg-[#32e012] text-black font-extrabold text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              🍔 ENTER THE DRIVE-THRU NOW
            </Link>
            <Link
              href="/#leaderboard"
              onClick={() => sound.playClick()}
              className="w-full sm:w-auto px-5 py-3 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
            >
              👑 VIEW LIVE LEADERBOARD
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black py-6 px-4 text-center text-xs text-zinc-600 font-mono">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            © {new Date().getFullYear()} TOPFASTFOOD.LOL • The Petty Drive-Thru
            Turf War
          </span>
          <div className="flex items-center gap-4 text-zinc-500">
            <Link href="/" className="hover:text-emerald-400 transition-colors">
              Leaderboard
            </Link>
            <Link href="/about" className="text-emerald-400 font-bold">
              About
            </Link>
          </div>
        </div>
      </footer>
      {/* Propose Chain Modal */}
      <AddChainModal
        isOpen={isAddChainOpen}
        onClose={() => setIsAddChainOpen(false)}
      />
    </div>
  );
}
