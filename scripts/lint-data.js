#!/usr/bin/env node
/**
 * scripts/lint-data.js — data-consistency lint (CI idea #1).
 *
 * This COMPLEMENTS `scripts/build.js`, which already owns the hard schema gate
 * (AJV), duplicate-id, resolution-structure (#169), PTZ-drift (#124/#126),
 * placeholder-sentinel (#180) and reseller-source (#165) checks. This script
 * adds the cross-field CONSISTENCY invariants that a JSON Schema can't express.
 *
 *   ERRORS   → exit 1 (fails the PR). Kept to invariants the whole dataset
 *              currently satisfies, so `main` stays green.
 *   WARNINGS → advisory, printed but never fail CI.
 *
 * Usage:
 *   node scripts/lint-data.js          # lint (CI mode)
 *   node scripts/lint-data.js --fix    # additionally rewrite any JSON file
 *                                       # that isn't in canonical 2-space form
 *
 * See docs/ci.md for the full CI overview.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const CAM_DIR = "cameras";
const FIX = process.argv.includes("--fix");

// Manufacturer / datasheet-mirror domains. Mirrors build.js's OFFICIAL_DOMAINS
// (the isOfficialSource list) plus known datasheet-mirror hosts. A community
// note sourced from one of these is a datasheet fact → it's a spec, not a note.
const DATASHEET_DOMAINS = [
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
  // datasheet mirrors
  "axilogi.com",
];
const isDatasheetHost = (host) =>
  DATASHEET_DOMAINS.some((d) => host === d || host.endsWith("." + d));

// ── collect camera files ────────────────────────────────────────────────────
const files = [];
for (const brand of fs.readdirSync(CAM_DIR)) {
  const dir = path.join(CAM_DIR, brand);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    files.push(path.join(dir, f));
  }
}

const errors = [];
const warnings = [];
const bySource = {}; // url -> [id, ...]
let fixed = 0;

for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  let cam;
  try {
    cam = JSON.parse(raw);
  } catch (err) {
    errors.push(`${file}: invalid JSON — ${err.message}`);
    continue;
  }
  const id = cam.id || file;
  const ip = cam.ip_rating || "";
  const env = cam.environment || [];

  // E1 — indoor/outdoor vs weather rating (the #123 correctness class).
  // A camera whose IP rating is weatherproof (water digit ≥ 5, e.g. IP65/66/67,
  // incl. compound "IP66/IP67") must not be tagged indoor-ONLY.
  if (/IP\d[5-9]/.test(ip) && env.length === 1 && env[0] === "indoor") {
    errors.push(`${id}: ip_rating "${ip}" is weatherproof but environment is ["indoor"] only — should include "outdoor" (#123).`);
  }

  // E2 — ip_rating must contain at least one IEC 60529 IPxx token. Allows
  // compound ("IP66/IP67", "IP66/IP67/IP6K9K") and partial ratings where a
  // digit is unspecified ("IPX5", "IP5X"). Catches typos / stray text.
  if (ip && !/IP[\dX][\dX]/i.test(ip)) {
    errors.push(`${id}: ip_rating "${ip}" contains no valid IPxx code.`);
  }

  // E3 — weight_g sanity (schema only checks it's a number).
  if (cam.weight_g != null && (typeof cam.weight_g !== "number" || cam.weight_g <= 0 || cam.weight_g > 100000)) {
    errors.push(`${id}: weight_g ${JSON.stringify(cam.weight_g)} is out of range (expected 0 < g ≤ 100000).`);
  }

  // E6 — field_of_view_deg must be normalised without the "°" symbol (the whole
  // dataset was normalised in #231, so this stays enforced).
  if (typeof cam.field_of_view_deg === "string" && cam.field_of_view_deg.includes("°")) {
    errors.push(`${id}: field_of_view_deg contains "°" — strip the degree symbol.`);
  }

  // E4 — last_verified, when present, must be an ISO date (YYYY-MM-DD).
  if (cam.last_verified != null && !/^\d{4}-\d{2}-\d{2}$/.test(String(cam.last_verified))) {
    errors.push(`${id}: last_verified "${cam.last_verified}" is not an ISO date (YYYY-MM-DD).`);
  }

  // E7 — community_notes hygiene (observed behaviors, NOT specs — see CONTRIBUTING).
  if (Object.prototype.hasOwnProperty.call(cam, "community_notes")) {
    const cn = cam.community_notes;
    if (Array.isArray(cn) && cn.length === 0) {
      errors.push(`${id}: community_notes is an empty array — remove the key instead.`);
    }
    for (const n of Array.isArray(cn) ? cn : []) {
      const src = typeof n.source === "string" ? n.source : "";
      // Error — sourced from a manufacturer/datasheet domain → it's a spec, not a note.
      let host = "";
      try { host = new URL(src).host.toLowerCase(); } catch { /* not a URL (e.g. "empirical") */ }
      if (host && isDatasheetHost(host)) {
        errors.push(`${id}: community_note source "${src}" is a manufacturer/datasheet domain — a datasheet fact is a spec, not a community note.`);
      }
      // Warning — spec-like text suggesting this is really a correction.
      const text = String(n.note || "");
      if (/\b\d+\s?(MP|mp|fps|lux|mm|W|watt)\b/.test(text) && /\b(actually|really|should be|not\s+\d)\b/i.test(text)) {
        warnings.push(`${id}: community_note looks like a spec correction — should this go in the spec fields with a datasheet source? "${text.slice(0, 80)}${text.length > 80 ? "…" : ""}"`);
      }
      // Warning — implausible date (>30 days future, or before 2015).
      if (typeof n.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(n.date)) {
        const t = new Date(n.date + "T00:00:00Z").getTime();
        if (t - Date.now() > 30 * 24 * 3600 * 1000) warnings.push(`${id}: community_note date ${n.date} is >30 days in the future.`);
        if (new Date(n.date + "T00:00:00Z").getUTCFullYear() < 2015) warnings.push(`${id}: community_note date ${n.date} is before 2015 — check it.`);
      }
    }
  }

  // E5 — canonical formatting (2-space indent + trailing newline). Keeps diffs
  // clean. `--fix` rewrites; otherwise it's a hard error (the whole dataset was
  // canonicalised in #230, so this now stays enforced).
  const canonical = JSON.stringify(cam, null, 2) + "\n";
  if (raw !== canonical) {
    if (FIX) {
      fs.writeFileSync(file, canonical);
      fixed++;
    } else {
      errors.push(`${file}: not in canonical 2-space JSON form (run \`npm run lint -- --fix\`).`);
    }
  }

  // Collect for W2 (shared source URLs).
  for (const s of cam.sources || []) {
    const url = typeof s === "string" ? s : s && s.url;
    if (url) (bySource[url] = bySource[url] || []).push(id);
  }
}

