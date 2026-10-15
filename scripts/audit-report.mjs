// Dependency audit with an explicit list of known advisories.
//
// Runs `npm audit` and compares every advisory with audit/known-advisories.json.
// Nothing is hidden: known advisories are listed on every run (as warnings),
// new ones as errors, and known entries that no longer apply are flagged for
// removal. The job fails when a production dependency has a new advisory of
// moderate or higher severity, or any high or critical advisory, listed or
// not. Adding an entry to the known list is a reviewed change, never
// automatic, and it cannot let a high or critical one through.
//
// Usage: node scripts/audit-report.mjs [path/to/known-advisories.json]
import { spawnSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';

const BLOCKING = new Set(['moderate', 'high', 'critical']);
const ALWAYS_BLOCKING = new Set(['high', 'critical']);
const knownPath = process.argv[2] || 'audit/known-advisories.json';

function audit(args) {
  const run = spawnSync('npm', ['audit', '--json', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  let report;
  try {
    report = JSON.parse(run.stdout);
  } catch {
    throw new Error(`npm audit ${args.join(' ')} did not return JSON: ${run.stderr.slice(0, 500)}`);
  }
  if (report.error) throw new Error(`npm audit failed: ${report.error.summary || report.error.code}`);
  const found = new Map();
  for (const entry of Object.values(report.vulnerabilities || {})) {
    for (const via of entry.via) {
      if (typeof via !== 'object') continue;
      const id = via.url.split('/').pop();
      found.set(`${id} ${via.name}`, { id, package: via.name, severity: via.severity, title: via.title, url: via.url });
    }
  }
  return found;
}

const all = audit([]);
const production = audit(['--omit=dev']);
const known = JSON.parse(readFileSync(knownPath, 'utf8')).advisories;
const knownKeys = new Set(known.map((k) => `${k.id} ${k.package}`));

const rows = [...all.entries()].map(([key, a]) => ({
  ...a,
  scope: production.has(key) ? 'production' : 'development',
  status: knownKeys.has(key) ? 'known' : 'new',
}));
const resolved = known.filter((k) => !all.has(`${k.id} ${k.package}`));
const blocking = rows.filter(
  (r) => r.scope === 'production' && (ALWAYS_BLOCKING.has(r.severity) || (r.status === 'new' && BLOCKING.has(r.severity)))
);

const order = { critical: 0, high: 1, moderate: 2, low: 3, info: 4 };
rows.sort((a, b) => (a.status === b.status ? 0 : a.status === 'new' ? -1 : 1) || order[a.severity] - order[b.severity] || a.package.localeCompare(b.package));

const count = (list, status, scope) => list.filter((r) => r.status === status && r.scope === scope).length;
const lines = [
  '## Dependency audit',
  '',
  `| | Production | Development |`,
  `| --- | --- | --- |`,
  `| New advisories | ${count(rows, 'new', 'production')} | ${count(rows, 'new', 'development')} |`,
  `| Known advisories (listed in \`${knownPath}\`) | ${count(rows, 'known', 'production')} | ${count(rows, 'known', 'development')} |`,
  `| Known entries no longer reported | ${resolved.length} | |`,
  '',
  blocking.length
    ? `**Failed:** ${blocking.length} production advisor${blocking.length === 1 ? 'y' : 'ies'} that must be fixed (new and moderate or higher, or high or critical).`
    : '**Passed:** no high or critical advisory and no new moderate advisory in production dependencies. Known advisories stay open until fixed.',
  '',
  '| Status | Severity | Scope | Package | Advisory |',
  '| --- | --- | --- | --- | --- |',
  ...rows.map((r) => `| ${r.status} | ${r.severity} | ${r.scope} | ${r.package} | [${r.id}](${r.url}) ${r.title.replace(/\|/g, '\\|')} |`),
  ...resolved.map((k) => `| no longer reported | ${k.severity} | ${k.scope} | ${k.package} | ${k.id}: remove from the known list |`),
  '',
];

const summary = lines.join('\n');
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
console.log(summary);

if (process.env.GITHUB_ACTIONS) {
  for (const r of rows) {
    const level = blocking.includes(r) ? 'error' : 'warning';
    console.log(`::${level} title=${r.status === 'new' ? 'New' : 'Known'} ${r.severity} advisory (${r.scope})::${r.package} ${r.id} ${r.title}`);
  }
  for (const k of resolved) console.log(`::notice title=Known advisory no longer reported::${k.package} ${k.id} can be removed from ${knownPath}`);
}

process.exit(blocking.length ? 1 : 0);
