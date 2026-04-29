import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { EdvouraTaskType } from "@/lib/ai/edvouraPromptBuilder";
import { normalizeSubjectName } from "@/lib/ai/lessonNoteBlueprints";
import {
  notifyAiWorkflowEvent,
  publishAiContentAndDistribute,
} from "@/lib/dashboard/distribution";

type AllowedRole = "tutor" | "admin" | "super_admin";

type DraftPayload = {
  title: string;
  subject: string;
  topic: string;
  grade: string;
  skillType: string;
  taskType: EdvouraTaskType;
  contentJson: unknown;
  contentText: string;
  modelUsed: string;
  aiProvider?: string;
  previousContentHashes: string[];
  antiRepetitionItems: Array<{
    itemType: string;
    subject: string;
    topic: string;
    grade: string;
    skillType: string;
    textHash: string;
    originalText: string;
  }>;
};

function mapTaskTypeToLegacyContentType(taskType: EdvouraTaskType) {
  switch (taskType) {
    case "GENERATE_QUIZ":
      return "quiz";
    case "GENERATE_SPELLING":
      return "spelling_bee";
    case "GENERATE_LESSON_NOTE":
    case "GENERATE_LESSON":
      return "lesson_note";
    case "GENERATE_LESSON_PLAN":
      return "lesson_plan";
    case "GENERATE_FINANCIAL_LITERACY":
    case "GENERATE_COMMUNICATION_SKILL":
      return "lesson_note";
    case "ADAPT_LEARNING":
    case "IMPROVE_CONTENT":
    case "REGENERATE_CONTENT":
      return "worksheet";
    default:
      return "lesson_note";
  }
}

function normalizeStatus(value: string) {
  return value.toUpperCase();
}

