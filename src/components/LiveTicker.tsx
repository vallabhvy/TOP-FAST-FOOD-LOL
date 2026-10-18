"use client";

import React from "react";
import { Transaction } from "@/types";
import Link from "next/link";
import { Activity } from "lucide-react";

interface LiveTickerProps {
  transactions?: Transaction[];
}

export const LiveTicker: React.FC<LiveTickerProps> = ({
  transactions = [],
}) => {
  if (transactions.length === 0) {
    return (
      <div className="w-full my-6 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-slate-400 text-center font-medium shadow-lg">
        No recent activity yet. The first $1 decides #1.
      </div>
    );
  }

  return (
    <div className="w-full my-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          </span>
          <span className="text-slate-200">Live Activity Feed</span>
        </div>
        <Activity className="w-4 h-4 text-cyan-400" />
      </div>

      <div className="space-y-2.5">
        {transactions.slice(0, 4).map((tx) => {
          const isBoost = tx.actionType === "BOOST";
          return (
            <div
              key={tx.id}
              className="flex items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-slate-200 py-1.5 border-b border-white/[0.06] last:border-0"
            >
              <div className="flex-1 truncate">
                <span className="font-bold text-white">
                  {tx.author ? (tx.author.startsWith("@") ? tx.author : `@${tx.author}`) : "Anonymous"}
                </span>{" "}
                <span
                  className={
                    isBoost
                      ? "font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                      : "font-bold text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                  }
                >
                  {isBoost ? `boosted (+$${tx.amount})` : `sabotaged (-$${tx.amount})`}
                </span>{" "}
                <Link
                  href={`/chain/${tx.brandId}`}
                  className="font-bold text-cyan-300 hover:text-cyan-200 hover:underline"
                >
                  {tx.brandName}
                </Link>
                {tx.message && (
                  <span className="text-slate-400 italic ml-1">
                    &quot;{tx.message}&quot;
                  </span>
                )}
              </div>

              <div className="font-receipt text-xs text-slate-400 flex-shrink-0">
                {tx.timestamp || "Just now"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
