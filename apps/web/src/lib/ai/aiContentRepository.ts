import type { EdvouraTaskType } from "./edvouraPromptBuilder";
import type { AntiRepetitionItemDraft } from "./antiRepetitionService";

export type DashboardAiStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED";

export type SaveDraftInput = {
  title: string;
  subject: string;
  topic: string;
  grade: string;
  skillType: string;
  taskType: EdvouraTaskType;
  contentJson: unknown;
  contentText: string;
  modelUsed: string;
  previousContentHashes: string[];
  antiRepetitionItems: AntiRepetitionItemDraft[];
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    const errorText = (data as { error?: string }).error || "Request failed";
    throw new Error(errorText);
  }
  return data as T;
}

export async function fetchPreviousItems(params: {
  subject: string;
  topic: string;
  grade: string;
  skillType: string;
}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/ai/dashboard/previous-items?${query}`, {
    cache: "no-store",
  });
  const data = await parseJsonResponse<{ items: string[] }>(res);
  return data.items;
}

export async function saveAiDraft(input: SaveDraftInput) {
  const res = await fetch("/api/ai/dashboard/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "SAVE_DRAFT",
      ...input,
    }),
  });
  return parseJsonResponse<{ record: { id: string; status: string } }>(res);
}

export async function submitForReview(contentId: string) {
  const res = await fetch("/api/ai/dashboard/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "SUBMIT_FOR_REVIEW",
      contentId,
    }),
  });
  return parseJsonResponse<{ record: { id: string; status: string } }>(res);
}

export async function reviewContent(params: {
  action: "APPROVE" | "REJECT" | "REQUEST_CHANGES" | "PUBLISH";
  contentId: string;
  reviewNote?: string;
}) {
  const res = await fetch("/api/ai/dashboard/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return parseJsonResponse<{ record: { id: string; status: string } }>(res);
}

export async function listDashboardAiContent(scope: "TUTOR" | "SUPER_ADMIN") {
  const res = await fetch(`/api/ai/dashboard/content?scope=${scope}`, {
    cache: "no-store",
  });
  return parseJsonResponse<{
    records: Array<{
      id: string;
      title: string;
      subject: string;
      topic: string;
      grade: string;
      skill_type: string;
      task_type: string;
      status: string;
      content_json: unknown;
      content_text: string | null;
      review_note: string | null;
      ai_provider: string | null;
      model_used: string | null;
      created_at: string;
      updated_at: string;
    }>;
  }>(res);
}
