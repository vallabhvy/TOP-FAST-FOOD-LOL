"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  MessageSquare,
  Bug,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  HelpCircle,
} from "lucide-react";
import { sound } from "@/lib/sound";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { CRTColorTheme } from "@/types";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: CRTColorTheme;
}

type FeedbackType = "bug" | "feature" | "feedback";

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  theme = "green",
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

  const isGreen = theme === "green";
  const glowText = isGreen ? "text-[#39ff14] glow-green" : "text-[#ffb000] glow-amber";
  const borderColor = isGreen ? "border-[#39ff14]/40" : "border-[#ffb000]/40";

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

    const formData = new FormData();
    formData.append("access_key", "f139beb4-ae4a-4838-8aba-d50af8577d88");
    formData.append("subject", `[TOPFASTFOOD ${categoryTitle}] From ${senderIdentifier}`);
    formData.append("from_name", "TOPFASTFOOD.LOL Feedback Bot");
    formData.append("category", categoryTitle);
    formData.append("author", senderIdentifier);
    formData.append("email", email.trim() || "Not provided");
    formData.append("message", trimmedMsg);
    formData.append("page_url", typeof window !== "undefined" ? window.location.href : "unknown");
    formData.append("user_agent", typeof navigator !== "undefined" ? navigator.userAgent : "unknown");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        sound.playCashRegister();
        setIsSuccess(true);
      } else {
        setErrorMessage(data.message || "Failed to deliver feedback. Please try again.");
      }
    } catch {
      setErrorMessage("Network error occurred. Please check your connection and try again.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div
        className={`bg-zinc-950 border ${borderColor} rounded-xl max-w-lg w-full p-6 text-zinc-100 font-mono shadow-2xl relative overflow-hidden`}
      >
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
          aria-label="Close feedback modal"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          /* Success Screen */
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                TRANSMISSION RECEIVED!
              </h3>
              <p className="text-xs text-zinc-300 font-sans max-w-sm mx-auto leading-relaxed">
                Thank you! Your feedback has been beamed directly to Vallabh&apos;s inbox.
                We read every report and feature suggestion to keep the petty turf wars blazing!
              </p>
            </div>

            <div className="pt-3">
              <button
                onClick={handleResetAndClose}
                className="w-full py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
              >
                RETURN TO DRIVE-THRU
              </button>
            </div>
          </div>
        ) : (
          /* Feedback Submission Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                  DIRECT TO CREATOR TRANSMISSION
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight uppercase">
                SUGGEST A FEATURE OR REPORT A BUG
              </h2>
              <p className="text-xs text-zinc-400 font-sans mt-1">
                Got an idea for the game, found something glitchy, or want a new petty feature? Let us know!
              </p>
            </div>

            {/* Category Selector Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span>Select Type</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setFeedbackType("feature");
                  }}
                  className={`px-2.5 py-2 rounded-lg border text-xs font-mono font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    feedbackType === "feature"
                      ? "bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-sm shadow-emerald-500/20"
                      : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  <Lightbulb className="w-4 h-4 text-emerald-400" />
                  <span>Feature Idea</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setFeedbackType("bug");
                  }}
                  className={`px-2.5 py-2 rounded-lg border text-xs font-mono font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    feedbackType === "bug"
                      ? "bg-rose-950/80 border-rose-400 text-rose-300 shadow-sm shadow-rose-500/20"
                      : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  <Bug className="w-4 h-4 text-rose-400" />
                  <span>Bug Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setFeedbackType("feedback");
                  }}
                  className={`px-2.5 py-2 rounded-lg border text-xs font-mono font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    feedbackType === "feedback"
                      ? "bg-sky-950/80 border-sky-400 text-sky-300 shadow-sm shadow-sky-500/20"
                      : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span>Feedback</span>
                </button>
              </div>
            </div>

            {/* Name / Handle & Optional Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-300 uppercase font-bold tracking-wider">
                  Your Name / X Handle
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="@your_handle or anon"
                  maxLength={30}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-300 uppercase font-bold tracking-wider">
                  Email (Optional for reply)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Message Details */}
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-300 uppercase font-bold tracking-wider flex items-center justify-between">
                <span>Details / Explanation *</span>
                <span className="text-zinc-600 text-[10px]">
                  {message.length}/1000
                </span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  feedbackType === "bug"
                    ? "What went wrong? Steps to reproduce the bug..."
                    : feedbackType === "feature"
                      ? "What feature or crazy idea should we build next?..."
                      : "Tell us what you think of the drive-thru turf wars..."
                }
                rows={4}
                maxLength={1000}
                required
                className="w-full px-3 py-2 rounded-lg bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-emerald-500 transition-colors font-mono resize-none leading-relaxed"
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || message.trim().length < 5}
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:cursor-not-allowed shadow-md shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>TRANSMITTING TO INBOX...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>SEND FEEDBACK</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
