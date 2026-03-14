import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/current-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AuditLogsPage() {
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  if (profile.role !== "admin") {
    redirect("/dashboard?error=Only+admins+can+access+audit+logs");
  }

  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select("id, entity_type, entity_id, action, metadata, created_at, profiles(id, full_name)")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false })
    .limit(150);

  if (error) {
    throw new Error(`Failed to load audit logs: ${error.message}`);
  }

  return (
    <main className="space-y-4">
      <section className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Admin</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
              Audit log
            </h2>
            <p className="mt-1 text-sm text-muted">Critical system actions by entity, user, and timestamp.</p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
          >
            Back to dashboard
          </Link>
        </div>
      </section>

      <section className="rounded-[1.4rem] border border-line bg-panel p-3 shadow-[var(--shadow)]">
        {(logs ?? []).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th className="border-b border-line px-3 py-3 text-xs uppercase tracking-[0.18em] text-muted">
                    Time
                  </th>
                  <th className="border-b border-line px-3 py-3 text-xs uppercase tracking-[0.18em] text-muted">
                    Entity
                  </th>
                  <th className="border-b border-line px-3 py-3 text-xs uppercase tracking-[0.18em] text-muted">
                    Action
                  </th>
                  <th className="border-b border-line px-3 py-3 text-xs uppercase tracking-[0.18em] text-muted">
                    User
                  </th>
                  <th className="border-b border-line px-3 py-3 text-xs uppercase tracking-[0.18em] text-muted">
                    Metadata
                  </th>
                </tr>
              </thead>
              <tbody>
                {(logs ?? []).map((log) => {
                  const actor = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles;
                  return (
                    <tr key={log.id}>
                      <td className="border-b border-line/70 px-3 py-3 text-xs text-muted">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="border-b border-line/70 px-3 py-3 text-sm text-foreground">
                        {log.entity_type}
                        {log.entity_id ? ` (${log.entity_id.slice(0, 8)}...)` : ""}
                      </td>
                      <td className="border-b border-line/70 px-3 py-3 text-sm text-foreground">
                        {log.action}
                      </td>
                      <td className="border-b border-line/70 px-3 py-3 text-sm text-muted">
                        {actor?.full_name ?? "system"}
                      </td>
                      <td className="border-b border-line/70 px-3 py-3 font-mono text-xs text-muted">
                        {JSON.stringify(log.metadata ?? {})}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-line bg-white/70 p-6 text-sm text-muted">
            No audit logs recorded yet.
          </p>
        )}
      </section>
    </main>
  );
}
