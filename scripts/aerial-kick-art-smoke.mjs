// Real renderer selection/timing against individually inspected art. No browser claim.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import ts from 'typescript';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const hash=b=>createHash('sha256').update(b).digest('hex');
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const compile=p=>ts.transpileModule(read(p).toString(),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const coreUrl=url(bundledCore()), eventsUrl=url(compile('src/animationEvents.ts'));
const core=await import(coreUrl);
const poses=await import(url(compile('src/poseAtlas.ts').replace("from './core'",`from '${coreUrl}'`).replace("from './animationEvents'",`from '${eventsUrl}'`)));
const manifest=JSON.parse(read('public/fighters/pose-atlas.json'));
const review=JSON.parse(read('art/movement-followup-20261102/aerial-kick-review.json'));
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>manifest});
globalThis.Image=class {
  set src(value){this.url=value;const b=read('public'+value.split('?')[0]);this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}
};
await poses.ensurePoseAtlases(['gryph','nosmileclown']);
let frames=0, active=0, restored=0;
for(const owner of ['gryph','nosmileclown'])for(const facing of [-1,1])for(const action of ['airMedium','airHeavy']){
  const s=core.createState(owner,'dummy'),f=s.fighters[0];
  f.x=640;f.y=core.FLOOR-100;f.facing=facing;
  const ids=core.bodyAtlasIds(owner),lead=ids[facing===1?ids.length-1:0],finding=review.bodies[lead];
  assert.equal(hash(read('public'+finding.approvedContactUrl)),finding.approvedContactSha256,'reviewed pixels must remain unchanged');
  const move=core.getMove(f,action),total=move.startup+move.active+move.recovery;
  for(let age=0;age<total;age++){
    s.frame++;f.move={id:action,t:age,hit:false,connected:false,wave:-1,aim:'level'};
    const before=JSON.stringify(s),draws=[];
    const c={save(){},restore(){},translate(){},rotate(){},scale(){},drawImage(image){draws.push(image.url.split('?')[0]);}};
    poses.drawPoseAtlas(c,f,s.frame);
    assert.equal(JSON.stringify(s),before,'painting must not change simulation state');
    assert.equal(draws.length,2,'both complete bodies are drawn');
    if(age>=move.startup&&age<move.startup+move.active){
      assert.ok(draws.includes(finding.approvedContactUrl),`${owner} facing ${facing} ${action} age ${age}: active contact must show the inspected extended-leg kick`);
      active++;
    }
    frames++;
  }
  f.move=null;f.y=core.FLOOR;f.vy=0;
  for(let t=0;t<12;t++){core.step(s,[0,0]);poses.getPoseAtlasDebug(f,s.frame);}
  assert.equal(poses.getPoseAtlasDebug(f,s.frame).slot,0,'recovery and landing return to guard');restored++;
}
for(const [body,finding]of Object.entries(review.bodies)){
  const clip=manifest.fighters[body].clips.airKick;
  assert.equal(clip.length,6);
  for(const slot of [0,1,3,4,5])assert.deepEqual(clip[slot],finding.before[slot],body+' preserved anticipation/recovery/scale metadata');
  assert.equal(new Set(clip.map(f=>f.url)).size,5,'five distinct drawings and one deliberate active hold');
}
console.log(`PASS: ${frames} rendered phase frames, ${active} active contacts, ${restored} recoveries; four body identities, both facings. Pixel semantics were reviewed separately; no live-motion approval.`);
