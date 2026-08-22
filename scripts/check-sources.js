#!/usr/bin/env node
/**
 * Probes every URL in each camera's `sources` field and reports dead / moved
 * links, so we can catch source rot (vendor site redesigns, archived spec
 * sheets, changed CDN paths). Tries a lightweight HEAD first, falling back to a
 * stream-cancelled GET for servers that block HEAD. Exits non-zero if any
 * source is unreachable. Read-only — never modifies the dataset.
 *
 * Usage:
 *   node scripts/check-sources.js            # check every brand
 *   node scripts/check-sources.js hikvision  # scope to a brand folder
 *   node scripts/check-sources.js "reolink/*823*"  # glob by path
 *
 * Run weekly in CI via .github/workflows/check-sources.yml (results land in a
 * self-updating tracking issue).
 */
const fs = require('node:fs/promises');
const path = require('node:path');

const TIMEOUT_MS = 8000;
const BATCH_SIZE = 5; // Concurrency per vendor batch

/**
 * Simple glob matcher to convert patterns like "reolink/*823*" into RegExp.
 */
function compilePattern(pattern) {
  if (!pattern) return null;
  // Normalize path separators
  const normalized = pattern.replace(/\\/g, '/');
  
  // Convert standard glob wildcards (* and ?) into regex equivalents
  const regexString = '^' + normalized
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // escape special regex chars (except * and ?)
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.') + '$';

  return new RegExp(regexString, 'i');
}

/**
 * Recursively scans directory for camera JSON files.
 */
async function findJsonFiles(dir, baseDir = dir) {
  let results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(await findJsonFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      // Calculate relative path for easy pattern matching (e.g., "reolink/rlc-823a.json")
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      results.push({ fullPath, relativePath });
    }
  }
  return results;
}

/**
 * Detects the "silent rot" mode the weekly cron exists to catch: a deep
 * datasheet/product URL that 301s to the site root (vendor homepage). Benign
 * redirects that preserve the path (http→https, www, trailing slash) are NOT
 * flagged — only a real path collapsing to "/".
 */
function redirectedToHome(originalUrl, finalUrl, redirected) {
  if (!redirected || !finalUrl) return false;
  try {
    const o = new URL(originalUrl);
    const f = new URL(finalUrl);
    const oPath = o.pathname.replace(/\/+$/, '');
    const fPath = f.pathname.replace(/\/+$/, '');
    return oPath.length > 0 && fPath === '';
  } catch {
    return false;
  }
}

/**
 * Checks if a URL is accessible using HEAD with a GET fallback.
 */
