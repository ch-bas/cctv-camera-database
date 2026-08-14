#!/usr/bin/env node
/**
 * Consolidates the per-brand verified RTSP templates under strix/verified/*.json
 * into the CC0 brand-level layer data/rtsp-patterns.json.
 *
 * This is stage 5 of the StrixCamDB ingest (see docs/strix-ingest-design.md).
 * Each strix/verified/<brand_id>.json is written by the verification fleet and
 * carries, per template, the official `source` it was confirmed against plus the
 * `strix_lead` discovery credit — so the aggregate is independently sourced and
 * CC0-clean. `status:"unverified"` entries (no official RTSP doc) are kept as an
 * honest record, with empty `templates`.
 *
 * Usage: node scripts/build-rtsp-patterns.js
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "strix", "verified");
const OUT = path.join(ROOT, "data", "rtsp-patterns.json");
// Keep deterministic in CI if ever wired there; else stamp after the fact.
const GENERATED = process.env.RTSP_PATTERNS_DATE || new Date().toISOString().slice(0, 10);

if (!fs.existsSync(SRC_DIR)) {
  console.error(`build-rtsp-patterns: ${path.relative(ROOT, SRC_DIR)} not found — nothing to build.`);
  process.exit(1);
}

const brands = fs.readdirSync(SRC_DIR)
  .filter(f => f.endsWith(".json"))
  .map(f => JSON.parse(fs.readFileSync(path.join(SRC_DIR, f), "utf8")))
  .sort((a, b) => a.brand_id.localeCompare(b.brand_id));

const verified = brands.filter(b => b.status === "verified");
const templates = brands.reduce((n, b) => n + ((b.templates || []).length), 0);

const agg = {
  _meta: {
    layer: "brand-rtsp-patterns",
    license: "CC0-1.0",
    description: "Brand-level RTSP URL templates for IP cameras, each verified against the manufacturer's own documentation.",
    methodology: "StrixCamDB is used ONLY as a lead source; every path here is independently re-verified against the manufacturer's official docs (manual / API / KB), so each record is independently sourced and CC0-clean, with Strix credited as the discovery source (strix_lead). Leads that could not be confirmed officially are recorded under unverified_leads and never published as fact.",
    generated: GENERATED,
    totals: {
      brands: brands.length,
      verified: verified.length,
      unverified: brands.length - verified.length,
      templates,
    },
  },
  brands,
};

fs.writeFileSync(OUT, JSON.stringify(agg, null, 2) + "\n");
console.log(
  `build-rtsp-patterns: ${brands.length} brand(s) (${verified.length} verified, ` +
  `${templates} templates) → ${path.relative(ROOT, OUT)}`
);
