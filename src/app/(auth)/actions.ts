"use server";

import { redirect } from "next/navigation";

import { getSiteUrl } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function toMessage(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function signInAction(formData: FormData) {
  const email = toMessage(formData.get("email"));
  const password = toMessage(formData.get("password"));

  if (!email || !password) {
    redirect("/login?error=Email+and+password+are+required");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signUpAction(formData: FormData) {
  const fullName = toMessage(formData.get("fullName"));
  const email = toMessage(formData.get("email"));
  const password = toMessage(formData.get("password"));

  if (!email || !password) {
    redirect("/signup?error=Email+and+password+are+required");
  }

  const supabase = await createSupabaseServerClient();
  const emailRedirectTo = `${getSiteUrl()}/auth/callback`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || undefined,
      },
      emailRedirectTo,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect("/login?message=Check+your+email+to+confirm+your+account");
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login?message=Signed+out");
}
