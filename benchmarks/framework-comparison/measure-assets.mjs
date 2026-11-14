#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { resolve, relative, extname } from 'node:path';

const roots = process.argv.slice(2);
if (roots.length === 0) {
  console.error('Usage: node measure-assets.mjs <build-directory> [<build-directory> ...]');
  process.exit(2);
}

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const fullPath = resolve(dir, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  }));
  return nested.flat();
}

const results = [];
for (const rootArg of roots) {
  const root = resolve(rootArg);
  let files;
  try {
    files = await listFiles(root);
  } catch (error) {
    console.error('Cannot read build directory:', root, error.message);
    process.exitCode = 1;
    continue;
  }

  for (const file of files.filter((item) => ['.js', '.css'].includes(extname(item).toLowerCase()))) {
    const data = await readFile(file);
    results.push({
      build: rootArg,
      file: relative(root, file).replaceAll('\\', '/'),
      rawBytes: data.byteLength,
      gzipBytes: gzipSync(data, { level: 9 }).byteLength,
      brotliBytes: brotliCompressSync(data).byteLength,
    });
  }
}

console.log(JSON.stringify({ scope: 'all-emitted-js-css-files', files: results }, null, 2));
