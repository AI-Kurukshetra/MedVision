import Link from "next/link";

import {
  finalizeReportAction,
  generateAiDraftAction,
  saveReportDraftAction,
} from "@/app/(dashboard)/reports/actions";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ReportEditorPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ReportEditorPage({ params, searchParams }: ReportEditorPageProps) {
  const [{ id: studyId }, query] = await Promise.all([params, searchParams]);
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  const { data: study, error: studyError } = await supabase
    .from("studies")
    .select(
      "id, study_code, status, priority, patients(full_name, patient_code), assigned_radiologist:profiles!studies_assigned_radiologist_id_fkey(id, full_name)",
    )
    .eq("id", studyId)
    .eq("organization_id", profile.organization_id)
    .maybeSingle();

  if (studyError) {
    throw new Error(`Failed to load study for report editor: ${studyError.message}`);
  }

  if (!study) {
    return (
      <main className="rounded-[1.4rem] border border-line bg-panel p-6 shadow-[var(--shadow)]">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">Study not found</h2>
        <Link
          href="/studies"
          className="mt-4 inline-flex rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
        >
          Back to studies
        </Link>
      </main>
    );
  }

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select("id, study_id, status, findings, impression, recommendations, ai_summary, finalized_at, radiologist_id")
    .eq("organization_id", profile.organization_id)
    .eq("study_id", studyId)
    .maybeSingle();

  if (reportError) {
    throw new Error(`Failed to load report data: ${reportError.message}`);
  }

  const patient = Array.isArray(study.patients) ? study.patients[0] : study.patients;
  const assignedRadiologist = Array.isArray(study.assigned_radiologist)
    ? study.assigned_radiologist[0]
    : study.assigned_radiologist;
  const canEdit = profile.role === "admin" || profile.role === "radiologist";

  return (
    <main className="space-y-4">
      <section className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Reports</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
              Report editor for {study.study_code}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Patient: {patient?.full_name ?? "Unknown"} ({patient?.patient_code ?? "N/A"})
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/studies/${studyId}`}
              className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
            >
              Study detail
            </Link>
            <Link
              href={`/viewer/${studyId}`}
              className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
            >
              Open viewer
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
      </section>

      <section className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Study status</p>
            <p className="mt-1 text-sm text-foreground">{study.status}</p>
          </div>
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Priority</p>
            <p className="mt-1 text-sm text-foreground">{study.priority}</p>
          </div>
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Assigned radiologist</p>
            <p className="mt-1 text-sm text-foreground">{assignedRadiologist?.full_name ?? "Unassigned"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Structured report</p>
        <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-foreground">
          Findings, impression, recommendations
        </h3>

        <form className="mt-4 space-y-4">
          <input type="hidden" name="studyId" value={studyId} />

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Findings</span>
            <textarea
              name="findings"
              rows={6}
              defaultValue={report?.findings ?? ""}
              disabled={!canEdit}
              className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Impression</span>
            <textarea
              name="impression"
              rows={5}
              defaultValue={report?.impression ?? ""}
              disabled={!canEdit}
              className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Recommendations</span>
            <textarea
              name="recommendations"
              rows={5}
              defaultValue={report?.recommendations ?? ""}
              disabled={!canEdit}
              className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">AI summary (optional)</span>
            <textarea
              name="aiSummary"
              rows={4}
              defaultValue={report?.ai_summary ?? ""}
              disabled={!canEdit}
              className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </label>

          {canEdit ? (
            <div className="flex flex-wrap gap-3">
              <button
                formAction={generateAiDraftAction}
                type="submit"
                className="rounded-full border border-line bg-accent-soft px-5 py-2.5 text-sm font-semibold text-accent-strong transition hover:bg-accent-soft/80"
              >
                Generate AI draft
              </button>
              <button
                formAction={saveReportDraftAction}
                type="submit"
                className="rounded-full border border-line bg-white/85 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-white"
              >
                Save draft
              </button>
              <button
                formAction={finalizeReportAction}
                type="submit"
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong"
              >
                Finalize report
              </button>
            </div>
          ) : (
            <p className="rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-foreground">
              Only admins and radiologists can edit reports.
            </p>
          )}
        </form>
      </section>

      <section className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Report state</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Status</p>
            <p className="mt-1 text-sm text-foreground">{report?.status ?? "draft"}</p>
          </div>
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Finalized at</p>
            <p className="mt-1 text-sm text-foreground">
              {report?.finalized_at ? new Date(report.finalized_at).toLocaleString() : "Not finalized"}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
