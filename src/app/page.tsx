"use client";

import React, { useState, useMemo, useEffect } from "react";
import confetti from "canvas-confetti";
import { Search } from "lucide-react";
import { FastFoodBrand, ActionType, Transaction } from "@/types";
import { INITIAL_BRANDS, INITIAL_TRANSACTIONS } from "@/lib/initialData";
import { DriveThruHeader } from "@/components/DriveThruHeader";
import { NumberOneSign } from "@/components/NumberOneSign";
import { ChainRow } from "@/components/ChainRow";
import { LiveTicker } from "@/components/LiveTicker";
import { DriveThruModal } from "@/components/DriveThruModal";
import { ReceiptModal } from "@/components/ReceiptModal";
import { AddChainModal } from "@/components/AddChainModal";
import { FeedbackModal } from "@/components/FeedbackModal";
import { DriveThruFooter } from "@/components/DriveThruFooter";
import { sound } from "@/lib/sound";
import { validateContent } from "@/lib/moderation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const CUISINE_TAGS = [
  "All",
  "Burgers",
  "Chicken",
  "Mexican",
  "Pizza",
  "Sandwiches",
  "Late Night",
  "Dessert",
];

export default function Home() {
  const [brands, setBrands] = useState<FastFoodBrand[]>(INITIAL_BRANDS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");

  // Modal State
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<FastFoodBrand | null>(null);
  const [orderAction, setOrderAction] = useState<ActionType>("BOOST");

  // Receipt Modal State
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [lastRank, setLastRank] = useState<number>(1);

  // Add Chain & Feedback State
  const [isAddChainOpen, setIsAddChainOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Payment success toast state
  const [paymentToast, setPaymentToast] = useState<string | null>(null);

  // Handle ?payment=success return URL from Dodo Payments checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      setPaymentToast("Payment successful! Your boost/sabotage is recorded.");
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#3B7A1F", "#167A75", "#FFB000", "#1E2A3A"],
      });
      sound.playCashRegister();

      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);

      const timer = setTimeout(() => setPaymentToast(null), 8000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Sync with Supabase on mount & subscribe to Realtime if configured
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

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
            accentColor: row.accent_color || "#3B7A1F",
            status: row.status || "approved",
          }))
        );
      }
    };

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
            likes: row.likes || 0,
            dislikes: row.dislikes || 0,
          }))
        );
      }
    };

    fetchBrands();
    fetchTransactions();

    const channel = client
      .channel("public-db-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "brands" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const updated = payload.new;
            setBrands((prev) =>
              prev.map((b) =>
                b.id === updated.id
                  ? {
                      ...b,
                      totalScore: updated.total_score,
                      totalBoosts: updated.total_boosts,
                      totalSabotages: updated.total_sabotages,
                      currentSlogan: updated.current_slogan,
                      sloganAuthor: updated.slogan_author,
                      updatedAt: "Just now",
                    }
                  : b
              )
            );
          } else if (payload.eventType === "INSERT") {
            const newRow = payload.new;
            setBrands((prev) => [
              ...prev,
              {
                id: newRow.id,
                name: newRow.name,
                alias: newRow.alias,
                category: newRow.category,
                totalScore: newRow.total_score || 0,
                totalBoosts: newRow.total_boosts || 0,
                totalSabotages: newRow.total_sabotages || 0,
                currentSlogan: newRow.current_slogan,
                sloganAuthor: newRow.slogan_author,
                updatedAt: "Just now",
                clicks: 0,
                accentColor: newRow.accent_color || "#3B7A1F",
                status: newRow.status || "approved",
              },
            ]);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions" },
        (payload) => {
          const newRow = payload.new;
          setTransactions((prev) => [
            {
              id: newRow.id,
              brandId: newRow.brand_id,
              brandName: newRow.brand_name,
              actionType: newRow.action_type as ActionType,
              amount: newRow.amount,
              message: newRow.message,
              author: newRow.author,
              timestamp: "Just now",
              receiptNumber: newRow.receipt_number,
              likes: newRow.likes || 0,
              dislikes: newRow.dislikes || 0,
            },
            ...prev.slice(0, 19),
          ]);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  // Sorted Brands (Leaderboard order)
  const sortedBrands = useMemo(() => {
    return [...brands].sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      // Tie breaker: If all at 0 or same score, sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }, [brands]);

  // #1 Leader chain (has score > 0 or top of sorted list)
  const leaderChain = sortedBrands.length > 0 ? sortedBrands[0] : null;
  const isLeaderClaimed = leaderChain && (leaderChain.totalScore > 0 || leaderChain.totalBoosts > 0);

  // Filtered Brands
  const filteredBrands = useMemo(() => {
    let result = sortedBrands;

    // Filter by cuisine tag
    if (selectedCuisine !== "All") {
      result = result.filter(
        (b) => b.category.toLowerCase() === selectedCuisine.toLowerCase()
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          (b.alias && b.alias.toLowerCase().includes(q)) ||
          b.currentSlogan.toLowerCase().includes(q)
      );
    } else if (isLeaderClaimed && selectedCuisine === "All") {
      // Per Section 4.4 & F5: Remove #1 duplicate when #1 is featured in the sign
      result = result.filter((b) => b.id !== leaderChain?.id);
    }

    return result;
  }, [sortedBrands, searchQuery, selectedCuisine, isLeaderClaimed, leaderChain?.id]);

  const handleOpenOrder = (brand: FastFoodBrand, action: ActionType) => {
    sound.playClick();
    setSelectedBrand(brand);
    setOrderAction(action);
    setIsOrderOpen(true);
  };

  const handleBrandClick = (brandId: string) => {
    window.location.href = `/chain/${brandId}`;
  };

  const handleOrderSubmit = async (params: {
    brandId: string;
    actionType: ActionType;
    amount: number;
    message: string;
    author: string;
    location?: string;
  }) => {
    const msgValidation = validateContent(params.message, "message");
    if (!msgValidation.isValid) return msgValidation.reason || "Invalid message.";

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: params.brandId,
          actionType: params.actionType,
          amount: params.amount,
          message: params.message,
          author: params.author,
          location: params.location,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return data.error || "Server rejected the order. Please try again.";
      }

      if (data.paymentLink) {
        window.location.href = data.paymentLink;
        return;
      }
    } catch {
      // Fallback
    }

    // Optimistic state update for demo
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
          updatedAt: "Just now",
        };
      });

      const newSorted = [...updated].sort((a, b) => b.totalScore - a.totalScore);
      newCalculatedRank = newSorted.findIndex((b) => b.id === params.brandId) + 1;
      return updated;
    });

    const targetBrand = brands.find((b) => b.id === params.brandId);
    const receiptNumber = `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const newTx: Transaction = {
      id: `tx-${crypto.randomUUID()}`,
      brandId: params.brandId,
      brandName: targetBrand?.name || "Unknown Brand",
      actionType: params.actionType,
      amount: params.amount,
      message: params.message,
      author: params.author,
      timestamp: "Just now",
      receiptNumber,
    };

    setTransactions((prev) => [newTx, ...prev.slice(0, 19)]);
    setIsOrderOpen(false);

    setActiveReceipt(newTx);
    setLastRank(newCalculatedRank);
    setIsReceiptOpen(true);

    return undefined;
  };

  return (
    <div className="min-h-screen bg-[#F6F7F3] text-[#1E2A3A] flex flex-col justify-between font-sans">
      {/* Payment Success Notification Toast */}
      {paymentToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#3B7A1F] text-white px-5 py-3 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2 animate-slide-up">
          <span>✓</span>
          <span>{paymentToast}</span>
        </div>
      )}

      {/* Header */}
      <DriveThruHeader recentTransactions={transactions} />

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8 flex-1 w-full">
        {/* Rule Headline (Section 4.4 & 5.2) */}
        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E2A3A] tracking-tight">
            The internet&apos;s fast food ranking, settled in dollars.
          </h1>
          <p className="text-sm sm:text-base text-[#5A6878] mt-1 font-medium">
            $1 pushes your chain up a point. $1 pushes a rival down one.
          </p>

          {/* Search Field */}
          <div className="relative mt-4 max-w-xl">
            <Search className="w-4 h-4 text-[#7A8898] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Find your chain (e.g. McDonald's, Taco Bell, Wendy's)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#CBD2C4] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#1E2A3A] placeholder-[#9AA5B1] focus:outline-none focus:border-[#167A75] focus:ring-1 focus:ring-[#167A75] shadow-2xs"
            />
          </div>
        </div>

        {/* #1 Marquee Sign (Section 4.4) - Amber Sign */}
        {!searchQuery && selectedCuisine === "All" && (
          <NumberOneSign
            leader={leaderChain}
            onOpenOrder={handleOpenOrder}
            onBrandClick={handleBrandClick}
          />
        )}

        {/* Cuisine Filter Chips (Section 5.2) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {CUISINE_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                sound.playClick();
                setSelectedCuisine(tag);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCuisine === tag
                  ? "bg-[#1E2A3A] text-white border-[#1E2A3A]"
                  : "bg-[#FFFFFF] text-[#5A6878] border-[#E2E4DC] hover:border-[#CBD2C4] hover:text-[#1E2A3A]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* The Leaderboard List (One row per chain) */}
        <div className="space-y-2">
          {filteredBrands.map((brand) => {
            const actualRank = sortedBrands.findIndex((b) => b.id === brand.id) + 1;
            const isTied =
              sortedBrands.filter((b) => b.totalScore === brand.totalScore).length > 1;

            return (
              <ChainRow
                key={brand.id}
                brand={brand}
                rank={actualRank}
                isTied={isTied}
                onOpenOrder={handleOpenOrder}
              />
            );
          })}

          {filteredBrands.length === 0 && (
            <div className="text-center py-12 bg-[#FFFFFF] border border-dashed border-[#CBD2C4] rounded-lg">
              <p className="text-[#5A6878] text-sm">
                No restaurant found matching &quot;{searchQuery}&quot;.
              </p>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsAddChainOpen(true);
                }}
                className="mt-3 text-xs font-bold text-[#167A75] hover:underline cursor-pointer"
              >
                Missing a chain? Suggest one
              </button>
            </div>
          )}
        </div>

        {/* Suggest Chain Action (Bottom of list per Section 4.4 & F11) */}
        {filteredBrands.length > 0 && (
          <div className="mt-4 text-center py-3 text-xs sm:text-sm text-[#5A6878]">
            Missing a chain?{" "}
            <button
              onClick={() => {
                sound.playClick();
                setIsAddChainOpen(true);
              }}
              className="text-[#167A75] font-bold hover:underline cursor-pointer ml-0.5"
            >
              Suggest one
            </button>
          </div>
        )}

        {/* Live Activity Feed (Section 4.4 & 5.2 - Real data only) */}
        <LiveTicker transactions={transactions} />
      </main>

      {/* Footer (Section 4.4, 5.2, F11) */}
      <DriveThruFooter onOpenFeedback={() => setIsFeedbackOpen(true)} />

      {/* Modals */}
      <DriveThruModal
        isOpen={isOrderOpen}
        brand={selectedBrand}
        initialAction={orderAction}
        onClose={() => setIsOrderOpen(false)}
        onSubmit={handleOrderSubmit}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        transaction={activeReceipt}
        brandRank={lastRank}
        onClose={() => setIsReceiptOpen(false)}
      />

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
