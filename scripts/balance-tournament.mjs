#!/usr/bin/env node
// Reproducible headless measurements; no game assets or production sim files are written.
// node scripts/balance-tournament.mjs --fast --out docs/balance/report-2026-11-05
// node scripts/balance-tournament.mjs --samples 40 --seed 20261105 --bot reference
// --skills 4,7 applies after the CPU supports skill; legacy CPU is measured once.
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadBalanceCore, sourceMetadata } from './lib/balance-core.mjs';
import { runTournament } from './lib/balance-runner.mjs';

export function parseOptions(args) {
  const options = { fast:false, seed:20261105, samples:40, maxFrames:3600, skills:[4, 7], bot:'cpu', repeats:1, matchDepth:false, out:`docs/balance/report-${new Date().toISOString().slice(0, 10)}`, compare:null, gate:false, ids:null };
  let explicitSamples = false, explicitMaxFrames = false;
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    if (flag === '--fast') options.fast = true;
    else if (flag === '--match-depth') options.matchDepth = true;
    else if (flag === '--gate') options.gate = true;
    else if (flag === '--seed') options.seed = Number(args[++i]);
    else if (flag === '--samples') { options.samples = Number(args[++i]); explicitSamples = true; }
    else if (flag === '--repeats') options.repeats = Number(args[++i]);
    else if (flag === '--max-frames') { options.maxFrames = Number(args[++i]); explicitMaxFrames = true; }
    else if (flag === '--skills') options.skills = args[++i]?.split(',').map(Number);
    else if (flag === '--bot') options.bot = args[++i];
    else if (flag === '--out') options.out = args[++i];
    else if (flag === '--compare') options.compare = args[++i];
    else if (flag === '--fighters') options.ids = args[++i]?.split(',');
    else throw new Error(`Unknown argument: ${flag}`);
  }
  if (options.fast && !explicitSamples) options.samples = 2;
  if (options.matchDepth && !explicitMaxFrames) options.maxFrames = 10800;
  assert.ok(Number.isSafeInteger(options.seed) && options.seed >= 0 && options.seed <= 4294967295, '--seed must be uint32');
  for (const key of ['samples', 'maxFrames', 'repeats']) assert.ok(Number.isSafeInteger(options[key]) && options[key] > 0, `${key} must be a positive integer`);
  assert.ok(options.skills?.length && options.skills.every(x => Number.isFinite(x) && x >= 1 && x <= 10), '--skills values must be between 1 and 10');
  assert.ok(['cpu', 'reference'].includes(options.bot), '--bot must be cpu or reference');
  assert.ok(typeof options.out === 'string' && options.out.length, '--out needs a path prefix');
  return options;
}

