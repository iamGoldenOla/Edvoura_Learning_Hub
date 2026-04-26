import { chromium, devices } from "@playwright/test";

const BASE_URL = process.env.SMOKE_BASE_URL || "https://www.edvouralearninghub.com";

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/services",
  "/pricing",
  "/blog",
  "/careers",
  "/contact",
  "/privacy",
  "/terms",
  "/help",
  "/guide/student",
  "/guide/parent",
];

const DASH_ROUTES = [
  "/dash/tutor/roster",
  "/dash/tutor/builder?tool=ai-generator",
  "/dash/tutor/messages",
  "/dash/student/notes",
];

const VIEWPORTS = [
  { name: "small-android", context: { viewport: { width: 253, height: 518 }, isMobile: true, hasTouch: true } },
  { name: "iphone12", context: devices["iPhone 12"] },
  { name: "pixel7", context: devices["Pixel 7"] },
];

async function visitRoute(page, route) {
  const url = `${BASE_URL}${route}`;
  const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  if (!response) return { status: 0, url };
  return { status: response.status(), url: response.url() };
}

async function run() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const failures = [];

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext(viewport.context);
    const page = await context.newPage();
    const consoleErrors = [];
    const badResponses = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    page.on("response", (response) => {
      if (response.status() >= 500) {
        badResponses.push(`${response.status()} ${response.url()}`);
      }
    });

    for (const route of PUBLIC_ROUTES) {
      const result = await visitRoute(page, route);
      if (result.status === 404 || result.status >= 500) {
        failures.push(`[${viewport.name}] public route failed: ${route} => ${result.status}`);
      }
    }

    for (const route of DASH_ROUTES) {
      const result = await visitRoute(page, route);
      if (result.status === 404 || result.status >= 500) {
        failures.push(`[${viewport.name}] dashboard route failed: ${route} => ${result.status}`);
      }
    }

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    if (dimensions.scrollWidth > dimensions.clientWidth) {
      failures.push(
        `[${viewport.name}] horizontal overflow detected (${dimensions.scrollWidth} > ${dimensions.clientWidth})`,
      );
    }

    if (badResponses.length > 0) {
      failures.push(`[${viewport.name}] server errors: ${badResponses.slice(0, 5).join(" | ")}`);
    }

    if (consoleErrors.length > 0) {
      console.log(`[${viewport.name}] console errors (first 5):`);
      console.log(consoleErrors.slice(0, 5));
    }

    await context.close();
  }

  await browser.close();

  if (failures.length > 0) {
    console.error("Production smoke check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("Production smoke check passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
