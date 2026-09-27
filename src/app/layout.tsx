import type { Metadata } from "next";
import { VT323, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const vt323 = VT323({
  weight: "400",
  variable: "--font-vt323",
  subsets: ["latin"],
});

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  variable: "--font-tech-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TOPFASTFOOD.LOL",
  description:
    "The unhinged live pay-to-rank leaderboard deciding the greatest fast food chain on earth through cold, petty micro-bribes & grease sabotage. No food critics. Just cash.",
  keywords: [
    "top fast food",
    "fast food rankings",
    "drive thru leaderboard",
    "outbid",
    "topfastfood",
    "meme ranking",
  ],
  openGraph: {
    title: "TOPFASTFOOD.LOL | The Petty Drive-Thru Turf War",
    description:
      "Rankings decided by cold, petty cash. Boost your king or sabotage your rivals.",
    url: "https://topfastfood.lol",
    siteName: "TOPFASTFOOD.LOL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TOPFASTFOOD.LOL | The Petty Drive-Thru Turf War",
    description:
      "Rankings decided by cold, petty cash. Boost your king or sabotage your rivals.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${vt323.variable} ${shareTechMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#060907] text-[#39ff14] font-mono selection:bg-[#39ff14] selection:text-black">
        {children}
      </body>
    </html>
  );
}
