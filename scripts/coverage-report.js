#!/usr/bin/env node
/**
 * scripts/coverage-report.js — field-coverage report generator (CI idea #2).
 *
 * Computes how completely each optional-but-important field is populated across
 * the dataset and writes `COVERAGE.md` (a table with progress bars). This
 * replaces the previously-manual coverage tallies posted to the data-lane
 * issues (#123/#161/#162/#177/#178/#179 …).
 *
 * The `build` workflow regenerates and commits this on every push to `main`, so
 * COVERAGE.md always reflects the live dataset. Run locally with:
 *   node scripts/coverage-report.js
 *
 * Pass a timestamp via COVERAGE_DATE=YYYY-MM-DD to make output deterministic
 * (CI passes the commit date); otherwise it is omitted.
 *
 * See docs/ci.md for the full CI overview.
 */
"use strict";
const fs = require("fs");
const path = require("path");

// Anchor to the repo root, not the cwd, so counts/paths are correct regardless
// of where the script is invoked from (CI, a subdir, an editor task).
const ROOT = path.resolve(__dirname, "..");

// Load the generated aggregate if present (fast), else read the source files.
let cameras;
const agg = path.join(ROOT, "data", "cameras.json");
if (fs.existsSync(agg)) {
  const parsed = JSON.parse(fs.readFileSync(agg, "utf8"));
  cameras = Array.isArray(parsed) ? parsed : parsed.cameras;
} else {
  cameras = [];
  for (const brand of fs.readdirSync(path.join(ROOT, "cameras"))) {
    const dir = path.join(ROOT, "cameras", brand);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
      cameras.push(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
    }
  }
}

const T = cameras.length;

// Each lane: label, emoji, related issue, and a predicate for "populated".
const LANES = [
  ["Field of view", "📡", "#179", (c) => !!c.field_of_view_deg],
  ["Environment (in/outdoor)", "🌍", "#123", (c) => c.environment && c.environment.length > 0],
  ["Video streams (any)", "🎞️", "#177", (c) => c.video && c.video.streams && c.video.streams.length > 0],
  ["Substream data", "🎞️", "#177", (c) => c.video && c.video.streams && c.video.streams.some((s) => s.name && s.name !== "main")],
  ["Dimensions", "📐", "#178", (c) => !!c.dimensions_mm],
  ["Weight", "⚖️", "#178", (c) => c.weight_g != null],
  ["Markets", "🗺️", "#166", (c) => c.markets && c.markets.length > 0],
  ["Sensor", "🔬", "—", (c) => !!c.sensor],
  ["Lens", "🔎", "—", (c) => !!c.lens],
  ["Min-lux (color)", "🌙", "#161", (c) => c.night_vision && c.night_vision.min_lux_color != null],
  ["IK / impact rating", "🛡️", "#162", (c) => !!c.ik_rating],
  ["IP rating", "💧", "—", (c) => !!c.ip_rating],
  ["Frigate config", "🔧", "#170", (c) => c.configs && c.configs.frigate],
  ["Release year", "📅", "#166", (c) => c.release_year != null],
];

const bar = (pct) => {
  const filled = Math.round(pct / 10);
  return "`" + "█".repeat(filled) + "░".repeat(10 - filled) + "`";
};

// shields.io badge helpers (#234). Colour by coverage. shields treats `-` as the
// label/message/color separator, and encodeURIComponent leaves `-` untouched, so a
// literal `-` in a label (e.g. "color min-lux") must be doubled to `--` or the
// badge 404s. Escape here so any dashed label is safe.
const badgeColor = (p) => (p >= 80 ? "brightgreen" : p >= 60 ? "green" : p >= 40 ? "yellow" : p >= 20 ? "orange" : "red");
const badgeField = (s) => encodeURIComponent(s).replace(/-/g, "--");
const badge = (label, pct) => `![${label} ${pct}%](https://img.shields.io/badge/${badgeField(label)}-${pct}%25-${badgeColor(pct)})`;
// Lanes shown as README/COVERAGE badges → [display label, matches rows[].label].
const BADGE_LANES = [
  ["environment", "Environment (in/outdoor)"],
  ["FOV", "Field of view"],
  ["streams", "Video streams (any)"],
  ["dimensions", "Dimensions"],
  ["IK rating", "IK / impact rating"],
  ["color min-lux", "Min-lux (color)"],
  ["Frigate", "Frigate config"],
];

