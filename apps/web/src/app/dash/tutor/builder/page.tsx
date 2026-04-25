"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileUp,
  NotebookPen,
  Star,
  Target,
  Trash2,
  Edit3,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { createQuizOrResource, deleteAssignment } from "./actions";

type SubjectOption = {
  id: string;
  name: string;
};

type GradeOption = {
  id: string;
  code: string;
  display_name: string;
};

type AssignmentRow = {
  id: string;
  title: string;
  due_at: string | null;
  status: string;
  classes:
    | {
        title: string;
        subject_id: string;
      }
    | Array<{
        title: string;
        subject_id: string;
      }>
    | null;
};

type AssignmentCard = {
  id: string;
  title: string;
  className: string;
  due: string;
  status: string;
  resources: Array<{
    id: string;
    fileName: string;
  }>;
};

const formatDueLabel = (value: string | null) => {
  if (!value) {
    return "No due date";
  }

  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getRelatedClass = (entry: AssignmentRow) => {
  if (!entry.classes) {
    return null;
  }

  return Array.isArray(entry.classes)
    ? (entry.classes[0] ?? null)
    : entry.classes;
};

export default function TutorBuilderPage() {
  const searchParams = useSearchParams();
  const preselectTool = searchParams.get("tool");

  const [activeTool, setActiveTool] = useState(preselectTool ?? "assignment");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);

  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [gradeLevels, setGradeLevels] = useState<GradeOption[]>([]);
  const [assignments, setAssignments] = useState<AssignmentCard[]>([]);

  const [showAssignmentForm, setShowAssignmentForm] = useState(true);
  const [formTitle, setFormTitle] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formGradeCode, setFormGradeCode] = useState("");
  const [formDueAt, setFormDueAt] = useState("");
  const [formInstructions, setFormInstructions] = useState("");
  const [formResourceName, setFormResourceName] = useState("");
  const [formResourceFile, setFormResourceFile] = useState<File | null>(null);

  const [userId, setUserId] = useState("");

  // Edvoura AI Form State
  const [aiType, setAiType] = useState("lesson_note");
  const [aiTopic, setAiTopic] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiResult, setAiResult] = useState<unknown>(null);
  const [aiContentId, setAiContentId] = useState<string | null>(null);
  const [isPublishingAi, setIsPublishingAi] = useState(false);

  const loadBuilderData = async () => {
    const supabase = createClient();
    setIsLoading(true);

    const membership = await supabase.rpc("sync_current_user_membership");
    if (
      membership.error &&
      !/function .*sync_current_user_membership/i.test(membership.error.message)
    ) {
      setFeedback(membership.error.message);
      setIsLoading(false);
      return;
    }

    if (membership.data?.user_id) {
      setUserId(membership.data.user_id);
    }

    const [
      { data: subjectRows, error: subjectsError },
      { data: gradeRows, error: gradesError },
      { data: assignmentRows, error: assignmentsError },
    ] = await Promise.all([
      supabase
        .from("subjects")
        .select("id, name")
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("grade_levels")
        .select("id, code, display_name")
        .order("numeric_level"),
      supabase
        .from("assignments")
        .select("id, title, due_at, status, classes!inner(title, subject_id)")
        .neq("status", "archived")
        .order("created_at", { ascending: false }),
    ]);

    if (subjectsError || gradesError || assignmentsError) {
      setFeedback(
        subjectsError?.message ??
          gradesError?.message ??
          assignmentsError?.message ??
          "Unable to load builder data.",
      );
      setIsLoading(false);
      return;
    }

    setSubjects(subjectRows ?? []);
    setGradeLevels(gradeRows ?? []);

    const subjectById = new Map(
      (subjectRows ?? []).map((entry) => [entry.id, entry.name]),
    );
    const assignmentIds = ((assignmentRows ?? []) as AssignmentRow[]).map(
      (entry) => entry.id,
    );
    const { data: assignmentFilesRows } = assignmentIds.length
      ? await supabase
          .from("assignment_files")
          .select("id, assignment_id, object_path")
          .in("assignment_id", assignmentIds)
      : {
          data: [] as Array<{
            id: string;
            assignment_id: string;
            object_path: string;
          }>,
        };

    const filesByAssignmentId = new Map<
      string,
      Array<{ id: string; fileName: string }>
    >();
    (assignmentFilesRows ?? []).forEach((file) => {
      const current = filesByAssignmentId.get(file.assignment_id) ?? [];
      current.push({
        id: file.id,
        fileName: file.object_path.split("/").pop() ?? file.object_path,
      });
      filesByAssignmentId.set(file.assignment_id, current);
    });

    const normalizedAssignments = (
      (assignmentRows ?? []) as AssignmentRow[]
    ).map((entry) => {
      const relatedClass = getRelatedClass(entry);

      return {
        id: entry.id,
        title: entry.title,
        className:
          relatedClass?.title ??
          (relatedClass?.subject_id
            ? (subjectById.get(relatedClass.subject_id) ?? "Untitled class")
            : "Untitled class"),
        due: formatDueLabel(entry.due_at),
        status: entry.status,
        resources: filesByAssignmentId.get(entry.id) ?? [],
      };
    });

    setAssignments(normalizedAssignments);

    if (!formSubject && subjectRows?.[0]?.name) {
      setFormSubject(subjectRows[0].name);
    }

    if (!formGradeCode && gradeRows?.[0]?.code) {
      setFormGradeCode(gradeRows[0].code);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    void loadBuilderData();
    // loadBuilderData is intentionally run once on mount for the initial dashboard hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runAiGeneration = async () => {
    if (!aiTopic.trim() || !formSubject || !formGradeCode) {
      setFeedback("Topic, subject, and grade are required for AI generation.");
      return;
    }

    setIsGeneratingAi(true);
    setAiResult(null);
    setAiContentId(null);
    setFeedback("Edvoura AI is composing your content...");

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: aiType,
          topic: aiTopic.trim(),
          subject: formSubject,
          gradeLevel: formGradeCode,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setAiResult(data.content);
        setAiContentId(data.record?.id || null);
        setFeedback("AI generation successful. Review and publish to students below.");
        return;
      }

      const detail = data.detail ? ` ${data.detail}` : "";
      const attempts = data.attempts ? ` Attempts: ${data.attempts}.` : "";
      setFeedback(`${data.error || "Failed to generate content."}${detail}${attempts}`);
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : "Unknown error occurred.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const publishAiContent = async () => {
    if (!aiContentId) {
      setFeedback("Generate content first before publishing.");
      return;
    }

    setIsPublishingAi(true);
    setFeedback("Publishing content to student dashboards...");

    try {
      const res = await fetch("/api/ai/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId: aiContentId }),
      });
      const data = await res.json();

      if (res.ok) {
        setFeedback("SUCCESS: Content is now live for students!");
        setAiResult(null);
        setAiContentId(null);
      } else {
        setFeedback(data.error || "Failed to publish content.");
      }
    } catch (err: unknown) {
      setFeedback(
        err instanceof Error ? err.message : "Unknown error during publish.",
      );
    } finally {
      setIsPublishingAi(false);
    }
  };

  const builderStats = useMemo(
    () => ({
      assignments: String(assignments.length),
      quizzes: "Pending phase",
      resources: "Storage next",
      gamification: "Planned",
    }),
    [assignments.length],
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-6 sm:p-8 pb-20">
      <section className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        {/* Header */}
        <div className="p-8 md:p-12 border-b-[4px] border-dark bg-yellow/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3 min-w-0">
              <span className="inline-flex items-center gap-2 px-4 py-2 border-[3px] border-dark bg-white text-[10px] tracking-[0.2em] font-black shadow-[4px_4px_0px_#060E1C]">
                CONTENT STUDIO
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
                Assignments & Quizzes
              </h1>
              <p className="text-sm md:text-base font-semibold normal-case text-dark/70 max-w-xl">
                Create engaging learning content and publish it directly to your
                enrolled students.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-8">
          {feedback ? (
            <section className="rounded-xl border-[3px] border-dark bg-blue-100 p-4 text-sm text-dark font-black shadow-[5px_5px_0px_#060E1C]">
              {feedback}
            </section>
          ) : null}

          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <ToolCard
              title="Assignments"
              subtitle="Send tasks to students"
              icon={NotebookPen}
              active={activeTool === "assignment"}
              onClick={() => setActiveTool("assignment")}
            />
            <ToolCard
              title="Quizzes & Tests"
              subtitle="Auto-graded assessments"
              icon={Target}
              active={activeTool === "quiz"}
              onClick={() => setActiveTool("quiz")}
            />
            <ToolCard
              title="Class Resources"
              subtitle="Share general files"
              icon={FileUp}
              active={activeTool === "resources"}
              onClick={() => setActiveTool("resources")}
            />
            <ToolCard
              title="Spelling Bee"
              subtitle="Setup spelling challenges"
              icon={Star}
              active={activeTool === "spelling-bee"}
              onClick={() => setActiveTool("spelling-bee")}
            />
            <ToolCard
              title="AI Generator"
              subtitle="Generate notes & quizzes"
              icon={Sparkles}
              active={activeTool === "ai-generator"}
              onClick={() => setActiveTool("ai-generator")}
            />
          </section>

          <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
            <Stat
              title="Active Assignments"
              value={builderStats.assignments}
              bgColor="bg-emerald-200"
            />
            <Stat
              title="Quiz / Test"
              value={builderStats.quizzes}
              bgColor="bg-blue-200"
            />
            <Stat
              title="Resources"
              value={builderStats.resources}
              bgColor="bg-amber-200"
            />
            <Stat
              title="Gamification"
              value={builderStats.gamification}
              bgColor="bg-rose-200"
            />
          </section>

          <section className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
              <div className="border-[3px] border-dark rounded-3xl bg-white shadow-[8px_8px_0px_#060E1C] overflow-hidden">
                <div className="p-6 border-b-[3px] border-dark bg-off-white flex flex-row items-center justify-between">
                  <h2 className="text-2xl font-black text-dark tracking-tight">
                    {activeTool === "assignment" && "Live Assignment Builder"}
                    {activeTool === "quiz" && "Quiz & Test Builder"}
                    {activeTool === "resources" && "Lesson Resource Library"}
                    {activeTool === "spelling-bee" && "Spelling Bee Challenge"}
                    {activeTool === "ai-generator" && "Edvoura AI Generator"}
                  </h2>
                  <Button
                    className="bg-dark text-white border-[3px] border-dark font-black rounded-xl shadow-[3px_3px_0px_#F5C518] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 text-xs px-4 py-2"
                    onClick={() => setShowAssignmentForm((value) => !value)}
                  >
                    {showAssignmentForm
                      ? "Close Form"
                      : `New ${activeTool === "assignment" ? "Assignment" : activeTool === "quiz" ? "Quiz" : activeTool === "resources" ? "Resource" : "Challenge"}`}
                  </Button>
                </div>

                <div className="p-6 space-y-6">
                  {showAssignmentForm ? (
                    <div className="rounded-2xl border-[3px] border-dark bg-blue-50 p-6 shadow-[5px_5px_0px_#060E1C]">
                      <h3 className="text-xl font-black text-dark tracking-tight">
                        Create{" "}
                        {activeTool === "assignment"
                          ? "Assignment"
                          : activeTool === "quiz"
                            ? "Quiz"
                            : activeTool === "resources"
                              ? "Resource"
                              : "Spelling Bee Challenge"}
                      </h3>
                      <div className="mt-6 space-y-4">
                        <input
                          value={formTitle}
                          onChange={(event) => setFormTitle(event.target.value)}
                          placeholder={
                            activeTool === "quiz"
                              ? "Quiz title"
                              : activeTool === "resources"
                                ? "Resource bundle name"
                                : "Assignment title"
                          }
                          className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                          <select
                            value={formSubject}
                            onChange={(event) =>
                              setFormSubject(event.target.value)
                            }
                            className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                          >
                            <option value="">Select subject</option>
                            {subjects.map((subject) => (
                              <option key={subject.id} value={subject.name}>
                                {subject.name}
                              </option>
                            ))}
                          </select>

                          <select
                            value={formGradeCode}
                            onChange={(event) =>
                              setFormGradeCode(event.target.value)
                            }
                            className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                          >
                            <option value="">Select grade</option>
                            {gradeLevels.map((grade) => (
                              <option key={grade.id} value={grade.code}>
                                {grade.display_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {activeTool === "assignment" && (
                          <input
                            type="datetime-local"
                            value={formDueAt}
                            onChange={(event) =>
                              setFormDueAt(event.target.value)
                            }
                            className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                          />
                        )}

                        {activeTool === "quiz" && (
                          <input
                            type="number"
                            placeholder="Time limit (minutes, optional)"
                            className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                            onChange={(e) => setFormDueAt(e.target.value)} // Reusing formDueAt for time limit
                          />
                        )}

                        <textarea
                          value={formInstructions}
                          onChange={(event) =>
                            setFormInstructions(event.target.value)
                          }
                          placeholder={
                            activeTool === "resources"
                              ? "Resource description"
                              : "Instructions for students"
                          }
                          className="min-h-28 w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none transition-all focus:border-yellow"
                        />

                        <div className="rounded-xl border-[3px] border-dark bg-white p-4">
                          <p className="font-black text-dark/70 uppercase tracking-widest text-xs mb-2">
                            Attach{" "}
                            {activeTool === "assignment"
                              ? "assignment"
                              : "lesson"}{" "}
                            resource (optional)
                          </p>
                          <input
                            type="file"
                            onChange={(event) => {
                              const file = event.target.files?.[0] ?? null;
                              setFormResourceFile(file);
                              setFormResourceName(file?.name ?? "");
                            }}
                            className="block w-full text-xs font-bold text-dark file:mr-4 file:rounded-lg file:border-[2px] file:border-dark file:bg-yellow file:px-4 file:py-2 file:text-dark file:font-black file:shadow-[2px_2px_0px_#060E1C] cursor-pointer"
                          />
                          {formResourceName ? (
                            <p className="mt-3 text-xs font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-md inline-block border-[2px] border-emerald-300">
                              Selected: {formResourceName}
                            </p>
                          ) : null}
                        </div>

                        <div className="pt-4 border-t-[3px] border-dark/10">
                          <Button
                            className="bg-yellow border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-8 py-4 h-auto text-sm w-full sm:w-auto"
                            disabled={isSavingAssignment || isLoading}
                            onClick={async () => {
                              const safeTitle = formTitle.trim();

                              if (
                                !safeTitle ||
                                !formSubject ||
                                !formGradeCode
                              ) {
                                setFeedback(
                                  "Title, subject, and grade are required.",
                                );
                                return;
                              }

                              setIsSavingAssignment(true);

                              try {
                                if (activeTool !== "assignment") {
                                  const formData = new FormData();
                                  formData.append("type", activeTool);
                                  formData.append("title", safeTitle);
                                  formData.append("subjectName", formSubject);
                                  formData.append("gradeCode", formGradeCode);
                                  formData.append("tutorId", userId);
                                  if (activeTool === "quiz") {
                                    formData.append("timeLimit", formDueAt); // Reused field
                                    formData.append(
                                      "instructions",
                                      formInstructions.trim(),
                                    );
                                  } else {
                                    formData.append(
                                      "description",
                                      formInstructions.trim(),
                                    );
                                  }

                                  const result =
                                    await createQuizOrResource(formData);

                                  if (
                                    result.success &&
                                    result.id &&
                                    formResourceFile
                                  ) {
                                    setFeedback(
                                      "Publishing record... now uploading file...",
                                    );
                                    const supabase = createClient();
                                    const safeName = `${Date.now()}-${formResourceFile.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
                                    const objectPath = `assignments/${result.id}/${safeName}`;

                                    const upload = await supabase.storage
                                      .from("assignment-assets")
                                      .upload(objectPath, formResourceFile);

                                    if (upload.error) {
                                      console.error(
                                        "Upload error:",
                                        upload.error,
                                      );
                                      setFeedback(
                                        `Record created, but file upload failed: ${upload.error.message}`,
                                      );
                                    } else {
                                      const attach = await supabase.rpc(
                                        "attach_assignment_asset",
                                        {
                                          target_assignment_id: result.id,
                                          object_path: objectPath,
                                          bucket_id: "assignment-assets",
                                        },
                                      );

                                      if (attach.error) {
                                        console.error(
                                          "Attach error:",
                                          attach.error,
                                        );
                                        setFeedback(
                                          `File uploaded, but failed to link to assignment: ${attach.error.message}`,
                                        );
                                      } else {
                                        setFeedback(
                                          "Everything published and attached successfully!",
                                        );
                                      }
                                    }
                                  }

                                  setFormTitle("");
                                  setFormInstructions("");
                                  setFormDueAt("");
                                  setFormResourceName("");
                                  setFormResourceFile(null);
                                  setShowAssignmentForm(false);
                                  if (!feedback.includes("failed")) {
                                    setFeedback(
                                      `${activeTool} published successfully.`,
                                    );
                                  }
                                  await loadBuilderData();
                                } else {
                                  // Legacy assignment logic
                                  const supabase = createClient();
                                  const { data, error } = await supabase.rpc(
                                    "create_tutor_assignment",
                                    {
                                      assignment_title: safeTitle,
                                      subject_name: formSubject,
                                      grade_level_code: formGradeCode,
                                      assignment_instructions:
                                        formInstructions.trim() || null,
                                      due_at: formDueAt
                                        ? new Date(formDueAt).toISOString()
                                        : null,
                                      points_possible: 100,
                                    },
                                  );

                                  if (error) {
                                    setFeedback(error.message);
                                    setIsSavingAssignment(false);
                                    return;
                                  }

                                  const created = Array.isArray(data)
                                    ? data[0]
                                    : null;

                                  if (
                                    created?.assignment_id &&
                                    formResourceFile
                                  ) {
                                    const safeName = `${Date.now()}-${formResourceFile.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
                                    const objectPath = `assignments/${created.assignment_id}/${safeName}`;
                                    const upload = await supabase.storage
                                      .from("assignment-assets")
                                      .upload(objectPath, formResourceFile, {
                                        cacheControl: "3600",
                                        upsert: false,
                                      });

                                    if (upload.error) {
                                      setFeedback(upload.error.message);
                                      setIsSavingAssignment(false);
                                      return;
                                    }

                                    const attach = await supabase.rpc(
                                      "attach_assignment_asset",
                                      {
                                        target_assignment_id:
                                          created.assignment_id,
                                        object_path: objectPath,
                                        bucket_id: "assignment-assets",
                                      },
                                    );

                                    if (attach.error) {
                                      setFeedback(attach.error.message);
                                      setIsSavingAssignment(false);
                                      return;
                                    }
                                  }

                                  setFormTitle("");
                                  setFormInstructions("");
                                  setFormDueAt("");
                                  setFormResourceName("");
                                  setFormResourceFile(null);
                                  setShowAssignmentForm(false);
                                  setFeedback(
                                    created
                                      ? `Assignment published and shared with ${created.enrolled_students ?? 0} enrolled students.`
                                      : "Assignment published successfully.",
                                  );
                                  await loadBuilderData();
                                }
                              } catch (err: unknown) {
                                setFeedback(
                                  (err instanceof Error ? err.message : null) ||
                                    "An error occurred during publishing.",
                                );
                              } finally {
                                setIsSavingAssignment(false);
                              }
                            }}
                          >
                            {isSavingAssignment
                              ? "Publishing..."
                              : `Publish ${activeTool === "assignment" ? "Assignment" : activeTool === "quiz" ? "Quiz" : activeTool === "resources" ? "Resource" : "Challenge"}`}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {isLoading ? (
                    <div className="rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-6 text-center text-sm font-semibold text-dark/60">
                      Loading live assignment data...
                    </div>
                  ) : assignments.length > 0 ? (
                    <div className="grid gap-4">
                      {assignments.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-xl font-black text-dark tracking-tight">
                              {item.title}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                className="h-10 w-10 p-0 rounded-xl border-[2px] border-dark bg-white hover:bg-yellow text-dark shadow-[2px_2px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                onClick={() => {
                                  setFormTitle(item.title);
                                  setShowAssignmentForm(true);
                                  setFeedback(
                                    `Editing "${item.title}". Update the fields and publish again.`,
                                  );
                                }}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                className="h-10 w-10 p-0 rounded-xl border-[2px] border-dark bg-white hover:bg-rose-500 hover:text-white text-rose-500 shadow-[2px_2px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-colors"
                                onClick={async () => {
                                  if (
                                    confirm(
                                      "Are you sure you want to delete this assignment?",
                                    )
                                  ) {
                                    try {
                                      await deleteAssignment(item.id);
                                      setFeedback("Assignment deleted.");
                                      await loadBuilderData();
                                    } catch (err: unknown) {
                                      setFeedback(
                                        err instanceof Error
                                          ? err.message
                                          : "Unable to delete assignment.",
                                      );
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-dark bg-white px-3 py-1.5 rounded-lg border-[2px] border-dark">
                              {item.className}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-dark/70 border-[2px] border-dark/20 px-3 py-1.5 rounded-lg">
                              Due: {item.due}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 border-[2px] border-emerald-300 px-3 py-1.5 rounded-lg ml-auto">
                              {item.status}
                            </span>
                          </div>

                          {item.resources.length > 0 ? (
                            <div className="mt-4 space-y-2 rounded-xl border-[2px] border-dark/20 bg-white p-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-dark/50">
                                Attached resources
                              </p>
                              {item.resources.map((resource) => (
                                <div
                                  key={resource.id}
                                  className="text-xs font-bold text-dark"
                                >
                                  {resource.fileName}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-8 text-center text-sm font-semibold text-dark/60">
                      No live assignments yet. Publish one above and it will
                      appear here, in the grading queue, and on matching student
                      dashboards.
                    </div>
                  )}

                  {activeTool === "ai-generator" && (
                    <div className="rounded-2xl border-[3px] border-dark bg-yellow/5 p-8 shadow-[5px_5px_0px_#060E1C] space-y-6">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-yellow-600" />
                        <h3 className="text-2xl font-black text-dark">Quick AI Generator</h3>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-black uppercase tracking-widest text-dark/60">I want to create a...</label>
                            <select 
                              value={aiType} 
                              onChange={(e) => setAiType(e.target.value)}
                              className="w-full mt-2 rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
                            >
                              <option value="lesson_note">Lesson Note</option>
                              <option value="story">Story</option>
                              <option value="quiz">Quiz</option>
                              <option value="worksheet">Worksheet</option>
                              <option value="spelling_bee">Spelling Bee</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-black uppercase tracking-widest text-dark/60">About this topic...</label>
                            <input 
                              value={aiTopic}
                              onChange={(e) => setAiTopic(e.target.value)}
                              placeholder="e.g. Photosynthesis"
                              className="w-full mt-2 rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow"
                            />
                          </div>
                          <Button 
                            className="w-full bg-yellow border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] h-auto py-4"
                            disabled={isGeneratingAi || !aiTopic || !formSubject || !formGradeCode}
                            onClick={() => void runAiGeneration()}
                          >
                            {isGeneratingAi ? "Thinking..." : "Generate with Edvoura AI"}
                          </Button>
                        </div>
                        <div className="rounded-2xl border-[3px] border-dark bg-white p-6 shadow-[4px_4px_0px_#060E1C] min-h-[300px]">
                           <p className="text-[10px] font-black uppercase tracking-widest text-dark/50 mb-4 border-b-2 border-dark pb-2">AI Output Preview</p>
                           {aiResult ? (
                             <pre className="whitespace-pre-wrap font-mono text-[10px] overflow-auto max-h-[400px]">
                               {JSON.stringify(aiResult, null, 2)}
                             </pre>
                           ) : (
                             <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                               <Sparkles className="w-12 h-12 text-dark/10" />
                               <p className="text-xs font-bold text-dark/40">Results will appear here after generation.</p>
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6 xl:col-span-4">
              <div className="border-[4px] border-dark rounded-3xl bg-yellow/10 p-6 shadow-[8px_8px_0px_#060E1C] space-y-6 sticky top-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow border-[3px] border-dark rounded-2xl shadow-[3px_3px_0px_#060E1C]">
                    <Sparkles className="w-6 h-6 text-dark" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-dark tracking-tight leading-none">
                      Edvoura AI
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-dark/60 mt-1">
                      Content Assistant
                    </p>
                  </div>
                </div>

                <p className="text-xs font-bold text-dark/70 leading-relaxed">
                  Automate your curriculum with Edvoura AI. Generate lesson notes, quizzes, spelling bees, and tutor-ready study content in seconds.
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-dark/60">Content Type</label>
                    <select
                      value={aiType}
                      onChange={(e) => setAiType(e.target.value)}
                      className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow shadow-[3px_3px_0px_#060E1C]"
                    >
                      <option value="lesson_note">Lesson Note</option>
                      <option value="story">Story</option>
                      <option value="comprehension">Comprehension</option>
                      <option value="quiz">Quiz</option>
                      <option value="worksheet">Worksheet</option>
                      <option value="spelling_bee">Spelling Bee</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-dark/60">Topic</label>
                    <input
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="e.g. Algebra Basics"
                      className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-yellow shadow-[3px_3px_0px_#060E1C]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-dark/60">Subject & Grade</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={formSubject}
                        onChange={(event) => setFormSubject(event.target.value)}
                        className="w-full rounded-xl border-[3px] border-dark bg-white px-3 py-3 text-xs font-bold text-dark outline-none focus:border-yellow shadow-[2px_2px_0px_#060E1C]"
                      >
                        <option value="">Subject</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                      <select
                        value={formGradeCode}
                        onChange={(event) => setFormGradeCode(event.target.value)}
                        className="w-full rounded-xl border-[3px] border-dark bg-white px-3 py-3 text-xs font-bold text-dark outline-none focus:border-yellow shadow-[2px_2px_0px_#060E1C]"
                      >
                        <option value="">Grade</option>
                        {gradeLevels.map((g) => (
                          <option key={g.id} value={g.code}>{g.display_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Button
                    disabled={isGeneratingAi || !aiTopic || !formSubject || !formGradeCode}
                    onClick={() => void runAiGeneration()}
                    className="bg-yellow border-[3px] border-dark text-dark font-black px-6 py-4 w-full text-sm shadow-[4px_4px_0px_#060E1C] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all disabled:opacity-50 mt-4"
                  >
                    {isGeneratingAi ? "Thinking..." : "Generate Now"}
                  </Button>

                  {Boolean(aiResult) && (
                    <div className="mt-4 space-y-4">
                      <div className="bg-white border-[3px] border-dark p-4 rounded-2xl shadow-[4px_4px_0px_#060E1C]">
                        <div className="flex items-center justify-between mb-2 border-b-[2px] border-dark pb-1">
                          <h4 className="font-black text-sm uppercase tracking-widest">Result Preview</h4>
                          <span className="text-[10px] font-bold text-dark/40">ID: {aiContentId?.split('-')[0]}...</span>
                        </div>
                        <pre className="whitespace-pre-wrap font-mono text-[10px] overflow-auto max-h-[300px] p-3 bg-gray-50 border-[2px] border-dark rounded-xl">
                          {JSON.stringify(aiResult, null, 2)}
                        </pre>
                      </div>

                      <Button
                        disabled={isPublishingAi || !aiContentId}
                        onClick={() => void publishAiContent()}
                        className="w-full bg-emerald-400 border-[3px] border-dark text-dark font-black px-6 py-4 text-sm shadow-[4px_4px_0px_#060E1C] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all"
                      >
                        {isPublishingAi ? "Publishing..." : "Publish to Student Hubs"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-[3px] border-dark rounded-3xl bg-blue-100 p-6 shadow-[5px_5px_0px_#060E1C]">
                <h3 className="text-xl font-black text-dark mb-4">
                  What This Connects
                </h3>
                <div className="space-y-3 text-sm font-semibold text-dark/80">
                  <p>
                    Tutor assignment publish{" "}
                    <ArrowRight className="inline h-3 w-3 mx-1" /> class
                    creation <ArrowRight className="inline h-3 w-3 mx-1" />{" "}
                    student enrollment{" "}
                    <ArrowRight className="inline h-3 w-3 mx-1" /> student
                    assignment feed{" "}
                    <ArrowRight className="inline h-3 w-3 mx-1" /> tutor grading
                    queue.
                  </p>
                  <p className="p-3 bg-white border-[2px] border-dark rounded-xl shadow-[2px_2px_0px_#060E1C]">
                    Quizzes, lesson resource uploads, bucket-backed student
                    work, and Google Meet links remain in the next phase.
                  </p>
                </div>
              </div>

              <div className="border-[3px] border-dark rounded-3xl bg-white p-6 shadow-[5px_5px_0px_#060E1C]">
                <h3 className="text-xl font-black text-dark mb-4">
                  Related Pages
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/dash/tutor/roster"
                    className="flex items-center justify-between rounded-xl border-[2px] border-dark bg-off-white px-4 py-3 text-sm font-black text-dark hover:bg-yellow hover:translate-x-[2px] hover:translate-y-[2px] shadow-[3px_3px_0px_#060E1C] hover:shadow-none transition-all"
                  >
                    View enrolled students <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/dash/tutor/grading"
                    className="flex items-center justify-between rounded-xl border-[2px] border-dark bg-off-white px-4 py-3 text-sm font-black text-dark hover:bg-yellow hover:translate-x-[2px] hover:translate-y-[2px] shadow-[3px_3px_0px_#060E1C] hover:shadow-none transition-all"
                  >
                    Open grading queue <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/dash/student/assignments"
                    className="flex items-center justify-between rounded-xl border-[2px] border-dark bg-off-white px-4 py-3 text-sm font-black text-dark hover:bg-yellow hover:translate-x-[2px] hover:translate-y-[2px] shadow-[3px_3px_0px_#060E1C] hover:shadow-none transition-all"
                  >
                    Check student view <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function ToolCard({
  title,
  subtitle,
  icon: Icon,
  active,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border-[3px] p-5 text-left transition-all ${
        active
          ? "border-dark bg-yellow shadow-[5px_5px_0px_#060E1C] translate-x-[-2px] translate-y-[-2px]"
          : "border-dark bg-white shadow-[3px_3px_0px_#060E1C] hover:bg-off-white hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#060E1C]"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-lg font-black text-dark tracking-tight leading-tight pr-2">
          {title}
        </p>
        <Icon
          className={`h-6 w-6 shrink-0 ${active ? "text-dark" : "text-dark/50"}`}
        />
      </div>
      <p className="mt-2 text-xs font-bold text-dark/70">{subtitle}</p>
      <div
        className={`mt-4 inline-flex px-2 py-1 text-[10px] font-black uppercase tracking-widest border-[2px] border-dark rounded-md ${active ? "bg-white text-dark" : "bg-transparent text-dark/40 border-dark/20"}`}
      >
        {active ? "Selected" : "Open"}
      </div>
    </button>
  );
}

function Stat({
  title,
  value,
  bgColor = "bg-white",
}: {
  title: string;
  value: string;
  bgColor?: string;
}) {
  return (
    <div
      className={`border-[3px] border-dark rounded-2xl ${bgColor} p-5 shadow-[4px_4px_0px_#060E1C]`}
    >
      <p className="text-[10px] font-black uppercase tracking-widest text-dark/70">
        {title}
      </p>
      <p className="mt-2 text-3xl font-black text-dark tracking-tight">
        {value}
      </p>
    </div>
  );
}
