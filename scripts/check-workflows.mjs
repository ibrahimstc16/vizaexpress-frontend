// Checks every GitHub Actions workflow against the CI rules: runs only for
// pull requests and for pushes to integration/** branches; read-only token;
// no secrets, environments or write permissions; no deploy, merge, publish or
// migration commands and no paid external APIs; checkout keeps no
// credentials; every action is pinned to a full commit SHA.
// Usage: node scripts/check-workflows.mjs [workflow directory]
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ALLOWED_PUSH_BRANCHES = ['integration/**'];

const FORBIDDEN = [
  [/\bpull_request_target\b/, 'pull_request_target is not allowed'],
  [/\bworkflow_run\b/, 'workflow_run triggers are not allowed'],
  [/\$\{\{\s*secrets\./, 'secrets are not allowed'],
  [/^\s*environment\s*:/m, 'deployment environments are not allowed'],
  [/:\s*write\b|write-all/, 'write permissions are not allowed'],
  [/\bgit\s+push\b/, 'git push is not allowed'],
  [/\bgh\s+(pr\s+merge|release|workflow\s+run)\b/, 'merging, releasing or starting workflows is not allowed'],
  [/\bnpm\s+publish\b/, 'npm publish is not allowed'],
  [/(^|[\s;&|(])(npx\s+)?(vercel|railway|netlify|flyctl)(\s|$)/m, 'deployment tools are not allowed'],
  [/\/api\/migrate\b/, 'the migration endpoint must never be called'],
  [/\bapi\.(anthropic|stripe|resend)\.com\b/, 'paid external APIs are not allowed'],
  [/\b(CLAUDE_API_KEY|ANTHROPIC_API_KEY|STRIPE_SECRET_KEY|RESEND_API_KEY|DATABASE_URL)\s*:/, 'production credential variables are not allowed'],
];

const withoutComments = (text) =>
  text.split('\n').filter((line) => !/^\s*#/.test(line)).map((line) => line.replace(/\s+#\s.*$/, '')).join('\n');

// The lines of a top-level block ("on:", "permissions:"), without the key line.
function block(text, key) {
  const lines = text.split('\n');
  const start = lines.findIndex((line) => new RegExp(`^${key}\\s*:`).test(line));
  if (start === -1) return null;
  const inline = lines[start].replace(new RegExp(`^${key}\\s*:\\s*`), '').trim();
  const body = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line)) break;
    if (line.trim()) body.push(line);
  }
  return { inline, body };
}

const listValues = (inline, lines) =>
  inline.startsWith('[')
    ? inline.replace(/[[\]]/g, '').split(',').map((v) => v.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
    : lines.map((l) => l.trim()).filter((l) => l.startsWith('- ')).map((l) => l.slice(2).trim().replace(/^['"]|['"]$/g, ''));

function triggerProblems(text) {
  const on = block(text, 'on') || block(text, '"on"');
  if (!on) return ['has no "on:" triggers'];
  if (on.inline) return [`triggers must be listed as a block, not "${on.inline}", so push can name its branches`];

  const problems = [];
  const events = {};
  let current = null;
  for (const line of on.body) {
    const event = line.match(/^ {2}([\w-]+)\s*:\s*(.*)$/);
    if (event) {
      current = event[1];
      events[current] = { inline: event[2].trim(), body: [] };
    } else if (current) {
      events[current].body.push(line);
    }
  }
  for (const name of Object.keys(events)) {
    if (!['pull_request', 'push'].includes(name)) problems.push(`trigger "${name}" is not allowed (only pull_request and push to ${ALLOWED_PUSH_BRANCHES.join(', ')})`);
  }
  if (events.push) {
    const body = events.push.body;
    const keys = body.map((l) => l.match(/^ {4}([\w-]+)\s*:\s*(.*)$/)).filter(Boolean);
    if (keys.some((k) => k[1] !== 'branches')) problems.push('push may only filter on branches');
    const branchKey = keys.find((k) => k[1] === 'branches');
    if (!branchKey) {
      problems.push('push must be limited to integration/** branches');
    } else {
      const start = body.findIndex((l) => /^ {4}branches\s*:/.test(l));
      const rest = body.slice(start + 1);
      const end = rest.findIndex((l) => /^ {4}\S/.test(l));
      const branches = listValues(branchKey[2].trim(), end === -1 ? rest : rest.slice(0, end));
      const extra = branches.filter((b) => !ALLOWED_PUSH_BRANCHES.includes(b));
      if (!branches.length || extra.length) problems.push(`push may only run for ${ALLOWED_PUSH_BRANCHES.join(', ')}, not ${extra.join(', ') || 'every branch'}`);
    }
  }
  return problems;
}

export function workflowProblems(source) {
  const text = withoutComments(source);
  const problems = triggerProblems(text);

  const permissions = block(text, 'permissions');
  const granted = permissions ? [permissions.inline, ...permissions.body.map((l) => l.trim())].filter(Boolean) : [];
  if (granted.join(' ') !== 'contents: read') problems.push('top-level permissions must be exactly "contents: read"');

  for (const [pattern, message] of FORBIDDEN) {
    if (pattern.test(text)) problems.push(message);
  }

  const uses = [...text.matchAll(/^\s*(?:-\s*)?uses:\s*(\S+)/gm)].map((m) => m[1].replace(/^['"]|['"]$/g, ''));
  for (const action of uses) {
    if (!action.startsWith('./') && !/^[\w.-]+\/[\w./-]+@[0-9a-f]{40}$/.test(action)) problems.push(`${action} must be pinned to a full commit SHA`);
  }
  const checkouts = uses.filter((a) => a.startsWith('actions/checkout@')).length;
  const kept = (text.match(/persist-credentials:\s*false/g) || []).length;
  if (kept < checkouts) problems.push('every actions/checkout step must set persist-credentials: false');

  return problems;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = process.argv[2] || '.github/workflows';
  const files = readdirSync(dir).filter((name) => /\.ya?ml$/.test(name));
  let failed = false;
  for (const name of files) {
    const problems = workflowProblems(readFileSync(join(dir, name), 'utf8'));
    for (const problem of problems) console.error(`${name}: ${problem}`);
    failed ||= problems.length > 0;
  }
  if (!files.length) {
    console.error(`No workflows in ${dir}`);
    failed = true;
  }
  if (failed) process.exit(1);
  console.log(`Workflows follow the CI rules: ${files.join(', ')}`);
}
