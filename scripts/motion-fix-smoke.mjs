// Targeted regression checks for the individually reviewed motion repairs.
// Each check gets its own process because atlas-loader fixtures mock Image/fetch.
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const checks=[
  'scripts/paired-registration-smoke.mjs',
  'scripts/hly3-blue-motion-smoke.mjs',
  'scripts/peterpan-registration-smoke.mjs',
  'scripts/aerial-kick-art-smoke.mjs',
  'scripts/paired-contact-smoke.mjs',
  'docs/evidence/movement-followup-20261102/live-roster-a/virtuagram-air-kick-smoke.mjs',
];
for(const check of checks){
  const result=spawnSync(process.execPath,[check],{cwd:root,stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status??1);
}
console.log(`PASS: ${checks.length} targeted motion repair checks. Browser observations are recorded separately.`);
