"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  X,
  Flag,
} from "lucide-react";
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
  const [replyAuthor, setReplyAuthor] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [feedFilter, setFeedFilter] = useState<"ALL" | "BOOST" | "SABOTAGE">(
    "ALL",
  );

  // User voting state: { [transactionId]: "LIKE" | "DISLIKE" }
  const [userVotes, setUserVotes] = useState<
    Record<string, "LIKE" | "DISLIKE">
  >({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("userVotes");
      if (saved) setUserVotes(JSON.parse(saved));
    } catch {}
  }, []);

  const getDeviceId = () => {
    if (typeof window === "undefined") return "anon";
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = "device_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  };

  const handleVote = async (
    transactionId: string,
    voteType: "LIKE" | "DISLIKE",
  ) => {
    sound.playClick();

    const currentVote = userVotes[transactionId];
    const isToggleOff = currentVote === voteType;

    // 1. Optimistic UI update on transaction counts
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id !== transactionId) return t;
        let newLikes = t.likes || 0;
        let newDislikes = t.dislikes || 0;

        if (isToggleOff) {
          if (voteType === "LIKE") newLikes = Math.max(newLikes - 1, 0);
          else newDislikes = Math.max(newDislikes - 1, 0);
        } else if (currentVote) {
          // Switch vote
          if (voteType === "LIKE") {
            newLikes += 1;
            newDislikes = Math.max(newDislikes - 1, 0);
          } else {
            newDislikes += 1;
            newLikes = Math.max(newLikes - 1, 0);
          }
        } else {
          // New vote
          if (voteType === "LIKE") newLikes += 1;
          else newDislikes += 1;
        }

        return { ...t, likes: newLikes, dislikes: newDislikes };
      }),
    );

    // 2. Optimistic update on active button state & localStorage
    const nextVotes = { ...userVotes };
    if (isToggleOff) {
      delete nextVotes[transactionId];
    } else {
      nextVotes[transactionId] = voteType;
    }
    setUserVotes(nextVotes);
    try {
      localStorage.setItem("userVotes", JSON.stringify(nextVotes));
    } catch {}

    // 3. Server-side persistence via /api/vote
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId,
          voteType,
          deviceId: getDeviceId(),
          isToggleOff,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Sync button state with authoritative server status
        setUserVotes((prev) => {
          const updated = { ...prev };
          if (data.userVote) {
            updated[transactionId] = data.userVote;
          } else {
            delete updated[transactionId];
          }
          try {
            localStorage.setItem("userVotes", JSON.stringify(updated));
          } catch {}
          return updated;
        });

        // Sync exact counts
        if (
          typeof data.likes === "number" &&
          typeof data.dislikes === "number"
        ) {
          setTransactions((prev) =>
            prev.map((t) =>
              t.id === transactionId
                ? { ...t, likes: data.likes, dislikes: data.dislikes }
                : t,
            ),
          );
        }
      }
    } catch (err) {
      console.error("Voting request failed:", err);
    }
  };

  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client || !id) return;

    client.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    const loadData = async () => {
      setLoading(true);

      const [brandRes, allRes, txRes, replyRes] = await Promise.all([
        client.from("brands").select("*").eq("id", id).single(),
        client
          .from("brands")
          .select("*")
          .order("total_score", { ascending: false }),
        client
          .from("transactions")
          .select("*")
          .eq("brand_id", id)
          .order("created_at", { ascending: false }),
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
          })),
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
          })),
        );
      }

      if (replyRes.data) {
        setReplies(replyRes.data);
      }

      // Also fetch this device's existing votes so buttons load already highlighted
      try {
        const dId = getDeviceId();
        const voteRes = await fetch(`/api/vote?deviceId=${encodeURIComponent(dId)}`);
        const voteData = await voteRes.json().catch(() => ({}));
        if (voteData && voteData.votes) {
          setUserVotes((prev) => ({ ...prev, ...voteData.votes }));
        }
      } catch (e) {
        console.error("Failed to load user votes from server:", e);
      }

      setLoading(false);
    };

    loadData();

    // Realtime subscription for threaded replies and transactions
    const channel = client
      .channel(`chain_${id}_feed`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "replies" },
        (payload) => {
          setReplies((prev) => {
            if (prev.some((r) => r.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transactions",
          filter: `brand_id=eq.${id}`,
        },
        (payload) => {
          const row = payload.new;
          setTransactions((prev) => [
            {
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
            },
            ...prev,
          ]);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `brand_id=eq.${id}`,
        },
        (payload) => {
          const row = payload.new;
          setTransactions((prev) =>
            prev.map((t) =>
              t.id === row.id
                ? {
                    ...t,
                    likes: row.likes ?? t.likes ?? 0,
                    dislikes: row.dislikes ?? t.dislikes ?? 0,
                  }
                : t,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [id]);

  const submitReply = async (transactionId: string) => {
    const trimmed = replyText.trim();
    if (!trimmed) return;

    if (!user) {
      alert("You must log in with your X account to reply.");
      return;
    }

    setIsSubmittingReply(true);
    sound.playClick();

    const handle = `@${user.user_metadata?.user_name || user.user_metadata?.preferred_username || "user"}`;
    const avatar = user?.user_metadata?.avatar_url || "";

    const sessionRes = await supabase?.auth.getSession();
    const token = sessionRes?.data?.session?.access_token;

    try {
      const res = await fetch("/api/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          transactionId,
          authorHandle: handle,
          authorAvatar: avatar,
          message: trimmed,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.reply) {
        sound.playCashRegister();
        setReplies((prev) => {
          if (prev.some((r) => r.id === data.reply.id)) return prev;
          return [...prev, data.reply];
        });
        setReplyText("");
        setReplyingTo(null);
      } else {
        alert(data.error || "Failed to post reply.");
      }
    } catch (e) {
      console.error("Reply error:", e);
      alert("Failed to post reply. Please try again.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleReport = async (tx: Transaction) => {
    sound.playClick();
    if (!confirm(`Report this post by ${tx.author} for moderation review?`))
      return;

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "Content Takedown Report",
          author: "User Report",
          message: `FLAGGED POST: ID "${tx.id}" by ${tx.author} on ${tx.brandName}: "${tx.message}"`,
        }),
      });
      alert(
        "Thank you. This post has been flagged and our moderation team has been notified for prompt review.",
      );
    } catch {
      alert("Report received. Thank you.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-300 font-sans text-sm">
        <div className="flex items-center gap-3 glass-card px-5 py-3 rounded-xl border border-white/10">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span>Loading chain data...</span>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white p-4 font-sans space-y-4">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 text-center space-y-3 max-w-sm">
          <div className="text-4xl mb-2">🍟</div>
          <div className="text-lg font-bold text-white">
            Restaurant chain not found.
          </div>
          <p className="text-xs text-slate-400">
            The chain you are looking for might not be added yet.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-colors pt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to leaderboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const visual = getBrandVisual(brand.id, brand.category);
  const currentIndex = allBrands.findIndex((b) => b.id === brand.id);
  const currentRank = currentIndex >= 0 ? currentIndex + 1 : 1;

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
    country?: string;
    paymentMethod?: string;
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

      if (
        typeof data.paymentLink === "string" &&
        data.paymentLink.startsWith("https://")
      ) {
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
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Header */}
      <header className="border-b border-white/[0.08] bg-[#0A0E1A]/75 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors glass-pill px-3 py-1.5"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Leaderboard</span>
          </Link>

          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              topfastfood<span className="text-cyan-400">.lol</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-10 flex-1 w-full space-y-6">
        {/* Chain Header Card */}
        <div className="glass-panel rounded-2xl p-5 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-3xl flex-shrink-0 shadow-inner">
                {visual.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {brand.name}
                  </h1>
                  <span className="text-xs font-black text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                    #{currentRank}
                  </span>
                  <span className="text-[10px] text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                    Unofficial fan parody
                  </span>
                </div>
                <div className="text-xs text-cyan-300 mt-1 uppercase tracking-wider font-bold">
                  {brand.category}
                </div>
              </div>
            </div>

            {/* Score & Action Buttons */}
            <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.08]">
              <div className="text-left sm:text-right">
                <div className="font-receipt text-3xl font-black text-white tracking-tight">
                  {brand.totalScore}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  {brand.totalScore === 1 || brand.totalScore === -1
                    ? "point"
                    : "points"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenOrder("BOOST")}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.35)] active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-xs">▲</span>
                  <span>Boost $1</span>
                </button>
                <button
                  onClick={() => handleOpenOrder("SABOTAGE")}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-black text-xs transition-all shadow-[0_0_15px_rgba(244,63,94,0.35)] active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-xs">▼</span>
                  <span>Sabotage $1</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 rounded-xl border border-white/[0.08] space-y-1">
            <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">
              Boosts
            </div>
            <div className="font-receipt text-2xl font-black text-emerald-400">
              +{brand.totalBoosts}
            </div>
            <div className="text-[11px] text-slate-400">points gained</div>
          </div>

          <div className="glass-card p-4 rounded-xl border border-white/[0.08] space-y-1">
            <div className="text-[10px] text-rose-400 uppercase tracking-widest font-bold">
              Sabotages
            </div>
            <div className="font-receipt text-2xl font-black text-rose-400">
              -{brand.totalSabotages}
            </div>
            <div className="text-[11px] text-slate-400">points removed</div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-3 gap-2.5">
            <div>
              <h2 className="font-extrabold text-base text-white tracking-tight">
                Activity ({transactions.length})
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                Both Boosts &amp; Sabotages with threaded replies
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10 text-xs font-bold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setFeedFilter("ALL");
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  feedFilter === "ALL"
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All ({transactions.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setFeedFilter("BOOST");
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  feedFilter === "BOOST"
                    ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-slate-400 hover:text-emerald-300"
                }`}
              >
                <span>▲ Boosts</span>
                <span className="opacity-75">
                  ({transactions.filter((t) => t.actionType === "BOOST").length}
                  )
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setFeedFilter("SABOTAGE");
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  feedFilter === "SABOTAGE"
                    ? "bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-sm"
                    : "text-slate-400 hover:text-rose-300"
                }`}
              >
                <span>▼ Sabotages</span>
                <span className="opacity-75">
                  (
                  {
                    transactions.filter((t) => t.actionType === "SABOTAGE")
                      .length
                  }
                  )
                </span>
              </button>
            </div>
          </div>

          {transactions.filter(
            (t) => feedFilter === "ALL" || t.actionType === feedFilter,
          ).length === 0 ? (
            <div className="text-center py-10 glass-card border border-dashed border-white/10 rounded-xl text-xs text-slate-400">
              {feedFilter === "ALL"
                ? `No activity for ${brand.name} yet. Be the first to boost or sabotage!`
                : feedFilter === "BOOST"
                  ? `No boosts for ${brand.name} yet. Be the first to boost!`
                  : `No sabotages for ${brand.name} yet. Be the first to roast!`}
            </div>
          ) : (
            <div className="space-y-3">
              {transactions
                .filter(
                  (t) => feedFilter === "ALL" || t.actionType === feedFilter,
                )
                .map((tx) => {
                  const isBoost = tx.actionType === "BOOST";
                  const txReplies = replies.filter(
                    (r) => r.transaction_id === tx.id,
                  );

                  return (
                    <div
                      key={tx.id}
                      className="glass-card rounded-xl p-4 space-y-2.5 border border-white/[0.08] hover:border-white/20 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">
                            {tx.author}
                          </span>
                          <span
                            className={`font-black text-[11px] px-2 py-0.5 rounded-md border ${
                              isBoost
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                            }`}
                          >
                            {isBoost
                              ? `▲ Boosted $${tx.amount}`
                              : `▼ Sabotaged $${tx.amount}`}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px] font-mono">
                          {tx.timestamp}
                        </span>
                      </div>

                      <p className="text-sm text-slate-200 italic font-medium">
                        &quot;{tx.message}&quot;
                      </p>

                      {/* Voting & Reply row */}
                      <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
                        <button
                          type="button"
                          onClick={() => handleVote(tx.id, "LIKE")}
                          className={`flex items-center gap-1.5 transition-all cursor-pointer px-2.5 py-1 rounded-lg border ${
                            userVotes[tx.id] === "LIKE"
                              ? "bg-emerald-500/20 text-emerald-300 font-bold border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                              : "bg-white/[0.04] hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400 border-white/[0.08]"
                          }`}
                          title="Upvote this comment"
                          aria-label="Upvote this comment"
                        >
                          <ThumbsUp
                            className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                              userVotes[tx.id] === "LIKE"
                                ? "fill-emerald-400 text-emerald-400"
                                : ""
                            }`}
                          />
                          <span>{tx.likes || 0}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleVote(tx.id, "DISLIKE")}
                          className={`flex items-center gap-1.5 transition-all cursor-pointer px-2.5 py-1 rounded-lg border ${
                            userVotes[tx.id] === "DISLIKE"
                              ? "bg-rose-500/20 text-rose-300 font-bold border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]"
                              : "bg-white/[0.04] hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border-white/[0.08]"
                          }`}
                          title="Downvote this comment"
                          aria-label="Downvote this comment"
                        >
                          <ThumbsDown
                            className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                              userVotes[tx.id] === "DISLIKE"
                                ? "fill-rose-400 text-rose-400"
                                : ""
                            }`}
                          />
                          <span>{tx.dislikes || 0}</span>
                        </button>

                        <button
                          onClick={() => {
                            sound.playClick();
                            setReplyingTo(replyingTo === tx.id ? null : tx.id);
                            if (!replyAuthor && user) {
                              setReplyAuthor(
                                `@${user.user_metadata?.user_name || "user"}`,
                              );
                            }
                          }}
                          className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors cursor-pointer ml-1 text-slate-400"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>
                            {txReplies.length > 0
                              ? `${txReplies.length} ${txReplies.length === 1 ? "reply" : "replies"}`
                              : "Reply"}
                          </span>
                        </button>

                        <button
                          onClick={() => handleReport(tx)}
                          title="Report this post for review"
                          className="flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer ml-auto text-slate-500 hover:text-slate-300 text-[11px]"
                        >
                          <Flag className="w-3 h-3" />
                          <span className="hidden sm:inline">Report</span>
                        </button>
                      </div>

                      {/* Inline reply compose box */}
                      {replyingTo === tx.id && (
                        <div className="mt-3 p-3.5 bg-slate-900/90 border border-white/15 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between text-xs text-slate-300">
                            <span>
                              Replying to{" "}
                              <span className="font-bold text-white">
                                {tx.author}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                sound.playClick();
                                setReplyingTo(null);
                                setReplyText("");
                              }}
                              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {!user ? (
                            <div className="py-3 px-4 rounded-xl bg-slate-800/60 border border-white/10 text-center space-y-2.5">
                              <p className="text-xs text-slate-300 font-medium">
                                Only accounts logged in with{" "}
                                <span className="font-black text-white">𝕏</span>{" "}
                                can reply.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  sound.playClick();
                                  supabase?.auth.signInWithOAuth({
                                    provider: "twitter",
                                    options: {
                                      redirectTo:
                                        typeof window !== "undefined"
                                          ? window.location.href
                                          : undefined,
                                    },
                                  });
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-200 text-black text-xs font-black rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.25)] cursor-pointer"
                              >
                                <svg
                                  className="w-3.5 h-3.5"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                <span>Log in with 𝕏 to reply</span>
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 text-xs">
                                {user.user_metadata?.avatar_url && (
                                  <img
                                    src={user.user_metadata.avatar_url}
                                    alt={
                                      user.user_metadata?.user_name || "user"
                                    }
                                    className="w-4 h-4 rounded-full object-cover border border-white/20"
                                  />
                                )}
                                <span className="font-mono text-[11px] text-cyan-300 font-bold">
                                  Posting as @
                                  {user.user_metadata?.user_name ||
                                    user.user_metadata?.preferred_username ||
                                    "user"}
                                </span>
                              </div>

                              <textarea
                                autoFocus
                                rows={2}
                                maxLength={140}
                                placeholder="Write your counter-roast or reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="w-full glass-input rounded-lg p-2.5 text-xs text-white placeholder-slate-500 border border-white/15 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 resize-none"
                              />

                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {replyText.length}/140
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      sound.playClick();
                                      setReplyingTo(null);
                                      setReplyText("");
                                    }}
                                    disabled={isSubmittingReply}
                                    className="px-2.5 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => submitReply(tx.id)}
                                    disabled={
                                      !replyText.trim() || isSubmittingReply
                                    }
                                    className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-[0_0_12px_rgba(6,182,212,0.35)] transition-all cursor-pointer disabled:opacity-50"
                                  >
                                    {isSubmittingReply
                                      ? "Posting..."
                                      : "Post reply"}
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Threaded replies */}
                      {txReplies.length > 0 && (
                        <div className="mt-2.5 pl-3 border-l-2 border-cyan-500/40 space-y-2 text-xs text-slate-300">
                          {txReplies.map((r) => (
                            <div key={r.id} className="py-1">
                              <div className="flex items-center gap-1.5 mb-1">
                                {r.author_avatar ? (
                                  <img
                                    src={r.author_avatar}
                                    alt={r.author_handle}
                                    className="w-4 h-4 rounded-full object-cover border border-white/20"
                                  />
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                )}
                                <span className="font-bold text-white font-mono text-[11px]">
                                  {r.author_handle}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(r.created_at).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              </div>
                              <p className="text-slate-200 pl-2 font-medium">
                                {r.message}
                              </p>
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
