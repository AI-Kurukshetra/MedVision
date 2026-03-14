import Link from "next/link";

export function CtaBanner() {
  return (
    <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-[var(--shadow)] sm:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.26em] text-muted">
            Ready for demo
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
            Enter the MedVision workspace
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            Start with a role-based account to move from intake to final report.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-line bg-white/85 px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-white"
          >
            Get started
          </Link>
        </div>
      </div>
    </section>
  );
}
