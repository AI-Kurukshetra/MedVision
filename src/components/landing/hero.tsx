import Link from "next/link";

const metrics = [
  { label: "Avg report turnaround", value: "< 2h" },
  { label: "Workflow visibility", value: "Real-time" },
  { label: "Deployment mode", value: "Cloud-first" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-line bg-panel px-6 py-10 shadow-[var(--shadow)] sm:px-8 sm:py-12">
      <div className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-accent-soft/60 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-warning/20 blur-3xl" />

      <div className="relative">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">
          MedVision
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl">
          AI-assisted radiology workflow for clinics with limited infrastructure.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-muted sm:text-lg">
          Coordinate intake, scan review, annotations, and reporting in one
          secure cloud workspace designed for smaller healthcare teams.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
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

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-2xl border border-line bg-white/75 px-4 py-3"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                {metric.label}
              </p>
              <p className="mt-2 text-xl font-semibold text-foreground">
                {metric.value}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
