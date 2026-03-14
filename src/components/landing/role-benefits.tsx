const roles = [
  {
    body: "Monitor users, case throughput, and organization-level activity in one place.",
    name: "Admin",
  },
  {
    body: "Create studies quickly, upload images, and keep workflow status current.",
    name: "Technician",
  },
  {
    body: "Work from prioritized queues, annotate findings, and finalize reports.",
    name: "Radiologist",
  },
  {
    body: "Follow study progress and review finalized results for patient decisions.",
    name: "Referring doctor",
  },
];

export function RoleBenefits() {
  return (
    <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-[var(--shadow)] sm:p-8">
      <p className="font-mono text-xs uppercase tracking-[0.26em] text-muted">
        Role-based value
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
        Shared system, focused responsibilities
      </h2>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {roles.map((role) => (
          <article
            key={role.name}
            className="rounded-2xl border border-line bg-white/78 p-5"
          >
            <h3 className="text-base font-semibold text-foreground">{role.name}</h3>
            <p className="mt-2 text-sm leading-7 text-muted">{role.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
