#!/usr/bin/env node
/**
 * gen-netbox.js — generate NetBox devicetype-library YAML from camera JSON.
 *
 * Usage:
 *   node scripts/gen-netbox.js --brand Hikvision [--out netbox-out] [--limit 50] [--report]
 *
 * Rules (mirrors the project's datasheet-only policy):
 *   - Only cameras with power_source "poe" AND a known Ethernet link speed are emitted.
 *     Link speed must come from `network.ethernet_speed_mbps` (10/100/1000/2500/10000).
 *     devicetype-library requires an interface `type`; we never guess 100base-tx.
 *   - poe_type is derived from power.method text (802.3af/at/bt). Unparseable → poe_type omitted.
 *   - weight only emitted when weight_g is present (library asks for it, does not require it).
 *   - DC power port only emitted when power.method names a DC voltage.
 *   - comments link to the first entry in `sources` (the datasheet) + cctv-database.com page.
 *
 * --report lists PoE cameras that are blocked only by a missing ethernet speed,
 * with their datasheet URL so the field can be filled from the source.
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const BRAND = opt('--brand', null);
const OUT = opt('--out', 'netbox-out');
const LIMIT = parseInt(opt('--limit', '0'), 10);
const REPORT = args.includes('--report');

const SPEED_TYPE = { 10: '10base-t', 100: '100base-tx', 1000: '1000base-t', 2500: '2.5gbase-t', 10000: '10gbase-t' };

function slugify(s) {
  // devicetype-library rule: lowercase, keep letters/digits/hyphens, dots and whitespace -> hyphen, drop everything else
  return s.toLowerCase().replace(/[.\s_]+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

function poeType(method) {
  if (!method) return null;
  const m = method.toLowerCase();
  if (/802\.3 ?bt|poe\+\+|hi-?poe|90 ?w|60 ?w/.test(m)) return 'type3-ieee802.3bt';
  if (/802\.3 ?at|poe\+/.test(m)) return 'type2-ieee802.3at';
  if (/802\.3 ?af/.test(m)) return 'type1-ieee802.3af';
  return null; // plain "PoE" — don't guess the standard
}

function dcVoltage(method) {
  if (!method) return null;
  const m = method.match(/(\d{1,2})\s*V\s*DC|DC\s*(\d{1,2})\s*V|(\d{1,2})\s*VDC/i);
  if (!m) return null;
  return parseInt(m[1] || m[2] || m[3], 10);
}

function yamlStr(s) {
  // quote only when YAML would otherwise misparse (colons, parens are fine; leading special chars, quotes, '#')
  return /[:#'"{}\[\],&*?|<>=!%@`]|^\s|\s$|^$/.test(s) ? `'${s.replace(/'/g, "''")}'` : s;
}

function toYaml(c) {
  const speed = c.network && c.network.ethernet_speed_mbps;
  const ifType = SPEED_TYPE[speed];
  if (!ifType) return null;
  const method = c.power && c.power.method;
  const pt = poeType(method);
  const dcV = dcVoltage(method);
  const draw = c.power && c.power.consumption_w;
  const slug = `${slugify(c.brand)}-${slugify(c.model)}`;

  const L = [];
  L.push(`manufacturer: ${yamlStr(c.brand)}`);
  L.push(`model: ${yamlStr(c.model)}`);
  L.push(`slug: ${slug}`);
  L.push(`part_number: ${yamlStr(c.model)}`);
  L.push(`u_height: 0`);
  L.push(`is_full_depth: false`);
  L.push(`airflow: passive`);
  if (c.weight_g) { L.push(`weight: ${c.weight_g}`); L.push(`weight_unit: g`); }
  L.push(`interfaces:`);
  L.push(`  - name: eth0`);
  L.push(`    type: ${ifType}`);
  L.push(`    poe_mode: pd`);
  if (pt) L.push(`    poe_type: ${pt}`);
  if (draw || (c.power && c.power.poe_class != null)) {
    const d = [];
    if (c.power.poe_class != null) d.push(`PoE Class ${c.power.poe_class}`);
    if (draw) d.push(`max ${draw} W`);
    L.push(`    description: ${yamlStr(d.join(', '))}`);
  }
  if (dcV) {
    L.push(`power-ports:`);
    L.push(`  - name: DC IN`);
    L.push(`    type: dc-terminal`);
    if (draw) { L.push(`    maximum_draw: ${Math.ceil(draw)}`); }
    L.push(`    description: ${dcV}V DC`);
  }
  if (c.storage && c.storage.onboard && c.storage.max_microsd_gb) {
    L.push(`module-bays:`);
    L.push(`  - name: microSD`);
    L.push(`    position: microSD`);
    L.push(`    description: up to ${c.storage.max_microsd_gb} GB`);
  }
  const ds = c.sources && c.sources[0];
  const page = `https://cctv-database.com/camera/${c.id}`;
  L.push(`comments: >`);
  L.push(`  [${c.brand} ${c.model} datasheet](${ds}) | [Specs on cctv-database.com](${page})`);
  L.push('');
  return { slug, yaml: L.join('\n') };
}

// ---- main
let cams = [];
for (const b of fs.readdirSync('cameras')) {
  const d = path.join('cameras', b);
  if (!fs.statSync(d).isDirectory()) continue;
  for (const f of fs.readdirSync(d)) if (f.endsWith('.json')) cams.push(JSON.parse(fs.readFileSync(path.join(d, f))));
}
cams = cams.filter(c => (c.power_source || []).includes('poe') && (c.connectivity || []).includes('ethernet'));
if (BRAND) cams = cams.filter(c => c.brand.toLowerCase() === BRAND.toLowerCase());

if (REPORT) {
  const missing = cams.filter(c => !(c.network && c.network.ethernet_speed_mbps));
  console.log(`${missing.length} PoE cameras missing network.ethernet_speed_mbps`);
  for (const c of missing) console.log(`${c.id}\t${c.weight_g ? 'w' : '-'}${c.power && c.power.consumption_w ? 'p' : '-'}\t${c.sources[0]}`);
  process.exit(0);
}

let n = 0, skipped = 0;
for (const c of cams) {
  const r = toYaml(c);
  if (!r) { skipped++; continue; }
  const dir = path.join(OUT, 'device-types', c.brand);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${c.model.replace(/[\/\\]/g, '-')}.yaml`);
  if (fs.existsSync(file)) { console.error(`EXISTS - skip ${file}`); continue; }
  fs.writeFileSync(file, r.yaml);
  n++;
  if (LIMIT && n >= LIMIT) break;
}
console.log(`wrote ${n} device types to ${OUT}/, skipped ${skipped} (no ethernet speed)`);
