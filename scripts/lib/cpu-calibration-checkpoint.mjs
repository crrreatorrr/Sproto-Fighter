// Advisory eight-archetype checkpoint. The harness checkout pins the independent
// reference implementation; this script never imports the production CPU as reference.
// node scripts/lib/cpu-calibration-checkpoint.mjs <core-entry> <harness-root> <out.json> [repeats]
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [entry, harnessRoot, out, count = '4'] = process.argv.slice(2), repeats = Number(count);
assert.ok(entry && harnessRoot && out, 'supply core entry, fixed harness root and output');
assert.ok(Number.isSafeInteger(repeats) && repeats > 0, 'repeats must be a positive integer');
const moduleAt = name => import(pathToFileURL(resolve(harnessRoot, 'scripts/lib/' + name)).href);
const { loadBalanceCore } = await moduleAt('balance-core.mjs');
const { playMatch, matchSeeds } = await moduleAt('balance-runner.mjs');
const { REFERENCE_BOT_VERSION } = await moduleAt('balance-bots.mjs');
assert.equal(REFERENCE_BOT_VERSION, 'reference-v2-persistent-delay18', 'reference policy changed; do not compare this checkpoint with v2 reports');
const core = await loadBalanceCore({ entry: resolve(entry) });
const fighters = ['highsproto', 'rivet', 'vela', 'bront', 'mox', 'sproto1815', 'duo', 'sirbitcoin'];
assert.ok(fighters.every(id => core.PLAYABLE_FIGHTERS.includes(id)), 'checkpoint IDs must be installed');
const bouts = [], summary = [];
for (const skill of [1, 4, 7, 10]) {
    let wins = 0, losses = 0, draws = 0, hp = 0, damage = 0;
    for (const opponent of fighters) for (let repeat = 0; repeat < repeats; repeat++) for (const referenceSlot of [0, 1]) {
        const ids = referenceSlot === 0 ? ['highsproto', opponent] : [opponent, 'highsproto'];
        const controllers = referenceSlot === 0 ? ['reference', 'cpu'] : ['cpu', 'reference'];
        const initialSeeds = matchSeeds(20261105, ids, controllers, repeat, 'calibration-checkpoint-v1');
        const bout = playMatch(core, ids, { skill, referenceSlot, initialSeeds, repeat });
        if (bout.rawWinner === 1 - referenceSlot) wins++;
        else if (bout.rawWinner === referenceSlot) losses++; else draws++;
        hp += bout.hp[1 - referenceSlot]; damage += bout.totalDamage[1 - referenceSlot];
        bouts.push({ ...bout, referenceSlot });
    }
    const trials = wins + losses + draws;
    const row = { skill, wins, losses, draws, rate: wins + losses ? wins / (wins + losses) : null,
        meanCpuHp: hp / trials, meanCpuDamage: damage / trials };
    summary.push(row); console.log(row);
}
const referenceSourceSha256 = createHash('sha256').update(readFileSync(resolve(harnessRoot, 'scripts/lib/balance-bots.mjs'))).digest('hex');
writeFileSync(out, JSON.stringify({ reference: REFERENCE_BOT_VERSION, referenceSourceSha256,
    entry: resolve(entry), repeats, fighters, seed: 20261105, summary, bouts }, null, 2) + '\n');
