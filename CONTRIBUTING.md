# Contributing

There are three ways to add or fix a camera, depending on your comfort level.

---

## Option 1 — GitHub issue (easiest, no account setup needed beyond GitHub)

[Open an "Add a camera" issue](../../issues/new?template=add-camera.yml) and fill in the form. A maintainer will convert it to a pull request.

This is the right path if you:
- Don't want to clone the repo
- Just know the specs and want to submit them
- Are on a phone or tablet

---

## Option 2 — CLI wizard (recommended for regular contributors)

Clone the repo, run the wizard, and it writes the JSON file for you:

```bash
git clone https://github.com/YOUR_USERNAME/cctv-camera-database.git
cd cctv-camera-database
npm install
npm run add        # launches the interactive wizard
npm run build      # validates + regenerates data/cameras.json and data/cameras.csv
```

The wizard asks you questions in plain English — no JSON or schema knowledge needed:

```
┌─────────────────────────────────────────┐
│  CCTV Camera Database — Add a Camera    │
└─────────────────────────────────────────┘

Brand name  (e.g. Reolink, Hikvision, Dahua) : Reolink
Model name  (e.g. RLC-823A, DS-2CD2387G2-LU) : RLC-823A
ID slug     (auto: reolink-rlc-823a) :
Form factor :
  1) bullet   2) dome   3) turret   4) ptz   …
> 1
…
✓ Written: cameras/reolink/rlc-823a.json
```

Then:
```bash
git checkout -b add/reolink-rlc-823a
git add cameras/reolink/rlc-823a.json
git commit -m "Add Reolink RLC-823A"
git push origin add/reolink-rlc-823a
# Open a pull request on GitHub
```

---

## Option 3 — Edit JSON directly (for developers)

1. Create `cameras/<brand-slug>/<model-slug>.json`
2. Follow the schema below
3. Run `npm run build` to validate (schema) and `npm run lint` to check
   cross-field consistency (`npm run lint -- --fix` auto-formats the JSON)
4. Open a pull request

Both the schema build and the consistency lint run on every PR — see
[`docs/ci.md`](docs/ci.md) for the full CI overview (validation, coverage
reporting, Wayback source archiving, and the weekly/monthly link & freshness
sweeps).

> **You only commit source files** — the camera JSON under `cameras/`, and (for
> tooling changes) `schema/` and `docs/glossary.md`. Everything under `cameras/`
> is now pure source (`.json` only). **Do not commit the generated artifacts**:
> `data/cameras.json`, `data/cameras.csv`, `docs/cameras.json`, and the per-camera
> spec docs in `docs/cameras/*.md`. CI regenerates and commits those to `main` on
> merge, so if `npm run build` leaves them changed in your working tree, just
> leave them uncommitted. Pull-request CI only checks that your data **validates
> against the schema** — it no longer requires the build outputs to be committed.

### JSON structure

Only five fields are required. Everything else is optional — partial entries are welcome:

```json
{
  "id":    "reolink-rlc-823a",
  "brand": "Reolink",
  "model": "RLC-823A",
  "type":  "bullet",
  "resolution": { "megapixels": 8, "label": "4K UHD" }
}
```

A complete entry looks like this:

```json
{
  "id":            "reolink-rlc-823a",
  "brand":         "Reolink",
  "model":         "RLC-823A",
  "aliases":       ["Reolink 4K Smart Spotlight Camera"],
  "type":          "bullet",
  "connectivity":  ["poe", "wifi"],
  "release_year":  2023,
  "resolution":    { "megapixels": 8, "label": "4K UHD" },
  "sensor":        "1/2.7\" CMOS",
  "lens":          { "count": 1, "focal_length_mm": "2.8", "aperture": "F1.6", "varifocal": false },
  "field_of_view_deg": "110 horizontal",
  "night_vision":  { "type": "color", "range_m": 20 },
  "power":         { "method": "PoE (802.3af) / DC 12V" },
  "storage":       { "onboard": true, "max_microsd_gb": 512, "nvr_compatible": true, "cloud": false },
  "protocols":     ["onvif", "rtsp"],
  "ip_rating":     "IP67",
  "audio":         { "microphone": true, "speaker": true, "two_way": true },
  "features":      ["no subscription", "person/vehicle/animal/package AI", "active deterrence"],
  "msrp_usd":      79.99,
  "markets":       ["US", "CA", "AU", "EU"],
  "sources":       ["https://reolink.com/product/rlc-823a/"]
}
```

