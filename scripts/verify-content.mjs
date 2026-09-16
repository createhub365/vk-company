// Always rebuild: an old out/ must never conceal a change in the source tree.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const expectedBaseline = '7d2c54683a246080b8fd6c6557901bf8f3870cac5a3385e01f098febcde3e541';
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
