#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const root = resolve(process.argv[2] ?? 'dist');
const port = Number(process.env.PORT ?? 4173);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
};

const server = createServer(async (request, response) => {
  try {
    const urlPath = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    let file = resolve(root, `.${urlPath}`);
    if (file !== root && !file.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    try {
      if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
      await stat(file);
    } catch {
      file = resolve(root, 'index.html');
    }
    let body = await readFile(file);
    const accepted = request.headers['accept-encoding'] ?? '';
    let encoding;
    if (accepted.includes('br')) {
      body = brotliCompressSync(body);
      encoding = 'br';
    } else if (accepted.includes('gzip')) {
      body = gzipSync(body, { level: 6 });
      encoding = 'gzip';
    }
    const headers = {
      'content-type': types[extname(file)] ?? 'application/octet-stream',
      'content-length': body.byteLength,
      'cache-control': 'no-store',
      vary: 'Accept-Encoding',
    };
    if (encoding) headers['content-encoding'] = encoding;
    response.writeHead(200, headers).end(body);
  } catch {
    response.writeHead(500).end('Internal server error');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving ${root} at http://127.0.0.1:${port}`);
});
