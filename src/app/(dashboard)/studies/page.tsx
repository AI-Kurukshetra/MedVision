import Link from "next/link";

import { getCurrentProfile } from "@/lib/auth/current-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type StudiesPageProps = {
  searchParams: Promise<{
    priority?: string;
    q?: string;
    scope?: string;
    status?: string;
  }>;
};

function sanitizeTerm(value: string) {
  return value.replace(/,/g, " ").trim();
}

export default async function StudiesPage({ searchParams }: StudiesPageProps) {
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  const q = params.q ? sanitizeTerm(params.q) : "";
  const status = params.status || "";
  const priority = params.priority || "";
  const scope = params.scope || "all";

  let query = supabase
    .from("studies")
    .select(
      "id, study_code, modality, body_part, priority, status, study_date, patient_id, assigned_radiologist_id, technician_id, patients(id, full_name, patient_code)",
    )
    .eq("organization_id", profile.organization_id)
    .order("study_date", { ascending: false });

  if (q) {
    query = query.or(`study_code.ilike.%${q}%,modality.ilike.%${q}%,body_part.ilike.%${q}%`);
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (priority) {
    query = query.eq("priority", priority);
  }

  if (scope === "assigned") {
    query = query.eq("assigned_radiologist_id", profile.id);
  }

  const { data: studies, error } = await query;

  if (error) {
    throw new Error(`Failed to load studies: ${error.message}`);
  }

  return (
    <main className="space-y-4">
      <section className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Studies</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
              Study worklist
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              Track studies by status, priority, and assigned radiologist queue.
            </p>
          </div>
          <Link
            href="/studies/new"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong"
          >
            New study
          </Link>
        </div>

        <form className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search code/modality/body part"
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4 lg:col-span-2"
          />
          <select
            name="status"
            defaultValue={status}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="uploaded">Uploaded</option>
            <option value="under_review">Under review</option>
            <option value="reported">Reported</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          <select
            name="priority"
            defaultValue={priority}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
          </select>
          <select
            name="scope"
            defaultValue={scope}
            className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
          >
            <option value="all">All studies</option>
            <option value="assigned">Assigned to me</option>
          </select>
          <button
            type="submit"
            className="rounded-xl border border-line bg-white/85 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-white sm:col-span-2 lg:col-span-5"
          >
            Apply filters
          </button>
        </form>
      </section>

      <section className="rounded-[1.4rem] border border-line bg-panel p-3 shadow-[var(--shadow)]">
        {studies && studies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th className="border-b border-line px-3 py-3 text-xs uppercase tracking-[0.18em] text-muted">
                    Code
                  </th>
                  <th className="border-b border-line px-3 py-3 text-xs uppercase tracking-[0.18em] text-muted">
                    Patient
                  </th>
                  <th className="border-b border-line px-3 py-3 text-xs uppercase tracking-[0.18em] text-muted">
                    Modality
                  </th>
                  <th className="border-b border-line px-3 py-3 text-xs uppercase tracking-[0.18em] text-muted">
                    Priority
                  </th>
                  <th className="border-b border-line px-3 py-3 text-xs uppercase tracking-[0.18em] text-muted">
                    Status
                  </th>
                  <th className="border-b border-line px-3 py-3 text-xs uppercase tracking-[0.18em] text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {studies.map((study) => (
                  <tr key={study.id}>
                    {(() => {
                      const patient = Array.isArray(study.patients)
                        ? study.patients[0]
                        : study.patients;

                      return (
                        <>
                    <td className="border-b border-line/70 px-3 py-3 text-sm font-medium text-foreground">
                      {study.study_code}
                    </td>
                    <td className="border-b border-line/70 px-3 py-3 text-sm text-foreground">
                      {patient?.full_name ?? "Unknown"}{" "}
                      <span className="text-xs text-muted">
                        ({patient?.patient_code ?? "N/A"})
                      </span>
                    </td>
                    <td className="border-b border-line/70 px-3 py-3 text-sm text-muted">
                      {study.modality}
                      {study.body_part ? ` - ${study.body_part}` : ""}
                    </td>
                    <td className="border-b border-line/70 px-3 py-3 text-sm text-muted">
                      {study.priority}
                    </td>
                    <td className="border-b border-line/70 px-3 py-3 text-sm text-muted">
                      {study.status}
                    </td>
                    <td className="border-b border-line/70 px-3 py-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/studies/${study.id}`}
                          className="rounded-full border border-line bg-white/80 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-white"
                        >
                          Open
                        </Link>
                        <Link
                          href={`/studies/${study.id}/edit`}
                          className="rounded-full border border-line bg-white/80 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-white"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                        </>
                      );
                    })()}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-line bg-white/70 p-8 text-center">
            <p className="text-sm text-muted">No studies match the selected filters.</p>
            <Link
              href="/studies/new"
              className="mt-4 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
            >
              Create study
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
