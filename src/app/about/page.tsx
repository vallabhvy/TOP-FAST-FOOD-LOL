import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About TOPFASTFOOD.LOL | The Petty Drive-Thru Turf War",
  description:
    "Everything you need to know about TOPFASTFOOD.LOL explained simply. How to boost your favorite fast food, how to sabotage rivals, and how receipts work.",
  openGraph: {
    title: "About TOPFASTFOOD.LOL | How The Drive-Thru Turf War Works",
    description:
      "A fast, fun, and totally unhinged arcade scoreboard where the internet decides the greatest fast food chain on Earth.",
    url: "https://topfastfood.lol/about",
    siteName: "TOPFASTFOOD.LOL",
    images: [{ url: "/logo.jpg", width: 800, height: 800, alt: "TOPFASTFOOD.LOL Logo" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About TOPFASTFOOD.LOL",
    description: "The fan-powered drive-thru leaderboard. No food critics. Just pure petty loyalties.",
    images: ["/logo.jpg"],
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
