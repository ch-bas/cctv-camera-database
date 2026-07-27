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
const { execSync } = require("child_process");
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
        return { file: path.relative(ROOT, f), cam: JSON.parse(fs.readFileSync(f, "utf8")) };
      } catch (err) {
        console.error(`Failed to parse ${f}: ${err.message}`);
        process.exit(1);
      }
    })
    .sort((a, b) => a.cam.id.localeCompare(b.cam.id));
}

// Repo-relative camera file -> date (YYYY-MM-DD) the file was first added to
// git. Powers the `added` field injected into the *generated* aggregate for
// downstream consumers (RSS feed / "recently added" page). Returns an empty
// map — feature silently degrades — when history is unavailable or shallow;
// CI must therefore checkout with fetch-depth: 0 (see build.yml) or its
// "generated files are stale" rebuild would compute different dates.
function addedDates() {
  try {
    const shallow = execSync("git rev-parse --is-shallow-repository", { cwd: ROOT })
      .toString().trim();
    if (shallow === "true") return {};
    const out = execSync(
      "git log --diff-filter=A --name-only --format=__%ad --date=short -- cameras",
      { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }
    ).toString();
    const map = {};
    let date = null;
    for (const line of out.split("\n")) {
      if (line.startsWith("__")) date = line.slice(2).trim();
      // git log is newest-first: keep overwriting so a file re-added later
      // (e.g. after a rename) resolves to its oldest add date.
      else if (line.endsWith(".json") && date) map[line.trim()] = date;
    }
    return map;
  } catch {
    return {};
  }
}

// Fallback for files whose add is hidden behind a git rename (the bulk pass
// attributes the A to the old path): follow the file's history individually.
function addedDateFollow(file) {
  try {
    const out = execSync(
      `git log --follow --diff-filter=A --format=%ad --date=short -- "${file}"`,
      { cwd: ROOT }
    ).toString().trim().split("\n");
    return out[out.length - 1] || null; // oldest add
  } catch {
    return null;
  }
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

    // Drift guard for #124: a camera that mechanically moves (type ptz /
    // dual-lens / panoramic) and advertises onboard auto-tracking in its
    // free-text features must also set the structured `ptz.autotracking` flag,
    // or downstream (site filters, Frigate compat) sees an inconsistent record.
    // Fixed types (dome/bullet/fisheye/box) are intentionally excluded — their
    // "tracking" is digital/e-PTZ, which is not ptz.autotracking (see #126).
    const MOVING = new Set(["ptz", "dual-lens", "panoramic"]);
    const AUTOTRACK_TAG = /auto[- ]?track|smart track|subject track/i;
    if (
      MOVING.has(cam.type) &&
      (cam.features || []).some((f) => AUTOTRACK_TAG.test(f)) &&
      !cam.ptz?.autotracking
    ) {
      console.error(
        `✗ ${cam.id}: type "${cam.type}" advertises auto-tracking in features but ` +
        `does not set ptz.autotracking:true (add it, or reword the feature if the ` +
        `tracking is digital/e-PTZ rather than onboard mechanical — see #124/#126).`
      );
      ok = false;
    }
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
    "ik_rating", "two_way_audio", "release_year",
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
      c.ik_rating, c.audio?.two_way, c.release_year,
    ].map(esc).join(",")
  );
  return [cols.join(","), ...rows].join("\n") + "\n";
}

