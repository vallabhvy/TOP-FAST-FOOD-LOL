import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateContent } from "@/lib/moderation";

const ALLOWED_AMOUNTS = [1, 2, 5, 10];
const ALLOWED_ACTIONS = ["BOOST", "SABOTAGE"] as const;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getServerSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Simple in-memory rate limiter per IP
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 5000; // 5s cooldown for adding brands

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const last = rateLimitMap.get(ip);
  if (last && now - last < RATE_LIMIT_MS) {
    return true;
  }
  rateLimitMap.set(ip, now);
  if (rateLimitMap.size > 500) {
    const cutoff = now - RATE_LIMIT_MS * 10;
    for (const [key, time] of rateLimitMap.entries()) {
      if (time < cutoff) rateLimitMap.delete(key);
    }
  }
  return false;
}

export async function POST(req: Request) {
  // Rate limiting
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before adding another chain." },
      { status: 429 }
    );
  }

  let body: {
    name?: string;
    actionType?: string;
    amount?: number;
    message?: string;
    author?: string;
    accentColor?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { name, actionType, amount, message, author, accentColor } = body;

  // 1. Validate required fields
  if (!name || !actionType || !amount || !message || !author) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  // 2. Validate action type
  if (!ALLOWED_ACTIONS.includes(actionType as typeof ALLOWED_ACTIONS[number])) {
    return NextResponse.json({ error: "Invalid action type." }, { status: 400 });
  }

  // 3. Validate amount
  if (!ALLOWED_AMOUNTS.includes(amount)) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  // 4. Content moderation — server-side gate
  const nameCheck = validateContent(name, "brand");
  if (!nameCheck.isValid) {
    return NextResponse.json(
      { error: nameCheck.reason || "Brand name contains prohibited content." },
      { status: 422 }
    );
  }

  const msgCheck = validateContent(message, "message");
  if (!msgCheck.isValid) {
    return NextResponse.json(
      { error: msgCheck.reason || "Message contains prohibited content." },
      { status: 422 }
    );
  }

  const authorCheck = validateContent(author, "author");
  if (!authorCheck.isValid) {
    return NextResponse.json(
      { error: authorCheck.reason || "Author identity is invalid." },
      { status: 422 }
    );
  }

  const supabase = getServerSupabase();
  const baseId = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const id = `${baseId}-${crypto.randomUUID().slice(0, 6)}`;
  const initialScore = actionType === "BOOST" ? amount : -amount;
  const receiptNumber = `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  if (!supabase) {
    // No Supabase — demo/local mode
    return NextResponse.json({
      success: true,
      id,
      receiptNumber,
      mode: "local",
    });
  }

  // Check for duplicate brand names
  const { data: existing } = await supabase
    .from("brands")
    .select("name")
    .ilike("name", name.trim())
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: `"${existing[0].name}" is already on the board! Search and boost/sabotage it instead.` },
      { status: 409 }
    );
  }

  // Insert brand
  const { error: brandError } = await supabase.from("brands").insert({
    id,
    name: name.trim(),
    category: "Burgers",
    total_score: initialScore,
    total_boosts: actionType === "BOOST" ? amount : 0,
    total_sabotages: actionType === "SABOTAGE" ? amount : 0,
    current_slogan: message,
    slogan_author: author,
    clicks: 1,
    accent_color: accentColor || "#f59e0b",
  });

  if (brandError) {
    return NextResponse.json(
      { error: "Failed to create brand." },
      { status: 500 }
    );
  }

  // Insert transaction
  await supabase.from("transactions").insert({
    brand_id: id,
    brand_name: name.trim(),
    action_type: actionType,
    amount,
    message,
    author,
    receipt_number: receiptNumber,
  });

  return NextResponse.json({
    success: true,
    id,
    receiptNumber,
    mode: "live",
  });
}
