import Link from "next/link";

import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/(dashboard)/notifications/actions";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type DashboardPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const query = await searchParams;
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  const [
    { count: totalStudies, error: totalStudiesError },
    { count: pendingStudies, error: pendingStudiesError },
    { count: finalReports, error: finalReportsError },
    { data: notifications, error: notificationsError },
  ] = await Promise.all([
    supabase
      .from("studies")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", profile.organization_id),
    supabase
      .from("studies")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", profile.organization_id)
      .in("status", ["draft", "uploaded", "under_review"]),
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", profile.organization_id)
      .eq("status", "final"),
    supabase
      .from("notifications")
      .select("id, title, message, type, read, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  if (totalStudiesError || pendingStudiesError || finalReportsError || notificationsError) {
    throw new Error(
      totalStudiesError?.message ||
        pendingStudiesError?.message ||
        finalReportsError?.message ||
        notificationsError?.message ||
        "Failed to load dashboard data",
    );
  }

  const unreadCount = (notifications ?? []).filter((item) => !item.read).length;

  return (
    <main className="space-y-4">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Studies total</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
            {totalStudies ?? 0}
          </p>
        </article>
        <article className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Pending studies</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
            {pendingStudies ?? 0}
          </p>
        </article>
        <article className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Final reports</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
            {finalReports ?? 0}
          </p>
        </article>
      </section>

      <section className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Notifications</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-foreground">
              Notification surface
            </h2>
            <p className="mt-1 text-sm text-muted">{unreadCount} unread</p>
          </div>
          <div className="flex gap-2">
            <form action={markAllNotificationsReadAction}>
              <button
                type="submit"
                className="rounded-full border border-line bg-white/85 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
              >
                Mark all read
              </button>
            </form>
            <Link
              href="/analytics"
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
            >
              Open analytics
            </Link>
          </div>
        </div>

        {query.message ? (
          <p className="mt-4 rounded-xl border border-accent/30 bg-accent-soft/70 px-3 py-2 text-sm text-accent-strong">
            {query.message}
          </p>
        ) : null}

        {query.error ? (
          <p className="mt-4 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-foreground">
            {query.error}
          </p>
        ) : null}

        {(notifications ?? []).length > 0 ? (
          <ul className="mt-4 space-y-3">
            {(notifications ?? []).map((notification) => (
              <li
                key={notification.id}
                className={`rounded-xl border p-4 ${
                  notification.read
                    ? "border-line bg-white/75"
                    : "border-accent/35 bg-accent-soft/45"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                    <p className="mt-1 text-sm text-muted">{notification.message}</p>
                    <p className="mt-2 text-xs text-muted">
                      {notification.type} - {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read ? (
                    <form action={markNotificationReadAction}>
                      <input type="hidden" name="notificationId" value={notification.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-white/90"
                      >
                        Mark read
                      </button>
                    </form>
                  ) : (
                    <p className="text-xs text-muted">Read</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-line bg-white/70 p-5 text-sm text-muted">
            No notifications yet. This panel will populate as workflow events produce alerts.
          </p>
        )}
      </section>

      <section className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Next phase</p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">Production deployment</h3>
        <p className="mt-2 text-sm leading-7 text-muted">
          AI draft assistant is now available in the report editor. Next step is
          Vercel production deployment validation.
        </p>
      </section>
    </main>
  );
}
