"use client";

import React, { useState, useMemo, useEffect } from "react";
import confetti from "canvas-confetti";
import { Search, PlusCircle, Plus, Flame, Skull, X, AlertTriangle } from "lucide-react";
import { FastFoodBrand, ActionType, Transaction, CRTColorTheme } from "@/types";
import { INITIAL_BRANDS, INITIAL_TRANSACTIONS } from "@/lib/initialData";
import { DriveThruHeader } from "@/components/DriveThruHeader";
import { BrandCard } from "@/components/BrandCard";
import { DriveThruModal } from "@/components/DriveThruModal";
import { ReceiptModal } from "@/components/ReceiptModal";
import { AddChainModal } from "@/components/AddChainModal";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";
import { UserAvatar } from "@/components/UserAvatar";
import { sound } from "@/lib/sound";
import { validateContent } from "@/lib/moderation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const ALLOWED_AMOUNTS = [1, 2, 5, 10];
const ORDER_COOLDOWN_MS = 3000; // 3 second cooldown between orders
const ITEMS_PER_PAGE = 10;

export default function Home() {
  const [theme, setTheme] = useState<CRTColorTheme>("green");
  const [brands, setBrands] = useState<FastFoodBrand[]>(INITIAL_BRANDS);
  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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

  // Add Chain Modal State
  const [isAddChainOpen, setIsAddChainOpen] = useState(false);
  const [lastRank, setLastRank] = useState<number>(1);

  // Rate limiting state
  const [lastOrderTime, setLastOrderTime] = useState<number>(0);

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
            status: row.status || "approved",
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
            likes: row.likes || 0,
            dislikes: row.dislikes || 0,
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
        { event: "*", schema: "public", table: "transactions" },
        () => fetchTransactions(),
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  // Sorted Brands by totalScore descending (excluding hidden & pending review chains)
  const sortedBrands = useMemo(() => {
    return [...brands]
      .filter((b) => b.status === "approved" || (!b.status && b.status !== "hidden" && b.status !== "pending"))
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

  // Pagination logic
  const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE);
  const paginatedBrands = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredBrands.slice(start, end);
  }, [filteredBrands, currentPage]);

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

  const handleBrandClick = (brandId: string) => {
    setBrands((prev) =>
      prev.map((b) => (b.id === brandId ? { ...b, clicks: b.clicks + 1 } : b)),
    );
    // Click counter is local-only; actual engagement is tracked via orders
  };

  const handleOrderSubmit = async (params: {
    brandId: string;
    actionType: ActionType;
    amount: number;
    message: string;
    author: string;
    location?: string;
  }): Promise<string | undefined> => {
    // Rate limiting
    const now = Date.now();
    if (now - lastOrderTime < ORDER_COOLDOWN_MS) {
      return "Please wait a few seconds before placing another order.";
    }
    setLastOrderTime(now);

    // Validate amount is in allowed set
    if (!ALLOWED_AMOUNTS.includes(params.amount)) {
      return "Invalid amount selected.";
    }

    // Client-side moderation gate (defense in depth)
    const msgValidation = validateContent(params.message, "message");
    if (!msgValidation.isValid) return msgValidation.reason || "Prohibited content detected.";

    const authorValidation = validateContent(params.author, "author");
    if (!authorValidation.isValid) return authorValidation.reason || "Invalid identity.";

    if (params.location) {
      const locValidation = validateContent(params.location, "location");
      if (!locValidation.isValid) return locValidation.reason || "Invalid location.";
    }

    // Persist via server-side API route FIRST (validates & writes with service role)
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
        return; // Redirecting, stop execution
      }
    } catch {
      // Network failure — proceed with optimistic update (assuming demo mode)
    }

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
    const receiptNumber = `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const newTx: Transaction = {
      id: `tx-${crypto.randomUUID()}`,
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

    return undefined; // success — no error
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
        {/* Search Bar & Add Chain Action */}
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
            className="px-3.5 py-2 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-950/40 active:scale-95 flex-shrink-0"
            title="Propose a fast food chain to be added"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ ADD A CHAIN</span>
          </button>
        </div>

        {/* The Leaderboard Grid / Rows */}
        <div className="space-y-2.5">
          {paginatedBrands.map((brand) => {
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
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 py-4">
              <button
                onClick={() => {
                  sound.playClick();
                  setCurrentPage(p => Math.max(1, p - 1));
                }}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 font-mono text-xs transition-colors"
              >
                &larr; PREV
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => {
                      sound.playClick();
                      setCurrentPage(page);
                    }}
                    className={`w-8 h-8 flex items-center justify-center rounded font-mono text-xs font-bold transition-all ${
                      currentPage === page
                        ? "bg-emerald-500 text-black border-emerald-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    } border`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setCurrentPage(p => Math.min(totalPages, p + 1));
                }}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 font-mono text-xs transition-colors"
              >
                NEXT &rarr;
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

      {/* Add Chain Modal (Pending Review Queue) */}
      <AddChainModal
        isOpen={isAddChainOpen}
        onClose={() => setIsAddChainOpen(false)}
        theme={theme}
      />

      {/* Legal & Parody Protection Disclaimer */}
      <LegalDisclaimer theme={theme} />
    </div>
  );
}
