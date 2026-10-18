import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateContent } from "@/lib/moderation";
import {
  isValidOrigin,
  getClientIp,
  createRateLimiter,
  isValidUUID,
  isValidAvatarUrl,
} from "@/lib/security";

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
const replyLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
});

export async function POST(req: Request) {
  // 1. Origin verification
  if (!isValidOrigin(req)) {
    return NextResponse.json(
      { error: "Unauthorized request origin." },
      { status: 403 }
    );
  }

  // 2. IP Rate limiting
  const ip = getClientIp(req);
  const { isLimited, resetInSec } = replyLimiter.check(ip);
  if (isLimited) {
    return NextResponse.json(
      { error: `Too many replies. Please wait ${resetInSec} seconds before replying again.` },
      { status: 429 }
    );
  }

  try {
    let body: {
      transactionId?: string;
      authorHandle?: string;
      authorAvatar?: string;
      message?: string;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { transactionId, authorHandle, authorAvatar, message } = body;

    // 3. Authenticate user: Only people logged into X account can reply
    let verifiedHandle = (authorHandle || "").trim().slice(0, 30);
    let verifiedAvatar = authorAvatar;

    if (supabase) {
      const authHeader = req.headers.get("authorization");
      const token = authHeader?.replace(/^Bearer\s+/i, "");

      if (!token) {
        return NextResponse.json(
          { error: "Only users logged in with an X account can reply." },
          { status: 401 }
        );
      }

      const { data: userData, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !userData?.user) {
        return NextResponse.json(
          { error: "Invalid or expired session. Please log in with X to reply." },
          { status: 401 }
        );
      }

      const xHandle =
        userData.user.user_metadata?.user_name ||
        userData.user.user_metadata?.preferred_username;

      if (!xHandle) {
        return NextResponse.json(
          { error: "Your account must be connected to X to post replies." },
          { status: 403 }
        );
      }

      verifiedHandle = `@${xHandle}`;
      verifiedAvatar = userData.user.user_metadata?.avatar_url || authorAvatar;
    }

    // 4. Strict UUID validation to prevent database injection or syntax crash
    if (!isValidUUID(transactionId)) {
      return NextResponse.json(
        { error: "Invalid transaction ID format." },
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

    if (!verifiedHandle) {
      return NextResponse.json(
        { error: "Valid X handle is required to reply." },
        { status: 400 }
      );
    }

    // 5. Content moderation
    const msgCheck = validateContent(trimmedMsg, "message");
    if (!msgCheck.isValid) {
      return NextResponse.json(
        { error: msgCheck.reason || "Content moderation rejected this message." },
        { status: 400 }
      );
    }

    const authorCheck = validateContent(verifiedHandle, "author");
    if (!authorCheck.isValid) {
      return NextResponse.json(
        { error: authorCheck.reason || "Invalid username." },
        { status: 400 }
      );
    }

    // 5. Strict Avatar URL validation (protects against SSRF, arbitrary data schemes, and tracking pixels)
    const sanitizedAvatar =
      authorAvatar && isValidAvatarUrl(authorAvatar) ? authorAvatar.trim() : null;

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
        author_handle: verifiedHandle.startsWith("@") ? verifiedHandle : `@${verifiedHandle}`,
        author_avatar: sanitizedAvatar,
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
