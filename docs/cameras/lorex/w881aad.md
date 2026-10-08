# Lorex W881AAD

*Also known as: 4K Spotlight Indoor/Outdoor Wi-Fi Security Camera*

| Field | Spec |
|-------|------|
| Brand | Lorex |
| Model | W881AAD |
| Type | bullet |
| Connectivity | wifi |
| Resolution | 4K UHD (8MP, 3840×2160) |
| Sensor | 1/2.8" CMOS |
| Lens | 1× 2.8 (fixed)mm |
| Field of view | 140° |
| Night vision | color (10m) |
| Power | DC 12V/6.6W (AC adapter, plug-in) |
| Storage | microSD ≤ 256GB |
| Protocols | rtsp |
| IP rating | IP65 |
| Two-way audio | Yes |

## Features

- WiFi 6 (802.11ax)
- built-in spotlight
- color night vision
- smart motion detection
- person and vehicle detection
- no subscription required for local storage
- no officially confirmed RTSP/ONVIF

## Sources

- https://www.lorex.com/products/w881aad-4k-spotlight-indoor-outdoor-wi-fi-security-camera
- https://d2zri47w41ywm3.cloudfront.net/downloads/security-cameras/W881AA/W881AAD_Series_Specs_R6.pdf
- https://www.lorex.com/blogs/help/ip-cameras-using-real-time-streaming-protocol-rtsp-with-your-dvr-nvr

## Community notes (unverified)

*Reported by users. Not from the datasheet, not verified by the project.*

- Streams locally over RTSP without a Lorex recorder: the owner uses rtsp://admin:<password>@<camera ip>/cam/realmonitor?channel=1&subtype=0. The local Dahua HTTP API (used by the Home Assistant Dahua integration) did not work with default settings.
  
  rtsp · reported by jhouse1989 · 2026-10-08 · [source](https://github.com/rroller/dahua/issues/353)

---
*Auto-generated from lorex-w881aad.json — do not edit by hand.*
