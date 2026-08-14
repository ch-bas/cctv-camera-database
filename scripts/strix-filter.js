#!/usr/bin/env node
/**
 * STRIX INGEST — stage 2-3: PRE-FILTER + CLUSTER + TRIAGE.  [STUB]
 *
 * Reads strix/leads-new.json (from strix-fetch.js), drops obvious junk with a
 * recorded reason, clusters survivors by brand, and triages each brand as one
 * we ALREADY cover vs. a NEW-coverage lead. Emits strix/verify-queue.json.
 *
 * This is the LAST automated stage. Everything in verify-queue.json is a
 * *candidate*, never a fact — nothing is published here. The verification gate
 * (stage 4: confirm each candidate against the manufacturer's own docs, via the
 * agent fleet + build-spec) and publish (stage 5) are separate, human-merged
 * steps. See docs/strix-ingest-design.md.
 *
 * The pre-filter rules below encode the pilot's learnings (D-Link /play*.sdp,
 * the Dahua-realmonitor-misfiled-under-Reolink case, go2rtc custom names, etc.).
 * They are deliberately CONSERVATIVE: when unsure, keep the lead as a candidate
 * and let verification decide — the filter only drops the provably-junk.
 *
 * Usage:
 *   node scripts/strix-filter.js
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const CAMERAS_DIR = path.join(ROOT, 'cameras');
const LEADS_NEW = path.join(ROOT, 'strix', 'leads-new.json');
const QUEUE = path.join(ROOT, 'strix', 'verify-queue.json');

// Brands whose OFFICIAL scheme is a bare numeric path — so "/0","/4" are NOT junk.
const NUMERIC_PATH_OK = new Set(['grandstream']);

// Brand-slug tokens that legitimately own a path fragment, used to catch
// cross-brand misfiles (e.g. a Dahua "realmonitor" path filed under Reolink).
const PATH_OWNER = [
  { fragment: 'realmonitor', brands: ['dahua', 'amcrest'] },   // Dahua/Amcrest OEM
  { fragment: 'cam/realmonitor', brands: ['dahua', 'amcrest'] },
];

main();

function main() {
  if (!fs.existsSync(LEADS_NEW)) {
    console.log('strix-filter: no strix/leads-new.json — run strix-fetch first. No-op.');
    process.exit(0);
  }
  const { leads = [] } = JSON.parse(fs.readFileSync(LEADS_NEW, 'utf8'));
  if (leads.length === 0) { console.log('strix-filter: empty delta — no queue written.'); process.exit(0); }

  const haveBrands = existingBrandSlugs();

  // stage 2: pre-filter
  const kept = [];
  const rejected = [];
  for (const lead of leads) {
    const reason = junkReason(lead);
    if (reason) rejected.push({ ...lead, reason });
    else kept.push(lead);
  }

  // stage 3: cluster by brand + triage
  const byBrand = new Map();
  for (const lead of kept) {
    const slug = slugify(lead.brand_id);
    if (!byBrand.has(slug)) byBrand.set(slug, []);
    byBrand.get(slug).push(lead);
  }

  const brands = [...byBrand.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([slug, ls]) => ({
    brand_id: slug,
    have_brand: haveBrands.has(slug),
    triage: haveBrands.has(slug) ? 'template-cross-check' : 'new-coverage',
    candidate_count: ls.length,
    // TODO stage 4: one verify agent per candidate — confirm path/model vs official doc.
    candidates: ls.map(l => ({ url: l.url, protocol: l.protocol, port: l.port, verified: null, source: null })),
  }));

  const queue = {
    generated: stamp(),
    summary: {
      leads_in: leads.length,
      rejected: rejected.length,
      candidates: kept.length,
      brands: brands.length,
      new_coverage: brands.filter(b => !b.have_brand).length,
    },
    brands,
    rejected,
  };
  fs.writeFileSync(QUEUE, JSON.stringify(queue, null, 2) + '\n');

  console.log(
    `strix-filter: ${leads.length} leads → ${rejected.length} rejected, ${kept.length} candidates ` +
    `across ${brands.length} brand(s) (${queue.summary.new_coverage} new) → ${path.relative(ROOT, QUEUE)}`
  );
  console.log('strix-filter: candidates are UNVERIFIED — stage 4 (official-doc check) must run before anything ships.');
}

/**
 * Return a rejection reason string if the lead is out-of-scope or provably junk,
 * else null. Conservative by design — verification is the real gate.
 *
 * NOTE on StrixCamDB's format: the `url` column holds a bare path/suffix
 * (e.g. "/11", "snapshot.jpg", "cgi-bin/snapshot.cgi?..."), NOT a full URL; the
 * scheme lives in the `protocol` column. We normalize to a path before matching.
 */
function junkReason(lead) {
  const slug = slugify(lead.brand_id);
  const proto = String(lead.protocol || '').toLowerCase();
  const p = normalizePath(lead.url);

  if (!p || p === '/') return 'no path component';

  // Out of scope for the RTSP-pattern layer (not junk — just not what this layer holds)
  if (proto && proto !== 'rtsp') return `non-rtsp protocol (${proto}) — out of scope for RTSP layer`;
  if (/\.(jpg|jpeg|mjpg|mjpeg|asf|cgi)(\?|$)/i.test(p)) return 'http snapshot/mjpeg path — out of scope for RTSP layer';

  // bare / numeric path, unless the brand's official scheme is numeric
  if (/^\/\d+$/.test(p) && !NUMERIC_PATH_OK.has(slug)) return `bare numeric path (${p})`;

  // scan-lineage .sdp smell (iSpy-class): /play*.sdp is in scan DBs, no official manual
  if (/^\/play\d*\.sdp$/i.test(p)) return 'scan-lineage /play*.sdp (never in an official manual)';

  // user-custom go2rtc friendly names (e.g. /Salon/mainstream, /Driveway/sub)
  if (/^\/[A-Z][A-Za-z]+\/(main|sub)stream$/.test(p)) return 'user-custom go2rtc friendly-name path';

  // cross-brand misfile (a path owned by another brand filed under this one)
  for (const { fragment, brands } of PATH_OWNER) {
    if (p.toLowerCase().includes(fragment) && !brands.includes(slug)) {
      return `cross-brand misfile: '${fragment}' path filed under ${slug}`;
    }
  }

  // obvious typo
  if (/_sup(\b|$)/.test(p)) return 'likely typo (_sup → _sub)';

  return null;
}

// ── helpers ──────────────────────────────────────────────────────────────
function existingBrandSlugs() {
  if (!fs.existsSync(CAMERAS_DIR)) return new Set();
  return new Set(fs.readdirSync(CAMERAS_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory()).map(e => e.name));
}
/**
 * Normalize a StrixCamDB `url` (bare path/suffix OR full URL) to a leading-slash
 * path with the query/fragment stripped.
 */
function normalizePath(url) {
  let u = String(url || '').trim();
  if (!u) return '';
  const m = u.match(/^[a-z][a-z0-9+.-]*:\/\/[^/]+(\/.*)?$/i); // strip scheme://host if present
  if (m) u = m[1] || '/';
  if (!u.startsWith('/')) u = '/' + u;                        // bare suffix → path
  return u.replace(/[?#].*$/, '');
}
// Keep consistent with the dataset's slugify (scripts/add-camera.js).
function slugify(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
function stamp() { return process.env.STRIX_DATE || new Date().toISOString().slice(0, 10); }