async function checkUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CCTV-Database-Validator/1.0',
  };

  try {
    let response = await fetch(url, {
      method: 'HEAD',
      headers,
      signal: controller.signal,
      redirect: 'follow',
    });

    if (!response.ok && response.status !== 404) {
      const getController = new AbortController();
      const getTimer = setTimeout(() => getController.abort(), TIMEOUT_MS);

      try {
        response = await fetch(url, {
          method: 'GET',
          headers,
          signal: getController.signal,
          redirect: 'follow',
        });
        
        if (response.body) {
          await response.body.cancel();
        }
      } finally {
        clearTimeout(getTimer);
      }
    }

    return {
      url,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      moved: redirectedToHome(url, response.url, response.redirected),
      finalUrl: response.url,
    };
  } catch (err) {
    // Node's fetch masks the real problem as a bare "fetch failed"; the actual
    // DNS/TLS/connection error lives on err.cause — surface it.
    const cause = err.cause && (err.cause.code || err.cause.message);
    return {
      url,
      ok: false,
      status: 0,
      error: err.name === 'AbortError' ? 'Timeout' : cause ? `${err.message} (${cause})` : err.message,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function processInBatches(items, batchSize, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    const chunkResults = await Promise.all(chunk.map(fn));
    results.push(...chunkResults);
  }
  return results;
}

async function run() {
  const relativeTargetDir = path.join('.', 'cameras');
  const targetDir = path.resolve(relativeTargetDir);
  const userFilter = process.argv[2]; // Capture command line argument
  const filterRegex = compilePattern(userFilter);

  console.log(`Scanning database folder: ${relativeTargetDir}`);
  if (userFilter) {
    console.log(`Applying filter pattern: "${userFilter}"`);
  }

  const files = await findJsonFiles(targetDir);
  
  // Filter files based on vendor folder / filename match
  const matchedFiles = files.filter((f) => {
    if (!filterRegex) return true;
    const vendorDir = f.relativePath.split('/')[0];
    return filterRegex.test(f.relativePath) || filterRegex.test(vendorDir);
  });

  if (matchedFiles.length === 0) {
    // A filter that matches nothing is almost always a typo'd brand/path; exit
    // non-zero so it can't pass CI having silently checked nothing.
    console.log('\n❌ No camera files matched your search filter.');
    process.exit(userFilter ? 1 : 0);
  }

  // Group matched files by Brand / Vendor folder name
  const vendorGroups = new Map();

  for (const file of matchedFiles) {
    const parts = file.relativePath.split('/');
    const brand = parts.length > 1 ? parts[0] : 'Root';

    if (!vendorGroups.has(brand)) {
      vendorGroups.set(brand, []);
    }

    try {
      const content = await fs.readFile(file.fullPath, 'utf8');
      const json = JSON.parse(content);
      const entries = Array.isArray(json) ? json : [json];

      for (const entry of entries) {
        if (Array.isArray(entry.sources) && entry.sources.length > 0) {
          vendorGroups.get(brand).push({
            file: file.relativePath,
            id: entry.id || entry.model || file.relativePath,
            sources: entry.sources,
          });
        }
      }
    } catch (e) {
      console.warn(`Warning: Failed to parse ${file.relativePath}: ${e.message}`);
    }
  }

  console.log(`Matched ${matchedFiles.length} file(s) across ${vendorGroups.size} brand(s).\n`);

  const deadUrlsReport = [];

  // Helper function to check a URL list and stream output
  async function checkUrlGroup(urls, urlToEntriesMap, label) {
    if (urls.length === 0) return;

    console.log(`  📄 ${label} (${urls.length}):`);
    process.stdout.write('     ');

    const results = await processInBatches(urls, BATCH_SIZE, async (url) => {
      const res = await checkUrl(url);
      if (res.moved) {
        process.stdout.write('↷ '); // reachable, but redirected to homepage (rot)
      } else if (res.ok) {
        process.stdout.write('✓ ');
      } else {
        process.stdout.write('✗ ');
      }
      return res;
    });

    process.stdout.write('\n\n');

    for (const res of results) {
      if (!res.ok || res.moved) {
        deadUrlsReport.push({
          url: res.url,
          status: res.moved ? `${res.status} → homepage` : res.status,
          error: res.moved
            ? `redirects to site root (${res.finalUrl}) — datasheet likely moved/removed`
            : res.error || res.statusText,
          usedIn: urlToEntriesMap.get(res.url),
        });
      }
    }
  }

  // Process brand by brand
  for (const [brand, entries] of vendorGroups.entries()) {
    const urlToEntriesMap = new Map();
    for (const item of entries) {
      for (const url of item.sources) {
        if (!urlToEntriesMap.has(url)) {
          urlToEntriesMap.set(url, []);
        }
        urlToEntriesMap.get(url).push(item.id);
      }
    }

    const allUrls = Array.from(urlToEntriesMap.keys());
    if (allUrls.length === 0) continue;

    // Split URLs into PDFs vs Non-PDFs
    const pdfUrls = [];
    const otherUrls = [];

    for (const url of allUrls) {
      // Strips query strings/anchors (e.g., .pdf?v=1.2) before checking extension
      const cleanUrl = url.split('?')[0].split('#')[0];
      if (cleanUrl.toLowerCase().endsWith('.pdf')) {
        pdfUrls.push(url);
      } else {
        otherUrls.push(url);
      }
    }

    console.log(`📦 Brand: ${brand} (${allUrls.length} total unique sources)`);

    // Process PDF and Web Page batches separately
    await checkUrlGroup(pdfUrls, urlToEntriesMap, 'PDF Documents');
    await checkUrlGroup(otherUrls, urlToEntriesMap, 'Web Pages & Other');
  }

  // Final summary
  console.log('--- VALIDATION REPORT ---');
  if (deadUrlsReport.length === 0) {
    console.log('🎉 All checked sources are valid and accessible!');
    process.exit(0);
  }

  console.log(`❌ Found ${deadUrlsReport.length} dead/unreachable source URL(s):\n`);
  for (const item of deadUrlsReport) {
    console.log(`URL: ${item.url}`);
    console.log(`  Reason : Status ${item.status || 'ERROR'} (${item.error})`);
    console.log(`  Used in: ${item.usedIn.join(', ')}`);
    console.log('---');
  }

  process.exit(1);
}

run().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});