import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, EyeOff } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | TOPFASTFOOD.LOL",
  description:
    "Privacy Policy for TOPFASTFOOD.LOL. How we handle anonymous voting data, X/Twitter OAuth identity, and rate limits.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen crt-screen text-zinc-100 flex flex-col font-mono relative selection:bg-emerald-500 selection:text-black">
      <div className="fixed inset-0 scanlines pointer-events-none z-40 opacity-75" />

      {/* Header */}
      <header className="border-b border-[#39ff14]/30 bg-black/85 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <img
              src="/logo.jpg"
              alt="TOPFASTFOOD.LOL Logo"
              className="w-10 h-10 object-contain rounded border border-zinc-800 group-hover:border-emerald-400 transition-colors"
            />
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tighter text-[#39ff14] glow-green font-mono leading-none">
                TOPFASTFOOD<span className="text-white">.LOL</span>
              </span>
              <span className="text-[10px] text-zinc-500 tracking-wider">
                LEGAL • PRIVACY POLICY
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 transition-all font-bold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO DRIVE-THRU</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-10 flex-1 w-full space-y-8 relative z-10">
        <div className="border-b border-zinc-800 pb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-bold mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>LAST UPDATED: OCTOBER 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase text-white glow-green">
            PRIVACY POLICY
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-sans">
            TOPFASTFOOD.LOL respects your privacy. We believe in minimal data collection and zero invasive tracking.
          </p>
        </div>

        <div className="space-y-6 text-xs text-zinc-300 font-sans leading-relaxed">
          {/* Section 1 */}
          <div className="bg-zinc-950/90 border border-zinc-800 p-5 rounded-lg space-y-2">
            <h2 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="text-amber-400">01.</span> What Information We Collect
            </h2>
            <p>
              We only collect data necessary to operate the live drive-thru leaderboard and protect against automated spam:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>
                <strong>Anonymous Local Device ID:</strong> A randomly generated pseudonymous identifier stored in your browser&apos;s local storage so you can upvote or downvote comment replies anonymously without requiring an account.
              </li>
              <li>
                <strong>Public X / Twitter Profile (Optional):</strong> If you choose to connect with X (OAuth 2.0), we only receive your public handle, display name, and avatar URL to credit your roast messages on digital receipts. We never request or access private messages, passwords, or personal contacts.
              </li>
              <li>
                <strong>Anonymized IP Address:</strong> Used temporarily in-memory by our rate limiter to prevent spam attacks (capped at 100 requests per minute).
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="bg-zinc-950/90 border border-zinc-800 p-5 rounded-lg space-y-2">
            <h2 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="text-amber-400">02.</span> Zero Third-Party Advertising Trackers
            </h2>
            <p>
              We do not sell, rent, or trade your personal information. We do not use cross-site behavioral advertising pixels (such as Meta Pixel or Google Ads trackers) to track your web activity across the internet.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-zinc-950/90 border border-zinc-800 p-5 rounded-lg space-y-2">
            <h2 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="text-amber-400">03.</span> Cookies &amp; Local Storage
            </h2>
            <p>
              We use strictly necessary local storage and session tokens to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Remember your audio sound toggle (Mute/Unmute)</li>
              <li>Maintain your authenticated X login session securely</li>
              <li>Prevent duplicate spam submissions</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="bg-zinc-950/90 border border-zinc-800 p-5 rounded-lg space-y-2">
            <h2 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="text-amber-400">04.</span> Third-Party Service Providers
            </h2>
            <p>
              We rely on trusted infrastructure providers to securely host and protect our platform:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li><strong>Supabase:</strong> For database hosting and OAuth identity session handling.</li>
              <li><strong>Cloudflare / Vercel:</strong> For global content delivery, SSL encryption, and DDoS mitigation.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="bg-zinc-950/90 border border-zinc-800 p-5 rounded-lg space-y-2">
            <h2 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="text-amber-400">05.</span> Your Rights &amp; Data Deletion
            </h2>
            <p>
              You have the right to sign out of X at any time by clicking the sign-out button. If you wish to request the deletion or redaction of a comment or handle associated with a transaction, you can submit a removal notice to our team.
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">
              Read Terms &amp; Conditions &rarr;
            </Link>
            <Link href="/about" className="hover:text-emerald-400 transition-colors">
              About TOPFASTFOOD.LOL &rarr;
            </Link>
          </div>
          <div>© {new Date().getFullYear()} TOPFASTFOOD.LOL</div>
        </div>
      </main>
    </div>
  );
}
