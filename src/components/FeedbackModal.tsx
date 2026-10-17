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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] border border-[#E2E4DC] rounded-xl max-w-lg w-full p-5 sm:p-6 text-[#1E2A3A] shadow-xl relative overflow-hidden font-sans">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-1 text-[#7A8898] hover:text-[#1E2A3A] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* Success Screen */
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#3B7A1F]/10 border border-[#3B7A1F] text-[#3B7A1F] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#1E2A3A]">
                Feedback received
              </h3>
              <p className="text-sm text-[#5A6878] max-w-sm mx-auto">
                Thank you. Your message was sent directly to Vallabh (@vallabh_vy).
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleResetAndClose}
                className="w-full py-2.5 rounded-lg bg-[#167A75] hover:bg-[#12625E] text-white font-bold text-sm transition-all cursor-pointer"
              >
                Back to ranking
              </button>
            </div>
          </div>
        ) : (
          /* Feedback Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#1E2A3A]">
                Send feedback
              </h2>
              <p className="text-xs text-[#5A6878] mt-0.5">
                Have an idea, found a bug, or want a new chain added? Let the creator know.
              </p>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFeedbackType("feature")}
                className={`p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  feedbackType === "feature"
                    ? "border-[#167A75] bg-[#167A75]/10 text-[#167A75] font-bold"
                    : "border-[#E2E4DC] hover:bg-[#EEF0EA] text-[#5A6878]"
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                <span>Feature</span>
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType("bug")}
                className={`p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  feedbackType === "bug"
                    ? "border-[#B82E22] bg-[#B82E22]/10 text-[#B82E22] font-bold"
                    : "border-[#E2E4DC] hover:bg-[#EEF0EA] text-[#5A6878]"
                }`}
              >
                <Bug className="w-4 h-4" />
                <span>Bug report</span>
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType("feedback")}
                className={`p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  feedbackType === "feedback"
                    ? "border-[#1E2A3A] bg-[#EEF0EA] text-[#1E2A3A] font-bold"
                    : "border-[#E2E4DC] hover:bg-[#EEF0EA] text-[#5A6878]"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>General</span>
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-[#B82E22]/10 border border-[#B82E22]/30 flex items-center gap-2 text-xs text-[#B82E22]">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5A6878] mb-1">
                Your message
              </label>
              <textarea
                required
                rows={3}
                placeholder="What's on your mind?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#CBD2C4] rounded-lg p-2.5 text-sm text-[#1E2A3A] placeholder-[#9AA5B1] focus:outline-none focus:border-[#167A75] focus:ring-1 focus:ring-[#167A75]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5A6878] mb-1">
                  Name / @handle (optional)
                </label>
                <input
                  type="text"
                  placeholder="@yourhandle"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#CBD2C4] rounded-lg p-2 text-sm text-[#1E2A3A] placeholder-[#9AA5B1] focus:outline-none focus:border-[#167A75]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5A6878] mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  placeholder="For a reply"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#CBD2C4] rounded-lg p-2 text-sm text-[#1E2A3A] placeholder-[#9AA5B1] focus:outline-none focus:border-[#167A75]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-[#167A75] hover:bg-[#12625E] text-white font-bold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50"
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
