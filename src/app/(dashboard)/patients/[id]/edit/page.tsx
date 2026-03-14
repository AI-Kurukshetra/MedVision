import Link from "next/link";

import { updatePatientAction } from "@/app/(dashboard)/patients/actions";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EditPatientPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditPatientPage({ params, searchParams }: EditPatientPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  const { data: patient, error } = await supabase
    .from("patients")
    .select("id, patient_code, full_name, dob, gender, phone, email, address, medical_history")
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load patient for editing: ${error.message}`);
  }

  if (!patient) {
    return (
      <main className="rounded-[1.4rem] border border-line bg-panel p-6 shadow-[var(--shadow)]">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">Patient not found</h2>
        <Link
          href="/patients"
          className="mt-4 inline-flex rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
        >
          Back to patients
        </Link>
      </main>
    );
  }

  return (
    <main className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Patients</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
            Edit patient
          </h2>
          <p className="mt-1 text-sm text-muted">{patient.full_name}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/patients/${patient.id}`}
            className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
          >
            Cancel
          </Link>
        </div>
      </div>

      {query.error ? (
        <p className="mt-4 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-foreground">
          {query.error}
        </p>
      ) : null}

      <form action={updatePatientAction} className="mt-6 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="patientId" value={patient.id} />

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Patient code</span>
          <input
            required
            name="patientCode"
            defaultValue={patient.patient_code}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Full name</span>
          <input
            required
            name="fullName"
            defaultValue={patient.full_name}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Date of birth</span>
          <input
            name="dob"
            type="date"
            defaultValue={patient.dob ?? ""}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Gender</span>
          <select
            name="gender"
            defaultValue={patient.gender ?? ""}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          >
            <option value="">Unspecified</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Phone</span>
          <input
            name="phone"
            defaultValue={patient.phone ?? ""}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Email</span>
          <input
            name="email"
            type="email"
            defaultValue={patient.email ?? ""}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Address</span>
          <input
            name="address"
            defaultValue={patient.address ?? ""}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Medical history</span>
          <textarea
            name="medicalHistory"
            rows={4}
            defaultValue={patient.medical_history ?? ""}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          />
        </label>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong"
          >
            Update patient
          </button>
        </div>
      </form>
    </main>
  );
}
