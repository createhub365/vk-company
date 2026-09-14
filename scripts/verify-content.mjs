// Always rebuild: an old out/ must never conceal a change in the source tree.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const expectedBaseline = 'd8ffe93dda487660a81988b021e55b7c2786679a02760437bcbdf429d1614cda';
const actualBaseline = createHash('sha256').update(readFileSync('artifacts/motion-audit/baseline.json')).digest('hex');
if (actualBaseline !== expectedBaseline) {
  console.error('Content contract changed. Restore the original Stage 1 baseline; do not recapture it.');
  process.exit(1);
}
for (const [command, args] of [['npm', ['run', 'build']], [process.execPath, ['scripts/audit-motion-content.mjs']]]) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) { console.error(result.error.message); process.exit(1); }
  if (result.status !== 0) process.exit(result.status || 1);
}
