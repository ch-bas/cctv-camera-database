#!/usr/bin/env node
/**
 * Interactive CLI wizard for adding a new camera.
 * No JSON or schema knowledge required.
 *
 * Usage:
 *   node scripts/add-camera.js
 *   npm run add
 */

const fs   = require('fs');
const path = require('path');
const rl   = require('readline').createInterface({ input: process.stdin, output: process.stdout });

const ROOT     = path.resolve(__dirname, '..');
const CAM_DIR  = path.join(ROOT, 'cameras');

// ── helpers ──────────────────────────────────────────────────────
const ask = (q, fallback = '') => new Promise(res =>
  rl.question(q, ans => res(ans.trim() || fallback))
);

const askList = async (q, options) => {
  const opts = options.map((o, i) => `  ${i + 1}) ${o}`).join('\n');
  while (true) {
    const ans = await ask(`${q}\n${opts}\n> `);
    const n = parseInt(ans, 10);
    if (n >= 1 && n <= options.length) return options[n - 1];
    const match = options.find(o => o.toLowerCase().startsWith(ans.toLowerCase()));
    if (match) return match;
    console.log(`  ✗  Please enter a number 1–${options.length} or type the first few letters.`);
  }
};

const askYN = async (q) => {
  const ans = await ask(`${q} [y/n] `);
  return /^y/i.test(ans);
};

const slugify = s => s.toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