const percent = value => value === null ? 'n/a' : `${(value * 100).toFixed(1)}%`;
export function markdown(report) {
  const lines = ['# Balance tournament', '', `Source: \`${report.source.commit}\`; simulation \`${report.source.simVersion}\`; source SHA-256 \`${report.source.sourceSha256}\`.`, '',
    `Seed ${report.config.seed}; ${report.config.roster.length} fighters; ${report.config.schedule.length} sampled pairs; ${report.config.repeats} repetitions; ${report.config.maxFrames}-frame cap; ${report.config.bot} opponents.`, '',
    'Every sampled pair runs from both seats. Reference comparisons also cross controller assignments. With a seeded CPU, independent streams derive from tournament seed, fighter/controller identities and repetition; reversing seats preserves those fighter streams. Initial seeds are recorded per bout. The legacy CPU itself has no behavioral randomness.', '',
    'Raw draws include double KOs and every bout that hits the frame cap. Measurement results resolve those by remaining HP, actual damage dealt, then the paired reverse-seat result; exact symmetric ties remain unresolved. Rates exclude unresolved bouts. Neither an HP timeout decision nor a seat tie-break changes the game rules.', '',
    'Damage records actual target HP removed, excluding overkill and attacker healing. Recovery excludes hitstop. Archetypes are analysis groupings of existing roles, not normalized gameplay templates. Small-sample extremes are diagnostic, not confidence bounds.', '',
    report.source.cpuHasSkillParameter ? 'The parameterized CPU receives the requested skill for each level.' : 'The current CPU has no skill parameter. Requested levels were collapsed to a single legacy baseline; Normal/Hard balance claims cannot yet be made.', '',
    `Reference controller: ${report.referenceBotVersion}. It is not calibrated as a decent human player. Human feel, human round duration, online hub behavior, and complete matchup coverage are not established by this headless report.`, '',
    'One repetition provides one independent seed pair per matchup, with two paired seats. Small sample matchup extremes cannot establish or disprove the 70/30 population target; use additional repetitions and inspect uncertainty.', ''];
  if(report.config.matchDepth) lines.push('Optional match depth is enabled: best-of-three rounds continue until the match is complete. The frame cap applies to the whole match. Raw cap exhaustion remains a draw; measurement tie-breaks compare round score before HP and damage. Entrances and between-round presentation are excluded.', '');
  for (const level of report.levels) {
    const s = level.summary;
    lines.push(`## ${level.skill === null ? 'Legacy CPU' : `Skill ${level.skill}`}`, '',
      `${s.matches} bouts; raw draws ${percent(s.rawDrawRate)} (${s.rawDraws}); unresolved ${percent(s.drawRate)} (${s.unresolved}); timeouts ${s.timeouts}. Mean ${s.meanSeconds.toFixed(2)} s; median ${s.medianSeconds.toFixed(2)} s.`, '',
      '| Seat | Measurement wins | Raw wins | Raw draws | Mean recovery |', '| --- | ---: | ---: | ---: | ---: |');
    for (const [seat, stats] of s.seats.entries()) lines.push(`| ${seat + 1} | ${percent(stats.decidedWinRate)} | ${percent(stats.rawDecidedWinRate)} | ${percent(stats.rawDrawRate)} | ${stats.meanRecoverySeconds.toFixed(2)} s |`);
    if(report.config.matchDepth)lines.push('', `${s.rounds.completed} completed rounds; ${s.rounds.partial} partial rounds at the whole-match cap; ${s.rounds.draws} round draws; ${s.rounds.timerDecisions} timer decisions; mean completed round ${s.rounds.meanSeconds?.toFixed(2)??'n/a'} s.`);
    lines.push('', '| Archetype | Bouts | Measurement wins | Raw wins | Raw draws |', '| --- | ---: | ---: | ---: | ---: |');
    for (const [id, stats] of Object.entries(s.archetypes)) lines.push(`| ${id} | ${stats.matches} | ${percent(stats.decidedWinRate)} | ${percent(stats.rawDecidedWinRate)} | ${percent(stats.rawDrawRate)} |`);
    if (s.controllers.reference) lines.push('', `CPU win rate against the fixed reference bot: ${percent(s.controllers.cpu.decidedWinRate)} measurement-resolved, ${percent(s.controllers.cpu.rawDecidedWinRate)} raw decided.`);
    const totals = Object.fromEntries(['melee', 'projectile', 'special', 'throw'].map(source => [source, s.seats.reduce((n, seat) => n + seat.damage[source], 0)]));
    lines.push('', `Damage: ${Object.entries(totals).map(([source, amount]) => `${source} ${amount}`).join('; ')}.`, '',
      '| Fighter | Archetype | Bouts | Measurement wins | Raw wins | Raw draws |', '| --- | --- | ---: | ---: | ---: | ---: |');
    for (const [id, stats] of Object.entries(s.fighters)) lines.push(`| ${id} | ${stats.archetype} | ${stats.matches} | ${percent(stats.decidedWinRate)} | ${percent(stats.rawDecidedWinRate)} | ${percent(stats.rawDrawRate)} |`);
    lines.push('', '| Largest sampled matchup imbalances | Bouts | First fighter wins |', '| --- | ---: | ---: |');
    for (const m of s.worstMatchups.slice(0, 10)) lines.push(`| ${m.fighters.join(' vs ')} | ${m.matches} | ${percent(m.decidedWinRate)} |`);
    lines.push('');
  }
  if (report.comparison) {
    lines.push('## Compared with previous report', '', `Previous source: \`${report.comparison.commit}\`. Identical schedule, frame cap, controllers and effective levels were required.`, '');
    for (const delta of report.comparison.levels) lines.push(`- Skill ${delta.skill ?? 'legacy'}: raw draw change ${(delta.rawDrawRate * 100).toFixed(2)} percentage points; mean round change ${delta.meanSeconds.toFixed(2)} s.`);
  }
  return lines.join('\n') + '\n';
}

