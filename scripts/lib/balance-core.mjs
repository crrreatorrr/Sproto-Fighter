// Headless-only damage observation. The production simulation is never edited.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';
import { bundle, dataUrl } from './load.mjs';

export const root = fileURLToPath(new URL('../../', import.meta.url));
const damageDeclaration = 'export function damage(';

/** Fail closed when the observed source changes, rather than silently reporting zero damage. */
export function instrumentCombat(source) {
  assert.equal(source.split(damageDeclaration).length, 2, 'balance instrumentation: expected exactly one damage function declaration; review observer against combat.ts');
  return source.replace(damageDeclaration, 'function __balanceOriginalDamage(')
    + '\nconst __balanceEvents: {frame:number;owner:number;source:string;amount:number}[] = [];\n'
    + `export function damage(s:CombatState,index:number,m:Move,kind:MoveId,projectile=false):boolean {
      const before=s.fighters[1-index].hp;
      const hit=__balanceOriginalDamage(s,index,m,kind,projectile);
      const amount=before-s.fighters[1-index].hp;
      if(amount>0)__balanceEvents.push({frame:s.frame,owner:index,source:projectile?'projectile':kind==='special'?'special':kind==='grab'?'throw':'melee',amount});
      return hit;
    }\n`
    + 'export function __balanceReset(){__balanceEvents.length=0;}\n'
    + 'export function __balanceRead(){return __balanceEvents.map(e=>({...e}));}\n';
}

export async function loadBalanceCore({ entry = 'src/core.ts' } = {}) {
  const source = await bundle(entry, { plugins: [{
    name: 'headless-balance-observer',
    setup(build) {
      build.onLoad({ filter: /\/src\/(?:sim\/combat|core)\.ts$/ }, args => {
        let contents = readFileSync(args.path, 'utf8');
        if (args.path.endsWith('/sim/combat.ts')) contents = instrumentCombat(contents);
        else contents += "\nexport { __balanceReset, __balanceRead } from './sim/combat';\n";
        return { contents, loader: 'ts' };
      });
    },
  }] });
  return import(dataUrl(source));
}

export function sourceMetadata() {
  const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
  const files = ['src/core.ts', ...walk(join(root, 'src/sim')).map(p => relative(root, p))].sort();
  const hash = createHash('sha256');
  for (const path of files) hash.update(path + '\0').update(readFileSync(join(root, path))).update('\0');
  let commit = 'unknown';
  try { commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(); } catch { /* source archives have no git */ }
  const simVersion = readFileSync(join(root, 'src/net/simVersion.ts'), 'utf8').match(/SIM_VERSION = '([^']+)'/)?.[1] ?? 'unknown';
  const harnessHash = createHash('sha256');
  for (const path of ['scripts/balance-tournament.mjs', 'scripts/difficulty-curve.mjs', 'scripts/lib/balance-core.mjs', 'scripts/lib/balance-runner.mjs', 'scripts/lib/balance-bots.mjs', 'scripts/lib/balance-curve.mjs'])
    harnessHash.update(path + '\0').update(readFileSync(join(root, path))).update('\0');
  return { commit, sourceSha256: hash.digest('hex'), simVersion, harnessSha256:harnessHash.digest('hex') };
}

/** An analysis grouping of existing roles, not a production kit assignment. */
export function archetype(core, id) {
  // Normalized cores publish the definitive assignment; legacy role heuristics
  // are retained only to reproduce tooling on the pre-normalization baseline.
  if (core.BALANCE_KITS?.[id]?.archetype) return core.BALANCE_KITS[id].archetype;
  const role = `${core.ROSTER[id].role} ${core.COMBAT_STYLES[id].role}`.toLowerCase();
  if (core.isPairedFighter(id)) return 'Paired';
  if (/staff|halberd|sword|weapon/.test(role) || ['sirsproto', 'sir', 'sungod', 'retainer', 'sproto1815', 'melo'].includes(id)) return 'Weapon';
  if (/hover|float/.test(role) || id === 'vela') return 'Hover';
  if (/footwork|speed|agile/.test(role)) return 'Footwork';
  if (/zon|ranged|shot|beam|laser/.test(role)) return 'Zoning';
  if (/counter|defen/.test(role)) return 'Counter';
  if (/brawl|grappl|power|bruis/.test(role)) return 'Brawler';
  return 'Pressure';
}
