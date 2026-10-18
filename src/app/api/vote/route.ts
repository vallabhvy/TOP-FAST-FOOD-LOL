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

// Rate limiter: maximum 40 votes per minute per IP
const voteLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 40,
});

// GET: Fetch existing votes for the current device
export async function GET(req: Request) {
  if (!isValidOrigin(req)) {
    return NextResponse.json(
      { error: "Unauthorized request origin." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get("deviceId");
  if (!deviceId || typeof deviceId !== "string") {
    return NextResponse.json({ votes: {} });
  }

  const cleanDeviceId = deviceId.trim().slice(0, 64);
  if (!supabase) {
    return NextResponse.json({ votes: {} });
  }

  try {
    const { data, error } = await supabase
      .from("transaction_votes")
      .select("transaction_id, vote_type")
      .eq("ip_address", cleanDeviceId);

    if (error || !data) {
      return NextResponse.json({ votes: {} });
    }

    const votes: Record<string, "LIKE" | "DISLIKE"> = {};
    for (const row of data) {
      votes[row.transaction_id] = row.vote_type as "LIKE" | "DISLIKE";
    }

    return NextResponse.json({ votes });
  } catch (err) {
    console.error("GET /api/vote error:", err);
    return NextResponse.json({ votes: {} });
  }
}

// POST: Process upvote, downvote, or toggle-off
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
      isToggleOff?: boolean;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { transactionId, voteType, deviceId, isToggleOff } = body;

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

    // Check existing vote
    const { data: existingVote } = await supabase
      .from("transaction_votes")
      .select("id, vote_type")
      .eq("transaction_id", transactionId)
      .eq("ip_address", cleanDeviceId)
      .maybeSingle();

    // Fetch current transaction counts
    const { data: currentTx, error: txErr } = await supabase
      .from("transactions")
      .select("likes, dislikes")
      .eq("id", transactionId)
      .single();

    if (txErr || !currentTx) {
      return NextResponse.json(
        { error: "Transaction not found." },
        { status: 404 }
      );
    }

    let likes = currentTx.likes ?? 0;
    let dislikes = currentTx.dislikes ?? 0;
    let finalStatus = "vote_added";
    let userVote: "LIKE" | "DISLIKE" | null = voteType as "LIKE" | "DISLIKE";

    if (isToggleOff) {
      // User explicitly clicked to remove their vote
      if (existingVote) {
        await supabase
          .from("transaction_votes")
          .delete()
          .eq("transaction_id", transactionId)
          .eq("ip_address", cleanDeviceId);

        if (existingVote.vote_type === "LIKE") {
          likes = Math.max(likes - 1, 0);
        } else {
          dislikes = Math.max(dislikes - 1, 0);
        }

        await supabase
          .from("transactions")
          .update({ likes, dislikes })
          .eq("id", transactionId);
      }
      finalStatus = "vote_removed";
      userVote = null;
    } else if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Already voted this type - keep state stable, do not decrement
        finalStatus = "already_voted";
        userVote = voteType as "LIKE" | "DISLIKE";
      } else {
        // Change vote (e.g. LIKE -> DISLIKE or DISLIKE -> LIKE)
        await supabase
          .from("transaction_votes")
          .update({ vote_type: voteType })
          .eq("id", existingVote.id);

        if (voteType === "LIKE") {
          likes += 1;
          dislikes = Math.max(dislikes - 1, 0);
        } else {
          dislikes += 1;
          likes = Math.max(likes - 1, 0);
        }

        await supabase
          .from("transactions")
          .update({ likes, dislikes })
          .eq("id", transactionId);

        finalStatus = "vote_changed";
        userVote = voteType as "LIKE" | "DISLIKE";
      }
    } else {
      // New vote
      await supabase.from("transaction_votes").insert({
        transaction_id: transactionId,
        ip_address: cleanDeviceId,
        vote_type: voteType,
      });

      if (voteType === "LIKE") {
        likes += 1;
      } else {
        dislikes += 1;
      }

      await supabase
        .from("transactions")
        .update({ likes, dislikes })
        .eq("id", transactionId);

      finalStatus = "vote_added";
      userVote = voteType as "LIKE" | "DISLIKE";
    }

    return NextResponse.json({
      success: true,
      status: finalStatus,
      userVote,
      likes,
      dislikes,
    });
  } catch (error) {
    console.error("API error in /api/vote:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
