# StrixCamDB → verify → publish: ingest mechanism (design sketch)

How the reciprocal pull works on my (cctv-database.com) side. The whole point:
**Strix is a lead source, never a data source.** Nothing from StrixCamDB is copied into the
CC0 repo. Automation handles fetch → diff → filter → queue; the verification gate (agent fleet
or human) confirms each survivor against the manufacturer's own docs; only then does it publish,
as a PR a human merges. Main stays protected exactly as it is today.

## Invariants (the things that must never break)
1. **No raw copy.** A StrixCamDB URL never lands in `cameras/**` or the RTSP layer verbatim. It's
   a *candidate* until an official doc confirms it.
2. **Provenance ledger.** Every published value records both `source` (the official doc it was
   verified against) and `strix_lead` (the discovery origin) — that's what keeps it CC0-clean
   while crediting Strix.
3. **Human-merged.** The pipeline opens a PR onto `main`; it never auto-merges. Same
   release-branch workflow as everything else.
4. **Delta-only.** His DB is ~3,626 brands / 17,081 streams — never re-verify wholesale. Snapshot
   and diff; process only what changed since the last run.

## Data flow

```
                        (weekly GitHub Action, dataset repo)
  ┌─ 0. FETCH ─────────────────────────────────────────────────────────┐
  │  clone/download StrixCamDB → cameras.db                             │
  └────────────────────────────────────────────────────────────────────┘
                         │
  ┌─ 1. SNAPSHOT + DIFF ───────────────────────────────────────────────┐
  │  hash streams(brand_id,url,protocol,port) vs strix/.snapshot.json   │
  │  → leads-new.json (added/changed only)                             │
  └────────────────────────────────────────────────────────────────────┘
                         │
  ┌─ 2. PRE-FILTER (deterministic junk drop) ──────────────────────────┐
  │  reject bare/numeric paths, user go2rtc names, cross-brand misfiles,│
  │  scan-lineage .sdp smells; cluster by brand                        │
  │  → verify-queue.json  (candidate brand templates + candidate models)│
  └────────────────────────────────────────────────────────────────────┘
                         │
  ┌─ 3. TRIAGE ────────────────────────────────────────────────────────┐
  │  split into: (a) brands/models I ALREADY have  → template cross-check│
  │              (b) brands/models I DON'T have     → new-coverage leads │
  │  open/update a tracking issue with the queue                        │
  └────────────────────────────────────────────────────────────────────┘
                         │   ← automation ends here; verification begins
  ┌─ 4. VERIFY (agent fleet, reuses this week's build-spec) ────────────┐
  │  one agent per candidate: confirm the RTSP path AND/OR the model    │
  │  specs against the manufacturer's official doc. Verified-only.      │
  │  unconfirmable → 'unverified_leads', never published as fact.       │
  └────────────────────────────────────────────────────────────────────┘
                         │
  ┌─ 5. PUBLISH (two targets) ─────────────────────────────────────────┐
  │  (a) brand-level RTSP templates → data/rtsp-patterns.json (NEW      │
  │      CC0 layer, per-value source + strix_lead)                     │
  │  (b) new verified models        → cameras/<brand>/<model>.json      │
  │      via existing add flow; configs.frigate template drawn from (a) │
  └────────────────────────────────────────────────────────────────────┘
                         │
  ┌─ 6. GATE + PR ─────────────────────────────────────────────────────┐
  │  npm run build (AJV) + npm run lint (canonical E5) must pass        │
  │  → PR onto main, labeled 'strix-ingest', human merges              │
  └────────────────────────────────────────────────────────────────────┘
```

## Where each piece lives (slots into existing conventions)
- `scripts/strix-fetch.mjs` — stage 0–1: pull DB, diff vs snapshot, emit `strix/leads-new.json`.
- `scripts/strix-filter.mjs` — stage 2–3: junk pre-filter + brand clustering + triage → `strix/verify-queue.json`; open/update the tracking issue.
- **Verification** — stage 4: the same fan-out-one-agent-per-candidate pattern used for the v1.61.0 batch, driven by the existing build-spec (verified-data-only, schema cheat-sheet, canonical-JSON rule).
- `data/rtsp-patterns.json` — **new** CC0 output layer (the artifact Strix pulls back). Same shape as `strix-pilot-sample.json`.
- Existing `scripts/build.js` + `lint-data.js` + `schema/camera.schema.json` — unchanged; they validate whatever the ingest produces.
- `.github/workflows/strix-ingest.yml` — schedule (weekly) + manual dispatch; runs 0–3 and opens the tracking issue. (Sits alongside `build.yml`, `check-sources.yml`, etc.)

## Stage-2 pre-filter rules (encodes the pilot's learnings)
Drop a lead before it ever reaches verification when it is:
- a **bare / numeric path** with no brand-documented meaning (`/11`, `/1`) unless the brand's scheme is numeric (Grandstream `/0`+`/4` — brand-aware allowlist);
- a **user-custom go2rtc name** (`/Salon/mainstream`, friendly-name paths);
- a **cross-brand misfile** (a Dahua `realmonitor` path filed under Reolink; a "Panasonic" doc serving Dahua paths);
- a **scan-lineage `.sdp` smell** — e.g. D-Link `/play*.sdp`: present in iSpy-class DBs, in no official manual → never auto-trusted (must be re-confirmed or dropped);
- an **obvious typo** (`_sup` for `_sub`).
Everything surviving is a *candidate*, not a fact.

## The verification gate (stage 4)
This is the irreducible human/agent step and the reason the output is trustworthy:
- **Have the brand already** → cross-check the candidate template against the manufacturer's RTSP doc. Match → confirm (bump provenance). Mismatch → drop or flag.
- **New brand/model** → source the official datasheet, build the full camera JSON (verified-only,
  every documented lane), draw its RTSP template from the confirmed brand layer.
- **Can't confirm officially** → record under `unverified_leads` (like AVTECH), never published as spec.
The agent fleet automates the *labor* of this; the *rule* (official doc or it doesn't ship) is fixed.

## Output: `data/rtsp-patterns.json` (what Strix pulls back)
Brand-keyed, each template carrying `source` (official doc) **and** `strix_lead` (discovery credit):
```json
{ "brand": "D-Link", "templates": [
  { "stream": "main", "path": "/live1.sdp", "verified": true,
    "source": "D-Link DCS-4701E v2.10 manual", "strix_lead": "strixcamdb:d-link" } ],
  "unverified_leads": [ { "path": "/play1.sdp", "note": "scan-DB only; no official manual" } ] }
```
Rebuilt on every merge like `cameras.json`; served from the same raw GitHub URL.

## Cadence & failure modes
- **Weekly** schedule + manual dispatch. Delta-only keeps each run small.
- If StrixCamDB is unreachable → no-op, exit 0 (don't fail the pipeline over an upstream outage).
- If the delta is empty → no issue, no PR.
- Verification backlog is fine: the queue persists; unverified leads simply wait, never leak.
- Snapshot is committed so diffs are reproducible and a re-run doesn't re-queue old leads.

## What's automated vs. human-gated
| Stage | Automated | Human/agent |
|---|---|---|
| Fetch, diff, junk-filter, triage, issue | ✅ | |
| Verify against official docs | fleet does the labor | rule is fixed: official doc or it doesn't ship |
| Publish + open PR | ✅ (build+lint gated) | |
| **Merge to main** | | ✅ always |
