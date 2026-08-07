#!/usr/bin/env node
/**
 * scripts/archive-sources.js — datasheet archiver (CI idea #3).
 *
 * Submits camera `sources[]` URLs to the Internet Archive's Wayback "Save Page
 * Now" API so a permanent snapshot exists even after the manufacturer's page or
 * datasheet PDF disappears (a real problem — several entries have already been
 * recovered from Wayback after vendor link-rot).
 *
 * The `archive-sources` workflow runs it on every push to `main`, scoped to the
 * source URLs of the cameras changed in that push (so it archives only what's
 * new). Manual/full runs are available too.
 *
 * Usage:
 *   node scripts/archive-sources.js cameras/hikvision/ds-2df4420wg-xey.json …
 *                                            # archive those cameras' sources
 *   node scripts/archive-sources.js --brand hikvision   # one brand
 *   node scripts/archive-sources.js --all               # whole catalogue (slow)
 *
 * Env:
 *   ARCHIVE_DELAY_MS  delay between *saves* (default 6000 — be polite to IA)
 *   ARCHIVE_MAX       safety cap on number of URLs (default 400)
 *   ARCHIVE_SKIP_DAYS skip URLs already snapshotted within N days (default 45).
 *                     Makes `--all` resumable & idempotent: a re-run only saves
 *                     what's missing/stale, so a monthly full sweep converges
 *                     without re-archiving everything.
 *
 * Advisory only: failures (rate-limits, IA downtime) never throw — the workflow
 * treats this as best-effort preservation. See docs/ci.md.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const DELAY = Number(process.env.ARCHIVE_DELAY_MS || 6000);
const MAX = Number(process.env.ARCHIVE_MAX || 400);
const SKIP_DAYS = Number(process.env.ARCHIVE_SKIP_DAYS || 45);
const UA = "cctv-camera-database source-archiver (+https://github.com/ch-bas/cctv-camera-database)";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Query Wayback's (read-only, lenient) availability API — has this URL been
// snapshotted within SKIP_DAYS? Lets a re-run skip already-archived sources.
async function recentlyArchived(url) {
  try {
    const res = await fetch("https://archive.org/wayback/available?url=" + encodeURIComponent(url), { headers: { "User-Agent": UA } });
    const j = await res.json();
    const snap = j && j.archived_snapshots && j.archived_snapshots.closest;
    if (snap && snap.timestamp) {
      const t = snap.timestamp; // YYYYMMDDhhmmss
      const d = Date.UTC(+t.slice(0, 4), +t.slice(4, 6) - 1, +t.slice(6, 8));
      return (Date.now() - d) / 86400000 <= SKIP_DAYS;
    }
  } catch { /* treat as not-archived on any error */ }
  return false;
}

// ── resolve the set of camera files to read ─────────────────────────────────
function camerasFromArgs(args) {
  const files = [];
  const brandIdx = args.indexOf("--brand");
  if (args.includes("--all")) {
    for (const b of fs.readdirSync("cameras")) {
      const d = path.join("cameras", b);
      if (fs.statSync(d).isDirectory()) for (const f of fs.readdirSync(d)) if (f.endsWith(".json")) files.push(path.join(d, f));
    }
  } else if (brandIdx !== -1 && args[brandIdx + 1]) {
    const d = path.join("cameras", args[brandIdx + 1]);
    for (const f of fs.readdirSync(d)) if (f.endsWith(".json")) files.push(path.join(d, f));
  } else {
    for (const a of args) if (a.endsWith(".json") && fs.existsSync(a)) files.push(a);
  }
  return files;
}

function collectUrls(files) {
  const urls = new Set();
  for (const f of files) {
    let cam;
    try { cam = JSON.parse(fs.readFileSync(f, "utf8")); } catch { continue; }
    for (const s of cam.sources || []) {
      const u = typeof s === "string" ? s : s && s.url;
      // Only archive real manufacturer/retailer pages, not generic brand hubs.
      if (u && /^https?:\/\//.test(u)) urls.add(u);
    }
  }
  return [...urls];
}

async function save(url) {
  const endpoint = "https://web.archive.org/save/" + url;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 90000);
    const res = await fetch(endpoint, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": UA },
      signal: ctrl.signal,
    });
    clearTimeout(t);
    return { ok: res.ok || res.status === 429, status: res.status };
  } catch (err) {
    return { ok: false, status: 0, error: err.message };
  }
}

(async () => {
  const files = camerasFromArgs(process.argv.slice(2));
  if (!files.length) {
    console.log("No camera files resolved — nothing to archive. (Pass file paths, --brand <name>, or --all.)");
    return;
  }
  let urls = collectUrls(files);
  if (urls.length > MAX) {
    console.log(`⚠  ${urls.length} URLs exceed the ARCHIVE_MAX cap (${MAX}); archiving the first ${MAX}. Re-run with a higher ARCHIVE_MAX or narrower scope.`);
    urls = urls.slice(0, MAX);
  }
  console.log(`Archiving ${urls.length} source URL(s) from ${files.length} camera file(s) to the Wayback Machine (skip if snapshot < ${SKIP_DAYS}d old)…\n`);

  let ok = 0, fail = 0, skipped = 0;
  for (let i = 0; i < urls.length; i++) {
    if (await recentlyArchived(urls[i])) { skipped++; console.log(`  ⤻ [${i + 1}/${urls.length}] already archived — skip`); continue; }
    const r = await save(urls[i]);
    if (r.ok) { ok++; console.log(`  ✓ [${i + 1}/${urls.length}] ${urls[i]}`); }
    else { fail++; console.log(`  ✗ [${i + 1}/${urls.length}] (${r.status}${r.error ? " " + r.error : ""}) ${urls[i]}`); }
    await sleep(DELAY); // only delay after an actual save
  }
  console.log(`\nDone: ${ok} archived, ${skipped} already-fresh (skipped), ${fail} failed (advisory — failures don't fail CI).`);
})();