const rows = LANES.map(([label, emoji, issue, pred]) => {
  const n = cameras.filter(pred).length;
  const pct = T ? Math.round((n / T) * 100) : 0;
  return { label, emoji, issue, n, pct };
}).sort((a, b) => b.pct - a.pct);

const brandCount = new Set(cameras.map((c) => c.brand)).size;
// "Last updated" date. Prefer an explicit COVERAGE_DATE; otherwise default to the
// last commit date so a plain local `node scripts/coverage-report.js` produces
// byte-identical output to CI (which used to pass COVERAGE_DATE). Without this
// default, a local regen strips the date line and CI then tries to restore it —
// a perpetual diff that fails the main build under branch protection. Falls back
// to null (no date) outside a git checkout.
const gitCommitDate = () => {
  try {
    return require("child_process")
      .execSync("git log -1 --format=%cs", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim() || null;
  } catch {
    return null;
  }
};
const rawDate = process.env.COVERAGE_DATE || gitCommitDate();
const date = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : null;

// Badge row shared by COVERAGE.md and the README marker.
const pctFor = (rowLabel) => (rows.find((r) => r.label === rowLabel) || { pct: 0 }).pct;
const badgeRow = BADGE_LANES.map(([disp, rowLabel]) => badge(disp, pctFor(rowLabel))).join(" ");

// Community notes — a sparse, non-datasheet layer, so it's a summary line, not a coverage lane.
const cnCameras = cameras.filter((c) => Array.isArray(c.community_notes) && c.community_notes.length > 0);
const cnTotal = cnCameras.reduce((s, c) => s + c.community_notes.length, 0);
const cnSummary = `Cameras with community notes: ${cnCameras.length} (${cnTotal} notes total)`;

let md = `# 📊 Field coverage\n\n`;
md += `> Auto-generated by \`scripts/coverage-report.js\` (do not edit by hand).`;
md += date ? ` Last updated: ${date}.\n\n` : `\n\n`;
md += badgeRow + `\n\n`;
md += `**${T.toLocaleString("en-US")} cameras** across **${brandCount} brands**.\n\n`;
md += `| Field | Coverage | Filled | Lane |\n`;
md += `|---|---|---:|:---:|\n`;
for (const r of rows) {
  const issueLink = r.issue.startsWith("#")
    ? `[${r.issue}](https://github.com/ch-bas/cctv-camera-database/issues/${r.issue.slice(1)})`
    : "";
  md += `| ${r.emoji} ${r.label} | ${bar(r.pct)} ${r.pct}% | ${r.n.toLocaleString("en-US")} | ${issueLink} |\n`;
}
md += `\n${cnSummary}.\n`;
md += `\nHelp raise a lane — see [open data-collection issues](https://github.com/ch-bas/cctv-camera-database/issues) (index: #163).\n`;

fs.writeFileSync(path.join(ROOT, "COVERAGE.md"), md);

// Keep the README badge row fresh, if the markers exist (added in #234).
const README = path.join(ROOT, "README.md");
if (fs.existsSync(README)) {
  const START = "<!-- coverage:start (auto-generated by scripts/coverage-report.js — do not edit by hand) -->";
  const END = "<!-- coverage:end -->";
  let readme = fs.readFileSync(README, "utf8");
  const block = `${START}\n${badgeRow}\n\n📊 **[Full field-coverage report → COVERAGE.md](COVERAGE.md)**\n${END}`;
  const re = new RegExp(START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\s\\S]*?" + END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (re.test(readme)) {
    const next = readme.replace(re, block);
    if (next !== readme) { fs.writeFileSync(README, next); console.log("Updated README coverage badges."); }
  }
}

console.log(`Wrote COVERAGE.md — ${T} cameras, ${rows.length} lanes.`);
for (const r of rows) console.log(`  ${r.emoji} ${r.label.padEnd(26)} ${String(r.pct).padStart(3)}%  (${r.n})`);
console.log(`  🗒️  ${cnSummary}`);
