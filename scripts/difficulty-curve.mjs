#!/usr/bin/env node
// Advisory actual-route CPU measurements against one fixed reference controller.
// node scripts/difficulty-curve.mjs --repeats 1 --out docs/balance/curve-2026-11-05
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { bundle, dataUrl } from './lib/load.mjs';
import { loadBalanceCore, sourceMetadata } from './lib/balance-core.mjs';
import { runCurve } from './lib/balance-curve.mjs';

export async function main(args=process.argv.slice(2)) {
  const options = { fighter:'highsproto', seed:20261105, repeats:1, maxFrames:3600, out:`docs/balance/curve-${new Date().toISOString().slice(0,10)}` };
  for (let i=0;i<args.length;i++) {
    const key = { '--fighter':'fighter', '--seed':'seed', '--repeats':'repeats', '--max-frames':'maxFrames', '--out':'out' }[args[i]];
    assert.ok(key, `unknown argument: ${args[i]}`);
    options[key] = ['seed','repeats','maxFrames'].includes(key) ? Number(args[++i]) : args[++i];
  }
  assert.ok(Number.isSafeInteger(options.seed) && options.seed >= 0 && options.seed <= 4294967295, '--seed must be uint32');
  for(const key of ['repeats','maxFrames'])assert.ok(Number.isSafeInteger(options[key])&&options[key]>0, `${key} must be a positive integer`);
  const core = await loadBalanceCore(), source = sourceMetadata();
  assert.ok(Array.isArray(core.CPU_SKILLS), 'curve requires parameterized CPU');
  const routeCode = await bundle('src/storyProgress.ts');
  const { STORY_ENCOUNTERS } = await import(dataUrl(routeCode));
  const difficultyCode = await bundle('src/difficulty.ts');
  const { storyDifficulty } = await import(dataUrl(difficultyCode));
  const report = { source:{ ...source, routeAndDifficultySha256:createHash('sha256').update(routeCode).update(difficultyCode).digest('hex') }, ...await runCurve(core, STORY_ENCOUNTERS, storyDifficulty, { ...options,
    progress:(count,total)=>console.error(`curve: ${count}/${total} encounters`) }) };
  const after = sourceMetadata();
  assert.equal(source.sourceSha256, after.sourceSha256, 'simulation changed during curve measurement');
  assert.equal(source.harnessSha256, after.harnessSha256, 'harness changed during curve measurement');
  const prefix=options.out.replace(/\.(json|md)$/,'');
  mkdirSync(dirname(prefix),{recursive:true});
  writeFileSync(prefix+'.json',JSON.stringify(report,null,2)+'\n');
  const percent = n => n === null ? 'n/a' : (n*100).toFixed(1)+'%';
  const lines=['# Story difficulty curve (advisory)','',`Source \`${source.commit}\`; simulation \`${source.simVersion}\`; reference \`${report.referenceBotVersion}\`.`, '',
    `Fixed reference fighter: ${options.fighter}; tournament seed ${options.seed}; ${options.repeats} independent repetitions, both seats, ${options.maxFrames}-frame cap.`, '',
    ...report.limitations.map(s=>'- '+s), '', '| Encounter | Opponents | Skill | Trials | CPU wins | Reference wins | Raw draws | CPU decided rate | Wilson 95% |', '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |'];
  for(const e of report.encounters)lines.push(`| ${e.index+1} · ${e.id} | ${e.opponents.join(' → ')} | ${e.skill.toFixed(3)} | ${e.summary.trials} | ${e.summary.cpuWins} | ${e.summary.referenceWins} | ${e.summary.rawDraws} | ${percent(e.summary.cpuDecidedWinRate)} | ${e.summary.cpuDecidedWilson95?.map(percent).join('–')??'n/a'} |`);
  writeFileSync(prefix+'.md',lines.join('\n')+'\n');
  console.log(`Wrote ${report.encounters.length} encounter rows to ${prefix}.{json,md}; calibration and dedicated boss-form coverage remain unverified.`);
  return report;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
