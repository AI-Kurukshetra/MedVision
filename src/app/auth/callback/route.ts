import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = url.searchParams.get("next");
  const next = nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${getSiteUrl()}/login?error=Missing+auth+code`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${getSiteUrl()}/login?error=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${getSiteUrl()}${next}`);
}
