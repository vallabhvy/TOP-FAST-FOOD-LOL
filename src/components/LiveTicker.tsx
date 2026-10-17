"use client";

import React from "react";
import { Transaction } from "@/types";
import Link from "next/link";

interface LiveTickerProps {
  transactions?: Transaction[];
}

export const LiveTicker: React.FC<LiveTickerProps> = ({
  transactions = [],
}) => {
  if (transactions.length === 0) {
    return (
      <div className="w-full my-6 bg-[#FFFFFF] border border-[#E2E4DC] rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-[#5A6878] text-center font-medium">
        No recent activity yet. The first $1 decides #1.
      </div>
    );
  }

  return (
    <div className="w-full my-6 bg-[#FFFFFF] border border-[#E2E4DC] rounded-lg p-3 sm:p-4 shadow-2xs">
      <div className="text-xs font-bold uppercase tracking-wider text-[#5A6878] mb-2.5 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#167A75]" />
        <span>Recent activity</span>
      </div>

      <div className="space-y-2">
        {transactions.slice(0, 4).map((tx) => {
          const isBoost = tx.actionType === "BOOST";
          return (
            <div
              key={tx.id}
              className="flex items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-[#1E2A3A] py-1 border-b border-[#F0F2EB] last:border-0"
            >
              <div className="flex-1 truncate">
                <span className="font-bold text-[#1E2A3A]">
                  {tx.author ? (tx.author.startsWith("@") ? tx.author : `@${tx.author}`) : "Anonymous"}
                </span>{" "}
                <span
                  className={
                    isBoost ? "font-bold text-[#3B7A1F]" : "font-bold text-[#B82E22]"
                  }
                >
                  {isBoost ? "boosted" : "sabotaged"}
                </span>{" "}
                <Link
                  href={`/chain/${tx.brandId}`}
                  className="font-bold hover:underline text-[#1E2A3A]"
                >
                  {tx.brandName}
                </Link>
                {tx.message && (
                  <span className="text-[#5A6878] italic ml-1">
                    &quot;{tx.message}&quot;
                  </span>
                )}
              </div>

              <div className="font-receipt text-xs text-[#7A8898] flex-shrink-0">
                {tx.timestamp || "Just now"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
