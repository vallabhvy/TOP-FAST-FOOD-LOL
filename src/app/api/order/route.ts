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

  // 1b. Type-safety: reject non-string inputs that could bypass regex moderation
  if (
    typeof brandId !== "string" ||
    typeof actionType !== "string" ||
    typeof amount !== "number" ||
    typeof message !== "string" ||
    typeof author !== "string" ||
    (location !== undefined && typeof location !== "string")
  ) {
    return NextResponse.json(
      { error: "Invalid field types." },
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

  // 5. Generate Payment Session or Fallback to Demo Mode
  const dodoKey = process.env.DODO_PAYMENTS_API_KEY;

  if (dodoKey) {
    // SECURE FLOW: Real Money via DodoPayments
    try {
      const DodoPayments = (await import("dodopayments")).default;
      const isTestMode =
        process.env.DODO_PAYMENTS_ENVIRONMENT === "test_mode" ||
        dodoKey.startsWith("test_");

      const dodo = new DodoPayments({
        bearerToken: dodoKey,
        environment: isTestMode ? "test_mode" : "live_mode",
      });

      // Build metadata to pass to the webhook later
      const metadata = {
        brandId,
        actionType,
        amount: amount.toString(),
        message,
        author,
        location: location || "",
        type: "order",
      };

      // Ensure base URL exists for redirects
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        req.headers.get("origin") ||
        "http://localhost:3000";

      let productId = process.env.DODO_PRODUCT_ID;
      if (!productId || productId === "default_product_id") {
        try {
          const productList = await dodo.products.list();
          if (productList?.items?.length) {
            productId = productList.items[0].product_id;
          }
        } catch (e) {
          console.warn("Could not auto-list Dodo products:", e);
        }
      }
      if (!productId || productId === "default_product_id") {
        productId = "pdt_0NpujNhrMXeqnSVhODQfh";
      }

      // Prepare customer details (valid email required by Dodo customer API)
      const sanitizedAuthor =
        author.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "fan";
      const customerEmail = `${sanitizedAuthor}@topfastfood.lol`;

      const payment = await dodo.payments.create({
        billing: {
          country: "US", // Default to US, customer can change at checkout
        },
        customer: {
          email: customerEmail,
          name: author,
        },
        product_cart: [
          {
            product_id: productId,
            quantity: 1,
            amount: amount * 100, // Amount in cents ($1 = 100 cents)
          },
        ],
        payment_link: true, // Generate hosted checkout payment link
        return_url: `${baseUrl}?payment=success`,
        metadata,
      });

      // The frontend redirects the user to this link to pay
      return NextResponse.json({
        success: true,
        paymentLink: payment.payment_link || "",
        mode: isTestMode ? "test" : "live",
      });
    } catch (error: any) {
      console.error("DodoPayments Error:", error);
      const detail = error?.message || (typeof error === "string" ? error : "Payment initialization failed");
      return NextResponse.json(
        { error: `Payment failed (${detail}). Please try again.` },
        { status: 500 }
      );
    }
  }

  // FALLBACK DEMO FLOW (No API Keys configured)
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({
      success: true,
      receiptNumber: `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      mode: "local",
    });
  }

  // Demo DB update (trusts the client because it's a demo)
  const { data: brand, error: fetchError } = await supabase
    .from("brands")
    .select("*")
    .eq("id", brandId)
    .single();

  if (fetchError || !brand) {
    return NextResponse.json({ error: "Brand not found." }, { status: 404 });
  }

  const newScore = actionType === "BOOST" ? brand.total_score + amount : brand.total_score - amount;
  const newBoosts = actionType === "BOOST" ? brand.total_boosts + amount : brand.total_boosts;
  const newSabotages = actionType === "SABOTAGE" ? brand.total_sabotages + amount : brand.total_sabotages;
  const receiptNumber = `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  await supabase
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

  await supabase.from("transactions").insert({
    brand_id: brandId,
    brand_name: brand.name,
    action_type: actionType,
    amount,
    message,
    author,
    receipt_number: receiptNumber,
  });

  return NextResponse.json({
    success: true,
    receiptNumber,
    newScore,
    newBoosts,
    newSabotages,
    mode: "demo",
  });
}