### Field reference

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `id` | ✅ | string | lowercase slug, e.g. `reolink-rlc-823a`. Must be unique. |
| `brand` | ✅ | string | Canonical brand name, e.g. `Hikvision` |
| `model` | ✅ | string | Exact model number from the manufacturer |
| `type` | ✅ | enum | `bullet` `dome` `turret` `ptz` `dual-lens` `panoramic` `fisheye` `covert` `box` |
| `resolution` | ✅ | object | `{ megapixels: 8, label: "4K UHD" }` |
| `aliases` | — | string[] | Alternate model names, marketing names, regional SKUs |
| `connectivity` | — | enum[] | `poe` `wifi` `ethernet` `battery` `4g` `analog` |
| `release_year` | — | integer | Year first sold |
| `sensor` | — | string | e.g. `1/2.7" CMOS` |
| `lens.focal_length_mm` | — | string | e.g. `2.8` or `2.7-13.5 (5x motorized varifocal)` |
| `lens.aperture` | — | string | e.g. `F1.6` |
| `lens.varifocal` | — | boolean | |
| `field_of_view_deg` | — | string | e.g. `110 horizontal` |
| `night_vision.type` | — | enum | `ir` `color` `hybrid` `none` |
| `night_vision.range_m` | — | integer | Manufacturer-stated range in metres |
| `night_vision.min_lux` |  — |  number | minimum illumination for usable image (B&W or unspecified) |
| `night_vision.min_lux_color` | — | number |  minimum illumination for usable color image |
| `power.method` | — | string | e.g. `PoE (802.3af) / DC 12V` |
| `storage.onboard` | — | boolean | Has a microSD slot |
| `storage.max_microsd_gb` | — | integer | |
| `storage.nvr_compatible` | — | boolean | Works with third-party NVRs |
| `storage.cloud` | — | boolean | Has cloud storage option |
| `protocols` | — | enum[] | `onvif` `rtsp` `rtmp` `http` `p2p` |
| `ip_rating` | — | string | e.g. `IP67`, `IP66` |
| `ik_rating` | — | enum[] | `IK00` `IK01` `IK02` `IK03` `IK04` `IK05` `IK06` `IK07` `IK08` `IK09` `IK10` `IK11` |
| `audio.microphone` | — | boolean | |
| `audio.speaker` | — | boolean | |
| `audio.two_way` | — | boolean | |
| `features` | — | string[] | Free-text list of notable features |
| `msrp_usd` | — | number | Approximate price in USD |
| `msrp_eur` | — | number | Approximate price in EUR |
| `msrp_gbp` | — | number | Approximate price in GBP |
| `msrp_aud` | — | number | Approximate price in AUD |
| `msrp_inr` | — | number | Approximate price in INR |
| `msrp_aed` | — | number | Approximate price in AED |
| `msrp_cad` | — | number | Approximate price in CAD |
| `markets` | — | string[] | ISO country codes + region tags: `US` `UK` `EU` `DE` `FR` `IN` `AU` `AE` `SA` `MENA` `LATAM` etc. |
| `sources` | — | string[] | Datasheet / retailer URLs — please include at least one |

### ID conventions

- Always lowercase
- Hyphens only — no underscores, dots, or spaces
- Format: `<brand-slug>-<model-slug>`
- Regional variants: append `-<region>`, e.g. `hikvision-ds-2cd2387g2-lu-uk`
- Generation variants: append `-v2`, `-gen2`, `-s2`, etc.

### Naming the file

```
cameras/<brand-slug>/<model-slug>.json
```

The brand slug and model slug should match the `id` after removing the brand prefix:

```
cameras/reolink/rlc-823a.json   →   id: "reolink-rlc-823a"
cameras/hikvision/ds-2cd2387g2-lu.json   →   id: "hikvision-ds-2cd2387g2-lu"
```

---

## What makes a good entry

- **Source it.** Always include at least one URL in `sources` — official datasheet preferred, reputable retailer accepted
- **Don't guess specs.** If you're unsure, leave the field out — a partial entry is better than a wrong one
- **One file per variant.** Regional editions (different firmware, power supply, certifications) should be separate entries with a market suffix in the ID
- **No marketing copy in `features`.** Keep features factual and terse: `"no subscription"` not `"experience true security freedom with zero monthly fees"`
- **Auto-tracking → set `ptz.autotracking`.** If a `ptz` / `dual-lens` / `panoramic` camera does onboard auto-tracking (it physically moves to follow a subject), set `"ptz": { "autotracking": true }` — the build **fails** if such a camera mentions auto-tracking only in `features`. If the tracking is *digital*/e-PTZ (software crop, no motor), don't set the flag; describe it as digital in `features` instead.

---

## Contributing camera configs (Frigate, Home Assistant, Blue Iris)

Know how to set up a camera in Frigate, Home Assistant, or Blue Iris? Share your working config so others don't have to figure it out.

### Option A — GitHub issue (easiest)

[Open a "Add a config" issue](../../issues/new?template=add-config.yml) and paste your config. A maintainer will add it.

### Option B — Pull request

1. Create a YAML file in `configs/<platform>/<camera-id>.yml`  
   e.g. `configs/frigate/reolink-rlc-823a.yml`
2. Replace credentials with `{user}`, `{pass}`, `{ip}`
3. Add key details to the camera's JSON under the `configs` field:

```json
"configs": {
  "frigate": {
    "detect": { "width": 640, "height": 480, "fps": 5 },
    "rtsp_url_template": "rtsp://{user}:{pass}@{ip}:554/h264Preview_01_main",
    "best_substream": "rtsp://{user}:{pass}@{ip}:554/h264Preview_01_sub",
    "notes": "Set sub-stream to 640x480 for best Frigate performance."
  }
}
```

See [`configs/README.md`](configs/README.md) for templates and full details.

---

## Corrections

Found a mistake? [Open a correction issue](../../issues/new?template=correction.yml) — no need to fork anything.

Or fix it directly: edit the JSON file, run `npm run build`, and open a pull request.
