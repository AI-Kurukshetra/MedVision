import Link from "next/link";

import { uploadStudyImageAction } from "@/app/(dashboard)/studies/actions";
import {
  createAnnotationAction,
  deleteAnnotationAction,
  updateAnnotationAction,
} from "@/app/(dashboard)/viewer/actions";
import { StudyImageViewer } from "@/components/viewer/study-image-viewer";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ViewerPageProps = {
  params: Promise<{
    studyId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    imageId?: string;
    message?: string;
  }>;
};

export default async function ViewerPage({ params, searchParams }: ViewerPageProps) {
  const [{ studyId }, query] = await Promise.all([params, searchParams]);
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  const { data: study, error: studyError } = await supabase
    .from("studies")
    .select("id, study_code, patient_id, patients(full_name, patient_code)")
    .eq("id", studyId)
    .eq("organization_id", profile.organization_id)
    .maybeSingle();

  if (studyError) {
    throw new Error(`Failed to load study for viewer: ${studyError.message}`);
  }

  if (!study) {
    return (
      <main className="rounded-[1.4rem] border border-line bg-panel p-6 shadow-[var(--shadow)]">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">Study not found</h2>
        <p className="mt-2 text-sm leading-7 text-muted">
          Viewer requires an existing study within your organization.
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

  const { data: images, error: imageError } = await supabase
    .from("study_images")
    .select("id, file_name, storage_path, mime_type, is_primary, created_at")
    .eq("organization_id", profile.organization_id)
    .eq("study_id", studyId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false });

  if (imageError) {
    throw new Error(`Failed to load study images: ${imageError.message}`);
  }

  const { data: annotations, error: annotationError } = await supabase
    .from("annotations")
    .select("id, type, data, note, created_by, created_at, profiles(id, full_name)")
    .eq("organization_id", profile.organization_id)
    .eq("study_id", studyId)
    .order("created_at", { ascending: false });

  if (annotationError) {
    throw new Error(`Failed to load annotations: ${annotationError.message}`);
  }

  const selectedImage =
    (images ?? []).find((item) => item.id === query.imageId) || (images ?? [])[0] || null;

  let imageUrl: string | null = null;
  if (selectedImage) {
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("study-images")
      .createSignedUrl(selectedImage.storage_path, 60 * 60);

    if (!signedUrlError && signedUrlData?.signedUrl) {
      imageUrl = signedUrlData.signedUrl;
    }
  }

  const patient = Array.isArray(study.patients) ? study.patients[0] : study.patients;

  return (
    <main className="space-y-4">
      <section className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Viewer</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
              {study.study_code}
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
              href={`/reports/${studyId}`}
              className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
            >
              Report editor
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
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Upload study image</p>
        <form action={uploadStudyImageAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <input type="hidden" name="studyId" value={studyId} />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Image file</span>
            <input
              required
              name="imageFile"
              type="file"
              accept="image/*"
              className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm text-foreground outline-none ring-accent/25 transition file:mr-3 file:rounded-full file:border-0 file:bg-accent-soft file:px-3 file:py-1 file:text-xs file:font-semibold file:text-accent-strong focus:ring-4"
            />
          </label>
          <label className="inline-flex items-center gap-2 rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm text-foreground">
            <input type="checkbox" name="isPrimary" />
            Mark as primary
          </label>
          <button
            type="submit"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong sm:col-span-2 sm:justify-self-start"
          >
            Upload image
          </button>
        </form>
      </section>

      <section className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Image viewer</p>
        <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-foreground">
          Zoom, pan, brightness, and contrast controls
        </h3>
        <div className="mt-4">
          <StudyImageViewer imageUrl={imageUrl} />
        </div>
      </section>

      <section className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Annotations</p>
        <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-foreground">
          Add findings and notes
        </h3>

        <form action={createAnnotationAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="studyId" value={studyId} />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Annotation type</span>
            <select
              name="annotationType"
              className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
            >
              <option value="point">Point</option>
              <option value="rect">Rectangle</option>
              <option value="line">Line</option>
              <option value="text">Text</option>
              <option value="freehand">Freehand</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Related image</span>
            <select
              name="studyImageId"
              defaultValue={selectedImage?.id ?? ""}
              className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
            >
              <option value="">No specific image</option>
              {(images ?? []).map((image) => (
                <option key={image.id} value={image.id}>
                  {image.file_name}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Note</span>
            <input
              name="note"
              placeholder="Example: opacity at lower right lung field"
              className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 text-sm outline-none ring-accent/25 transition focus:ring-4"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Overlay data (JSON)</span>
            <textarea
              name="dataJson"
              rows={3}
              defaultValue='{"x": 0.5, "y": 0.5}'
              className="w-full rounded-xl border border-line bg-white/85 px-3 py-2.5 font-mono text-xs outline-none ring-accent/25 transition focus:ring-4"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong"
            >
              Save annotation
            </button>
          </div>
        </form>

        {(annotations ?? []).length > 0 ? (
          <ul className="mt-5 space-y-3">
            {(annotations ?? []).map((annotation) => {
              const creator = Array.isArray(annotation.profiles)
                ? annotation.profiles[0]
                : annotation.profiles;
              const canEdit = profile.role === "admin" || annotation.created_by === profile.id;

              return (
                <li key={annotation.id} className="rounded-xl border border-line bg-white/80 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{annotation.type}</p>
                      <p className="mt-1 text-xs text-muted">
                        by {creator?.full_name ?? "Unknown"} at{" "}
                        {new Date(annotation.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <form action={updateAnnotationAction} className="mt-3 grid gap-3 sm:grid-cols-2">
                    <input type="hidden" name="studyId" value={studyId} />
                    <input type="hidden" name="annotationId" value={annotation.id} />
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-xs font-medium uppercase tracking-[0.16em] text-muted">
                        Note
                      </span>
                      <input
                        name="note"
                        defaultValue={annotation.note ?? ""}
                        disabled={!canEdit}
                        className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none ring-accent/25 transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-xs font-medium uppercase tracking-[0.16em] text-muted">
                        Overlay data
                      </span>
                      <textarea
                        name="dataJson"
                        rows={3}
                        defaultValue={JSON.stringify(annotation.data ?? {}, null, 2)}
                        disabled={!canEdit}
                        className="w-full rounded-xl border border-line bg-white px-3 py-2 font-mono text-xs outline-none ring-accent/25 transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70"
                      />
                    </label>
                    <div className="sm:col-span-2">
                      {canEdit ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="submit"
                            className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-white/90"
                          >
                            Update
                          </button>
                          <button
                            formAction={deleteAnnotationAction}
                            type="submit"
                            className="rounded-full border border-warning/40 bg-warning/10 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-warning/20"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-muted">
                          Only the creator or an admin can edit this annotation.
                        </p>
                      )}
                    </div>
                  </form>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-line bg-white/70 p-5 text-sm text-muted">
            No annotations created yet.
          </p>
        )}
      </section>

      <section className="rounded-[1.4rem] border border-line bg-panel p-5 shadow-[var(--shadow)]">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Image list</p>
        {(images ?? []).length > 0 ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(images ?? []).map((image) => (
              <li key={image.id} className="rounded-xl border border-line bg-white/80 p-4">
                <p className="truncate text-sm font-semibold text-foreground">{image.file_name}</p>
                <p className="mt-1 text-xs text-muted">{image.mime_type}</p>
                <p className="mt-1 text-xs text-muted">{image.is_primary ? "Primary image" : "Secondary image"}</p>
                <Link
                  href={`/viewer/${studyId}?imageId=${image.id}`}
                  className="mt-3 inline-flex rounded-full border border-line bg-white/90 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-white"
                >
                  Open in viewer
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-line bg-white/70 p-5 text-sm text-muted">
            No study images uploaded yet.
          </p>
        )}
      </section>
    </main>
  );
}
