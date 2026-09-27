import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle");

  if (!handle) {
    return NextResponse.json({ error: "Handle is required" }, { status: 400 });
  }

  const cleanHandle = handle.replace(/^@/, "").trim().toLowerCase();

  if (!/^[a-zA-Z0-9_]{1,15}$/.test(cleanHandle)) {
    return NextResponse.json(
      { error: "Invalid X handle format" },
      { status: 400 }
    );
  }

  const avatarUrl = `https://unavatar.io/x/${cleanHandle}`;
  const profileUrl = `https://x.com/${cleanHandle}`;

  return NextResponse.json({
    handle: `@${cleanHandle}`,
    cleanHandle,
    avatarUrl,
    profileUrl,
  });
}
