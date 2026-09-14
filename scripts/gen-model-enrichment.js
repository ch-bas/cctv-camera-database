#!/usr/bin/env node
/**
 * gen-model-enrichment.js — slim CC0 extract for external viewers that want to
 * enrich *identified* camera hardware with specs (e.g. map viewers rendering
 * accurate FOV cones, or spec cards on public-feed popups).
 *
 * Deliberately excludes: sources, configs, RTSP templates, and anything else
 * aimed at *connecting* to cameras. This extract identifies and describes
 * hardware; it does not help access it.
 *
 * Usage:  node scripts/gen-model-enrichment.js
 * Output: data/model-enrichment.json (compact JSON, ~1 MB)
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://www.cctv-database.com";

const cameras = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "cameras.json"), "utf8"));
const version = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")).version;

const records = cameras.map((c) => {
  const r = {
    id: c.id,
    brand: c.brand,
    model: c.model,
    type: c.type,
    url: `${SITE}/camera/${c.id}/`,
  };
  if (c.aliases?.length) r.aliases = c.aliases;
  // The viewer-facing payload: what the camera can see and show.
  if (c.field_of_view_deg) r.fov_deg = c.field_of_view_deg;
  if (c.resolution) {
    r.resolution = { mp: c.resolution.megapixels };
    if (c.resolution.max_width) r.resolution.w = c.resolution.max_width;
    if (c.resolution.max_height) r.resolution.h = c.resolution.max_height;
    if (c.resolution.label) r.resolution.label = c.resolution.label;
  }
  if (c.type === "ptz" || c.ptz) r.ptz = true;
  if (c.ptz?.autotracking) r.autotracking = true;
  if (c.lens?.count > 1) r.lens_count = c.lens.count;
  if (c.lens?.varifocal) r.varifocal = true;
  if (c.night_vision?.type && c.night_vision.type !== "none") {
    r.night_vision = { type: c.night_vision.type };
    if (c.night_vision.range_m) r.night_vision.range_m = c.night_vision.range_m;
  }
  if (c.environment?.length) r.environment = c.environment;
  if (c.ndaa_compliant != null) r.ndaa_compliant = c.ndaa_compliant;
  return r;
});

const out = {
  _meta: {
    name: "CCTV Camera Database — model enrichment extract",
    description:
      "Camera MODEL specifications for enriching identified hardware (FOV cones, spec cards). No locations, no endpoints, no access/config data — this describes camera products, not installations.",
    license: "CC0-1.0",
    version,
    generated: new Date().toISOString().slice(0, 10),
    cameras: records.length,
    source: "https://github.com/ch-bas/cctv-camera-database",
    site: SITE,
    join_hint:
      "Match on `model` (exact, case-insensitive) or any of `aliases`; `brand` disambiguates collisions. fov_deg is the datasheet string (may be per-focal-length or a range).",
  },
  cameras: records,
};

const outPath = path.join(ROOT, "data", "model-enrichment.json");
fs.writeFileSync(outPath, JSON.stringify(out) + "\n");
const kb = Math.round(fs.statSync(outPath).size / 1024);
const withFov = records.filter((r) => r.fov_deg).length;
console.log(`✓ Wrote ${records.length} models → data/model-enrichment.json (${kb} KB; ${withFov} with FOV)`);
