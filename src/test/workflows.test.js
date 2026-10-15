// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { workflowProblems } from '../../scripts/check-workflows.mjs';

const dir = new URL('../../.github/workflows/', import.meta.url);
const committed = readdirSync(dir).map((name) => [name, readFileSync(new URL(name, dir), 'utf8')]);
const [, ci] = committed.find(([name]) => name === 'ci.yml');

describe('CI workflows', () => {
  it.each(committed)('%s follows the CI rules', (_name, text) => {
    expect(workflowProblems(text)).toEqual([]);
  });

  it.each([
    ['a push to main', (t) => t.replace("branches: ['integration/**']", 'branches: [main]'), /push may only run for integration/],
    ['a push to every branch', (t) => t.replace("  push:\n    branches: ['integration/**']\n", '  push:\n'), /limited to integration/],
    ['pull_request_target', (t) => t.replace('  pull_request:\n', '  pull_request_target:\n'), /pull_request_target/],
    ['a schedule', (t) => t.replace('  pull_request:\n', "  pull_request:\n  schedule:\n    - cron: '0 0 * * *'\n"), /trigger "schedule"/],
    ['a secret', (t) => t.replace('run: npm ci', 'run: npm ci\n        env:\n          TOKEN: ${{ secrets.TOKEN }}'), /secrets/],
    ['write permissions', (t) => t.replace('contents: read', 'contents: write'), /write permissions/],
    ['a deployment', (t) => t.replace('run: npm ci', 'run: npx vercel deploy --prod'), /deployment tools/],
    ['an environment', (t) => t.replace('    timeout-minutes: 15', '    environment: production\n    timeout-minutes: 15'), /environments/],
    ['an unpinned action', (t) => t.replace(/actions\/checkout@[0-9a-f]{40}/, 'actions/checkout@v4'), /pinned/],
    ['a checkout that keeps credentials', (t) => t.replace('persist-credentials: false', 'persist-credentials: true'), /persist-credentials/],
  ])('flags %s', (_label, change, message) => {
    const changed = change(ci);
    expect(changed).not.toBe(ci);
    expect(workflowProblems(changed).join('\n')).toMatch(message);
  });
});
