#!/usr/bin/env node
/**
 * Generates a human-readable markdown doc for each camera JSON file into
 * docs/cameras/<brand>/<model>.md (mirroring the cameras/ tree), so the docs
 * never drift from the data and cameras/ stays pure source. These are a
 * generated artifact — served via GitHub Pages and refreshed by CI; do not
 * hand-edit and do not commit them from a contributor PR. Run after build.js.
 *
 * Usage: node scripts/gen-docs.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CAMERAS_DIR = path.join(ROOT, "cameras");
const DOCS_CAMERAS_DIR = path.join(ROOT, "docs", "cameras");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return e.name.endsWith(".json") ? [p] : [];
  });
}

const row = (k, v) => (v == null || v === "" ? "" : `| ${k} | ${v} |\n`);

// Night-vision cell. Guards a missing `type` (45 entries carry only a
// min_lux_color) so the page never renders a literal "undefined" or a stray
// leading comma; identical output to before when `type` is present.
function nightVision(nv) {
  if (!nv) return "";
  const head = [nv.type || "", nv.range_m ? `(${nv.range_m}m)` : ""].filter(Boolean).join(" ");
  const tail = [
    nv.min_lux ? `${nv.min_lux} lux` : "",
    nv.min_lux_color ? `${nv.min_lux_color} lux color` : "",
  ].filter(Boolean).join(", ");
  return [head, tail].filter(Boolean).join(", ");
}

function render(c) {
  let md = `# ${c.brand} ${c.model}\n\n`;
  if (c.aliases?.length) md += `*Also known as: ${c.aliases.join(", ")}*\n\n`;
  md += `| Field | Spec |\n|-------|------|\n`;
  md += row("Brand", c.brand);
  md += row("Model", c.model);
  md += row("Type", c.type);
  md += row("Connectivity", c.connectivity?.join(", "));
  md += row("Resolution", c.resolution && `${c.resolution.label || ""} (${c.resolution.megapixels}MP${c.resolution.max_width ? `, ${c.resolution.max_width}×${c.resolution.max_height}` : ""})`.trim());
  md += row("Sensor", c.sensor);
  md += row("Lens", c.lens && [c.lens.count ? `${c.lens.count}×` : "", c.lens.focal_length_mm ? `${c.lens.focal_length_mm}mm` : "", c.lens.aperture].filter(Boolean).join(" "));
  md += row("Field of view", c.field_of_view_deg && `${c.field_of_view_deg}°`);
  md += row("Night vision", nightVision(c.night_vision));
  md += row("Power", c.power?.method);
  md += row("Storage", c.storage && [c.storage.max_microsd_gb ? `microSD ≤ ${c.storage.max_microsd_gb}GB` : "", c.storage.nvr_compatible ? "NVR" : ""].filter(Boolean).join(", "));
  md += row("Protocols", c.protocols?.join(", "));
  md += row("IP rating", c.ip_rating);
  md += row("IK rating", c.ik_rating);
  md += row("Two-way audio", c.audio ? (c.audio.two_way ? "Yes" : "No") : "");
  md += row("Operating temp", c.operating_temp_c && `${c.operating_temp_c}°C`);
  md += row("Released", c.release_year);
  // Full per-stream table (main / sub / third …) — the single Resolution row
  // above only shows the main stream; substream res/fps/codec live here.
  if (c.video?.streams?.length) {
    md += `\n## Streams\n\n| Stream | Resolution | FPS | Codec |\n|--------|-----------|-----|-------|\n`;
    for (const s of c.video.streams) {
      md += `| ${s.name || "—"} | ${s.resolution || "—"} | ${s.fps ?? "—"} | ${s.codec || "—"} |\n`;
    }
  }
  if (c.features?.length) md += `\n## Features\n\n${c.features.map((f) => `- ${f}`).join("\n")}\n`;
  if (c.sources?.length) md += `\n## Sources\n\n${c.sources.map((s) => `- ${s}`).join("\n")}\n`;
  if (c.community_notes?.length) {
    md += `\n## Community notes (unverified)\n\n`;
    md += `*Reported by users. Not from the datasheet, not verified by the project.*\n\n`;
    for (const n of c.community_notes) {
      const meta = [
        n.category,
        n.firmware ? `firmware ${n.firmware}` : "",
        n.reported_by ? `reported by ${n.reported_by}` : "",
        n.date,
        n.source === "empirical" ? "tested on own device" : (n.source ? `[source](${n.source})` : ""),
      ].filter(Boolean).join(" · ");
      md += `- ${n.note}${meta ? `\n  \n  ${meta}` : ""}\n`;
    }
  }
  md += `\n---\n*Auto-generated from ${c.id}.json — do not edit by hand.*\n`;
  return md;
}

let count = 0;
const written = new Set();
for (const f of walk(CAMERAS_DIR)) {
  const c = JSON.parse(fs.readFileSync(f, "utf8"));
  const out = path.join(DOCS_CAMERAS_DIR, path.relative(CAMERAS_DIR, f).replace(/\.json$/, ".md"));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, render(c));
  written.add(path.resolve(out));
  count++;
}

// Prune docs for deleted/renamed cameras — the generator used to only ever
// write, so docs/cameras/ accumulated ghost pages (e.g. removed duplicates)
// that kept getting served via Pages. Remove any .md with no source JSON, then
// drop the brand dirs left empty.
let pruned = 0;
if (fs.existsSync(DOCS_CAMERAS_DIR)) {
  const walkMd = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(dir, e.name);
      return e.isDirectory() ? walkMd(p) : e.name.endsWith(".md") ? [p] : [];
    });
  for (const md of walkMd(DOCS_CAMERAS_DIR)) {
    if (!written.has(path.resolve(md))) { fs.unlinkSync(md); pruned++; }
  }
  for (const d of fs.readdirSync(DOCS_CAMERAS_DIR)) {
    const dp = path.join(DOCS_CAMERAS_DIR, d);
    if (fs.statSync(dp).isDirectory() && fs.readdirSync(dp).length === 0) fs.rmdirSync(dp);
  }
}
console.log(`✓ Generated ${count} markdown doc(s)${pruned ? `, pruned ${pruned} stale` : ""} → docs/cameras/`);
