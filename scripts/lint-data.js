#!/usr/bin/env node
/**
 * scripts/lint-data.js — data-consistency lint (CI idea #1).
 *
 * This COMPLEMENTS `scripts/build.js`, which already owns the hard schema gate
 * (AJV), duplicate-id, resolution-structure (#169), PTZ-drift (#124/#126),
 * placeholder-sentinel (#180) and reseller-source (#165) checks. This script
 * adds the cross-field CONSISTENCY invariants that a JSON Schema can't express.
 *
 *   ERRORS   → exit 1 (fails the PR). Kept to invariants the whole dataset
 *              currently satisfies, so `main` stays green.
 *   WARNINGS → advisory, printed but never fail CI.
 *
 * Usage:
 *   node scripts/lint-data.js          # lint (CI mode)
 *   node scripts/lint-data.js --fix    # additionally rewrite any JSON file
 *                                       # that isn't in canonical 2-space form
 *
 * See docs/ci.md for the full CI overview.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const CAM_DIR = "cameras";
const FIX = process.argv.includes("--fix");

// ── collect camera files ────────────────────────────────────────────────────
const files = [];
for (const brand of fs.readdirSync(CAM_DIR)) {
  const dir = path.join(CAM_DIR, brand);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    files.push(path.join(dir, f));
  }
}

const errors = [];
const warnings = [];
const bySource = {}; // url -> [id, ...]
let fixed = 0;

for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  let cam;
  try {
    cam = JSON.parse(raw);
  } catch (err) {
    errors.push(`${file}: invalid JSON — ${err.message}`);
    continue;
  }
  const id = cam.id || file;
  const ip = cam.ip_rating || "";
  const env = cam.environment || [];

  // E1 — indoor/outdoor vs weather rating (the #123 correctness class).
  // A camera whose IP rating is weatherproof (water digit ≥ 5, e.g. IP65/66/67,
  // incl. compound "IP66/IP67") must not be tagged indoor-ONLY.
  if (/IP\d[5-9]/.test(ip) && env.length === 1 && env[0] === "indoor") {
    errors.push(`${id}: ip_rating "${ip}" is weatherproof but environment is ["indoor"] only — should include "outdoor" (#123).`);
  }

  // E2 — ip_rating must contain at least one IEC 60529 IPxx token. Allows
  // compound ("IP66/IP67", "IP66/IP67/IP6K9K") and partial ratings where a
  // digit is unspecified ("IPX5", "IP5X"). Catches typos / stray text.
  if (ip && !/IP[\dX][\dX]/i.test(ip)) {
    errors.push(`${id}: ip_rating "${ip}" contains no valid IPxx code.`);
  }

  // E3 — weight_g sanity (schema only checks it's a number).
  if (cam.weight_g != null && (typeof cam.weight_g !== "number" || cam.weight_g <= 0 || cam.weight_g > 100000)) {
    errors.push(`${id}: weight_g ${JSON.stringify(cam.weight_g)} is out of range (expected 0 < g ≤ 100000).`);
  }

  // W3 — field_of_view_deg should be normalised (no "°" symbol; see the ACTi /
  // Uniview convention). Advisory: a clean strip sometimes also wants the
  // "horizontal"/"vertical" wording, so it's a nudge rather than a gate.
  if (typeof cam.field_of_view_deg === "string" && cam.field_of_view_deg.includes("°")) {
    warnings.push(`${id}: field_of_view_deg contains "°" — consider normalising (strip the degree symbol).`);
  }

  // E4 — last_verified, when present, must be an ISO date (YYYY-MM-DD).
  if (cam.last_verified != null && !/^\d{4}-\d{2}-\d{2}$/.test(String(cam.last_verified))) {
    errors.push(`${id}: last_verified "${cam.last_verified}" is not an ISO date (YYYY-MM-DD).`);
  }

  // W1 — canonical formatting (2-space indent + trailing newline). Keeps diffs
  // clean. `--fix` rewrites; otherwise it's an advisory warning.
  const canonical = JSON.stringify(cam, null, 2) + "\n";
  if (raw !== canonical) {
    if (FIX) {
      fs.writeFileSync(file, canonical);
      fixed++;
    } else {
      warnings.push(`${file}: not in canonical 2-space JSON form (run \`npm run lint -- --fix\`).`);
    }
  }

  // Collect for W2 (shared source URLs).
  for (const s of cam.sources || []) {
    const url = typeof s === "string" ? s : s && s.url;
    if (url) (bySource[url] = bySource[url] || []).push(id);
  }
}

// W2 — the same source URL on >1 camera. Often legitimate (shared manuals /
// brand asset pages / multi-packs), so advisory only — but it surfaces the
// class of mistake where a new entry was sourced from another model's page.
const shared = Object.entries(bySource).filter(([, ids]) => ids.length > 1);
for (const [url, ids] of shared) {
  warnings.push(`source shared by ${ids.length} cameras: ${url}  → ${ids.slice(0, 4).join(", ")}${ids.length > 4 ? " …" : ""}`);
}

// ── report ──────────────────────────────────────────────────────────────────
console.log(`Linted ${files.length} camera files.`);
if (FIX && fixed) console.log(`\n🔧 Reformatted ${fixed} file(s) to canonical JSON.`);

if (warnings.length) {
  console.log(`\n⚠  ${warnings.length} warning(s):`);
  for (const w of warnings.slice(0, 40)) console.log(`   • ${w}`);
  if (warnings.length > 40) console.log(`   … and ${warnings.length - 40} more.`);
}

if (errors.length) {
  console.error(`\n✗ ${errors.length} error(s):`);
  for (const e of errors) console.error(`   • ${e}`);
  console.error(`\nData-consistency lint FAILED.`);
  process.exit(1);
}

console.log(`\n✓ Data-consistency lint passed (${warnings.length} advisory warning(s)).`);
