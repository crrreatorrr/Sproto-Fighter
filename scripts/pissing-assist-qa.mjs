// One assigned partner per main; a twin identity retains both authored bodies.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const compile=p=>ts.transpileModule(read(p),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const cu=url(compile('src/core.ts')),eu=url(compile('src/animationEvents.ts')),pu=url(compile('src/powerArt.ts'));
const core=await import(cu),events=await import(eu);
const poseCode=compile('src/poseAtlas.ts').replace("from './core'",`from '${cu}'`).replace("from './animationEvents'",`from '${eu}'`);
const poseUrl=url(poseCode),poses=await import(poseUrl);
const effectUrl=url(compile('src/partnerEffects.ts').replace("from './powerArt'",`from '${pu}'`));
const stub=url('export function drawSprite(c,f,frame){globalThis.__assistCapture(f,frame);return true;}');
const team=await import(url(compile('src/teamSpecial.ts').replace("from './core'",`from '${cu}'`).replace("from './powerArt'",`from '${pu}'`).replace("from './spriteRoster'",`from '${stub}'`).replace("from './poseAtlas'",`from '${poseUrl}'`).replace("from './partnerEffects'",`from '${effectUrl}'`)));
const manifest=JSON.parse(read('public/fighters/pose-atlas.json'));
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class{set src(value){const b=readFileSync(new URL('../public'+value.split('?')[0],import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}};
const {ROSTER,PLAYABLE_FIGHTERS,A,WIDTH,COMBAT_STYLES,bodyAtlasIds,isPairedFighter,specialPartnerIds,createState,step}=core;
const assignments=JSON.parse(read('art/sprotos-expansion/user-requirements.json')).independentPartners.assignments;
assert.equal(Object.keys(assignments).length,34);
assert.deepEqual([...new Set(Object.values(assignments))].sort(),['sproto3152','sproto3181','vaudream']);
for(const ref of JSON.parse(read('art/sprotos-expansion/inventory.json'))){
 assert.ok(!('specialPartners' in ref),'installer inventory must not restore the grouped relay');
 if(assignments[ref.id])assert.equal(ref.partner,assignments[ref.id]);
}
for(const id of PLAYABLE_FIGHTERS){assert.deepEqual(specialPartnerIds(id),[ROSTER[id].partner]);assert.ok(!('specialPartners' in ROSTER[id]));assert.notEqual(id,ROSTER[id].partner);}
// Stale data from an old installer cannot cause multiple identities to load/render.
ROSTER.sproto102.specialPartners=['sproto3152','vaudream','sproto3181'];assert.deepEqual(specialPartnerIds('sproto102'),['sproto3152']);delete ROSTER.sproto102.specialPartners;
for(const [id,partner]of Object.entries(assignments)){
 assert.equal(ROSTER[id].partner,partner);
 assert.deepEqual(Object.keys(core.THROW_GRIPS[id]).sort(),['hand','torso']);
}
for(const id of ['sproto102','sproto215','sproto313']){
 const lazy=await import(url(poseCode+'\n// Fresh lazy selection '+id));
 await lazy.ensurePoseAtlases([id,'rivet']);
 const expected=new Set([id,'rivet','vela',...bodyAtlasIds(ROSTER[id].partner)]);
 assert.deepEqual(new Set(lazy.getPoseAtlasLoadStatus().ids),expected,'load only selected fighters and their one partner, including twin bodies');
}
for(const id of ['sproto3152','vaudream','sproto3181','sproto3181-companion'])for(const[name,n]of Object.entries(events.ASSIST_CLIP_LENGTHS))assert.equal(manifest.fighters[id].clips[name].length,n);
await poses.loadPoseAtlases();
let captures=[],labels=[];
globalThis.__assistCapture=(f,frame)=>captures.push({id:f.id,x:f.x,debug:poses.getPoseAtlasDebug(f,frame),parts:isPairedFighter(f.id)?poses.getDuoPoseDebug(f,frame):[],layout:f.id==='sproto3181'?poses.getDuoLayoutDebug(f,frame):null});
const c=new Proxy({fillText(text){labels.push(text);}},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
let cases=0;
for(const id of PLAYABLE_FIGHTERS)for(const facing of [-1,1])for(const x of [90,600,WIDTH-90]){
 const s=createState(id,'dummy','rivet'),[a,b]=s.fighters,partner=ROSTER[id].partner;
 a.x=x;b.x=Math.max(80,Math.min(WIDTH-80,x+facing*180));a.facing=facing;b.facing=-facing;a.pips=3;
 step(s,[A.special,0]);const sequences=new Set(),partners=new Set(),yellowBeats=new Set(),monsterBeats=new Set();let hits=0;
 for(let n=0;n<150;n++){
  captures=[];labels=[];const before=JSON.stringify(s);team.drawTeamSpecialBack(c,s);team.drawTeamSpecialFront(c,s);assert.equal(JSON.stringify(s),before,'drawing an assist cannot add hits or mutate combat');
  assert.ok(captures.length<=1,'never summon multiple partner identities');
  for(const sample of captures){
   assert.equal(sample.id,partner);partners.add(sample.id);assert.ok(sample.debug.available);sequences.add(sample.debug.sequence);
   if(sample.parts.length)assert.deepEqual(sample.parts.map(p=>p.entity),bodyAtlasIds(partner),'twins retain their exact body pair');
   if(sample.layout){const [blue,yellow]=sample.layout.bounds;assert.ok(blue[0]>=6&&yellow[1]<=WIDTH-6,'twin assist stays inside camera');assert.ok(yellow[0]-blue[1]>=5.9,'twin silhouettes remain separate');}
  }
  const plan=team.getTeamSpecialAssistPlan(a);assert.ok(plan.length<=1);
  for(const part of plan){
   assert.equal(part.id,partner);assert.deepEqual(part.contacts,COMBAT_STYLES[id].specialFrames,'the assigned partner owns the full special');
   assert.ok(part.x>=90&&part.x<=WIDTH-90);
   const pair=captures.find(c=>c.id==='sproto3181');
   if(part.attack==='yellowStrike'){yellowBeats.add(part.contacts.filter(hit=>part.t>=hit).length-1);assert.ok(pair);assert.equal(pair.parts[0].frameIndex,0,'blue covers during yellow strike');assert.ok(pair.parts[1].frameIndex<=3);}
   if(part.attack==='stomachSlam'){monsterBeats.add(part.contacts.filter(hit=>part.t>=hit).length-1);assert.ok(part.impactScale>2);assert.ok(pair);assert.equal(pair.parts[1].frameIndex,0,'yellow covers during stomach strike');assert.ok(pair.parts[0].frameIndex>=12);}
  }
  if(labels.some(label=>label.endsWith('/ TEAM RELAY')))assert.ok(labels.includes(`${ROSTER[id].name} + ${ROSTER[partner].name} / TEAM RELAY`),'banner names exactly the main and assigned partner');
  hits=Math.max(hits,a.combo);step(s,[0,0]);
 }
 assert.equal(s.fighters.length,2,'assist adds no independent combat slot');assert.equal(a.pips,0);assert.equal(a.move,null);assert.ok(hits<=COMBAT_STYLES[id].specialFrames.length,'one damage schedule');assert.deepEqual([...partners],[partner]);
 if(Object.hasOwn(assignments,id)){for(const sequence of ['assistEnter','assistAttack','assistExit'])assert.ok(sequences.has(sequence),`${id}: ${sequence}`);}
 if(partner==='sproto3181'){assert.equal(yellowBeats.size,Math.ceil(COMBAT_STYLES[id].specialFrames.length/2));assert.equal(monsterBeats.size,Math.floor(COMBAT_STYLES[id].specialFrames.length/2));}
 cases++;
}
// Exercise every authored twin as the sole partner, including the original Duo.
let twinCases=0;
const original=ROSTER.rivet.partner;
try{for(const twin of PLAYABLE_FIGHTERS.filter(isPairedFighter))for(const face of [-1,1]){
 ROSTER.rivet.partner=twin;const s=createState('rivet','dummy'),f=s.fighters[0];f.facing=face;f.pips=3;step(s,[A.special,0]);
 for(let t=0;t<35;t++){captures=[];team.drawTeamSpecialBack(c,s);for(const sample of captures){assert.equal(sample.id,twin);assert.deepEqual(sample.parts.map(p=>p.entity),bodyAtlasIds(twin));}step(s,[0,0]);}twinCases++;
}}finally{ROSTER.rivet.partner=original;}
const close=createState('sproto2322','dummy');close.fighters[0].x=500;close.fighters[1].x=680;close.fighters[0].pips=3;step(close,[A.special,0]);let max=0;for(let n=0;n<150;n++){max=Math.max(max,close.fighters[0].combo);step(close,[0,0]);}assert.equal(max,4,'2322 keeps exactly four contacts');
console.log(`PASS: ${PLAYABLE_FIGHTERS.length} mains × both facings × 3 positions = ${cases} single-partner scenarios; 34 separate assignments; ${twinCases} twin-partner cases; bounded single-partner loading; banners, four contacts and combat purity verified.`);
