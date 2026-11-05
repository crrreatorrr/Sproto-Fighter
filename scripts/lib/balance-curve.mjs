import assert from 'node:assert/strict';
import { matchSeeds, playMatch } from './balance-runner.mjs';
import { REFERENCE_BOT_VERSION } from './balance-bots.mjs';

/** Wilson interval describes sampling uncertainty only; it does not validate the bot as human. */
export function winInterval(wins, losses) {
  const n = wins + losses;
  if (!n) return null;
  const p = wins / n, z = 1.959963984540054, denominator = 1 + z * z / n;
  const center = (p + z * z / (2 * n)) / denominator;
  const radius = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / denominator;
  return [Math.max(0, center - radius), Math.min(1, center + radius)];
}

export async function runCurve(core, route, storyDifficulty, { fighter='highsproto', seed=20261105, repeats=1, maxFrames=3600, progress } = {}) {
  assert.ok(core.PLAYABLE_FIGHTERS.includes(fighter), 'fixed reference fighter must be installed');
  const encounters = [];
  for (const encounter of route) {
    const skill = storyDifficulty(encounter, route), trials = [];
    for (let repeat = 0; repeat < repeats; repeat++) for (const referenceSlot of [0, 1]) {
      const bouts = [];
      let outcome = 'reference-win';
      for (const [wave, opponent] of encounter.opponents.entries()) {
        const ids = referenceSlot === 0 ? [fighter, opponent] : [opponent, fighter];
        const controllers = referenceSlot === 0 ? ['reference', 'cpu'] : ['cpu', 'reference'];
        const initialSeeds = matchSeeds(seed, ids, controllers, repeat, `${encounter.id}:${wave}`);
        const bout = playMatch(core, ids, { maxFrames, skill, referenceSlot, initialSeeds, repeat });
        bouts.push({ wave, ...bout });
        // A draw or loss restarts an encounter in Story. No HP/damage tie-break is used here.
        if (bout.rawWinner !== referenceSlot) {
          outcome = bout.rawWinner === null ? 'draw' : 'cpu-win';
          break;
        }
      }
      trials.push({ repeat, referenceSlot, outcome, bouts });
    }
    const cpuWins = trials.filter(t => t.outcome === 'cpu-win').length;
    const referenceWins = trials.filter(t => t.outcome === 'reference-win').length;
    const rawDraws = trials.length - cpuWins - referenceWins;
    encounters.push({ id:encounter.id, index:encounter.index, chapter:encounter.chapter, opponents:encounter.opponents, skill,
      markedBoss:!!encounter.gauntlet || encounter.index >= route.length - 15,
      summary:{ trials:trials.length, independentRepetitions:repeats, cpuWins, referenceWins, rawDraws,
        cpuDecidedWinRate:cpuWins + referenceWins ? cpuWins / (cpuWins + referenceWins) : null,
        cpuDecidedWilson95:winInterval(cpuWins, referenceWins) }, trials });
    if (progress && encounters.length % 25 === 0) progress(encounters.length, route.length);
  }
  return { schemaVersion:1, referenceBotVersion:REFERENCE_BOT_VERSION,
    config:{ fighter, seed, repeats, maxFrames, encounterCount:route.length }, encounters,
    limitations:[
      'Reference bot is fixed and reproducible but not calibrated to a decent human player.',
      'These are regular fighter simulations. Dedicated Story boss-form attacks, transformations and side-scroller mechanics are excluded.',
      'Each sequential encounter requires reference wins in all installed waves; a raw draw or loss stops that trial, and health refills between waves.',
      'Reverse seats share fighter RNG streams and are paired observations. Wilson intervals treat outcomes as trials and can understate dependence; independent repetitions are reported separately.',
      'No claim about 15–65% difficulty endpoints or a smooth empirical win curve follows from sparse trials or skill interpolation alone.',
    ] };
}
