# Changelog

All notable changes to this dataset are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

---

## [1.32.0] — 2026-07-07

**Hikvision full-catalogue sweep** — the remaining **97 models** from the datasheet mirror (diffed 228 camera datasheets against the dataset; 3 `_T` regional-duplicate datasheets skipped). Every model verified against its official Hikvision datasheet (PDF extraction with printed-title verification). Net: **2,004 -> 2,101 cameras** (71 brands unchanged) — the dataset passes **2,100 cameras**.

### Added — Hikvision (97)
- **Motorized-varifocal (IZS/LIZS) bullets, domes & turrets (2CD26xx/27xx/28xx, 2CD2Hxx):** AcuSense DarkFighter + ColorVu Smart Hybrid Light, 2/4/6/8 MP — incl. G3 `LIZS2UY/SLRB` red/blue-flashing deterrence and `IPTRZS2U` PTRZ (pan/tilt/rotate/zoom) reposition models.
- **Fixed bullets (2CD2T-series):** `-2I/4I` long-range IR (to 80 m), ColorVu/Smart-Hybrid `-LI`/`-LISU/SL`/`G3-LIS2UY/SLRB`, and active-deterrence `-ISU/SL`, `-IS2U/SLRB`.
- **DS-2DE PTZ speed domes & mini-PTZ (17):** 4x-32x optical zoom, IR to 200 m, incl. WiFi mini-PTZ variants.
- **Dual-lens 180deg panoramic (2CD2T4xG2P / 2T87G2P):** stitched-image ColorVu with strobe/audible deterrence.
- **DeepinView fisheye (2CD6365/63C5/6W65 — 6/12 MP)** and standard fisheye (`2CD2955G0-ISU`).
- **DS-2CV WiFi & indoor cubes (2CV20xx/21xx/2Q21, 2CD2E/2D25):** WiFi and DC-only indoor models.
- **1-series 2/4 MP (2CD1023/1027/1043):** ColorVu / AcuSense / Smart Hybrid Light fixed bullets.

### Notes
- `2I/4I` = selectable IR-range variants (not multi-sensor); some `G2H` SKUs list IR-only supplement light despite the suffix; PTZ optical zoom recorded in `features` (the schema `lens` object has no zoom field). WiFi models carry `connectivity: ["wifi","ethernet"]`; region/packaging suffixes folded into base models.

## [1.31.0] — 2026-07-07

Large **Hikvision** catalogue expansion — **97 new models** across the 2CD1 / 2CD2 / 2CD3 / 2CD7 families (AcuSense, ColorVu, Smart Hybrid Light, DeepinView, active-deterrence and indoor-cube lines), plus a Reolink Home Hub data-quality fix. Every model was verified against official Hikvision datasheets (PDF extraction with printed-title verification). Net: **1,907 -> 2,004 cameras** (71 brands unchanged) — the dataset passes **2,000 cameras**.

### Added — Hikvision (97)

**Initial AcuSense/ColorVu/DeepinView batch (13):** DS-2CD2046G2-IU/SL, DS-2CD2066G2-IU/SL, DS-2CD2166G2-I(SU), DS-2CD2566G2-I(S), DS-2CD2686G2-IZS, DS-2CD23166G3-I(2U)Y (16MP DarkFighter turret, 4608x3456), DS-2CD3056G2-IS, DS-2CD3086G2-IS, DS-2CD3156G2-IS(U), DS-2CD3386G2-IS(U), DS-2CD3746G2-IZS, DS-2CD3766G2T-IZS(Y), iDS-2CD7A46G0/P-IZHS(Y) (DeepinView ANPR).

**1-series budget line (26)** — fixed-lens ColorVu/AcuSense/Smart Hybrid Light + motorized-varifocal IZS:
- Bullets: DS-2CD1047G0-LUF, DS-2CD1047G2H-LIUF, DS-2CD1067G2H-LIUF, DS-2CD1T27G0-LUF-C.
- Domes: DS-2CD1127G0-LUF-D, DS-2CD1123G2-I, DS-2CD1123G2-LIUF, DS-2CD1127G2H-LIUF, DS-2CD1143G2-I, DS-2CD1143G2-IUF, DS-2CD1143G2-LIUF, DS-2CD1147G0-LUF-D, DS-2CD1147G2H-LIUF, DS-2CD1167G2H-LIUF.
- Turrets: DS-2CD1323G2-IUF, DS-2CD1323G2-LIUF, DS-2CD1327G2H-LIUF, DS-2CD1343G2-IUF, DS-2CD1343G2-LIUF, DS-2CD1347G2H-LIUF, DS-2CD1367G2H-LIUF.
- Motorized varifocal IZS: DS-2CD1623G2-IZS, DS-2CD1643G2-IZS, DS-2CD1723G2-IZS, DS-2CD1743G2-IZS, DS-2CD1H43G2-IZS.

**2-series 2CD20xx/21xx (32):**
- Bullets: DS-2CD2047G2H-LIU/SL, DS-2CD2047G2H-LIU, DS-2CD2046G2H-IU, DS-2CD2046G2H-I2U/SLRB, DS-2CD2046G2-IU, DS-2CD2043G2-LI2U, DS-2CD2043G2-L, DS-2CD2043G2-IU, DS-2CD2047G3-LI2UY/SLRB, DS-2CD2026G2-IU, DS-2CD2021G1-I, DS-2CD2067G2H-LIU/SL, DS-2CD2086G2-IU/SL, DS-2CD2086G2-IU, DS-2CD2083G2-IU, DS-2CD2086G2H-IU, DS-2CD2087G2H-LIU, DS-2CD2087G3-LI2UY/SLRB.
- Domes: DS-2CD2123G2-IS, DS-2CD2125G0-IMS, DS-2CD2126G2-I, DS-2CD2126G2-ISU, DS-2CD2146G2H-ISU, DS-2CD2147G2-SU, DS-2CD2147G2H-LISU, DS-2CD2147G3-LIS2UY, DS-2CD2167G2H-LISU, DS-2CD2183G2-IS, DS-2CD2186G2-ISU, DS-2CD2186G2H-ISU, DS-2CD2187G2-LSU, DS-2CD2187G2H-LISU.

**2CD23xx turrets + panoramic (9):** DS-2CD2323G2-IU, DS-2CD2326G2-IU, DS-2CD2327G2-LU, DS-2CD2343G2-IU, DS-2CD2346G2H-IU, DS-2CD2346G2-ISU/SL, DS-2CD2346G2H-IS2U/SLRB, DS-2CD2345G0P-I (180deg panoramic-fisheye), DS-2CD2347G2P-LSU/SL (dual-lens 180deg panoramic).

**2CD236x/238x turrets, 24xx indoor cubes, 25xx mini-domes (17):**
- Turrets: DS-2CD2347G3-LIS2UY/SLRB, DS-2CD2367G2H-LIU, DS-2CD2383G2-IU, DS-2CD2386G2H-IS2U/SLRB, DS-2CD2386G2H-IU, DS-2CD2387G2H-LISU/SL, DS-2CD2387G3-LIS2UY/SLRB.
- Indoor cubes (box): DS-2CD2421G0-IDW (WiFi, DC-only), DS-2CD2423G2-I, DS-2CD2423G2-IW (WiFi), DS-2CD2443G2-I, DS-2CD2446G2-I, DS-2CD2483G2-I (H.265-only).
- Mini-domes: DS-2CD2523G2-IS, DS-2CD2546G2-IWS (WiFi), DS-2CD2547G2-LS (ColorVu), DS-2CD2583G2-IS.

