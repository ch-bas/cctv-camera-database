# Continuous integration & data-quality automation

This repo is a **source-of-truth dataset**: contributors only ever edit files
under `cameras/`, `schema/`, and `glossary.md`. Everything else — validation,
generated artifacts (`data/`, `docs/`), coverage, and preservation — is handled
by CI so no one has to run a build or commit generated files by hand.

All scripts live in `scripts/` and are runnable locally via `npm run <name>`.

---

## Workflows (`.github/workflows/`)

| Workflow | Trigger | What it does | Gate? |
|---|---|---|---|
| **build.yml** | every PR + push to `main` | Schema-validates every camera (AJV) and runs the consistency lint; on `main`, regenerates & commits `data/`, `docs/`, `COVERAGE.md`, and deploys GitHub Pages | ✅ PR gate |
| **archive-sources.yml** | push to `main` (`cameras/**`) + manual | Submits changed cameras' `sources[]` to the Wayback Machine | advisory |
| **check-sources.yml** | weekly (Mon 07:00 UTC) + manual | Probes every `sources[]` URL for dead/moved links → tracking issue #222 | advisory |
| **check-staleness.yml** | monthly (1st, 08:00 UTC) + manual | Flags entries with an old / missing `last_verified` → tracking issue | advisory |
| **release.yml** | version tag | Publishes a GitHub Release with data assets | — |

"Advisory" workflows never fail — external sites rot and rate-limit, which is
not a code regression. They surface findings in a **self-updating tracking
issue** (opened when there's something to fix, closed automatically when clear).

---

## The PR gate — what fails a pull request

A PR fails only on **structural / correctness** problems, via two steps in
`build.yml`:

### 1. Schema validation — `scripts/build.js`
AJV-validates each camera against `schema/camera.schema.json`, and additionally
fails on: duplicate `id`, incomplete/negative pixel resolution (#169), PTZ
auto-tracking drift (#124/#126), and placeholder-sentinel values (#180). It
also emits **non-fatal warnings** for megapixel↔pixel mismatches (#169) and
reseller-only sourcing (#165).

### 2. Consistency lint — `scripts/lint-data.js` (`npm run lint`)
Cross-field invariants a JSON Schema can't express.

**Errors (fail the PR):**
- **E1** `environment` vs `ip_rating` — a weatherproof rating (water digit ≥ 5,
  incl. compound `IP66/IP67`) must not be tagged `["indoor"]` only (#123).
- **E2** `ip_rating` must contain a valid IEC 60529 token — allows compound
  (`IP66/IP67`) and partial (`IPX5`, `IP5X`) forms.
- **E3** `weight_g` must be a positive number ≤ 100 000.
- **E4** `last_verified`, when present, must be an ISO date (`YYYY-MM-DD`).
- **E5** canonical JSON formatting (2-space indent + trailing newline) — the
  dataset was canonicalised in #230, so this stays enforced. `--fix` auto-formats.
- **E6** `field_of_view_deg` must not contain a `°` symbol (normalised in #231).

**Warnings (advisory):**
- a `sources[]` URL shared by more than one camera (often legitimate — shared
  manuals/asset pages — but catches an entry sourced from another model's page).

Run it locally before opening a PR:
```bash
npm run lint            # report
npm run lint -- --fix   # auto-fix JSON formatting
```

---

## Generated artifacts (committed on `main` only)

`build.yml` regenerates and commits these on push to `main` — never edit by hand:

- **`data/cameras.json`**, **`data/cameras.csv`** — aggregates (`scripts/build.js`).
- **`docs/cameras/**.md`** — per-camera docs (`scripts/gen-docs.js`).
- **`COVERAGE.md`** — field-coverage report (`scripts/coverage-report.js`,
  `npm run coverage`). A table of how completely each important field is filled,
  with progress bars + shields.io badges, linked to the data-lane issues
  (#123/#161/#162/#177/#178/#179/#166/#170). This replaces the old manual
  coverage tallies. The same script also refreshes the badge row in the README
  between the `<!-- coverage:start -->` / `<!-- coverage:end -->` markers (#234).
  Regenerate locally with `COVERAGE_DATE=$(git log -1 --format=%cs) npm run coverage`.

---

## Preservation & freshness

### Wayback archiving — `scripts/archive-sources.js` (`npm run archive-sources`)
Manufacturer pages and datasheet PDFs disappear; several entries have already
been recovered from the Wayback Machine after link-rot. `archive-sources.yml`:
- on every **push** to `main`, archives the **changed** cameras' `sources[]`;
- on a **monthly cron** (5th, 03:00 UTC), runs a full-catalogue sweep (`--all`).

The archiver is **idempotent/resumable**: before saving, it asks Wayback's
availability API whether a snapshot already exists within `ARCHIVE_SKIP_DAYS`
(default 45) and skips if so. That's why the monthly full sweep is cheap — it
only saves what's missing or stale, and converges over runs.
```bash
node scripts/archive-sources.js cameras/hikvision/ds-2df4420wg-xey.json   # specific files
node scripts/archive-sources.js --brand hikvision                          # one brand
node scripts/archive-sources.js --all                                      # everything
```
Env: `ARCHIVE_DELAY_MS` (default 6000, be polite to IA), `ARCHIVE_MAX` (default 400),
`ARCHIVE_SKIP_DAYS` (default 45).

### Dead-link sweep — `scripts/check-sources.js` (`npm run check-sources`)
Weekly probe of every `sources[]` URL; reports dead/moved links into tracking
issue #222. Documented in [`check-sources.md`](check-sources.md).

### Staleness sweep — `scripts/check-staleness.js` (`npm run check-staleness`)
Monthly companion to the dead-link sweep — checks whether an entry has been
*re-verified* recently (specs drift as vendors revise datasheets), not just
whether its URL resolves. Flags two buckets: **stale** (`last_verified` older
than `--months`, default 18) and **unverified** (no `last_verified`).
```bash
node scripts/check-staleness.js --months 18
```

---

## Local quick-reference

```bash
npm run build            # validate + regenerate data/ and docs/
npm run lint             # data-consistency lint (add -- --fix to auto-format)
npm run coverage         # regenerate COVERAGE.md
npm run check-sources    # dead source-URL sweep
npm run check-staleness  # last_verified freshness sweep
npm run archive-sources  # push sources to the Wayback Machine
npm run add              # interactive add-a-camera wizard
```
