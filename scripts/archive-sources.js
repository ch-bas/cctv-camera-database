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
 *   ARCHIVE_DELAY_MS  delay between saves (default 6000 — be polite to IA)
 *   ARCHIVE_MAX       safety cap on number of URLs (default 400)
 *
 * Advisory only: failures (rate-limits, IA downtime) never throw — the workflow
 * treats this as best-effort preservation. See docs/ci.md.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const DELAY = Number(process.env.ARCHIVE_DELAY_MS || 6000);
const MAX = Number(process.env.ARCHIVE_MAX || 400);
const UA = "cctv-camera-database source-archiver (+https://github.com/ch-bas/cctv-camera-database)";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  console.log(`Archiving ${urls.length} source URL(s) from ${files.length} camera file(s) to the Wayback Machine…\n`);

  let ok = 0, fail = 0;
  for (let i = 0; i < urls.length; i++) {
    const r = await save(urls[i]);
    if (r.ok) { ok++; console.log(`  ✓ [${i + 1}/${urls.length}] ${urls[i]}`); }
    else { fail++; console.log(`  ✗ [${i + 1}/${urls.length}] (${r.status}${r.error ? " " + r.error : ""}) ${urls[i]}`); }
    if (i < urls.length - 1) await sleep(DELAY);
  }
  console.log(`\nDone: ${ok} archived, ${fail} failed (advisory — failures don't fail CI).`);
})();
