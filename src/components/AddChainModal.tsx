"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Plus,
} from "lucide-react";
import { sound } from "@/lib/sound";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface AddChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: string;
  currentUserHandle?: string;
}

const CATEGORIES = [
  "Burgers",
  "Chicken",
  "Mexican",
  "Pizza",
  "Sandwiches",
  "Late Night",
  "Dessert",
  "Fast Food",
];

export const AddChainModal: React.FC<AddChainModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Burgers");
  const [slogan, setSlogan] = useState("");
  const [author, setAuthor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-detect logged in Supabase user / X handle
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
        }
      });
    }
  }, [isOpen, author]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage("Please enter a valid chain name (at least 2 characters).");
      return;
    }

    const trimmedSlogan = slogan.trim() || `Waiting for inaugural claim...`;
    const finalAuthor = (author || "AnonymousFan").trim();

    setIsSubmitting(true);
    sound.playClick();

    try {
      // 1. Dispatch notification to Web3Forms inbox
      const web3Payload = {
        access_key: "f139beb4-ae4a-4838-8aba-d50af8577d88",
        subject: `[TOPFASTFOOD Chain Suggestion] ${trimmedName}`,
        from_name: "topfastfood.lol Chain Bot",
        name: finalAuthor,
        chain_name: trimmedName,
        category,
        initial_slogan: trimmedSlogan,
        submitted_by: finalAuthor,
        submitted_at: new Date().toISOString(),
      };

      const web3Promise = fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(web3Payload),
      }).catch((err) => {
        console.warn("Web3Forms transmission warning:", err);
      });

      // 2. Queue in backend database for review
      const dbPromise = fetch("/api/add-chain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          category,
          actionType: "BOOST",
          amount: 1,
          message: trimmedSlogan,
          author: finalAuthor,
        }),
      });

      const [res] = await Promise.all([dbPromise, web3Promise]);
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to submit chain. Please try again.");
        return;
      }

      sound.playCashRegister();
      setIsSuccess(true);
    } catch {
      setErrorMessage("Network error occurred. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    sound.playClick();
    setName("");
    setSlogan("");
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
                Chain suggested
              </h3>
              <p className="text-sm text-slate-300 max-w-sm mx-auto">
                Thank you. {name} has been submitted for review. It will appear on the board once approved.
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
          /* Suggestion Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
                Suggest a fast food chain
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Missing your favorite burger joint, taco spot, or local hero? Add it to the board.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Restaurant chain name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. In-N-Out, Portillo's, Waffle House"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/15 rounded-xl p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Cuisine category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Your message / slogan (optional)
              </label>
              <input
                type="text"
                maxLength={80}
                placeholder="e.g. Best milkshakes in the universe"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/15 rounded-xl p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Your name / @handle (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. @yourhandle"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/15 rounded-xl p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Submit chain</span>
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
