# strix/ — StrixCamDB ingest working dir

Outputs of the lead pipeline (see `docs/strix-ingest-design.md`). StrixCamDB is a
**lead source, never a data source** — nothing here is published; it feeds the
verification gate.

- `.snapshot.json` — committed. Full set of upstream stream keys, so the diff is
  reproducible and re-runs don't re-queue old leads.
- `leads-new.json` — transient (gitignored). This run's added/changed leads.
- `verify-queue.json` — transient (gitignored). Junk-filtered, triaged candidates
  awaiting verification against official docs.
