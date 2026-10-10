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
  // CORS / CSRF Protection: Ensure request comes from our frontend
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  const isLocalhost = origin.includes("localhost:3000") || origin.includes("127.0.0.1:3000");
  const isProductionDomain = origin.includes("topfastfood.lol");

  if (!isLocalhost && !isProductionDomain) {
    return NextResponse.json(
      { error: "Unauthorized request origin." },
      { status: 403 }
    );
  }

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

  // 1b. Type-safety: reject non-string inputs that could bypass regex moderation
  if (
    typeof name !== "string" ||
    typeof actionType !== "string" ||
    typeof amount !== "number" ||
    typeof message !== "string" ||
    typeof author !== "string" ||
    (accentColor !== undefined && typeof accentColor !== "string")
  ) {
    return NextResponse.json(
      { error: "Invalid field types." },
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

  // 5. Generate Payment Session or Fallback to Demo Mode
  const dodoKey = process.env.DODO_PAYMENTS_API_KEY;
  const baseId = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const id = `${baseId}-${crypto.randomUUID().slice(0, 6)}`;
  const initialScore = actionType === "BOOST" ? amount : -amount;
  const receiptNumber = `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  const supabase = getServerSupabase();

  if (dodoKey) {
    // SECURE FLOW: Real Money via DodoPayments
    try {
      const DodoPayments = (await import("dodopayments")).default;
      const dodo = new DodoPayments({ bearerToken: dodoKey });

      // Build metadata to pass to the webhook later
      const metadata = {
        brandId: id,
        name: name.trim(),
        actionType,
        amount: amount.toString(),
        message,
        author,
        accentColor: accentColor || "#f59e0b",
        type: "add_chain"
      };

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get("origin") || "http://localhost:3000";

      const payment = await dodo.payments.create({
        billing: {
          city: "",
          country: "US",
          state: "",
          street: "",
          zipcode: "",
        },
        customer: {
          email: "",
          name: author,
        },
        product_cart: [
          {
            product_id: "default_product_id",
            quantity: 1,
            amount: amount * 100,
          },
        ],
        return_url: `${baseUrl}?payment=success`,
        metadata,
      });

      return NextResponse.json({
        success: true,
        paymentLink: payment.payment_link || "",
        mode: "live",
      });
    } catch (error) {
      console.error("DodoPayments Error:", error);
      return NextResponse.json(
        { error: "Failed to initialize payment session. Please try again." },
        { status: 500 }
      );
    }
  }

  // FALLBACK DEMO FLOW (No API Keys configured)
  if (!supabase) {
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
    mode: "demo",
  });
}
