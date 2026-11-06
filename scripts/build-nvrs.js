#!/usr/bin/env node
/**
 * Aggregates the per-recorder JSON files under /nvrs into:
 *   - data/nvrs.json  (array of all NVR / DVR / hybrid recorder entries)
 *   - data/nvrs.csv   (flattened, for spreadsheets)
 * Validates each entry against schema/nvr.schema.json and checks that ids are
 * unique, match their filename and folder, and that the folder matches the
 * brand folder used under /cameras when one exists.
 *
 * Called from scripts/build.js (so CI and releases cover it); can also run on
 * its own: node scripts/build-nvrs.js
 */
const fs = require("fs");
const path = require("path");
const Ajv = require("ajv/dist/2020");
const addFormats = require("ajv-formats");

const ROOT = path.resolve(__dirname, "..");
const NVRS_DIR = path.join(ROOT, "nvrs");
const CAMERAS_DIR = path.join(ROOT, "cameras");
const DATA_DIR = path.join(ROOT, "data");
const SCHEMA_PATH = path.join(ROOT, "schema", "nvr.schema.json");

function loadRecorders() {
  if (!fs.existsSync(NVRS_DIR)) return [];
  const out = [];
  for (const folder of fs.readdirSync(NVRS_DIR).sort()) {
    const dir = path.join(NVRS_DIR, folder);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir).sort()) {
      if (!f.endsWith(".json")) continue;
      const file = path.join("nvrs", folder, f);
      let rec;
      try {
        rec = JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
      } catch (e) {
        throw new Error(`${file}: invalid JSON (${e.message})`);
      }
      out.push({ file, folder, slug: f.slice(0, -5), rec });
    }
  }
  return out;
}

function validate(entries) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const check = ajv.compile(JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8")));
  const errors = [];
  const ids = new Map();
  const cameraBrand = new Map();
  for (const { file, folder, slug, rec } of entries) {
    if (!check(rec)) {
      for (const e of check.errors) errors.push(`${file}: ${e.instancePath || "/"} ${e.message}`);
    }
    if (rec.id !== `${folder}-${slug}`) errors.push(`${file}: id "${rec.id}" should be "${folder}-${slug}"`);
    if (ids.has(rec.id)) errors.push(`${file}: duplicate id "${rec.id}" (also ${ids.get(rec.id)})`);
    ids.set(rec.id, file);
    if (!cameraBrand.has(folder)) {
      const camDir = path.join(CAMERAS_DIR, folder);
      let brand = null;
      if (fs.existsSync(camDir)) {
        const first = fs.readdirSync(camDir).find((x) => x.endsWith(".json"));
        if (first) brand = JSON.parse(fs.readFileSync(path.join(camDir, first), "utf8")).brand;
      }
      cameraBrand.set(folder, brand);
    }
    const b = cameraBrand.get(folder);
    if (b && rec.brand !== b) errors.push(`${file}: brand "${rec.brand}" differs from cameras/${folder} ("${b}")`);
    for (const a of rec.aliases || []) {
      if (/[^\x20-\x7e]/.test(a)) errors.push(`${file}: alias "${a}" is not plain ASCII`);
    }
  }
  if (errors.length) {
    console.error(`✗ ${errors.length} recorder validation error(s):`);
    for (const e of errors.slice(0, 200)) console.error("  " + e);
    process.exit(1);
  }
}

const CSV_COLUMNS = [
  ["id", (r) => r.id],
  ["brand", (r) => r.brand],
  ["model", (r) => r.model],
  ["kind", (r) => r.kind],
  ["series", (r) => r.series],
  ["ip_channels", (r) => r.channels && r.channels.ip],
  ["analog_channels", (r) => r.channels && r.channels.analog],
  ["analog_formats", (r) => (r.analog_formats || []).join("|")],
  ["incoming_mbps", (r) => r.bandwidth && r.bandwidth.incoming_mbps],
  ["max_camera_mp", (r) => r.video && r.video.max_camera_mp],
  ["bays", (r) => r.storage && r.storage.bays],
  ["max_tb_per_bay", (r) => r.storage && r.storage.max_capacity_per_bay_tb],
  ["poe_ports", (r) => r.poe && r.poe.ports],
  ["poe_budget_w", (r) => r.poe && r.poe.budget_w],
  ["protocols", (r) => (r.protocols || []).join("|")],
  ["ndaa_compliant", (r) => r.ndaa_compliant],
  ["status", (r) => r.status],
  ["source", (r) => (r.sources || [])[0]],
  ["last_verified", (r) => r.last_verified],
];

function csvCell(v) {
  if (v === undefined || v === null) return "";
  const s = String(typeof v === "object" ? JSON.stringify(v) : v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(recs) {
  const lines = [CSV_COLUMNS.map((c) => c[0]).join(",")];
  for (const r of recs) lines.push(CSV_COLUMNS.map(([, f]) => csvCell(f(r))).join(","));
  return lines.join("\n") + "\n";
}

function buildNvrs({ mirrorDir } = {}) {
  const entries = loadRecorders();
  if (!entries.length) return [];
  validate(entries);
  const recs = entries.map((e) => e.rec);
  const json = JSON.stringify(recs, null, 2) + "\n";
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, "nvrs.json"), json);
  fs.writeFileSync(path.join(DATA_DIR, "nvrs.csv"), toCsv(recs));
  const outputs = ["data/nvrs.json", "data/nvrs.csv"];
  const docsDir = path.join(ROOT, "docs");
  if (fs.existsSync(docsDir)) {
    fs.writeFileSync(path.join(docsDir, "nvrs.json"), json);
    outputs.push("docs/nvrs.json");
  }
  if (mirrorDir && fs.existsSync(mirrorDir)) {
    fs.writeFileSync(path.join(mirrorDir, "nvrs.json"), json);
    outputs.push(path.join(mirrorDir, "nvrs.json"));
  }
  const brands = new Set(recs.map((r) => r.brand)).size;
  console.log(`✓ Built ${recs.length} recorder(s) from ${brands} brands → ${outputs.join(" + ")}`);
  return recs;
}

module.exports = { buildNvrs };

if (require.main === module) buildNvrs({ mirrorDir: process.env.DATA_MIRROR_DIR });
