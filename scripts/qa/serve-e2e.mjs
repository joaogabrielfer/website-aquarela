// scripts/qa/serve-e2e.mjs
// Servidor estático mínimo para e2e (sem dependências).
// Mapeia rotas do Astro (trailingSlash never, format file):
//   / -> index.html, /ensino -> ensino.html, /galeria/x -> galeria/x.html
// Desconhecido -> 404.html com status 404 (comportamento R03/R02).
// Uso: node scripts/qa/serve-e2e.mjs --dir dist-e2e-public --port 4311
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(name);
  if (i !== -1 && args[i + 1]) return args[i + 1];
  return fallback;
};

const dir = path.resolve(
  getArg('--dir', process.env.E2E_DIR) ?? 'dist-e2e-public',
);
const port = Number(getArg('--port', process.env.E2E_PORT) ?? 4311);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const safeJoin = (base, target) => {
  const resolved = path.resolve(base, `.${target}`);
  return resolved === base || resolved.startsWith(`${base}${path.sep}`)
    ? resolved
    : null;
};

const send = (res, status, file) => {
  const ext = path.extname(file).toLowerCase();
  res.writeHead(status, {
    'content-type': MIME[ext] ?? 'application/octet-stream',
  });
  fs.createReadStream(file).pipe(res);
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }
  if (pathname !== '/' && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  const candidates =
    pathname === '/'
      ? ['index.html']
      : [`${pathname.slice(1)}.html`, `${pathname.slice(1)}/index.html`];

  for (const rel of candidates) {
    const file = safeJoin(dir, `/${rel}`);
    if (file && fs.existsSync(file) && fs.statSync(file).isFile()) {
      send(res, 200, file);
      return;
    }
  }

  // Asset direto (/_astro/..., /brand/..., /fonts/...).
  const direct = safeJoin(dir, pathname);
  if (direct && fs.existsSync(direct) && fs.statSync(direct).isFile()) {
    send(res, 200, direct);
    return;
  }

  const notFound = path.join(dir, '404.html');
  if (fs.existsSync(notFound)) {
    send(res, 404, notFound);
    return;
  }
  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(port, '127.0.0.1', () => {
  console.log(`[serve-e2e] ${dir} em http://127.0.0.1:${port}`);
});
