#!/usr/bin/env node
// Real guarded heavy contacts exercise ordinary guard today and chip after Phase 3.
import assert from 'node:assert/strict';
import { loadCore } from './lib/load.mjs';
import { loadBalanceCore } from './lib/balance-core.mjs';

const [core, observed] = await Promise.all([loadCore(), loadBalanceCore()]);
const plain=core.createState('rivet','versus','vela');
plain.fighters[0].x=500;plain.fighters[1].x=550;
const measured=structuredClone(plain);
let blocked=false;
observed.__balanceReset();
for(let frame=0;frame<120;frame++) {
  const inputs=[frame===0?core.A.heavy:0,core.A.right];
  core.step(plain,inputs);observed.step(measured,inputs);
  assert.equal(core.hashState(plain),observed.hashState(measured),`guard/chip observation transparent at frame ${frame}`);
  blocked ||= plain.fighters[1].blockstun>0;
}
assert.ok(blocked,'fixture must actually connect with guard');
const loss=1000-measured.fighters[1].hp;
assert.equal(observed.__balanceRead().reduce((n,e)=>n+e.amount,0),loss,'all guarded HP loss observed');
if(core.getMove(plain.fighters[0],'heavy').chip>0)assert.ok(loss>0,'chip-enabled heavy must remove guarded HP');
console.log(`PASS: guard/chip observer preserves complete state for120 frames and accounts for${loss} guarded HP loss.`);
