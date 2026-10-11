import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// In-memory rate limiter: maximum 30 votes per minute per IP
const voteRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const VOTE_WINDOW_MS = 60 * 1000;
const MAX_VOTES_PER_MINUTE = 30;

function checkVoteRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = voteRateLimitMap.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    voteRateLimitMap.set(ip, { count: 1, resetAt: now + VOTE_WINDOW_MS });
    return true;
  }
  if (bucket.count >= MAX_VOTES_PER_MINUTE) {
    return false;
  }
  bucket.count++;
  return true;
}

export async function POST(req: Request) {
  // 1. Origin / CSRF Verification
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  const isLocalhost = origin.includes("localhost:3000") || origin.includes("127.0.0.1:3000");
  const isProductionDomain = origin.includes("topfastfood.lol");

  if (!isLocalhost && !isProductionDomain) {
    return NextResponse.json(
      { error: "Unauthorized request origin." },
      { status: 403 }
    );
  }

  // 2. IP Rate Limiting
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  if (!checkVoteRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Too many votes from this network." },
      { status: 429 }
    );
  }

  try {
    // 3. Parse & Validate Request
    const body = await req.json();
    const { transactionId, voteType, deviceId } = body;

    if (
      !transactionId ||
      typeof transactionId !== "string" ||
      !deviceId ||
      typeof deviceId !== "string" ||
      (voteType !== "LIKE" && voteType !== "DISLIKE")
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    // 3. Call Secure RPC Function
    const { data, error } = await supabase.rpc("vote_transaction", {
      p_transaction_id: transactionId,
      p_ip_address: deviceId, // We use the deviceId as the 'ip_address' field in the DB to avoid schema changes
      p_vote_type: voteType
    });

    if (error) {
      console.error("Voting RPC Error:", error);
      return NextResponse.json({ error: "Failed to process vote" }, { status: 500 });
    }

    return NextResponse.json({ success: true, result: data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
