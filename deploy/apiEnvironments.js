// Which API each kind of build may talk to. The address itself comes from
// VITE_API_URL at build time and has no default: vite.config.js checks it
// here and stops the build when it is missing or not allowed.
//
// vercel.json's connect-src must list exactly 'self' plus every origin in
// API_ORIGINS (npm run check:csp and the unit tests compare them).

// Deployed environments. Production origins must never appear in the staging
// or preview lists; previews use the staging API.
export const API_ORIGINS = {
  production: [],
  staging: [],
  preview: [],
};

// Local builds only; never deployed.
export const LOCAL_API_ORIGINS = {
  development: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  test: ['http://127.0.0.1:4317'],
};

// Retired API hosts that no build may use.
export const RETIRED_API_HOSTS = ['vizaexpress-backend-production.up.railway.app'];

// Builds that may run without an API (every request is refused in the browser).
const MAY_RUN_WITHOUT_API = new Set(['preview', 'development']);

export class ApiConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ApiConfigError';
  }
}

export function deployedApiOrigins(origins = API_ORIGINS) {
  return [...new Set(Object.values(origins).flat())];
}

// Throws when the lists break the rules above.
export function checkEnvironments(origins = API_ORIGINS, local = LOCAL_API_ORIGINS) {
  for (const [env, list] of Object.entries(origins)) {
    for (const origin of list) {
      const url = new URL(origin);
      if (url.origin !== origin) throw new ApiConfigError(`${env}: "${origin}" must be a bare origin like https://api.example.com`);
      if (url.protocol !== 'https:') throw new ApiConfigError(`${env}: "${origin}" must use https`);
      if (RETIRED_API_HOSTS.includes(url.hostname)) throw new ApiConfigError(`${env}: "${origin}" is a retired API host`);
    }
  }
  for (const origin of origins.production || []) {
    for (const env of Object.keys(origins).filter((name) => name !== 'production')) {
      if (origins[env].includes(origin)) throw new ApiConfigError(`${origin} is a production API origin and cannot be used by ${env} builds`);
    }
  }
  for (const env of Object.keys(local)) {
    if (origins[env]) throw new ApiConfigError(`"${env}" cannot be both a deployed and a local environment`);
  }
}

export function appEnvironment(env, command = 'build') {
  if (env.VITE_APP_ENV) return env.VITE_APP_ENV;
  if (env.VERCEL_ENV === 'production' || env.VERCEL_ENV === 'preview') return env.VERCEL_ENV;
  return command === 'serve' ? 'development' : null;
}

// Returns { appEnv, apiUrl, apiOrigin }; apiUrl is null for a build without
// an API. Throws ApiConfigError when the configuration is missing or unsafe.
export function resolveApiConfig(env, { command = 'build', origins = API_ORIGINS, local = LOCAL_API_ORIGINS } = {}) {
  checkEnvironments(origins, local);

  const appEnv = appEnvironment(env, command);
  if (!appEnv) {
    throw new ApiConfigError('Set VITE_APP_ENV to production, staging, preview or test for this build (Vercel sets VERCEL_ENV automatically).');
  }
  const allowed = origins[appEnv] || local[appEnv];
  if (!allowed) throw new ApiConfigError(`Unknown VITE_APP_ENV "${appEnv}".`);

  const raw = String(env.VITE_API_URL || '').trim();
  if (!raw) {
    if (MAY_RUN_WITHOUT_API.has(appEnv)) return { appEnv, apiUrl: null, apiOrigin: null };
    throw new ApiConfigError(`VITE_API_URL is required for ${appEnv} builds.`);
  }

  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new ApiConfigError('VITE_API_URL is not a valid URL.');
  }
  if (RETIRED_API_HOSTS.includes(url.hostname)) {
    throw new ApiConfigError(`VITE_API_URL points at a retired API host (${url.hostname}).`);
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new ApiConfigError('VITE_API_URL must not contain credentials, a query or a fragment.');
  }
  if (!allowed.includes(url.origin)) {
    throw new ApiConfigError(
      `${url.origin} is not an allowed API origin for ${appEnv} builds. Add it to deploy/apiEnvironments.js and vercel.json in a reviewed change.`
    );
  }
  return { appEnv, apiUrl: url.href.replace(/\/$/, ''), apiOrigin: url.origin };
}
