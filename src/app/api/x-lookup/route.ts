import { NextResponse } from "next/server";
import { getClientIp, createRateLimiter } from "@/lib/security";

const lookupLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
});

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const { isLimited } = lookupLimiter.check(ip);
  if (isLimited) {
    return NextResponse.json(
      { error: "Too many lookup requests. Please slow down." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle");

  if (!handle) {
    return NextResponse.json({ error: "Handle is required." }, { status: 400 });
  }

  const cleanHandle = handle.replace(/^@/, "").trim().toLowerCase();

  // Twitter/X handles: alphanumeric + underscores, 1 to 15 characters
  if (!/^[a-zA-Z0-9_]{1,15}$/.test(cleanHandle)) {
    return NextResponse.json(
      { error: "Invalid X handle format." },
      { status: 400 }
    );
  }

  const avatarUrl = `https://unavatar.io/x/${cleanHandle}`;
  const profileUrl = `https://x.com/${cleanHandle}`;

  return NextResponse.json(
    {
      handle: `@${cleanHandle}`,
      cleanHandle,
      avatarUrl,
      profileUrl,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
