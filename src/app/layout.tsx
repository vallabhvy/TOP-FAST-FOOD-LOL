import type { Metadata } from "next";
import { Archivo, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const techMono = Share_Tech_Mono({
  weight: "400",
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://topfastfood.lol"),
  title: "topfastfood.lol — The internet's fast food ranking, settled in dollars",
  description:
    "$1 pushes your chain up a point. $1 pushes a rival down one. Decided live by fans.",
  keywords: [
    "top fast food",
    "fast food rankings",
    "drive thru leaderboard",
    "outbid",
    "topfastfood",
    "fast food ranking",
  ],
  openGraph: {
    title: "topfastfood.lol — The internet's fast food ranking, settled in dollars",
    description:
      "$1 pushes your chain up a point. $1 pushes a rival down one. Decided live by fans.",
    url: "https://topfastfood.lol",
    siteName: "topfastfood.lol",
    type: "website",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 1200,
        alt: "topfastfood.lol",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "topfastfood.lol — The internet's fast food ranking, settled in dollars",
    description:
      "$1 pushes your chain up a point. $1 pushes a rival down one. Decided live by fans.",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "topfastfood.lol",
    url: "https://topfastfood.lol",
    description: "The internet's fast food ranking, settled in dollars.",
  };

  return (
    <html
      lang="en"
      className={`${archivo.variable} ${techMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F6F7F3] text-[#1E2A3A] font-sans selection:bg-[#167A75] selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
