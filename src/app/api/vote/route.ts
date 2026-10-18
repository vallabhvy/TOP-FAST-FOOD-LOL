import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidOrigin, getClientIp, createRateLimiter, isValidUUID } from "@/lib/security";

// Initialize Supabase admin client
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

// Rate limiter: maximum 30 votes per minute per IP
const voteLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
});

export async function POST(req: Request) {
  // 1. Origin / CSRF Verification
  if (!isValidOrigin(req)) {
    return NextResponse.json(
      { error: "Unauthorized request origin." },
      { status: 403 }
    );
  }

  // 2. IP Rate Limiting
  const ip = getClientIp(req);
  const { isLimited, resetInSec } = voteLimiter.check(ip);
  if (isLimited) {
    return NextResponse.json(
      { error: `Too many votes. Please wait ${resetInSec} seconds before voting again.` },
      { status: 429 }
    );
  }

  try {
    // 3. Parse & Validate Request
    let body: {
      transactionId?: string;
      voteType?: string;
      deviceId?: string;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { transactionId, voteType, deviceId } = body;

    // Strict UUID validation on transactionId to prevent PostgreSQL cast errors
    if (!isValidUUID(transactionId)) {
      return NextResponse.json(
        { error: "Invalid transaction ID format." },
        { status: 400 }
      );
    }

    if (voteType !== "LIKE" && voteType !== "DISLIKE") {
      return NextResponse.json(
        { error: "Vote type must be LIKE or DISLIKE." },
        { status: 400 }
      );
    }

    // Sanitize device identifier (prevent SQL or buffer manipulation)
    const cleanDeviceId =
      typeof deviceId === "string" && /^[a-zA-Z0-9_-]{4,64}$/.test(deviceId.trim())
        ? deviceId.trim()
        : `anon_${ip.replace(/[^a-zA-Z0-9]/g, "")}`;

    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 500 }
      );
    }

    // 4. Call Secure RPC Function
    const { data, error } = await supabase.rpc("vote_transaction", {
      p_transaction_id: transactionId,
      p_ip_address: cleanDeviceId,
      p_vote_type: voteType,
    });

    if (error) {
      console.error("Voting RPC Error:", error);
      return NextResponse.json(
        { error: "Failed to process vote." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, result: data });
  } catch (error) {
    console.error("API error in /api/vote:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
