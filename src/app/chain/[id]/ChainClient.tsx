"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, ThumbsUp, ThumbsDown } from "lucide-react";
import Link from "next/link";
import { FastFoodBrand, Transaction, ActionType } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sound } from "@/lib/sound";
import { getBrandVisual } from "@/lib/brandMeta";
import { DriveThruModal } from "@/components/DriveThruModal";
import { ReceiptModal } from "@/components/ReceiptModal";
import { DriveThruFooter } from "@/components/DriveThruFooter";
import { FeedbackModal } from "@/components/FeedbackModal";

export default function ChainClient({ id }: { id: string }) {
  const [brand, setBrand] = useState<FastFoodBrand | null>(null);
  const [allBrands, setAllBrands] = useState<FastFoodBrand[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Modal states
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [orderAction, setOrderAction] = useState<ActionType>("BOOST");
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Replies state
  const [replies, setReplies] = useState<any[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const getDeviceId = () => {
    if (typeof window === "undefined") return "anon";
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = "device_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  };

  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client || !id) return;

    client.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const loadData = async () => {
      setLoading(true);

      const [brandRes, allRes, txRes, replyRes] = await Promise.all([
        client.from("brands").select("*").eq("id", id).single(),
        client.from("brands").select("*").order("total_score", { ascending: false }),
        client.from("transactions").select("*").eq("brand_id", id).order("created_at", { ascending: false }),
        client.from("replies").select("*"),
      ]);

      if (brandRes.data) {
        setBrand({
          id: brandRes.data.id,
          name: brandRes.data.name,
          category: brandRes.data.category,
          totalScore: brandRes.data.total_score,
          totalBoosts: brandRes.data.total_boosts,
          totalSabotages: brandRes.data.total_sabotages,
          currentSlogan: brandRes.data.current_slogan,
          sloganAuthor: brandRes.data.slogan_author,
          updatedAt: "Live",
          clicks: brandRes.data.clicks || 0,
          accentColor: brandRes.data.accent_color || "#3B7A1F",
        });
      }

      if (allRes.data) {
        setAllBrands(
          allRes.data.map((row) => ({
            id: row.id,
            name: row.name,
            category: row.category,
            totalScore: row.total_score,
            totalBoosts: row.total_boosts,
            totalSabotages: row.total_sabotages,
            currentSlogan: row.current_slogan,
            sloganAuthor: row.slogan_author,
            updatedAt: "Live",
            clicks: row.clicks || 0,
            accentColor: row.accent_color || "#3B7A1F",
          }))
        );
      }

      if (txRes.data) {
        setTransactions(
          txRes.data.map((row) => ({
            id: row.id,
            brandId: row.brand_id,
            brandName: row.brand_name,
            actionType: row.action_type,
            amount: row.amount,
            message: row.message,
            author: row.author,
            timestamp: new Date(row.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }),
            receiptNumber: row.receipt_number,
            likes: row.likes || 0,
            dislikes: row.dislikes || 0,
          }))
        );
      }

      if (replyRes.data) {
        setReplies(replyRes.data);
      }

      setLoading(false);
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F7F3] flex items-center justify-center text-[#1E2A3A] font-sans text-sm">
        Loading...
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-[#F6F7F3] flex flex-col items-center justify-center text-[#1E2A3A] p-4 font-sans space-y-3">
        <div className="text-lg font-bold">Restaurant chain not found.</div>
        <Link
          href="/"
          className="text-xs font-bold text-[#167A75] hover:underline"
        >
          Return to leaderboard
        </Link>
      </div>
    );
  }

  const visual = getBrandVisual(brand.id, brand.category);
  const currentIndex = allBrands.findIndex((b) => b.id === brand.id);
  const currentRank = currentIndex >= 0 ? currentIndex + 1 : 1;
  const brandAhead = currentIndex > 0 ? allBrands[currentIndex - 1] : null;
  const brandBehind = currentIndex >= 0 && currentIndex < allBrands.length - 1 ? allBrands[currentIndex + 1] : null;

  // Motivating line per Section 5.6
  const gapBehindStr = brandAhead
    ? `${brandAhead.totalScore - brand.totalScore + 1} points behind ${brandAhead.name} (#${currentIndex})`
    : null;
  const gapAheadStr = brandBehind
    ? `${brand.totalScore - brandBehind.totalScore} points ahead of ${brandBehind.name} (#${currentIndex + 2})`
    : null;

  const handleOpenOrder = (action: ActionType) => {
    sound.playClick();
    setOrderAction(action);
    setIsOrderOpen(true);
  };

  const handleOrderSubmit = async (params: {
    brandId: string;
    actionType: ActionType;
    amount: number;
    message: string;
    author: string;
  }) => {
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return data.error || "Server rejected the order.";
      }

      if (data.paymentLink) {
        window.location.href = data.paymentLink;
        return;
      }
    } catch {
      // Fallback
    }

    const receiptNumber = `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const newTx: Transaction = {
      id: `tx-${crypto.randomUUID()}`,
      brandId: params.brandId,
      brandName: brand.name,
      actionType: params.actionType,
      amount: params.amount,
      message: params.message,
      author: params.author,
      timestamp: "Just now",
      receiptNumber,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setIsOrderOpen(false);
    setActiveReceipt(newTx);
    setIsReceiptOpen(true);
    return undefined;
  };

  return (
    <div className="min-h-screen bg-[#F6F7F3] text-[#1E2A3A] flex flex-col font-sans selection:bg-[#167A75] selection:text-white">
      {/* Header */}
      <header className="border-b border-[#E2E4DC] bg-[#FFFFFF] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#5A6878] hover:text-[#1E2A3A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Leaderboard</span>
          </Link>

          <Link href="/" className="font-bold text-sm sm:text-base text-[#1E2A3A]">
            topfastfood<span className="text-[#167A75]">.lol</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-10 flex-1 w-full space-y-8">
        {/* Chain Header Card */}
        <div className="bg-[#FFFFFF] border border-[#E2E4DC] rounded-xl p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#F6F7F3] border border-[#E2E4DC] flex items-center justify-center text-2xl flex-shrink-0">
                {visual.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A3A]">
                    {brand.name}
                  </h1>
                  <span className="text-xs font-bold text-[#5A6878] bg-[#EEF0EA] px-2 py-0.5 rounded">
                    #{currentRank}
                  </span>
                </div>
                <div className="text-xs text-[#5A6878] mt-0.5 uppercase tracking-wider font-medium">
                  {brand.category}
                </div>
              </div>
            </div>

            {/* Score & Action Buttons */}
            <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F0F2EB]">
              <div className="text-left sm:text-right">
                <div className="font-receipt text-2xl font-bold text-[#1E2A3A]">
                  {brand.totalScore}
                </div>
                <div className="text-[10px] text-[#7A8898] uppercase tracking-wider font-medium">
                  {brand.totalScore === 1 || brand.totalScore === -1 ? "point" : "points"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenOrder("BOOST")}
                  className="px-3 py-2 rounded-lg bg-[#3B7A1F] hover:bg-[#2F6318] text-white text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <span>▲</span>
                  <span>Boost $1</span>
                </button>
                <button
                  onClick={() => handleOpenOrder("SABOTAGE")}
                  className="px-3 py-2 rounded-lg bg-[#B82E22] hover:bg-[#99251B] text-white text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <span>▼</span>
                  <span>Sabotage $1</span>
                </button>
              </div>
            </div>
          </div>

          {/* Gap to Neighbours (Section 5.6: The single most motivating line on the page) */}
          {(gapBehindStr || gapAheadStr) && (
            <div className="mt-4 pt-3 border-t border-[#F0F2EB] text-xs font-medium text-[#167A75]">
              {gapBehindStr && <span>{gapBehindStr}. </span>}
              {gapAheadStr && <span>{gapAheadStr}.</span>}
            </div>
          )}
        </div>

        {/* Top Backer & Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#FFFFFF] border border-[#E2E4DC] rounded-xl p-4 shadow-2xs sm:col-span-1">
            <div className="text-[10px] text-[#7A8898] uppercase tracking-wider font-bold mb-1">
              Top backer
            </div>
            {brand.sloganAuthor && brand.sloganAuthor !== "Unclaimed" ? (
              <div>
                <div className="font-bold text-sm text-[#1E2A3A]">
                  {brand.sloganAuthor}
                </div>
                <div className="text-xs text-[#5A6878] italic mt-0.5 truncate">
                  &quot;{brand.currentSlogan}&quot;
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#7A8898] italic">
                No top backer yet. Boost to claim this slot.
              </div>
            )}
          </div>

          <div className="bg-[#FFFFFF] border border-[#E2E4DC] rounded-xl p-4 shadow-2xs">
            <div className="text-[10px] text-[#7A8898] uppercase tracking-wider font-bold mb-1">
              Boosts
            </div>
            <div className="font-receipt text-xl font-bold text-[#3B7A1F]">
              +{brand.totalBoosts}
            </div>
            <div className="text-[11px] text-[#7A8898] mt-0.5">points gained</div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E2E4DC] rounded-xl p-4 shadow-2xs">
            <div className="text-[10px] text-[#7A8898] uppercase tracking-wider font-bold mb-1">
              Sabotages
            </div>
            <div className="font-receipt text-xl font-bold text-[#B82E22]">
              -{brand.totalSabotages}
            </div>
            <div className="text-[11px] text-[#7A8898] mt-0.5">points removed</div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#E2E4DC] pb-2">
            <h2 className="font-bold text-base text-[#1E2A3A]">
              Activity ({transactions.length})
            </h2>
            <span className="text-xs text-[#7A8898]">Recent orders &amp; roasts</span>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8 bg-[#FFFFFF] border border-dashed border-[#CBD2C4] rounded-lg text-xs text-[#7A8898]">
              No activity for {brand.name} yet. Be the first to boost or sabotage!
            </div>
          ) : (
            <div className="space-y-2.5">
              {transactions.map((tx) => {
                const isBoost = tx.actionType === "BOOST";
                const txReplies = replies.filter((r) => r.transaction_id === tx.id);

                return (
                  <div
                    key={tx.id}
                    className="bg-[#FFFFFF] border border-[#E2E4DC] rounded-lg p-3.5 space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1E2A3A]">{tx.author}</span>
                        <span
                          className={`font-bold text-[11px] px-1.5 py-0.5 rounded ${
                            isBoost
                              ? "bg-[#3B7A1F]/10 text-[#3B7A1F]"
                              : "bg-[#B82E22]/10 text-[#B82E22]"
                          }`}
                        >
                          {isBoost ? `▲ Boosted $${tx.amount}` : `▼ Sabotaged $${tx.amount}`}
                        </span>
                      </div>
                      <span className="text-[#7A8898] text-[11px]">{tx.timestamp}</span>
                    </div>

                    <p className="text-sm text-[#1E2A3A] italic">&quot;{tx.message}&quot;</p>

                    {/* Voting row */}
                    <div className="flex items-center gap-3 pt-1 text-xs text-[#5A6878]">
                      <button
                        onClick={async () => {
                          sound.playClick();
                          await fetch("/api/vote", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              transactionId: tx.id,
                              voteType: "LIKE",
                              deviceId: getDeviceId(),
                            }),
                          }).catch(() => {});
                        }}
                        className="flex items-center gap-1 hover:text-[#3B7A1F] transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{tx.likes || 0}</span>
                      </button>

                      <button
                        onClick={async () => {
                          sound.playClick();
                          await fetch("/api/vote", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              transactionId: tx.id,
                              voteType: "DISLIKE",
                              deviceId: getDeviceId(),
                            }),
                          }).catch(() => {});
                        }}
                        className="flex items-center gap-1 hover:text-[#B82E22] transition-colors cursor-pointer"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>{tx.dislikes || 0}</span>
                      </button>
                    </div>

                    {/* Threaded replies */}
                    {txReplies.length > 0 && (
                      <div className="mt-2 pl-3 border-l-2 border-[#CBD2C4] space-y-1 text-xs text-[#5A6878]">
                        {txReplies.map((r) => (
                          <div key={r.id} className="py-0.5">
                            <span className="font-bold text-[#1E2A3A]">{r.author_handle}:</span>{" "}
                            <span>{r.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <DriveThruFooter onOpenFeedback={() => setIsFeedbackOpen(true)} />

      {/* Modals */}
      <DriveThruModal
        isOpen={isOrderOpen}
        brand={brand}
        initialAction={orderAction}
        onClose={() => setIsOrderOpen(false)}
        onSubmit={handleOrderSubmit}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        transaction={activeReceipt}
        brandRank={currentRank}
        onClose={() => setIsReceiptOpen(false)}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
}
