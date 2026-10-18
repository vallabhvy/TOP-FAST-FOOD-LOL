"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FeedbackModal } from "./FeedbackModal";

interface DriveThruFooterProps {
  onOpenFeedback?: () => void;
}

export const DriveThruFooter: React.FC<DriveThruFooterProps> = ({
  onOpenFeedback,
}) => {
  const [internalFeedbackOpen, setInternalFeedbackOpen] = useState(false);

  const handleFeedbackClick = () => {
    if (onOpenFeedback) {
      onOpenFeedback();
    } else {
      setInternalFeedbackOpen(true);
    }
  };

  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#0A0E1A]/60 backdrop-blur-xl py-6 sm:py-8 mt-12 text-xs text-slate-400">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Navigation Links */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 font-medium text-slate-300">
          <Link href="/about" className="hover:text-cyan-400 transition-colors">
            About
          </Link>
          <Link href="/terms" className="hover:text-cyan-400 transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
            Privacy
          </Link>
          <Link href="/disclaimer" className="hover:text-cyan-400 transition-colors">
            Disclaimer
          </Link>
          <button
            onClick={handleFeedbackClick}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Send feedback
          </button>
        </div>

        {/* Creator & Disclaimer */}
        <div className="text-center sm:text-right text-slate-400">
          <span>Built by </span>
          <a
            href="https://x.com/vallabh_vy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white hover:text-cyan-400 hover:underline transition-colors"
          >
            @vallabh_vy
          </a>
          <span className="mx-1 text-slate-600">•</span>
          <span>Parody community ranking</span>
        </div>
      </div>

      <FeedbackModal
        isOpen={internalFeedbackOpen}
        onClose={() => setInternalFeedbackOpen(false)}
      />
    </footer>
  );
};