export async function main(args = process.argv.slice(2)) {
  const options = parseOptions(args), core = await loadBalanceCore();
  const source = { ...sourceMetadata(), cpuHasSkillParameter:Array.isArray(core.CPU_SKILLS) && core.CPU_SKILLS.includes(4) && core.CPU_SKILLS.includes(7) };
  const ids = options.ids ?? core.PLAYABLE_FIGHTERS;
  assert.ok(new Set(ids).size === ids.length && ids.every(id => core.PLAYABLE_FIGHTERS.includes(id)), '--fighters must be unique installed fighter IDs');
  const skills = source.cpuHasSkillParameter ? options.skills : [null];
  const report = { schemaVersion:1, source, requestedSkills:options.skills,
    ...await runTournament(core, { ...options, ids, skills, progress:({ skill, pairs, total }) => console.error(`skill ${skill ?? 'legacy'}: ${pairs}/${total} pairs`) }) };
  const after = sourceMetadata();
  assert.equal(after.sourceSha256, source.sourceSha256, 'simulation changed while tournament was running; rerun on a stable checkout');
  assert.equal(after.harnessSha256, source.harnessSha256, 'harness changed while tournament was running; rerun on a stable checkout');
  if (options.compare) {
    const before = JSON.parse(readFileSync(options.compare, 'utf8'));
    assert.deepEqual(before.config, report.config, 'comparison requires identical tournament configuration and schedule');
    assert.equal(before.referenceBotVersion, report.referenceBotVersion, 'comparison requires fixed reference bot version');
    report.comparison = { commit:before.source.commit, levels:report.levels.map((level, i) => ({ skill:level.skill,
      rawDrawRate:level.summary.rawDrawRate - before.levels[i].summary.rawDrawRate,
      meanSeconds:level.summary.meanSeconds - before.levels[i].summary.meanSeconds })) };
  }
  const prefix = options.out.replace(/\.(json|md)$/, '');
  mkdirSync(dirname(prefix), { recursive:true });
  writeFileSync(prefix + '.json', JSON.stringify(report, null, 2) + '\n');
  writeFileSync(prefix + '.md', markdown(report));
  for (const level of report.levels) console.log(`skill ${level.skill ?? 'legacy'}: ${level.summary.matches} bouts; raw draws ${percent(level.summary.rawDrawRate)}; unresolved ${percent(level.summary.drawRate)}; mean ${level.summary.meanSeconds.toFixed(2)}s`);
  console.log(`Wrote ${prefix}.json and ${prefix}.md`);
  if (options.gate) {
    assert.ok(source.cpuHasSkillParameter && skills.includes(4) && skills.includes(7), 'balance gate requires actual Normal (4) and Hard (7) CPU levels');
    for (const level of report.levels) for (const [id, stats] of Object.entries(level.summary.fighters))
      assert.ok(stats.decidedWinRate !== null && stats.decidedWinRate >= .35 && stats.decidedWinRate <= .65, `${id} skill ${level.skill} outside advisory-to-gate band 35–65%`);
  }
  return report;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
