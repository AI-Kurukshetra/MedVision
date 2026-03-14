const steps = [
  {
    copy: "Register patient records with clear identifiers and baseline history.",
    title: "Intake",
  },
  {
    copy: "Upload X-ray or study images and route cases by urgency and role.",
    title: "Acquire",
  },
  {
    copy: "Open the viewer, inspect scans, and document structured findings.",
    title: "Review",
  },
  {
    copy: "Finalize reports and keep clinicians aligned with status updates.",
    title: "Report",
  },
];

export function Workflow() {
  return (
    <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-[var(--shadow)] sm:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.26em] text-muted">
            Workflow
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
            One scan lifecycle in a single view
          </h2>
        </div>
        <p className="hidden max-w-xs text-sm leading-6 text-muted md:block">
          Built for teams that need speed and consistency without heavy IT overhead.
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => (
          <article
            key={step.title}
            className="rounded-2xl border border-line bg-white/78 p-5"
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              0{index + 1}
            </p>
            <h3 className="mt-3 text-lg font-semibold text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm leading-7 text-muted">{step.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
