import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const temp=mkdtempSync(join(tmpdir(),'sproto-map-'));
try{
 assert.equal(spawnSync(process.execPath,[resolve('node_modules/typescript/bin/tsc'),'src/campaignMapLayout.ts','src/campaignMapViewport.ts','src/storyProgress.ts','src/stageVariants.ts','--outDir',temp,'--module','commonjs','--target','ES2022','--skipLibCheck'],{stdio:'inherit'}).status,0);
 const req=createRequire(import.meta.url),{campaignMapPoints}=req(join(temp,'campaignMapLayout.js')),{STORY_ENCOUNTERS}=req(join(temp,'storyProgress.js')),{storyLocationForEncounter}=req(join(temp,'stageVariants.js'));
 const before=JSON.stringify(STORY_ENCOUNTERS),points=campaignMapPoints(STORY_ENCOUNTERS);assert.equal(points.length,100);assert.equal(new Set(points.map(p=>p.join(','))).size,100);assert.equal(JSON.stringify(STORY_ENCOUNTERS),before);
 for(const p of points)assert.ok(p.every(n=>Number.isFinite(n)&&n>0&&n<100));
 const distances=points.flatMap((p,i)=>points.slice(i+1).map((q,j)=>({a:i+1,b:i+j+2,d:Math.hypot((p[0]-q[0])*30,(p[1]-q[1])*16.875)}))).sort((a,b)=>a.d-b.d);
 console.log('Map spacing at detail 3000px width:',JSON.stringify(distances.slice(0,5)));
 assert.ok(distances[0].d>=32.5,'detail-size 30px encounter targets must not overlap');
 assert.ok(distances[0].d*.8>=26,'2400px detail zoom keeps 24px encounter targets separated');
 const {campaignMapViewport}=req(join(temp,'campaignMapViewport.js'));
 for(const [width,height]of [[1178,390],[960,220],[342,256],[272,256],[1178,120]]){
  const fit=campaignMapViewport(width,height);
  assert.equal(fit.zoom,100);assert.ok(fit.overview);
  assert.ok(fit.width<=width-24+.001&&fit.height<=height-24+.001,'first open must fit the whole map with edge clearance');
  assert.ok(Math.abs(fit.width/fit.height-16/9)<1e-9,'map aspect ratio must stay unchanged');
  const detail=campaignMapViewport(width,height,Math.ceil(2400/fit.fitWidth*4)*25);
  assert.ok(detail.width>=2400&&detail.width<3841,'region and next-fight controls must reach readable numbered detail');
  assert.equal(detail.overview,false);
  assert.ok(campaignMapViewport(width,height,fit.maxZoom).width>=3840,'slider retains deep inspection zoom on narrow screens');
  assert.equal(campaignMapViewport(width,height,0).zoom,100,'fit is the minimum zoom');
  assert.equal(campaignMapViewport(width,height,fit.maxZoom+100).zoom,fit.maxZoom);
 }
 const locations=STORY_ENCOUNTERS.map(e=>storyLocationForEncounter(e,STORY_ENCOUNTERS));assert.equal(new Set(locations.filter(Boolean).map(l=>l.id)).size,24);for(const [i,e]of STORY_ENCOUNTERS.entries())if(e.stage==='bar'||e.stage==='hatchery')assert.equal(locations[i],null);
 assert.ok(readFileSync('public/story/campaign-map.webp').length>0);
 console.log('PASS: whole-map initial fit at 5 desktop/mobile sizes; aspect/zoom bounds and readable detail; 100 unique, bounded, separated map nodes; stable encounter IDs; all 24 approved scenes mapped to the canonical route; Bar/Hatchery retained.');
}finally{rmSync(temp,{recursive:true,force:true});}
