// Advisory shared-feature fit; never writes production tuning values.
// node scripts/lib/budget-calibration.mjs REPORT.json[,OTHER.json] SOURCE_ROOT OUT
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [files, checkout, out] = process.argv.slice(2);
assert.ok(files && checkout && out, 'supply reports, frozen source checkout and output prefix');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const reports = files.split(',').map(path => {
  const bytes = readFileSync(path);
  return { path, sha256:hash(bytes), value:JSON.parse((path.endsWith('.gz') ? gunzipSync(bytes) : bytes).toString()) };
});
const { loadBalanceCore, sourceMetadata } = await import(pathToFileURL(resolve(checkout, 'scripts/lib/balance-core.mjs')));
const source = sourceMetadata();
for (const r of reports) assert.equal(r.value.source.sourceSha256, source.sourceSha256, 'report must match frozen production source');
const core = await loadBalanceCore();
const names = ['lightDamagePerCommitment', 'heavyDamagePerCommitment', 'ordinaryProjectileThreat', 'walkSpeed',
  'nearestLightReach', 'nearestHeavyReach', 'lightBlockAdvantageNominal', 'heavyBlockAdvantageNominal'];
const profiles = {};
for (const id of core.PLAYABLE_FIGHTERS) {
  const f = core.createState(id).fighters[0], light = core.getMove(f, 'light'), heavy = core.getMove(f, 'heavy'), bolt = core.getMove(f, 'bolt');
  const shot = core.COMBAT_STYLES[id].projectile;
  const dpf = m => m.damage / (m.startup + m.active + m.recovery);
  // step() cleans up after act(): first-contact to a fresh noncancellable
  // action includes one further action tick, verified by the frame-data tool.
  const advantage = m => m.blockstun - (m.active + m.recovery + 1);
  profiles[id] = { archetype:core.BALANCE_KITS[id].archetype, beam:!!shot.beamLength,
    features:[dpf(light), dpf(heavy), shot.beamLength ? null : bolt.damage * shot.speed / (bolt.startup + bolt.recovery),
      core.ROSTER[id].speed, light.range - core.bodySpread(id), heavy.range - core.bodySpread(id), advantage(light), advantage(heavy)],
    existingBudget:core.budgetScore(core.BALANCE_KITS[id].moves, core.BALANCE_KITS[id].projectileSpeed, core.BALANCE_KITS[id].template) };
}
// Beams have instantaneous finite reach, not ordinary shot velocity. Their single
// roster example cannot identify a general beam price, so fit no beam coefficient.
const ordinary = Object.values(profiles).filter(p => !p.beam);
const means = names.map((_, i) => ordinary.reduce((n, p) => n + p.features[i], 0) / ordinary.length);
const scales = names.map((_, i) => Math.sqrt(ordinary.reduce((n, p) => n + (p.features[i] - means[i]) ** 2, 0) / ordinary.length));
const included = names.map((_, i) => i).filter(i => scales[i] > 1e-10);
const dropped = names.filter((_, i) => !included.includes(i));
const budgetMean = ordinary.reduce((n, p) => n + p.existingBudget, 0) / ordinary.length;
const budgetScale = Math.sqrt(ordinary.reduce((n, p) => n + (p.existingBudget - budgetMean) ** 2, 0) / ordinary.length);
const rows = [], keys = new Set();
let excludedBeams = 0, excludedRawDraws = 0;
for (const r of reports) for (const level of r.value.levels) for (const m of level.matches) {
  const key = JSON.stringify([level.skill, m.fighters, m.repeat, m.initialSeeds]);
  assert.ok(!keys.has(key), 'duplicate bout'); keys.add(key);
  if (m.rawWinner !== 0 && m.rawWinner !== 1) { excludedRawDraws++; continue; }
  const [a, b] = m.fighters.map(id => profiles[id]);
  if (a.beam || b.beam) { excludedBeams++; continue; }
  const pair = [...m.fighters].sort().join(':');
  const fold = createHash('sha256').update(pair).digest().readUInt32BE(0) % 10;
  rows.push({ pair, fold, repeat:m.repeat, skill:level.skill, y:m.rawWinner === 0 ? .5 : -.5,
    x:included.map(i => (a.features[i] - b.features[i]) / scales[i]),
    budget:[(a.existingBudget - b.existingBudget) / budgetScale] });
}
assert.ok(rows.every(r => r.repeat === 0 || r.repeat === 1), 'this protocol requires exactly repetitions 0 and 1');
assert.deepEqual([...new Set(rows.map(r => r.skill))].sort(), [4,7], 'both Normal and Hard are required');
const innerFit = rows.filter(r => r.fold >= 4 && r.repeat === 0);
const innerTune = rows.filter(r => r.fold >= 2 && r.fold < 4 && r.repeat === 0);
const finalFit = rows.filter(r => r.fold >= 2 && r.repeat === 0);
const pairHoldout = rows.filter(r => r.fold < 2);
const seedHoldout = rows.filter(r => r.fold >= 2 && r.repeat === 1);
assert.ok([innerFit, innerTune, finalFit, pairHoldout, seedHoldout].every(a => a.length > 100), 'insufficient fit/tuning/holdout coverage');

