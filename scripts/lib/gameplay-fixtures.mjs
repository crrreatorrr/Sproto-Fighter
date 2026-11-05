// Explicit numeric expectations live outside immutable historical art fixtures.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const pinned=JSON.parse(readFileSync(new URL('../fixtures/gameplay-balance.json',import.meta.url),'utf8'));

export function assertProjectileKit(core,id){
  assert.deepEqual(core.BALANCE_TEMPLATES,pinned.templates,'reviewed archetype template numbers');
  const archetype=core.BALANCE_KITS[id].archetype;
  const move=core.getMove(core.createState(id).fighters[0],'bolt');
  const profile=core.BALANCE_KITS[id].projectileProfileCost;
  if(profile)assert.deepEqual(profile,pinned.projectileProfiles?.[profile.kind]?.[archetype],id+' reviewed mechanical profile fee');
  assert.deepEqual(move,{...pinned.effectiveBolts[archetype],...(profile?.applied??{})},id+' effective ranged move');
  assert.equal(core.COMBAT_STYLES[id].projectile.speed,
    core.COMBAT_STYLES[id].projectile.beamLength?0:pinned.templates[archetype].projectileSpeed,
    id+' normalized projectile speed');
  return move;
}
