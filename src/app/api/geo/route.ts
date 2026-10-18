import { NextResponse } from "next/server";
import { getClientIp, createRateLimiter, sanitizeHeader } from "@/lib/security";

const geoLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
});

function safeDecode(value: string | null): string {
  if (!value) return "";
  try {
    const decoded = decodeURIComponent(value);
    return sanitizeHeader(decoded, 50);
  } catch {
    return sanitizeHeader(value, 50);
  }
}

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const { isLimited } = geoLimiter.check(ip);
  if (isLimited) {
    return NextResponse.json(
      { error: "Too many geo requests." },
      { status: 429 }
    );
  }

  const headers = new Headers(req.headers);
  const rawCity = headers.get("x-vercel-ip-city");
  const rawRegion = headers.get("x-vercel-ip-country-region");
  const rawCountry = headers.get("x-vercel-ip-country") || "US";

  const city = safeDecode(rawCity);
  const region = safeDecode(rawRegion);
  const country = sanitizeHeader(rawCountry, 10);

  let detectedLocation = "Austin, TX 🤠";

  if (city && region) {
    detectedLocation = `${city}, ${region}`;
  } else if (city) {
    detectedLocation = `${city}, ${country}`;
  } else if (region) {
    detectedLocation = `${region}, ${country}`;
  }

  return NextResponse.json(
    {
      location: detectedLocation,
      city: city || null,
      region: region || null,
      country,
    },
    {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    }
  );
}
