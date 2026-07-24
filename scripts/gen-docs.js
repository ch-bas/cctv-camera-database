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
  md += row("Night vision", c.night_vision && `${c.night_vision.type}${c.night_vision.range_m ? ` (${c.night_vision.range_m}m)` : ""}${c.night_vision.min_lux_color ? `, ${c.night_vision.min_lux_color} lux color` : ""}`);
  md += row("Power", c.power?.method);
  md += row("Storage", c.storage && [c.storage.max_microsd_gb ? `microSD ≤ ${c.storage.max_microsd_gb}GB` : "", c.storage.nvr_compatible ? "NVR" : ""].filter(Boolean).join(", "));
  md += row("Protocols", c.protocols?.join(", "));
  md += row("IP rating", c.ip_rating);
  md += row("IK rating", c.ik_rating);
  md += row("Two-way audio", c.audio ? (c.audio.two_way ? "Yes" : "No") : "");
  md += row("Operating temp", c.operating_temp_c && `${c.operating_temp_c}°C`);
  md += row("Released", c.release_year);
  if (c.features?.length) md += `\n## Features\n\n${c.features.map((f) => `- ${f}`).join("\n")}\n`;
  if (c.sources?.length) md += `\n## Sources\n\n${c.sources.map((s) => `- ${s}`).join("\n")}\n`;
  md += `\n---\n*Auto-generated from ${c.id}.json — do not edit by hand.*\n`;
  return md;
}

let count = 0;
for (const f of walk(CAMERAS_DIR)) {
  const c = JSON.parse(fs.readFileSync(f, "utf8"));
  const out = path.join(DOCS_CAMERAS_DIR, path.relative(CAMERAS_DIR, f).replace(/\.json$/, ".md"));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, render(c));
  count++;
}
console.log(`✓ Generated ${count} markdown doc(s) → docs/cameras/`);
