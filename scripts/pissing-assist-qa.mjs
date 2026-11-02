// Dedicated partner choreography, single damage schedule and wall/facing QA.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const compile=p=>ts.transpileModule(read(p),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const cu=url(compile('src/core.ts')),eu=url(compile('src/animationEvents.ts')),pu=url(compile('src/powerArt.ts'));
const core=await import(cu),events=await import(eu);
const poseUrl=url(compile('src/poseAtlas.ts').replace("from './core'",`from '${cu}'`).replace("from './animationEvents'",`from '${eu}'`));
const poses=await import(poseUrl);
const stub=url('export function drawSprite(c,f,frame){globalThis.__assistCapture(f,frame);return true;}');
const team=await import(url(compile('src/teamSpecial.ts').replace("from './core'",`from '${cu}'`).replace("from './powerArt'",`from '${pu}'`).replace("from './spriteRoster'",`from '${stub}'`).replace("from './poseAtlas'",`from '${poseUrl}'`)));
const manifest=JSON.parse(read('public/fighters/pose-atlas.json'));
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class{set src(value){const b=readFileSync(new URL('../public'+value.split('?')[0],import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}};
const {ROSTER,PLAYABLE_FIGHTERS,A,WIDTH,createState,step}=core;
const linked=PLAYABLE_FIGHTERS.filter(id=>ROSTER[id].partner==='sproto3152');
assert.equal(ROSTER.sproto3152.name,'Pissing Sproto');assert.equal(linked.length,34);assert.ok(linked.includes('sproto2322'));assert.notEqual(ROSTER.sproto3152.partner,'sproto3152');
for(const id of [...linked,'sproto3152'])assert.deepEqual(Object.keys(core.THROW_GRIPS[id]).sort(),['hand','torso'],'roster edits must not add labels to grip metadata');
await poses.ensurePoseAtlases(['sproto2322','rivet']);
for(const id of ['sproto3152','vaudream','sproto3181','sproto3181-companion']){
 assert.ok(poses.getPoseAtlasLoadStatus().ids.includes(id),'2322 loads every partner body');
 for(const[name,n]of Object.entries(events.ASSIST_CLIP_LENGTHS))assert.equal(manifest.fighters[id].clips[name].length,n);
}
await poses.loadPoseAtlases();
let captures=[];globalThis.__assistCapture=(f,frame)=>captures.push({id:f.id,x:f.x,debug:poses.getPoseAtlasDebug(f,frame),parts:f.id==='sproto3181'?poses.getDuoPoseDebug(f,frame):[],layout:f.id==='sproto3181'?poses.getDuoLayoutDebug(f,frame):null});
const c=new Proxy({},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
let cases=0;
for(const id of linked)for(const facing of [-1,1])for(const x of [90,600,WIDTH-90]){
 const s=createState(id,'dummy','rivet'),[a,b]=s.fighters;a.x=x;b.x=Math.max(80,Math.min(WIDTH-80,x+facing*180));a.facing=facing;b.facing=-facing;a.pips=3;
 step(s,[A.special,0]);const sequences=new Set(),partners=new Set(),yellowBeats=new Set(),monsterBeats=new Set();let hits=0;
 for(let n=0;n<150;n++){
  captures=[];const before=JSON.stringify(s);team.drawTeamSpecialBack(c,s);team.drawTeamSpecialFront(c,s);assert.equal(JSON.stringify(s),before,'drawing a partner cannot add hits or mutate combat');
  for(const sample of captures){assert.ok(['sproto3152','vaudream','sproto3181'].includes(sample.id));partners.add(sample.id);assert.ok(sample.x>=90&&sample.x<=WIDTH-90);assert.ok(sample.debug.available);sequences.add(sample.debug.sequence);if(sample.layout){const [blue,yellow]=sample.layout.bounds;assert.ok(blue[0]>=6&&yellow[1]<=WIDTH-6,'paired assist stays inside camera');assert.ok(yellow[0]-blue[1]>=5.9,'paired assist silhouettes remain separate');}}
  const plan=team.getTeamSpecialAssistPlan(a),pair=captures.find(c=>c.id==='sproto3181');
  for(const part of plan){if(part.attack==='yellowStrike'){yellowBeats.add(part.contacts[0]);if(pair){assert.equal(pair.parts[0].frameIndex,0,'blue covers during yellow strike');assert.ok([1,2,3,0].includes(pair.parts[1].frameIndex));}}if(part.attack==='stomachSlam'){monsterBeats.add(part.contacts[1]);assert.ok(part.impactScale>2);if(pair){assert.equal(pair.parts[1].frameIndex,0,'yellow covers during big stomach strike');assert.ok(pair.parts[0].frameIndex>=12);}}}
  hits=Math.max(hits,a.combo);step(s,[0,0]);
 }
 assert.equal(s.fighters.length,2,'assist has no separate health/combat slot');assert.equal(a.pips,0);assert.equal(a.move,null);assert.ok(hits<=core.COMBAT_STYLES[id].specialFrames.length,'one damage schedule');
 assert.ok(sequences.has('assistEnter'));assert.ok(sequences.has('assistAttack'));assert.ok(sequences.has('assistExit'));cases++;
 assert.equal(partners.size,3);assert.equal(yellowBeats.size,1);assert.equal(monsterBeats.size,1);
}
const victory=createState('sproto3152','dummy');poses.setPoseAtlasPresentation({phase:'outro',frame:45,winner:0,fromFloor:false},victory.fighters);assert.equal(poses.getPoseAtlasDebug(victory.fighters[0],0).sequence,'assistVictory');poses.setPoseAtlasPresentation(null,[]);
const close=createState('sproto2322','dummy');close.fighters[0].x=500;close.fighters[1].x=680;close.fighters[0].pips=3;step(close,[A.special,0]);let max=0;for(let n=0;n<150;n++){max=Math.max(max,close.fighters[0].combo);step(close,[0,0]);}assert.equal(max,4,'2322 still lands exactly its four scheduled contacts');
console.log(`PASS: 34 three-partner relays, 128 assist drawings, ${cases} facing/wall scenarios; single yellow strike, large stomach finisher, all partner bodies loaded, and 2322 keeps four damage contacts.`);
