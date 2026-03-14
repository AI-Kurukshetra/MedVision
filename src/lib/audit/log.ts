import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuditAction =
  | "assign"
  | "create"
  | "delete"
  | "download"
  | "finalize"
  | "login"
  | "update"
  | "upload"
  | "view";

type AuditInput = {
  action: AuditAction;
  entityId?: string | null;
  entityType: string;
  metadata?: Record<string, unknown>;
};

export async function logAuditEvent(input: AuditInput) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, organization_id")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile?.organization_id) {
    return;
  }

  await supabase.from("audit_logs").insert({
    action: input.action,
    entity_id: input.entityId ?? null,
    entity_type: input.entityType,
    metadata: input.metadata ?? {},
    organization_id: profile.organization_id,
    user_id: userData.user.id,
  });
}
