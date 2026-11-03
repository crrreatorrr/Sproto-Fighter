// The simulation fingerprint shared with the hub verifier must match the code.
// If this fails, run: node scripts/build-sim-bundle.mjs (and refresh the hub's copy).
import { spawnSync } from 'node:child_process';
const result = spawnSync(process.execPath, ['scripts/build-sim-bundle.mjs', '--check'], { stdio: 'inherit' });
process.exit(result.status ?? 1);
