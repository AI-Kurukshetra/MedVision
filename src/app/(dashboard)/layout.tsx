import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/(auth)/actions";
import { ensureProfileForUser } from "@/lib/auth/profile-bootstrap";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login");
  }

  const profile = await ensureProfileForUser({
    email: data.user.email,
    id: data.user.id,
    user_metadata: {
      full_name:
        typeof data.user.user_metadata?.full_name === "string"
          ? data.user.user_metadata.full_name
          : undefined,
    },
  });

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-6 py-6 sm:px-10 sm:py-8 lg:px-12">
      <header className="mb-4 rounded-[1.6rem] border border-line bg-panel px-5 py-4 shadow-[var(--shadow)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">
              Protected workspace
            </p>
            <h1 className="mt-2 text-xl font-semibold text-foreground">MedVision dashboard</h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white"
            >
              Dashboard
            </Link>
            <Link
              href="/patients"
              className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white"
            >
              Patients
            </Link>
            <Link
              href="/studies"
              className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white"
            >
              Studies
            </Link>
            <Link
              href="/analytics"
              className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white"
            >
              Analytics
            </Link>
            {profile.role === "admin" ? (
              <Link
                href="/admin/audit-logs"
                className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white"
              >
                Audit logs
              </Link>
            ) : null}
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">User</p>
            <p className="mt-1 text-sm font-medium text-foreground">{profile.full_name}</p>
          </div>
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Role</p>
            <p className="mt-1 text-sm font-medium text-foreground">{profile.role}</p>
          </div>
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              Organization
            </p>
            <p className="mt-1 truncate text-sm font-medium text-foreground">
              {profile.organization_id}
            </p>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
