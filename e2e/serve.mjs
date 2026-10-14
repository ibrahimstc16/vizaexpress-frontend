// Serves the production build with the headers and rewrite from vercel.json,
// so browser tests run under the same rules as the deployed site.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
const port = Number(process.argv[2] || 4317);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

const rules = config.headers.map(({ source, headers }) => ({
  pattern: new RegExp(`^${source.replace('(.*)', '.*')}$`),
  headers,
}));

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  for (const rule of rules) {
    if (rule.pattern.test(path)) rule.headers.forEach(({ key, value }) => res.setHeader(key, value));
  }
  let file = normalize(join(root, path));
  if (!file.startsWith(root) && file + sep !== root) {
    res.writeHead(400).end();
    return;
  }
  if (!(await isFile(file))) file = join(root, 'index.html');
  res.setHeader('Content-Type', TYPES[extname(file)] || 'application/octet-stream');
  res.end(await readFile(file));
}).listen(port, '127.0.0.1');
