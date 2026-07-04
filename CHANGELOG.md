# Changelog

All notable changes to this dataset are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

---

## [1.19.0] — 2026-07-04

Full data-quality re-audit of the **Reolink** brand — all 122 stored cameras re-verified against official `reolink.com` product pages, datasheets, and support articles (part of the master audit #28). Reolink was audited once before (v1.8.0), but these pages draw heavy traffic, so every entry was re-checked from scratch. Net: **122 → 116 cameras** (7 removed, 1 newly-released model added).

### Added

- **Argus Solar** — Reolink's newly-released (2026) 5MP battery/solar wire-free camera with dual-band Wi-Fi 6 (2880×1616, 1/2.7" CMOS, f=3mm F1.6, 6500mAh battery, IP67, two-way audio). Added from the official product page; cloud/battery-only, so no RTSP/ONVIF, per Reolink's architecture for this line.

### Removed

- **1 ghost model**: `RLC-823A v2` (`rlc-823a-v2`) — no such product exists on Reolink's site (its only "source" was the bare homepage). Removed.
- **6 duplicate regional listings** of models already in the dataset, all spec-identical to their base entry (same worldwide product, only a localized storefront URL): `RLC-823A (Australia/Canada/Switzerland/EU/MENA)` → fold into `RLC-823A`, and `RLC-810A (India)` → fold into `RLC-810A`. Before deleting, the union of their `markets[]` tags was merged onto the base entries (`RLC-823A` now tagged AU/CA/CH/AT/EU/DE/FR/ES/AE/SA/MENA; `RLC-810A` tagged IN) so no market-filter coverage was lost.

### Fixed

- **Misfiled model**: `rlc-830a-v2.json` did not describe an "RLC-830A v2" (which doesn't exist) — its data, sources, and dimensions were all the real **RLC-840A** (a dome, distinct from the RLC-830A PTZ), which was otherwise missing from the dataset. Renamed the file/`id` to `rlc-840a` and corrected the remaining spec fields against the official RLC-840A page.

Every camera re-verified against official Reolink sources. Most serious errors first:

- **Fabricated regional-variant specs**: 5 of the 7 `RLC-823A` "regional" files described a fictitious fixed-lens 2.8mm bullet camera; the real RLC-823A on every regional storefront is the identical 5x-zoom PTZ dome (now deduplicated, see Removed).
- **Fabricated zoom lenses**: `RLC-812A` and `RLC-824A` were listed with motorized zoom lenses copied from other models — both are actually fixed-lens (4mm). `RLC-842A` was the inverse: listed as fixed-lens when it's a real 5x motorized zoom. Corrected all three.
- **Fabricated protocols on cloud-only/NVR-only cameras**: the entire B/D-series (`B400/B500/B800/B1200`, `D400/D500/D800/D1200`) are NVR-kit add-on cameras with no standalone network stack, but carried invented `rtsp`/`onvif` support and fake Frigate/Home-Assistant configs pointing at direct RTSP URLs. Battery models (`Argus 4 Pro`, `Argus MagiCam`, `Argus PT Ultra`, `Argus Track`, `Solar Floodlight`) likewise had fabricated ONVIF/RTSP config blocks. All corrected to reflect real cloud/NVR-only access. ONVIF was also over-claimed on several wired models (`CX820`, `Duo 2 PoE`, `Duo 2V PoE`, `Duo Floodlight PoE`, `RLC-830A`, `RLC-840WA`, `RLC-842A`) whose own official spec pages omit it — removed.
- **Wrong `type` classification**: `Argus 4 Pro` (bullet → dual-lens 180° stitching), `RLC-423` and `E1 Outdoor`/`E1 Outdoor CX` (bullet → ptz), and a cluster of RLC-8xx domes mislabeled `turret` (`RLC-833A/840WA/842A/843A`-area) — all corrected.
- **Wrong resolution / stale hardware**: `RLC-511WA` was mislabeled "4K UHD" when it's 5MP; `E1 Zoom` had drifted a full hardware generation behind (5MP → the current 8MP/4K Wi-Fi 6 unit); `Argus Eco` (2MP → 3MP) and `Argus PT` had similar stale-spec drift vs. the currently-sold hardware.
- **Wrong booleans**: `RLC-520`, `RLC-522`, and `RLC-842A` had `audio.microphone: false` despite official confirmation of a built-in mic; `E1 Outdoor` had two-way audio marked absent when it's supported. Corrected.
- **Systemic spec drift**: sensor sizes (e.g. the RLC-12xx family's `1/2.3"` → `1/2.49"`), varifocal FOV ranges flattened to a single wrong number, feet/meters unit confusion on IR ranges (`CX410`), a swapped FOV between the `RLC-1212A`/`1224A` twins, and stale microSD capacity ceilings (many PoE models 256 → 512GB) fixed across the brand.
- `last_verified: 2026-07-04` set on every re-verified entry; unconfirmable values were removed rather than guessed, per the no-fabrication policy (#28).

### Changed

- Resolution-tier counts recomputed after the deletions, corrections, and the one addition: 4K/8MP+ 531 → 525, 4–5MP 747 → 748, 1080p–2MP → 446 (the last figure also corrects a stale count carried in prior releases). PoE-wired 1,212 → 1,205, WiFi 480 → 474, battery/wire-free → 184, integration-config count 1,352 → 1,341 (fabricated configs removed from cloud/NVR-only models). Brand count unchanged at 69.

---

## [1.18.0] — 2026-07-03

Full data-quality audit of the Ubiquiti brand (issue #40 pattern, part of the master audit #28) — all 26 UniFi Protect cameras re-verified against official sources.

### Removed

- **1 ghost model**: `G4 Dome Mini` (`UVC-G4-DOME-MINI`) does not exist anywhere on Ubiquiti's site or in search results. Its stored specs (2688x1512, 4MP) exactly matched the real `G4 Dome` (`UVC-G4-DOME`), which was missing from the dataset entirely — replaced the ghost entry with the real product's full official spec (net camera count unchanged).

### Fixed

Every camera re-verified against `techspecs.ui.com` and/or `store.ui.com`, both fetchable directly for this brand (no PDF-export workaround needed, unlike ACTi). Corrections found, most serious first:

- **`G6 PTZ`**: stored data was almost entirely fabricated — a single-sensor 22x optical zoom camera with a 150m IR range. The real G6 PTZ is a dual-sensor (wide + tele) 10x hybrid zoom design with a 30m IR range; sensor size, both lens focal lengths, and FOV were all wrong.
- **`AI Theta Pro`**: stored as a fabricated 4-sensor 24MP 360° multisensor camera. The real product is a single 8MP-sensor hub + separate 180° fisheye lens module — not 360°, not multisensor.
- **`AI Bullet`**: stored as 8MP/4K with 3x optical zoom and 60m IR. Real product is a 4MP/2K fixed-lens camera with 25m IR, apparently conflated with a different AI-tier model.
- **`AI 360`**: resolution corrected from a fabricated 3840x2160 (4K) to the real 1920x1920 (1:1 fisheye) output; IR range and IP rating also corrected.
- **`G4 Doorbell Pro`, `G4 Doorbell`**: resolution fabricated on both (2688x1512 and 2560x1920 respectively; real spec on both is 2MP/1600x1200). `G4 Doorbell Pro`'s IP rating also corrected `IP55` → `IPX4`, and clarified it has no native PoE port (requires an optional adapter accessory).
- **`AI DSLR`**: sensor format and lens mount both wrong — stored as a 1" sensor with a C/CS lens mount; real is a Four Thirds sensor with a Micro Four Thirds mount, shipping with Olympus M.Zuiko PRO lenses.
- **`AI Pro`, `AI Pro White`**: sensor (`1/1.2"` → `1/1.8"`), lens (`2.8-12mm F1.4` → `4.1-12.3mm F1.53-3.3`), zoom ratio (`4x` → `3x`), IP rating (`IP66` → `IP65`), and IR range (`50m` → `25m` baseline, up to 40m with the optional Vision Enhancer accessory) all corrected. Confirmed AI Pro White is a color-only variant of AI Pro (identical spec) before mirroring the correction across both entries.
- **`G5 Pro`**: sensor size (`1/1.8"` → `1/2"`), lens focal length (`2.8-12mm` → `4.1-12.3mm`), IP rating (`IP66` → `IP65`), and IR range (`30m` → `25m` baseline) corrected.
- **`G5 Dome Ultra`**: resolution corrected from a fabricated 8MP/4K to the real 4MP/2K; tamper rating corrected `IK10` → `IK06`; IP rating and audio capability both had no confirming row on the official spec sheet and were removed rather than assumed from sibling models.
- **`G5 Bullet`**: IP rating corrected `IP66` → `IP55`; IR range corrected `25m` → `9m`.
- **`G5 Turret`, `G5 Turret Ultra`**: IP ratings, IR ranges, and tamper-resistance ratings (`IK08` → `IK04`) corrected across both models.
- **`G4 Instant`**: lens (`2.3mm F2.0` → `2.8mm F1.6`) and IP rating (`IP20` → `IPX5`) corrected — `IP20` understated this camera's actual splash resistance by a full rating class.
- **`G3 Bullet`**: had an `IP67` rating that actually belongs to its sibling `G3 Pro` — the Bullet's own official datasheet has no weatherproofing row at all. Also removed unconfirmed IR-range figures on `G3 Bullet` and `G3 Pro` that turned out to be the optional IR Range Extender *accessory's* rated distance, misattributed to the base camera.

### Changed

- Widespread pattern across nearly every G5 and AI-tier model: IP ratings, IR ranges, sensor sizes, and lens specs were plausible-looking but did not match official sources — the same failure mode found in the ACTi audit and other brands per the master tracking issue (#28).
- Full spec backfill (sensor, lens, power, dimensions, weight, IP rating, video codecs/FPS, audio, operating temp) applied across all 25 corrected entries.
- Database resolution-tier counts shifted slightly (several models dropped from 8MP to their real 4MP spec): 4K/8MP+ 535 → 531, 4-5MP 745 → 747, 1080p-2MP 473 → 475. Total camera count and brand count unchanged.

---

## [1.17.2] — 2026-07-03

RTSP/ONVIF protocol confirmation pass across the entire ACTi brand (follow-up to 1.17.0/1.17.1), plus 1 new camera and several data-quality fixes surfaced during verification.

### Added

- **E815** (5MP outdoor zoom dome), sourced from an official printed ACTi datasheet (doc rev. 150610) — confirmed RTSP + ONVIF.
- Discovered and used ACTi's internal spec AJAX endpoints (`newPopupSpecifications.ashx` + `newPopupSpecifications_value.ashx`, the same JSON backing the website's own product-page widget) to pull full official specs directly for the majority of this pass, instead of manual per-model PDF exports.

### Changed

- **RTSP + ONVIF now explicitly confirmed for 93 of 119 ACTi cameras** (up from a handful at the start of this pass), each cross-referenced against an official ACTi source (`?tab=specifications` page or a downloadable PDF datasheet) requiring an explicit `Network Protocol & Service` list containing RTSP *and* an `ONVIF Compliant` row — never inferred from one without the other.
- Full spec backfill (sensor, lens, power, dimensions, weight, IP rating, video codecs/max fps, audio, detection range, ONVIF profile list) applied across effectively the whole brand, regardless of protocol-confirmation outcome.
- **20 cameras remain genuinely unconfirmed**, each with the specific reason recorded in its `features`: 11 have ONVIF but no RTSP row (`A371-P2`, `A372`, `A372-P1`, `A374`, `A374-P1`, `A570-P1`, `A570-P2`, `A810`, `Q711`, `Q75`, `Z413-P1`), 3 have RTSP but no ONVIF row (`Q120`, `Q121`, `VMGB-370`), and 6 have neither documented (`A432`, `A432-P1`, `A973`, `Q170`, `Z64`, `Z914`). 12 of the 20 were additionally cross-checked against a second, independent official source (a downloadable PDF datasheet distinct from the specifications-tab widget) — all returned the same result, confirming this isn't a gap in the widget, it's a genuine gap in ACTi's own published documentation for these specific models.
- The 6 genuinely-analog Y-series cameras (`Y31`, `Y32`, `Y35`, `Y55`, `Y71`, `Y72`) correctly retain no `protocols` field — not applicable over coax.

### Fixed

- **Bug: `video.max_fps` extraction was picking the highest FPS value anywhere in a camera's frame-rate table**, but the schema defines the field as "Max FPS at highest resolution" — a different (usually lower) number for cameras whose fps drops at their top resolution tier. Corrected across every camera processed in this pass.
- **`A973`, `Z64`**: had been marked RTSP+ONVIF confirmed in an earlier round of this audit without an actual `Network Protocol & Service` row ever being checked for either model — corrected to unconfirmed on cross-verification against the live spec API (ONVIF-only, same pattern as several other models in this pass). `Z64`'s official PDF datasheet does contain the string "RTSP", but only inside a `Security` row (`HTTP/RTSP/ONVIF(WSSE)` authentication schemes) rather than an explicit protocol list — noted, but not treated as sufficient confirmation.
- **`Z416`, `Z722`, `Z84`**: IP rating corrected `IP67` → `IP68` (repeat confirmation from the live spec page); `Z722`'s operating temperature widened `-30~60°C` → `-40~60°C` to match the official sheet.
- **`Q170`**: IP rating reconciled after conflicting across three checks (`IP68` web page → `IP67` dated PDF datasheet → `IP68` web page again, re-checked) — settled on `IP68` given the live page confirms it twice against a single older PDF; still has no protocols documented on any of the three sources checked.
- **15 cameras** (`A416`, `A820`, `A88`, `B416`, `B76A`, `I96`, `I98`, `KCM-5611`, `Q550`, `Z47`, `Z49`, `Z714`, `Z810`, `Z812`, `Z86`) were sitting on a much thinner, pre-audit-standard data shape (legacy `storage` object, third-party reseller-site sources, no `configs` block, generic feature bullets) — refreshed to the full spec depth used throughout the rest of this audit.

---

## [1.17.0] — 2026-07-03

Full data-quality audit of the ACTi brand (issue #40 pattern, part of the master audit #28), plus 10 new cameras.

### Added

- **10 new cameras**, all sourced from official ACTi datasheet PDFs: Z810, Z714, Z812, A820, Z86 (domes), Q550 (dual-lens), Z47, Z49 (bullets), I98 (PTZ), Z722 (turret).
- **58 more new cameras** from a full sweep of ACTi's High Resolution Cameras, New Products, and Thermal Cameras listing pages: cube/bullet/dome/turret/hemispheric/multi-imager/PTZ models across the 8MP+ line (36 cameras: E14, E16, A315/A421/A424/Z318/Z325/Z429/A432/A432-P1/Z310, A78/A817/Z913/A822/Z818/E816, Z56/Z64, A711/B511A/A317, Q450/Q711/Q75/Q83/Q84, A952/A959/K958/Z954/A981/A962/Z953/Q992/K9001); the newest-launched line (37 cameras: A214, J41/K31/K31-P1/K41/B412-K1/K32/K42/Z413-P1/Z411/A412/K33/K43/Z332, K71/K81/Z914/K72/K82/Z724/A828/K73/K83/A810, Z510/Z512/A573/A573-P1/A573-P2, A966/A982/Z959/K953/A957/K954, Q120/Q121); and 21 well-specced bi-spectrum thermal+visible cameras (A371/-P1/-P2, A372/-P1, A374/-P1, VMGB-359/-P1/370/371, A570/-P1/-P2, A972, A973, Q170, Q981, Q982 family) out of a larger thermal line -- ~17 thermal models with only a marketing blurb (no full spec table) were skipped, as were 2 body-worn cameras and several NVR/recorder hardware entries (out of scope for a camera database). Protocols/power/dimensions are largely unconfirmed for this batch since these are comparison-page summaries, not full datasheets, and are left unset rather than fabricated.

### Fixed

- **6 entries had substantially wrong core specs, not just missing fields**: `A416` (stored as 2MP/50m IR/802.3af; real spec is 4MP, IR 85m, High PoE 802.3at), `A88` (stored as a 5MP bullet with audio; real product is a 3MP Mini Zoom Dome — wrong form factor entirely — with no built-in audio), `B416` (stored as 8MP/4K; real spec is 2MP with a 30x zoom lens, and the product is discontinued), `Z84` (stored as 2MP fixed-lens with 15m IR; real spec is 4MP with a 4.3x zoom lens and 40m IR — also fills the originally-missing `ip_rating`), `Z416` (stored as a 2MP dome; real product is a 5MP bullet with 12x zoom and 100m IR).
- **2 ghost model numbers renamed to their real products**: `I68` → `I96` (no such model as "I68" exists; I96 is the closest real match, with a corrected IR claim — I96 has no IR LED at all, it relies on Extreme Low Light Sensitivity), `Q416` → `B76A` (no such model as "Q416" exists; B76A is the closest real match, corrected IR range 10m → 20m and IP66 → IP68).
- **Y55 was initially misjudged as a nonexistent ghost** (absent from ACTi's current camera matrix, zero datasheets, zero retailer listings, zero Wayback Machine snapshots) — a live acti.com screenshot proved it's real, a newly-launched IP68 refresh of Y71 not yet indexed anywhere else. Corrected with the real spec instead of deleting.
- **Backfilled the analog Y-series** (`Y31`, `Y32`, `Y35`, `Y71`, `Y72`) with lens, field of view, video, operating temperature, and protocols, confirmed via the official Y71 datasheet and cross-checked retailer listings for the 5MP variants — all are analog-only with no RTSP/ONVIF (`protocols: []`).

### Changed

- ACTi: 14 → 118 cameras (68 new, 6 corrected, 2 renamed).
- Database now covers **1,753 cameras** across **69 brands**.

---

## [1.16.0] — 2026-07-01

Full data-quality audit of the Lorex brand (issue #40, part of the master audit #28), plus 3 new cameras from Lorex's professional "Connect X" line.

### Added

- **X5 4K PoE Turret / X5 4K PoE Bullet** (CNE01P series) and **X3 4K Dual-Lens Turret** (CNU01P-1SW-AB1): verified against official Lorex spec-sheet PDFs (the product pages themselves are marketing-only). All three explicitly confirm ONVIF + RTSP in their datasheets ("Interoperability: ONVIF, RTSP") — a notably more open professional-tier line than the existing E-series, which had no such official confirmation.
- **V5 4K PoE Bullet / V5 4K PoE Turret** (CN502A series, status: announced — official page shows pre-order, ships mid-July) and **X PTZ 4K** (CNX01P-DPW-AB1, a true 30x optical zoom PTZ dome, 7–210mm motorized lens, IR range up to 250m): also verified against official spec-sheet PDFs, also ONVIF + RTSP confirmed.
- **V3 4K PoE Turret** (CN301A series) and **U3 2K+/4K PoE Turret + Bullet** (CN201/CN251 series, 4 SKUs): confirmed CN201 is the 2K+ (5MP) tier and CN251 is the 4K (8MP) tier of the same "U3" line — Lorex's own datasheet PDF headers have a copy-paste labeling quirk, but the spec tables are unambiguous. The U-series has only a confirmed microphone, no speaker/two-way talk, unlike the V-series/X-series.
- **11 more cameras found via a full sweep of Lorex's IP camera collection page**: **X3 4K PoE Turret/Bullet with Motorized Varifocal** (CNE01P series, ONVIF+RTSP confirmed via datasheet) and **V3 4K PoE Bullet** (CN301A series, ONVIF+RTSP confirmed, bullet counterpart to the already-added V3 Turret); **LNE9242B/LNB9242B** (Nocturnal N3 dome/bullet pair, listen-in audio only, no RTSP/ONVIF documented); **E920SB/E920SD** (Classic 4K+/12MP bullet/turret — official page has no full spec table, added with only the handful of confirmed fields); **E872SB** (Classic 4K Dual-Lens) and **E871AB** (H20 Halo Dual-Lens) — identical specs on every confirmed field (same lens, FOV, night vision, power, dimensions, weight), strongly suggesting shared hardware sold under two series names, added as separate entries per the twin-SKU precedent from the EZVIZ audit; **E842CDB/E842CAB** (A14 dome/bullet, listen-in audio only).

### Removed

- **3 ghost/mislabeled entries**: `4KLTE` (fabricated — Lorex has no cellular/LTE camera product at all), `E892CD` (no matching real SKU — Lorex's E892 line is E892AB/E892DD, neither of which matches the stored spec), `LNR6100` (mislabeled — confirmed to be an 8-channel NVR, not a turret camera; "LNR" is Lorex's NVR-line prefix).

### Fixed

- **Renamed 8 entries to their correct official model numbers**: `2KPTZ`→`F461AQD-E` (also corrected: no battery/solar exists for this model, it's AC-adapter only; IP65→IP66; wrong storage max), `F861AS`→`F861ASD` (missing trailing "D"), `W462AQ`→`W462AQC-E` (missing suffix; also gained confirmed ONVIF Profile S support, corrected from http-only), `W882ASD`→`W881AAD` (W882ASD doesn't exist — replaced with the real matching product). Dropped the misleading "-canada" id suffix on 4 entries confirmed **not** Canada-exclusive (same model sold in the US under the same number): `B862AJ`, `W482CAD`, `LNB9292B`, `LNE9292B`.
- **`W461ASC`** previously held an entirely different product's spec (was: outdoor battery+solar spotlight bullet; is actually: indoor AC plug-in camera) — fully rewritten from the real official page.
- **Fabricated RTSP/ONVIF/Frigate config removed from the `B862AJ` doorbell** — official FAQ and spec sheet make zero mention of local streaming, only the Lorex Home app/Fusion cloud ecosystem.
- **Downgraded RTSP/ONVIF to unconfirmed** (`protocols: []`) on the E-series PoE line (`E841CD`, `E891AB`, `E893AB`, `E896AB`) — Lorex's own help center has no RTSP/ONVIF mention for any of them; the widely-used Dahua-OEM RTSP path is a community pattern, not manufacturer-documented. Kept protocols on the Nocturnal N3/N4 line (`LNB9292B`/`LNB9393`/`LNE9292B`/`LNE9393`), where official Lorex support docs do confirm ONVIF/RTSP.
- **Audio capabilities were significantly overstated** on several PoE cameras (`E841CD`, `LNB9292B`, `LNB9393`, `LNE9292B`) — corrected from "full two-way" to the real mic-only or no-audio-at-all spec.
- **`E891AB`'s night vision was wrong**: stored as IR-only, but the model explicitly supports color night vision per its own spec sheet.
- Confirmed `LNB9292B`/`LNE9292B` ("N3") and `LNB9393`/`LNE9393` ("N4") are genuinely distinct product generations, not duplicates — kept as 4 separate entries with corrected generation-specific specs.
- Fixed several field-of-view axis-conflation errors across the brand (diagonal vs. horizontal figures swapped or blended).

### Changed

- Lorex: 21 → 40 cameras (-3 ghosts, +22 new).
- Database now covers **1,649 cameras** across **69 brands**.

---

## [1.15.0] — 2026-07-01

Full data-quality audit of the EZVIZ brand (issue #39, part of the master audit #28), plus a complete sweep of EZVIZ's official product category page to close every coverage gap.

### Added

- **66 new EZVIZ cameras**, each verified against an official ezviz.com product page before adding: H4, C3TN, C3TN 2K (retail-branded "EZVIZ OutPro"), C8c 4K (R210), C9c Dual 3K, C90 Dual 2K+, EB5 4K, CB5 4K, BC1c 4K, eLife 2K+, CB3/EB3 (AOV Version), CB8/HB8/CB8 Pro/HB8 Pro/CB8 Lite 4K/HB8 Lite 4K, HB90/CB90 Dual Kit, TY1 G1 2K, C60p Dual Mix 2K, E6, H6, C1C-B, H1c, C6c 2K, C6N G1 4K, C6N Pro 2K, H6c G1 4K, C7 Dual, CP1 Pro, TY1 Pro, H6c Pro, H6c, H7c/TY7 Dual 2K+, H3 2K, H3c Color, H8c Pro 4K (R210), H8c Pro 2K, H90 Dual 2K+, H9c Dual 3K/4G, H80f Multi 2K+, H80x Dual, H8x 2K+, EL3, LC3, H5/H8c/H8c Pro 4G, HB90x/CB90x Dual 4G Kit, EB8 Pro Ranger Kit/4G/4G, CB1, CB2/BC2, C2C H.265, CB8/HB8 Lite 4G, CB3/EB3/CB2 4G, and the PoE line (H3K PoE 4K, H4/H5/H8c PoE 2K).
- **Schema: new `floodlight` camera type** (additive, non-breaking enum value). Applied to EZVIZ EL3/LC3 (previously miscategorized as `box`) and to Reolink's Solar Floodlight Cam (previously `bullet`). Left Reolink's Duo/Elite/TrackFlex Floodlight models as `dual-lens`, since they're genuinely two-lens cameras and that's the more structurally important classification.

### Fixed

- **Recheck of all 21 pre-existing EZVIZ cameras** against official sources turned up systemic errors: wrong resolutions, lenses, FOVs, night-vision ranges, and IP ratings across most entries; a fabricated battery-capacity figure (`bc1c-elife`: "10,000mAh" → confirmed 7,800mAh, matching the same pattern found earlier on Tapo cameras); and several entries whose stored source URL/spec actually belonged to a *different* EZVIZ product.
- **`h3c-2k`**: the stored spec was a copy of the C6N indoor pan-tilt line, not the real H3c 2K (an outdoor fixed-lens bullet camera, IP67, no RTSP) — fully rewritten from the correct official page.
- **`c8w-pro-eu` → `c8w-pro-2k`**: "C8W Pro (EU)" isn't a real regional SKU; EZVIZ's actual products are "C8W Pro 2K"/"C8W Pro 3K", sold identically in EU and US. Renamed and re-sourced to the real product page.
- **RTSP/ONVIF claims downgraded to unconfirmed (`protocols: []`)** on most EZVIZ models — official spec pages and datasheets list only "EZVIZ Cloud Proprietary Protocol"; the commonly-cited "Local RTSP" toggle is documented only by community sources, not EZVIZ. Kept `rtsp`/`onvif` only where EZVIZ's own ONVIF compatibility FAQ explicitly names the model/firmware (C6N, H8c, H8 Pro 3K family). One notable exception: **H3K PoE 4K** explicitly lists RTSP in its own official protocol stack and is NVR-compatible — a genuinely different, professional-tier product line from EZVIZ's usual consumer cloud-only cameras.

### Removed

- **6 confirmed duplicate regional listings**, spec-identical to an existing base entry: `c6n-latam`, `c6n-mena`, `c6n-vn` (merged into `c6n`'s `markets`), `h8c-latam`, `h8c-vn` (merged into `h8c`), `h8-pro-3k-mena` (merged into `h8-pro-3k`).

### Changed

- EZVIZ: 21 → 87 cameras.
- Database now covers **1,630 cameras** across **69 brands**.

---

## [1.14.0] — 2026-07-01

Continued Tapo verification (per user-supplied official links) plus a new brand.

### Added

- **Kasa — new brand** (`Kasa (TP-Link)`): KC420WS, a 4MP wired outdoor bullet camera with Starlight sensor and dual IR/white-light spotlight illumination. Kasa is a separate TP-Link sub-brand/ecosystem from Tapo; confirmed via official TP-Link FAQ 1959 that Kasa cameras do **not** support RTSP/ONVIF (a different policy from Tapo's wired cameras) before assuming otherwise.
- **5 new Tapo cameras** added from official tapo.com spec pages, each checked individually before adding: `C645D Kit` (dual-lens pan/tilt, battery+solar), `TCW90 Kit` (pan/tilt dome, battery+solar), `C465` (4K wire-free, integrated solar panel), `C400 Kit` (battery+solar bullet), `C207` (DC-powered pan/tilt — RTSP+ONVIF confirmed supported, unlike the battery models).

### Fixed

- **`C615F Kit`**: `operating_temp_c` was completely missing — added `-20 to 45` from the official spec page; enriched features (800-lumen floodlight, 12x digital zoom, pan-tilt mechanical range, siren dB).
- **`C675D Kit`**: `audio` was completely empty — filled (mic/speaker/two-way confirmed); corrected `power.method` to name the included Tapo A202 solar panel; enriched `field_of_view_deg` with horizontal/vertical components.
- **`C660 Kit`**: verified fully accurate against the official page; enriched `power.method` with exact solar/adapter output specs and added 18x digital zoom to features.
- **`TC85`, `C460`**: verified against official spec pages; both had an unconfirmed "10,000mAh"-style battery capacity figure not stated on any official source — softened to only the verified charger spec.
- **`data/cameras.json` / `docs/cameras.json` sync bug**: a source-file fix (`tapo-tc40`'s missing `video.streams[].name`) had been baked into a rebuilt `data/cameras.json` and committed, but the source file change itself was never committed — a later `git reset --hard` (dropping an unrelated commit) silently discarded it from the working tree, leaving the generated files out of sync with their own source. CI's "generated files must match a fresh build" check caught it; re-applied and re-committed together this time.

### Changed

- Tapo: 42 → 47 cameras (+5 new models).
- Database now covers **1,564 cameras** across **69 brands**.

---

## [1.13.0] — 2026-06-30

Full Tapo brand recheck — every Tapo camera re-verified against official TP-Link/Tapo sources (product pages + datasheets), continuing from the #26 investigation. No fabrication: unverifiable fields left empty.

### Fixed

- **Systemic spec errors across nearly the whole brand** — `lens` (focal length/aperture), `field_of_view_deg`, `power.method`, and `storage.max_microsd_gb` were wrong on ~36 cameras (templated/guessed values from an earlier pass), corrected against official datasheets. Example: C100's lens was 2.9mm/F2.0 (wrong) → 3.15mm/F2.0 (official); microSD cap 128GB → 512GB.
- **Removed fabricated `IP20` ratings from 10 indoor cameras** (C100, C110, C125, C200, C210, C220, C222, C225, C230, C260, C840) — no official source publishes an ingress-protection rating for these indoor-only models.
- **6 cameras had data describing an entirely different product** — the id/model was real, but every stored spec belonged to a different camera. Fully corrected: `TC85` (was PTZ floodlight/AC/RTSP → is wire-free battery/solar bullet, no RTSP), `TC82` (was floodlight/RTSP/IP44 → is 3MP wire-free battery, no RTSP, IP65), `TC55` (was PTZ w/ siren/DC → is fixed-lens AC-mains floodlight), `TC40` (was 4MP bullet/IP66 → is 2MP PTZ/IP65), `D130` (was box/battery/P2P-only → is a hardwired doorbell with RTSP+ONVIF), `C222` (was dome/3MP/USB → is PTZ/4MP/DC+Ethernet).

### Removed

- **5 ghost models** that don't exist on any official TP-Link/Tapo source: `C135`, `C340` *(see also the VIGI C340 added in 1.10.0/1.12.1)*, `C440`, `C540`, `C770`.
- **14 confirmed duplicate regional listings** — spec-identical to a base model already in the dataset (different storefront/market, same hardware, no real variant): `C100 Global`→C100, `C120 Indoor`→C120, `C210` India/LATAM/MENA/Vietnam→C210, `C225` CH/EU→C225, `C310` Japan→C310, `C320WS` MENA→C320WS, `C500` EU/Outdoor→C500, `C720` India/Outdoor→C720. (`C325WB` CA/India variants kept — confirmed genuine hardware/resolution differences by region, not templated duplicates.)

### Changed

- Tapo: **61 → 42 cameras** (-19 ghosts/duplicates).
- Database now covers **1,558 cameras** across **68 brands**.

---

## [1.12.1] — 2026-06-30

### Fixed

- **Removed unsupported RTSP/ONVIF from 7 battery/solar Tapo cameras** (issue #26, reported by @romeropal). TP-Link's official FAQ confirms battery- and solar-powered Tapo cameras do **not** support RTSP/ONVIF. Set `protocols: []` and removed the fabricated Frigate/Blue Iris RTSP configs (kept the legitimate Tapo Home Assistant integration) for: **C460, C425, C420, C660 KIT, C402, C615F KIT, C675D KIT**. Sources updated to the official TP-Link FAQ + spec pages.
- `D225` left as `["rtsp"]` — TP-Link's documented exception (RTSP only when hardwired, jumper installed, always-on; no ONVIF).
- **Tapo C460** verified against the official spec page and several specs corrected/filled: night vision `color`→`hybrid` (IR 850nm ~15m + color), lens `3.3mm/F1.6`→`3.17mm/F1.65`, FOV `110°`→`113°/59°/134°`, plus added Starlight sensor, 15fps, operating temp, and dimensions.

### Removed / Added

- Removed ghost `tapo-c340-solar` — no "Tapo C340" product exists; the entry was a mislabelled/fabricated stand-in for the real **VIGI C340** (a wired PoE professional bullet, not a battery Tapo).
- Added the real **VIGI C340** (4MP fixed-lens PoE bullet, IR + full-color, ONVIF/RTSP) from the official TP-Link spec page. VIGI: 24 → 25.

---

## [1.12.0] — 2026-06-29

### Added

- **Integration configs (Frigate + Home Assistant) for 195 cameras** that supported RTSP/ONVIF but had none, using verified per-OEM RTSP patterns:
  - **137 Bosch** (FLEXIDOME / DINION / AUTODOME / MIC) — Bosch's official `rtsp://…:554/?inst=1` (main) / `?inst=2` (sub) scheme, per Bosch's "RTSP usage with Bosch Video IP Devices" doc.
  - **58 ABUS Performance Line** (IPCA/IPCB/IPCS + 8 PoE TVIP) — Hikvision-OEM `…/Streaming/Channels/101` (main) / `102` (sub); ABUS TVIP82561 shares an official manual with the IPCS84511, confirming the platform.
  - All marked `verified: false` with sourced notes (derived from the OEM family / official scheme, not individually bench-tested). "No config" cameras with RTSP/ONVIF dropped from 203 → 7.
- Added vertical field-of-view to ABUS IPCA54512A (110° H / 57° V) and the firstmall.de source.

### Changed

- No camera count change — still **1,577 cameras** across **68 brands**. Cameras with integration configs: **1,303**.

---

## [1.11.0] — 2026-06-26

### Added

- **138 new Bosch cameras** sourced from official Bosch datasheets (boschsecurity.com / catalog) cross-checked with the netcamcenter.de catalog — Bosch's full active IP range: FLEXIDOME (dome / panoramic / multisensor / micro), DINION (bullet / box), AUTODOME & MIC (ruggedized PTZ), plus **42 DINION/MIC thermal & fusion cameras**. Specs taken only where stated on an official source; fields with no published value were left empty (no fabrication).
- **48 new Dahua cameras** sourced from official dahuasecurity.com datasheets:
  - **8 HDCVI analog cameras** — Pro Series turrets and bullets (HAC-HDW/HFW): 4K Smart Dual Light, 5MP WizColor, 2MP entry-level. All with F1.0–F2.0 apertures and 4-in-1 HDCVI/TVI/AHD/CVBS output.
  - **20 WizSense IP cameras** — 2/3 Series turrets, domes, and bullets: WizColor X (F1.0, 1/1.2" sensor), TiOC PRO active deterrence (F1.2, 1/1.8" sensor, dual mic + speaker), Smart Dual Light vari-focal models, and the 4G LTE dome (IPC-HDBW3441DR1-AST-4G-LA).
  - **20 additional IP cameras** covering new product lines:
    - 3 WizMind 5 Series (IPC-HDW5259/HDBW5259) — 2MP with face detection, ePoE, 1TB microSD
    - 8 WiFi cameras (1-Series) — WiFi 6 turrets and bullets (3MP/5MP) with Bluetooth pairing and two-way talk
    - 4 PTZ cameras (SD4D series) — 2MP/4MP/8MP 25x optical zoom with 100m dual light
    - 5 entry-level PoE/WiFi cameras

### Fixed

- Added missing `hdcvi` protocol to 4 existing HDCVI cameras (HAC-HDW1509TQ-A-LED, HAC-HFW1509TH-A-LED, HAC-HFW2802E-LED, HAC-HFW2849E-A-NI-LED)

### Changed

- Bosch: **22 → 160 cameras** (+138)
- Dahua: **107 → 155 cameras** (+48)
- Database now covers **1,577 cameras** across **68 brands**

---

## [1.10.0] — 2026-06-22

### Added

- **VIGI brand — 24 TP-Link VIGI professional cameras** (TP-Link's business PoE line, distinct from the consumer Tapo line). Covers the VIGI C-series and InSight S-series: bullets, turrets, domes, PTZ, panoramic, fisheye, and an LPR/ANPR camera. Spec-sourced from official TP-Link/VIGI datasheets; ONVIF/RTSP support and Frigate configs included.

### Fixed

- VIGI `InSight LPR345Z` / `S245ZI` / `S345ZI` / `S445ZI`: `audio.two_way` corrected to `true` — these have a built-in microphone + audio-out terminal (two-way via external speaker) but no built-in speaker, per official datasheets. IK10 vandal ratings independently verified correct across the VIGI line.

### Changed

- Database now covers **1,391 cameras** across **68 brands**.

---

## [1.9.0] — 2026-06-20

ABUS brand rebuild. The ABUS section was substantially fabricated (made-up article numbers + invented RTSP/Frigate configs). It was verified against official ABUS sources and the ABUS catalog, then rebuilt — **ABUS 15 → 76 cameras**.

### Added

- **70 real ABUS cameras** from the official catalog: the consumer App2Cam line (PPIC31020/52520/54520/91000) and the full professional IP range — TVIP/IPCB/IPCS/IPCA bullets, domes, PTZ (4×/25×/32× zoom), hemispheric/fisheye, an ANPR camera, **2 bi-spectral thermal cameras**, plus analog HD (HDCC/TVCC). Sourced from `expert-security.de` cross-checked with official ABUS.

### Fixed

- Stripped **fabricated RTSP/ONVIF protocols and Frigate/HA configs** from the 5 genuine App2Cam (PPIC) cameras — they are app-only with no local streaming.
- Corrected `PPIC52520`/`PPIC54520` to **native 2 MP** (the "4K" is interpolated marketing) and `PPIC90520` night vision to **color** (white-light LED), per official ABUS datasheets/manual.

### Removed

- **9 non-existent "ghost" ABUS models** that 404 on ABUS (fabricated or misnamed article numbers).

### Changed

- Database now covers **1,367 cameras** across **67 brands**.

---

## [1.8.0] — 2026-06-18

Reolink data-quality pass — every Reolink camera verified against official Reolink sources (product pages, datasheet PDFs, support articles). Facts only; fields with no official value left empty.

### Added

- **Filled missing specs for 122 Reolink cameras** from official sources — `sensor`, `lens`, `video` (codecs/fps/streams), `dimensions_mm`, `weight_g`, `operating_temp_c`, and `environment`.

### Fixed

- **87 corrections** to existing Reolink data against official specs — resolution/megapixels (e.g. P340 6→12 MP, Duo 2 LTE 16→6 MP, several RLC-5xx 8→5 MP, Go PT 4→2 MP), IP ratings, and night-vision types. All megapixel changes independently re-verified.
- Set `protocols: []` on Reolink battery cameras — they don't support standalone RTSP/ONVIF/HTTP (only via a Reolink Home Hub).

### Removed

- **8 non-existent "ghost" Reolink models** that 404 on Reolink (fabricated or misnamed entries that padded the count): `argus-5-pro`, `argus-b60`, `cx810-wifi`, `e1-pro-v2`, `rlc-520a-wifi6`, `rlc-540wa`, `rlc-833wa`, `video-doorbell-se`.

### Changed

- Database now covers **1,306 cameras** across **67 brands**.

---

## [1.7.0] — 2026-06-17

### Removed

- **All MSRP price fields** (`msrp_usd` plus the localized `msrp_eur/gbp/inr/aed/aud/cad/vnd/chf`) — removed from the schema and stripped from 468 cameras. The pricing data was sparse (~36% of cameras, one currency each, undated) and unreliable; omitting it is more honest than publishing inaccurate prices.

### Changed

- Clarified in the schema that `video.streams[]` describes stream *capabilities* (what the camera outputs), distinct from `configs.frigate.*`, which holds the RTSP URLs to use — the two complement rather than overlap.

---

## [1.6.0] — 2026-06-17

### Added

- **Schema validation now enforced in the build** — every entry is validated against `schema/camera.schema.json` via Ajv. Previously the build only hand-checked five required fields, so the schema had silently drifted from the data; it is now the single source of truth and CI fails on any violation.
- **11 fields added to the schema** that the data already used but never declared: localized prices `msrp_eur`, `msrp_gbp`, `msrp_inr`, `msrp_aed`, `msrp_aud`, `msrp_cad`, `msrp_vnd`, `msrp_chf`; plus `markets`, `generation`, and `release_notes`.
- **`storage.notes`** field — free-text storage notes (e.g. external-hub requirements).
- **`hdcvi` and `mxpeg`** added to the `protocols` enum (HD-CVI coax for HiLook/Dahua analog; MxPEG for Mobotix).
- **Reolink Video Doorbell PoE** enriched — verified Frigate config (tested by blakeblacksear on v0.14, go2rtc), Home Assistant details (`local_push`, doorbell button, two-way audio, ONVIF events), plus `soc` (Novatek NT98566), `poe_class`, and outdoor `environment`.

### Fixed

- Removed invalid `ip_rating: null` from 3 indoor cameras (Amcrest ASH42-W, Tapo C121, Tapo C135) — the field is optional and `null` is not a valid rating.

### Changed

- Dataset mirroring to a downstream consumer is now opt-in via the `DATA_MIRROR_DIR` env var (configurable through a local, gitignored `.env`), replacing a hardcoded copy path in the build script.
- **Project now points to the website at [cctv-database.com](https://cctv-database.com)** — README links and `package.json` `homepage` updated. The GitHub Pages demo redirects there, with a standalone offline copy kept at `docs/demo.html`. The README now states explicitly that the dataset is CC0 and always will be.

---

## [1.5.0] — 2026-06-12

### Added

- **SV3C brand** (13 cameras incl. C25 & C12 verified via Amazon): PoE bullets/domes, WiFi/PoE PTZs, solar dual-lens kit — all specs from official product pages; honest ONVIF notes (C25 and the original B05W have ONVIF, the rest are RTSP-only)
- **Dahua DH-SDT7425-4P-AD3E-PV-i** (issue #11) — CN-market dual-channel panoramic+PTZ with full datasheet specs: 180° stitched 3840x1080 panoramic + 4MP 25x PTZ, starlight 0.001 lux, DC 36V/35W, Smart H.265, 150m IR + white light deterrence. ONVIF autotracking behavior verified via frigate#22135 (Channel 2 has unified VideoEncoder+PTZ profile, unlike SDT4E series)
- **Real video/power specs** for 4 Reolink doorbells and 12 Reolink cameras from official datasheets

### Fixed

- **Full Dahua config audit** (109 cameras): 8 panoramic/multi-sensor cameras got stitched-stream aspect-ratio and channel-layout notes, 8 PTZs got ONVIF autotracking instructions, 4 HDCVI analog cameras corrected (were listed as ethernet with invalid protocol — now coax), 2 duplicates removed, 1 misnamed ZAS varifocal variant renamed
- **Full Hikvision config audit** (150 cameras): PanoVu 4-sensor channel layout (101/201/301/401), TandemVu PTZ+bullet dual-camera setup, fisheye dewarp channel notes, 12 PTZs got ONVIF autotracking setup (incl. the enable-Integration-Protocol gotcha), 5 analog cameras corrected from "hdcvi" (Dahua's tech) to Turbo HD (HD-TVI) over coax, 2 miscategorized types fixed (DS-2CD2385G1-I → turret, DS-2CD2443G2-I(W) → box), solar camera got battery-drain warning

- **Fabricated RTSP/configs removed** from 13 more cameras: Aqara G3/G5 Pro (HomeKit/Matter only), Zebronics, Wyze battery & floodlight cameras (docker-wyze-bridge notes), Yale (cloud-only), ABUS battery model
- **22 duplicate camera files removed**: Axis, Arlo, Dahua, Google Nest, Hikvision, Reolink, Uniview, Tapo, ADT, CP Plus, Somfy duplicates consolidated with markets merged
- **Night vision corrections**: Axis P5655-E (has OptimizedIR), Hikvision DS-2CD2025FWD-I ("-I" suffix = EXIR 30m)
- **9 cameras** missing `power_source` field populated (Arlo, Eufy, Ring)
- **IK vandal ratings** moved out of `ip_rating` field into features (9 cameras)
- **12 cameras** with empty connectivity fixed (4G/WiFi derived from model specs)
- **22 enterprise cameras** had redundant `http` protocol removed
- **15 cameras** with megapixel/resolution mismatches corrected
- **Doorbell detect configs** flipped to portrait for UniFi G4 Doorbell/Pro
- **Cathexis cameras**: RTSP added (ONVIF implies RTSP)
- Thermal Axis cameras: corrected megapixels (0.3MP/0.08MP LWIR sensors)

### Changed

- Database now covers **1,314 cameras** across **67 brands**

---

## [1.4.0] — 2026-06-11

### Added

- **`doorbell` type** in schema — 44 doorbells migrated from `covert` to proper `doorbell` type, enabling correct filtering
- **`status` field** in schema — supports `available`, `announced`, `discontinued`; 2026 Reolink CES doorbells marked `announced`
- **`video` field** in schema — structured codecs, max FPS, and per-stream breakdown (populated with real datasheet data for 12 Reolink cameras)
- **Real video/power specs** for Reolink RLC-823A, RLC-810A, RLC-811A, RLC-812A, RLC-830A, RLC-833A, RLC-510A, RLC-520A, RLC-1210A, CX410, P430, Argus 3 Pro

### Fixed

- **Ring Doorbell 4**: consolidated 6 regional duplicate entries into 1 with `markets[]` field — same hardware was padding camera count
- **Reolink Doorbell WiFi**: protocols corrected to RTSP/ONVIF (was HTTP-only), power corrected to hardwired 12-24VAC (was wrongly listed as battery), NVR-compatible set true, full doorbell-specific configs added (go2rtc two-way audio, Visitor button-press event)
- **Reolink Doorbell PoE**: config upgraded with go2rtc opus talk-back setup and button-press event documentation
- **Amcrest AD410/AD410P**: added RTSP/ONVIF protocols (Dahua protocol), full Frigate/HA/Blue Iris configs with doorbell button-press events
- **Eufy E340/S330/Dual doorbells**: added RTSP protocol, Frigate configs with Eufy-specific RTSP enable instructions
- **Lorex B862AJ**: added RTSP/ONVIF (Dahua protocol), full configs
- **Tapo D230S1**: deleted duplicate file, removed fabricated RTSP config (hub-based, no RTSP/ONVIF), added hub requirement note
- **Tapo D235**: added RTSP/ONVIF protocols with Always-On mode caveat
- **Tapo D225**: config updated with Always-On mode requirement for RTSP
- **Wyze Doorbell Pro & v2**: removed fabricated RTSP protocol and configs (no official RTSP), replaced with honest docker-wyze-bridge note
- **EZVIZ DB2/DB2C**: honest config — cloud-only, no RTSP, not Frigate-compatible
- Removed fabricated configs from all battery/hub doorbells that inherited brand RTSP rules

### Changed

- Database now covers **1,324 cameras** across **66 brands** (down from 1,330 after deduplication)
- Form factors now 10: bullet, dome, turret, PTZ, dual-lens, panoramic, covert, box, fisheye, **doorbell**

---

## [1.3.0] — 2026-06-11

### Added

- **Major frontend overhaul** with 15 UI improvements:
  - Side-by-side camera compare (select 2-4 cameras with checkboxes)
  - Export filtered view as CSV or JSON
  - Active filter chips with click-to-remove
  - Keyboard shortcuts: `/` search, `Esc` close, `←`/`→` pages
  - Light/dark mode toggle (persists in localStorage)
  - Sticky table header
  - Resolution color coding (blue 4K+, green 4-5MP, muted 1080p)
  - URL state persistence (shareable filter links via hash)
  - Config coverage stat in stats bar (clickable)
  - Frigate compatibility checkbox filter
  - CFG badge next to model name for cameras with configs
  - Integration configs shown in detail drawer (Frigate/HA/Blue Iris)
- **Advanced filtering**:
  - Multi-select dropdowns for Brand, Type, and Power (pick multiple values)
  - Filter counts in all dropdowns (e.g. "Reolink (133)")
  - Price range slider with max price filter
  - Reset all filters button

---

## [1.2.1] — 2026-06-11

### Added

- **Blue Iris camera profiles** for 1,053 cameras across 48 brands — correct profile names (Hikvision, Dahua, Axis, Reolink, etc.) and setup notes

---

## [1.2.0] — 2026-06-11

### Added

- **Integration configs for 1,052 cameras** — Frigate RTSP URL templates and detect settings, Home Assistant integration info across 48 brands
- **Camera configs framework** — new `configs` field in schema supporting Frigate, Home Assistant, and Blue Iris
- **`configs/` directory** with templates and seed configs for community contributions
- **GitHub issue template** for submitting camera configs via web form
- **Power Source column** in frontend — new filterable column with badges (PoE, DC, USB, Battery, Solar, AC)
- **CFG badge** next to model name in table for cameras with integration configs
- **Integration Configs section** in camera detail drawer — shows Frigate YAML snippets and HA setup notes

### Changed

- **Connectivity/Power split** — `connectivity` now only covers network types (WiFi, Ethernet, 4G, Coax); power moved to new `power_source` field across all 1,330 cameras
- **Power filter dropdown** added to frontend controls
- Updated CONTRIBUTING.md with config contribution guide

---

## [1.1.0] — 2026-06-11

### Added

- **2 new brands**: ACTi (14 cameras — IP + analog, NDAA compliant), LaView (6 cameras — consumer WiFi/solar/4G)
- **15 new Reolink models**: CX410, TrackMix PoE, TrackMix WiFi, E1 Pro, E1 Outdoor, E1 Outdoor Pro, Argus Eco Ultra, P430, P830, RLC-410S, RLC-810WA, RLC-811WA, TrackMix LTE Plus, Elite WiFi, Duo 2 Battery
- **10 new Ubiquiti models**: G4 Dome Mini, G4 Doorbell, G5 Dome, G5 Dome Ultra, G5 Bullet, G5 Pro, G5 Turret, AI Pro, AI Pro White, AI DSLR
- **1 new Ubiquiti model**: G6 PTZ (replacing incorrect duplicate G5 PTZ entry)
- Database now covers **1,330 cameras** across **67 brands**

### Fixed

- Reolink E1: removed incorrect RTSP protocol listing (E1 does not support RTSP)
- Ubiquiti G5 PTZ: removed duplicate entry with wrong 8MP specs (actual G5 PTZ is 4MP)
- Removed 8 duplicate Ubiquiti camera files (unifi-* prefixed duplicates)

---

## 1.0.0

### Added

- **15 new brands** (163 cameras): Pelco, Tiandy, Milesight, GeoVision, FLIR, Kedacom, Sunell, TVT Digital, Hi-Focus, Cathexis, Costar, Secureye, Luma, Camius, March Networks
- **133 additional models** for existing brands: Hikvision (+12), Dahua (+10), Axis (+10), Hanwha (+9), Eufy (+10), Arlo (+8), Ring (+9), Tapo (+8), Amcrest (+8), Annke (+8), Ubiquiti (+7), Wyze (+7), Blink (+7), Lorex (+8), Swann (+7), Google Nest (+5)
- Database now covers **1,296 cameras** across **64 brands**
- New segments: thermal imaging (FLIR), African enterprise (Cathexis), Indian manufacturing (Hi-Focus, Secureye), retail/banking enterprise (March Networks), custom integrator (Luma)

---

## [0.1.0] — 2026-06-05

### Added

- Initial public release
- **1,000 cameras** across **49 brands**
- Coverage spans consumer (budget WiFi) through enterprise (PTZ, thermal, NDAA-compliant)
- **49 brands** including Hikvision (139), Reolink (121), Dahua (101), Hanwha (62), Axis (58), Tapo (56), and 43 more
- Market-specific entries tagged with `markets[]` for EU, UK, DE, AT, CH, IN, US, AU, CA, AE, SA, MENA, VN, JP, KR, AR, BR, LATAM, and others
- `data/cameras.json` — full dataset as a single JSON array
- `data/cameras.csv` — flattened spreadsheet-friendly export
- `schema/camera.schema.json` — JSON Schema (draft-07) with full field definitions
- `scripts/build.js` — validation + aggregation pipeline
- `scripts/add-camera.js` — interactive CLI wizard for adding cameras without writing JSON manually
- `scripts/gen-docs.js` — per-camera markdown docs under `docs/`
- GitHub Actions CI: validates all JSON and checks generated files are not stale on every push and PR
- GitHub issue templates for camera submissions and corrections (web form, no clone required)
- `docs/glossary.md` — plain-English definitions for PoE, ONVIF, RTSP, WDR, IP ratings, etc.

### Data sources

Specifications sourced from manufacturer datasheets, official product pages, and reputable retailers. Each entry includes a `sources` array with verification URLs.

### Built with

Assembled with the help of [Claude Code](https://claude.ai/code). All specs are sourced from manufacturer datasheets and retailer listings — see each entry's `sources` field.
