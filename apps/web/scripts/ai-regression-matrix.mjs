import { chromium } from "@playwright/test";

const BASE_URL = process.env.SMOKE_BASE_URL || "https://www.edvouralearninghub.com";
const EMAIL = process.env.SMOKE_TUTOR_EMAIL;
const PASSWORD = process.env.SMOKE_TUTOR_PASSWORD;

const CASES = [
  { contentType: "lesson_note", topic: "Photosynthesis", subject: "Basic Science", gradeLevel: "grade_5" },
  { contentType: "story", topic: "The Value of Honesty", subject: "English Language", gradeLevel: "grade_4" },
  { contentType: "quiz", topic: "Fractions", subject: "Mathematics", gradeLevel: "grade_6" },
  { contentType: "spelling_bee", topic: "Weather Words", subject: "English Language", gradeLevel: "grade_3" },
];

function validateShape(contentType, content) {
  if (!content || typeof content !== "object") {
    return "response content is not an object";
  }

  if (contentType === "lesson_note") {
    if (!content.topic || !content.objectives || !Array.isArray(content.objectives)) {
      return "lesson_note missing topic/objectives";
    }
    return null;
  }

  if (contentType === "story") {
    if (!content.title || !content.story_text) {
      return "story missing title/story_text";
    }
    return null;
  }

  if (contentType === "quiz") {
    if (!Array.isArray(content.questions) || content.questions.length < 3) {
      return "quiz missing question set";
    }
    return null;
  }

  if (contentType === "spelling_bee") {
    if (!Array.isArray(content.words) || content.words.length < 5) {
      return "spelling_bee missing words";
    }
    return null;
  }

  return null;
}

async function run() {
  if (!EMAIL || !PASSWORD) {
    console.error("Set SMOKE_TUTOR_EMAIL and SMOKE_TUTOR_PASSWORD before running AI matrix.");
    process.exit(1);
  }

  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const failures = [];

  try {
    await page.goto(`${BASE_URL}/login?next=${encodeURIComponent("/dash/tutor/builder?tool=ai-generator")}`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 30000 });

    for (const testCase of CASES) {
      const result = await page.evaluate(
        async ({ payload }) => {
          const response = await fetch("/api/ai/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const json = await response.json().catch(() => null);
          return { ok: response.ok, status: response.status, json };
        },
        { payload: testCase },
      );

      if (!result.ok) {
        failures.push(
          `[${testCase.contentType}] failed with HTTP ${result.status}: ${result.json?.error ?? "unknown error"}`,
        );
        continue;
      }

      const shapeError = validateShape(testCase.contentType, result.json?.content);
      if (shapeError) {
        failures.push(`[${testCase.contentType}] invalid shape: ${shapeError}`);
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  if (failures.length > 0) {
    console.error("AI regression matrix failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("AI regression matrix passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
