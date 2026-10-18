import { NextResponse } from "next/server";
import { isValidOrigin, getClientIp, createRateLimiter } from "@/lib/security";
import { validateContent } from "@/lib/moderation";

// Rate limiting: 5 feedback submissions per 10 minutes per IP
const feedbackLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 5,
});

const WEB3FORMS_ACCESS_KEY =
  process.env.WEB3FORMS_ACCESS_KEY || "f139beb4-ae4a-4838-8aba-d50af8577d88";

export async function POST(req: Request) {
  // 1. Origin verification
  if (!isValidOrigin(req)) {
    return NextResponse.json(
      { error: "Unauthorized request origin." },
      { status: 403 }
    );
  }

  // 2. IP rate limiting
  const ip = getClientIp(req);
  const { isLimited, resetInSec } = feedbackLimiter.check(ip);
  if (isLimited) {
    return NextResponse.json(
      {
        error: `Too many submissions. Please wait ${resetInSec} seconds before sending more feedback.`,
      },
      { status: 429 }
    );
  }

  // 3. Body validation
  let body: {
    category?: string;
    author?: string;
    email?: string;
    message?: string;
    pageUrl?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { category, author, email, message, pageUrl } = body;

  const trimmedMsg = (message || "").trim();
  if (!trimmedMsg || trimmedMsg.length < 5 || trimmedMsg.length > 1000) {
    return NextResponse.json(
      { error: "Feedback message must be between 5 and 1000 characters." },
      { status: 400 }
    );
  }

  // 4. Content moderation
  const msgCheck = validateContent(trimmedMsg.slice(0, 40), "message");
  if (!msgCheck.isValid) {
    return NextResponse.json(
      { error: msgCheck.reason || "Message contains prohibited content." },
      { status: 422 }
    );
  }

  const cleanAuthor = (author || "Anonymous Fan").trim().slice(0, 50);
  const cleanCategory = (category || "General Feedback").trim().slice(0, 50);
  const cleanEmail = email ? email.trim().slice(0, 100) : undefined;

  // Basic email syntax check if provided
  if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  // 5. Secure server-to-server dispatch to Web3Forms
  try {
    const web3Payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `[TOPFASTFOOD ${cleanCategory}] From ${cleanAuthor}`,
      from_name: "topfastfood.lol Feedback",
      name: cleanAuthor,
      email: cleanEmail,
      category: cleanCategory,
      message: trimmedMsg,
      page_url: pageUrl ? String(pageUrl).slice(0, 200) : "unknown",
      submitted_at: new Date().toISOString(),
    };

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(web3Payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      console.warn("[FEEDBACK] Web3Forms dispatch failed:", data);
      return NextResponse.json(
        { error: "Could not deliver feedback at this time. Please try again later." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[FEEDBACK] Exception during delivery:", err);
    return NextResponse.json(
      { error: "Internal server error delivering feedback." },
      { status: 500 }
    );
  }
}
