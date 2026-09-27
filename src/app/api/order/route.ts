import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateContent } from "@/lib/moderation";

const ALLOWED_AMOUNTS = [1, 2, 5, 10];
const ALLOWED_ACTIONS = ["BOOST", "SABOTAGE"] as const;

// Use the service role key for server-side writes (never exposed to client)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getServerSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Simple in-memory rate limiter per IP (resets on deploy/restart — fine for edge cases)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 2000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const last = rateLimitMap.get(ip);
  if (last && now - last < RATE_LIMIT_MS) {
    return true;
  }
  rateLimitMap.set(ip, now);
  // Clean up old entries every ~100 requests
  if (rateLimitMap.size > 500) {
    const cutoff = now - RATE_LIMIT_MS * 10;
    for (const [key, time] of rateLimitMap.entries()) {
      if (time < cutoff) rateLimitMap.delete(key);
    }
  }
  return false;
}

export async function POST(req: Request) {
  // Rate limiting by IP
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  // Parse body
  let body: {
    brandId?: string;
    actionType?: string;
    amount?: number;
    message?: string;
    author?: string;
    location?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { brandId, actionType, amount, message, author, location } = body;

  // 1. Validate required fields
  if (!brandId || !actionType || !amount || !message || !author) {
    return NextResponse.json(
      { error: "Missing required fields: brandId, actionType, amount, message, author." },
      { status: 400 }
    );
  }

  // 2. Validate action type
  if (!ALLOWED_ACTIONS.includes(actionType as typeof ALLOWED_ACTIONS[number])) {
    return NextResponse.json(
      { error: "Invalid action type. Must be BOOST or SABOTAGE." },
      { status: 400 }
    );
  }

  // 3. Validate amount
  if (!ALLOWED_AMOUNTS.includes(amount)) {
    return NextResponse.json(
      { error: `Invalid amount. Allowed values: ${ALLOWED_AMOUNTS.join(", ")}.` },
      { status: 400 }
    );
  }

  // 4. Content moderation (server-side — the real gate)
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
      { error: authorCheck.reason || "Author identity contains prohibited content." },
      { status: 422 }
    );
  }

  if (location) {
    const locCheck = validateContent(location, "location");
    if (!locCheck.isValid) {
      return NextResponse.json(
        { error: locCheck.reason || "Location contains prohibited content." },
        { status: 422 }
      );
    }
  }

  // 5. Write to Supabase (server-side with service role)
  const supabase = getServerSupabase();
  if (!supabase) {
    // No Supabase configured — return success for local/demo mode
    return NextResponse.json({
      success: true,
      receiptNumber: `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      mode: "local",
    });
  }

  // Fetch current brand to compute new score atomically
  const { data: brand, error: fetchError } = await supabase
    .from("brands")
    .select("*")
    .eq("id", brandId)
    .single();

  if (fetchError || !brand) {
    return NextResponse.json(
      { error: "Brand not found." },
      { status: 404 }
    );
  }

  const newScore =
    actionType === "BOOST"
      ? brand.total_score + amount
      : brand.total_score - amount;

  const newBoosts =
    actionType === "BOOST" ? brand.total_boosts + amount : brand.total_boosts;
  const newSabotages =
    actionType === "SABOTAGE"
      ? brand.total_sabotages + amount
      : brand.total_sabotages;

  const receiptNumber = `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  // Update brand
  const { error: updateError } = await supabase
    .from("brands")
    .update({
      total_score: newScore,
      total_boosts: newBoosts,
      total_sabotages: newSabotages,
      current_slogan: message,
      slogan_author: author,
      updated_at: new Date().toISOString(),
    })
    .eq("id", brandId);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update brand score." },
      { status: 500 }
    );
  }

  // Insert transaction
  const { error: insertError } = await supabase.from("transactions").insert({
    brand_id: brandId,
    brand_name: brand.name,
    action_type: actionType,
    amount,
    message,
    author,
    receipt_number: receiptNumber,
  });

  if (insertError) {
    // Score was updated but transaction log failed — not critical
    console.error("Transaction insert failed:", insertError);
  }

  return NextResponse.json({
    success: true,
    receiptNumber,
    newScore,
    newBoosts,
    newSabotages,
    mode: "live",
  });
}
