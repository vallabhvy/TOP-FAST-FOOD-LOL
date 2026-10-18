import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateContent } from "@/lib/moderation";
import { isValidOrigin, getClientIp, createRateLimiter } from "@/lib/security";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getServerSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Rate Limiter: Maximum 5 chain suggestions per 10 minutes per IP
const addChainLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 5,
});

const WEB3FORMS_ACCESS_KEY =
  process.env.WEB3FORMS_ACCESS_KEY || "f139beb4-ae4a-4838-8aba-d50af8577d88";

export async function POST(req: Request) {
  // 1. CORS / CSRF Protection
  if (!isValidOrigin(req)) {
    return NextResponse.json(
      { error: "Unauthorized request origin." },
      { status: 403 }
    );
  }

  // 2. Rate Limiting: 5 requests per 10 minutes per IP
  const ip = getClientIp(req);
  const { isLimited, remaining, resetInSec } = addChainLimiter.check(ip);

  const rateLimitHeaders = {
    "X-RateLimit-Limit": "5",
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": resetInSec.toString(),
  };

  if (isLimited) {
    return NextResponse.json(
      {
        error: `Rate limit exceeded. Please wait ${resetInSec} seconds before suggesting another chain.`,
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
    message = "Waiting for inaugural claim...",
    author = "AnonymousFan",
  } = body;

  // 3. Validate required fields & types
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json(
      { error: "Chain name is required (at least 2 characters)." },
      { status: 400, headers: rateLimitHeaders }
    );
  }

  if (
    typeof message !== "string" ||
    typeof author !== "string" ||
    typeof category !== "string"
  ) {
    return NextResponse.json(
      { error: "Invalid field types." },
      { status: 400, headers: rateLimitHeaders }
    );
  }

  const cleanName = name.trim().slice(0, 35);
  const cleanCategory = category.trim().slice(0, 30);
  const cleanMessage = message.trim().slice(0, 40);
  const cleanAuthor = author.trim().slice(0, 30);

  // 4. Content moderation
  const nameCheck = validateContent(cleanName, "brand");
  if (!nameCheck.isValid) {
    return NextResponse.json(
      { error: nameCheck.reason || "Brand name contains prohibited content." },
      { status: 422, headers: rateLimitHeaders }
    );
  }

  const msgCheck = validateContent(cleanMessage, "message");
  if (!msgCheck.isValid) {
    return NextResponse.json(
      { error: msgCheck.reason || "Message contains prohibited content." },
      { status: 422, headers: rateLimitHeaders }
    );
  }

  const authorCheck = validateContent(cleanAuthor, "author");
  if (!authorCheck.isValid) {
    return NextResponse.json(
      { error: authorCheck.reason || "Author identity is invalid." },
      { status: 422, headers: rateLimitHeaders }
    );
  }

  const supabase = getServerSupabase();

  if (supabase) {
    // Check if chain already exists in approved brands
    const { data: existing } = await supabase
      .from("brands")
      .select("name")
      .ilike("name", cleanName)
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
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `[TOPFASTFOOD Chain Suggestion] ${cleanName}`,
        from_name: "topfastfood.lol Suggestion Bot",
        chain_name: cleanName,
        category: cleanCategory,
        message: cleanMessage,
        suggested_by: cleanAuthor,
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
