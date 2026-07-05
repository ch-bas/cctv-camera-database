# CCTV Camera Database

An open, structured database of 1,724 CCTV / IP camera models and their technical specifications, covering 69 brands across every market segment — from budget consumer WiFi cameras to enterprise PTZ domes and thermal imaging systems. Each camera is a validated JSON file, aggregated into a single queryable dataset (JSON + CSV).

[![cameras](https://img.shields.io/badge/cameras-1%2C724-blue)](data/cameras.json)
[![brands](https://img.shields.io/badge/brands-69-green)](cameras/)
[![license](https://img.shields.io/badge/license-CC0-lightgrey)](LICENSE)

---

## Why this exists

Camera spec sheets are scattered across vendor PDFs, retailer pages, and paywalled databases (IPVM, etc.) in inconsistent formats. This repo normalises them into one machine-readable structure so they can be compared, filtered, and reused.

**The dataset is CC0 and always will be** — free to use, copy, and redistribute with no restrictions. The website is just a convenient viewer; the data here is the source of truth.

---

## Browse online

**[Browse the database → cctv-database.com](https://cctv-database.com)**  

Prefer to self-host or browse offline? A [standalone demo](docs/demo.html) (just `demo.html` + `cameras.json`, no build step) is included — serve the `docs/` folder locally with any static server, e.g. `python3 -m http.server` inside `docs/`, then open it.  

<p align="center">
  <img src="docs/demo.gif" alt="CCTV Camera Database — browse, search, filter, and inspect 1,296 cameras across 64 brands" width="800" />
</p>

**What you see above:**
- **Search** — instant full-text search across brand, model, and features
- **Filter** — narrow by brand, camera type, night vision, resolution, or market
- **Sort** — click any column header to sort ascending/descending
- **Detail drawer** — click a row to slide open the full spec sheet (resolution, connectivity, protocols, storage, audio, pricing, source links)
- **Pagination** — page through all 1,724 cameras, 25 per page
- **Stats bar** — live counts for total cameras, brands, 4K+, WiFi, and no-subscription models

---

## How this was built

The database was assembled with the help of [Claude Code](https://claude.ai/code).

Specs are sourced from manufacturer datasheets and reputable retailer listings —
each entry includes a `sources` array with URLs. As with any compiled dataset,
errors are possible; always verify against the official datasheet before purchasing
or deploying.

The demo video was produced with [hve-spielberg](https://github.com/nebrass/hve-spielberg),
a Claude Code skill for AI-powered video production built on [Remotion](https://remotion.dev).

---

## Repository layout

```
cctv-camera-database/
├── cameras/              # source of truth — one JSON file per camera, grouped by brand
│   ├── hikvision/        # 158 cameras
│   ├── reolink/          # 116 cameras
│   ├── dahua/            # 155 cameras
│   ├── hanwha/           #  45 cameras
│   ├── axis/             #  66 cameras
│   ├── tapo/             #  62 cameras
│   └── …60 more brands
├── data/                 # GENERATED — do not edit by hand
│   ├── cameras.json      # all 1,724 cameras as one array
│   └── cameras.csv       # flattened, spreadsheet-friendly
├── schema/
│   └── camera.schema.json
├── scripts/
│   └── build.js          # aggregates + validates cameras/ → data/
├── docs/
│   └── glossary.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## Quick start

```bash
npm install   # installs Ajv for schema validation (no runtime deps)
npm run build # validates all JSON, writes data/cameras.json + data/cameras.csv
```

### Querying the data

```js
const cameras = require('./data/cameras.json');

// All 4K PoE outdoor cameras
const poe4k = cameras.filter(c =>
  c.connectivity?.includes('poe') &&
  c.resolution.megapixels >= 8
);

// All cameras with color night vision
const colorNight = cameras.filter(c =>
  c.night_vision?.type === 'color'
);

// All cameras for the UK market
const uk = cameras.filter(c =>
  c.markets?.includes('UK')
);

// All cameras with no subscription fee
const noSub = cameras.filter(c =>
  c.features?.some(f => f.toLowerCase().includes('no subscription'))
);
```

Or open `data/cameras.csv` in any spreadsheet for a quick browse.

---

## Coverage

### By the numbers

| Metric | Count |
|--------|-------|
| Total cameras | **1,724** |
| Brands | **69** |
| Form factors | 11 (bullet, dome, turret, PTZ, dual-lens, panoramic, covert, box, fisheye, floodlight, doorbell) |
| PoE wired | 1,169 |
| WiFi | 470 |
| Battery / wire-free | 176 |
| 4K / 8MP+ | 478 |
| 4–5MP | 709 |
| 1080p–2MP | 495 |
| With integration configs (Frigate / Home Assistant) | 1,317 |

### All 69 brands

| Brand | Cameras | Segment |
|-------|---------|---------|
| Hikvision | 158 | Enterprise + consumer, global |
| Reolink | 122 | Prosumer, no-subscription, global |
| Dahua | 134 | Enterprise + consumer, global |
| Hanwha | 45 | Enterprise AI, Korea/global |
| Axis | 61 | Enterprise premium, global |
| Tapo (TP-Link) | 47 | Consumer budget, global |
| Eufy (Anker) | 46 | Consumer no-subscription, global |
| Arlo | 25 | Consumer premium wire-free, global |
| Ring (Amazon) | 21 | Consumer ecosystem, global |
| Avigilon | 18 | Enterprise NDAA, global |
| Amcrest | 16 | Prosumer, global |
| VIGI (TP-Link) | 25 | Business/SMB PoE, global |
| Ubiquiti UniFi | 26 | Prosumer/SMB, US/global |
| Annke | 13 | Prosumer, global |
| Google Nest | 19 | Consumer smart home, global |
| Bosch | 160 | Enterprise + thermal, EU/global |
| EZVIZ (Hikvision) | 87 | Consumer, global |
| Lorex | 40 | Consumer NVR systems, CA/US |
| HiLook (Hikvision) | 20 | Budget installer, EU/UK/AU |
| Lupus Electronics | 20 | Privacy-first, DE/AT/CH |
| Tiandy | 20 | Enterprise + prosumer, CN/ME/Africa |
| Uniview | 15 | Enterprise NDAA, global |
| Blink (Amazon) | 16 | Budget battery, US/UK/EU |
| Swann | 16 | Consumer, AU/US/UK |
| ABUS | 76 | Consumer + professional, GDPR-first, DE/AT/CH |
| CP Plus | 14 | India #2 brand, IN |
| GeoVision | 15 | Enterprise, TW/Asia/global |
| IMOU (Dahua) | 15 | Consumer, global |
| Milesight | 15 | Prosumer/Enterprise IoT, global |
| Pelco | 15 | Enterprise legacy, NA/global |
| Vivotek | 15 | Enterprise AI, global |
| Wyze | 15 | Budget consumer, US |
| ACTi | 119 | Enterprise IP + analog, NDAA, TW/global |
| FLIR (Teledyne) | 12 | Thermal imaging, NA/EU |
| Kedacom | 54 | Enterprise, CN/global |
| Sunell | 12 | Prosumer/Enterprise, CN/global |
| SV3C | 13 | Budget consumer, CN/US |
| Synology | 12 | NAS-native cameras, global |
| TVT Digital | 12 | Prosumer budget, CN/IN/SE Asia |
| Hi-Focus | 10 | Made-in-India, BIS certified, IN |
| Mobotix | 9 | Enterprise GDPR-first, EU |
| Costar | 8 | Enterprise (Arecont successor), US |
| Intelbras | 8 | #1 Latin America, BR/AR/LATAM |
| Luma (Snap One) | 8 | Custom integrator, NA |
| Yale | 8 | Consumer smart home, UK/EU |
| Camius | 6 | Consumer direct, US |
| Cathexis | 6 | Enterprise VMS, ZA/ME |
| LaView | 6 | Consumer WiFi/solar/4G, US |
| March Networks | 6 | Enterprise retail/banking, NA |
| Netatmo | 6 | Privacy-first no-subscription, EU |
| Secureye | 6 | Budget consumer, IN |
| ADT | 4 | Monitored security, US |
| Hive (British Gas) | 5 | Consumer smart home, UK |
| KBvision | 5 | Budget installer, VN |
| Somfy | 3 | Smart home, FR/EU |
| Godrej | 4 | Consumer, IN |
| Honeywell | 4 | Enterprise, US/IN |
| Qubo (Hero) | 4 | Consumer IoT, IN |
| SimpliSafe | 4 | DIY monitored security, US |
| Zebronics | 4 | Budget consumer, IN |
| Aqara | 3 | Smart home HomeKit, EU/global |
| i-PRO (Panasonic) | 3 | Enterprise #1 Japan, JP/global |
| IDIS | 3 | Enterprise DirectIP, KR/global |
| Steinel | 3 | Outdoor smart light/cam, DE/AT/CH |
| Verkada | 3 | Cloud-managed enterprise, US/CA |
| Ajax | 2 | Professional alarm, EU/UK |
| Bosch Smart Home | 2 | Consumer smart home, DE/AT/CH |
| Canon | 2 | Enterprise optical, JP/global |
| Kasa (TP-Link) | 1 | Consumer wired, US |

### Market coverage

Cameras are tagged with `markets[]` where relevant:

| Market | Tagged cameras | Key brands |
|--------|---------------|-----------|
| EU | 88 | ABUS, Netatmo, Aqara, Somfy, Axis |
| DE | 58 | ABUS, Lupus, Steinel, Bosch Smart Home |
| AT / CH | 40 each | ABUS, Lupus, Aqara, Netatmo |
| UK | 39 | Yale, Hive, Ajax, Ring, HiLook |
| global | 37 | Hikvision, Axis, Hanwha, i-PRO |
| IN | 32 | CP Plus, Qubo, Godrej, Zebronics |
| US | 28 | Wyze, Blink, Verkada, SimpliSafe, ADT |
| FR | 25 | Somfy, Netatmo, EZVIZ |
| AE / SA / MENA | 22 each | Hikvision, Dahua, Tapo, EZVIZ |
| VN | 9 | KBvision, Hikvision, Dahua, EZVIZ |
| JP | 6 | i-PRO, Canon, Tapo |
| KR | 5 | Hanwha, IDIS |
| AU | 13 | Swann, Reolink, Ring, Arlo, Eufy |
| CA | 13 | Lorex, Avigilon, Ring, Reolink |
| AR / BR / CL / LATAM | 10 each | Intelbras, Hikvision, Dahua, EZVIZ |

---

## Schema

Each camera JSON follows `schema/camera.schema.json`. Required fields:

```json
{
  "id": "reolink-rlc-823a",
  "brand": "Reolink",
  "model": "RLC-823A",
  "type": "bullet",
  "resolution": { "megapixels": 8, "label": "4K UHD" }
}
```

Common optional fields:

| Field | Type | Example |
|-------|------|---------|
| `connectivity` | `string[]` | `["poe", "wifi", "ethernet"]` |
| `night_vision.type` | `string` | `"color"` / `"ir"` / `"none"` |
| `night_vision.range_m` | `number` | `30` |
| `power.method` | `string` | `"PoE (802.3af) / DC 12V"` |
| `ip_rating` | `string` | `"IP67"` |
| `audio.two_way` | `boolean` | `true` |
| `protocols` | `string[]` | `["onvif", "rtsp"]` |
| `markets` | `string[]` | `["UK", "EU", "DE"]` |
| `features` | `string[]` | `["no subscription", "IP67"]` |
| `sources` | `string[]` | datasheet / retailer URLs |

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full field reference and naming conventions.

---

## Contributing

**Three paths — pick the one that fits you:**

| | Path | Best for |
|-|------|---------|
| 🌐 | [Open a GitHub issue](../../issues/new?template=add-camera.yml) | Anyone — fill a web form, no cloning needed |
| 🧙 | `npm run add` — interactive CLI wizard | Regular contributors — guided questions, writes JSON for you |
| 🛠 | Edit JSON directly | Developers — see [CONTRIBUTING.md](CONTRIBUTING.md) |

The wizard flow:
```bash
git clone https://github.com/YOUR_USERNAME/cctv-camera-database.git
cd cctv-camera-database && npm install
npm run add      # asks questions, writes the JSON file
npm run build    # validates everything
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full field reference, naming conventions, and what makes a good entry.

---

## Roadmap

- [x] JSON Schema validation in CI (GitHub Actions)
- [ ] Static web frontend — search, filter, compare
- [ ] Side-by-side comparison view (2–4 cameras)
- [ ] Frigate-compatible config export
- [ ] Home Assistant integration template
- [ ] API endpoint (read-only, hosted)

---

## Community

| | |
|-|--|
| 🐛 Report a data error | [Open a correction issue](../../issues/new?template=correction.yml) |
| ➕ Add a missing camera | [Open a camera submission](../../issues/new?template=add-camera.yml) |
| 🔒 Report a security issue | [GitHub Security Advisories](../../security/advisories/new) |
| 💬 Code of conduct | [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) |
| 📋 Changelog | [CHANGELOG.md](CHANGELOG.md) |

## Disclaimer

Specifications are compiled from manufacturer datasheets and reputable retailers and may contain errors or become outdated. Always confirm against the official datasheet (linked in each entry's `sources` array) before purchasing. Not affiliated with any manufacturer.

## License

Data is released under [CC0 1.0](LICENSE) (public domain). Trademarks and model names belong to their respective owners.
