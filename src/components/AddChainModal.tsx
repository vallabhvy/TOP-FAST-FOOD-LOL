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
                Chain suggested
              </h3>
              <p className="text-sm text-[#5A6878] max-w-sm mx-auto">
                Thank you. {name} has been submitted for review. It will appear on the board once approved.
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
          /* Suggestion Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#1E2A3A]">
                Suggest a fast food chain
              </h2>
              <p className="text-xs text-[#5A6878] mt-0.5">
                Missing your favorite burger joint, taco spot, or local hero? Add it to the board.
              </p>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-[#B82E22]/10 border border-[#B82E22]/30 flex items-center gap-2 text-xs text-[#B82E22]">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5A6878] mb-1">
                Restaurant chain name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. In-N-Out, Portillo's, Waffle House"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#CBD2C4] rounded-lg p-2.5 text-sm text-[#1E2A3A] placeholder-[#9AA5B1] focus:outline-none focus:border-[#167A75] focus:ring-1 focus:ring-[#167A75]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5A6878] mb-1">
                Cuisine category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#CBD2C4] rounded-lg p-2.5 text-sm text-[#1E2A3A] focus:outline-none focus:border-[#167A75]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5A6878] mb-1">
                Your message / slogan (optional)
              </label>
              <input
                type="text"
                maxLength={80}
                placeholder="e.g. Best milkshakes in the universe"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#CBD2C4] rounded-lg p-2 text-sm text-[#1E2A3A] placeholder-[#9AA5B1] focus:outline-none focus:border-[#167A75]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5A6878] mb-1">
                Your name / @handle (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. @yourhandle"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#CBD2C4] rounded-lg p-2 text-sm text-[#1E2A3A] placeholder-[#9AA5B1] focus:outline-none focus:border-[#167A75]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-[#167A75] hover:bg-[#12625E] text-white font-bold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
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
