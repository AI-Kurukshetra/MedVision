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

function maybeValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  return value.length > 0 ? value : null;
}

export async function createStudyAction(formData: FormData) {
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  const patientId = textValue(formData, "patientId");
  const studyCode = textValue(formData, "studyCode");
  const modality = textValue(formData, "modality") || "xray";
  const priority = textValue(formData, "priority") || "normal";
  const status = textValue(formData, "status") || "draft";

  if (!patientId || !studyCode) {
    redirect("/studies/new?error=Patient+and+study+code+are+required");
  }

  const { data, error } = await supabase
    .from("studies")
    .insert({
      assigned_radiologist_id: maybeValue(formData, "assignedRadiologistId"),
      body_part: maybeValue(formData, "bodyPart"),
      created_by: profile.id,
      modality,
      notes: maybeValue(formData, "notes"),
      ordered_by: maybeValue(formData, "orderedBy"),
      organization_id: profile.organization_id,
      patient_id: patientId,
      priority,
      status,
      study_code: studyCode,
      technician_id: maybeValue(formData, "technicianId"),
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/studies/new?error=${encodeURIComponent(error?.message ?? "Failed to create study")}`);
  }

  await logAuditEvent({
    action: "create",
    entityId: data.id,
    entityType: "study",
    metadata: {
      priority,
      status,
      study_code: studyCode,
    },
  });

  revalidatePath("/studies");
  revalidatePath(`/studies/${data.id}`);
  redirect(`/studies/${data.id}?message=Study+created`);
}

export async function updateStudyAction(formData: FormData) {
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  const studyId = textValue(formData, "studyId");
  const patientId = textValue(formData, "patientId");
  const studyCode = textValue(formData, "studyCode");
  const modality = textValue(formData, "modality") || "xray";
  const priority = textValue(formData, "priority") || "normal";
  const status = textValue(formData, "status") || "draft";

  if (!studyId || !patientId || !studyCode) {
    redirect("/studies?error=Missing+required+study+fields");
  }

  const { error } = await supabase
    .from("studies")
    .update({
      assigned_radiologist_id: maybeValue(formData, "assignedRadiologistId"),
      body_part: maybeValue(formData, "bodyPart"),
      modality,
      notes: maybeValue(formData, "notes"),
      ordered_by: maybeValue(formData, "orderedBy"),
      patient_id: patientId,
      priority,
      status,
      study_code: studyCode,
      technician_id: maybeValue(formData, "technicianId"),
    })
    .eq("id", studyId)
    .eq("organization_id", profile.organization_id);

  if (error) {
    redirect(`/studies/${studyId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  await logAuditEvent({
    action: "update",
    entityId: studyId,
    entityType: "study",
    metadata: {
      priority,
      status,
      study_code: studyCode,
    },
  });

  revalidatePath("/studies");
  revalidatePath(`/studies/${studyId}`);
  redirect(`/studies/${studyId}?message=Study+updated`);
}

function sanitizeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function uploadStudyImageAction(formData: FormData) {
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  const studyId = textValue(formData, "studyId");
  const markPrimary = formData.get("isPrimary") === "on";
  const imageFile = formData.get("imageFile");

  if (!studyId) {
    redirect("/studies?error=Missing+study+identifier+for+upload");
  }

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    redirect(`/viewer/${studyId}?error=Please+select+an+image+file`);
  }

  if (!imageFile.type.startsWith("image/")) {
    redirect(`/viewer/${studyId}?error=Only+image+files+are+supported`);
  }

  const { data: study, error: studyError } = await supabase
    .from("studies")
    .select("id")
    .eq("id", studyId)
    .eq("organization_id", profile.organization_id)
    .maybeSingle();

  if (studyError || !study) {
    redirect(`/viewer/${studyId}?error=${encodeURIComponent(studyError?.message ?? "Study not found")}`);
  }

  const safeName = sanitizeFileName(imageFile.name || "upload-image");
  const storagePath = `org/${profile.organization_id}/studies/${studyId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("study-images")
    .upload(storagePath, imageFile, {
      contentType: imageFile.type,
      upsert: false,
    });

  if (uploadError) {
    redirect(`/viewer/${studyId}?error=${encodeURIComponent(uploadError.message)}`);
  }

  if (markPrimary) {
    await supabase
      .from("study_images")
      .update({ is_primary: false })
      .eq("organization_id", profile.organization_id)
      .eq("study_id", studyId);
  }

  const { error: insertError } = await supabase.from("study_images").insert({
    file_name: imageFile.name,
    file_size: imageFile.size,
    is_primary: markPrimary,
    mime_type: imageFile.type || "application/octet-stream",
    organization_id: profile.organization_id,
    storage_path: storagePath,
    study_id: studyId,
    uploaded_by: profile.id,
  });

  if (insertError) {
    await supabase.storage.from("study-images").remove([storagePath]);
    redirect(`/viewer/${studyId}?error=${encodeURIComponent(insertError.message)}`);
  }

  await logAuditEvent({
    action: "upload",
    entityType: "study_image",
    metadata: {
      file_name: imageFile.name,
      is_primary: markPrimary,
      study_id: studyId,
    },
  });

  revalidatePath(`/viewer/${studyId}`);
  revalidatePath(`/studies/${studyId}`);
  redirect(`/viewer/${studyId}?message=Image+uploaded`);
}
