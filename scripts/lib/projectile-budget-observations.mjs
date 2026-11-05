// Numeric diagnostic only; never changes a projectile or a production source file.
// node scripts/lib/projectile-budget-observations.mjs SOURCE_ROOT OUT_PREFIX
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const [checkout,out]=process.argv.slice(2);
assert.ok(checkout&&out,'supply a frozen checkout and output prefix');
const {loadBalanceCore,sourceMetadata}=await import(pathToFileURL(resolve(checkout,'scripts/lib/balance-core.mjs')));
const source=sourceMetadata(),core=await loadBalanceCore(),rows=[];
for(const id of core.PLAYABLE_FIGHTERS){
  const s=core.createState(id,'versus','rivet'),[a,b]=s.fighters;
  a.x=core.fighterWall(id)+40;b.x=core.WIDTH-core.WALL;a.facing=1;b.facing=-1;
  const move=core.getMove(a,'bolt');let volley=null,release=null,clear=null,castEnd=null,nextCast=null,packetTraits=null;
  for(let frame=1;frame<=400;frame++){
    // Keep the target away from every projectile lane; this is an intentional
    // full-screen whiff fixture, not a player/bot bout or a damage benchmark.
    b.y=-10000;b.vy=0;
    core.step(s,[frame%2?core.A.bolt:0,0]);
    if(!volley&&s.projectiles.length){
      volley=[...s.projectiles];release=frame;
      assert.equal(volley.reduce((n,p)=>n+p.damage,0),move.damage,id+' one volley retains total packet damage');
      const p=volley[0];packetTraits={beam:!!p.beamLength,returning:!!p.returnAt,bouncing:!!p.bounces,
        ground:!!p.ground,wave:!!p.wave,gravity:!!p.gravity,accelerating:!!p.accel,secondary:volley.length>1};
    }
    if(volley&&!castEnd&&!a.move)castEnd=frame;
    if(volley&&!clear&&!volley.some(p=>p.life>0&&s.projectiles.includes(p)))clear=frame;
    if(volley&&frame>release&&a.move?.id==='bolt'&&a.move.t===1){nextCast=frame;break;}
  }
  assert.ok(volley&&release&&clear&&castEnd&&nextCast,id+' bounded release, clear and recast');
  assert.ok(nextCast>clear,id+' recast waits until every packet clears');
  const family=packetTraits.beam?'beam':packetTraits.returning?'returning':packetTraits.bouncing?'bouncing':
    packetTraits.ground?'ground':packetTraits.gravity?'gravity':packetTraits.wave?'wave':packetTraits.accelerating?'accelerating':'ordinary';
  rows.push({id,archetype:core.BALANCE_KITS[id].archetype,role:core.COMBAT_STYLES[id].role,family,
    traits:packetTraits,packetCount:volley.length,packetDamage:move.damage,releaseFrame:release,clearFrame:clear,
    firstCastEndFrame:castEnd,nextCastFrame:nextCast,additionalWhiffLockFrames:nextCast-castEnd-1,
    whiffCastIntervalFrames:nextCast-1,nominalCommitment:move.startup+move.active+move.recovery});
}
assert.equal(sourceMetadata().sourceSha256,source.sourceSha256,'source changed during observations');
const groups={};
for(const row of rows)(groups[row.family]??=[]).push(row);
const quantile=(values,p)=>[...values].sort((a,b)=>a-b)[Math.round(p*(values.length-1))];
const summary=Object.fromEntries(Object.entries(groups).map(([family,members])=>[family,{actors:members.length,
  lockMin:Math.min(...members.map(r=>r.additionalWhiffLockFrames)),lockMedian:quantile(members.map(r=>r.additionalWhiffLockFrames),.5),
  lockMax:Math.max(...members.map(r=>r.additionalWhiffLockFrames)),secondaryActors:members.filter(r=>r.traits.secondary).length}]));
const result={source,analysisSha256:createHash('sha256').update(readFileSync(new URL(import.meta.url))).digest('hex'),
  protocol:'Stationary caster near its left legal wall. Fixed unopposed level casts. Target held above all lanes. Buffered recasts requested every other tick. Observes full-screen whiff lifetime, not expected in-match DPS.',
  limitations:'Clash priority, crouch lanes, travel/contact, partner utility and counter-hit decisions are not priced by these observations. Classes with fewer than five actors cannot establish general balance. No geometry/art or fighter values changed.',summary,rows};
writeFileSync(out+'.json',JSON.stringify(result,null,2)+'\n');
const lines=['# Projectile budget omissions: full-screen whiff lock','',`Frozen simulation ${source.simVersion}; source SHA-256 ${source.sourceSha256}.`,'',result.protocol,'',result.limitations,'',
  '| Effective trajectory family | Actors | Extra whiff lock min/median/max |', '| --- | ---: | --- |',
  ...Object.entries(summary).map(([family,s])=>`| ${family} | ${s.actors} | ${s.lockMin}/${s.lockMedian}/${s.lockMax} |`),'',
  'Extra lock is the observed wait beyond first cast cleanup before a buffered recast starts. Ordinary startup/recovery threat formulas omit this state-dependent miss cost. A hit or block normally clears a shot earlier, so these whiff costs must not be mistaken for normal firing rates.','',
  'Existing rules also make beams win clashes against ordinary shots, while dual-emitter volleys split total damage across two lanes. These utilities require controlled interaction tests; packet count alone is not twice the damage and this diagnostic is not a price recommendation.',''];
writeFileSync(out+'.md',lines.join('\n'));console.log(lines.join('\n'));
