## Source URL Validation (`check-sources.js`)

### Purpose
Camera manufacturer websites frequently undergo redesigns, archive legacy spec sheets, or update CDN paths for technical documents. The `check-sources` script automatically verifies that all URLs listed in the `sources` field across camera database JSON files remain accessible and readable.

To keep checks fast and minimize bandwidth usage, the script attempts a lightweight `HEAD` request first before falling back to a stream-canceled `GET` request (to handle CDNs or servers that block `HEAD` methods).

---

### Features
* **PDF vs. Webpage Separation:** Distinguishes between `.pdf` spec sheets/manuals and general web pages for clearer status tracking.
* **Smart Fallbacks:** Handles anti-scraping 403/405 responses from vendor CDNs using proper browser headers and fallback stream cancellations.
* **Targeted Scanning:** Supports filtering by brand or filename pattern so you can test specific vendors without querying the entire database.
* **CI-Friendly:** Exits with status code `0` when all links are healthy, or `1` when broken URLs are detected (suitable for automated GitHub Actions checks).

---

### Usage


```bash

# Run the validator against the entire database:
npm run check-sources

# Check only Reolink cameras
npm run check-sources -- reolink

# Check Hivision cameras using wildcards
npm run check-sources -- "dahua/*g3*"

# Check a specific model range across vendors
npm run check-sources -- "*823*"
```

### Example Output

```bash

npm notice run cctv-camera-database@1.52.0 check-sources
npm notice run node scripts/check-sources.js reolink/*argus*
Scanning database folder: /home/frank/cctv-camera-database/cameras
Applying filter pattern: "reolink/*argus*"
Matched 17 file(s) across 1 brand(s).

📦 Brand: reolink (27 total unique sources)
  📄 PDF Documents (3):
     ✓ ✓ ✓ 

  📄 Web Pages & Other (24):
     ✗ ✓ ✓ ✓ ✓ ✓ ✓ ✗ ✗ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✗ ✓ ✓ 

--- VALIDATION REPORT ---
❌ Found 4 dead/unreachable source URL(s):

URL: https://reolink.com/au/product/argus-3-pro/
  Reason : Status 404 (Not Found)
  Used in: reolink-argus-3-pro-au
---
URL: https://reolink.com/us/product/argus-3-ultra/
  Reason : Status 404 (Not Found)
  Used in: reolink-argus-3-ultra
---
URL: https://reolink.com/at/product/argus-4-pro/
  Reason : Status 404 (Not Found)
  Used in: reolink-argus-4-pro-at
---
URL: https://reolink.com/de/product/argus-solar/
  Reason : Status 404 (Not Found)
  Used in: reolink-argus-solar
---

```