function fit(data, field, lambda) {
  const size = data[0][field].length, matrix = Array.from({length:size}, () => Array(size).fill(0)), target = Array(size).fill(0);
  for (const row of data) for (let j = 0; j < size; j++) {
    target[j] += row[field][j] * row.y / data.length;
    for (let k = 0; k < size; k++) matrix[j][k] += row[field][j] * row[field][k] / data.length;
  }
  const weights = Array(size).fill(0);
  for (let iteration = 0; iteration < 2000; iteration++) {
    let change = 0;
    for (let j = 0; j < size; j++) {
      let residual = target[j];
      for (let k = 0; k < size; k++) if (j !== k) residual -= matrix[j][k] * weights[k];
      const next = Math.max(0, residual / (matrix[j][j] + lambda));
      change = Math.max(change, Math.abs(next - weights[j])); weights[j] = next;
    }
    if (change < 1e-12) break;
  }
  return weights;
}
function evaluate(data, field, weights) {
  let brier = 0, correct = 0;
  for (const row of data) {
    const raw = .5 + row[field].reduce((n, x, i) => n + x * weights[i], 0), probability = Math.max(.01, Math.min(.99, raw));
    brier += (probability - (row.y + .5)) ** 2;
    correct += Number((probability >= .5) === (row.y > 0));
  }
  return { bouts:data.length, independentPairs:new Set(data.map(r => r.pair)).size,
    brier:brier / data.length, accuracy:correct / data.length, neutralBrier:.25 };
}
function calibrate(field) {
  const tuning = [.0001,.001,.01,.1,1,10].map(lambda => ({lambda, score:evaluate(innerTune, field, fit(innerFit, field, lambda))}));
  tuning.sort((a, b) => a.score.brier - b.score.brier);
  const lambda = tuning[0].lambda, weights = fit(finalFit, field, lambda);
  return { lambda, weights, tuning, pairHoldout:evaluate(pairHoldout, field, weights),
    seedHoldout:evaluate(seedHoldout, field, weights),
    bySkill:[4,7].map(skill => ({skill, pairHoldout:evaluate(pairHoldout.filter(r => r.skill === skill), field, weights),
      seedHoldout:evaluate(seedHoldout.filter(r => r.skill === skill), field, weights)})) };
}
const shared = calibrate('x'), existing = calibrate('budget');
// Paired-seat results and repeat seeds within a matchup are dependent. Resample
// canonical matchup clusters, never individual bouts, for this descriptive CI.
const clusters = new Map();
for(const row of pairHoldout){
  const loss=(field,weights)=>{
    const p=Math.max(.01,Math.min(.99,.5+row[field].reduce((n,x,i)=>n+x*weights[i],0)));
    return (p-row.y-.5)**2;
  };
  const c=clusters.get(row.pair)??{delta:0,bouts:0};
  c.delta+=loss('x',shared.weights)-loss('budget',existing.weights);c.bouts++;clusters.set(row.pair,c);
}
const pool=[...clusters.values()],bootstrap=[];let randomState=20261105;
for(let repeat=0;repeat<1000;repeat++){
  let delta=0,bouts=0;
  for(let i=0;i<pool.length;i++){
    randomState=randomState*16807%2147483647;
    const c=pool[Math.floor((randomState-1)/2147483646*pool.length)];delta+=c.delta;bouts+=c.bouts;
  }
  bootstrap.push(delta/bouts);
}
bootstrap.sort((a,b)=>a-b);
const clusterBootstrap={unit:'canonical matchup',replicates:1000,seed:20261105,
  deltaSharedMinusExisting:shared.pairHoldout.brier-existing.pairHoldout.brier,
  percentile95:[bootstrap[Math.floor(bootstrap.length*.025)],bootstrap[Math.floor(bootstrap.length*.975)]]};
