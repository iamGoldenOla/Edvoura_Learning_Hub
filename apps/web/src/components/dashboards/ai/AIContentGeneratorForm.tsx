"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  EDVOURA_TASK_TYPE_LABELS,
  EDVOURA_VISIBLE_TASK_TYPES,
  type EdvouraTaskType,
} from "@/lib/ai/edvouraPromptBuilder";

export type GeneratorPayload = {
  taskType: EdvouraTaskType;
  subject: string;
  topic: string;
  grade: string;
  skillType: string;
  extraInstruction?: string;
  existingContent?: string;
  score?: number;
  history?: string;
};

const SUBJECT_OPTIONS = [
  "Mathematics",
  "English",
  "Biology",
  "Physics",
  "Chemistry",
  "Basic Science",
  "Social Studies",
  "Civic Education",
  "Computer Studies",
  "Agricultural Science",
  "Economics",
  "Commerce",
  "Accounting",
  "Literature",
  "History",
  "Geography",
  "Spelling",
  "Financial Literacy",
  "Communication Skills",
  "General Life Skills",
];

export default function AIContentGeneratorForm({
  disabled,
  onGenerate,
}: {
  disabled?: boolean;
  onGenerate: (payload: GeneratorPayload) => Promise<void> | void;
}) {
  const [taskType, setTaskType] = useState<EdvouraTaskType>("GENERATE_LESSON_NOTE");
  const [subject, setSubject] = useState("Basic Science");
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("Grade 4");
  const [skillType, setSkillType] = useState("Core Academic");
  const [extraInstruction, setExtraInstruction] = useState("");
  const [existingContent, setExistingContent] = useState("");
  const [score, setScore] = useState("");
  const [history, setHistory] = useState("");

  return (
    <section className="rounded-2xl border-[3px] border-dark bg-yellow/20 p-5 shadow-[4px_4px_0px_#060E1C]">
      <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-dark/70">
        Edvoura AI Generator
      </p>
      <p className="mb-4 rounded-xl border-[2px] border-dark bg-white p-3 text-xs font-bold text-dark/70">
        AI generation may require a secure Puter sign-in session. This is only
        used for Tutor and Super Admin dashboard AI tools. Students will never
        see this.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-dark/60">
            Task Type
          </span>
          <select
            value={taskType}
            onChange={(event) => setTaskType(event.target.value as EdvouraTaskType)}
            className="w-full rounded-xl border-[3px] border-dark bg-white px-3 py-3 text-xs font-bold outline-none"
          >
            {EDVOURA_VISIBLE_TASK_TYPES.map((entry) => (
              <option key={entry} value={entry}>
                {EDVOURA_TASK_TYPE_LABELS[entry]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-dark/60">
            Subject
          </span>
          <select
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="w-full rounded-xl border-[3px] border-dark bg-white px-3 py-3 text-xs font-bold outline-none"
          >
            {SUBJECT_OPTIONS.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-dark/60">
            Topic
          </span>
          <input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="e.g. Fractions in daily life"
            className="w-full rounded-xl border-[3px] border-dark bg-white px-3 py-3 text-sm font-bold outline-none"
          />
        </label>

        <label className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-dark/60">
            Grade Level
          </span>
          <input
            value={grade}
            onChange={(event) => setGrade(event.target.value)}
            placeholder="e.g. Grade 6"
            className="w-full rounded-xl border-[3px] border-dark bg-white px-3 py-3 text-sm font-bold outline-none"
          />
        </label>

        <label className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-dark/60">
            Skill Type
          </span>
          <input
            value={skillType}
            onChange={(event) => setSkillType(event.target.value)}
            placeholder="e.g. Communication Skills"
            className="w-full rounded-xl border-[3px] border-dark bg-white px-3 py-3 text-sm font-bold outline-none"
          />
        </label>
      </div>

      <label className="mt-3 block space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-dark/60">
          Optional Instruction
        </span>
        <textarea
          value={extraInstruction}
          onChange={(event) => setExtraInstruction(event.target.value)}
          placeholder="Extra tutor/admin instruction, preferred teaching approach, or material preference"
          rows={3}
          className="w-full rounded-xl border-[3px] border-dark bg-white px-3 py-3 text-sm font-semibold outline-none"
        />
      </label>

      <label className="mt-3 block space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-dark/60">
          Existing Content (for Improve / Regenerate)
        </span>
        <textarea
          value={existingContent}
          onChange={(event) => setExistingContent(event.target.value)}
          placeholder="Paste existing JSON/content for improve or regenerate tasks."
          rows={4}
          className="w-full rounded-xl border-[3px] border-dark bg-white px-3 py-3 text-sm font-semibold outline-none"
        />
      </label>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-dark/60">
            Score (ADAPT_LEARNING)
          </span>
          <input
            value={score}
            onChange={(event) => setScore(event.target.value)}
            placeholder="e.g. 58"
            className="w-full rounded-xl border-[3px] border-dark bg-white px-3 py-3 text-sm font-bold outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-dark/60">
            History (ADAPT_LEARNING)
          </span>
          <input
            value={history}
            onChange={(event) => setHistory(event.target.value)}
            placeholder="Recent weak topics or trend notes"
            className="w-full rounded-xl border-[3px] border-dark bg-white px-3 py-3 text-sm font-bold outline-none"
          />
        </label>
      </div>

      <Button
        type="button"
        disabled={disabled || !topic.trim()}
        onClick={() =>
          void onGenerate({
            taskType,
            subject,
            topic,
            grade,
            skillType,
            extraInstruction: extraInstruction || undefined,
            existingContent: existingContent || undefined,
            score: score ? Number(score) : undefined,
            history: history || undefined,
          })
        }
        className="mt-4 bg-yellow border-[3px] border-dark text-dark font-black rounded-xl px-5 py-3 shadow-[3px_3px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
      >
        {disabled ? "Generating..." : "Generate with Edvoura AI"}
      </Button>
    </section>
  );
}
