"use client";

import React, { useState, useMemo, useEffect } from "react";
import confetti from "canvas-confetti";
import { Search, PlusCircle, Flame, Skull, X, AlertTriangle } from "lucide-react";
import { FastFoodBrand, ActionType, Transaction, CRTColorTheme } from "@/types";
import { INITIAL_BRANDS, INITIAL_TRANSACTIONS } from "@/lib/initialData";
import { DriveThruHeader } from "@/components/DriveThruHeader";
import { BrandCard } from "@/components/BrandCard";
import { DriveThruModal } from "@/components/DriveThruModal";
import { ReceiptModal } from "@/components/ReceiptModal";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";
import { UserAvatar } from "@/components/UserAvatar";
import { sound } from "@/lib/sound";
import { validateContent } from "@/lib/moderation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function Home() {
  const [theme, setTheme] = useState<CRTColorTheme>("green");
  const [brands, setBrands] = useState<FastFoodBrand[]>(INITIAL_BRANDS);
  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<FastFoodBrand | null>(
    null,
  );
  const [orderAction, setOrderAction] = useState<ActionType>("BOOST");
  const [replyMessage, setReplyMessage] = useState("");

  // Receipt Modal State
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [lastRank, setLastRank] = useState<number>(1);

  // New Brand Modal State
  const [isAddChainOpen, setIsAddChainOpen] = useState(false);
  const [newChainName, setNewChainName] = useState("");
  const [newChainAction, setNewChainAction] = useState<ActionType>("BOOST");
  const [newChainAmount, setNewChainAmount] = useState<number>(2);
  const [newChainSlogan, setNewChainSlogan] = useState("");
  const [newChainNickname, setNewChainNickname] = useState("");
  const [newChainXHandle, setNewChainXHandle] = useState("");
  const [newChainError, setNewChainError] = useState<string | null>(null);

  // Sync with Supabase on mount & subscribe to Realtime if configured
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    // Fetch initial brands
    const fetchBrands = async () => {
      const { data, error } = await client.from("brands").select("*");
      if (data && !error && data.length > 0) {
        setBrands(
          data.map((row) => ({
            id: row.id,
            name: row.name,
            alias: row.alias,
            category: row.category,
            totalScore: row.total_score,
            totalBoosts: row.total_boosts,
            totalSabotages: row.total_sabotages,
            currentSlogan: row.current_slogan,
            sloganAuthor: row.slogan_author,
            updatedAt: "Live",
            clicks: row.clicks || 0,
            accentColor: row.accent_color || "#f59e0b",
          })),
        );
      }
    };

    // Fetch recent transactions
    const fetchTransactions = async () => {
      const { data, error } = await client
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (data && !error && data.length > 0) {
        setTransactions(
          data.map((row) => ({
            id: row.id,
            brandId: row.brand_id,
            brandName: row.brand_name,
            actionType: row.action_type as ActionType,
            amount: row.amount,
            message: row.message,
            author: row.author,
            timestamp: "Just now",
            receiptNumber: row.receipt_number,
          })),
        );
      }
    };

    fetchBrands();
    fetchTransactions();

    // Realtime channel
    const channel = client
      .channel("drive-thru-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "brands" },
        () => fetchBrands(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions" },
        () => fetchTransactions(),
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  // Sorted Brands by totalScore descending (excluding hidden/quarantined chains)
  const sortedBrands = useMemo(() => {
    return [...brands]
      .filter((b) => b.status !== "hidden")
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [brands]);

  // Total Warchest
  const totalWarchest = useMemo(() => {
    return brands.reduce((sum, b) => sum + Math.max(0, b.totalScore), 0);
  }, [brands]);

  // Filtered Brands
  const filteredBrands = useMemo(() => {
    return sortedBrands.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.currentSlogan.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [sortedBrands, searchQuery]);

  const handleOpenOrder = (
    brand: FastFoodBrand,
    action: ActionType,
    replyTo?: string,
  ) => {
    setSelectedBrand(brand);
    setOrderAction(action);
    setReplyMessage(replyTo || "");
    setIsOrderOpen(true);
  };

  const handleBrandClick = async (brandId: string) => {
    setBrands((prev) =>
      prev.map((b) => (b.id === brandId ? { ...b, clicks: b.clicks + 1 } : b)),
    );

    if (isSupabaseConfigured && supabase) {
      const b = brands.find((x) => x.id === brandId);
      if (b) {
        await supabase
          .from("brands")
          .update({ clicks: b.clicks + 1 })
          .eq("id", brandId);
      }
    }
  };

  const handleOrderSubmit = async (params: {
    brandId: string;
    actionType: ActionType;
    amount: number;
    message: string;
    author: string;
    location?: string;
  }) => {
    const previousLeader = sortedBrands[0];

    let newCalculatedRank = 1;

    setBrands((prev) => {
      const updated = prev.map((b) => {
        if (b.id !== params.brandId) return b;
        const newScore =
          params.actionType === "BOOST"
            ? b.totalScore + params.amount
            : b.totalScore - params.amount;

        return {
          ...b,
          totalScore: newScore,
          totalBoosts:
            params.actionType === "BOOST"
              ? b.totalBoosts + params.amount
              : b.totalBoosts,
          totalSabotages:
            params.actionType === "SABOTAGE"
              ? b.totalSabotages + params.amount
              : b.totalSabotages,
          currentSlogan: params.message,
          sloganAuthor: params.author,
          location: params.location || b.location,
          updatedAt: "Just now",
        };
      });

      const newSorted = [...updated].sort(
        (a, b) => b.totalScore - a.totalScore,
      );
      newCalculatedRank =
        newSorted.findIndex((b) => b.id === params.brandId) + 1;

      if (
        newSorted[0].id !== previousLeader.id &&
        newSorted[0].id === params.brandId
      ) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#39ff14", "#ffb000", "#ffffff"],
        });
      }

      return updated;
    });

    const targetBrand = brands.find((b) => b.id === params.brandId);
    const receiptNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      brandId: params.brandId,
      brandName: targetBrand?.name || "Unknown Brand",
      actionType: params.actionType,
      amount: params.amount,
      message: params.message,
      author: params.author,
      location: params.location,
      timestamp: "Just now",
      receiptNumber,
    };

    setTransactions((prev) => [newTx, ...prev.slice(0, 19)]);
    setIsOrderOpen(false);

    setActiveReceipt(newTx);
    setLastRank(newCalculatedRank);
    setIsReceiptOpen(true);

    // Persist to Supabase if keys exist
    if (isSupabaseConfigured && supabase && targetBrand) {
      const newScore =
        params.actionType === "BOOST"
          ? targetBrand.totalScore + params.amount
          : targetBrand.totalScore - params.amount;

      await supabase
        .from("brands")
        .update({
          total_score: newScore,
          total_boosts:
            params.actionType === "BOOST"
              ? targetBrand.totalBoosts + params.amount
              : targetBrand.totalBoosts,
          total_sabotages:
            params.actionType === "SABOTAGE"
              ? targetBrand.totalSabotages + params.amount
              : targetBrand.totalSabotages,
          current_slogan: params.message,
          slogan_author: params.author,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.brandId);

      await supabase.from("transactions").insert({
        brand_id: params.brandId,
        brand_name: targetBrand.name,
        action_type: params.actionType,
        amount: params.amount,
        message: params.message,
        author: params.author,
        receipt_number: receiptNumber,
      });
    }
  };

  const handleAddNewChain = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanX = newChainXHandle.trim().replace(/^@/, "");
    const cleanNick = newChainNickname.trim();
    if (!newChainName.trim() || (!cleanX && !cleanNick)) return;

    const finalizedAuthor = cleanX ? `@${cleanX}` : cleanNick;

    const finalizedMessage =
      newChainSlogan.trim() ||
      (newChainAction === "BOOST"
        ? "Inaugural boost on the board."
        : "Inaugural sabotage into the abyss.");

    // Automated Content Moderation Gate
    const brandValidation = validateContent(newChainName.trim(), "brand");
    if (!brandValidation.isValid) {
      setNewChainError(brandValidation.reason || "Invalid brand name.");
      sound.playSabotageBuzzer();
      return;
    }

    const sloganValidation = validateContent(finalizedMessage, "message");
    if (!sloganValidation.isValid) {
      setNewChainError(sloganValidation.reason || "Inappropriate slogan or note.");
      sound.playSabotageBuzzer();
      return;
    }

    if (cleanNick) {
      const authorValidation = validateContent(cleanNick, "author");
      if (!authorValidation.isValid) {
        setNewChainError(authorValidation.reason || "Invalid nickname format.");
        sound.playSabotageBuzzer();
        return;
      }
    }

    setNewChainError(null);

    if (newChainAction === "BOOST") {
      sound.playCashRegister();
    } else {
      sound.playSabotageBuzzer();
    }

    const id = newChainName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const initialScore =
      newChainAction === "BOOST" ? newChainAmount : -newChainAmount;

    const newBrand: FastFoodBrand = {
      id,
      name: newChainName.trim(),
      category: "Burgers",
      totalScore: initialScore,
      totalBoosts: newChainAction === "BOOST" ? newChainAmount : 0,
      totalSabotages: newChainAction === "SABOTAGE" ? newChainAmount : 0,
      currentSlogan: finalizedMessage,
      sloganAuthor: finalizedAuthor,
      updatedAt: "Just now",
      clicks: 1,
      accentColor: newChainAction === "BOOST" ? "#10b981" : "#f43f5e",
    };

    setBrands((prev) => [...prev, newBrand]);
    setIsAddChainOpen(false);
    setNewChainName("");
    setNewChainSlogan("");
    setNewChainNickname("");
    setNewChainXHandle("");
    setNewChainAmount(2);
    setNewChainAction("BOOST");

    const receiptNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      brandId: id,
      brandName: newBrand.name,
      actionType: newChainAction,
      amount: newChainAmount,
      message: finalizedMessage,
      author: finalizedAuthor,
      timestamp: "Just now",
      receiptNumber,
    };
    setTransactions((prev) => [newTx, ...prev]);
    setActiveReceipt(newTx);
    setLastRank(brands.length + 1);
    setIsReceiptOpen(true);

    if (isSupabaseConfigured && supabase) {
      await supabase.from("brands").insert({
        id,
        name: newBrand.name,
        category: newBrand.category,
        total_score: initialScore,
        total_boosts: newBrand.totalBoosts,
        total_sabotages: newBrand.totalSabotages,
        current_slogan: newBrand.currentSlogan,
        slogan_author: newBrand.sloganAuthor,
        clicks: 1,
        accent_color: newBrand.accentColor,
      });

      await supabase.from("transactions").insert({
        brand_id: id,
        brand_name: newBrand.name,
        action_type: newChainAction,
        amount: newChainAmount,
        message: newBrand.currentSlogan,
        author: newBrand.sloganAuthor,
        receipt_number: receiptNumber,
      });
    }
  };

  const isGreen = theme === "green";
  const screenBg = isGreen ? "crt-screen" : "crt-amber-screen";

  return (
    <div
      className={`min-h-screen ${screenBg} relative flex flex-col justify-between`}
    >
      {/* Scanline overlay */}
      <div className="fixed inset-0 scanlines pointer-events-none z-40 opacity-75" />

      {/* Header */}
      <DriveThruHeader
        theme={theme}
        setTheme={setTheme}
        recentTransactions={transactions}
        totalWarchest={totalWarchest}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full relative z-10">
        {/* Search Bar & Add Missing Chain */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chain or roast note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
            />
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setIsAddChainOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold cursor-pointer whitespace-nowrap text-xs transition-colors shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            SUBMIT MISSING CHAIN
          </button>
        </div>

        {/* The Leaderboard Grid / Rows */}
        <div className="space-y-2.5">
          {filteredBrands.map((brand) => {
            const actualRank =
              sortedBrands.findIndex((b) => b.id === brand.id) + 1;
            return (
              <BrandCard
                key={brand.id}
                brand={brand}
                rank={actualRank}
                comments={transactions.filter((tx) => tx.brandId === brand.id)}
                onOpenOrder={handleOpenOrder}
                onBrandClick={handleBrandClick}
                onReceiptClick={(tx) => {
                  setActiveReceipt(tx);
                  const rankIndex =
                    sortedBrands.findIndex((b) => b.id === tx.brandId) + 1;
                  setLastRank(rankIndex > 0 ? rankIndex : actualRank);
                  setIsReceiptOpen(true);
                }}
                theme={theme}
              />
            );
          })}

          {filteredBrands.length === 0 && (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg">
              <p className="text-zinc-500 font-mono text-sm">
                No result found matching &quot;{searchQuery}&quot;.
              </p>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsAddChainOpen(true);
                }}
                className="mt-3 px-4 py-2 bg-zinc-900 border border-zinc-700 text-white text-xs font-bold rounded cursor-pointer hover:bg-zinc-800"
              >
                Add &quot;{searchQuery}&quot; to the Board ($2)
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Order Intercom Modal */}
      <DriveThruModal
        key={
          selectedBrand
            ? `${selectedBrand.id}-${orderAction}-${replyMessage}`
            : "none"
        }
        brand={selectedBrand}
        initialAction={orderAction}
        initialMessage={replyMessage}
        isOpen={isOrderOpen}
        onClose={() => {
          setIsOrderOpen(false);
          setReplyMessage("");
        }}
        onSubmit={handleOrderSubmit}
        theme={theme}
      />

      {/* Greasy Digital Receipt Modal */}
      <ReceiptModal
        transaction={activeReceipt}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        brandRank={lastRank}
      />

      {/* Add Missing Chain Modal */}
      {isAddChainOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`relative bg-[#0b100d] border-2 ${
              newChainAction === "BOOST"
                ? "border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                : "border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.2)]"
            } rounded-xl max-w-md w-full font-mono text-white shadow-2xl p-4 sm:p-5`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-tight flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                ADD MISSING FAST FOOD CHAIN
              </h3>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsAddChainOpen(false);
                }}
                className="text-zinc-500 hover:text-white cursor-pointer p-1"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddNewChain}>
              {newChainError && (
                <div className="mb-2.5 p-2 rounded bg-rose-950/80 border border-rose-500/80 flex items-center gap-1.5 text-xs text-rose-300 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span className="font-bold">{newChainError}</span>
                </div>
              )}

              {/* Brand Name Input */}
              <div className="mb-2.5">
                <label className="block text-[10px] uppercase text-zinc-400 font-bold mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Whataburger"
                  value={newChainName}
                  onChange={(e) => setNewChainName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>

              {/* Action Toggle: BOOST vs SABOTAGE */}
              <div className="grid grid-cols-2 gap-2 mb-2.5">
                <button
                  type="button"
                  onClick={() => {
                    sound.playDriveThruChime();
                    setNewChainAction("BOOST");
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border font-bold text-xs uppercase transition-all cursor-pointer ${
                    newChainAction === "BOOST"
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                      : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 bg-zinc-950/60"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  BOOST (+${newChainAmount})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playSabotageBuzzer();
                    setNewChainAction("SABOTAGE");
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border font-bold text-xs uppercase transition-all cursor-pointer ${
                    newChainAction === "SABOTAGE"
                      ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                      : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 bg-zinc-950/60"
                  }`}
                >
                  <Skull className="w-3.5 h-3.5" />
                  SABOTAGE (-${newChainAmount})
                </button>
              </div>

              {/* Amount Selection */}
              <div className="grid grid-cols-4 gap-2 mb-2.5">
                {[1, 2, 5, 10].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setNewChainAmount(val);
                    }}
                    className={`py-1 rounded border font-mono font-bold text-xs transition-all cursor-pointer ${
                      newChainAmount === val
                        ? newChainAction === "BOOST"
                          ? "bg-emerald-500 border-emerald-400 text-black font-extrabold"
                          : "bg-rose-600 border-rose-500 text-white font-extrabold"
                        : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    {newChainAction === "BOOST" ? `+$${val}` : `-$${val}`}
                  </button>
                ))}
              </div>

              {/* Slogan / Roast Input */}
              <div className="mb-2.5">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] uppercase text-zinc-400 font-bold">
                    {newChainAction === "BOOST" ? "Inaugural Note" : "Inaugural Roast"}
                  </label>
                  <span className="text-[9px] text-zinc-500">
                    {40 - newChainSlogan.length} chars
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={40}
                  placeholder={
                    newChainAction === "BOOST"
                      ? "e.g. Best butter buns on planet earth"
                      : "e.g. Cardboard fries and cold burgers"
                  }
                  value={newChainSlogan}
                  onChange={(e) => setNewChainSlogan(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>

              {/* Identity (Name OR X Handle) */}
              <div className="mb-3.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase mb-1">
                  <span>Your Identity *</span>
                  <span className="text-zinc-500 font-normal">Name OR X Handle</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    maxLength={30}
                    required={!newChainXHandle.trim()}
                    placeholder="Name / Nickname"
                    value={newChainNickname}
                    onChange={(e) => setNewChainNickname(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
                  />

                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs select-none">
                      @
                    </span>
                    <input
                      type="text"
                      maxLength={25}
                      required={!newChainNickname.trim()}
                      placeholder="handle"
                      value={newChainXHandle.replace(/^@/, "")}
                      onChange={(e) => setNewChainXHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded pl-6 pr-8 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
                    />
                    {newChainXHandle.trim() && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                        <UserAvatar handle={newChainXHandle} size="xs" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Zero Tolerance Notice */}
              <p className="text-[9px] text-zinc-500 mb-2 leading-tight">
                *Conduct: Fake brands, hate speech, slurs, doxxing, or harassment are purged immediately with no refund.
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-2.5 font-bold text-xs sm:text-sm uppercase rounded-lg cursor-pointer transition-colors shadow-lg ${
                  newChainAction === "BOOST"
                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
                    : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
                }`}
              >
                PAY ${newChainAmount} &amp;{" "}
                {newChainAction === "BOOST" ? "BOOST" : "SABOTAGE"} (
                {newChainAction === "BOOST" ? `+$${newChainAmount}` : `-$${newChainAmount}`})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Legal & Parody Protection Disclaimer */}
      <LegalDisclaimer theme={theme} />
    </div>
  );
}
