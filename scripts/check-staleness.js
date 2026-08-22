#!/usr/bin/env node
/**
 * scripts/check-staleness.js — `last_verified` staleness report (CI idea #4).
 *
 * Companion to the existing dead-link sweep (scripts/check-sources.js /
 * check-sources.yml, issue #222). Where that checks whether a source URL still
 * *resolves*, this checks whether the entry has been *re-verified against its
 * source* recently — specs drift as vendors revise datasheets.
 *
 * Flags two buckets:
 *   • stale     — last_verified older than STALE_MONTHS (default 18)
 *   • unverified — no last_verified field at all
 *
 * The `check-staleness` workflow runs it monthly and upserts a tracking issue.
 * Advisory only — it never fails CI.
 *
 * Usage:
 *   node scripts/check-staleness.js [--months 18]
 * Env:
 *   STALE_MONTHS   age threshold in months (default 18)
 *   STALE_AS_OF    reference date YYYY-MM-DD (default: today) — for deterministic tests
 *
 * See docs/ci.md.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const argMonths = (() => {
  const i = process.argv.indexOf("--months");
  return i !== -1 && process.argv[i + 1] ? Number(process.argv[i + 1]) : null;
})();
// Validate the threshold: a garbage STALE_MONTHS (Number("x") → NaN) must not
// silently make cutoff an Invalid Date and report 0 stale — fall back to 18.
const validMonths = (v) => (Number.isFinite(v) && v > 0 ? v : null);
const envMonths = process.env.STALE_MONTHS;
if (envMonths != null && validMonths(Number(envMonths)) == null) {
  console.warn(`⚠  Ignoring invalid STALE_MONTHS="${envMonths}" — using 18.`);
}
const MONTHS = validMonths(argMonths) ?? validMonths(Number(envMonths)) ?? 18;
const asOf = process.env.STALE_AS_OF && /^\d{4}-\d{2}-\d{2}$/.test(process.env.STALE_AS_OF)
  ? new Date(process.env.STALE_AS_OF + "T00:00:00Z")
  : new Date();
// Subtract months without the month-end drift setMonth causes (Aug 31 − 6mo
// would roll Feb 31 → Mar 3): pin to day 1 first, then clamp the day back to the
// target month's length. Done in UTC to match the UTC-parsed last_verified dates.
const cutoff = new Date(asOf);
const day = cutoff.getUTCDate();
cutoff.setUTCDate(1);
cutoff.setUTCMonth(cutoff.getUTCMonth() - MONTHS);
const lastDay = new Date(Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth() + 1, 0)).getUTCDate();
cutoff.setUTCDate(Math.min(day, lastDay));

const stale = [];
const unverified = [];
let total = 0;

for (const brand of fs.readdirSync("cameras")) {
  const dir = path.join("cameras", brand);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const cam = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    total++;
    const lv = cam.last_verified;
    if (!lv) { unverified.push(cam.id || f); continue; }
    const d = new Date(String(lv) + "T00:00:00Z");
    if (isNaN(d.getTime())) { unverified.push(`${cam.id} (bad date "${lv}")`); continue; }
    if (d < cutoff) stale.push({ id: cam.id, date: lv, brand });
  }
}

stale.sort((a, b) => (a.date < b.date ? -1 : 1)); // oldest first

console.log(`Checked ${total} cameras · threshold ${MONTHS} months · as of ${asOf.toISOString().slice(0, 10)}.`);
console.log(`Found ${stale.length} stale, ${unverified.length} unverified.\n`);

console.log("--- STALENESS REPORT ---");
if (stale.length) {
  // Group stale by brand for a compact report.
  const byBrand = {};
  for (const s of stale) (byBrand[s.brand] = byBrand[s.brand] || []).push(`${s.id} (${s.date})`);
  console.log(`\n### Stale (>${MONTHS} months) — ${stale.length}`);
  for (const [b, ids] of Object.entries(byBrand).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`- **${b}** (${ids.length}): ${ids.slice(0, 15).join(", ")}${ids.length > 15 ? " …" : ""}`);
  }
}
if (unverified.length) {
  console.log(`\n### Unverified (no last_verified) — ${unverified.length}`);
  console.log(unverified.slice(0, 60).join(", ") + (unverified.length > 60 ? " …" : ""));
}
if (!stale.length && !unverified.length) console.log("\n🎉 Every camera has a recent last_verified date.");
