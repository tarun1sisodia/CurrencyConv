#!/usr/bin/env node
import { gzipSync } from 'node:zlib';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Next.js 16 + React 19 first-load runtime is larger than the historic 150KB
 * App Router budget from Next 14. We still fail CI if shared first-load JS
 * exceeds 280KB gzipped (framework + polyfill + app runtime).
 */
const MAX_BYTES = 280 * 1024;
const manifestPath = '.next/build-manifest.json';

if (!existsSync(manifestPath)) {
  process.stderr.write('Missing .next/build-manifest.json — run next build first.\n');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const files = [...(manifest.polyfillFiles ?? []), ...(manifest.rootMainFiles ?? [])];

let total = 0;
for (const rel of files) {
  const full = join('.next', rel);
  if (!existsSync(full)) {
    continue;
  }
  total += gzipSync(readFileSync(full)).length;
}

const kb = (total / 1024).toFixed(1);
process.stdout.write(`First-load JS (gzip, rootMainFiles + polyfill): ${kb} KB\n`);
if (total > MAX_BYTES) {
  process.stderr.write(`Bundle exceeds 280KB gzipped (${kb} KB)\n`);
  process.exit(1);
}
