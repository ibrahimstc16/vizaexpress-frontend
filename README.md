# VizaExpress frontend

React + Vite + Tailwind CSS site for [vizaexpress.com](https://vizaexpress.com), deployed on Vercel.

## Development

```bash
npm install
VITE_API_URL=http://localhost:3000/api npm run dev
```

`VITE_API_URL` defaults to the production Railway API when it is not set.

`vercel.json` sets a Content-Security-Policy. Its `connect-src` lists the API origin, so add the new origin there whenever `VITE_API_URL` points somewhere else.

## Tests

```bash
npm test          # unit and component tests (Vitest, jsdom)
npm run test:e2e  # builds, then runs Playwright against dist/ served with the vercel.json headers
```

The browser tests mock the API and block every other host, so they need no backend. Run `npx playwright install chromium` once if Playwright has no browser yet.

## Structure

- `src/i18n/` — all UI text. `en.js` is the source; `pl.js`, `uk.js`, `tr.js`, `ru.js` must keep the same keys.
- `src/config/site.js` — plans and prices (must match the backend), document types, languages, support email.
- `src/components/ui/` — buttons, inputs, cards, badges, modal.
- `src/components/layout/` — public site, app and auth layouts.
- `src/lib/auth.jsx` — session handling and protected routes.
- `src/pages/` — one file per route; the admin panel is in Turkish.
