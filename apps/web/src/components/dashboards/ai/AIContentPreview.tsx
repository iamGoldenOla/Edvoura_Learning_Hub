"use client";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function renderStringList(items: unknown) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm font-semibold text-dark/80">
      {items.map((item, index) => (
        <li key={`${String(item).slice(0, 40)}-${index}`}>{String(item)}</li>
      ))}
    </ul>
  );
}

function renderResources(materials: unknown) {
  if (!isRecord(materials)) return null;

  const youtube = Array.isArray(materials.youtube_videos) ? materials.youtube_videos : [];
  const images = Array.isArray(materials.image_resources) ? materials.image_resources : [];
  const classroom = Array.isArray(materials.classroom_materials) ? materials.classroom_materials : [];

  return (
    <div>
      <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-dark/60">
        Instructional Materials
      </p>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border-[2px] border-dark bg-off-white p-4">
          <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">
            📺 YouTube Videos
          </p>
          <div className="space-y-3">
            {youtube.length > 0 ? youtube.map((item, index) => {
              const row = isRecord(item) ? item : {};
              const itemTitle = String(row.title ?? "Suggested video");
              const url = String(row.url ?? "#");
              const why = String(row.why_it_helps ?? "");
              return (
                <div key={`${itemTitle}-${index}`} className="rounded-lg border border-dark/20 bg-white p-3">
                  <a href={url} target="_blank" rel="noreferrer" className="text-sm font-black text-dark underline decoration-yellow underline-offset-2 hover:text-yellow transition-colors">
                    {itemTitle}
                  </a>
                  {why ? <p className="mt-1 text-xs font-semibold text-dark/60">{why}</p> : null}
                </div>
              );
            }) : <p className="text-xs text-dark/50 font-semibold">No video recommendations</p>}
          </div>
        </div>
        <div className="rounded-xl border-[2px] border-dark bg-off-white p-4">
          <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">
            🖼️ Image Resources
          </p>
          <div className="space-y-3">
            {images.length > 0 ? images.map((item, index) => {
              const row = isRecord(item) ? item : {};
              const itemTitle = String(row.title ?? "Suggested image");
              const url = String(row.url ?? "#");
              const why = String(row.why_it_helps ?? "");
              return (
                <div key={`${itemTitle}-${index}`} className="rounded-lg border border-dark/20 bg-white p-3">
                  <a href={url} target="_blank" rel="noreferrer" className="text-sm font-black text-dark underline decoration-yellow underline-offset-2 hover:text-yellow transition-colors">
                    {itemTitle}
                  </a>
                  {why ? <p className="mt-1 text-xs font-semibold text-dark/60">{why}</p> : null}
                </div>
              );
            }) : <p className="text-xs text-dark/50 font-semibold">No image recommendations</p>}
          </div>
        </div>
        <div className="rounded-xl border-[2px] border-dark bg-off-white p-4">
          <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">
            📋 Classroom Materials
          </p>
          {renderStringList(classroom) ?? <p className="text-xs text-dark/50 font-semibold">None listed</p>}
        </div>
      </div>
    </div>
  );
}

