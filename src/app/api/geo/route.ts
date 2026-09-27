import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const headers = new Headers(req.headers);
  const city = headers.get("x-vercel-ip-city");
  const region = headers.get("x-vercel-ip-country-region");
  const country = headers.get("x-vercel-ip-country") || "US";

  let detectedLocation = "Austin, TX 🤠";

  if (city && region) {
    detectedLocation = `${decodeURIComponent(city)}, ${region}`;
  } else if (city) {
    detectedLocation = `${decodeURIComponent(city)}, ${country}`;
  } else if (region) {
    detectedLocation = `${region}, ${country}`;
  }

  return NextResponse.json({
    location: detectedLocation,
    city: city ? decodeURIComponent(city) : null,
    region,
    country,
  });
}
