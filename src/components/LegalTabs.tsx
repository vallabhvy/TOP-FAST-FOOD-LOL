"use client";

import React from "react";
import Link from "next/link";
import { Scale, ShieldCheck, FileText } from "lucide-react";
import { sound } from "@/lib/sound";

interface LegalTabsProps {
  activeTab: "terms" | "privacy" | "disclaimer";
}

export const LegalTabs: React.FC<LegalTabsProps> = ({ activeTab }) => {
  const tabs = [
    {
      id: "disclaimer" as const,
      label: "Legal Disclaimers",
      href: "/disclaimer",
      icon: FileText,
    },
    {
      id: "terms" as const,
      label: "Terms & Conditions",
      href: "/terms",
      icon: Scale,
    },
    {
      id: "privacy" as const,
      label: "Privacy Policy",
      href: "/privacy",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 glass-panel rounded-2xl mb-6 border border-white/10">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            onClick={() => sound.playClick()}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              isActive
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-bold"
                : "bg-white/[0.02] text-slate-400 hover:text-white border-transparent hover:border-white/10 hover:bg-white/[0.06]"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
