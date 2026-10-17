import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateContent } from "@/lib/moderation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

// Rate limiting: 10 replies per minute per IP
const replyRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_REPLIES_PER_WINDOW = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = replyRateLimitMap.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    replyRateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (bucket.count >= MAX_REPLIES_PER_WINDOW) {
    return false;
  }
  bucket.count++;
  return true;
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  const isLocalhost =
    origin.includes("localhost:3000") || origin.includes("127.0.0.1:3000");
  const isProductionDomain = origin.includes("topfastfood.lol");

  if (!isLocalhost && !isProductionDomain) {
    return NextResponse.json(
      { error: "Unauthorized request origin." },
      { status: 403 }
    );
  }

  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many replies. Please wait a minute before replying again." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { transactionId, authorHandle, authorAvatar, message } = body;

    if (!transactionId || typeof transactionId !== "string") {
      return NextResponse.json(
        { error: "Transaction ID is required." },
        { status: 400 }
      );
    }

    const trimmedMsg = (message || "").trim();
    if (!trimmedMsg || trimmedMsg.length < 2) {
      return NextResponse.json(
        { error: "Reply message must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (trimmedMsg.length > 140) {
      return NextResponse.json(
        { error: "Reply message cannot exceed 140 characters." },
        { status: 400 }
      );
    }

    const trimmedAuthor = (authorHandle || "Anonymous Fan").trim().slice(0, 30);

    // Run moderation
    const msgCheck = validateContent(trimmedMsg, "message");
    if (!msgCheck.isValid) {
      return NextResponse.json(
        { error: msgCheck.reason || "Content moderation rejected this message." },
        { status: 400 }
      );
    }

    const authorCheck = validateContent(trimmedAuthor, "author");
    if (!authorCheck.isValid) {
      return NextResponse.json(
        { error: authorCheck.reason || "Invalid username." },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from("replies")
      .insert({
        transaction_id: transactionId,
        author_handle: trimmedAuthor.startsWith("@") ? trimmedAuthor : `@${trimmedAuthor}`,
        author_avatar: authorAvatar || null,
        message: trimmedMsg,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting reply:", error);
      return NextResponse.json(
        { error: "Failed to post reply." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, reply: data });
  } catch (err: unknown) {
    console.error("API reply error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
