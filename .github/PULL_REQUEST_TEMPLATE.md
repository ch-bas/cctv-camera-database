## What does this PR do?

<!-- One line summary, e.g. "Add Reolink Argus 5 Pro" or "Fix Hikvision DS-2CD2387G2-LU night vision range" -->

---

## Checklist

### For new cameras
- [ ] JSON file is under `cameras/<brand-slug>/<model-slug>.json`
- [ ] `id` is a unique lowercase slug matching the file path
- [ ] `brand`, `model`, `type`, `resolution` are all present
- [ ] At least one URL in `sources` (manufacturer datasheet or reputable retailer)
- [ ] `npm run build` passes locally with no errors

### For corrections
- [ ] Include a source URL confirming the correct value
- [ ] `npm run build` passes locally with no errors

### For schema / tooling changes
- [ ] Existing cameras still validate (`npm run build`)
- [ ] Updated `docs/glossary.md` if new fields were added
- [ ] Updated `CONTRIBUTING.md` if new fields were added

---

## Source(s)

<!-- Paste the URL(s) you used to verify the specs -->

---

## Notes

<!-- Anything a reviewer should know: regional variants, known discrepancies between markets, uncertain fields left blank, etc. -->
