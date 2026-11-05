// New single partners, distinct confirmed-hit behaviors, and both attacking twins.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const compile=p=>ts.transpileModule(read(p),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const cu=url(bundledCore()),eu=url(compile('src/animationEvents.ts')),pu=url(compile('src/powerArt.ts'));
const core=await import(cu),rules=JSON.parse(read('art/sprotos-expansion/user-requirements.json')).partnerExpansion;
const {A,ROSTER,PARTNER_ATTACKS,COMBAT_STYLES,WIDTH,FLOOR,bodyAtlasIds,createState,step,getMove}=core;
const poseCode=compile('src/poseAtlas.ts').replace("from './core'",`from '${cu}'`).replace("from './animationEvents'",`from '${eu}'`),poseUrl=url(poseCode),poses=await import(poseUrl);
const fxUrl=url(compile('src/partnerEffects.ts').replace("from './powerArt'",`from '${pu}'`)),effects=await import(fxUrl);
const stub=url('export function drawSprite(c,f,frame){globalThis.__partnerCapture(f,frame);}');
const team=await import(url(compile('src/teamSpecial.ts').replace("from './core'",`from '${cu}'`).replace("from './powerArt'",`from '${pu}'`).replace("from './spriteRoster'",`from '${stub}'`).replace("from './poseAtlas'",`from '${poseUrl}'`).replace("from './partnerEffects'",`from '${fxUrl}'`)));
const manifest=JSON.parse(read('public/fighters/pose-atlas.json'));
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class{set src(value){const b=readFileSync(new URL('../public'+value.split('?')[0],import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}};
assert.deepEqual(rules.attacks,PARTNER_ATTACKS,'canonical attack specifications match runtime');
assert.equal(rules.singleIds.length,10);assert.equal(rules.twinIds.length,3);assert.equal(Object.keys(rules.assignments).length,13);
const ids=[...rules.singleIds,...rules.twinIds];assert.equal(new Set(ids).size,13);assert.deepEqual(new Set(Object.values(rules.assignments)),new Set(ids));
assert.equal(new Set(ids.map(id=>PARTNER_ATTACKS[id].kind)).size,13,'13 different attack patterns');
assert.equal(new Set(ids.map(id=>JSON.stringify(PARTNER_ATTACKS[id].hits))).size,13,'13 different push/stun/launch/low contact profiles');
for(const id of rules.singleIds)assert.equal(bodyAtlasIds(id).length,1);
for(const id of rules.twinIds){assert.equal(bodyAtlasIds(id).length,2);assert.equal(new Set(PARTNER_ATTACKS[id].bodyAttacks).size,2);assert.equal(PARTNER_ATTACKS[id].hits.length,2,'each twin member has its own confirmed-hit behavior');}
for(const ref of JSON.parse(read('art/sprotos-expansion/inventory.json')))if(rules.assignments[ref.id])assert.equal(ref.partner,rules.assignments[ref.id],'canonical installers keep assignments');
// Each fresh match loads its one partner and every twin body, with no group relay.
for(const [main,partner]of Object.entries(rules.assignments)){
 assert.equal(ROSTER[main].partner,partner);
 const lazy=await import(url(poseCode+'\n// New partner lazy check '+main));await lazy.ensurePoseAtlases([main,'rivet']);
 const expected=new Set([main,'rivet',...bodyAtlasIds(ROSTER[main].partner),...bodyAtlasIds(ROSTER.rivet.partner)]);
 assert.deepEqual(new Set(lazy.getPoseAtlasLoadStatus().ids),expected,main+' lazy bodies');
}
await poses.loadPoseAtlases();
let samples=[];
globalThis.__partnerCapture=(f,frame)=>samples.push({id:f.id,bodyPlan:poses.getPartnerAssistBodyPlan(f),debug:poses.getPoseAtlasDebug(f,frame),parts:bodyAtlasIds(f.id).length>1?poses.getDuoPoseDebug(f,frame):[],layout:bodyAtlasIds(f.id).length>1?poses.getDuoLayoutDebug(f,frame):null});
const c=new Proxy({globalAlpha:1},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
let cases=0,twinContacts=0;
for(const [main,partner]of Object.entries(rules.assignments))for(const face of [-1,1])for(const x of [90,600,WIDTH-90]){
 const s=createState(main,'dummy','rivet'),[f,foe]=s.fighters;f.x=x;foe.x=Math.max(80,Math.min(WIDTH-80,x+face*180));f.facing=face;foe.facing=-face;f.pips=3;step(s,[A.special,0]);
 const seen=new Set(),attackedBodies=new Set(),seenBeats=new Set();let maxCombo=0,maxSlow=0;
 for(let t=0;t<160;t++){
  samples=[];const before=JSON.stringify(s);team.drawTeamSpecialBack(c,s);team.drawTeamSpecialFront(c,s);assert.equal(JSON.stringify(s),before,'rendering never mutates combat');
  assert.ok(samples.length<=1);
  for(const sample of samples){
   assert.equal(sample.id,partner);assert.ok(sample.debug.available);seen.add(sample.id);
   if(sample.layout){const bounds=sample.layout.bounds;assert.ok(bounds[0][0]>=5.9&&bounds.at(-1)[1]<=WIDTH-5.9,'twins stay camera bounded');assert.ok(bounds[1][0]-bounds[0][1]>=5.9,'twins keep silhouette clearance');assert.deepEqual(sample.parts.map(p=>p.entity),bodyAtlasIds(partner));}
   for(const body of sample.bodyPlan)if(body.active){
    attackedBodies.add(body.entity);seenBeats.add(body.beat);
    assert.equal(body.index,body.beat%bodyAtlasIds(partner).length,'same twin identity attacks in either facing');
    if(sample.parts.length){assert.notEqual(sample.parts[body.index].frameIndex,0,'striking twin has a contact drawing');assert.equal(sample.parts[1-body.index].frameIndex,0,'other twin covers');twinContacts++;}
   }
  }
  if(f.move?.id==='special'){
   const m=getMove(f,'special'),hit=PARTNER_ATTACKS[partner].hits[core.partnerContactIndex(f.move.t,COMBAT_STYLES[main].specialFrames)%PARTNER_ATTACKS[partner].hits.length];
   for(const[key,value]of Object.entries(hit))assert.equal(m[key],value,`${main} ${key} comes from selected partner`);
   assert.equal(m.launch,hit.launch??0,'main launch cannot overwrite partner choreography');
   assert.equal(!!m.low,!!hit.low,'main height cannot overwrite partner choreography');
  }
  maxCombo=Math.max(maxCombo,f.combo);maxSlow=Math.max(maxSlow,foe.slow);step(s,[0,0]);
 }
 assert.deepEqual([...seen],[partner]);assert.deepEqual(attackedBodies,new Set(bodyAtlasIds(partner)),'every member attacks');assert.equal(seenBeats.size,COMBAT_STYLES[main].specialFrames.length);
 assert.equal(f.pips,0);assert.equal(f.move,null);assert.equal(s.fighters.length,2);assert.ok(maxCombo<=COMBAT_STYLES[main].specialFrames.length,'no extra damage schedule');
 if(x===600){assert.equal(maxCombo,COMBAT_STYLES[main].specialFrames.length,main+' all contacts connect');if(PARTNER_ATTACKS[partner].kind==='frost')assert.ok(maxSlow>0,'frost actually slows a confirmed target');}
 cases++;
}
// Phase 1 gives Specials finite archetype reach; Phase 3 makes them guardable.
// Use a non-low reference partner so standing and crouching guard are both valid.
for(const main of ['olnoname','vitaliketh'])for(const face of [-1,1])for(const crouch of [false,true]){
 const s=createState(main,'versus','rivet'),[f,foe]=s.fighters;
 f.x=600;foe.x=600+face*180;f.facing=face;foe.facing=-face;f.partner='rivet';f.pips=3;
 const away=face===1?A.right:A.left,guard=away|(crouch?A.down:0);let blocked=false;
 for(let t=0;t<160;t++){step(s,[t===0?A.special:0,guard]);blocked ||= foe.blockstun>0;}
 assert.ok(blocked,main+' Special is guarded inside its effective reach');
 assert.ok(foe.hp<1000&&foe.hp>950,main+' guard takes chip, not full Special damage');
 assert.equal(f.best,0,main+' blocked contacts do not become a damaging combo');
}
for(const main of ['olnoname','vitaliketh']){
 const s=createState(main,'versus','rivet'),[f,foe]=s.fighters;f.x=100;foe.x=1180;f.pips=3;
 for(let t=0;t<160;t++)step(s,[t===0?A.special:0,0]);
 assert.equal(foe.hp,1000,main+' Special cannot connect across the arena outside its reach');
}
// Incoming projectiles pass through an active Special, then can hit again after recovery.
const immune=createState('rivet','cpu','vela'),[caster]=immune.fighters;
caster.pips=3;
step(immune,[A.special,0]);
assert.equal(caster.move?.id,'special');
const shot={owner:1,x:caster.x,y:caster.y-65,vx:0,vy:0,life:5,damage:60};
immune.projectiles.push(shot);
step(immune,[0,0]);
assert.equal(caster.hp,1000);
assert.equal(caster.move?.id,'special');
assert.ok(immune.projectiles.includes(shot),'immune contact does not consume the shot');
while(caster.move)step(immune,[0,0]);
immune.projectiles.push({...shot,x:caster.x,y:caster.y-65,life:5});
step(immune,[0,0]);
assert.ok(caster.hp<1000,'damage resumes after the Special');

const clash=createState('rivet','versus','rivet');
for(const fighter of clash.fighters)fighter.pips=3;
step(clash,[A.special,A.special]);
for(let i=0;i<90;i++)step(clash,[0,0]);
assert.deepEqual(clash.fighters.map(fighter=>fighter.hp),[1000,1000],'simultaneous Specials respect both immunity windows');

// Distinct geometry is deterministic; color/name changes alone cannot satisfy this.
const shapes=new Set();
for(const id of ids){const log=[],ctx=new Proxy({globalAlpha:1},{get:(o,k)=>k in o?o[k]:(...args)=>log.push([k,...args]),set:(o,k,v)=>(o[k]=v,true)});const a={x:300,y:460,targetX:800,targetY:500,floor:FLOOR,age:2,beat:0,body:0,facing:1};effects.drawPartnerEffect(ctx,PARTNER_ATTACKS[id],a);const first=JSON.stringify(log);log.length=0;effects.drawPartnerEffect(ctx,PARTNER_ATTACKS[id],a);assert.equal(JSON.stringify(log),first,'deterministic drawing');shapes.add(first);}
assert.equal(shapes.size,13,'each effect has different geometry');
console.log(`PASS: 10 new single partners + 3 twin pairs; 13 attack geometries and contact profiles; ${cases} facing/wall scenarios; both twin bodies attack (${twinContacts} captured attack frames), exact single-partner loading, finite Special reach and guarded chip, frost slow, meter, damage schedules and render purity.`);
