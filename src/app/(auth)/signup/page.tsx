import Link from "next/link";
import { redirect } from "next/navigation";

import { signUpAction } from "@/app/(auth)/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SignupPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-10 sm:px-8">
      <section className="w-full rounded-[2rem] border border-line bg-panel p-8 shadow-[var(--shadow)]">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">
          MedVision onboarding
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground">
          Create account
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          Set up your account to access the clinic imaging workspace.
        </p>

        {params.message ? (
          <p className="mt-4 rounded-xl border border-accent/30 bg-accent-soft/70 px-3 py-2 text-sm text-accent-strong">
            {params.message}
          </p>
        ) : null}

        {params.error ? (
          <p className="mt-4 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-foreground">
            {params.error}
          </p>
        ) : null}

        <form action={signUpAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Full name</span>
            <input
              name="fullName"
              type="text"
              className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Email</span>
            <input
              required
              name="email"
              type="email"
              className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Password</span>
            <input
              required
              minLength={8}
              name="password"
              type="password"
              className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong"
          >
            Create account
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-full border border-line bg-white/80 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-white"
          >
            Sign in instead
          </Link>
          <Link
            href="/"
            className="rounded-full border border-line bg-white/80 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-white"
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
