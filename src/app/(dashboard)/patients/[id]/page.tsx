import Link from "next/link";

import { getCurrentProfile } from "@/lib/auth/current-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PatientDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function PatientDetailPage({ params, searchParams }: PatientDetailPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select(
      "id, patient_code, full_name, dob, gender, phone, email, address, medical_history, created_at, updated_at",
    )
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .maybeSingle();

  if (patientError) {
    throw new Error(`Failed to load patient: ${patientError.message}`);
  }

  if (!patient) {
    return (
      <main className="rounded-[1.4rem] border border-line bg-panel p-6 shadow-[var(--shadow)]">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">Patient not found</h2>
        <p className="mt-2 text-sm leading-7 text-muted">
          The record may not exist or may belong to another organization.
        </p>
        <Link
          href="/patients"
          className="mt-4 inline-flex rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
        >
          Back to patients
        </Link>
      </main>
    );
  }

  const { data: studies, error: studiesError } = await supabase
    .from("studies")
    .select("id, study_code, modality, body_part, priority, status, study_date, created_at")
    .eq("organization_id", profile.organization_id)
    .eq("patient_id", patient.id)
    .order("study_date", { ascending: false });

  if (studiesError) {
    throw new Error(`Failed to load patient studies: ${studiesError.message}`);
  }

  return (
    <main className="space-y-4">
      <section className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Patient detail</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
              {patient.full_name}
            </h2>
            <p className="mt-1 text-sm text-muted">Code: {patient.patient_code}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/patients"
              className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
            >
              Back
            </Link>
            <Link
              href={`/patients/${patient.id}/edit`}
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
            >
              Edit patient
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
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">DOB</p>
            <p className="mt-1 text-sm text-foreground">{patient.dob || "Unspecified"}</p>
          </div>
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Gender</p>
            <p className="mt-1 text-sm text-foreground">{patient.gender || "Unspecified"}</p>
          </div>
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Phone</p>
            <p className="mt-1 text-sm text-foreground">{patient.phone || "None"}</p>
          </div>
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5 sm:col-span-2 lg:col-span-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Email</p>
            <p className="mt-1 text-sm text-foreground">{patient.email || "None"}</p>
          </div>
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5 sm:col-span-2 lg:col-span-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Address</p>
            <p className="mt-1 text-sm text-foreground">{patient.address || "None"}</p>
          </div>
          <div className="rounded-xl border border-line bg-white/80 px-3 py-2.5 sm:col-span-2 lg:col-span-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              Medical history
            </p>
            <p className="mt-1 text-sm leading-7 text-foreground">{patient.medical_history || "None"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Study timeline</p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-foreground">
              Patient studies
            </h3>
          </div>
        </div>

        {studies && studies.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {studies.map((study) => (
              <li key={study.id} className="rounded-xl border border-line bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{study.study_code}</p>
                    <p className="mt-1 text-xs text-muted">
                      {study.modality} {study.body_part ? `- ${study.body_part}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">{study.status}</p>
                    <p className="mt-1 text-xs text-muted">Priority: {study.priority}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted">
                  Study date: {new Date(study.study_date).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-line bg-white/70 p-5 text-sm text-muted">
            No studies linked to this patient yet.
          </p>
        )}
      </section>
    </main>
  );
}
