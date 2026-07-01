#!/usr/bin/env node
/**
 * Aggregates all per-camera JSON files under /cameras into:
 *   - data/cameras.json  (array of all entries)
 *   - data/cameras.csv   (flattened, for spreadsheets)
 * Validates each entry against schema/camera.schema.json.
 *
 * Usage: node scripts/build.js
 */
const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const ROOT = path.resolve(__dirname, "..");
const CAMERAS_DIR = path.join(ROOT, "cameras");
const DATA_DIR = path.join(ROOT, "data");
const SCHEMA_PATH = path.join(ROOT, "schema", "camera.schema.json");

// Load a local, gitignored .env (if present) so optional settings like
// DATA_MIRROR_DIR can be configured without touching tracked files. No-op for
// CI and contributors who have no .env. Avoids depending on Node's --env-file
// flag, whose availability varies by version.
(function loadDotenv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const raw of fs.readFileSync(envPath, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (/^(".*"|'.*')$/.test(val)) val = val.slice(1, -1);
    if (!(key in process.env)) process.env[key] = val;
  }
})();

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return e.name.endsWith(".json") ? [p] : [];
  });
}

function loadCameras() {
  return walk(CAMERAS_DIR)
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(f, "utf8"));
      } catch (err) {
        console.error(`Failed to parse ${f}: ${err.message}`);
        process.exit(1);
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function validate(cameras) {
  // Schema is the source of truth: required fields, id slug pattern, enums,
  // types, and additionalProperties: false are all enforced by Ajv below.
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validateSchema = ajv.compile(schema);

  const seen = new Set();
  let ok = true;
  for (const cam of cameras) {
    if (!validateSchema(cam)) {
      ok = false;
      for (const err of validateSchema.errors) {
        const where = err.instancePath || "(root)";
        const extra = err.params && err.params.additionalProperty
          ? ` ("${err.params.additionalProperty}")`
          : "";
        console.error(`✗ ${cam.id || "?"}: ${where} ${err.message}${extra}`);
      }
    }
    // Uniqueness can't be expressed in the schema, so check it here.
    if (cam.id && seen.has(cam.id)) {
      console.error(`✗ duplicate id "${cam.id}"`);
      ok = false;
    }
    seen.add(cam.id);
  }
  if (!ok) {
    console.error("\nValidation failed. See errors above.");
    process.exit(1);
  }
}

function toCsv(cameras) {
  const cols = [
    "id", "brand", "model", "type",
    "resolution_label", "megapixels", "sensor",
    "field_of_view_deg", "night_vision_type", "ip_rating",
    "two_way_audio", "release_year",
  ];
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = cameras.map((c) =>
    [
      c.id, c.brand, c.model, c.type,
      c.resolution?.label, c.resolution?.megapixels, c.sensor,
      c.field_of_view_deg, c.night_vision?.type, c.ip_rating,
      c.audio?.two_way, c.release_year,
    ].map(esc).join(",")
  );
  return [cols.join(","), ...rows].join("\n") + "\n";
}

function main() {
  const cameras = loadCameras();
  validate(cameras);
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const jsonData = JSON.stringify(cameras, null, 2) + "\n";
  fs.writeFileSync(path.join(DATA_DIR, "cameras.json"), jsonData);
  fs.writeFileSync(path.join(DATA_DIR, "cameras.csv"), toCsv(cameras));
  const outputs = ["data/cameras.json", "data/cameras.csv"];

  // Also copy into docs/ so GitHub Pages can serve it
  const DOCS_DIR = path.join(ROOT, "docs");
  if (fs.existsSync(DOCS_DIR)) {
    fs.writeFileSync(path.join(DOCS_DIR, "cameras.json"), jsonData);
    outputs.push("docs/cameras.json");
  }

  // Optional: mirror cameras.json into a downstream consumer's directory.
  // Enable by setting DATA_MIRROR_DIR=/path/to/dir — a no-op when unset, so it
  // needs no knowledge of any particular downstream app (CI/contributors skip it).
  const mirrorDir = process.env.DATA_MIRROR_DIR;
  if (mirrorDir && fs.existsSync(mirrorDir)) {
    fs.writeFileSync(path.join(mirrorDir, "cameras.json"), jsonData);
    outputs.push(path.join(mirrorDir, "cameras.json"));

    // Sync-moment marker for downstream consumers, mirrored alongside
    // cameras.json above. Intentionally mirror-only (never written to
    // data/ or docs/, never committed to this repo) — it's a build
    // timestamp, not dataset content, and committing it here would make
    // CI's "generated files are stale" check fail on every run (the
    // timestamp never matches a prior commit).
    const meta = {
      generatedAt: new Date().toISOString(),
      cameraCount: cameras.length,
      brandCount: new Set(cameras.map((c) => c.brand)).size,
    };
    fs.writeFileSync(path.join(mirrorDir, "data-meta.json"), JSON.stringify(meta, null, 2) + "\n");
    outputs.push(path.join(mirrorDir, "data-meta.json"));
  }

  console.log(`✓ Built ${cameras.length} camera(s) → ${outputs.join(" + ")}`);
}

main();
