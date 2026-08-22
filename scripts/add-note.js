#!/usr/bin/env node
/**
 * scripts/add-note.js — append a community note (observed behavior / quirk) to a
 * camera. Community notes are NOT specs and are NOT verified by the project; the
 * `source` + `reported_by` carry the accountability. See CONTRIBUTING.md.
 *
 * Usage:
 *   npm run add-note -- --id hikvision-ds-2cd2387g2-lu \
 *     --note "Substream drops to 5fps when WDR is on." \
 *     --source https://github.com/blakeblackshear/frigate/discussions/12345 \
 *     --by yourhandle [--firmware "V5.7.3 build 230801"] [--category rtsp]
 *
 * Any missing required field (--note / --source / --by) is prompted for.
 * The camera file is re-validated against the schema before writing.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const ROOT = path.resolve(__dirname, "..");
const CAM_DIR = path.join(ROOT, "cameras");
const SCHEMA_PATH = path.join(ROOT, "schema", "camera.schema.json");
const CATEGORIES = ["rtsp", "onvif", "firmware", "audio", "ptz", "power", "network", "frigate", "home_assistant", "blue_iris", "other"];

// ── arg parsing ──────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : undefined; };
const args = {
  id: opt("id"),
  note: opt("note"),
  source: opt("source"),
  by: opt("by"),
  firmware: opt("firmware"),
  category: opt("category"),
};

const rl = require("readline").createInterface({ input: process.stdin, output: process.stdout });
const ask = (q, fallback = "") => new Promise((res) => rl.question(q, (a) => res((a || "").trim() || fallback)));

// ── id → file (scan; the id in the JSON is authoritative) ────────────────────
function resolveFile(id) {
  for (const brand of fs.readdirSync(CAM_DIR)) {
    const dir = path.join(CAM_DIR, brand);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
      const p = path.join(dir, f);
      try { if (JSON.parse(fs.readFileSync(p, "utf8")).id === id) return p; } catch { /* skip */ }
    }
  }
  return null;
}

async function main() {
  // Interactive only when a REQUIRED field is missing from the args. Optional
  // fields (firmware/category) are then also offered; a fully-argument run never
  // blocks on a prompt.
  const interactive = !args.id || !args.note || !args.source || !args.by;
  if (!args.id) args.id = await ask("Camera id (e.g. hikvision-ds-2cd2387g2-lu): ");
  const file = resolveFile(args.id);
  if (!file) { console.error(`✗ No camera found with id "${args.id}".`); rl.close(); process.exit(1); }

  if (!args.note) args.note = await ask("Note (one observed behavior, ≥20 chars): ");
  if (!args.source) args.source = await ask("Source (URL, or 'empirical' if you tested it yourself): ");
  if (!args.by) args.by = await ask("Your GitHub handle: ");
  if (interactive && args.firmware === undefined) args.firmware = await ask("Firmware (optional, blank to skip): ");
  if (interactive && args.category === undefined) args.category = await ask(`Category (optional; one of ${CATEGORIES.join("/")}): `);
  rl.close();

  const note = { note: args.note, source: args.source, reported_by: args.by, date: new Date().toISOString().slice(0, 10) };
  if (args.category) note.category = args.category;
  if (args.firmware) note.firmware = args.firmware;
  // stable key order: note, category, firmware, source, reported_by, date
  const ordered = {};
  for (const k of ["note", "category", "firmware", "source", "reported_by", "date"]) if (note[k] !== undefined) ordered[k] = note[k];

  const cam = JSON.parse(fs.readFileSync(file, "utf8"));
  cam.community_notes = cam.community_notes || [];
  cam.community_notes.push(ordered);

  // re-validate the whole camera against the schema before writing
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8")));
  if (!validate(cam)) {
    console.error("✗ Schema validation failed — nothing written:");
    for (const e of validate.errors) console.error(`   ${e.instancePath || "(root)"} ${e.message}`);
    process.exit(1);
  }

  fs.writeFileSync(file, JSON.stringify(cam, null, 2) + "\n");
  console.log(`\n✓ Added note to ${path.relative(ROOT, file)} (${cam.community_notes.length} note(s) total).`);
  console.log(`\nSnippet for the PR description:\n`);
  console.log(JSON.stringify(ordered, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
