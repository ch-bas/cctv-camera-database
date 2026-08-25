# Frigate: beyond the baseline (ONVIF PTZ + two-way audio)

The `configs.frigate` block on each camera ships a **baseline**: a `detect`
resolution and the main/sub `rtsp_url_template` — enough for a working
detect/record setup. Many cameras support more (manual PTZ, autotracking, and
two-way talk), which the dataset flags with a few structured fields. This guide
explains how to wire those up, so per-camera records don't repeat the boilerplate.

Related fields: `configs.frigate.autotracking`, `configs.frigate.onvif_port`,
`configs.frigate.two_way_audio`, and the camera-side `ptz.onvif_ptz`.

## Manual PTZ (ONVIF)

For a `type: ptz` camera, Frigate drives pan/tilt/zoom through an `onvif:` block:

```yaml
cameras:
  front_ptz:
    onvif:
      host: 10.0.10.10
      port: 80          # see the port table below
      user: "{FRIGATE_USER}"
      password: "{FRIGATE_PASSWORD}"
    ffmpeg:
      inputs:
        - path: rtsp://user:pass@10.0.10.10:554/...   # the camera's rtsp_url_template
          roles: [record]
```

### ONVIF control port

ONVIF usually runs on the camera's **HTTP service port, which is `80` by
default** — so most records omit `configs.frigate.onvif_port`. It is only set
when a brand uses a **non-default** port. Known non-defaults:

| Brand | ONVIF port | Notes |
|-------|-----------|-------|
| Most (Hikvision, Dahua, Uniview, Axis, Hanwha, i-PRO…) | **80** | ONVIF on the HTTP port; enable ONVIF in the web UI first |
| **Tapo** | **2020** | not 80 — use the camera *Account* credentials |
| **Reolink** | **8000** | Reolink exposes ONVIF on 8000 |

Datasheets almost never state the ONVIF port, so the dataset only records
`onvif_port` when a verified source gives a non-default value — never a guessed
`80`.

### Autotracking

`configs.frigate.autotracking: true` means Frigate can *drive* autotracking
(distinct from the camera's own `ptz.autotracking`). Frigate autotracking needs
**relative** ONVIF movement (`ptz.onvif_ptz: relative`). Cameras that only do
absolute or continuous move (e.g. Tapo, many Reolink) are set `false`.

## Two-way audio (talk)

`configs.frigate.two_way_audio: true` marks cameras whose datasheet confirms
two-way audio *and* that expose ONVIF/RTSP — i.e. Frigate's live-view talk button
works via the bundled **go2rtc** backchannel. Wire it through a go2rtc stream:

```yaml
go2rtc:
  streams:
    front:
      - rtsp://user:pass@10.0.10.10:554/...#backchannel=1
```

The exact backchannel method is brand-dependent:

| Method | Applies to |
|--------|-----------|
| `#backchannel=1` on the RTSP/ONVIF source | most ONVIF cameras with a speaker |
| go2rtc `tapo://` source | TP-Link Tapo (also carries the backchannel) |
| ONVIF backchannel | cameras exposing the ONVIF T profile |

If you hit non-monotonic-timestamp errors, try disabling audio on the record
role and keep the talk channel on the go2rtc/live source only.

---

*The dataset records only what the datasheet verifies (two-way-audio capability,
non-default ports). The go2rtc method and the default-`80` port are documented
here rather than fabricated onto thousands of records.*
