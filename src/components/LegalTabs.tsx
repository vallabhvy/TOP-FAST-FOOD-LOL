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
    <div className="flex flex-wrap items-center gap-2 p-1 bg-[#FFFFFF] border border-[#E2E4DC] rounded-lg mb-6">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            onClick={() => sound.playClick()}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium transition-all cursor-pointer border ${
              isActive
                ? "bg-[#1E2A3A] text-white border-[#1E2A3A] font-bold"
                : "bg-transparent text-[#5A6878] hover:text-[#1E2A3A] border-transparent hover:bg-[#EEF0EA]"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
