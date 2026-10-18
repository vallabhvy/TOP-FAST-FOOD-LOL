"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Bug,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { sound } from "@/lib/sound";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: string;
}

type FeedbackType = "bug" | "feature" | "feedback";

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("feature");
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-detect X handle from session if logged in
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const handle =
            session.user.user_metadata?.user_name ||
            session.user.user_metadata?.preferred_username ||
            "";
          if (handle && !author) {
            setAuthor(`@${handle}`);
          }
          if (session.user.email && !email) {
            setEmail(session.user.email);
          }
        }
      });
    }
  }, [isOpen, author, email]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedMsg = message.trim();
    if (!trimmedMsg || trimmedMsg.length < 5) {
      setErrorMessage("Please enter a message with at least 5 characters.");
      return;
    }

    setIsSubmitting(true);
    sound.playClick();

    const categoryTitle =
      feedbackType === "bug"
        ? "Bug Report"
        : feedbackType === "feature"
          ? "Feature Suggestion"
          : "General Feedback";

    const senderIdentifier = author.trim() || "Anonymous Fan";

    const payload = {
      access_key: "f139beb4-ae4a-4838-8aba-d50af8577d88",
      subject: `[TOPFASTFOOD ${categoryTitle}] From ${senderIdentifier}`,
      from_name: "topfastfood.lol Feedback",
      name: senderIdentifier,
      email: email.trim() || undefined,
      category: categoryTitle,
      message: trimmedMsg,
      page_url: typeof window !== "undefined" ? window.location.href : "unknown",
    };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        sound.playCashRegister();
        setIsSuccess(true);
      } else {
        setErrorMessage(data.message || "Failed to deliver feedback. Please try again.");
      }
    } catch (err: unknown) {
      console.error("Web3Forms submission error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Failed to send: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    sound.playClick();
    setMessage("");
    setErrorMessage(null);
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl max-w-lg w-full p-5 sm:p-6 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] relative overflow-hidden font-sans">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* Success Screen */
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.4)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">
                Feedback received
              </h3>
              <p className="text-sm text-slate-300 max-w-sm mx-auto">
                Thank you. Your message was sent directly to Vallabh (@vallabh_vy).
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleResetAndClose}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
              >
                Back to ranking
              </button>
            </div>
          </div>
        ) : (
          /* Feedback Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
                Send feedback
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Have an idea, found a bug, or want a new chain added? Let the creator know.
              </p>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFeedbackType("feature")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  feedbackType === "feature"
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-400"
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                <span>Feature</span>
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType("bug")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  feedbackType === "bug"
                    ? "border-rose-400 bg-rose-500/20 text-rose-300 font-bold shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                    : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-400"
                }`}
              >
                <Bug className="w-4 h-4" />
                <span>Bug report</span>
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType("feedback")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  feedbackType === "feedback"
                    ? "border-amber-400 bg-amber-500/20 text-amber-300 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                    : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-400"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>General</span>
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Your message
              </label>
              <textarea
                required
                rows={3}
                placeholder="What's on your mind?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/15 rounded-xl p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Name / @handle (optional)
                </label>
                <input
                  type="text"
                  placeholder="@yourhandle"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/15 rounded-xl p-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email (optional)
                </label>
                <input
                  type="email"
                  placeholder="For a reply"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/15 rounded-xl p-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Send feedback"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
