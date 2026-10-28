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

A fuller entry looks like this:

```json
{
  "id":            "reolink-rlc-823a",
  "brand":         "Reolink",
  "model":         "RLC-823A",
  "aliases":       ["Reolink 4K Smart Spotlight Camera"],
  "type":          "bullet",
  "connectivity":  ["ethernet"],
  "power_source":  ["poe", "dc"],
  "release_year":  2023,
  "resolution":    { "megapixels": 8, "max_width": 3840, "max_height": 2160, "label": "4K UHD" },
  "video":         { "codecs": ["H.265", "H.264"], "max_fps": 25 },
  "sensor":        "1/2.7\" CMOS",
  "lens":          { "count": 1, "focal_length_mm": "2.8", "aperture": "F1.6", "varifocal": false },
  "field_of_view_deg": "110",
  "night_vision":  { "type": "color", "range_m": 20 },
  "power":         { "method": "PoE (802.3af) / DC 12V" },
  "storage":       { "onboard": true, "max_microsd_gb": 512, "nvr_compatible": true, "cloud": false },
  "protocols":     ["onvif", "rtsp"],
  "ip_rating":     "IP67",
  "audio":         { "microphone": true, "speaker": true, "two_way": true },
  "environment":   ["outdoor"],
  "features":      ["no subscription", "person/vehicle/animal/package AI", "active deterrence"],
  "markets":       ["US", "CA", "AU", "EU"],
  "sources":       ["https://reolink.com/product/rlc-823a/"],
  "last_verified": "2026-10-26"
}
```

