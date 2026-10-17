"use client";

import React from "react";
import Link from "next/link";

interface DriveThruFooterProps {
  onOpenFeedback: () => void;
}

export const DriveThruFooter: React.FC<DriveThruFooterProps> = ({
  onOpenFeedback,
}) => {
  return (
    <footer className="w-full border-t border-[#E2E4DC] bg-[#FFFFFF] py-6 sm:py-8 mt-12 text-xs text-[#5A6878]">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Navigation Links */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 font-medium text-[#1E2A3A]">
          <Link href="/about" className="hover:text-[#167A75] transition-colors">
            About
          </Link>
          <Link href="/terms" className="hover:text-[#167A75] transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-[#167A75] transition-colors">
            Privacy
          </Link>
          <Link href="/disclaimer" className="hover:text-[#167A75] transition-colors">
            Disclaimer
          </Link>
          <button
            onClick={onOpenFeedback}
            className="hover:text-[#167A75] transition-colors cursor-pointer"
          >
            Send feedback
          </button>
        </div>

        {/* Creator & Disclaimer */}
        <div className="text-center sm:text-right text-[#7A8898]">
          <span>Built by </span>
          <a
            href="https://x.com/vallabh_vy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#1E2A3A] hover:text-[#167A75] hover:underline"
          >
            @vallabh_vy
          </a>
          <span className="mx-1">•</span>
          <span>Parody community ranking</span>
        </div>
      </div>
    </footer>
  );
};
