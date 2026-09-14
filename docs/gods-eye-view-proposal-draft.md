# DRAFT — proposal for bilawalsidhu/gods-eye-view (Discussion or Issue)

> Status: **draft, not posted.** Target: GitHub Discussions (Ideas) on
> `bilawalsidhu/gods-eye-view`, or an issue if Discussions are off.
> Author: Bassem (ch-bas). Delete this header block before posting.

---

**Title:** Real FOV cones + spec cards for the public-cameras layer — free CC0 camera-model dataset (12k models)

Hi Bilawal — huge fan of what this project became. I maintain the
[CCTV Camera Database](https://github.com/ch-bas/cctv-camera-database):
an open, CC0 dataset of **12,343 IP/CCTV camera models across 158 brands**
— every spec transcribed from manufacturer datasheets, never guessed
([cctv-database.com](https://cctv-database.com)). I think it can make your
public-cameras layer noticeably better, and I'd like to contribute the
integration.

## The hook: your README already names the gap

> *"CCTV camera poses and rocket launch trajectories are coarse estimates."*

Two things our data can do about that:

### 1. Real view cones instead of estimated ones
We carry `field_of_view_deg` for **10,395 models** (84%), plus PTZ
pan/tilt/zoom capability flags. When a public feed's make/model is known —
and many DOT/municipal cams expose it in metadata, stream headers, or the
feed catalog itself — the camera's frustum on the globe stops being a guess:
render the datasheet's actual horizontal FOV, and mark PTZ units as sweepable
rather than fixed. It's the kind of visible-fidelity upgrade that shows up in
a screenshot.

### 2. Spec cards on camera popups
Click a camera → if the model matches our index: resolution, form factor,
night-vision type/range, indoor/outdoor rating — with a link to the full spec
sheet. Gives the layer depth beyond "here is a feed".

## What I'm offering

A purpose-built extract, already generated:
**`model-enrichment.json`** — ~4 MB compact JSON, one record per model:

```json
{
  "id": "axis-f4105-lre",
  "brand": "Axis",
  "model": "F4105-LRE",
  "type": "dome",
  "url": "https://www.cctv-database.com/camera/axis-f4105-lre/",
  "fov_deg": "110 horizontal, 60 vertical",
  "resolution": { "mp": 2, "w": 1920, "h": 1080, "label": "1080p HD" },
  "night_vision": { "type": "ir", "range_m": 10 },
  "environment": ["outdoor"],
  "ndaa_compliant": true
}
```

- **CC0** — vendor it, ship it in the repo, no attribution required (a link
  back is appreciated). No runtime dependency on our infrastructure: pin a
  tagged version via jsDelivr or commit the file, refresh whenever.
- Join on `model` / `aliases` (case-insensitive), `brand` to disambiguate —
  a `join_hint` in `_meta` documents it.
- Versioned releases with checksums; the dataset updates near-daily and every
  value is traceable to a `sources[]` URL in the parent record.

## Scope guardrail (deliberate)

The extract contains **no locations, no endpoints, no stream URLs, no
config/access data** — it describes camera *products*, not installations,
and it can only annotate feeds your project already surfaces from public
catalogs. Identification and specs, nothing that expands access. That's a
line both our projects already draw, and the integration keeps it.

## What I'd do

Happy to send the PR myself: a small enrichment module in the public-cameras
layer (model-string match → FOV/spec lookup → cone params + popup card), with
the dataset vendored or pinned. Or if you'd rather keep it lean, I'll just
maintain the extract at a stable URL and you consume it however you like.

Either way — the data is CC0 and it's yours to use regardless of what you
decide. Thanks for open-sourcing this thing.

---

> **Post-notes (not part of the post):**
> - Extract lives at `data/model-enrichment.json`, regenerate with
>   `node scripts/gen-model-enrichment.js` (commit both before pointing
>   anyone at a jsDelivr URL).
> - jsDelivr URL shape once committed + tagged:
>   `https://cdn.jsdelivr.net/gh/ch-bas/cctv-camera-database@v2.19.0/data/model-enrichment.json`
> - The sample record is the real `axis-f4105-lre` entry, verbatim from the
>   generated extract (v2.19.0).
