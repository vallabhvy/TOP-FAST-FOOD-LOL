import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export async function POST(req: Request) {
  try {
    // 2. Parse Request
    const body = await req.json();
    const { transactionId, voteType, deviceId } = body;

    if (!transactionId || (voteType !== 'LIKE' && voteType !== 'DISLIKE') || !deviceId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 3. Call Secure RPC Function
    const { data, error } = await supabase.rpc("vote_transaction", {
      p_transaction_id: transactionId,
      p_ip_address: deviceId, // We use the deviceId as the 'ip_address' field in the DB to avoid schema changes
      p_vote_type: voteType
    });

    if (error) {
      console.error("Voting RPC Error:", error);
      return NextResponse.json({ error: "Failed to process vote" }, { status: 500 });
    }

    return NextResponse.json({ success: true, result: data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
