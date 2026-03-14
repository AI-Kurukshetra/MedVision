import Link from "next/link";

import { getCurrentProfile } from "@/lib/auth/current-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AnalyticsPage() {
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  const [
    { count: studiesToday, error: studiesTodayError },
    { count: pendingReports, error: pendingReportsError },
    { data: studiesByStatus, error: studiesByStatusError },
    { data: studiesByPriority, error: studiesByPriorityError },
    { data: finalizedReports, error: finalizedReportsError },
  ] = await Promise.all([
    supabase
      .from("studies")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", profile.organization_id)
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", profile.organization_id)
      .eq("status", "draft"),
    supabase
      .from("studies")
      .select("status")
      .eq("organization_id", profile.organization_id),
    supabase
      .from("studies")
      .select("priority")
      .eq("organization_id", profile.organization_id),
    supabase
      .from("reports")
      .select("created_at, finalized_at")
      .eq("organization_id", profile.organization_id)
      .eq("status", "final")
      .not("finalized_at", "is", null),
  ]);

  if (
    studiesTodayError ||
    pendingReportsError ||
    studiesByStatusError ||
    studiesByPriorityError ||
    finalizedReportsError
  ) {
    throw new Error(
      studiesTodayError?.message ||
        pendingReportsError?.message ||
        studiesByStatusError?.message ||
        studiesByPriorityError?.message ||
        finalizedReportsError?.message ||
        "Failed to load analytics data",
    );
  }

  const statusCounts = (studiesByStatus ?? []).reduce<Record<string, number>>((acc, row) => {
    const key = row.status ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const priorityCounts = (studiesByPriority ?? []).reduce<Record<string, number>>((acc, row) => {
    const key = row.priority ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const avgTurnaroundHours = (() => {
    if (!finalizedReports || finalizedReports.length === 0) {
      return null;
    }

    const hours = finalizedReports.map((report) => {
      const createdAt = new Date(report.created_at).getTime();
      const finalizedAt = new Date(report.finalized_at as string).getTime();
      return Math.max(0, (finalizedAt - createdAt) / (1000 * 60 * 60));
    });

    return (hours.reduce((sum, value) => sum + value, 0) / hours.length).toFixed(1);
  })();

  return (
    <main className="space-y-4">
      <section className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Analytics</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
              Operational KPI dashboard
            </h2>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
          >
            Back to dashboard
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Studies today</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
            {studiesToday ?? 0}
          </p>
        </article>
        <article className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Pending reports</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
            {pendingReports ?? 0}
          </p>
        </article>
        <article className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
            Avg turnaround (hrs)
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
            {avgTurnaroundHours ?? "N/A"}
          </p>
        </article>
        <article className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Tracked statuses</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
            {Object.keys(statusCounts).length}
          </p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Study count by status</p>
          {Object.keys(statusCounts).length > 0 ? (
            <ul className="mt-3 space-y-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <li key={status} className="flex items-center justify-between rounded-xl border border-line bg-white/80 px-3 py-2">
                  <span className="text-sm text-foreground">{status}</span>
                  <span className="text-sm font-semibold text-foreground">{count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-xl border border-dashed border-line bg-white/70 p-4 text-sm text-muted">
              No status data yet.
            </p>
          )}
        </article>

        <article className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Study count by priority</p>
          {Object.keys(priorityCounts).length > 0 ? (
            <ul className="mt-3 space-y-2">
              {Object.entries(priorityCounts).map(([priority, count]) => (
                <li
                  key={priority}
                  className="flex items-center justify-between rounded-xl border border-line bg-white/80 px-3 py-2"
                >
                  <span className="text-sm text-foreground">{priority}</span>
                  <span className="text-sm font-semibold text-foreground">{count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-xl border border-dashed border-line bg-white/70 p-4 text-sm text-muted">
              No priority data yet.
            </p>
          )}
        </article>
      </section>
    </main>
  );
}