function renderWorkedExamples(examples: unknown) {
  if (!Array.isArray(examples) || examples.length === 0) return null;
  return (
    <div>
      <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-dark/60">
        Worked Examples
      </p>
      <div className="space-y-3">
        {examples.map((item, index) => {
          const row = isRecord(item) ? item : {};
          const exTitle = String(row.title ?? `Example ${index + 1}`);
          const exExplanation = String(row.explanation ?? "");
          return (
            <div key={`we-${index}`} className="rounded-xl border-[2px] border-dark bg-blue-50 p-4">
              <p className="text-sm font-black text-dark">{exTitle}</p>
              <p className="mt-2 text-sm font-semibold leading-7 text-dark/80 whitespace-pre-line">{exExplanation}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderPracticeQuestions(questions: unknown, showAnswerHints: boolean) {
  if (!Array.isArray(questions) || questions.length === 0) return null;

  const difficultyColor: Record<string, string> = {
    easy: "bg-green-100 text-green-900 border-green-300",
    medium: "bg-amber-100 text-amber-900 border-amber-300",
    hard: "bg-red-100 text-red-900 border-red-300",
  };

  return (
    <div>
      <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-dark/60">
        Practice Questions
      </p>
      <div className="space-y-3">
        {questions.map((item, index) => {
          const row = isRecord(item) ? item : {};
          const question = String(row.question ?? "");
          const difficulty = String(row.difficulty ?? "medium");
          const answerHint = String(row.answer_hint ?? "");
          return (
            <div key={`pq-${index}`} className="rounded-xl border-[2px] border-dark bg-off-white p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[2px] border-dark bg-white text-xs font-black text-dark">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-dark">{question}</p>
                  <span className={`mt-2 inline-block rounded-lg border-[1.5px] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${difficultyColor[difficulty] ?? difficultyColor.medium}`}>
                    {difficulty}
                  </span>
                  {showAnswerHints && answerHint ? (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-dark/40 hover:text-dark/70 transition-colors">
                        Answer Hint (Teacher Only)
                      </summary>
                      <p className="mt-1 rounded-lg border border-dashed border-dark/20 bg-yellow/10 p-2 text-xs font-semibold text-dark/70">
                        {answerHint}
                      </p>
                    </details>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderLessonStages(stages: unknown) {
  if (!Array.isArray(stages) || stages.length === 0) return null;
  return (
    <div>
      <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-dark/60">
        Lesson Stages
      </p>
      <div className="space-y-4">
        {stages.map((item, index) => {
          const row = isRecord(item) ? item : {};
          const stageTitle = String(row.stage_title ?? `Stage ${index + 1}`);
          const duration = Number(row.duration_minutes ?? 0);
          const teacherActivity = String(row.teacher_activity ?? "");
          const studentActivity = String(row.student_activity ?? "");
          const assessmentCheck = String(row.assessment_check ?? "");
          return (
            <div key={`ls-${index}`} className="rounded-xl border-[2px] border-dark bg-white p-4 shadow-[2px_2px_0px_#060E1C]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border-[2px] border-dark bg-yellow text-xs font-black text-dark">
                    {index + 1}
                  </span>
                  <h4 className="text-base font-black text-dark">{stageTitle}</h4>
                </div>
                {duration > 0 ? (
                  <span className="rounded-lg border-[1.5px] border-dark bg-off-white px-2 py-0.5 text-[10px] font-black text-dark">
                    {duration} min
                  </span>
                ) : null}
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-dark/15 bg-blue-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-dark/50 mb-1">👩‍🏫 Teacher Activity</p>
                  <p className="text-xs font-semibold text-dark/80">{teacherActivity}</p>
                </div>
                <div className="rounded-lg border border-dark/15 bg-green-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-dark/50 mb-1">👩‍🎓 Student Activity</p>
                  <p className="text-xs font-semibold text-dark/80">{studentActivity}</p>
                </div>
                <div className="rounded-lg border border-dark/15 bg-amber-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-dark/50 mb-1">✅ Assessment Check</p>
                  <p className="text-xs font-semibold text-dark/80">{assessmentCheck}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AIContentPreview({
  content,
  title = "Generated Content Preview",
}: {
  content: unknown;
  title?: string;
}) {
  const record = isRecord(content) ? content : null;

  // Detect content type
  const isLessonPlan = record && Array.isArray(record.lesson_stages);
  const isLessonNote = record && typeof record.explanation === "string";

  return (
    <section className="rounded-2xl border-[3px] border-dark bg-white p-5 shadow-[4px_4px_0px_#060E1C]">
      <div className="mb-4 flex items-center justify-between border-b-[2px] border-dark pb-2">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-dark/60">
          {title}
        </p>
        {isLessonPlan ? (
          <span className="rounded-lg border-[1.5px] border-dark bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-blue-900">
            Teacher Lesson Plan
          </span>
        ) : isLessonNote ? (
          <span className="rounded-lg border-[1.5px] border-dark bg-green-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-green-900">
            Student Lesson Note
          </span>
        ) : null}
      </div>

      {record ? (
        <div className="space-y-5">
          {/* Title and summary */}
          {typeof record.title === "string" ? (
            <div>
              <h3 className="text-2xl font-black text-dark">{record.title}</h3>
              {typeof record.lesson_summary === "string" ? (
                <p className="mt-2 text-sm font-semibold text-dark/70">{record.lesson_summary}</p>
              ) : null}
            </div>
          ) : null}

          {/* Lesson Plan: Objectives */}
          {record.lesson_objectives ? (
            <div className="rounded-xl border-[2px] border-dark bg-blue-50 p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">🎯 Lesson Objectives</p>
              {renderStringList(record.lesson_objectives)}
            </div>
          ) : null}

          {/* Lesson Plan: Prior Knowledge */}
          {typeof record.prior_knowledge === "string" ? (
            <div className="rounded-xl border-[2px] border-dark bg-off-white p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">📚 Prior Knowledge</p>
              <p className="text-sm font-semibold leading-7 text-dark/80">{record.prior_knowledge}</p>
            </div>
          ) : null}

          {/* Lesson Plan: Teacher Preparation */}
          {typeof record.teacher_preparation === "string" ? (
            <div className="rounded-xl border-[2px] border-dark bg-amber-50 p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">📝 Teacher Preparation</p>
              <p className="text-sm font-semibold leading-7 text-dark/80">{record.teacher_preparation}</p>
            </div>
          ) : null}

          {/* Lesson Note: Explanation */}
          {typeof record.explanation === "string" ? (
            <div className="rounded-xl border-[2px] border-dark bg-off-white p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">📖 Explanation</p>
              <p className="text-sm font-semibold leading-7 text-dark/80 whitespace-pre-line">{record.explanation}</p>
            </div>
          ) : null}

          {/* Lesson Note: Key Points */}
          {record.key_points ? (
            <div className="rounded-xl border-[2px] border-dark bg-green-50 p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">💡 Key Points</p>
              {renderStringList(record.key_points)}
            </div>
          ) : null}

          {/* Lesson Note: Worked Examples */}
          {renderWorkedExamples(record.worked_examples)}

          {/* Lesson Note: Real-World Examples */}
          {Array.isArray(record.real_world_examples) && record.real_world_examples.length > 0 ? (
            <div className="rounded-xl border-[2px] border-dark bg-purple-50 p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">🌍 Real-World Examples</p>
              {renderStringList(record.real_world_examples)}
            </div>
          ) : null}

          {/* Lesson Plan: Lesson Stages */}
          {renderLessonStages(record.lesson_stages)}

          {/* Instructional Materials */}
          {record.instructional_materials ? renderResources(record.instructional_materials) : null}

          {/* Practice Questions (with answer hints for teacher review) */}
          {renderPracticeQuestions(record.practice_questions, true)}

          {/* Lesson Note: Learning Checks */}
          {Array.isArray(record.learning_checks) && record.learning_checks.length > 0 ? (
            <div className="rounded-xl border-[2px] border-dark bg-cyan-50 p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">🔍 Learning Checks</p>
              {renderStringList(record.learning_checks)}
            </div>
          ) : null}

          {/* Lesson Plan: Evaluation Questions */}
          {Array.isArray(record.evaluation_questions) && record.evaluation_questions.length > 0 ? (
            <div className="rounded-xl border-[2px] border-dark bg-indigo-50 p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">📋 Evaluation Questions</p>
              {renderStringList(record.evaluation_questions)}
            </div>
          ) : null}

          {/* Lesson Plan: Assignment */}
          {typeof record.assignment === "string" ? (
            <div className="rounded-xl border-[2px] border-dark bg-yellow/20 p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">📝 Assignment</p>
              <p className="text-sm font-semibold leading-7 text-dark/80">{record.assignment}</p>
            </div>
          ) : null}

          {/* Lesson Plan: Differentiation Strategies */}
          {Array.isArray(record.differentiation_strategies) && record.differentiation_strategies.length > 0 ? (
            <div className="rounded-xl border-[2px] border-dark bg-rose-50 p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">🔄 Differentiation Strategies</p>
              {renderStringList(record.differentiation_strategies)}
            </div>
          ) : null}

          {/* Lesson Plan: Teacher Notes */}
          {typeof record.teacher_notes === "string" ? (
            <div className="rounded-xl border-[2px] border-dark bg-slate-100 p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-dark/60">📌 Teacher Notes</p>
              <p className="text-sm font-semibold leading-7 text-dark/80">{record.teacher_notes}</p>
            </div>
          ) : null}

          {/* Quiz: Questions */}
          {Array.isArray(record.questions) ? (
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-dark/60">Quiz Questions</p>
              <div className="space-y-3">
                {record.questions.map((item, index) => {
                  const row = isRecord(item) ? item : {};
                  return (
                    <div key={`qq-${index}`} className="rounded-xl border-[2px] border-dark bg-off-white p-4">
                      <p className="text-sm font-black text-dark">{String(row.question ?? "")}</p>
                      {Array.isArray(row.options) ? (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {row.options.map((opt, oi) => (
                            <span
                              key={`opt-${index}-${oi}`}
                              className={`rounded-lg border px-2 py-1 text-xs font-semibold ${
                                String(opt) === String(row.correct_answer ?? "")
                                  ? "border-green-500 bg-green-50 text-green-800 font-black"
                                  : "border-dark/20 bg-white text-dark/70"
                              }`}
                            >
                              {String(opt)}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {typeof row.explanation === "string" ? (
                        <p className="mt-2 text-xs font-semibold text-dark/60">💡 {row.explanation}</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Raw JSON collapse */}
          <details className="rounded-xl border-[2px] border-dark bg-slate-50 p-4">
            <summary className="cursor-pointer text-xs font-black uppercase tracking-widest text-dark/70">
              Raw JSON
            </summary>
            <pre className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap text-[11px] font-mono">
              {JSON.stringify(content, null, 2)}
            </pre>
          </details>
        </div>
      ) : (
        <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl border-[2px] border-dark bg-slate-50 p-4 text-[11px] font-mono">
          {JSON.stringify(content, null, 2)}
        </pre>
      )}
    </section>
  );
}
