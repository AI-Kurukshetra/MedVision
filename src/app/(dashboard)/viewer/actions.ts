"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/current-profile";
import { logAuditEvent } from "@/lib/audit/log";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function maybeTextValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  return value.length > 0 ? value : null;
}

function parseAnnotationData(raw: string) {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return null;
  }
}

export async function createAnnotationAction(formData: FormData) {
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  if (!["admin", "radiologist", "doctor"].includes(profile.role)) {
    redirect("/dashboard?error=You+do+not+have+permission+to+create+annotations");
  }

  const studyId = textValue(formData, "studyId");
  const studyImageId = maybeTextValue(formData, "studyImageId");
  const annotationType = textValue(formData, "annotationType") || "text";
  const note = maybeTextValue(formData, "note");
  const dataRaw = textValue(formData, "dataJson");
  const data = parseAnnotationData(dataRaw);

  if (!studyId) {
    redirect("/studies?error=Missing+study+identifier");
  }

  if (data === null) {
    redirect(`/viewer/${studyId}?error=Annotation+data+must+be+valid+JSON`);
  }

  const { data: created, error } = await supabase
    .from("annotations")
    .insert({
    created_by: profile.id,
    data,
    note,
    organization_id: profile.organization_id,
    study_id: studyId,
    study_image_id: studyImageId,
    type: annotationType,
    })
    .select("id")
    .single();

  if (error || !created) {
    redirect(
      `/viewer/${studyId}?error=${encodeURIComponent(error?.message ?? "Failed to create annotation")}`,
    );
  }

  await logAuditEvent({
    action: "create",
    entityId: created.id,
    entityType: "annotation",
    metadata: {
      study_id: studyId,
      type: annotationType,
    },
  });

  revalidatePath(`/viewer/${studyId}`);
  redirect(`/viewer/${studyId}?message=Annotation+created`);
}

export async function updateAnnotationAction(formData: FormData) {
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  const annotationId = textValue(formData, "annotationId");
  const studyId = textValue(formData, "studyId");
  const note = maybeTextValue(formData, "note");
  const dataRaw = textValue(formData, "dataJson");
  const data = parseAnnotationData(dataRaw);

  if (!annotationId || !studyId) {
    redirect("/studies?error=Missing+annotation+identifier");
  }

  if (data === null) {
    redirect(`/viewer/${studyId}?error=Annotation+data+must+be+valid+JSON`);
  }

  const { data: existing, error: existingError } = await supabase
    .from("annotations")
    .select("id, created_by")
    .eq("id", annotationId)
    .eq("organization_id", profile.organization_id)
    .maybeSingle();

  if (existingError || !existing) {
    redirect(`/viewer/${studyId}?error=${encodeURIComponent(existingError?.message ?? "Annotation not found")}`);
  }

  if (profile.role !== "admin" && existing.created_by !== profile.id) {
    redirect(`/viewer/${studyId}?error=Only+the+creator+or+admin+can+update+this+annotation`);
  }

  const { error } = await supabase
    .from("annotations")
    .update({
      data: data ?? {},
      note,
    })
    .eq("id", annotationId)
    .eq("organization_id", profile.organization_id);

  if (error) {
    redirect(`/viewer/${studyId}?error=${encodeURIComponent(error.message)}`);
  }

  await logAuditEvent({
    action: "update",
    entityId: annotationId,
    entityType: "annotation",
    metadata: {
      study_id: studyId,
    },
  });

  revalidatePath(`/viewer/${studyId}`);
  redirect(`/viewer/${studyId}?message=Annotation+updated`);
}

export async function deleteAnnotationAction(formData: FormData) {
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  const annotationId = textValue(formData, "annotationId");
  const studyId = textValue(formData, "studyId");

  if (!annotationId || !studyId) {
    redirect("/studies?error=Missing+annotation+identifier");
  }

  const { data: existing, error: existingError } = await supabase
    .from("annotations")
    .select("id, created_by")
    .eq("id", annotationId)
    .eq("organization_id", profile.organization_id)
    .maybeSingle();

  if (existingError || !existing) {
    redirect(`/viewer/${studyId}?error=${encodeURIComponent(existingError?.message ?? "Annotation not found")}`);
  }

  if (profile.role !== "admin" && existing.created_by !== profile.id) {
    redirect(`/viewer/${studyId}?error=Only+the+creator+or+admin+can+delete+this+annotation`);
  }

  const { error } = await supabase
    .from("annotations")
    .delete()
    .eq("id", annotationId)
    .eq("organization_id", profile.organization_id);

  if (error) {
    redirect(`/viewer/${studyId}?error=${encodeURIComponent(error.message)}`);
  }

  await logAuditEvent({
    action: "delete",
    entityId: annotationId,
    entityType: "annotation",
    metadata: {
      study_id: studyId,
    },
  });

  revalidatePath(`/viewer/${studyId}`);
  redirect(`/viewer/${studyId}?message=Annotation+deleted`);
}
