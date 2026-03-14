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

async function saveReport(formData: FormData, status: "draft" | "final") {
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  if (!["admin", "radiologist"].includes(profile.role)) {
    redirect("/dashboard?error=Only+admin+or+radiologist+can+edit+reports");
  }

  const studyId = textValue(formData, "studyId");

  if (!studyId) {
    redirect("/studies?error=Missing+study+identifier+for+report");
  }

  const { data: study, error: studyError } = await supabase
    .from("studies")
    .select("id, assigned_radiologist_id")
    .eq("id", studyId)
    .eq("organization_id", profile.organization_id)
    .maybeSingle();

  if (studyError || !study) {
    redirect(`/reports/${studyId}?error=${encodeURIComponent(studyError?.message ?? "Study not found")}`);
  }

  const { data: existing, error: existingError } = await supabase
    .from("reports")
    .select("id, radiologist_id")
    .eq("organization_id", profile.organization_id)
    .eq("study_id", studyId)
    .maybeSingle();

  if (existingError) {
    redirect(`/reports/${studyId}?error=${encodeURIComponent(existingError.message)}`);
  }

  if (profile.role === "radiologist" && existing?.radiologist_id && existing.radiologist_id !== profile.id) {
    redirect(`/reports/${studyId}?error=This+report+is+assigned+to+another+radiologist`);
  }

  const chosenRadiologistId =
    profile.role === "radiologist"
      ? profile.id
      : existing?.radiologist_id || study.assigned_radiologist_id || null;

  const payload = {
    ai_summary: maybeTextValue(formData, "aiSummary"),
    finalized_at: status === "final" ? new Date().toISOString() : null,
    findings: maybeTextValue(formData, "findings"),
    impression: maybeTextValue(formData, "impression"),
    organization_id: profile.organization_id,
    radiologist_id: chosenRadiologistId,
    recommendations: maybeTextValue(formData, "recommendations"),
    status,
    study_id: studyId,
  };

  if (existing) {
    const { error } = await supabase
      .from("reports")
      .update(payload)
      .eq("id", existing.id)
      .eq("organization_id", profile.organization_id);

    if (error) {
      redirect(`/reports/${studyId}?error=${encodeURIComponent(error.message)}`);
    }
  } else {
    const { error } = await supabase.from("reports").insert(payload);

    if (error) {
      redirect(`/reports/${studyId}?error=${encodeURIComponent(error.message)}`);
    }
  }

  await logAuditEvent({
    action: status === "final" ? "finalize" : "update",
    entityType: "report",
    metadata: {
      status,
      study_id: studyId,
    },
  });

  revalidatePath(`/reports/${studyId}`);
  revalidatePath(`/studies/${studyId}`);
  redirect(`/reports/${studyId}?message=Report+${status === "final" ? "finalized" : "saved+as+draft"}`);
}

export async function saveReportDraftAction(formData: FormData) {
  await saveReport(formData, "draft");
}

export async function finalizeReportAction(formData: FormData) {
  await saveReport(formData, "final");
}

