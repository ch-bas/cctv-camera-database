# Revodata I706-P-HS

| Field | Spec |
|-------|------|
| Brand | Revodata |
| Model | I706-P-HS |
| Type | covert |
| Connectivity | ethernet |
| Resolution | 5MP (5MP, 2880×1616) |
| Lens | 1× 3.6mm |
| Field of view | 75° |
| Night vision | ir |
| Protocols | rtsp, onvif, http, p2p |

## Streams

| Stream | Resolution | FPS | Codec |
|--------|-----------|-----|-------|
| main | 2880x1616 | 25 | H.264 |

## Features

- Tiny indoor PoE camera with an adjustable M12 3.6 mm lens
- Infrared night vision
- Snapshot URL: /cgi-bin/snapshot.cgi
- Motion detection
- P2P remote view

## Sources

- https://www.amazon.co.uk/dp/B09T9HXZD3
- https://github.com/blakeblackshear/frigate/discussions/24489
- https://github.com/ch-bas/cctv-camera-database/discussions/402

## Community notes (unverified)

*Reported by users. Not from the datasheet, not verified by the project.*

- Works in Frigate as a bird-box camera: configured in about ten minutes using the RTSP paths from the manual. Main stream runs at 2880x1616, 25 fps H.264; the camera web UI resembles Hikvision-style OEM firmware.
  
  frigate · reported by ElectronicBattle · 2026-10-08 · [source](https://github.com/blakeblackshear/frigate/discussions/24489)

---
*Auto-generated from revodata-i706-p-hs.json — do not edit by hand.*
