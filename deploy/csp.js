// The two Content-Security-Policies a deployed page gets: the site-wide one
// Vercel sends from vercel.json, and the one each build adds to index.html
// (vite.config.js). The browser applies both and allows a request only when
// every policy allows it. The build's policy can narrow the site-wide one but
// never widen it, so the API origin of every deployed build must also be in
// vercel.json's connect-src. vite.config.js stops a deployed build when it is
// not, and npm run check:csp keeps vercel.json in line with apiEnvironments.js.

export function parseCsp(value) {
  return Object.fromEntries(
    value.split(';').map((part) => part.trim()).filter(Boolean).map((part) => {
      const [name, ...sources] = part.split(/\s+/);
      return [name.toLowerCase(), sources];
    })
  );
}

// The policy vercel.json sends with every page, or null.
export function siteCsp(vercelConfig) {
  const site = (vercelConfig.headers || []).find((h) => h.source === '/(.*)');
  return site?.headers.find((h) => h.key === 'Content-Security-Policy')?.value ?? null;
}

// The policy a build adds to index.html: its own origin and its API, if any.
export function buildConnectSrc(apiOrigin) {
  return `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ''}`;
}

// Why a build with this API origin would be blocked by vercel.json, or null.
export function cspDisagreement(vercelConfig, apiOrigin) {
  const policy = siteCsp(vercelConfig);
  if (!policy) return 'vercel.json has no Content-Security-Policy for "/(.*)"';
  const site = parseCsp(policy);
  const allowed = site['connect-src'] || site['default-src'] || [];
  const missing = parseCsp(buildConnectSrc(apiOrigin))['connect-src'].filter((source) => !allowed.includes(source));
  if (!missing.length) return null;
  return `vercel.json connect-src does not allow ${missing.join(' ')}. Browsers apply both policies, so every API request of this build would be blocked. Add the origin to vercel.json in the same reviewed change.`;
}

// A copy of vercel.json whose connect-src also allows these origins. Only the
// browser tests use it, to stand in for an approved API on another origin.
export function withConnectSources(vercelConfig, origins) {
  const copy = structuredClone(vercelConfig);
  const site = copy.headers.find((h) => h.source === '/(.*)');
  const header = site.headers.find((h) => h.key === 'Content-Security-Policy');
  header.value = header.value
    .split(';')
    .map((part) => (part.trim().startsWith('connect-src') ? `${part.trim()} ${origins.join(' ')}` : part.trim()))
    .join('; ');
  return copy;
}
