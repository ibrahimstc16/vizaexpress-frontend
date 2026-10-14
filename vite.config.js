import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolveApiConfig } from './deploy/apiEnvironments.js'

// Adds a connect-src policy for this build's API to index.html. It narrows
// the site-wide policy in vercel.json to the one API this build may use.
function apiConnectSrc(apiOrigin) {
  return {
    name: 'api-connect-src',
    apply: 'build',
    transformIndexHtml() {
      return [{
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ''}` },
        injectTo: 'head-prepend',
      }]
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'VERCEL_'])
  // Unit tests mock the API, so they run without an API address.
  const api = mode === 'test' ? { apiUrl: null, apiOrigin: null } : resolveApiConfig(env, { command })

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
