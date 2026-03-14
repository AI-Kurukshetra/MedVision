export default function PatientDetailLoading() {
  return (
    <main className="rounded-[1.4rem] border border-line bg-panel p-6 shadow-[var(--shadow)]">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Patient detail</p>
      <p className="mt-2 text-sm text-muted">Loading patient profile and study timeline...</p>
    </main>
  );
}
