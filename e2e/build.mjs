// Builds the two bundles the browser tests use: one wired to the mocked API on
// the test server's own origin, and a preview build with no API at all.
import { build } from 'vite';

const builds = [
  { outDir: 'dist', env: { VITE_APP_ENV: 'test', VITE_API_URL: 'http://127.0.0.1:4317/api' } },
  { outDir: 'dist-preview', env: { VITE_APP_ENV: 'preview', VITE_API_URL: '' } },
];

for (const { outDir, env } of builds) {
  Object.assign(process.env, env);
  await build({ build: { outDir, emptyOutDir: true }, logLevel: 'warn' });
  console.log(`built ${outDir} (${env.VITE_APP_ENV})`);
}
