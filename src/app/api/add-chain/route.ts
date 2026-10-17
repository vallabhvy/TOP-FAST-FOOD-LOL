import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateContent } from "@/lib/moderation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getServerSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// ============================================================================
// Rate Limiter: Maximum 100 requests per minute per IP
// ============================================================================
interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitBucket>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 100;

function checkRateLimit(ip: string): { isLimited: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const bucket = rateLimitMap.get(ip);

  // If no entry or window expired, start a new window
  if (!bucket || now >= bucket.resetAt) {
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return {
      isLimited: false,
      remaining: MAX_REQUESTS_PER_MINUTE - 1,
      resetInSec: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
    };
  }

  // Inside the 1-minute window
  bucket.count++;
  const remaining = Math.max(0, MAX_REQUESTS_PER_MINUTE - bucket.count);
  const resetInSec = Math.ceil((bucket.resetAt - now) / 1000);

  // Periodic garbage collection for memory hygiene
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now >= val.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }

  return {
    isLimited: bucket.count > MAX_REQUESTS_PER_MINUTE,
    remaining,
    resetInSec,
  };
}

export async function POST(req: Request) {
  // CORS / CSRF Protection
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  const isLocalhost = origin.includes("localhost:3000") || origin.includes("127.0.0.1:3000");
  const isProductionDomain = origin.includes("topfastfood.lol");

  if (!isLocalhost && !isProductionDomain) {
    return NextResponse.json(
      { error: "Unauthorized request origin." },
      { status: 403 }
    );
  }

  // Rate Limiting: 100 requests per minute per IP
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const { isLimited, remaining, resetInSec } = checkRateLimit(ip);

  const rateLimitHeaders = {
    "X-RateLimit-Limit": MAX_REQUESTS_PER_MINUTE.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": resetInSec.toString(),
  };

  if (isLimited) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded: Maximum 100 requests per minute allowed.",
      },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders,
          "Retry-After": resetInSec.toString(),
        },
      }
    );
  }

  let body: {
    name?: string;
    category?: string;
    actionType?: string;
    amount?: number;
    message?: string;
    author?: string;
    accentColor?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400, headers: rateLimitHeaders }
    );
  }

  const {
    name,
    category = "Burgers",
    actionType = "BOOST",
    amount = 1,
    message = "Waiting for inaugural claim...",
    author = "AnonymousFan",
    accentColor = "#f59e0b",
  } = body;

  // 1. Validate required fields
  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: "Chain name is required." },
      { status: 400, headers: rateLimitHeaders }
    );
  }

  if (
    typeof actionType !== "string" ||
    typeof message !== "string" ||
    typeof author !== "string" ||
    typeof category !== "string"
  ) {
    return NextResponse.json(
      { error: "Invalid field types." },
      { status: 400, headers: rateLimitHeaders }
    );
  }

  // 2. Content moderation
  const nameCheck = validateContent(name, "brand");
  if (!nameCheck.isValid) {
    return NextResponse.json(
      { error: nameCheck.reason || "Brand name contains prohibited content." },
      { status: 422, headers: rateLimitHeaders }
    );
  }

  const msgCheck = validateContent(message, "message");
  if (!msgCheck.isValid) {
    return NextResponse.json(
      { error: msgCheck.reason || "Message contains prohibited content." },
      { status: 422, headers: rateLimitHeaders }
    );
  }

  const authorCheck = validateContent(author, "author");
  if (!authorCheck.isValid) {
    return NextResponse.json(
      { error: authorCheck.reason || "Author identity is invalid." },
      { status: 422, headers: rateLimitHeaders }
    );
  }

  const baseId = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const id = `${baseId}-${crypto.randomUUID().slice(0, 6)}`;
  const initialScore = actionType === "BOOST" ? amount : -amount;
  const receiptNumber = `REQ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  const supabase = getServerSupabase();

  if (supabase) {
    // Check if chain already exists in approved brands
    const { data: existing } = await supabase
      .from("brands")
      .select("name")
      .ilike("name", name.trim())
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        {
          error: `"${existing[0].name}" is already on the board! Search and boost/sabotage it instead.`,
        },
        { status: 409, headers: rateLimitHeaders }
      );
    }
  }

  // Dispatch notification to creator's inbox via Web3Forms
  try {
    await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: "f139beb4-ae4a-4838-8aba-d50af8577d88",
        subject: `[TOPFASTFOOD Chain Suggestion] ${name.trim()}`,
        from_name: "topfastfood.lol Suggestion Bot",
        chain_name: name.trim(),
        category: category.trim(),
        message: message.trim(),
        suggested_by: author.trim(),
        submitted_at: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.warn("Web3Forms transmission error:", err);
  }

  return NextResponse.json(
    {
      success: true,
      message:
        "Chain suggestion submitted! The creator will review it before adding it to the board.",
    },
    { headers: rateLimitHeaders }
  );
}