const correlated = [];
for (let j = 0; j < included.length; j++) for (let k = j + 1; k < included.length; k++) {
  const a = included[j], b = included[k];
  const r = ordinary.reduce((n, p) => n + (p.features[a] - means[a]) * (p.features[b] - means[b]), 0) / (ordinary.length * scales[a] * scales[b]);
  if (Math.abs(r) >= .8) correlated.push({first:names[a], second:names[b], correlation:r});
}
assert.equal(sourceMetadata().sourceSha256, source.sourceSha256, 'production source changed during analysis');
const result = { source, reports:reports.map(r => ({file:r.path, sha256:r.sha256})),
  analysisSha256:hash(readFileSync(new URL(import.meta.url))), ordinaryActors:ordinary.length, excludedBeams, excludedRawDraws,
  definitions:{fit:'Nonnegative ridge least squares on standardized shared-feature differences; clipped probability predictions; no ID coefficients or production writes.',
    split:'Canonical pair SHA-256 mod10: 0–1 untouched matchup holdout across both repeats; 2–3 inner tuning at repeat0; 4–9 inner fit at repeat0; refit chosen model on2–9 repeat0. Repeat1 on2–9 is an additional seed holdout.',
    limitations:'Associational model under one frozen CPU policy. Reverse seats are paired, not independent. Actor/matchup overlap remains in seed holdout; matchup holdout still reuses roster actors. Constant safety features cannot identify safety coefficients. Beams excluded rather than given zero shot utility.'},
  features:included.map((i, j) => ({name:names[i], rosterMean:means[i], rosterScale:scales[i], standardizedCoefficient:shared.weights[j], perUnitCoefficient:shared.weights[j] / scales[i]})),
  unidentified:dropped, correlated, shared, existingBudget:existing, clusterBootstrap };
writeFileSync(out + '.json', JSON.stringify(result, null, 2) + '\n');
const lines = ['# Advisory empirical budget validation','',`Frozen simulation ${source.simVersion}; source SHA-256 ${source.sourceSha256}.`, '',
  result.definitions.fit, '', result.definitions.split, '', result.definitions.limitations, '',
  `Ordinary-shot actors: ${ordinary.length}; excluded beam bouts ${excludedBeams}; excluded raw draws ${excludedRawDraws}.`, '',
  '| Held-out data | Shared features Brier | Existing budget Brier | Shared accuracy |', '| --- | ---: | ---: | ---: |',
  `| Unseen matchups and their seeds | ${shared.pairHoldout.brier.toFixed(5)} | ${existing.pairHoldout.brier.toFixed(5)} | ${(100*shared.pairHoldout.accuracy).toFixed(2)}% |`,
  `| New seeds on training matchups | ${shared.seedHoldout.brier.toFixed(5)} | ${existing.seedHoldout.brier.toFixed(5)} | ${(100*shared.seedHoldout.accuracy).toFixed(2)}% |`, '',
  `Neutral50% Brier baseline is0.25. Selected regularization ${shared.lambda}; coefficients below are predictive associations, not approved tuning prices.`, '',
  `Matchup-cluster bootstrap95% interval for shared-minus-existing held-out Brier: [${clusterBootstrap.percentile95.map(v=>v.toFixed(5)).join(', ')}]. Reverse seats are not treated as independent samples.`, '',
  '| Shared feature | Standardized coefficient | Per-unit coefficient |', '| --- | ---: | ---: |',
  ...result.features.map(f => `| ${f.name} | ${f.standardizedCoefficient.toFixed(6)} | ${f.perUnitCoefficient.toFixed(6)} |`), '',
  `Unidentifiable constant features: ${dropped.join(', ') || 'none'}. Safety needs a controlled timing intervention before its price can be estimated empirically.`, '',
  'Zero fitted weights mean no separately identified predictive contribution in this constrained, collinear dataset; they do not establish that heavy damage or projectile threat has zero gameplay value.', '',
  'No fighter values were changed by this analysis. No population fairness, causal coefficient, human feel or story difficulty approval is implied.', ''];
writeFileSync(out + '.md', lines.join('\n'));
console.log(lines.join('\n'));
