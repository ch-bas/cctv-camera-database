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

## ⚠ Required schema for `verified/<brand_id>.json`

**Every file must follow this exact shape — do not invent new field names.**
The web frontend reads these fields directly; a wrong key silently breaks pages.

```json
{
  "brand": "Brand Display Name",
  "brand_id": "brand-id",
  "status": "verified",
  "default_port": 554,
  "templates": [
    {
      "stream": "main",
      "path": "/the/rtsp/path",
      "codec": "H.264|H.265",
      "verified": true,
      "source": "https://official-doc-url — description",
      "strix_lead": "manual:brand-id"
    },
    {
      "stream": "sub",
      "path": "/the/sub/path",
      "codec": "H.264|H.265",
      "verified": true,
      "source": "https://official-doc-url — description",
      "strix_lead": "manual:brand-id"
    }
  ],
  "notes": "Optional free-text notes.",
  "verified_on": "YYYY-MM-DD"
}
```

**Rules:**
- `brand` — human display name (e.g. `"Hikvision"`, `"TP-Link VIGI"`). **Required.**
- `brand_id` — kebab-case, matches the filename (e.g. `"hikvision"`).
- `default_port` — integer, usually `554`. **Not** `port`.
- `templates[].stream` — `"main"` / `"sub"` / `"third"`. **Not** `label` or `subtype`.
- `templates[].path` — just the URL path starting with `/` (e.g. `"/Streaming/Channels/101"`). **Not** a full URL with credentials.
- `templates[].source` — the official doc URL. Per-template (not top-level).
- `templates[].strix_lead` — `"manual:<brand-id>"` when hand-verified from docs.
- `templates[].verified` — always `true` for confirmed paths.

For unverified brands use `"status": "unverified"` and `"templates": []`.
`codec` is optional but fill it when the doc specifies.
