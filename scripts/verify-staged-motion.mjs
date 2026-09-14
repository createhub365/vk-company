// The build runs against the working tree. Require its relevant inputs to match
// the index exactly, so partial staging cannot make a bad commit look good.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
const index = new Map(git('ls-files', '--stage', '-z').split('\0').filter(Boolean).map(line => {
  const tab = line.indexOf('\t');
  return [line.slice(tab + 1), line.slice(0, tab).split(' ')[1]];
}));
const roots = ['app', 'components', 'lib', 'styles', 'scripts', '.githooks'];
const relevant = file => roots.some(root => file.startsWith(`${root}/`)) && /\.(?:tsx?|mjs|css|json)$/.test(file)
  || file === '.githooks/pre-commit';
function walk(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(`${path}/${entry.name}`) : [`${path}/${entry.name}`]);
}
const files = new Set([...index.keys()].filter(relevant));
for (const root of roots) for (const file of walk(root).filter(relevant)) files.add(file);
for (const file of ['package.json', 'package-lock.json', 'next.config.ts', 'tsconfig.json', 'postcss.config.mjs', 'public/_headers', 'MOTION_AUDIT.md', 'artifacts/motion-audit/baseline.json']) files.add(file);
const baseline = JSON.parse(readFileSync('artifacts/motion-audit/baseline.json', 'utf8'));
for (const image of Object.keys(baseline.images)) if (!image.startsWith('out/_next/')) files.add(image.replace(/^out\//, 'public/'));
const mismatches = [];
for (const file of files) {
  let actual;
  try { actual = git('hash-object', '--', file).trim(); } catch { actual = undefined; }
  if (!index.has(file) || actual !== index.get(file)) mismatches.push(file);
}
if (mismatches.length) {
  console.error('Commit blocked: stage the exact content/build inputs before verification. The hook will not verify different working-tree code on behalf of the index.\n' + mismatches.map(file => `  ${file}`).join('\n'));
  process.exit(1);
}
console.log('Staged build inputs match the working tree.');
