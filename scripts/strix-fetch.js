#!/usr/bin/env node
/**
 * STRIX INGEST — stage 0-1: FETCH + SNAPSHOT/DIFF.  [STUB]
 *
 * Pulls StrixCamDB (used ONLY as a lead source — never a data source) and diffs
 * its stream table against the last committed snapshot, so downstream stages
 * only ever see NEW/CHANGED leads instead of the full ~17k-row table.
 *
 * It writes two files under strix/:
 *   - strix/.snapshot.json  — the full set of upstream keys (committed, so the
 *                             diff is reproducible and re-runs don't re-queue).
 *   - strix/leads-new.json  — only the added/changed leads for this run.
 *
 * NOTHING here is published. This is the top of the verify-don't-dump pipeline;
 * see docs/strix-ingest-design.md. Reads via the `sqlite3` CLI (present on CI
 * runners) to avoid adding an npm dependency, matching build.js's execSync style.
 *
 * Upstream outage is a NO-OP, not a failure (exit 0) — we never fail the
 * pipeline over someone else's downtime.
 *
 * Usage:
 *   node scripts/strix-fetch.js
 * Env:
 *   STRIX_SLUG    owner/repo of StrixCamDB (default: eduard256/StrixCamDB)
 *   STRIX_DB      release-asset filename (default: cameras.db)
 *   STRIX_DB_URL  override the full download URL (default: latest release asset)
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'strix');
const SNAPSHOT = path.join(OUT_DIR, '.snapshot.json');
const LEADS_NEW = path.join(OUT_DIR, 'leads-new.json');

// The compiled SQLite DB is published as a RELEASE ASSET (the repo tree holds
// only per-brand source), so we download the latest release's cameras.db.
const STRIX_SLUG = process.env.STRIX_SLUG || 'eduard256/StrixCamDB';
const DB_NAME = process.env.STRIX_DB || 'cameras.db';
const DB_URL = process.env.STRIX_DB_URL || `https://github.com/${STRIX_SLUG}/releases/latest/download/${DB_NAME}`;

main();

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const dbPath = fetchDb();               // stage 0 — may exit 0 (no-op) if unreachable
  const streams = dumpStreams(dbPath);    // read leads via sqlite3 CLI
  const { added, snapshot } = diff(streams);

  write(SNAPSHOT, snapshot);
  write(LEADS_NEW, { generated: stamp(), upstream_streams: streams.length, count: added.length, leads: added });

  console.log(
    `strix-fetch: ${streams.length} upstream streams, ${added.length} new/changed ` +
    `→ ${path.relative(ROOT, LEADS_NEW)}`
  );
  if (added.length === 0) console.log('strix-fetch: no delta — downstream stages will no-op.');
}

/** Stage 0: download the latest StrixCamDB release asset (the compiled SQLite db). */
function fetchDb() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'strixcamdb-'));
  const safeName = path.basename(DB_NAME);
  const dbPath = path.join(tmp, safeName);
  try {
    execFileSync('curl', ['-fsSL', DB_URL, '-o', dbPath], { stdio: 'ignore' });
  } catch {
    console.warn('strix-fetch: release-asset download failed — treating as no delta.');
    process.exit(0); // upstream outage is a no-op, not a pipeline failure
  }
  if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0) {
    console.warn(`strix-fetch: ${safeName} download was empty — no-op.`);
    process.exit(0);
  }
  return dbPath;
}

/**
 * Read the streams table as JSON via the sqlite3 CLI. StrixCamDB schema:
 *   streams(brand_id, stream_id, url, protocol, port, notes)
 */
function dumpStreams(dbPath) {
  const sql =
    "SELECT json_group_array(json_object(" +
    "'brand_id',brand_id,'stream_id',stream_id,'url',url," +
    "'protocol',protocol,'port',port,'notes',notes)) FROM streams;";
  let out;
  try {
    out = execFileSync('sqlite3', [dbPath, sql], { maxBuffer: 128 * 1024 * 1024 }).toString().trim();
  } catch (e) {
    console.error('strix-fetch: sqlite3 read failed (is the sqlite3 CLI installed?):', e.message);
    process.exit(1);
  }
  return JSON.parse(out || '[]');
}

/** Stage 1: key each stream and diff against the committed snapshot. */
function diff(streams) {
  const prev = fs.existsSync(SNAPSHOT)
    ? new Set(JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')).keys || [])
    : new Set();

  const keys = [];
  const added = [];
  for (const s of streams) {
    const key = [s.brand_id, s.url, s.protocol, s.port].join('\u0000');
    keys.push(key);
    if (!prev.has(key)) added.push(s);
  }
  return { added, snapshot: { generated: stamp(), count: keys.length, keys } };
}

// ── helpers ──────────────────────────────────────────────────────────────
// COVERAGE_DATE-style override keeps output deterministic in CI if ever needed.
function stamp() { return process.env.STRIX_DATE || new Date().toISOString().slice(0, 10); }
function write(p, obj) { fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n'); }
