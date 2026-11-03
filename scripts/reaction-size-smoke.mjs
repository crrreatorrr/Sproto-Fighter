// Tests real core contacts and renderer selection, not visual approval.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import ts from 'typescript';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const compile=p=>ts.transpileModule(read(p).toString(),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const cu=url(bundledCore()),eu=url(compile('src/animationEvents.ts')),core=await import(cu);
const poses=await import(url(compile('src/poseAtlas.ts').replace("from './core'",`from '${cu}'`).replace("from './animationEvents'",`from '${eu}'`)));
const fixture=await import(url(compile('art/reaction-review-fixture.ts').replace("from '../src/core'",`from '${cu}'`)));
const original=JSON.parse(read('public/fighters/pose-atlas.json')),review=JSON.parse(read('art/reaction-size-qa-20261102/calibrations.json'));
let manifest=structuredClone(original);
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class {set src(u){this.url=u;const b=read('public'+u.split('?')[0]);this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}};
await poses.loadPoseAtlases();
for(const item of review){const cfg=original.fighters[item.id];
 for(const [slot,key] of [[0,'neutralSHA256'],[24,'hitSHA256']])assert.equal(createHash('sha256').update(read('public'+cfg.frames[slot].url)).digest('hex'),item[key],`${item.id} source changed: repeat anatomical review`);
 assert.deepEqual(cfg.poseRegistration,{hit:{pixelScale:item.pixelScale,anchorOffset:item.anchorOffset}});
 for(const face of [-1,1]){const s=core.createState(item.id,'dummy'),f=s.fighters[0];f.facing=face;f.stun=12;f.reaction={kind:'launch',phase:'flight',t:0,direction:-face};f.y=core.FLOOR-30;
  const draws=[],ctx={save(){},restore(){},translate(){},rotate(){},scale(){},drawImage(i,x,y,w,h){draws.push({i,x,y,w,h});}};const before=JSON.stringify(s);poses.drawPoseAtlas(ctx,f,0);
  assert.equal(JSON.stringify(s),before);assert.equal(poses.getPoseAtlasDebug(f,0).slot,24);
  const d=draws[0],frame=cfg.frames[24],an=frame.anchor??cfg.anchor;
  assert.equal(d.w,(frame.width??cfg.width)*item.pixelScale);assert.equal(d.h,(frame.height??cfg.height)*item.pixelScale);
  assert.equal(d.x,-an[0]*item.pixelScale);assert.equal(d.y,-an[1]*item.pixelScale);
  const torso=cfg.holdContact.torso,grip=core.getThrowGrip(f,'torso');
  for(let i=0;i<2;i++)assert.ok(Math.abs(grip[i]-(torso[i]-an[i])*cfg.scale*item.pixelScale)<1e-8,`${item.id} calibrated held torso contact`);
 }
}
let cases=0,snapshots=0;
for(const id of core.PLAYABLE_FIGHTERS)for(const face of [-1,1]){
 const seen=new Set(['neutral']);
 for(const kind of fixture.REACTION_CASES){const run=fixture.reactionFixture(id,face,kind);
  for(let i=0;i<180;i++)for(const key of run.advance())seen.add(key);
  assert.ok(run.hit,`${id} ${kind} must actually hit`);const f=run.state.fighters[0];assert.equal(f.reaction,null);assert.equal(f.stun,0);assert.equal(f.y,core.FLOOR);cases++;
 }
 assert.deepEqual([...seen].sort(),[...fixture.REACTION_COLUMNS].sort(),`${id} missing real reaction phase`);snapshots+=seen.size;
}
for(const bad of [null,[],{misspelled:{pixelScale:1,anchorOffset:[0,0]}},{hit:{pixelScale:0,anchorOffset:[0,0]}},{hit:{pixelScale:3,anchorOffset:[0,0]}},{hit:{pixelScale:1,anchorOffset:[NaN,0]}}]){
 manifest=structuredClone(original);manifest.fighters.bront.poseRegistration=bad;
 await assert.rejects(poses.loadPoseAtlases());assert.equal(poses.getPoseAtlasLoadStatus().state,'error');
}
manifest=original;await poses.loadPoseAtlases();assert.equal(poses.getPoseAtlasLoadStatus().state,'ready');
console.log(JSON.stringify({owners:core.PLAYABLE_FIGHTERS.length,bodies:Object.keys(original.fighters).length,actualContactCases:cases,expectedBrowserSnapshots:snapshots,calibratedSources:review.length,invalidRegistrationsRejected:6,visual:'Recorded separately; this script does not approve artwork.'}));
