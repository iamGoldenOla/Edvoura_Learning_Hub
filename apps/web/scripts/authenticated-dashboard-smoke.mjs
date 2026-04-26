import { chromium } from "@playwright/test";

const BASE_URL = process.env.SMOKE_BASE_URL || "https://www.edvouralearninghub.com";

const ROLE_MATRIX = [
  {
    role: "tutor",
    email: process.env.SMOKE_TUTOR_EMAIL,
    password: process.env.SMOKE_TUTOR_PASSWORD,
    route: "/dash/tutor/roster",
  },
  {
    role: "student",
    email: process.env.SMOKE_STUDENT_EMAIL,
    password: process.env.SMOKE_STUDENT_PASSWORD,
    route: "/dash/student/notes",
  },
  {
    role: "parent",
    email: process.env.SMOKE_PARENT_EMAIL,
    password: process.env.SMOKE_PARENT_PASSWORD,
    route: "/dash/parent",
  },
  {
    role: "admin",
    email: process.env.SMOKE_ADMIN_EMAIL,
    password: process.env.SMOKE_ADMIN_PASSWORD,
    route: "/dash/admin",
  },
];

async function login(page, email, password, nextRoute) {
  await page.goto(`${BASE_URL}/login?next=${encodeURIComponent(nextRoute)}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 30000 });
}

async function verifyRole(roleConfig) {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const failures = [];

  try {
    await login(page, roleConfig.email, roleConfig.password, roleConfig.route);

    const response = await page.goto(`${BASE_URL}${roleConfig.route}`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    const status = response?.status() ?? 0;
    const path = new URL(page.url()).pathname;

    if (status >= 500 || status === 404) {
      failures.push(`[${roleConfig.role}] route status ${status} on ${roleConfig.route}`);
    }

    if (path.startsWith("/login")) {
      failures.push(`[${roleConfig.role}] redirected back to login from ${roleConfig.route}`);
    }

    await page.waitForTimeout(800);
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    if (hasHorizontalOverflow) {
      failures.push(`[${roleConfig.role}] horizontal overflow detected on ${roleConfig.route}`);
    }
  } finally {
    await context.close();
    await browser.close();
  }

  return failures;
}

async function run() {
  const missing = ROLE_MATRIX.filter((entry) => !entry.email || !entry.password).map((entry) => entry.role);
  if (missing.length > 0) {
    console.error(
      `Missing credentials for roles: ${missing.join(", ")}. Set SMOKE_<ROLE>_EMAIL and SMOKE_<ROLE>_PASSWORD.`,
    );
    process.exit(1);
  }

  const failures = [];
  for (const roleConfig of ROLE_MATRIX) {
    const roleFailures = await verifyRole(roleConfig);
    failures.push(...roleFailures);
  }

  if (failures.length > 0) {
    console.error("Authenticated dashboard smoke failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("Authenticated dashboard smoke passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
