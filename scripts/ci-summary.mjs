// Writes a short Markdown test report from JUnit XML files.
// Usage: node scripts/ci-summary.mjs "<title>" reports/a.xml [reports/b.xml ...]
import { existsSync, readFileSync } from 'node:fs';

const [title, ...files] = process.argv.slice(2);
const rows = [];
const failures = [];

for (const file of files) {
  if (!existsSync(file)) {
    rows.push(`| ${file} | report missing | | | |`);
    continue;
  }
  const xml = readFileSync(file, 'utf8');
  const cases = xml.match(/<testcase\b[^>]*?(\/>|>[\s\S]*?<\/testcase>)/g) || [];
  let failed = 0;
  let skipped = 0;
  for (const testcase of cases) {
    if (/<(failure|error)\b/.test(testcase)) {
      failed += 1;
      failures.push(`- ${(testcase.match(/name="([^"]*)"/) || [])[1] || 'unnamed test'} (${file})`);
    } else if (/<skipped\b/.test(testcase)) {
      skipped += 1;
    }
  }
  rows.push(`| ${file} | ${cases.length} | ${cases.length - failed - skipped} | ${failed} | ${skipped} |`);
}

console.log([
  `## ${title}`,
  '',
  '| Report | Tests | Passed | Failed | Skipped |',
  '| --- | --- | --- | --- | --- |',
  ...rows,
  '',
  ...(failures.length ? ['**Failed tests**', '', ...failures, ''] : []),
].join('\n'));
