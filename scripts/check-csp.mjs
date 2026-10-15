// Checks the Content-Security-Policy in vercel.json: the required directives,
// and that connect-src lists exactly 'self' plus the API origins of the
// deployed environments in deploy/apiEnvironments.js.
// Usage: node scripts/check-csp.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { API_ORIGINS, checkEnvironments, deployedApiOrigins } from '../deploy/apiEnvironments.js';
import { parseCsp, siteCsp } from '../deploy/csp.js';

export { parseCsp };

const REQUIRED = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'object-src': ["'none'"],
  'frame-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'require-trusted-types-for': ["'script'"],
  'trusted-types': ["'none'"],
};

const sameSet = (a, b) => a.length === b.length && a.every((item) => b.includes(item));

export function cspProblems(vercelConfig, origins = API_ORIGINS) {
  const problems = [];
  try {
    checkEnvironments(origins);
  } catch (error) {
    problems.push(error.message);
  }
  const value = siteCsp(vercelConfig);
  if (!value) return [...problems, 'vercel.json has no Content-Security-Policy on "/(.*)"'];

  const csp = parseCsp(value);
  for (const [name, expected] of Object.entries(REQUIRED)) {
    if (!csp[name] || !sameSet(csp[name], expected)) problems.push(`${name} should be "${expected.join(' ')}"`);
  }
  for (const [name, sources] of Object.entries(csp)) {
    if (sources.includes('*')) problems.push(`${name} must not use *`);
    if (sources.some((s) => s === "'unsafe-inline'" || s === "'unsafe-eval'")) {
      problems.push(`${name} must not allow inline code or styles`);
    }
  }
  const expectedConnect = ["'self'", ...deployedApiOrigins(origins)];
  if (!csp['connect-src'] || !sameSet(csp['connect-src'], expectedConnect)) {
    problems.push(`connect-src should be "${expectedConnect.join(' ')}" (from deploy/apiEnvironments.js)`);
  }
  return problems;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const config = JSON.parse(readFileSync(fileURLToPath(new URL('../vercel.json', import.meta.url)), 'utf8'));
  const problems = cspProblems(config);
  if (problems.length) {
    for (const problem of problems) console.error(`CSP: ${problem}`);
    process.exit(1);
  }
  console.log('CSP: vercel.json matches deploy/apiEnvironments.js');
}
