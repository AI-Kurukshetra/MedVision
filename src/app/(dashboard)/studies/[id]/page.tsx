import Link from "next/link";

import { getCurrentProfile } from "@/lib/auth/current-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type StudyDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function StudyDetailPage({ params, searchParams }: StudyDetailPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  const { data: study, error: studyError } = await supabase
    .from("studies")
    .select(
      "id, study_code, modality, body_part, priority, status, ordered_by, notes, study_date, patient_id, assigned_radiologist_id, technician_id, patients(id, full_name, patient_code), assigned_radiologist:profiles!studies_assigned_radiologist_id_fkey(id, full_name), technician:profiles!studies_technician_id_fkey(id, full_name)",
    )
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .maybeSingle();

  if (studyError) {
    throw new Error(`Failed to load study: ${studyError.message}`);
  }

  if (!study) {
    return (
      <main className="rounded-[1.4rem] border border-line bg-panel p-6 shadow-[var(--shadow)]">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">Study not found</h2>
        <p className="mt-2 text-sm leading-7 text-muted">
          The study may not exist or belongs to a different organization.
        </p>
        <Link
          href="/studies"
          className="mt-4 inline-flex rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
        >
          Back to studies
        </Link>
      </main>
    );
  }

  const patient = Array.isArray(study.patients) ? study.patients[0] : study.patients;
  const assignedRadiologist = Array.isArray(study.assigned_radiologist)
    ? study.assigned_radiologist[0]
    : study.assigned_radiologist;
  const assignedTechnician = Array.isArray(study.technician)
    ? study.technician[0]
    : study.technician;

  const { data: images, error: imagesError } = await supabase
    .from("study_images")
    .select("id, file_name, mime_type, is_primary, created_at")
    .eq("organization_id", profile.organization_id)
    .eq("study_id", study.id)
    .order("created_at", { ascending: false });

  if (imagesError) {
    throw new Error(`Failed to load study images: ${imagesError.message}`);
  }

  return (
    <main className="space-y-4">
      <section className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Study detail</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
              {study.study_code}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Patient: {patient?.full_name ?? "Unknown"} ({patient?.patient_code ?? "N/A"})
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/studies"
              className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
            >
              Back
            </Link>
            <Link
              href={`/viewer/${study.id}`}
              className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
            >
              Open viewer
            </Link>
            <Link
              href={`/reports/${study.id}`}
              className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
            >
              Report editor
            </Link>
            <Link
              href={`/studies/${study.id}/edit`}
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
            >
              Edit study
            </Link>
          </div>
        </div>

        {query.message ? (
          <p className="mt-4 rounded-xl border border-accent/30 bg-accent-soft/70 px-3 py-2 text-sm text-accent-strong">
            {query.message}
          </p>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Modality</p>
            <p className="mt-1 text-sm text-foreground">{study.modality}</p>
          </div>
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Body part</p>
            <p className="mt-1 text-sm text-foreground">{study.body_part ?? "Unspecified"}</p>
          </div>
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Study date</p>
            <p className="mt-1 text-sm text-foreground">{new Date(study.study_date).toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Priority</p>
            <p className="mt-1 text-sm text-foreground">{study.priority}</p>
          </div>
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Status</p>
            <p className="mt-1 text-sm text-foreground">{study.status}</p>
          </div>
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Ordered by</p>
            <p className="mt-1 text-sm text-foreground">{study.ordered_by ?? "Unspecified"}</p>
          </div>
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Radiologist</p>
            <p className="mt-1 text-sm text-foreground">{assignedRadiologist?.full_name ?? "Unassigned"}</p>
          </div>
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Technician</p>
            <p className="mt-1 text-sm text-foreground">{assignedTechnician?.full_name ?? "Unassigned"}</p>
          </div>
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5 sm:col-span-2 lg:col-span-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Notes</p>
            <p className="mt-1 text-sm leading-7 text-foreground">{study.notes ?? "No notes"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Image metadata</p>
        <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-foreground">Uploaded images</h3>
        {images && images.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {images.map((image) => (
              <li key={image.id} className="rounded-xl border border-line bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{image.file_name}</p>
                    <p className="mt-1 text-xs text-muted">{image.mime_type}</p>
                  </div>
                  <p className="text-xs text-muted">{image.is_primary ? "Primary image" : "Secondary image"}</p>
                </div>
                <Link
                  href={`/viewer/${study.id}?imageId=${image.id}`}
                  className="mt-3 inline-flex rounded-full border border-line bg-white/90 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-white"
                >
                  View image
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-line bg-white/70 p-5 text-sm text-muted">
            No image metadata has been added to this study yet.
          </p>
        )}
      </section>
    </main>
  );
}
