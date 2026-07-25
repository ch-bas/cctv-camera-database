# CCTV Glossary

Quick reference for terms used across camera entries.

**PoE (Power over Ethernet)** — Power and data delivered over a single Ethernet cable. `802.3af` (~15W), `802.3at` / PoE+ (~30W), `802.3bt` / PoE++ (higher).

**ONVIF** — Open standard letting cameras and recorders from different brands interoperate. Profiles: S (streaming), G (recording), T (advanced video).

**RTSP** — Real Time Streaming Protocol; the common URL-based way to pull a camera's live stream into other software (e.g. VLC, NVRs, Frigate).

**IR night vision** — Infrared LEDs illuminate the scene invisibly; image is black & white. `range_m` is the rated effective distance.

**Color night vision** — Uses a low-light sensor plus a white spotlight to keep footage in color at night. The low-light sensitivity is specified as the minimum illumination required for color, defined in lux (lx).

**WDR (Wide Dynamic Range)** — Balances very bright and very dark areas in one frame. Measured in dB; 120 dB is strong.

**IP rating** — Ingress protection. First digit = dust, second = water. `IP66` = dust-tight + strong water jets; `IP67` = dust-tight + temporary immersion.

**IK rating** — Impact/vandal resistance as defined by international standard IEC 62262. `IK11` is the highest rating.

**Sensor size** — e.g. `1/2.7"`, `1/3"`. Larger sensors generally gather more light → better low-light performance at equal resolution.

**Focal length** — Lens `f` in mm. Lower = wider field of view; higher = narrower/more zoomed. `varifocal` lenses are adjustable.

**Bullet / Dome / Turret / PTZ** — Form factors. Bullet = cylindrical, visible direction; Dome = discreet, vandal-friendly; Turret = ball-in-socket, less IR glare; PTZ = motorized pan/tilt/zoom.

**NVR (Network Video Recorder)** — Records IP camera streams centrally over the network.
