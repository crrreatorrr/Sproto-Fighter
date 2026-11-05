#!/usr/bin/env node
// Numeric effective getMove data, including directional variations and Special contacts.
// node scripts/frame-data.mjs --out docs/balance/frame-data.csv [--partner ID]
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCore } from './lib/load.mjs';
import { archetype } from './lib/balance-core.mjs';

export function frameRows(core, partner) {
  if (partner) assert.ok(core.PLAYABLE_FIGHTERS.includes(partner), 'partner must be an installed fighter');
  const rows = [];
  for (const id of [...core.PLAYABLE_FIGHTERS].sort()) {
    const fighter = core.createState(id, 'versus').fighters[0];
    if (partner) fighter.partner = partner;
    for (const moveId of Object.keys(core.MOVES)) {
      const variants = moveId === 'special' ? core.COMBAT_STYLES[id].specialFrames.map((tick, contact) => ({ aim:'level', tick, contact, air:false }))
        : (['light', 'medium', 'heavy', 'airLight', 'airMedium', 'airHeavy'].includes(moveId) ? ['level', 'up', 'upForward', 'down'] : [moveId === 'launcher' ? 'up' : 'level'])
          .map(aim => ({ aim, tick:0, contact:null, air:!!core.MOVES[moveId].air }));
      for (const variant of variants) {
        fighter.y = core.FLOOR - (variant.air ? 80 : 0);
        fighter.move = { id:moveId, t:variant.tick, hit:false, connected:false, wave:variant.contact ?? -1, aim:variant.aim };
        const m = core.getMove(fighter, moveId), tick = variant.tick || m.startup;
        // step clears the move after act(); its next action is one tick later.
        const remainingCommitment = m.startup + m.active + m.recovery - tick + 1;
        const special = moveId === 'special', contextual = m.projectile || moveId === 'grab';
        rows.push({ fighter:id, archetype:archetype(core, id), partner:core.fighterPartner(fighter), move:moveId,
          stance:variant.air ? 'air' : 'ground', aim:variant.aim, contact:variant.contact ?? '', contactTick:tick,
          startup:m.startup, active:m.active, recovery:m.recovery, damage:m.damage, range:m.range,
          hitstun:m.stun, blockstun:moveId === 'grab' || (special && m.blockstun === undefined) ? '' : m.blockstun ?? 15,
          nominalOnHitAdvantage:contextual ? '' : m.stun - remainingCommitment,
          nominalOnBlockAdvantage:contextual || (special && m.blockstun === undefined) ? '' : (m.blockstun ?? 15) - remainingCommitment,
          advantageNote:contextual ? 'projectile travel / throw hold dependent' : m.finisher || special ? 'stun arithmetic only; knockdown or multihit changes actual advantage' : 'first contact; excludes cancels, movement and landing',
          push:m.push, low:!!m.low, air:!!m.air, projectile:!!m.projectile,
          projectileSpeed:m.projectile ? core.COMBAT_STYLES[id].projectile.speed : '',
        });
      }
    }
  }
  return rows;
}
const csvCell = value => /[",\n]/.test(String(value)) ? '"' + String(value).replaceAll('"', '""') + '"' : String(value);
export function toCsv(rows) {
  const columns = Object.keys(rows[0]);
  return [columns.join(','), ...rows.map(row => columns.map(key => csvCell(row[key])).join(','))].join('\n') + '\n';
}
export async function main(args = process.argv.slice(2)) {
  let out = 'docs/balance/frame-data.csv', partner;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out') out = args[++i];
    else if (args[i] === '--partner') partner = args[++i];
    else throw new Error(`Unknown argument: ${args[i]}`);
  }
  assert.ok(typeof out === 'string' && out.length, '--out needs a file path');
  const rows = frameRows(await loadCore(), partner);
  mkdirSync(dirname(out), { recursive:true });
  writeFileSync(out, toCsv(rows));
  console.log(`Exported ${rows.length} effective move/contact rows to ${out}; advantage columns are nominal, not guarantees.`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
