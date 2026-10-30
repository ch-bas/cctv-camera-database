# Tenda CP7

*Also known as: 5MP Security Pan/Tilt Camera*

| Field | Spec |
|-------|------|
| Brand | Tenda |
| Model | CP7 |
| Type | ptz |
| Connectivity | wifi, ethernet |
| Resolution | 5MP (5MP, 2880×1620) |
| Sensor | 1/3" Progressive Scan CMOS sensor |
| Lens | 1× 4mmmm F2.0 |
| Field of view | 81.3° |
| Night vision | ir (10m) |
| Power | 5 V 1A, Type-C Power Plug |
| Storage | microSD ≤ 512GB, NVR |
| Protocols | onvif, rtsp |
| Two-way audio | Yes |
| Operating temp | -10 to 45°C |

## Streams

| Stream | Resolution | FPS | Codec |
|--------|-----------|-----|-------|
| main | 2880x1620 | 30 | H.265 |
| sub | 640x360 | 30 | H.265 |

## Features

- pan 0°--355° / tilt -65°--90° with auto-tracking
- IR night vision up to 10 m
- smart detection: human detection, cry detection, pet detection, tampering detection, scene change detection
- two-way audio
- ONVIF / RTSP for NVR & third-party integration
- microSD storage up to 512 GB

## Sources

- https://www.tendacn.com/us/product/specification/793529395552325
- https://static.tenda.com.cn/document/2026/05/11/700de615e8414aaca5a1810de5104147/CP7V2.1_Datesheet.pdf

## Community notes (unverified)

*Reported by users. Not from the datasheet, not verified by the project.*

- The documented main-stream path rtsp://<ip>:8554/profile0 did not work on the reporter's CP7; the main stream was reachable at rtsp://<ip>:554/ch=1?subtype=0 instead (the path Tenda documents for the CP3 v3 and CH3). Possibly a CP7 V2.x hardware or firmware revision.
  
  rtsp · reported by anonymous-web · 2026-10-29 · [source](https://github.com/ch-bas/cctv-camera-database/issues/424)

---
*Auto-generated from tenda-cp7.json — do not edit by hand.*
