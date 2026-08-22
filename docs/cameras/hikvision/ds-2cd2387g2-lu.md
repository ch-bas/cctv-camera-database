# Hikvision DS-2CD2387G2-LU

*Also known as: ColorVu 8MP Fixed Turret*

| Field | Spec |
|-------|------|
| Brand | Hikvision |
| Model | DS-2CD2387G2-LU |
| Type | turret |
| Connectivity | ethernet |
| Resolution | 4K UHD (8MP, 3840×2160) |
| Sensor | 1/1.2" Progressive Scan CMOS |
| Lens | 1× 2.8 / 4 (fixed options)mm F1.0 |
| Field of view | 102 horizontal (2.8mm) / 88 horizontal (4mm)° |
| Night vision | color (30m), 0.0005 lux color |
| Power | PoE (802.3af) / DC 12V |
| Storage | microSD ≤ 256GB, NVR |
| Protocols | onvif, rtsp, http |
| IP rating | IP67 |
| Two-way audio | No |

## Streams

| Stream | Resolution | FPS | Codec |
|--------|-----------|-----|-------|
| main | 3840x2160 | 24 | H.265 |
| sub | 1280x720 | 30 | H.265 |
| third | 1920x1080 | 10 | H.265 |

## Features

- ColorVu 24/7 full-color imaging
- AcuSense human/vehicle classification
- F1.0 super-aperture
- 130 dB WDR
- dual spotlight LEDs
- H.265+ compression
- built-in microphone

## Sources

- https://www.hikvision.com/en/products/IP-Products/Network-Cameras/Pro-Series-EasyIP-/ds-2cd2387g2-l-u-/

## Community notes (unverified)

*Reported by users. Not from the datasheet, not verified by the project.*

- Substream lives at /Streaming/Channels/102 (main is /101), which isn't in the datasheet. Frigate/go2rtc also needs the camera set to RTSP Authentication digest/basic with Digest Algorithm MD5, or the stream fails to open.
  
  rtsp · reported by ch-bas · 2026-08-22 · [source](https://docs.frigate.video/configuration/camera_specific/)

---
*Auto-generated from hikvision-ds-2cd2387g2-lu.json — do not edit by hand.*
