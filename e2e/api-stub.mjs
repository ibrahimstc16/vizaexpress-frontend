// A synthetic API for the cross-origin browser tests. It answers sign-in and
// the application list with specimen data, sends CORS headers only for the
// allowed page origins, and records every request it receives. The test
// runner reads the record from GET /__requests (never the page).
// Usage: node e2e/api-stub.mjs <port> [allowed page origin...]
import { createServer } from 'node:http';

const [portArg, ...allowedOrigins] = process.argv.slice(2);
const requests = [];

const user = { id: 'u1', email: 'specimen@example.com', fullName: 'Specimen User', isAdmin: false };
const ROUTES = {
  'POST /api/auth/login': () => [200, { token: 'specimen-token', user }],
  'GET /api/applications': () => [200, { applications: [] }],
};

createServer((req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/__requests') {
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(requests));
    return;
  }
  const origin = req.headers.origin || null;
  requests.push({ method: req.method, path, origin });
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') {
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    }
    res.writeHead(204).end();
    return;
  }
  const route = ROUTES[`${req.method} ${path}`];
  const [status, body] = route ? route() : [404, { error: 'Not found' }];
  res.writeHead(status, { 'Content-Type': 'application/json' }).end(JSON.stringify(body));
}).listen(Number(portArg), '127.0.0.1');
