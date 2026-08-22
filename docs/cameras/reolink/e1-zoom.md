# Reolink E1 Zoom

| Field | Spec |
|-------|------|
| Brand | Reolink |
| Model | E1 Zoom |
| Type | ptz |
| Connectivity | wifi |
| Resolution | 4K (8MP, 3840×2160) |
| Sensor | 1/2.8" CMOS |
| Lens | 1× 2.8-8mm F1.6 |
| Night vision | ir (12m) |
| Power | DC 5V/2A |
| Storage | microSD ≤ 512GB, NVR |
| Protocols | rtsp, onvif |
| IP rating | IP20 |
| Two-way audio | Yes |
| Operating temp | -10 to 55°C |
| Released | 2020 |

## Features

- 4K indoor WiFi with 3× optical zoom
- motorized varifocal
- 12m IR
- person/pet detection
- crying detection
- ONVIF/RTSP
- two-way audio
- Alexa/Google
- no subscription

## Sources

- https://reolink.com/product/e1-zoom/

## Community notes (unverified)

*Reported by users. Not from the datasheet, not verified by the project.*

- For Reolink, the HTTP-FLV streams tend to be more reliable in Frigate than RTSP (which can stall / throw non-monotonic-timestamp errors); go2rtc can use the http source and add a secondary RTSP stream only for audio.
  
  rtsp · reported by ch-bas · 2026-08-22 · [source](https://docs.frigate.video/configuration/camera_specific/)

---
*Auto-generated from reolink-e1-zoom.json — do not edit by hand.*