// W2 — the same source URL on >1 camera. Most sharing is legitimate — brand
// hubs, category/family pages, manuals & datasheet PDFs, comparison/news
// articles, and regional/lens/colour variants of one model — so those are
// suppressed (audited in #232). What's left is the actionable class: a
// *specific product page* cited by cameras that aren't variants of each other
// (the #226 "sourced from another model's page" mistake).
const BENIGN_SHARE = /manualslib|manuals\.plus|\/dam\/|assets\.|\/support|\/brands?\/|\/category|\/collections?\/|\/products\/?(\?|#|$)|user-?manual|\.pdf(\?|$)|\/downloads?\/|\/faq|\/news|\/press|\/blog|\/article|difference|comparison|businesswire|notebookcheck|9to5|ces|\/(en|us|uk|in-en|kz\/en|mena-en)\/?$/i;
// Strip trailing region / lens / colour / resolution suffixes to a "model root".
const modelRoot = (id) => id.replace(/-(mena|india|in|eu|us|uk|ca)$|-\d+mm$|-(white|black|w|b|telephoto|kit)$|-\d(mp|k)$/gi, "");
const shared = Object.entries(bySource).filter(([, ids]) => ids.length > 1);
for (const [url, ids] of shared) {
  if (BENIGN_SHARE.test(url)) continue;
  if (new Set(ids.map(modelRoot)).size <= 1) continue; // same model, different variant — fine
  warnings.push(`source shared across ${ids.length} distinct models — verify it covers each: ${url}  → ${ids.slice(0, 4).join(", ")}${ids.length > 4 ? " …" : ""}`);
}

// ── report ──────────────────────────────────────────────────────────────────
console.log(`Linted ${files.length} camera files.`);
if (FIX && fixed) console.log(`\n🔧 Reformatted ${fixed} file(s) to canonical JSON.`);

if (warnings.length) {
  console.log(`\n⚠  ${warnings.length} warning(s):`);
  for (const w of warnings.slice(0, 40)) console.log(`   • ${w}`);
  if (warnings.length > 40) console.log(`   … and ${warnings.length - 40} more.`);
}

if (errors.length) {
  console.error(`\n✗ ${errors.length} error(s):`);
  for (const e of errors) console.error(`   • ${e}`);
  console.error(`\nData-consistency lint FAILED.`);
  process.exit(1);
}

console.log(`\n✓ Data-consistency lint passed (${warnings.length} advisory warning(s)).`);
