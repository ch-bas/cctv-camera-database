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