### Fixed
- **Reolink Home Hub** — removed `rtsp`/`rtmp` from `protocols` (they describe re-streaming the hub's *managed* cameras, not a stream of the hub itself, which has no image sensor); the relay capability is now documented in `features`. Clears a spurious "rtsp without NVR configs" data-quality flag.

### Notes
- Naming decoded: `L*`=ColorVu white-light, `I`=AcuSense IR, `U`=built-in mic, `F`=microSD, `Z`=motorized varifocal, `G2H`/`G3`=ColorVu Smart Hybrid Light (F1.0; G3 adds HikAI-ISP), `/SL` and `SLRB`=strobe + audible active deterrence (SLRB adds red/blue flashing) with two-way audio. Indoor cubes typed `box` (no IP rating); WiFi models carry `connectivity: ["wifi","ethernet"]`. Region/packaging suffixes (`-C`/`-D`/`-eF`) and `_T` regional datasheets were folded into base models rather than duplicated.

## [1.30.0] — 2026-07-06

Reolink battery/solar/4G verification pass against official reolink.com pages. Net: **1,901 → 1,907 cameras** (71 brands unchanged). Most linked URLs were already present; six were genuinely new. All are app-only (no RTSP/ONVIF), so no NVR configs are emitted.

### Added
- **Reolink Altas** — 2K WiFi 6 battery bullet (20000mAh), ColorX color night vision.
- **Reolink Go PT S Lite** — 2K 4G LTE battery pan-tilt with auto-tracking.
- **Reolink Altas Go PT** — 2K 4G LTE solar pan-tilt (20000mAh), ColorX.
- **Reolink Talon Pro** — 4K 4G LTE cellular trail camera (Camovue line) with GPS.
- **Reolink Go Ranger PT** — 4K 4G LTE battery pan-tilt trail/wildlife cam with species recognition.
- **Reolink TrackMix LTE C** — 4K 4G dual-lens battery variant of the TrackMix LTE (6x hybrid zoom).

### Notes
- Verified ~15 existing battery/solar models (Argus/Go/Altas/TrackMix families) — all correct, no changes. The `reolink-trackmix` and `reolink-duo` base URLs resolve to the already-listed TrackMix WiFi and Duo 2.

## [1.29.0] — 2026-07-06

Reolink verification pass against official reolink.com pages, plus a Camius correction. Net: **1,896 → 1,901 cameras** (71 brands unchanged).

### Added
- **Reolink E1 Outdoor SE PoE** — 8MP 4K PoE pan-tilt with auto-tracking.
- **Reolink Lumus Pro** — 8MP 4K WiFi spotlight bullet (F1.6).
- **Reolink CX410W** — 4MP ColorX WiFi bullet (1/1.8" sensor, F1.0), WiFi variant of the CX410.
- **Reolink FE-W** — 6MP WiFi 360° fisheye, WiFi sibling of the FE-P.
- **Reolink Duo Floodlight WiFi** — 8MP dual-lens 180° floodlight cam, WiFi variant of the Duo Floodlight PoE.

### Changed
- **Camius IRIS528R** — relabelled the generic "Iris 5MP" entry with its real model number and turret form factor (verified 2K/5MP specs); "Iris 5MP" kept as an alias. The web frontend 301-redirects the old ghost `/camera/camius-triton/` URL here.
- **Reolink CX820** and **RLC-840A** corrected dome → **turret**; **RLC-1224A** and **RLC-510WA** corrected dome → **bullet** (per official product pages).
- **Reolink Lumus** — filled in missing resolution (4MP / 2560×1440).

## [1.28.0] — 2026-07-06

Major data-quality audit of **48 previously-unaudited small/mid brands**, removal of fabricated data, and large expansions of Dahua, Hikvision and HiLook — plus one new brand and one rebuilt brand. Net: **1,900 → 1,896 cameras**, **75 → 71 brands**.

### Audit — 48 small/mid brands verified against official manufacturer sources

- Verified every model of 48 brands (VIGI, Lorex, Ubiquiti, Blink, Wyze, GeoVision, Swann, Milesight, Vivotek, Pelco, Google Nest, HiLook, Uniview, Tiandy, Lupus, TVT, Synology, FLIR, Mobotix, Yale, Luma, Intelbras, Netatmo, March Networks, LaView, Camius, Hive, Qubo, Godrej, ADT, Verkada, Steinel, Somfy, IDIS, i-PRO, Aqara, Bosch Smart Home, Kasa, Honeywell, SimpliSafe, and more).
- **Removed 143 entries:** 55+ fabricated "ghost" model numbers (real product families with invented model codes that 404 on the manufacturer site), Swann NVR kits + Turbo-HD analog cams that were out of the IP-camera scope, and regional/color duplicates.
- **6 brands were found to be entirely fabricated and removed:** Sunell, Zebronics, Cathexis (a VMS-only software vendor that makes no cameras), Secureye, KBVision — and Hi-Focus (later rebuilt from real models, see below).
- Corrected dozens of form-factor `type` and `megapixels` values; replaced bare-homepage sources with verified product/spec URLs; stamped `last_verified` on every surviving entry.

### Brand rebuilds & additions

- **Bosch — audited all 160 entries** against boschsecurity.com: removed 6 fabricated ghosts (nonexistent `NMM-7703`/`NUE-3703-AL`/`NBE-7703-AL`/`NDE-7703-AL` SKUs, and a `VG4-A-PSU0` entry that is actually a *power supply*, not a camera) + 1 mounting-variant duplicate, fixed 7 form-factor types (multi-imager NDM/NMM → panoramic, F360 → panoramic, mislabelled DINION bullets typed as AUTODOME PTZ) and 3 megapixel values, corrected 5 wrong model names, reclassified 1 legacy analog MIC 550, added the missing Blue Iris profile to 134 entries, and stamped every survivor.

- **Hikvision — audited the 135 previously-unaudited entries** against hikvision.com: removed 9 ghosts (nonexistent model numbers — e.g. the fictitious `DS-2CD2N` line, a box camera with an impossible IR suffix, ColorVu SKUs missing their mandatory `L` suffix) and 10 region-tagged duplicates, fixed 3 form-factor types + 2 TandemVu megapixel values, converted 4 mislabelled analog Turbo-HD entries to `connectivity: coax`, corrected 1 typo'd model number, and stamped every survivor.


- **Hi-Focus rebuilt (0 → 60)** from real `hifocuscctv.com` models — current PTZ/dome/turret/bullet, Wi-Fi/4G, and discontinued IP lines, with OEM origin noted per model (Dahua / Uniview) and matching RTSP configs.
- **New brand — NetCamCenter (2):** `NDM-7702-A` / `NDM-7703-AL`, Bosch FLEXIDOME multi 7000i OEM multi-imager panoramic domes.
- **Dahua +22:** WizSense Starlight / Smart Dual Light, WizMind AI (incl. 12MP Ultra), WizColor, and dual-sensor TiOC panoramic PTZs.
- **Hikvision +32:** ColorVu Gen2 / ColorVu 3.0 / Smart Hybrid Light turrets, bullets and domes (incl. dual-head 180° panoramic), and AcuSense DarkFighter / TandemVu / PanoVu IP PTZ speed domes.
- **HiLook +11:** PTZ-N2C mini-PT and PTZ-N2D TandemVu dual-lens PT cameras, IPC value-line dome/turret, and ColorVu 3.0 active-deterrence HAA-LU models.

### Spot-check fixes

- Filled Speco `O12B1M` missing resolution (4000×3000) and corrected Tapo `C110` type (fixed cube → `box`). Reolink regional variants (Argus 3 Pro AU, Argus 4 Pro AT) were kept intentionally — they receive direct regional traffic.

### Scope — analog Turbo HD (opt-in)

- Added **Hikvision Turbo HD analog cameras** (`connectivity: coax`, 4-in-1 switchable TVI/AHD/CVI/CVBS, no ONVIF/RTSP): DS-2AE PTZ speed domes and DS-2CE Smart-Hybrid dual-light / EXIR / ultra-low-light bullets, turrets and box cameras. Each is flagged "NOT an IP camera" in features. This deliberately extends the dataset beyond IP-only per an explicit scope decision.

---

## [1.27.0] — 2026-07-05

Full data-quality audits + expansions of the **ABUS** (76 → 85) and **SV3C** (13 → 17) brands. Net: **1,887 → 1,900 cameras**.

### ABUS — audit + expansion (76 → 85)

- **Audited all 76 existing entries** against official `abus.com` / `security.abus.com` sources — **zero ghosts** (ABUS data was high quality). Stamped every entry with `last_verified`, replaced 5 bare-homepage sources with official product pages, and added the missing `configs.blue_iris` profile (ABUS Performance Line = Hikvision OEM) across the IP entries.
- **Type fixes:** `IPCA54581B` (thermal bi-spectral) → dual-lens; `IPCS54611A` → dome; `PPIC46520` (WLAN floodlight cam) → floodlight.
- **Spec corrections:** PPIC Wi-Fi cams confirmed app-only (App2Cam Plus, no ONVIF/RTSP); `TVIP42562`/`62562` corrected to WLAN (Wi-Fi + 12VDC, not PoE); `PPIC46520` 2MP not 3MP; IK10 added to the vandal-rated TVIP/IPCB tube & dome models. Merged the `PPIC42520 (Austria)` regional duplicate.
- **Added 10 new models** from official pages: IP Mini Tube WL bullets (`IPCS34511A/B`), IR mini-tubes (`IPCB64510A/B/C`), motorized tube `IPCB64620`, 4K fixed tube `IPCB68515A`, 12MP fisheye `IPCS24500`, 3MP indoor fisheye `TVIP83900`, and the Akku-Kamera Pro add-on battery cam `PPIC91520`.
- Flagged (kept, not removed): the 5 **analog-HD** entries (`HDCC*`/`TVCC*`) and 2 proprietary EasyLook accessories (`PPDF*`) fall outside the IP-camera scope but were retained pending a scope decision.

### SV3C — audit + expansion (13 → 17)

- **Audited all 13 existing entries** against official `sv3c.com` pages — **zero ghosts**. Stamped every entry with `last_verified` and completed the `configs` (added `home_assistant`). Corrected the outdated "no ONVIF" assumption: several newer models (`SV-B04POE`, `SV-B08POE`, `SV-D08POE`, `C12`, the 1080p WiFi PTZ) are **ONVIF-conformant** — added `onvif` to their protocols.
- **Spec fixes:** the **2K Solar Dual-Lens** kit is app-only (battery/hub, no ONVIF/RTSP) → `protocols: ["http"]`; `C12` re-sourced to its `sv3c.com` page and its zoom corrected (marketed "15X" = 10X optical + 5X digital, 5-50mm varifocal).
- **Added 4 new models:** `HX03` (4K WiFi floodlight bullet), `C22-4K` (4K WiFi PTZ dome), `SD7POE-5MP-HX` (5MP/8MP PoE PTZ, 36X optical), `B06W` (1080p WiFi bullet, ONVIF 2.4).

---

## [1.26.0] — 2026-07-05

Five new brands plus **IMOU**, **Speco Technologies**, **Ajax**, **Canon**, **Arecont/Costar** and **CP Plus** audits + expansions. Net: **1,728 → 1,887 cameras**, **69 → 75 brands**.

### CP Plus — audit + expansion (14 → 26)

- **Removed 6 fabricated ghosts:** `CP-UNC-BA41PL3`, `CP-UNC-BA81L3-S2` (`BA` isn't a CP Plus prefix), `CP-UNC-DA41L3S2-LQ`, `CP-UNC-DA41PL3C-D-LQ` (invented `S2`/`PL3C-D-LQ` codes, mis-typed turret — `DA`=dome), `CP-UNC-TA81PL3` (8MP economy `PL3` doesn't exist), `CP-UNC-WI41PL3` (`WI` isn't a CP-UNC prefix).
- **Fixed 3 ezyKam+ Wi-Fi cams** (`CP-E35Q`/`CP-E45Q`/`CP-Z43Q`) — corrected from a wrong Dahua-RTSP config to **app-only Wi-Fi** (P2P/cloud, no ONVIF/RTSP; `connectivity: wifi`, USB power). Re-sourced + stamped 4 real UNC IP cameras.
- **Added 19 real CP-UNC IP cameras** from `cpplusworld.com` (Dahua-OEM ONVIF S/G/T): box/dome/bullet/fisheye across 2/4/5/6/8MP, `Q`=IR-only vs `LQ`=dual-light (full-color), `ZL`=motorized varifocal.

### Added — Canon (2 → 4)

- Two indoor PTZ dome cameras (**VB-M46** 1.3MP, **VB-H47** 2MP/Full HD) from official Canon datasheets — 20x optical zoom, day/night IR-cut low-light, ONVIF S/G/T, PoE/DC/AC.

### Costar / Arecont Vision — ConteraIP audit + expansion (8 → 10)

- **Removed 8 fabricated/placeholder entries:** 4 ghosts with non-existent model codes (`CBR-2312IR`, `CBR-5312IR`, `CDI-2312IRV`, `CDI-5312IRV` — `CBR` isn't a Costar prefix; real Costar IP cameras use CBI/CDI-series numbering) and 4 generic bare-sourced placeholders (`ConteraIP Bullet 8MP` was itself a ghost — no 8MP single-sensor ConteraIP bullet exists; plus generic `Dome 5MP`/`Dome 8MP`/`Panoramic 12MP`).
- **Added 10 real Arecont Vision ConteraIP SKUs** from `sales.arecontvision.com`: Contera indoor/outdoor domes (AV02/AV05 CID/CLD; -200 varifocal / -201 fixed), 12MP fisheye (AV12CFE-250), MicroDome Duo dual-sensor (AV4956/AV10956/AV16956DN-28 = 2×1080p / 2×5MP / 2×8MP), and the discontinued 4-sensor panoramic AV12CPD-236.

### Added — Speco Technologies (new brand, 31 cameras)

US professional/commercial (NDAA) brand, all verified against official `specotech.com` datasheets + reputable retailers:
- **O-series** turrets/domes/bullets (O4T9, O4VT2, O4TDD2, O4D9/M, O4B9M, O8D9/M, O8B9/M, O8VD3, O8VT3), **Flexible Intensifier** line (O8FD1/M, O8FB1/M, O8FT1/M), **White-Light Intensifier** (O8VLT1, O8KT1/B), **PS professional PoE** (PS2M/3D/3E/7F/8D/70F), **multi-sensor panoramics** (O8FBMS1, O4FDMS1, O8LMST1, O84S), LPR box (O4BXLP1M), 25x PTZ (O4P25X2), 12MP fisheye/bullet (O12MDP4, O12B1M), and a video doorbell (O2DB1).
- Of the 10 pre-existing entries, 8 were spec-correct; 2 fixed (**O4BXLP1M** night vision `ir → color`, it is a white-light LPR camera; **O8VT3** power `poe → poe+dc`). Speco does not publish RTSP paths, so `configs` use ONVIF auto-discovery (`verified: false`).

### Ajax — wired-camera audit + expansion (2 → 22)

- **Removed 2 fabricated ghosts:** `OutdoorCam` (no such product; `/products/outdoorcam/` 404s) and `DualCam` (no Ajax "DualCam" exists; the only real referent is the single-camera DoorBell).
- **Added 22 verified wired PoE cameras** from official `ajax.systems` spec pages: DomeCam Mini (×4) + Mini HL (×3), DomeCam HLVF (×2), BulletCam HL (×4), TurretCam (×4), Superior BulletCam/DomeCam HLVF (×4), and the DoorBell (ADB.Y.W). All ONVIF (Profile S / S+T); Ajax doesn't publish RTSP paths so configs use ONVIF auto-discovery.

### Added — 5 new brands (51 cameras)

### Added — 5 new brands (51 cameras)

- **Foscam** (22) — consumer WiFi/PoE line (C/D/G/PD/R/SD/T/V/W/X series), verified against `us.foscam.com`/`foscam.com` product pages.
- **INSTAR** (12) — privacy-first German prosumer PT/box cams (IN-8xxx/9xxx), verified against `wiki.instar.com`.
- **LTS** (7) — US prosumer/installer line (Platinum + Pro-X); Pro-X OEM origin flagged as unconfirmed.
- **Uniarch** (6) — Uniview's budget NDAA sub-brand (IPC-B/T1xx, UHO).
- **Longse** (4) — CN OEM/budget bullets/domes.

All honestly caveated: `verified: false` + notes wherever an RTSP path or ONVIF support is not confirmed.

### IMOU — full brand audit + expansion (15 → 56)

- **Audited the 15 legacy entries** (all cited bare `imoulife.com` homepages): **3 ghosts removed** (`Go Basic` = cross-brand/Reolink naming; `Turret PoE 8MP` = no such 8MP Imou turret; `Doorbell 2MP`/`IPC-B46LP` = mislabeled Cell 2 bullet), **3 regional duplicates merged** into their canonicals (`Cruiser 2 MENA`, `Ranger S2 MENA`, `Ranger 2 VN`), and **8 fixed** for fabricated model codes / wrong specs (e.g. `Cruiser 2` code `IPC-S7XEP…`→`IPC-GS7EP-5M0WE`; `Ranger S2` code →`IPC-DK2-3H1W`; `Bullet 2E` code →`IPC-K3DP-5H0WF`; `Cell Go` 4MP/4G→3MP/WiFi; `Cruiser SE+` bullet→PTZ).
- **Added 47 verified models** from official `imou.com` pages: the battery Cell/AOV line (Cell 2/3/3C, Cell PT/2C/4G, AOV PT/Dual — `protocols: ["http"]`, no fabricated RTSP), and the wired Cruiser (Dual/Triple/Pano-Z/Z/SC/2C/4G), Bullet (2 Pro/2C/2E/3/3C), PS professional PoE (PS2M/3D/3E/7F/8D/70F), Titan Pro, DK3/DK7, Knight and Versa lines (Dahua `realmonitor` RTSP + ONVIF, `verified: false`).
- **3 deferred** (specs genuinely unpublished): `Bullet 3 Pro`, `PS5E`, `PS8E` (Imou's own spec tabs render "To be announced").

---

## [1.25.0] — 2026-07-05

Full data-quality audit of the **Kedacom** brand (master audit #28) — a **replace-the-whole-brand** case. Net: **12 → 58 cameras** (all 12 removed, 58 real models added, all verified against official `kedacom.com` product pages).

### Removed — 12 fabricated ghosts (the entire prior set)

The existing 12 entries were a made-up 4×3 grid of invented model numbers (`IPC21xx`=dome / `IPC23xx`=bullet / `IPC25xx`=box / `IPC28xx`=PTZ, 3rd digit = megapixels) with a `-HN-S`/`-HN-B`/`-HN-X`/`-HN-PZ30` naming scheme that **is not Kedacom's**. None of the 12 model numbers exist on kedacom.com, and they contradicted real products (the real `IPC2151` is a 1.3MP bullet, not a 2MP dome; Kedacom PTZ is the `IPC42x/44x` family, not `IPC28xx`; real box cameras are `IPC14x`, not `IPC25xx`). Homepage-only sourcing, no `last_verified`, templated specs — a coherent fabricated cluster.

### Added — 58 real, verified Kedacom models

Extracted field-by-field from official kedacom.com product pages across the full catalogue:
- **Semi-domes** (IPC21xx–IPC28xx FN/HN/AN/EN/DN series, LC2110) — ~33 real models: fixed + motorized-varifocal, IR / full-color / Smart Dual Light, 1.3MP–8MP, incl. the `IPC2533-FN-SIR50` 5MP and `IPC2833-FN-SIR50` 4K.
- **Bullets** — `IPC2251-HN` (2MP), `IPC2552-FN` (5MP), `IPC2852-FN` (4K), `IPC2452-HN-PIR` + `IPC2252-HN-PIR` (PIR), `IPC2252-FN-DIR` (Starlight), `IPC2151-AN/BN`, `LC2150-AN` (1.3MP).
- **Box** — `IPC143-HN` (4MP C/CS-mount).
- **PTZ speed domes** — `IPC425-F223/F233/G223-N` (23x/33x, IR 220m, human auto-tracking).
- **Face-capture / recognitive line** (tzfxsxj/rykksxj categories) — 9 models: `IPC2655-Gi7N/Gi4N`, `IPC2855-Gi4N`, `IPC2451-Fi4N`, `IPC442-i405-NP` recognitive PTZ, and `IPC121/123-Ei7N/Fi4N` recognitive boxes (face intelligence exposure, best-shot capture — visible-spectrum, not thermal).

All entries: correct Kedacom RTSP path (`rtsp://…:554/id=0`), ONVIF, complete Frigate/HA/Blue-Iris configs (`verified: false`), `["global"]` markets, `last_verified: 2026-07-04`.

---

## [1.24.0] — 2026-07-05

Full data-quality audit of the **Dahua** brand (master audit #28) — the largest single-brand audit yet: all 155 stored entries verified against official `dahuasecurity.com` product pages and datasheets. Dahua is a legitimate ONVIF/RTSP enterprise brand, so unlike the consumer brands the problem was **fabricated/typo'd model numbers and spec drift**, not fake RTSP. Net: **155 → 134 cameras** (20 removed, 23 re-keyed/renamed to their real SKUs, ~50 corrected). (Stacks on the v1.23.0 5-brand audit.)

### Removed — 20

- **10 ghosts** (model strings that return no official product): `IPC-HDW2831T-AS-PV` / `IPC-HDW2849T1-AS-PV` / `IPC-HFW2849T1-AS-PV` (no 2-series 8MP TiOC "AS-PV" eyeball/bullet — that's the 3-series), `IPC-HDW5842T-ZE-LED` / `IPC-HDW5849T1-ZE-LED` (no varifocal full-color "-LED"), `IPC-HDW7842H-Z4-X` (HDW eyeball doesn't exist — it's the HFW bullet), `IPC-HFW3849E-AS-LED(-S2)` / `IPC-HFW3849E-ZAS-LED-S2` (no 8MP "E-AS-LED"), `IPC-PT8849-A180` (Dahua A180 panoramics are PFW/PDBW, not "PT").
- **10 duplicates**: the fabricated `IPC-HDW3849H-AS-PV` EU/MENA/UK market-split clones, the `IPC-HFW2849S-S-IL` MENA/VN clones, `IPC-PFW5849-A180` (a fabricated 4-sensor build of the real 2-sensor `-E2-ASTE`), plus four wrong-SKU strings that collapse onto entries we already have (`IPC-HDBW2849H-S-IL-S2`→`-E-S-IL`, `IPC-HDBW3849H-ZAS`→`R1-ZAS-PV`, `IPC-HFW5842H-Z4E`→`-Z4HE`, `SD49225XB-HNR`→`XA`).

### Re-keyed / renamed — 23 (real cameras under a fabricated SKU string)

The dataset was riddled with **invented model-number infixes**, each corrected to the real Dahua SKU with accurate datasheet specs:
- **`-H-S`→`-T-S`/`-TM-S`** eyeball group (2241/2441/2449/2849, incl. the India-market variant) — Dahua eyeballs are `-T-S`, not `-H-S`.
- **`-PROX`→`-PRO`**, **`S1`→`T1`**, **`-ZE-LED`/`E-ZAS`→ real**, **PTZ `XB`→`GB`** (`SD6C3432GB-HNR-A-PV1`), and the HDCVI re-keys `HAC-HFW2802E-LED`→**`HAC-HFW2802E-A`** (it's IR Starlight, not full-color) and the fake 8MP `HAC-HFW2849E-A-NI-LED`→ real **2MP `HAC-HFW2249E-A-LED`**.

### Fixed — ~50 cameras

`HDW`/`HAC-HDW` eyeballs mistyped `dome`→`turret`; inflated/wrong IR ranges (e.g. `SD6AL245XA` is 2MP/550m-laser not 4MP/300m-IR; several 3-series bullets 80m→50m); wrong sensor sizes (many 1/2.7"→1/1.8" on WizMind/full-color); a mistyped dual-lens eyeball (`HDW5449H-ASE-D2` dome→dual-lens); full-color LED warm-light range 30→15m; and **~70 placeholder/reseller `sources` replaced with official dahuasecurity.com product pages / datasheet PDFs**. `["global"]` markets + `last_verified: 2026-07-04` applied to all retained entries (regional SKUs keep their market tags).

## [1.23.0] — 2026-07-05

Parallel data-quality audit of **five brands** — **Avigilon, Amcrest, Ring, Arlo, Axis** (master audit #28, issues #37/#36/#35/#33/#31) — every camera verified against official manufacturer sources. Net across the release: **1,730 → 1,703 cameras** (39 removed, 4 re-keyed to real models, 8 Arlo legacy models added, ~129 corrected; brand count unchanged at 69).

### Added — 8 Arlo legacy models

Filling gaps in Arlo's back-catalog, each verified against official Arlo/NETGEAR sources: **Arlo Q** (VMC3040), **Arlo Q Plus** (VMC3040S, PoE), **Arlo (1st Gen)** (VMC3030, 720p), **Arlo Pro** (VMC4030, 720p), **Arlo Pro 2** (VMC4030P, 1080p), **Arlo Go** (VML4030, 4G LTE), **Arlo Essential (1st Gen)** (VMC2020), and the **Arlo Essential Video Doorbell Wired** (AVD1001, the only currently-available one; the rest are `discontinued`). All app/cloud-only (`http`), no bogus RTSP.

### Removed — 35 net (23 ghosts + 16 duplicates, minus 4 re-keys)

- **Amcrest** (24 → 16): worst offender (~46% fabricated). 8 ghost model numbers (`ip8m-2483ew/2496ew/2513ew/2556ew/2577ew` + the 3 re-keyed below), 3 duplicates (`ad410p`, `ip4m-1051b`, `ip5m-t1179ew`). 22/24 entries had cited only the bare `amcrest.com` homepage.
- **Arlo** (29 → 17): 5 ghosts (`security-light` = an LED light not a camera, `solar-panel-cam` = accessory, `pro-5s-4k-ultra`, `floodlight-camera-pro`, `essential-outdoor-3rd-gen`), 7 duplicates (the `pro-5s` au/ca/eu/uk regional cluster, `essential-xl-outdoor`, `pro-4-spotlight`, `wired-doorbell-2nd-gen`).
- **Avigilon** (24 → 18): 4 ghosts (the entire fabricated **H7A line** — no such series exists — plus a fake `h6sl-do-ir-mena` regional SKU), 2 duplicates (`h6a-bullet`, `h6a-do-canada`).
- **Axis** (66 → 61): 4 ghosts (`p5676-le-mkii`, `q3538-ve`, `m3106-ma-mk2`, `m5076`), 1 duplicate (`fa54-mini`).
- **Ring** (25 → 21): 2 ghosts (`alarm-security-cam-pro` = a base-station kit, `outdoor-cam-wired` re-keyed below), 3 duplicates (`indoor-cam-gen2` — its file was misnamed `alarm-outdoor-contact-sensor.json` — `indoor-cam-2nd-gen-uk`, `spotlight-cam-battery-gen2`).

### Re-keyed — 4 ghosts rebuilt as the real product they described

- **Amcrest**: `ip5m-t1190ew` → **IP5M-T1273EW-AI** (5MP NightColor turret); `ip8m-2837ew` → **IP8M-2899EW-AI** (4K 25x PTZ); `ip8m-vt2579ew` → **IP8M-VT2879EW-AI** (4K varifocal turret) — all with real datasheet specs + ONVIF/RTSP Frigate/HA/Blue-Iris configs (`verified: false`).
- **Ring**: `outdoor-cam-wired` → **Outdoor Cam Plus** (real 2024 Retinal-2K family, app/cloud-only).
- (Arlo "Ultimate" was verified **not** a real product — that ghost was deleted, not re-keyed.)

### Fixed — ~129 cameras corrected

- **Ring/Arlo**: confirmed **zero bogus RTSP/ONVIF** (correctly app/cloud-only). Ring Pro line "2K" → 1080p; doorbells retyped `dome` → `doorbell`; Video Doorbell 4 night vision `color` → `ir`; Arlo Go 2 gained its defining `4g` connectivity; several `color` → `ir` night-vision corrections.
- **Amcrest**: indoor pan/tilt cams (IP2M-841B, IP4M-1041W, IP4M-1051) mislabeled as outdoor bullets → corrected; PoE cams relabeled from fabricated "WiFi + spotlight + two-way" back to real PoE/IR specs.
- **Avigilon**: fabricated 24MP-4×6MP-360° multisensor → real 3×8MP/270°; fixed varifocal→fixed lenses; real SKUs restored.
- **Axis**: invented/stale resolutions corrected across the line (P3267 "4K" → 5MP, M3116 "12MP fisheye" → 4MP dome, M2025/M2035-LE "4MP" → 1080p, Q6315 "4MP" → 1080p, Q9307 retyped covert → dome, several P3245 "V/VE" false-IR removed).
- Bare-homepage/reseller `sources` replaced with official product/datasheet URLs brand-wide; `["global"]` markets + `last_verified: 2026-07-04` applied to all retained entries.

---

## [1.22.0] — 2026-07-04

Full data-quality audit of the **Eufy** (Anker) brand (master audit #28) — all 36 stored entries verified against official `eufy.com` product pages and Eufy's RTSP-support documentation, plus 19 missing models added from official sources (a full lineup-coverage pass across eufy.com's current + legacy catalog), then a second-pass re-verification of the doorbell line. Unlike the fabricated-spec brands, Eufy was padded mostly with **regional-listing duplicates**. Net: **36 → 46 cameras** (9 removed, 19 added). (Version stacks on the Hikvision v1.20.0 / Annke v1.21.0 work.)

### Removed

**9 entries**:

- **8 duplicates**: the `SoloCam S340` regional cluster (`-au`, `-ca`, `-ch`, `-eu` — spec-identical to `solocam-s340`, whose `["global"]` tag covers all regions), `solocam-s220-uk` (= `s220-solocam`), `floodlight-e340` (= `floodlight-cam-e340`, both the T8425), `homebase-s380-cam-s330` (= `eufycam-3c-2k`), and `eufycam-s330-pro` (= `eufycam-3-pro`, same SKU T88711W1).
- **1 ghost**: `homebase-3-s380-cam-e340` — no standalone battery "eufyCam E340 dual-lens" exists ("E340" belongs only to the Video Doorbell and Floodlight Cam).

### Added

10 current models that were missing from the dataset, each verified against official eufy.com pages:

- **eufyCam S3 Pro** — 2024 flagship: 4K MaxColor Vision full-color, radar + PIR, battery/solar, HomeKit Secure Video; RTSP-capable via HomeBase 3.
- **eufyCam S4** — 2025 first wireless 3-lens hybrid (fixed 4K bullet + dual 2K PTZ, 8x zoom, bullet-to-PTZ tracking).
- **SoloCam E30** — 360° pan/tilt solar battery 2K cam with AI auto-tracking.
- **Indoor Cam E30** — 4K 360° pan/tilt indoor/pet cam with HomeKit (distinct from the 2K Indoor Cam E220).
- **Indoor Cam C220** — 2K 360° pan(360°)/tilt(75°) plug-in indoor cam with on-device person/pet/crying detection + auto-tracking (distinct from the E220 and fixed C120).
- **4G LTE Cam S330** — cellular (4G LTE) battery/solar pan-tilt cam for off-grid sites — the dataset's first `4g`-connectivity camera.
- **Floodlight Cam E30** — hardwired 2K dual-lens 360° pan/tilt floodlight (distinct from the wireless 3K E340).
- **Wall Light Cam S100** — wired outdoor 2K camera with an integrated 1200-lumen wall light, dual-PIR motion, color night vision, 105 dB siren.
- **Video Doorbell C30** — 2025 budget 2K (16:9) battery-only doorbell; local microSD, no HomeKit.
- **Video Doorbell C31** — 2025 budget 2K (4:3 head-to-toe) doorbell, removable battery + hardwire option enabling 24/7 recording and 5s pre-roll.

All added as app/cloud-only (`http`) except eufyCam S3 Pro (RTSP via HomeBase); `["global"]` markets + `last_verified` set.

### Re-verified (doorbell second pass)

The four Eufy video doorbells were re-checked field-by-field against their official spec pages:

- **Video Doorbell E340** — hardwire spec corrected `8-24 VAC` → **`16-24 VAC (10 VA)`** (+ 19V 0.6A DC adapter option); its dual-light **color** night vision confirmed accurate.
- **Video Doorbell S330** & **Video Doorbell Dual** — night vision corrected **`color` → `ir`** (official spec: "Infrared-Enhanced Night Vision", 4 IR sensors, black-and-white); added a product-spec source to the Dual (previously cited only the RTSP FAQ).
- **Video Doorbell S220** — confirmed accurate (single-cam 2K, app/cloud-only, no changes).

### Added — lineup coverage pass

A model-by-model coverage check against Eufy's full catalog (current + legacy) surfaced 9 more real, distinct products, each verified against official eufy.com / service.eufy.com pages:

- **eufyCam 2** (T8114) — original 1080p HomeBase battery cam; RTSP via HomeBase.
- **eufyCam 2C Pro** (T8142 / "eufyCam S220") — 2K spotlight battery cam; RTSP via HomeBase.
- **eufyCam E** (T8112) — 2018 original 1080p battery cam; app-only. `discontinued`.
- **eufyCam E40** (T8144121) — 2K MaxColor built-in-solar HomeBase cam; **distinct from SoloCam E40** (HomeBase-required, IP66 vs standalone IP65).
- **SoloCam E42** (T8173) — 2025 4K pan/tilt solar cam with license-plate/face recognition; distinct from the fixed 2K SoloCam E40.
- **Indoor Cam C210** (T8419) — 1080p 360° pan/tilt plug-in indoor cam (sits below the 2K C220).
- **Outdoor Cam E220** (T8441Z21 / "Outdoor Cam Pro" / "Solo OutdoorCam C24") — 2K wired outdoor bullet with RTSP-to-NAS; distinct from the Floodlight Cam E220 and the 1080p Outdoor Cam E210.
- **Floodlight Cam 1080p** (T8420) — 2019 original wired floodlight cam; app-only (eufy floodlights don't support RTSP). `discontinued`.
- **Floodlight Cam 2K** (T8424) — 2500-lumen wired floodlight cam; distinct from the "Floodlight Cam E 2K" (E220 / T8422, 2000 lm). `discontinued`.

RTSP added only where confirmed on Eufy's official RTSP-support docs (eufyCam 2, 2C Pro via HomeBase; Outdoor Cam E220 via app-enabled NAS/RTSP), each with `configs.frigate.verified: false` (untested). C210's RTSP was community-sourced only, so it ships app/cloud-only (`http`). `["global"]` markets + `last_verified` on all.

**Alias merges (duplicates, not new entries):** "Indoor Cam 2K" (T8400) folded into **Indoor Cam C120** (its current name); "Outdoor Cam C22" (T8442) folded into **Outdoor Cam E210** (same SKU).

### Fixed — mislabeled eufyCam 3-series + E210 RTSP

The coverage pass exposed three errors in existing entries, now corrected against official sources:

- **`eufycam-3-pro` → `eufycam-3`** — there is no official "eufyCam 3 Pro"; the entry's own source URL is the **eufyCam 3 (S330)** page. Renamed to *eufyCam 3* (alias *eufyCam S330*), replaced the unverifiable SKU `T88601D4` with the real ones (T8160 / T81601W1 / T88711W1), corrected `release_year` 2023 → **2022**, and dropped an unverified aperture value.
- **`eufycam-3c-2k` → `eufycam-3c`** — the real eufyCam 3C (S300) is **4K / 8 MP, not 2K**; corrected resolution to 4K UHD (3840×2160), replaced the bogus SKU `T8870` with the real ones (T8161 / T8161321 / T8882121), fixed `release_year` 2024 → **2022**, and renamed to *eufyCam 3C*.
- **Outdoor Cam E210** — added the (officially confirmed, previously missing) `rtsp` protocol + complete Frigate/HA/Blue Iris configs (`verified: false`), and upgraded its lone Amazon source to two official eufy.com references.

### Fixed

27 real cameras verified/corrected against eufy.com. The central theme was **RTSP/ONVIF accuracy** — each camera cross-checked against Eufy's official RTSP-support list (RTSP is served via a HomeBase, not the camera):

- **RTSP corrected**: added the (officially confirmed but missing) `rtsp` on `eufyCam 2C`, `Floodlight Cam 2 Pro`, `eufyCam 3C`, and the `Garage-Control Cam`; **removed unsupported `rtsp`** (+ the misleading Frigate configs) from `Video Doorbell Dual` and `Indoor Cam S350`.
- **Spec corrections**: `Outdoor Cam E210` is a wired 1080p camera, not battery/2K; `SoloCam S340` is 3K-wide + 2K-telephoto hybrid-zoom pan-tilt, not "4K"; `Video Doorbell S330` is a 2K dual-cam wired unit, not 4K single-lens; `Video Doorbell S220` retyped `dome` → `doorbell`; `Indoor Cam Mini` retyped `dome` → `ptz` (2K pan-tilt); `garage-cam-s330` is the real **Garage-Control Cam E110**; multiple color→ir night-vision, IP67→IP65, and battery→wired power corrections; unverified HomeKit claims removed brand-wide; `Floodlight Cam 2 Pro` 5MP→3MP.
- Market tags (`["global"]`) added to all 27; `last_verified: 2026-07-04` set.

### Changed

- Counts: Eufy 36 → 46 (net +10 after removals/additions); `last_verified: 2026-07-04` across the brand. See the README "By the numbers" for current dataset-wide totals.

---

## [1.21.0] — 2026-07-04

Full data-quality audit of the **Annke** brand (master audit #28) — all 23 entries verified against official `annke.com` product pages. Annke OEMs Hikvision hardware, and the dataset had the same fabrication pattern seen elsewhere. Net: **23 → 13 cameras**. (Version stacks on top of the Hikvision v1.20.0 work.)

### Removed

**10 entries** (nearly half the brand):

- **7 ghost models** with no product on annke.com: `C800 WiFi` and `C800X WiFi` (both cameras are PoE-only — no WiFi variant exists), `W800` (no such camera; WS800 is an NVR system), `AC800P` (no such PTZ — Annke's PTZ line uses CZ/ACZ/CPT naming), `C700` (no such C-series model), `CR200`, `CR400` (both 404, zero footprint).
- **1 duplicate**: `C800 PoE Bullet` — same SKU as `C800 (Bullet)`.
- **1 unverifiable/likely ghost**: `I91BW` — no such model in Annke's real I91B* 4K bullet family.
- **1 non-camera**: `N48POB Kit` — an 8-channel PoE **NVR system bundle**, not a single camera.

### Fixed

12 real cameras corrected against official annke.com pages. Most serious:

- **`NC400`** was stored as an IR **dome**; it's actually the **NightChroma NC400 full-color PoE bullet** (type dome→bullet, night_vision ir→color, added f/1.0 lens + sensor; marked discontinued).
- **`WZ500`** was stored as a wired **PoE** camera; it's a **WiFi Tuya-based 5MP 20x PTZ** (connectivity ethernet→wifi, power poe→dc, night_vision ir→hybrid dual-light).
- **`AC400`** mistyped bullet→**dome**; **`AC500`** resolution corrected 4:3 → 16:9 3K; **`AC800`**/**`C1200`** wrong sensor + IR range; **`C800`** family (Bullet/Turret/C800X) sensor `1/2.7"`→`1/2.4"`/`1/1.8"` and FOV (diagonal mislabeled as horizontal); **`I61DQ`** dual-lens resolution + hybrid light.
- **`NightChroma NCM800`** was a wrong model name — corrected to the real **NightChroma NC800** and the file/id renamed `ncm800` → `nc800`.
- The WiFi doorbell (`video-doorbell`) confirmed correct as app/cloud-only with **no** RTSP/ONVIF (exact SKU still unconfirmed — flagged, not changed).

### Changed

- Market tags (`["global"]`) added to all 13 surviving Annke cameras; `last_verified: 2026-07-04` set on the 12 verified.
- Counts: total 1,722 → 1,712, Annke 23 → 13. Resolution tiers 4K/8MP+ 518 → 511, 4–5MP 728 → 725, 1080p–2MP 447 (unchanged); PoE-wired 1,179 → 1,171, integration-configs 1,315 → 1,305. Brand count unchanged at 69.

---

## [1.20.0] — 2026-07-04

Eight Hikvision cameras added, each populated field-by-field from its **official Hikvision datasheet**. Net: **150 → 158 Hikvision cameras**.

### Added

- **DS-2CD1027G2H-LIU(F)** — 2MP ColorVu Smart Hybrid Light network bullet (F1.0, IR + white light up to 30m, built-in mic; value series).
- **DS-2CD1023G0E-I** — 2MP EXIR economic network bullet (H.265+, IP67, no SD slot).
- **DS-2SF7C425MXG2/LM-EL** — DeepinViewX TandemVu 7C: fixed 6MP panoramic + 4MP 25x DarkFighter PTZ speed dome, 400m IR, large-model AI perimeter protection, LPR, PoE++ 90W. One entry covers the `-EL` / `-ELW` / `-ELY` (NEMA 4X anti-corrosion) / `-ELWY` SKU variants (identical camera spec, differing only in coating/hardware options).
- **5 Turbo HD (HD-TVI analog) 2MP bullets** — `DS-2CE16D0T-IT3E` (EXIR 40m, PoC), `DS-2CE16D0T-ITFS` (EXIR 30m, 4-in-1, built-in mic), `DS-2CE16D0T-EXIF` (EXIR 20m, 4-in-1), `DS-2CE16D0T-VFIR3E` (varifocal 2.8-12mm, PoC, IK10), and `DS-2CE16D0T-LXTS` (ColorVu Smart Hybrid Light, two-way audio over coax). Modeled as analog: `coax`, no protocols/configs.

### Changed

- Counts: total 1,754 → 1,762, Hikvision 150 → 158. Resolution tiers and other "By the numbers" stats recomputed (and stale prior figures corrected).

---

## [1.19.1] — 2026-07-04

Hikvision data-quality patch — 14 corrections from a targeted audit (Hikvision model-number decode + internal-consistency checks), each **verified against official Hikvision datasheets/product pages**. Field-level fixes only; no cameras added or removed.

### Fixed

- **Night-vision type (3)** — `DS-2CD1143G2-LIUF`, `DS-2CD1153G2-LIUF`, `DS-2CD1183G2-LIUF`: Smart Hybrid Light (LIUF) models typed `ir` → corrected to `hybrid` (IR + white supplement), matching their own siblings/regional variants.
- **Form factor (7)** — `DS-2CD2367G2-L`, `DS-2CD2386G2-I`, `DS-2CD2386G2-ISU/SL`, `DS-2CD2386G2-IU` (dome → **turret**; 23xx is Hikvision's turret family); `DS-2CD2083G2-I`, `DS-2CD2087G2-SU` (dome → **bullet**; confirmed "Fixed Bullet" on Hikvision datasheets); `DS-2CD2726G2-IZS` (bullet → **dome**; "Motorized Varifocal Dome"); `DS-2CD6365G0E-IVS` (panoramic → **fisheye**; "Network Fisheye Camera").
- **Resolution (2)** — `DS-2CD6944G0-IHS`: 8 → **16MP** ("180° Stitched 16MP PanoVu", four sensors); `DS-2DE2A204IW-DE3/W`: 4 → **2MP** (max 1920×1080; the `-404` variant is the 4MP one).
- **Connectivity (1)** — `DS-2CD2443G2-IW`: the `-IW` cube is WiFi — added `wifi` to `connectivity`.
- `last_verified: 2026-07-04` set on all 14 corrected entries.

### Notes

- Flagged for maintainer review (not changed): **`DS-2CD2427G2H-LI(U)`** — no such Hikvision SKU exists; its stored spec (4MP hybrid dome, 1/1.8") matches the real `DS-2CD2147G2H-LIU`, so the model number is likely mistyped. Left as a rename-vs-remove decision.
- Patch release on top of the v1.19.0 audit (Reolink + Hanwha).

---

## [1.19.0] — 2026-07-04

Large data-quality release: full re-audits of the **Reolink** and **Hanwha** brands against official manufacturer sources (master audit #28), plus new models added from official datasheets. Net across the release: **1,754 → 1,722 cameras** (brand count unchanged at 69).

### Reolink — full brand re-audit (122 → 116 cameras)

All 122 stored Reolink cameras re-verified against official `reolink.com` product pages, datasheets, and support articles. 7 removed, 1 new model added.

- **Added** — **Argus Solar**: newly-released (2026) 5MP battery/solar wire-free camera, dual-band Wi-Fi 6 (2880×1616, 1/2.7" CMOS, f=3mm F1.6, 6500mAh, IP67, two-way audio); cloud/battery-only, no RTSP/ONVIF.
- **Removed** — 1 ghost (`RLC-823A v2`, no such product) and 6 duplicate regional listings (`RLC-823A` AU/CA/CH/EU/MENA, `RLC-810A` India); their `markets[]` were merged onto the base `RLC-823A`/`RLC-810A` first, so no market-filter coverage was lost.
- **Fixed** — misfiled `RLC-830A-v2` was actually the **RLC-840A** (renamed); fabricated zoom lenses (`RLC-812A/824A/842A`); fabricated RTSP/ONVIF + Frigate configs on cloud-only/NVR-only cameras (B/D-series add-ons, Argus battery line) and over-claimed ONVIF on several wired models; wrong `type` (Argus 4 Pro → dual-lens, RLC-423/E1 Outdoor → ptz, RLC-8xx domes mislabeled turret); wrong resolution/stale hardware (RLC-511WA "4K"→5MP, E1 Zoom 5MP→8MP, Argus Eco 2→3MP); wrong booleans (RLC-520/522/842A mic, E1 Outdoor two-way audio); plus systemic sensor/FOV/IR/microSD drift across the brand.

### Hanwha — full brand re-audit + additions (71 → 45 cameras)

Every Hanwha camera verified against official Hanwha datasheets/product pages; market tags added brand-wide. **38 fabricated entries removed** (over half the original brand), **~29 real cameras corrected**, and **12 real cameras added** from official datasheets.

- **Removed — 38 ghosts.** Consistent fabrication template: Hikvision-style specs (2.8-12mm F1.4 lenses, 50m IR, 256GB SD, "ColorVu" branding) pasted onto invented Hanwha model numbers. Families: fake "9300"/"A9300"/"9302" P- and X-series (`PNO-9300R`, `PND/PNO/PNV-A9300*`, `XNO-9300R/9302R`, `XNV-9300(+MENA)/9302R`, `PNV-9300RV`); fake Q-series 4K (`QND/QNO/QNV-9080R`, `QNO-8090R`, `QND-C9083R`); fake "Gen 2"/"V2"/suffix variants (`XNO/XNV-A9084R (Gen 2)`, `XNV-A9084R-LVE-3` (hid a fake "PNB-A9001RV Gen 2"), `XNV-9080R-V2`, `XNV-8080RSZ/RZ2`, `XNV-8080R-KR`); fake T-series (`TND/TNO/TNV-C8083R`); fake PTZ (`QPT-7230`, `QPT-9300RWX`, `QPTZ-8300HN`, `ruggedized-ptz-wisenet9`); fake AI domes (`QNV-A9402R(+WI)`); plus `AND-L7082R`, `QNO-A9400R`, `XNV-A9400R`, `XNV-C9300RW`, `XPT-A9401RW`.
- **Corrected — ~29 real cameras.** Highlights: `XNO/QNO/QNV-C9083R` stored as 4MP "ColorVu" → real 4K IR; `XNV-8093R` was a telephoto AI dome, not a wide fixed dome; `PNM-9000VQ`/`PNM-9322VQP` multisensors had fabricated IR/AI; `XNO/XNV-A9084R` confirmed as real Wisenet 9 models; `QNV-8080RB` reclassified bullet → dome; `XNP-9300RW` corrected (sensor/FOV/power/dimensions); `PNO/PNV/PND-A9081R(V)` and `PNB-A9001` normalized/rewritten from a fabricated "Gen 2" state to real datasheet specs; brand-wide Q-series lens/IR/storage/power cleanup.
- **Added — 12 real cameras** from official datasheets: `XND-A9085RV`, `XNV-A9084RS`, `QNE-C8013RL`, `QNE-C9013RL`, `ANE-L6012R`, `PNM-C9022RV`, `PNM-9031RV`, `TNV-C7013RC`, `TNV-8011C`, `PND-9080R`, `PNM-C16083RVQ`, `PNM-C34404RQPZ` (the last a 4K 4ch PTRZ + 2MP 40x PTZ AI combo).
- **Market tags** added to all 45 surviving Hanwha cameras (`["global"]`, with verified regional variants keeping `["KR","global"]` / `["AE","SA","MENA"]`).

### Release totals

**1,722 cameras / 69 brands.** Resolution tiers: 4K/8MP+ 518, 4–5MP 728, 1080p–2MP 447. PoE-wired 1,179, WiFi 474, battery/wire-free 184, integration-configs 1,315.

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
