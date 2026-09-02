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

// Precise numeric sensor size in inches parsed from the raw `sensor` string,
// injected into the *generated* aggregate so the site can sort by it without
// re-parsing 3k+ strings at runtime. `1/1.79"` → 0.5587, `1"` → 1, `2/3"` →
// 0.667, `4/3"` → 1.333. Returns null when no optical format is stated (so the
// site sorts those rows last rather than as 0). Mirrors the web's sensorSizeInch.
function sensorSizeInch(sensor) {
  if (!sensor) return null;
  const frac = sensor.match(/\b1\s*\/\s*(\d+(?:\.\d+)?)\s*["″”]?/);
  if (frac) { const d = parseFloat(frac[1]); return Number.isFinite(d) && d > 0 ? 1 / d : null; }
  // Accept a quote (1"), a Unicode prime, OR the worded unit ("1-inch", "1 in.",
  // "1 inch") so worded-format flagships (e.g. Bosch's 1" MIC 7504 / NDP-7804)
  // sort by their true size instead of collapsing to null.
  const big = sensor.match(/\b(1|4\s*\/\s*3|2\s*\/\s*3)\s*(?:["″”]|[-\s]*in(?:ch(?:es)?)?\b\.?)/i);
  if (big) { const t = big[1].replace(/\s+/g, ""); return t === "1" ? 1 : t === "4/3" ? 4 / 3 : t === "2/3" ? 2 / 3 : null; }
  return null;
}

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
    // Guard the id so a contributor file missing `id` sorts harmlessly and then
    // fails with Ajv's friendly "must have required property 'id'" error, rather
    // than a bare TypeError here that names no file.
    .sort((a, b) => (a.cam.id || "").localeCompare(b.cam.id || ""));
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

  // Non-fatal warning collectors (printed as a summary at the end). These
  // surface data issues without failing the build, because they have legitimate
  // exceptions in the current data that need per-record cleanup first.
  const warnResMismatch = []; // #169 megapixels vs max_width×max_height
  const warnResMissing = [];  // #169 megapixels present but no pixel resolution
  const warnResellerOnly = []; // #165 no official OEM source

  // #165: a source is "official" if its host is (a sub-domain of) a known OEM
  // registrable domain, or contains a token of the brand name (>=4 chars).
  // Registrable-domain suffix matching (not substring) avoids false hits like
  // `mi.com` matching `dynami.com`. Extend as new brands appear — this is a
  // best-effort provenance heuristic tied to the re-sourcing effort in #164.
  const OFFICIAL_DOMAINS = [
    "boschsecurity.com", "boschbuildingtechnologies.com", "keenfinity.tech",
    "tp-link.com", "tapo.com", "ui.com", "ubnt.com", "ajax.systems",
    "hanwhavision.com", "hanwhavisionamerica.com", "dahuasecurity.com",
    "hikvision.com", "reolink.com", "eufy.com", "arlo.com", "wyze.com",
    "ezviz.com", "imou.com", "aqara.com", "acti.com", "kedacom.com",
    "uniview.com", "uniarch.com", "avigilon.com", "axis.com", "vivotek.com",
    "tiandy.com", "annke.com", "amcrest.com", "lorex.com", "foscam.com",
    "instar.com", "instar.de", "cpplusworld.com", "specotech.com",
    "mi.com", "xiaomi.com", "tvt.net.cn", "arecontvision.com", "geovision.com",
    "hilook.com", "milesight.com", "sunell.com",
  ];
  const hostMatches = (host, dom) => host === dom || host.endsWith("." + dom);
  const isOfficialSource = (cam, url) => {
    let host = "";
    try { host = new URL(url).host.toLowerCase(); } catch { return false; }
    if (OFFICIAL_DOMAINS.some((d) => hostMatches(host, d))) return true;
    const brandTokens = (cam.brand || "").toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter((t) => t.length >= 4);
    return brandTokens.some((t) => host.includes(t));
  };

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

    // Placeholder / sentinel bad-data guard (#180). Some datasheets state a
    // figure that is technically valid JSON but semantically wrong for the
    // field — most notably "0 lux (IR on)", which is NOT the ambient
    // sensitivity `min_lux` represents (0 lux = no light = nothing to see
    // without IR). 15 such entries had to be stripped by hand once; this keeps
    // them from creeping back. Extend SENTINELS as new traps are found.
    const SENTINELS = [
      ["night_vision.min_lux", cam.night_vision?.min_lux, (v) => v === 0],
      ["night_vision.min_lux_color", cam.night_vision?.min_lux_color, (v) => v === 0],
      ["weight_g", cam.weight_g, (v) => v === 0],
    ];
    for (const [field, value, isBad] of SENTINELS) {
      if (value != null && isBad(value)) {
        console.error(
          `✗ ${cam.id}: ${field} = ${JSON.stringify(value)} is a placeholder/sentinel, ` +
          `not a real spec — leave the field undefined instead (see #180).`
        );
        ok = false;
      }
    }

    // Resolution sanity (#169). FATAL part = structural integrity: a pixel
    // resolution must be complete (both width AND height) and positive. This
    // guards against a contributor entering one dimension without the other.
    const r = cam.resolution || {};
    const hasW = r.max_width != null, hasH = r.max_height != null;
    if (hasW !== hasH) {
      console.error(`✗ ${cam.id}: resolution has ${hasW ? "max_width" : "max_height"} but not the other — a pixel resolution needs both (see #169).`);
      ok = false;
    }
    if ((hasW && (!Number.isInteger(r.max_width) || r.max_width <= 0)) ||
        (hasH && (!Number.isInteger(r.max_height) || r.max_height <= 0))) {
      console.error(`✗ ${cam.id}: resolution.max_width/max_height must be positive integers (see #169).`);
      ok = false;
    }
    // WARNING part (non-fatal): megapixels vs pixel count. Skipped for
    // multi-imager cameras — the panoramic / dual-lens types, but ALSO any
    // camera with lens.count > 1 (e.g. a multi-directional PTZ/dome typed `ptz`
    // or `dome`) — where the stated megapixels is the COMBINED total across
    // sensors and legitimately exceeds a single max_width×max_height. For
    // single-sensor cameras a large gap usually means one of the two was updated
    // without the other (e.g. resolution bumped to 4K but megapixels left at 2).
    const MULTI_IMAGER = new Set(["panoramic", "dual-lens"]);
    const isMultiImager = MULTI_IMAGER.has(cam.type) || (cam.lens && cam.lens.count > 1);
    if (r.megapixels != null && hasW && hasH) {
      const computed = (r.max_width * r.max_height) / 1e6;
      const ratio = computed / r.megapixels;
      if (!isMultiImager && Math.abs(computed - r.megapixels) > 1.0 && (ratio < 0.6 || ratio > 1.6)) {
        warnResMismatch.push(`${cam.id}: stated ${r.megapixels}MP vs ${r.max_width}×${r.max_height}=${computed.toFixed(2)}MP (type=${cam.type})`);
      }
    } else if (r.megapixels != null && !hasW && !hasH) {
      warnResMissing.push(cam.id);
    }

    // Source provenance (#165): flag cameras with NO official OEM source (only
    // reseller/marketplace/mirror URLs). Non-fatal — existing entries are being
    // re-sourced under #164; this surfaces the backlog and catches new ones.
    if ((cam.sources || []).length && !cam.sources.some((s) => isOfficialSource(cam, s))) {
      warnResellerOnly.push(cam.id);
    }
  }

  // ── Non-fatal warning summaries ──────────────────────────────────────────
  if (warnResMissing.length) {
    console.warn(`\n⚠  #169: ${warnResMissing.length} camera(s) have megapixels but no pixel resolution (max_width/max_height) — needs a resolution backfill:`);
    console.warn("   " + warnResMissing.join(", "));
  }
  if (warnResMismatch.length) {
    console.warn(`\n⚠  #169: ${warnResMismatch.length} single-sensor camera(s) where megapixels disagrees with max_width×max_height — likely one field is stale:`);
    warnResMismatch.forEach((w) => console.warn("   " + w));
  }
  if (warnResellerOnly.length) {
    console.warn(`\n⚠  #165: ${warnResellerOnly.length} camera(s) have no official OEM source (reseller/mirror only) — re-source under #164.`);
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
    "community_notes_count",
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
      Array.isArray(c.community_notes) ? c.community_notes.length : 0,
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

  // RTSP-layer totals live in the (separately generated) rtsp-patterns.json;
  // read them so the README's brand/verified/template counts can't drift from
  // the actual layer (they previously disagreed across three spots).
  const rtspPath = path.join(DATA_DIR, "rtsp-patterns.json");
  const rtsp = fs.existsSync(rtspPath)
    ? (JSON.parse(fs.readFileSync(rtspPath, "utf8"))._meta || {}).totals || {}
    : {};

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
    "│   ├── cameras.csv       # flattened, spreadsheet-friendly",
    `│   └── rtsp-patterns.json  # CC0 brand-level RTSP URL layer (${rtsp.brands ?? "?"} brands)`,
    "├── strix/",
    "│   └── verified/         # per-brand RTSP source files → rtsp-patterns.json",
    "├── schema/",
    "│   └── camera.schema.json",
    "├── scripts/",
    "│   └── build.js          # aggregates + validates cameras/ → data/",
    "├── tools/                # local QA tool (qa.html) + browser schema validator",
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
    .replace(/### All \d+ brands/, `### All ${brandCount} brands`)
    // Prose counts that would otherwise drift (intro line, demo-GIF alt, pagination).
    .replace(/(database of )[\d,]+( CCTV \/ IP camera models)/, `$1${total}$2`)
    .replace(/(covering )\d+( brands across)/, `$1${brandCount}$2`)
    .replace(/(inspect )[\d,]+( cameras across )\d+( brands)/, `$1${total}$2${brandCount}$3`)
    .replace(/(page through all )[\d,]+( cameras)/, `$1${total}$2`)
    // Showcase GIF alt-text + caption ("search N cameras", appears twice).
    .replace(/(search )[\d,]+( cameras)/g, `$1${total}$2`)
    // "all N cameras as one array" (Get-the-data table + repo-tree line) and the
    // <details> summary brand count — both had drifted because nothing synced them.
    .replace(/(all )[\d,]+( cameras as one array)/g, `$1${total}$2`)
    .replace(/(<summary><strong>All )\d+( brands<\/strong>)/, `$1${brandCount}$2`);

  // RTSP-layer counts (tree line above + the prose sentence) — kept in lockstep
  // with rtsp-patterns.json's _meta.totals so the two never disagree again.
  if (rtsp.brands != null) {
    readme = readme.replace(
      /(reference\*\* for )\d+( brands \()\d+( verified \/ )\d+( unverified \/ )\d+( stream templates\))/,
      `$1${rtsp.brands}$2${rtsp.verified}$3${rtsp.unverified}$4${rtsp.templates}$5`
    );
  }

  // "By the numbers" stat rows — computed from the dataset so they never drift
  // (previously hand-written and went stale, e.g. the color-lux count).
  const n = (f) => cameras.filter(f).length.toLocaleString("en-US");
  const psHas = (k) => (x) => x.power_source && x.power_source.includes(k);
  const mpOf = (x) => (x.resolution && x.resolution.megapixels) || 0;
  const stats = {
    poe: n((x) => psHas("poe")(x)),
    wifi: n((x) => x.connectivity && x.connectivity.includes("wifi")),
    batt: n((x) => psHas("battery")(x)),
    // MP bins partition the whole catalogue (labels must match these ranges):
    // ≥8MP, 4–7MP, and everything under 4MP (incl. the 0-MP Reolink hub).
    uhd: n((x) => mpOf(x) >= 8),
    mid: n((x) => mpOf(x) >= 4 && mpOf(x) < 8),
    fhd: n((x) => mpOf(x) < 4),
    cfg: n((x) => x.configs && (x.configs.frigate || x.configs.home_assistant)),
    clux: n((x) => x.night_vision && x.night_vision.min_lux_color != null),
  };
  readme = readme
    .replace(/(\| PoE wired \| )[\d,]+( \|)/, `$1${stats.poe}$2`)
    .replace(/(\| WiFi \| )[\d,]+( \|)/, `$1${stats.wifi}$2`)
    .replace(/(\| Battery \/ wire-free \| )[\d,]+( \|)/, `$1${stats.batt}$2`)
    .replace(/(\| 4K \/ 8MP\+ \| )[\d,]+( \|)/, `$1${stats.uhd}$2`)
    .replace(/(\| 4–7MP \| )[\d,]+( \|)/, `$1${stats.mid}$2`)
    .replace(/(\| Under 4MP \| )[\d,]+( \|)/, `$1${stats.fhd}$2`)
    .replace(/(\| With integration configs \(Frigate \/ Home Assistant\) \| )[\d,]+( \|)/, `$1${stats.cfg}$2`)
    .replace(/(\| With color-lux rating \(`night_vision\.min_lux_color`\) \| )[\d,]+( \|)/, `$1${stats.clux}$2`);

  // Roadmap backlog counts + citation version — dataset/package-derived so the
  // contributor-recruiting section stays honest (these are hand-written prose that
  // silently drifted: missing-resolution, Frigate-verified, and the citation tag).
  // (The reseller-only count comes from the #164/#165 OEM-source lint heuristic, not
  // the dataset, so it stays a manual edit here.)
  const missingRes = cameras.filter((x) => x.resolution && x.resolution.megapixels && !(x.resolution.max_width && x.resolution.max_height)).length;
  const frigTotal = cameras.filter((x) => x.configs && x.configs.frigate).length;
  const frigVer = cameras.filter((x) => x.configs && x.configs.frigate && x.configs.frigate.verified === true).length;
  const pkgVersion = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")).version;
  readme = readme
    .replace(/(Backfill pixel resolution\*\* for the ~)[\d,]+( entries that state megapixels)/, `$1${missingRes.toLocaleString("en-US")}$2`)
    .replace(/(only )[\d,]+( of )[\d,]+( shipped configs are community-verified)/, `$1${frigVer.toLocaleString("en-US")}$2${frigTotal.toLocaleString("en-US")}$3`)
    .replace(/(CCTV Camera Database \(v)[\d.]+(\))/, `$1${pkgVersion}$2`);

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
  // Inject derived fields into the generated aggregate only — never into the
  // per-camera source files (the schema stays authoritative there; these are
  // computed provenance/convenience metadata, not dataset content). Injected
  // after validation because the schema's additionalProperties: false would
  // otherwise reject them. Kept flat (like `added`/`sensor_size_inch`) so the
  // site consumes them uniformly.
  const added = addedDates();
  const haveHistory = Object.keys(added).length > 0;
  for (const { file, cam } of entries) {
    const d = added[file] || (haveHistory ? addedDateFollow(file) : null);
    if (d) cam.added = d;
    const ssi = sensorSizeInch(cam.sensor);
    if (ssi != null) cam.sensor_size_inch = Math.round(ssi * 10000) / 10000;
    // Substream coverage/convenience: only when video.streams exists. count=0
    // (streams present but main-only) is distinct from the field being absent
    // (no stream data at all).
    const streams = cam.video && cam.video.streams;
    if (Array.isArray(streams)) {
      const subs = streams.filter((s) => s.name && s.name !== "main");
      cam.substream_count = subs.length;
      cam.substream_max_resolution = subs.reduce((best, s) => {
        const [w, h] = (s.resolution || "0x0").split("x").map(Number);
        const px = (w || 0) * (h || 0);
        return px > best.px ? { px, res: s.resolution || null } : best;
      }, { px: 0, res: null }).res;
    }
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
