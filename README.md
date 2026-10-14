# VizaExpress frontend

React + Vite + Tailwind CSS site for [vizaexpress.com](https://vizaexpress.com), deployed on Vercel.

## Development

```bash
npm install
VITE_API_URL=http://localhost:3000/api npm run dev
```

`VITE_API_URL` defaults to the production Railway API when it is not set.

## Structure

- `src/i18n/` — all UI text. `en.js` is the source; `pl.js`, `uk.js`, `tr.js`, `ru.js` must keep the same keys.
- `src/config/site.js` — plans and prices (must match the backend), document types, languages, support email.
- `src/components/ui/` — buttons, inputs, cards, badges, modal.
- `src/components/layout/` — public site, app and auth layouts.
- `src/lib/auth.jsx` — session handling and protected routes.
- `src/pages/` — one file per route; the admin panel is in Turkish.
