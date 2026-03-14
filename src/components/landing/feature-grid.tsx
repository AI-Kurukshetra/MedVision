const features = [
  {
    description: "Patient timeline, search, and study history in one workspace.",
    title: "Patient management",
  },
  {
    description: "Status, priority, and staff assignment for daily scan operations.",
    title: "Study worklist",
  },
  {
    description: "Viewer controls with overlays for findings and contextual notes.",
    title: "Image review",
  },
  {
    description: "Structured reporting with findings, impression, and recommendations.",
    title: "Reporting workflow",
  },
  {
    description: "Track critical user actions by entity, actor, and timestamp.",
    title: "Audit trail",
  },
  {
    description: "Operational KPIs for throughput, pending studies, and turnaround.",
    title: "Analytics",
  },
];

export function FeatureGrid() {
  return (
    <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-[var(--shadow)] sm:p-8">
      <p className="font-mono text-xs uppercase tracking-[0.26em] text-muted">
        Feature highlights
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
        Core modules aligned to clinic reality
      </h2>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-line bg-white/80 p-5"
          >
            <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
            <p className="mt-2 text-sm leading-7 text-muted">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
