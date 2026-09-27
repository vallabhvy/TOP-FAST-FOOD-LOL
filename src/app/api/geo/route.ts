import { NextResponse } from "next/server";

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function GET(req: Request) {
  const headers = new Headers(req.headers);
  const city = headers.get("x-vercel-ip-city");
  const region = headers.get("x-vercel-ip-country-region");
  const country = headers.get("x-vercel-ip-country") || "US";

  let detectedLocation = "Austin, TX 🤠";

  if (city && region) {
    detectedLocation = `${safeDecode(city)}, ${region}`;
  } else if (city) {
    detectedLocation = `${safeDecode(city)}, ${country}`;
  } else if (region) {
    detectedLocation = `${region}, ${country}`;
  }

  return NextResponse.json({
    location: detectedLocation,
    city: city ? safeDecode(city) : null,
    region,
    country,
  });
}