async function getSessionRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, role: null as AllowedRole | null };
  }

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const roleList = (roles ?? []).map((entry) => entry.role);
  const role = roleList.includes("super_admin")
    ? "super_admin"
    : roleList.includes("admin")
      ? "admin"
      : roleList.includes("tutor")
        ? "tutor"
        : null;

  return { supabase, user, role };
}

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function GET(request: NextRequest) {
  const { supabase, user, role } = await getSessionRole();
  if (!user || !role) return forbidden();

  const scope = request.nextUrl.searchParams.get("scope")?.toUpperCase();

  let query = supabase
    .from("ai_generated_content")
    .select(
      "id,title,subject,topic,grade,skill_type,task_type,status,content_json,content_text,review_note,ai_provider,model_used,created_at,updated_at",
    )
    .order("updated_at", { ascending: false })
    .limit(150);

  if (scope === "TUTOR" || role === "tutor") {
    query = query.eq("generated_by_user_id", user.id);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ records: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { supabase, user, role } = await getSessionRole();
  if (!user || !role) return forbidden();

  const body = await request.json().catch(() => null);
  if (!body?.action || typeof body.action !== "string") {
    return NextResponse.json({ error: "Missing action" }, { status: 400 });
  }

  const action = String(body.action).toUpperCase();

  if (action === "SAVE_DRAFT") {
    if (!["tutor", "admin", "super_admin"].includes(role)) return forbidden();
    const payload = body as { action: string } & DraftPayload;

    if (
      !payload.title ||
      !payload.subject ||
      !payload.topic ||
      !payload.grade ||
      !payload.skillType ||
      !payload.taskType
    ) {
      return NextResponse.json({ error: "Missing required draft fields." }, { status: 400 });
    }

    const normalizedSubject = normalizeSubjectName(payload.subject);

    const { data: inserted, error: insertError } = await supabase
      .from("ai_generated_content")
      .insert({
        title: payload.title,
        subject: normalizedSubject,
        topic: payload.topic,
        grade: payload.grade,
        skill_type: payload.skillType,
        task_type: payload.taskType,
        content_json: payload.contentJson,
        content_text: payload.contentText,
        status: "DRAFT",
        generated_by_user_id: user.id,
        generated_by_role: role,
        model_used: payload.modelUsed,
        ai_provider: payload.aiProvider || "puter",
        previous_content_hashes: payload.previousContentHashes ?? [],
        content_type: mapTaskTypeToLegacyContentType(payload.taskType),
        raw_output: payload.contentJson,
      })
      .select("id,status")
      .single();

    if (insertError || !inserted) {
      return NextResponse.json({ error: insertError?.message || "Failed to save draft." }, { status: 500 });
    }

    if (Array.isArray(payload.antiRepetitionItems) && payload.antiRepetitionItems.length > 0) {
      const antiRows = payload.antiRepetitionItems.map((item) => ({
        content_id: inserted.id,
        item_type: item.itemType,
        subject: normalizeSubjectName(item.subject),
        topic: item.topic,
        grade: item.grade,
        skill_type: item.skillType,
        text_hash: item.textHash,
        original_text: item.originalText,
      }));
      await supabase.from("anti_repetition_items").upsert(antiRows, { onConflict: "text_hash" });
    }

    return NextResponse.json({ record: inserted });
  }

  if (action === "SUBMIT_FOR_REVIEW") {
    if (!body.contentId) {
      return NextResponse.json({ error: "Missing contentId" }, { status: 400 });
    }

    const { data: target, error: targetError } = await supabase
      .from("ai_generated_content")
      .select("id,generated_by_user_id,status")
      .eq("id", body.contentId)
      .single();

    if (targetError || !target) {
      return NextResponse.json({ error: targetError?.message || "Content not found." }, { status: 404 });
    }

    if (role === "tutor" && target.generated_by_user_id !== user.id) return forbidden();

    const { data: updated, error: updateError } = await supabase
      .from("ai_generated_content")
      .update({ status: "PENDING_REVIEW" })
      .eq("id", body.contentId)
      .select("id,status")
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: updateError?.message || "Failed to submit review." }, { status: 500 });
    }

    await notifyAiWorkflowEvent({
      event: "SUBMITTED_FOR_REVIEW",
      contentId: body.contentId,
      actorUserId: user.id,
    });

    return NextResponse.json({ record: updated });
  }

  if (action === "DELETE_DRAFT") {
    if (!body.contentId) return NextResponse.json({ error: "Missing contentId" }, { status: 400 });

    const { data: target, error: targetError } = await supabase
      .from("ai_generated_content")
      .select("id,generated_by_user_id,status")
      .eq("id", body.contentId)
      .single();

    if (targetError || !target) return NextResponse.json({ error: "Content not found." }, { status: 404 });
    if (role === "tutor" && target.generated_by_user_id !== user.id) return forbidden();

    const { error: deleteError } = await supabase
      .from("ai_generated_content")
      .delete()
      .eq("id", body.contentId);

    if (deleteError) return NextResponse.json({ error: "Failed to delete draft." }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "PUBLISH_DIRECTLY") {
    if (!body.contentId) return NextResponse.json({ error: "Missing contentId" }, { status: 400 });

    const { data: target, error: targetError } = await supabase
      .from("ai_generated_content")
      .select("id,generated_by_user_id,status")
      .eq("id", body.contentId)
      .single();

    if (targetError || !target) return NextResponse.json({ error: "Content not found." }, { status: 404 });
    if (role === "tutor" && target.generated_by_user_id !== user.id) {
      return forbidden();
    }

    try {
      const result = await publishAiContentAndDistribute(body.contentId, {
        actorUserId: user.id,
        allowedStatuses: ["DRAFT", "PENDING_REVIEW", "APPROVED"],
      });
      return NextResponse.json({ record: result.record });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to publish." },
        { status: 500 },
      );
    }
  }

  if (!["APPROVE", "REJECT", "REQUEST_CHANGES", "PUBLISH"].includes(action)) {
    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  }

  if (role !== "super_admin") return forbidden();
  if (!body.contentId) return NextResponse.json({ error: "Missing contentId" }, { status: 400 });

  const { data: current, error: currentError } = await supabase
    .from("ai_generated_content")
    .select("id,status")
    .eq("id", body.contentId)
    .single();
  if (currentError || !current) {
    return NextResponse.json({ error: currentError?.message || "Content not found." }, { status: 404 });
  }

  const now = new Date().toISOString();
  const reviewNote = typeof body.reviewNote === "string" ? body.reviewNote.trim() : null;
  const currentStatus = normalizeStatus(current.status ?? "");

  let nextStatus = currentStatus;
  const updatePayload: Record<string, unknown> = {
    reviewed_by_user_id: user.id,
    review_note: reviewNote || null,
  };

  if (action === "APPROVE") {
    nextStatus = "APPROVED";
    updatePayload.approved_at = now;
  } else if (action === "REJECT") {
    nextStatus = "REJECTED";
  } else if (action === "REQUEST_CHANGES") {
    nextStatus = "DRAFT";
  } else if (action === "PUBLISH") {
    if (currentStatus !== "APPROVED") {
      return NextResponse.json({ error: "Only APPROVED content can be published." }, { status: 409 });
    }
    try {
      const result = await publishAiContentAndDistribute(body.contentId, {
        actorUserId: user.id,
        allowedStatuses: ["APPROVED"],
      });
      return NextResponse.json({ record: result.record });
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Failed to publish approved content.",
        },
        { status: 500 },
      );
    }
  }

  updatePayload.status = nextStatus;

  const { data: updated, error: updateError } = await supabase
    .from("ai_generated_content")
    .update(updatePayload)
    .eq("id", body.contentId)
    .select("id,status")
    .single();

  if (updateError || !updated) {
    return NextResponse.json({ error: updateError?.message || "Failed to update content status." }, { status: 500 });
  }

  if (action === "APPROVE" || action === "REJECT" || action === "REQUEST_CHANGES") {
    const eventMap = {
      APPROVE: "APPROVED",
      REJECT: "REJECTED",
      REQUEST_CHANGES: "REQUEST_CHANGES",
    } as const;

    await notifyAiWorkflowEvent({
      event: eventMap[action as keyof typeof eventMap],
      contentId: body.contentId,
      actorUserId: user.id,
      reviewNote,
    });
  }

  return NextResponse.json({ record: updated });
}
