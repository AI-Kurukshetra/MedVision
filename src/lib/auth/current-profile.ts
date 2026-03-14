import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentProfile = {
  email: string;
  full_name: string;
  id: string;
  organization_id: string;
  role: "admin" | "radiologist" | "technician" | "doctor";
};

export async function getCurrentProfile(): Promise<CurrentProfile> {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, organization_id, full_name, email, role")
    .eq("id", userData.user.id)
    .single();

  if (profileError || !profile) {
    throw new Error(`Unable to load profile for authenticated user: ${profileError?.message}`);
  }

  return profile as CurrentProfile;
}
