const columns = [
  {
    points: [
      "Patient and study metadata panel",
      "Priority badges and assignment context",
      "Recent activity and report status",
    ],
    title: "Worklist context",
  },
  {
    points: [
      "Image viewport with zoom and pan controls",
      "Annotation layer for findings and notes",
      "Brightness and contrast adjustments",
    ],
    title: "Viewer controls",
  },
  {
    points: [
      "Structured report sections",
      "Draft and finalize actions",
      "Audit events for key transitions",
    ],
    title: "Reporting output",
  },
];

export function ProductPreview() {
  return (
    <section className="rounded-[2rem] border border-line bg-[#10251f] p-6 text-white shadow-[var(--shadow)] sm:p-8">
      <p className="font-mono text-xs uppercase tracking-[0.26em] text-white/65">
        Product preview
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
        Dashboard visual language for the demo
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75">
        This panel mirrors the intended in-app look so public visitors and signed-in
        users experience one cohesive product system.
      </p>

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        {columns.map((column) => (
          <article
            key={column.title}
            className="rounded-2xl border border-white/15 bg-white/8 p-5"
          >
            <h3 className="text-base font-semibold">{column.title}</h3>
            <ul className="mt-3 space-y-2">
              {column.points.map((point) => (
                <li key={point} className="text-sm leading-7 text-white/75">
                  {point}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
