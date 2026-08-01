/**
 * Minimal static file server for local development.
 *
 * Deliberately dependency-free: `npm run dev` works on a fresh clone with no
 * `npm install` step, which matters when demoing on a laptop without internet.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname);
const PORT = Number(process.env.PORT) || 3000;

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = createServer(async (request, response) => {
  const requested = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  // Strip any ../ segments so a request can't escape this directory.
  const relative = normalize(requested).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '');
  let filePath = join(ROOT, relative || 'index.html');

  if (!filePath.startsWith(ROOT)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  try {
    if ((await stat(filePath)).isDirectory()) {
      filePath = join(filePath, 'index.html');
    }

    const body = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': CONTENT_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': 'no-store', // always serve the file you just edited
    });
    response.end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n  Frontend running at  http://localhost:${PORT}\n`);
  console.log('  Start a backend in another terminal:');
  console.log('    cd Backend && npm run dev    (Express + local MySQL)');
  console.log('    cd server  && npm run dev    (Next.js + Prisma Postgres)\n');
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try: PORT=3001 npm run dev`);
  } else {
    console.error(error);
  }
  process.exit(1);
});
