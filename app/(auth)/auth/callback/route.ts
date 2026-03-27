import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const supabase = await createClient();

  if (code) {
    // OAuth (Google) callback
    await supabase.auth.exchangeCodeForSession(code);
  } else if (token_hash && type) {
    // Magic link / email OTP callback
    await supabase.auth.verifyOtp({
      token_hash,
      type: type as "email" | "magiclink",
    });
  }

  return NextResponse.redirect(`${origin}/today`);
}
