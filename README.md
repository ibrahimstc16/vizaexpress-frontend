# VizaExpress frontend

React + Vite + Tailwind CSS site for [vizaexpress.com](https://vizaexpress.com), deployed on Vercel.

## Development

```bash
npm install
VITE_API_URL=http://localhost:3000/api npm run dev
```

Without `VITE_API_URL` the dev server runs with no API: pages load, and every request is refused in the browser.

## API configuration

The API address is set per environment at build time and has no default.

| Build | `VITE_APP_ENV` | `VITE_API_URL` |
| --- | --- | --- |
| Vercel Production | set automatically from `VERCEL_ENV=production` | Required. Must be an origin listed under `production` in `deploy/apiEnvironments.js` |
| Staging (a Vercel Preview branch with its own variables) | `staging` | Required. Must be listed under `staging` |
| Vercel Preview | set automatically from `VERCEL_ENV=preview` | Optional. Without it the preview has no API. With it, it must be listed under `preview` (the staging API, never production) |
| Local build | `production`, `staging`, `preview` or `test` | As above |

`vite.config.js` stops the build when the address is missing where required, uses a retired host, or is not listed for that environment. Each build also adds a `connect-src` policy for its own API to `index.html`.

To add an API origin, change `deploy/apiEnvironments.js` and the `connect-src` in `vercel.json` together; `npm run check:csp` and the unit tests fail when they differ, and a production origin can never be listed for staging or preview.

## Tests

```bash
npm test          # unit and component tests (Vitest, jsdom)
npm run test:e2e  # builds two bundles (mocked API, and preview without an API), then runs Playwright against them served with the vercel.json headers
npm run check:csp # vercel.json CSP matches deploy/apiEnvironments.js
```

The browser tests mock the API and block every other host, so they need no backend. Run `npx playwright install chromium` once if Playwright has no browser yet.

## Structure

- `src/i18n/` — all UI text. `en.js` is the source; `pl.js`, `uk.js`, `tr.js`, `ru.js` must keep the same keys.
- `src/config/site.js` — plans and prices (must match the backend), document types, languages, support email.
- `src/components/ui/` — buttons, inputs, cards, badges, modal.
- `src/components/layout/` — public site, app and auth layouts.
- `src/lib/auth.jsx` — session handling and protected routes.
- `src/pages/` — one file per route; the admin panel is in Turkish.
