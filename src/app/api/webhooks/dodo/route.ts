import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Webhook } from "standardwebhooks";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const webhookSecret =
  process.env.DODO_WEBHOOK_SECRET ||
  process.env.DODO_PAYMENTS_WEBHOOK_SECRET ||
  "";

// ── Idempotency: Track processed webhook IDs to prevent duplicate fulfillment ──
// In-memory store (resets on deploy — acceptable for serverless; Supabase upsert below is the real guard)
const processedWebhookIds = new Set<string>();
const MAX_PROCESSED_IDS = 1000;

// ── Timestamp tolerance: Reject webhooks older than 5 minutes (replay protection) ──
const TIMESTAMP_TOLERANCE_SEC = 300;

function getServerSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Sanitize the webhook secret for StandardWebhooks library.
 * Dodo secrets start with "whsec_" — the library expects the raw base64 after the prefix.
 */
function getCleanSecret(): string {
  const raw = webhookSecret.trim().replace(/^["']|["']$/g, "");
  return raw;
}

export async function POST(req: Request) {
  if (!webhookSecret) {
    console.error("[WEBHOOK] Webhook secret not configured");
    return NextResponse.json(
      { error: "Webhook configuration error." },
      { status: 500 }
    );
  }

  const rawBody = await req.text();

  // ── Step 1: Verify webhook signature ──────────────────────────────────────
  let isVerified = false;
  const headerMap: Record<string, string> = {};
  req.headers.forEach((val, key) => {
    headerMap[key.toLowerCase()] = val;
  });

  const webhookId = headerMap["webhook-id"] || headerMap["svix-id"];
  const webhookTimestamp =
    headerMap["webhook-timestamp"] || headerMap["svix-timestamp"];
  const signatureHeader =
    headerMap["webhook-signature"] || headerMap["svix-signature"];

  // ── Step 1a: Timestamp replay protection ──────────────────────────────────
  if (webhookTimestamp) {
    const tsNum = parseInt(webhookTimestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (isNaN(tsNum) || Math.abs(now - tsNum) > TIMESTAMP_TOLERANCE_SEC) {
      console.warn(
        `[WEBHOOK] Rejected: timestamp drift too large. ts=${webhookTimestamp}, now=${now}`
      );
      return NextResponse.json(
        { error: "Webhook timestamp outside tolerance window." },
        { status: 401 }
      );
    }
  }

  // ── Step 1b: StandardWebhooks signature verification (primary) ────────────
  if (webhookId && webhookTimestamp && signatureHeader) {
    try {
      const cleanSecret = getCleanSecret();
      const wh = new Webhook(cleanSecret);
      wh.verify(rawBody, headerMap);
      isVerified = true;
    } catch (err) {
      console.warn(
        "[WEBHOOK] StandardWebhooks verification failed, attempting HMAC fallback:",
        err instanceof Error ? err.message : err
      );
    }
  }

  // ── Step 1c: HMAC SHA-256 fallback (for non-standard Dodo signature formats) ──
  if (!isVerified && signatureHeader) {
    try {
      // Dodo may send signature as "v1,<base64>" or "v1=<base64>" format
      const signatures = signatureHeader.split(" ");
      const cleanSecret = getCleanSecret();
      // Extract raw secret bytes — handle "whsec_" prefix
      const secretBytes = cleanSecret.startsWith("whsec_")
        ? Buffer.from(cleanSecret.slice(6), "base64")
        : Buffer.from(cleanSecret, "utf8");

      // Build the signed content the same way StandardWebhooks does:
      // "{webhook_id}.{webhook_timestamp}.{body}"
      const signedContent = webhookId && webhookTimestamp
        ? `${webhookId}.${webhookTimestamp}.${rawBody}`
        : rawBody;

      const expectedSignature = crypto
        .createHmac("sha256", secretBytes)
        .update(signedContent)
        .digest("base64");

      for (const sig of signatures) {
        const cleanSig = sig.replace(/^v1[,=]/, "").trim();
        if (!cleanSig) continue;

        const expectedBuffer = Buffer.from(expectedSignature, "utf8");
        const providedBuffer = Buffer.from(cleanSig, "utf8");

        if (
          expectedBuffer.length === providedBuffer.length &&
          crypto.timingSafeEqual(expectedBuffer, providedBuffer)
        ) {
          isVerified = true;
          break;
        }
      }
    } catch (e) {
      console.error("[WEBHOOK] HMAC fallback error:", e instanceof Error ? e.message : e);
    }
  }

  if (!isVerified) {
    console.warn("[WEBHOOK] Rejected: signature verification failed");
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 401 }
    );
  }

  // ── Step 2: Parse verified payload ────────────────────────────────────────
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // ── Step 3: Only handle successful payments ───────────────────────────────
  const eventType = payload.type || payload.event_type;
  if (eventType !== "payment.succeeded") {
    console.log(`[WEBHOOK] Ignored event type: ${eventType}`);
    return NextResponse.json({ success: true, message: "Ignored event type." });
  }

  // ── Step 4: Idempotency check — prevent duplicate fulfillment ─────────────
  const payment = payload.data || payload;
  const paymentId = payment.payment_id || webhookId || "";

  if (!paymentId) {
    console.warn("[WEBHOOK] No payment_id or webhook-id found; cannot enforce idempotency");
  }

  if (paymentId && processedWebhookIds.has(paymentId)) {
    console.log(`[WEBHOOK] Duplicate webhook ignored: ${paymentId}`);
    return NextResponse.json({ success: true, message: "Already processed." });
  }

  const metadata = payment.metadata;

  if (!metadata) {
    console.warn(`[WEBHOOK] payment.succeeded with no metadata: ${paymentId}`);
    return NextResponse.json({ success: true, message: "No metadata found." });
  }

  // ── Step 5: Validate metadata fields before trusting them ─────────────────
  const { brandId, actionType, amount: amountStr, message, author, location, accentColor, type, name } = metadata;
  const amount = parseInt(amountStr, 10);

  // Validate action type (CRITICAL: prevents metadata tampering)
  if (!["BOOST", "SABOTAGE"].includes(actionType)) {
    console.error(`[WEBHOOK] Invalid actionType in metadata: ${actionType}`);
    return NextResponse.json({ error: "Invalid action type." }, { status: 400 });
  }

  // Validate amount is within allowed range (prevents inflated score manipulation)
  const ALLOWED_AMOUNTS = [1, 2, 5, 10];
  if (!ALLOWED_AMOUNTS.includes(amount)) {
    console.error(`[WEBHOOK] Invalid amount in metadata: ${amountStr}`);
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  // Validate brandId format (must be a non-empty string)
  if (!brandId || typeof brandId !== "string" || brandId.length > 100) {
    console.error(`[WEBHOOK] Invalid brandId in metadata`);
    return NextResponse.json({ error: "Invalid brand." }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    console.error("[WEBHOOK] Database not configured");
    return NextResponse.json({ error: "Database configuration error." }, { status: 500 });
  }

  const receiptNumber = `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  // ── Step 6: Database-level idempotency check (survives serverless restarts) ──
  if (paymentId) {
    const { data: existingTx } = await supabase
      .from("transactions")
      .select("id")
      .eq("receipt_number", paymentId)
      .limit(1);

    if (existingTx && existingTx.length > 0) {
      console.log(`[WEBHOOK] DB idempotency: already fulfilled ${paymentId}`);
      return NextResponse.json({ success: true, message: "Already processed." });
    }
  }

  // ── Step 7: Fulfill the order ─────────────────────────────────────────────
  try {
    if (type === "order") {
      const { data: brand, error: fetchErr } = await supabase
        .from("brands")
        .select("*")
        .eq("id", brandId)
        .single();

      if (fetchErr || !brand) {
        console.error(`[WEBHOOK] Brand not found: ${brandId}`, fetchErr);
        return NextResponse.json({ error: "Brand not found." }, { status: 404 });
      }

      const newScore = actionType === "BOOST" ? brand.total_score + amount : brand.total_score - amount;
      const newBoosts = actionType === "BOOST" ? brand.total_boosts + amount : brand.total_boosts;
      const newSabotages = actionType === "SABOTAGE" ? brand.total_sabotages + amount : brand.total_sabotages;

      const { error: updateErr } = await supabase.from("brands").update({
        total_score: newScore,
        total_boosts: newBoosts,
        total_sabotages: newSabotages,
        current_slogan: message || brand.current_slogan,
        slogan_author: author || brand.slogan_author,
        updated_at: new Date().toISOString(),
      }).eq("id", brandId);

      if (updateErr) {
        console.error(`[WEBHOOK] Failed to update brand ${brandId}:`, updateErr);
        return NextResponse.json({ error: "Fulfillment error." }, { status: 500 });
      }

      const { error: insertErr } = await supabase.from("transactions").insert({
        brand_id: brandId,
        brand_name: brand.name,
        action_type: actionType,
        amount,
        message: message || "",
        author: author || "Anonymous",
        receipt_number: paymentId || receiptNumber,
      });

      if (insertErr) {
        console.error(`[WEBHOOK] Failed to insert transaction:`, insertErr);
        // Don't return error — brand was already updated, log for manual review
      }

      console.log(
        `[WEBHOOK] ✅ Fulfilled: ${actionType} ${amount} on "${brand.name}" (${brandId}) | payment=${paymentId}`
      );

    } else if (type === "add_chain") {
      const initialScore = actionType === "BOOST" ? amount : -amount;

      // Check if brand already exists (race condition guard)
      const { data: existing } = await supabase
        .from("brands")
        .select("id")
        .eq("id", brandId)
        .single();

      if (!existing) {
        const { error: insertBrandErr } = await supabase.from("brands").insert({
          id: brandId,
          name: name || "Unknown Chain",
          category: "Burgers",
          total_score: initialScore,
          total_boosts: actionType === "BOOST" ? amount : 0,
          total_sabotages: actionType === "SABOTAGE" ? amount : 0,
          current_slogan: message || "",
          slogan_author: author || "Anonymous",
          clicks: 1,
          accent_color: accentColor || "#f59e0b",
        });

        if (insertBrandErr) {
          console.error(`[WEBHOOK] Failed to insert new chain:`, insertBrandErr);
          return NextResponse.json({ error: "Fulfillment error." }, { status: 500 });
        }

        await supabase.from("transactions").insert({
          brand_id: brandId,
          brand_name: name || "Unknown Chain",
          action_type: actionType,
          amount,
          message: message || "",
          author: author || "Anonymous",
          receipt_number: paymentId || receiptNumber,
        });

        console.log(
          `[WEBHOOK] ✅ New chain added: "${name}" (${brandId}) via ${actionType} ${amount} | payment=${paymentId}`
        );
      } else {
        console.log(`[WEBHOOK] Chain already exists: ${brandId}, skipping insert`);
      }
    } else {
      console.warn(`[WEBHOOK] Unknown metadata type: ${type}`);
    }
  } catch (err) {
    console.error("[WEBHOOK] Fulfillment exception:", err);
    return NextResponse.json({ error: "Internal fulfillment error." }, { status: 500 });
  }

  // ── Step 8: Mark as processed (in-memory idempotency cache) ───────────────
  if (paymentId) {
    processedWebhookIds.add(paymentId);
    // Prune cache to prevent memory leak
    if (processedWebhookIds.size > MAX_PROCESSED_IDS) {
      const iterator = processedWebhookIds.values();
      for (let i = 0; i < MAX_PROCESSED_IDS / 2; i++) {
        const val = iterator.next().value;
        if (val) processedWebhookIds.delete(val);
      }
    }
  }

  return NextResponse.json({ success: true });
}
