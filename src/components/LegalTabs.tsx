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
      label: "Legal Disclaimers & Safe Harbor",
      shortLabel: "Disclaimers & Safe Harbor",
      href: "/disclaimer",
      icon: FileText,
    },
    {
      id: "terms" as const,
      label: "Terms & Conditions",
      shortLabel: "Terms & Conditions",
      href: "/terms",
      icon: Scale,
    },
    {
      id: "privacy" as const,
      label: "Privacy Policy",
      shortLabel: "Privacy Policy",
      href: "/privacy",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-950/90 border border-zinc-800 rounded-xl mb-6">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            onClick={() => sound.playClick()}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
              isActive
                ? "bg-emerald-950 text-emerald-300 border-emerald-500 font-bold shadow-sm shadow-emerald-950"
                : "bg-zinc-900/60 text-zinc-400 hover:text-white border-transparent hover:border-zinc-700"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </Link>
        );
      })}
    </div>
  );
};
