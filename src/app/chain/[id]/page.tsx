"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Flame, Skull, ThumbsUp, ThumbsDown, VolumeX, Volume2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FastFoodBrand, Transaction } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sound } from "@/lib/sound";
import { UserAvatar } from "@/components/UserAvatar";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = params;
  
  // Use the admin service key or just public anon key since it's a public table
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  
  if (!supabaseUrl || !supabaseServiceKey) return {};

  const { createClient } = await import("@supabase/supabase-js");
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data: brand } = await adminClient.from("brands").select("name, current_slogan").eq("id", id).single();
  
  if (!brand) return {};

  return {
    title: `${brand.name} | TOPFASTFOOD.LOL`,
    description: `Read the live petty roasts and boosts for ${brand.name}: "${brand.current_slogan}"`,
    openGraph: {
      title: `${brand.name} | TOPFASTFOOD.LOL`,
      description: `Read the live petty roasts and boosts for ${brand.name}: "${brand.current_slogan}"`,
      url: `https://topfastfood.lol/chain/${id}`,
      siteName: "TOPFASTFOOD.LOL",
      images: [
        {
          url: "/logo.jpg",
          width: 1200,
          height: 1200,
          alt: brand.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${brand.name} | TOPFASTFOOD.LOL`,
      description: `Read the live petty roasts and boosts for ${brand.name}: "${brand.current_slogan}"`,
      images: ["/logo.jpg"],
    },
  };
}

export default function ChainPage() {
  const { id } = useParams() as { id: string };
  const [brand, setBrand] = useState<FastFoodBrand | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [user, setUser] = useState<any>(null); // Supabase Auth User

  const [replies, setReplies] = useState<any[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const handleTwitterLogin = async () => {
    sound.playClick();
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: {
        redirectTo: window.location.origin + `/chain/${id}`,
      },
    });
  };

  // Initialize deviceId for anonymous voting
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
    setIsMuted(sound.getMuted());
    const client = supabase;
    if (!isSupabaseConfigured || !client || !id) return;

    // Check auth session
    client.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const fetchBrand = async () => {
      const { data } = await client.from("brands").select("*").eq("id", id).single();
      if (data) {
        setBrand({
          id: data.id,
          name: data.name,
          category: data.category,
          totalScore: data.total_score,
          totalBoosts: data.total_boosts,
          totalSabotages: data.total_sabotages,
          currentSlogan: data.current_slogan,
          sloganAuthor: data.slogan_author,
          updatedAt: "Live",
          clicks: data.clicks || 0,
          accentColor: data.accent_color || "#f59e0b",
        });
      }
    };

    const fetchTransactions = async () => {
      const { data } = await client
        .from("transactions")
        .select("*")
        .eq("brand_id", id)
        .order("created_at", { ascending: false });

      if (data) {
        setTransactions(
          data.map((row) => ({
            id: row.id,
            brandId: row.brand_id,
            brandName: row.brand_name,
            actionType: row.action_type,
            amount: row.amount,
            message: row.message,
            author: row.author,
            timestamp: new Date(row.created_at).toLocaleString(),
            receiptNumber: row.receipt_number,
            likes: row.likes || 0,
            dislikes: row.dislikes || 0,
          }))
        );
      }
      setLoading(false);
    };

    const fetchReplies = async () => {
      const { data } = await client
        .from("replies")
        .select("*")
        .order("created_at", { ascending: true });
      if (data) setReplies(data);
    };

    fetchBrand();
    fetchTransactions();
    fetchReplies();

    const channel = client
      .channel(`chain-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "brands", filter: `id=eq.${id}` }, fetchBrand)
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions", filter: `brand_id=eq.${id}` }, fetchTransactions)
      .on("postgres_changes", { event: "*", schema: "public", table: "replies" }, fetchReplies)
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [id]);

  const submitReply = async (transactionId: string) => {
    if (!supabase || !user || !replyText.trim()) return;
    setIsSubmittingReply(true);
    sound.playClick();
    
    const handle = `@${user.user_metadata?.user_name || "user"}`;
    const avatar = user.user_metadata?.avatar_url || "";

    const { error } = await supabase.from("replies").insert({
      transaction_id: transactionId,
      author_handle: handle,
      author_avatar: avatar,
      message: replyText.trim(),
    });

    if (!error) {
      setReplyText("");
      setReplyingTo(null);
    }
    setIsSubmittingReply(false);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
    if (!nextMuted) {
      sound.playDriveThruChime();
    }
  };

  if (loading) {
    return <div className="min-h-screen crt-screen flex items-center justify-center text-white font-mono">LOADING TERMINAL...</div>;
  }

  if (!brand) {
    return <div className="min-h-screen crt-screen flex items-center justify-center text-white font-mono">CHAIN NOT FOUND IN DATABASE.</div>;
  }

  return (
    <div className="min-h-screen crt-screen relative flex flex-col text-white font-mono pb-20">
      <div className="fixed inset-0 scanlines pointer-events-none z-40 opacity-75" />
      
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/80 sticky top-0 z-30 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Link 
            href="/"
            onClick={() => sound.playClick()}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>BACK TO LEADERBOARD</span>
          </Link>
          <button
            onClick={toggleMute}
            className="p-1.5 sm:p-2 rounded border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center active:scale-95"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-rose-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-emerald-400" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 w-full relative z-10 flex flex-col gap-8">
        
        {/* Brand Banner */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter glow-green text-[#39ff14]">
                {brand.name}
              </h1>
              <p className="text-zinc-400 mt-2">&quot;{brand.currentSlogan}&quot; — {brand.sloganAuthor}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-zinc-500 uppercase tracking-wider">WARCHEST</div>
              <div className={`text-3xl font-black ${brand.totalScore < 0 ? "text-rose-400" : "text-[#39ff14]"}`}>
                ${brand.totalScore}
              </div>
            </div>
          </div>
        </div>

        {/* Threads Section */}
        <div>
          <h2 className="text-xl font-bold mb-4 uppercase border-b border-zinc-800 pb-2">Warzone Threads ({transactions.length})</h2>
          
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">No roasts or boosts yet. Be the first on the main page!</p>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="bg-zinc-900/60 border border-zinc-800/70 rounded p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold">{tx.author}</span>
                        {tx.actionType === "BOOST" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 font-bold">
                            <Flame className="w-2.5 h-2.5 fill-current" /> +${tx.amount} BOOST
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-rose-950/70 text-rose-400 border border-rose-800/60 font-bold">
                            <Skull className="w-2.5 h-2.5" /> -${tx.amount} SABOTAGE
                          </span>
                        )}
                        <span className="text-zinc-500 text-[10px] ml-2">{tx.timestamp}</span>
                      </div>
                      <p className="text-zinc-200 text-sm mb-3">&quot;{tx.message}&quot;</p>
                      
                      {/* Voting & Replies */}
                      <div className="flex items-center gap-4 text-xs font-mono mt-2">
                        <button
                          onClick={async () => {
                            sound.playClick();
                            await fetch("/api/vote", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ transactionId: tx.id, voteType: "LIKE", deviceId: getDeviceId() }),
                            }).catch(() => {});
                          }}
                          className="flex items-center gap-1.5 text-zinc-500 hover:text-emerald-400 transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" /> <span>{tx.likes || 0}</span>
                        </button>
                        <button
                          onClick={async () => {
                            sound.playClick();
                            await fetch("/api/vote", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ transactionId: tx.id, voteType: "DISLIKE", deviceId: getDeviceId() }),
                            }).catch(() => {});
                          }}
                          className="flex items-center gap-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                        >
                          <ThumbsDown className="w-4 h-4" /> <span>{tx.dislikes || 0}</span>
                        </button>
                        
                        {user ? (
                          <button 
                            onClick={() => {
                              sound.playClick();
                              setReplyingTo(replyingTo === tx.id ? null : tx.id);
                            }}
                            className="text-sky-400 hover:text-white transition-colors flex items-center gap-1 ml-4 border border-sky-900/50 bg-sky-950/30 px-2 py-1 rounded cursor-pointer"
                          >
                            Reply as @{user.user_metadata?.user_name || "user"}
                          </button>
                        ) : (
                          <button 
                            onClick={handleTwitterLogin}
                            className="text-zinc-500 hover:text-sky-400 transition-colors flex items-center gap-1 ml-4 border border-zinc-700 hover:border-sky-500/50 px-2 py-1 rounded cursor-pointer group"
                          >
                            <svg className="w-3 h-3 fill-current group-hover:text-sky-400 text-zinc-500" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                            Login to Reply
                          </button>
                        )}
                      </div>

                      {/* Reply Input Box */}
                      {replyingTo === tx.id && (
                        <div className="mt-4 pt-4 border-t border-zinc-800/50">
                          <textarea
                            autoFocus
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Reply to ${tx.author}...`}
                            className="w-full bg-black/50 border border-zinc-800 rounded p-2 text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 resize-none"
                            rows={3}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => {
                                sound.playClick();
                                setReplyingTo(null);
                                setReplyText("");
                              }}
                              className="px-3 py-1 text-xs text-zinc-400 hover:text-white transition-colors"
                              disabled={isSubmittingReply}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => submitReply(tx.id)}
                              disabled={!replyText.trim() || isSubmittingReply}
                              className="px-3 py-1 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              {isSubmittingReply ? "Posting..." : "Post Reply"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Nested Replies List */}
                      {replies.filter(r => r.transaction_id === tx.id).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-zinc-800/50 pl-4 border-l-2 border-l-zinc-800 space-y-3">
                          {replies
                            .filter(r => r.transaction_id === tx.id)
                            .map((reply) => (
                              <div key={reply.id} className="text-sm">
                                <div className="flex items-center gap-2 mb-1 text-xs">
                                  {reply.author_avatar && (
                                    <img src={reply.author_avatar} alt={reply.author_handle} className="w-4 h-4 rounded-full" />
                                  )}
                                  <span className="font-bold text-sky-400">{reply.author_handle}</span>
                                  <span className="text-zinc-600">{new Date(reply.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-zinc-300 pl-6">{reply.message}</p>
                              </div>
                            ))}
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
