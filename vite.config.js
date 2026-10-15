import { readFileSync } from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolveApiConfig } from './deploy/apiEnvironments.js'
import { buildConnectSrc } from './deploy/csp.js'

// Adds a connect-src policy for this build's API to index.html. It narrows
// the site-wide policy in vercel.json to the one API this build may use; it
// cannot widen it (see deploy/csp.js).
function apiConnectSrc(apiOrigin) {
  return {
    name: 'api-connect-src',
    apply: 'build',
    transformIndexHtml() {
      return [{
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: buildConnectSrc(apiOrigin) },
        injectTo: 'head-prepend',
      }]
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'VERCEL_'])
  // Unit tests mock the API, so they run without an API address.
  // Deployed builds are served with vercel.json's policy, which must allow
  // this build's API too; resolveApiConfig checks it.
  const siteConfig = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'))
  const api = mode === 'test' ? { apiUrl: null, apiOrigin: null } : resolveApiConfig(env, { command, siteConfig })

  return {
    plugins: [react(), apiConnectSrc(api.apiOrigin)],
    define: {
      __API_URL__: JSON.stringify(api.apiUrl),
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{js,jsx}'],
      setupFiles: ['src/test/setup.js'],
    },
  }
})
