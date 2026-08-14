# strix/ — StrixCamDB ingest working dir

Outputs of the lead pipeline (see `docs/strix-ingest-design.md`). StrixCamDB is a
**lead source, never a data source** — nothing here is published; it feeds the
verification gate.

- `.snapshot.json` — the full set of upstream stream keys, used to diff runs.
  **Currently gitignored / not persisted:** a read-only CI job can't commit it
  back, so until snapshot persistence is added (commit-back or `actions/cache`),
  every run is a full cold-start sweep rather than a true delta. The tracking
  issue is upserted, so re-runs are idempotent.
- `leads-new.json` — transient (gitignored). This run's added/changed leads.
- `verify-queue.json` — transient (gitignored). Junk-filtered, triaged candidates
  awaiting verification against official docs.
- `leads-by-brand/` — transient (gitignored). Per-brand candidate paths handed to
  the verification fleet.

## Verified output (stage 4-5)

- `verified/<brand_id>.json` — **committed source.** One brand's RTSP template(s),
  each confirmed against the manufacturer's own docs by the verification fleet
  (`source` = the official doc, `strix_lead` = discovery credit). `status:
  "unverified"` with empty `templates` is a valid, honest result (no official RTSP
  doc exists / was reachable).
- These are consolidated into **`data/rtsp-patterns.json`** — the CC0 brand-level
  RTSP layer both projects can pull from. Regenerate after editing `verified/`:
  `node scripts/build-rtsp-patterns.js` (or the equivalent consolidation step).
