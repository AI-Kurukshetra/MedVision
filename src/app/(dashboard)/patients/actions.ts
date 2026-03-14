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

export async function createPatientAction(formData: FormData) {
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  const patientCode = textValue(formData, "patientCode");
  const fullName = textValue(formData, "fullName");

  if (!patientCode || !fullName) {
    redirect("/patients/new?error=Patient+code+and+full+name+are+required");
  }

  const { data, error } = await supabase
    .from("patients")
    .insert({
      address: maybeValue(formData, "address"),
      created_by: profile.id,
      dob: maybeValue(formData, "dob"),
      email: maybeValue(formData, "email"),
      full_name: fullName,
      gender: maybeValue(formData, "gender"),
      medical_history: maybeValue(formData, "medicalHistory"),
      organization_id: profile.organization_id,
      patient_code: patientCode,
      phone: maybeValue(formData, "phone"),
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/patients/new?error=${encodeURIComponent(error?.message ?? "Failed to create patient")}`);
  }

  await logAuditEvent({
    action: "create",
    entityId: data.id,
    entityType: "patient",
    metadata: {
      patient_code: patientCode,
    },
  });

  revalidatePath("/patients");
  revalidatePath(`/patients/${data.id}`);
  redirect(`/patients/${data.id}?message=Patient+created`);
}

export async function updatePatientAction(formData: FormData) {
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  const patientId = textValue(formData, "patientId");
  const patientCode = textValue(formData, "patientCode");
  const fullName = textValue(formData, "fullName");

  if (!patientId || !patientCode || !fullName) {
    redirect("/patients?error=Missing+required+patient+fields");
  }

  const { error } = await supabase
    .from("patients")
    .update({
      address: maybeValue(formData, "address"),
      dob: maybeValue(formData, "dob"),
      email: maybeValue(formData, "email"),
      full_name: fullName,
      gender: maybeValue(formData, "gender"),
      medical_history: maybeValue(formData, "medicalHistory"),
      patient_code: patientCode,
      phone: maybeValue(formData, "phone"),
    })
    .eq("id", patientId)
    .eq("organization_id", profile.organization_id);

  if (error) {
    redirect(`/patients/${patientId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  await logAuditEvent({
    action: "update",
    entityId: patientId,
    entityType: "patient",
    metadata: {
      patient_code: patientCode,
    },
  });

  revalidatePath("/patients");
  revalidatePath(`/patients/${patientId}`);
  redirect(`/patients/${patientId}?message=Patient+updated`);
}