export async function generateAiDraftAction(formData: FormData) {
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();

  if (!["admin", "radiologist"].includes(profile.role)) {
    redirect("/dashboard?error=Only+admin+or+radiologist+can+generate+AI+drafts");
  }

  const studyId = textValue(formData, "studyId");
  if (!studyId) {
    redirect("/studies?error=Missing+study+identifier+for+AI+draft");
  }

  const [
    { data: study, error: studyError },
    { data: report, error: reportError },
    { data: analyses, error: analysesError },
    { data: annotations, error: annotationsError },
  ] = await Promise.all([
    supabase
      .from("studies")
      .select("id, study_code, modality, body_part, priority, status, notes, assigned_radiologist_id")
      .eq("id", studyId)
      .eq("organization_id", profile.organization_id)
      .maybeSingle(),
    supabase
      .from("reports")
      .select("id, radiologist_id, status")
      .eq("organization_id", profile.organization_id)
      .eq("study_id", studyId)
      .maybeSingle(),
    supabase
      .from("ai_analyses")
      .select(
        "suggested_findings, suggested_impression, quality_score, quality_notes, abnormality_flag, confidence, created_at",
      )
      .eq("organization_id", profile.organization_id)
      .eq("study_id", studyId)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("annotations")
      .select("type, note")
      .eq("organization_id", profile.organization_id)
      .eq("study_id", studyId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (studyError || !study) {
    redirect(`/reports/${studyId}?error=${encodeURIComponent(studyError?.message ?? "Study not found")}`);
  }
  if (reportError) {
    redirect(`/reports/${studyId}?error=${encodeURIComponent(reportError.message)}`);
  }
  if (analysesError || annotationsError) {
    redirect(
      `/reports/${studyId}?error=${encodeURIComponent(analysesError?.message ?? annotationsError?.message ?? "Failed to load AI inputs")}`,
    );
  }

  if (report?.status === "final") {
    redirect(`/reports/${studyId}?error=Report+is+already+finalized`);
  }

  if (profile.role === "radiologist" && report?.radiologist_id && report.radiologist_id !== profile.id) {
    redirect(`/reports/${studyId}?error=This+report+is+assigned+to+another+radiologist`);
  }

  const latestAnalysis = analyses?.[0];
  const annotationHints = (annotations ?? [])
    .map((item) => item.note?.trim())
    .filter((value): value is string => Boolean(value))
    .slice(0, 3);

  const aiFindings =
    latestAnalysis?.suggested_findings ||
    `Study ${study.study_code} (${study.modality}${study.body_part ? `, ${study.body_part}` : ""}) reviewed with priority ${study.priority}.`;
  const aiImpression =
    latestAnalysis?.suggested_impression ||
    (latestAnalysis?.abnormality_flag
      ? "Findings suggest an abnormal pattern that warrants clinical correlation."
      : "No high-confidence acute abnormality identified from the available context.");
  const aiRecommendations =
    latestAnalysis?.abnormality_flag
      ? "Recommend radiologist confirmation and correlate with clinical symptoms."
      : "Recommend standard follow-up according to clinical protocol.";

  const aiSummaryLines = [
    `Draft generated from study context ${study.study_code}.`,
    latestAnalysis?.confidence != null ? `AI confidence: ${latestAnalysis.confidence}%.` : null,
    latestAnalysis?.quality_score != null ? `Image quality score: ${latestAnalysis.quality_score}.` : null,
    latestAnalysis?.quality_notes ? `Quality notes: ${latestAnalysis.quality_notes}` : null,
    annotationHints.length > 0 ? `Annotation hints: ${annotationHints.join(" | ")}` : null,
  ].filter((line): line is string => Boolean(line));

  const radiologistId =
    profile.role === "radiologist"
      ? profile.id
      : report?.radiologist_id || study.assigned_radiologist_id || null;

  const payload = {
    ai_summary: aiSummaryLines.join(" "),
    findings: aiFindings,
    impression: aiImpression,
    organization_id: profile.organization_id,
    radiologist_id: radiologistId,
    recommendations: aiRecommendations,
    status: "draft" as const,
    study_id: studyId,
  };

  if (report) {
    const { error } = await supabase
      .from("reports")
      .update(payload)
      .eq("id", report.id)
      .eq("organization_id", profile.organization_id);

    if (error) {
      redirect(`/reports/${studyId}?error=${encodeURIComponent(error.message)}`);
    }
  } else {
    const { error } = await supabase.from("reports").insert(payload);

    if (error) {
      redirect(`/reports/${studyId}?error=${encodeURIComponent(error.message)}`);
    }
  }

  await logAuditEvent({
    action: "update",
    entityType: "report_ai_draft",
    metadata: {
      source: "phase10_ai_assistant",
      study_id: studyId,
    },
  });

  revalidatePath(`/reports/${studyId}`);
  revalidatePath(`/studies/${studyId}`);
  redirect(`/reports/${studyId}?message=AI+draft+generated`);
}
