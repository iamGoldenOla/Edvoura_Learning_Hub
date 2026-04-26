import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..", "src");
const TARGET_DIRS = [
  path.join(ROOT, "app", "dash"),
  path.join(ROOT, "components", "dashboards"),
];

const BANNED = [
  "Phase next",
  "Pending phase",
  "Storage next",
  "Planned",
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
      continue;
    }
    if (full.endsWith(".tsx") || full.endsWith(".ts")) {
      files.push(full);
    }
  }
  return files;
}

const offenders = [];
for (const dir of TARGET_DIRS) {
  for (const file of walk(dir)) {
    const text = fs.readFileSync(file, "utf8");
    for (const needle of BANNED) {
      if (text.includes(needle)) {
        offenders.push({ file, needle });
      }
    }
  }
}

if (offenders.length > 0) {
  console.error("Dashboard placeholder guard failed.");
  for (const offender of offenders) {
    console.error(`- ${offender.needle} in ${offender.file}`);
  }
  process.exit(1);
}

console.log("Dashboard placeholder guard passed.");