// Regenerate the repo-layout tree + the stats table in README.md so their
// per-brand counts and totals never drift from the actual dataset. The tree
// lives between the `repo-tree` HTML-comment markers (the markers sit *outside*
// the code fence, since comments inside a fence would render literally). The
// stats-table cells are patched in place. Returns true if README changed.
function updateReadme(cameras) {
  const readmePath = path.join(ROOT, "README.md");
  if (!fs.existsSync(readmePath)) return false;
  let readme = fs.readFileSync(readmePath, "utf8");

  const brandDirs = fs.readdirSync(CAMERAS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => ({
      dir: e.name,
      count: fs.readdirSync(path.join(CAMERAS_DIR, e.name)).filter((f) => f.endsWith(".json")).length,
    }))
    .sort((a, b) => b.count - a.count || a.dir.localeCompare(b.dir));
  const TOP = 6;
  const top = brandDirs.slice(0, TOP);
  const more = brandDirs.length - top.length;
  const total = cameras.length.toLocaleString("en-US");
  const brandCount = brandDirs.length;

  const tree = [
    "```",
    "cctv-camera-database/",
    "├── cameras/              # source of truth — one JSON file per camera, grouped by brand",
    ...top.map(({ dir, count }) => `│   ├── ${(dir + "/").padEnd(18)}# ${String(count).padStart(3)} cameras`),
    `│   └── …${more} more brands`,
    "├── data/                 # GENERATED — do not edit by hand",
    `│   ├── cameras.json      # all ${total} cameras as one array`,
    "│   └── cameras.csv       # flattened, spreadsheet-friendly",
    "├── schema/",
    "│   └── camera.schema.json",
    "├── scripts/",
    "│   └── build.js          # aggregates + validates cameras/ → data/",
    "├── docs/",
    "│   ├── glossary.md       # field reference (source — edit when adding fields)",
    "│   ├── cameras.json      # GENERATED — aggregate copy for the demo/Pages API",
    "│   └── cameras/          # GENERATED — one browsable .md spec sheet per camera",
    "├── CONTRIBUTING.md",
    "└── LICENSE",
    "```",
  ].join("\n");

  const START = "<!-- repo-tree:start (auto-generated by scripts/build.js — do not edit by hand) -->";
  const END = "<!-- repo-tree:end -->";
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const before = readme;
  const re = new RegExp(esc(START) + "[\\s\\S]*?" + esc(END));
  if (re.test(readme)) readme = readme.replace(re, `${START}\n${tree}\n${END}`);
  else console.warn("⚠ README repo-tree markers not found — skipping tree auto-update");

  // Keep the stats table + shields badges in sync with the tree so they can't
  // diverge (the camera badge URL-encodes the comma in the count as %2C).
  readme = readme
    .replace(/(\| Total cameras \| \*\*)[\d,]+(\*\* \|)/, `$1${total}$2`)
    .replace(/(\| Brands \| \*\*)\d+(\*\* \|)/, `$1${brandCount}$2`)
    .replace(/(badge\/cameras-)[\d,%C]+(-blue)/, `$1${total.replace(/,/g, "%2C")}$2`)
    .replace(/(badge\/brands-)\d+(-green)/, `$1${brandCount}$2`)
    .replace(/### All \d+ brands/, `### All ${brandCount} brands`);

  // "All brands" table (between brands-table markers): auto-refresh the Cameras
  // column and re-sort by count, but PRESERVE the hand-written display name and
  // Segment text (parsed back from the current table, keyed by brand field).
  // Brand-name aliases bridge the display name and the JSON `brand` value.
  const BT_START = "<!-- brands-table:start (auto-generated by scripts/build.js — do not edit counts by hand; edit the Segment text and it is preserved) -->";
  const BT_END = "<!-- brands-table:end -->";
  const btRe = new RegExp(esc(BT_START) + "[\\s\\S]*?" + esc(BT_END));
  if (btRe.test(readme)) {
    const brandCounts = {};
    for (const c of cameras) brandCounts[c.brand] = (brandCounts[c.brand] || 0) + 1;
    const ALIAS = { "Speco": "Speco Technologies", "Ubiquiti UniFi": "Ubiquiti", "Google Nest": "Google", "TVT": "TVT Digital", "Instar": "INSTAR" };
    const resolve = (display) => {
      const base = display.replace(/\s*\(.*\)$/, "").trim();
      if (brandCounts[base] != null) return base;
      if (ALIAS[base] && brandCounts[ALIAS[base]] != null) return ALIAS[base];
      return Object.keys(brandCounts).find((b) => b.toLowerCase() === base.toLowerCase()) || null;
    };
    const meta = {}; // brand field -> { display, segment } (preserved editorial text)
    for (const line of readme.match(btRe)[0].split("\n")) {
      const m = line.match(/^\|\s*(.+?)\s*\|\s*[\d,]+\s*\|\s*(.+?)\s*\|\s*$/);
      if (!m || m[1] === "Brand") continue;
      const key = resolve(m[1]);
      if (key && !meta[key]) meta[key] = { display: m[1], segment: m[2] };
    }
    const rows = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([brand, n]) => `| ${(meta[brand] && meta[brand].display) || brand} | ${n.toLocaleString("en-US")} | ${(meta[brand] && meta[brand].segment) || "—"} |`);
    const table = ["| Brand | Cameras | Segment |", "|-------|---------|---------|", ...rows].join("\n");
    readme = readme.replace(btRe, `${BT_START}\n${table}\n${BT_END}`);
  }

  if (readme === before) return false;
  fs.writeFileSync(readmePath, readme);
  return true;
}

function main() {
  const entries = loadCameras();
  const cameras = entries.map((e) => e.cam);
  validate(cameras);
  // Inject the git-derived `added` date into the generated aggregate only —
  // never into the per-camera source files (the schema stays authoritative
  // there; `added` is provenance metadata, not dataset content). Injected
  // after validation because the schema's additionalProperties: false would
  // otherwise reject it.
  const added = addedDates();
  const haveHistory = Object.keys(added).length > 0;
  for (const { file, cam } of entries) {
    const d = added[file] || (haveHistory ? addedDateFollow(file) : null);
    if (d) cam.added = d;
  }
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

  if (updateReadme(cameras)) outputs.push("README.md");

  console.log(`✓ Built ${cameras.length} camera(s) → ${outputs.join(" + ")}`);
}

main();