(Illustrative only: take every value from the camera's own datasheet.)

### Field reference

The authoritative definition is [`schema/camera.schema.json`](schema/camera.schema.json); unknown fields are rejected. The most used fields:

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `id` | ✅ | string | lowercase slug, e.g. `reolink-rlc-823a`. Must be unique. |
| `brand` | ✅ | string | Canonical brand name, e.g. `Hikvision` |
| `model` | ✅ | string | Exact model number from the manufacturer |
| `type` | ✅ | enum | `bullet` `dome` `turret` `ptz` `dual-lens` `fisheye` `covert` `box` `panoramic` `floodlight` `doorbell` |
| `resolution` | ✅ | object | `{ megapixels, max_width, max_height, label }`, e.g. `{ "megapixels": 8, "label": "4K UHD" }` |
| `aliases` | — | string[] | Other order numbers for the same camera (lens size, colour, regional or option suffixes) and marketing names |
| `connectivity` | — | enum[] | How the camera sends data: `ethernet` `wifi` `4g` `5g` `coax`. Power over Ethernet goes in `power_source`, not here. |
| `power_source` | — | enum[] | `poe` `dc` `usb` `battery` `solar` `ac-mains` (use `ac-mains` for 24 VAC) |
| `video.codecs` | — | enum[] | `H.264` `H.264+` `H.265` `H.265+` `MJPEG` `JPEG` `AV1` `Ultra265` `MPEG-4` |
| `video.max_fps` | — | integer | Max frame rate at the highest resolution |
| `video.streams` | — | object[] | `{ name: main\|sub\|third, resolution: "WxH", fps, codec }` as listed in the datasheet |
| `release_year` | — | integer | Year first sold |
| `sensor` | — | string | e.g. `1/2.7" CMOS` |
| `lens.count` | — | integer | Number of lenses |
| `lens.focal_length_mm` | — | string | e.g. `2.8` or `2.7-13.5` |
| `lens.aperture` | — | string | e.g. `F1.6` |
| `lens.varifocal` | — | boolean | |
| `field_of_view_deg` | — | string | Horizontal FOV without the `°` sign, e.g. `110` or `102-31` |
| `night_vision.type` | — | enum | `ir` `color` `hybrid` `none` |
| `night_vision.range_m` | — | integer | Manufacturer-stated range in metres (the maximum of a range) |
| `night_vision.min_lux` | — | number | Black-and-white minimum illumination, **only if the datasheet labels it B/W**. Never record "0 lux with IR". |
| `night_vision.min_lux_color` | — | number | Colour minimum illumination, only if labelled colour |
| `ptz.autotracking` | — | boolean | Camera-side (motorised) subject tracking |
| `ptz.onvif_ptz` | — | enum | `relative` `absolute` `continuous` `none` (only if stated) |
| `power.method` | — | string | e.g. `PoE (802.3af) / DC 12V` |
| `power.consumption_w` | — | number | Maximum power draw in watts |
| `power.poe_class` | — | integer | `0`–`8`, only if the class is stated |
| `storage.onboard` | — | boolean | Has a microSD slot |
| `storage.max_microsd_gb` | — | integer | |
| `storage.nvr_compatible` | — | boolean | Works with third-party NVRs |
| `storage.cloud` | — | boolean | Has a cloud storage option |
| `protocols` | — | enum[] | `onvif` `rtsp` `rtmp` `http` `p2p` `hdcvi` `mxpeg` |
| `ip_rating` | — | string | e.g. `IP67`, `IP66` |
| `ik_rating` | — | enum | `IK00` … `IK11` |
| `audio.microphone` / `audio.speaker` / `audio.two_way` | — | boolean | |
| `environment` | — | enum[] | `indoor` `outdoor` (a weatherproof IP rating means `outdoor`) |
| `operating_temp_c` | — | string | e.g. `-30 to 60` |
| `dimensions_mm` | — | string | as stated, e.g. `167.5 x 74.5 x 74.5` |
| `weight_g` | — | number | Net weight in grams |
| `network.ethernet_speed_mbps` | — | enum | `10` `100` `1000` `2500` `10000` |
| `ndaa_compliant` | — | boolean | Only with an official basis (maker statement, compliance list, or Section 889-named brand); otherwise omit |
| `cloud_dependency` | — | enum | `local` `cloud-optional` `cloud-required` |
| `status` | — | enum | `available` `announced` `discontinued` |
| `generation` | — | string | Product line, e.g. `Wisenet X` |
| `soc` | — | string | System-on-chip, only if officially stated |
| `features` | — | string[] | Short factual list of notable features |
| `markets` | — | string[] | Country codes and region tags: `US` `UK` `EU` `DE` `FR` `IN` `AU` `AE` `SA` `MENA` `LATAM` `global` etc. |
| `sources` | — | string[] | Official datasheet / product page URLs (at least one) |
| `last_verified` | — | string | `YYYY-MM-DD` date the record was last checked against its sources |
| `release_notes` | — | string | Short note on the source and any caveats |
| `configs` | — | object | Frigate / Home Assistant / Blue Iris settings (see below) |

### ID conventions

- Always lowercase
- Hyphens only — no underscores, dots, or spaces
- Format: `<brand-slug>-<model-slug>`
- Regional variants with different hardware: append `-<region>`, e.g. `hikvision-ds-2cd2387g2-lu-uk` (packaging-only variants are aliases, not new IDs)
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

- **Source it officially.** Always include at least one URL in `sources` pointing at the manufacturer's datasheet, manual or product page. Retailer listings can corroborate a value but are never the only source
- **Don't guess specs.** If you're unsure, leave the field out — a partial entry is better than a wrong one
- **One record per camera, variants as aliases.** Order numbers that differ only in lens size, housing colour, PAL/NTSC, mount or a regional/option suffix go in `aliases` of one record. Use a separate record (with a suffix in the ID) only when the hardware differs: different sensor, resolution, lens type, housing, power or certification
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

## Community notes (quirks and behaviors)

Datasheets tell you what a camera claims to do. They don't tell you that the substream drops to 5fps when WDR is on, or that ONVIF events stop working after a specific firmware. That knowledge is spread across forum threads and gets lost.

Each camera can carry a `community_notes` array for exactly this. These are **observed behaviors, not specs**, and they are **not verified by the project** — the source link and reporter name carry the accountability.

### What belongs here
- RTSP/ONVIF oddities (wrong default path, substream limits, auth quirks)
- Firmware-specific regressions or fixes
- Integration gotchas for Frigate / Home Assistant / Blue Iris
- Power/PoE behavior under load, hardware revisions with different behavior

### What does NOT belong here
- Spec corrections. If the database says 20m IR and the datasheet says 30m, that's a correction — use the spec fields and link the datasheet.
- Opinions ("image quality is bad"), purchasing advice, or comparisons.
- Anything without a source.

### How to add one
**Easiest:** open a [quirk report issue](https://github.com/ch-bas/cctv-camera-database/issues/new?template=camera-quirk.yml) and we'll file it.

**PR:** add to the camera's JSON:

```json
"community_notes": [
  {
    "note": "Substream drops to 5fps when WDR is enabled, regardless of the fps set in the UI.",
    "category": "rtsp",
    "firmware": "V5.7.3 build 230801",
    "source": "https://github.com/blakeblackshear/frigate/discussions/12345",
    "reported_by": "yourhandle",
    "date": "2026-08-22"
  }
]
```

Or run `npm run add-note -- --id hikvision-ds-2cd2387g2-lu`.

`source` is a URL, or the literal word `empirical` if you observed it on your own device. Contradicting notes are fine — different firmware, different behavior. We don't delete old notes; `firmware` and `date` let readers judge.

---

## Corrections

Found a mistake? [Open a correction issue](../../issues/new?template=correction.yml) — no need to fork anything.

Or fix it directly: edit the JSON file, run `npm run build`, and open a pull request.
