import Link from "next/link";

import { updateStudyAction } from "@/app/(dashboard)/studies/actions";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EditStudyPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditStudyPage({ params, searchParams }: EditStudyPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  const [{ data: study, error: studyError }, { data: patients, error: patientsError }, { data: staff, error: staffError }] =
    await Promise.all([
      supabase
        .from("studies")
        .select(
          "id, patient_id, study_code, modality, body_part, priority, status, ordered_by, assigned_radiologist_id, technician_id, notes",
        )
        .eq("id", id)
        .eq("organization_id", profile.organization_id)
        .maybeSingle(),
      supabase
        .from("patients")
        .select("id, patient_code, full_name")
        .eq("organization_id", profile.organization_id)
        .order("full_name", { ascending: true }),
      supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("organization_id", profile.organization_id)
        .in("role", ["radiologist", "technician"])
        .order("full_name", { ascending: true }),
    ]);

  if (studyError) {
    throw new Error(`Failed to load study for editing: ${studyError.message}`);
  }

  if (patientsError) {
    throw new Error(`Failed to load patients for study editing: ${patientsError.message}`);
  }

  if (staffError) {
    throw new Error(`Failed to load staff for study editing: ${staffError.message}`);
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

  const radiologists = (staff ?? []).filter((person) => person.role === "radiologist");
  const technicians = (staff ?? []).filter((person) => person.role === "technician");

  return (
    <main className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Studies</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">Edit study</h2>
          <p className="mt-1 text-sm text-muted">{study.study_code}</p>
        </div>
        <Link
          href={`/studies/${study.id}`}
          className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
        >
          Cancel
        </Link>
      </div>

      {query.error ? (
        <p className="mt-4 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-foreground">
          {query.error}
        </p>
      ) : null}

      <form action={updateStudyAction} className="mt-6 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="studyId" value={study.id} />

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Patient</span>
          <select
            required
            name="patientId"
            defaultValue={study.patient_id}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          >
            {(patients ?? []).map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.full_name} ({patient.patient_code})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Study code</span>
          <input
            required
            name="studyCode"
            defaultValue={study.study_code}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Modality</span>
          <input
            name="modality"
            defaultValue={study.modality}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Body part</span>
          <input
            name="bodyPart"
            defaultValue={study.body_part ?? ""}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Priority</span>
          <select
            name="priority"
            defaultValue={study.priority}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Status</span>
          <select
            name="status"
            defaultValue={study.status}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          >
            <option value="draft">Draft</option>
            <option value="uploaded">Uploaded</option>
            <option value="under_review">Under review</option>
            <option value="reported">Reported</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Ordered by</span>
          <input
            name="orderedBy"
            defaultValue={study.ordered_by ?? ""}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Radiologist</span>
          <select
            name="assignedRadiologistId"
            defaultValue={study.assigned_radiologist_id ?? ""}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          >
            <option value="">Unassigned</option>
            {radiologists.map((radiologist) => (
              <option key={radiologist.id} value={radiologist.id}>
                {radiologist.full_name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Technician</span>
          <select
            name="technicianId"
            defaultValue={study.technician_id ?? ""}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          >
            <option value="">Unassigned</option>
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.full_name}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Notes</span>
          <textarea
            name="notes"
            rows={4}
            defaultValue={study.notes ?? ""}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          />
        </label>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong"
          >
            Update study
          </button>
        </div>
      </form>
    </main>
  );
}
