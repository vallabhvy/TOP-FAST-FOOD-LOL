import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const webhookSecret = process.env.DODO_WEBHOOK_SECRET || "";

function getServerSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(req: Request) {
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  const signatureHeader = req.headers.get("webhook-signature");
  if (!signatureHeader) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await req.text();

  // Verify the signature
  try {
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");
      
    // Handle standard hex or v1=hex format
    const providedSignature = signatureHeader.replace(/^v1=/, "").trim();
    
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const providedBuffer = Buffer.from(providedSignature, "utf8");

    if (
      expectedBuffer.length !== providedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }
  } catch (error) {
    console.error("Signature verification error:", error);
    return NextResponse.json({ error: "Signature verification failed." }, { status: 401 });
  }

  // Parse the verified payload
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // Only handle successful payments
  if (payload.event_type !== "payment.succeeded" && payload.type !== "payment.succeeded") {
    return NextResponse.json({ success: true, message: "Ignored event type." });
  }

  const payment = payload.data || payload;
  const metadata = payment.metadata;

  if (!metadata) {
    return NextResponse.json({ success: true, message: "No metadata found." });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const { brandId, actionType, amount: amountStr, message, author, location, accentColor, type, name } = metadata;
  const amount = parseInt(amountStr, 10);
  const receiptNumber = `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  if (type === "order") {
    const { data: brand } = await supabase.from("brands").select("*").eq("id", brandId).single();
    if (brand) {
      const newScore = actionType === "BOOST" ? brand.total_score + amount : brand.total_score - amount;
      const newBoosts = actionType === "BOOST" ? brand.total_boosts + amount : brand.total_boosts;
      const newSabotages = actionType === "SABOTAGE" ? brand.total_sabotages + amount : brand.total_sabotages;

      await supabase.from("brands").update({
        total_score: newScore,
        total_boosts: newBoosts,
        total_sabotages: newSabotages,
        current_slogan: message,
        slogan_author: author,
        updated_at: new Date().toISOString(),
      }).eq("id", brandId);

      await supabase.from("transactions").insert({
        brand_id: brandId,
        brand_name: brand.name,
        action_type: actionType,
        amount,
        message,
        author,
        receipt_number: receiptNumber,
      });
    }
  } else if (type === "add_chain") {
    const initialScore = actionType === "BOOST" ? amount : -amount;
    
    // Check if it was inserted by another quick payment
    const { data: existing } = await supabase.from("brands").select("id").eq("id", brandId).single();
    
    if (!existing) {
      await supabase.from("brands").insert({
        id: brandId,
        name: name,
        category: "Burgers",
        total_score: initialScore,
        total_boosts: actionType === "BOOST" ? amount : 0,
        total_sabotages: actionType === "SABOTAGE" ? amount : 0,
        current_slogan: message,
        slogan_author: author,
        clicks: 1,
        accent_color: accentColor || "#f59e0b",
      });

      await supabase.from("transactions").insert({
        brand_id: brandId,
        brand_name: name,
        action_type: actionType,
        amount,
        message,
        author,
        receipt_number: receiptNumber,
      });
    }
  }

  return NextResponse.json({ success: true });
}
