import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type AuthUser = {
  email?: string;
  id: string;
  user_metadata?: {
    full_name?: string;
  };
};

function normalizeSlug(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function randomSuffix() {
  return crypto.randomUUID().slice(0, 8);
}

function buildOrgName(user: AuthUser) {
  const base = user.user_metadata?.full_name?.trim() || user.email?.split("@")[0] || "Clinic";
  return `${base} Clinic`;
}

function buildOrgSlug(user: AuthUser) {
  const base = user.email?.split("@")[0] || "clinic";
  const normalized = normalizeSlug(base) || "clinic";
  return `${normalized}-${randomSuffix()}`;
}

export async function ensureProfileForUser(user: AuthUser) {
  const admin = createSupabaseAdminClient();

  const { data: existingProfile, error: existingError } = await admin
    .from("profiles")
    .select("id, organization_id, full_name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Failed to load existing profile: ${existingError.message}`);
  }

  if (existingProfile) {
    return existingProfile;
  }

  const { data: organization, error: orgError } = await admin
    .from("organizations")
    .insert({
      name: buildOrgName(user),
      slug: buildOrgSlug(user),
    })
    .select("id")
    .single();

  if (orgError || !organization) {
    throw new Error(`Failed to create organization: ${orgError?.message ?? "unknown error"}`);
  }

  const fullName = user.user_metadata?.full_name?.trim() || user.email?.split("@")[0] || "New User";
  const email = user.email || `${user.id}@unknown.local`;

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .insert({
      email,
      full_name: fullName,
      id: user.id,
      organization_id: organization.id,
      role: "admin",
    })
    .select("id, organization_id, full_name, email, role")
    .single();

  if (profileError || !profile) {
    throw new Error(`Failed to create profile: ${profileError?.message ?? "unknown error"}`);
  }

  return profile;
}
