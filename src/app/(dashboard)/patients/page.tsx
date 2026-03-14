import Link from "next/link";

import { getCurrentProfile } from "@/lib/auth/current-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PatientsPageProps = {
  searchParams: Promise<{
    gender?: string;
    q?: string;
  }>;
};

function cleanTerm(value: string) {
  return value.replace(/,/g, " ").trim();
}

export default async function PatientsPage({ searchParams }: PatientsPageProps) {
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();
  const queryText = params.q ? cleanTerm(params.q) : "";
  const gender = params.gender || "";

  let query = supabase
    .from("patients")
    .select("id, patient_code, full_name, dob, gender, phone, email, created_at")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false });

  if (queryText) {
    query = query.or(`full_name.ilike.%${queryText}%,patient_code.ilike.%${queryText}%`);
  }

  if (gender) {
    query = query.eq("gender", gender);
  }

  const { data: patients, error } = await query;

  if (error) {
    throw new Error(`Failed to load patients: ${error.message}`);
  }

  return (
    <main className="space-y-4">
      <section className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Patients</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
              Patient management
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              Search and filter patients within your organization scope.
            </p>
          </div>

          <Link
            href="/patients/new"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong"
          >
            New patient
          </Link>
        </div>

        <form className="mt-5 grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
          <input
            name="q"
            placeholder="Search by full name or patient code"
            defaultValue={queryText}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          />
          <select
            name="gender"
            defaultValue={gender}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          >
            <option value="">All genders</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
          <button
            type="submit"
            className="rounded-xl border border-line bg-white/85 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-white"
          >
            Apply
          </button>
        </form>
      </section>

      <section className="rounded-[1.4rem] border border-line bg-panel p-3 shadow-[var(--shadow)]">
        {patients && patients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th className="border-b border-line px-3 py-3 text-xs uppercase tracking-[0.18em] text-muted">
                    Code
                  </th>
                  <th className="border-b border-line px-3 py-3 text-xs uppercase tracking-[0.18em] text-muted">
                    Name
                  </th>
                  <th className="border-b border-line px-3 py-3 text-xs uppercase tracking-[0.18em] text-muted">
                    Gender
                  </th>
                  <th className="border-b border-line px-3 py-3 text-xs uppercase tracking-[0.18em] text-muted">
                    Contact
                  </th>
                  <th className="border-b border-line px-3 py-3 text-xs uppercase tracking-[0.18em] text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="border-b border-line/70 px-3 py-3 text-sm font-medium text-foreground">
                      {patient.patient_code}
                    </td>
                    <td className="border-b border-line/70 px-3 py-3 text-sm text-foreground">
                      {patient.full_name}
                    </td>
                    <td className="border-b border-line/70 px-3 py-3 text-sm text-muted">
                      {patient.gender || "Unspecified"}
                    </td>
                    <td className="border-b border-line/70 px-3 py-3 text-sm text-muted">
                      {patient.phone || patient.email || "No contact"}
                    </td>
                    <td className="border-b border-line/70 px-3 py-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/patients/${patient.id}`}
                          className="rounded-full border border-line bg-white/80 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-white"
                        >
                          Open
                        </Link>
                        <Link
                          href={`/patients/${patient.id}/edit`}
                          className="rounded-full border border-line bg-white/80 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-white"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-line bg-white/70 p-8 text-center">
            <p className="text-sm text-muted">No patients found. Create the first patient record.</p>
            <Link
              href="/patients/new"
              className="mt-4 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
            >
              Create patient
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