// ── wizard ───────────────────────────────────────────────────────
async function run() {
  console.log('\n┌─────────────────────────────────────────┐');
  console.log('│  CCTV Camera Database — Add a Camera    │');
  console.log('└─────────────────────────────────────────┘');
  console.log('  Press Enter to skip any optional field.\n');

  const cam = {};

  // Required
  cam.brand = await ask('Brand name  (e.g. Reolink, Hikvision, Dahua) : ');
  if (!cam.brand) { console.log('Brand is required.'); process.exit(1); }

  cam.model = await ask('Model name  (e.g. RLC-823A, DS-2CD2387G2-LU) : ');
  if (!cam.model) { console.log('Model is required.'); process.exit(1); }

  // Auto-generate ID, let user confirm/override
  const autoId = slugify(cam.brand + '-' + cam.model);
  const customId = await ask(`ID slug     (auto: ${autoId}) : `, autoId);
  cam.id = slugify(customId);

  cam.type = await askList('Form factor :', [
    'bullet', 'dome', 'turret', 'ptz', 'dual-lens', 'panoramic', 'fisheye', 'covert', 'box'
  ]);

  // Resolution
  const mpRaw = await ask('Resolution  (megapixels, e.g. 8 for 4K, 4 for QHD, 2 for 1080p) : ');
  const mp    = parseFloat(mpRaw);
  const labelMap = { 2:'1080p HD', 4:'4MP QHD', 5:'5MP', 6:'6MP', 8:'4K UHD', 12:'12MP', 16:'16MP' };
  const autoLabel = labelMap[mp] || (mp >= 8 ? '4K UHD' : `${mp}MP`);
  const label = await ask(`Resolution label (auto: ${autoLabel}) : `, autoLabel);
  cam.resolution = { megapixels: mp || 2, label };

  // Connectivity
  console.log('\nConnectivity (enter numbers separated by commas, e.g. 1,2):');
  console.log('  1) PoE (wired)');
  console.log('  2) WiFi');
  console.log('  3) Ethernet (non-PoE wired)');
  console.log('  4) Battery / wire-free');
  console.log('  5) 4G / LTE cellular');
  console.log('  6) Analog (coax HDCVI/TVI/AHD)');
  const connRaw = await ask('> ');
  const connMap  = { '1':'poe','2':'wifi','3':'ethernet','4':'battery','5':'battery','6':'ethernet' };
  const connType = { '1':'poe','2':'wifi','3':'ethernet','4':'battery','5':'4g','6':'analog' };
  const connNums = connRaw.split(',').map(s => s.trim()).filter(Boolean);
  cam.connectivity = [...new Set(connNums.map(n => connType[n]).filter(Boolean))];

  // Night vision
  const nvType = await askList('\nNight vision type :', ['ir','color','hybrid','none']);
  if (nvType !== 'none') {
    const rangeRaw = await ask('Night vision range in metres (e.g. 30) : ');
    cam.night_vision = { type: nvType, range_m: parseInt(rangeRaw) || 20 };
  } else {
    cam.night_vision = { type: 'none', range_m: 0 };
  }

  // Power
  const powerMethod = await ask('\nPower method (e.g. "PoE (802.3af) / DC 12V") : ');
  if (powerMethod) cam.power = { method: powerMethod };

  // IP rating
  const ipRating = await ask('IP rating (e.g. IP67) : ');
  if (ipRating) cam.ip_rating = ipRating;

  // IK rating
  const ikRating = await ask('IK rating (e.g. IK10) : ');
  if (ikRating) cam.ik_rating = ikRating;

  // Audio
  const hasMic  = await askYN('\nBuilt-in microphone?');
  const hasSpeaker = hasMic ? await askYN('Built-in speaker?') : false;
  const twoWay = hasMic && hasSpeaker ? await askYN('Two-way audio?') : false;
  if (hasMic || hasSpeaker || twoWay) {
    cam.audio = { microphone: hasMic, speaker: hasSpeaker, two_way: twoWay };
  }

  // Storage
  console.log('\nStorage options (enter numbers separated by commas):');
  console.log('  1) microSD / memory card slot');
  console.log('  2) NVR / DVR compatible');
  console.log('  3) Cloud storage');
  const storRaw  = await ask('> ');
  const storNums = storRaw.split(',').map(s => s.trim()).filter(Boolean);
  if (storNums.length) {
    cam.storage = {
      onboard:        storNums.includes('1'),
      nvr_compatible: storNums.includes('2'),
      cloud:          storNums.includes('3'),
    };
    if (storNums.includes('1')) {
      const sdRaw = await ask('Max microSD size in GB (e.g. 256, 512) : ');
      if (sdRaw) cam.storage.max_microsd_gb = parseInt(sdRaw);
    }
  }

  // Protocols
  console.log('\nSupported protocols (enter numbers separated by commas):');
  console.log('  1) ONVIF');
  console.log('  2) RTSP');
  console.log('  3) HTTP (proprietary app only)');
  console.log('  4) RTMP');
  const protoRaw  = await ask('> ');
  const protoMap  = { '1':'onvif','2':'rtsp','3':'http','4':'rtmp' };
  const protoNums = protoRaw.split(',').map(s => s.trim()).filter(Boolean);
  const protos    = [...new Set(protoNums.map(n => protoMap[n]).filter(Boolean))];
  if (protos.length) cam.protocols = protos;

  // Optional extras
  const releaseRaw = await ask('\nRelease year (e.g. 2023, leave blank if unknown) : ');
  if (releaseRaw) cam.release_year = parseInt(releaseRaw);

  const msrpRaw = await ask('Approx. price in USD (e.g. 79.99, leave blank if unknown) : ');
  if (msrpRaw) cam.msrp_usd = parseFloat(msrpRaw);

  console.log('\nKey features — enter one per line (e.g. "no subscription", "person/vehicle AI").');
  console.log('Press Enter on a blank line when done.');
  const features = [];
  while (true) {
    const f = await ask('  Feature: ');
    if (!f) break;
    features.push(f);
  }
  if (features.length) cam.features = features;

  const sourceRaw = await ask('\nDatasheet / product page URL (optional) : ');
  if (sourceRaw) cam.sources = [sourceRaw];

  const markets = await ask('Markets (comma-separated country codes, e.g. US,CA or DE,AT,EU — optional) : ');
  if (markets) cam.markets = markets.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

  // ── Write file ──────────────────────────────────────────────────
  const brandSlug = slugify(cam.brand);
  const dir       = path.join(CAM_DIR, brandSlug);
  const slug      = slugify(cam.model);
  const filePath  = path.join(dir, slug + '.json');

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(filePath)) {
    const overwrite = await askYN(`\n⚠  ${filePath} already exists. Overwrite?`);
    if (!overwrite) { console.log('Aborted.'); rl.close(); return; }
  }

  fs.writeFileSync(filePath, JSON.stringify(cam, null, 2) + '\n');

  console.log(`\n✓ Written: cameras/${brandSlug}/${slug}.json`);
  console.log('\nNext steps:');
  console.log('  1.  Review the file and add any fields you skipped');
  console.log('  2.  Run:  npm run build');
  console.log('  3.  Commit and open a pull request\n');

  rl.close();
}

run().catch(err => { console.error(err); process.exit(1); });
