# Plan: demo.html, local QA tool, Frigate config loop

Based on feedback in discussion #207 (fvdpol). Three tracks, in priority order.

## Guiding decision

Split the current demo.html into two things with different jobs:

1. **demo.html stays a demo.** Zero-dependency showcase of the dataset. Filterable list plus a datasheet-style detail view. Nothing more.
2. **A new local QA tool** (`tools/qa.html`) for contributors and for me. This is the thing the hosted site can't be: a fast local preview and inconsistency-spotter before data gets published.

The hosted site keeps the rich features (compare pages, config generator, SEO). No duplication between the three surfaces.

## Track 1: demo.html cleanup (small, do first)

Goal: make it a clean demo again, not a feature dump.

- Keep: search, brand/type/power filters, sort.
- Add to detail view: the streams table (main/sub, resolution, fps, codec) and a copy button for the RTSP URL and Frigate snippet. This is the one addition worth doing because it shows off the newest data.
- Remove or skip: compare, CSV export, shareable filter URLs. That belongs on cctv-database.com.
- Add one line in the header linking to the hosted site for the full experience.

Effort: one evening. No new dependencies.

## Track 2: local QA tool (the real work)

Goal: rapid local iteration for anyone editing camera JSON. Open `tools/qa.html`, point it at the local `cameras.json` (or a folder via file picker), and see problems before opening a PR.

Features, in build order:

1. **Grid view.** Pick a set of cameras (by brand, by model search, or paste a list of IDs). Render a wide table, one row per camera, one column per field. This alone makes typos and outliers visible.
2. **Null and gap highlighting.** Color cells that are absent where siblings in the same product family have data. Absent is allowed by policy (omit rather than guess), but the tool should make gaps visible so they can be checked against the datasheet.
3. **Outlier flags.** Cheap heuristics on top of the grid: PoE class af claimed with power draw above 12.95W, IR range 0 on a model with IR LEDs listed, sub-stream resolution higher than main, lux values above 1. These are exactly the retailer-data error patterns already caught by hand.
4. **Schema validation in the browser.** Bundle AJV plus ajv-formats (single vendored file, keeps the tool offline-capable) and run the repo schema against each loaded file. Show failures inline in the grid.
5. **Diff against published.** Fetch the live cameras.json from cctv-database.com (optional, only when online) and highlight what local changes would ship. Preview before publish, as fvdpol described.

Effort: features 1 and 2 in a weekend. 3 through 5 incrementally after.

## Track 3: Frigate known-good config loop

Goal: unstick the chicken-and-egg. The database ships generated configs; nobody knows which ones actually work.

- Add a `frigate.verified` field to the schema: `null` (generated, untested), or an object with `verified_by` (GitHub handle), `date`, and `frigate_version`.
- Add an issue template: "Confirm a working Frigate config". User pastes their working config, camera model, Frigate version. I diff it against the generated one, update the entry, mark it verified.
- Surface the verified badge on the hosted site and in the QA tool.
- Once there is a base of verified configs, that becomes the concrete asset for the Frigate docs PR conversation with NickM-27. "Here are N community-verified configs" is a much stronger opener than "here is a generator".

Effort: schema change plus issue template is an hour. The rest is community time.

## Explicit non-goals

- No HTTP API for now. fvdpol queries the JSON directly with Python; the flat file plus CSV already serves that persona. Revisit only if someone asks with a concrete use case.
- No auto-discovery / in-Frigate integration. Right idea, wrong owner. That is a Frigate feature that could consume this dataset, and the verified-config base (Track 3) is the prerequisite either way.
- No feature growth in demo.html beyond the streams table.

## Sequence

1. Track 1 (one evening)
2. Track 3 schema field + issue template (one hour, unblocks community input immediately)
3. Track 2 features 1–2, then iterate
4. Reply in #207 with this plan and tag fvdpol for a sanity check before building Track 2

## Open questions to settle before Track 2

- Folder access in the browser: File System Access API (Chrome only) vs. drag-and-drop of the repo folder vs. just loading the built cameras.json. Probably start with the built JSON, it is the least friction.
- Where the outlier rules live: hardcoded in qa.html or a `tools/qa-rules.json` so contributors can add checks without touching the tool.
