import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const temp=mkdtempSync(join(tmpdir(),'sproto-map-'));
try{
 assert.equal(spawnSync(process.execPath,[resolve('node_modules/typescript/bin/tsc'),'src/campaignMapLayout.ts','src/campaignMapViewport.ts','src/storyProgress.ts','src/stageVariants.ts','--outDir',temp,'--module','commonjs','--target','ES2022','--skipLibCheck'],{stdio:'inherit'}).status,0);
 const req=createRequire(import.meta.url),{campaignMapMarkerLayout,campaignMapPoints,campaignMapPaths}=req(join(temp,'campaignMapLayout.js')),{STORY_ENCOUNTERS}=req(join(temp,'storyProgress.js')),{storyLocationForEncounter}=req(join(temp,'stageVariants.js'));
 const before=JSON.stringify(STORY_ENCOUNTERS),points=campaignMapPoints(STORY_ENCOUNTERS);assert.equal(points.length,STORY_ENCOUNTERS.length);assert.equal(new Set(points.map(p=>p.join(','))).size,STORY_ENCOUNTERS.length);assert.equal(JSON.stringify(STORY_ENCOUNTERS),before);
 for(const p of points)assert.ok(p.every(n=>Number.isFinite(n)&&n>0&&n<100));
 const distances=points.flatMap((p,i)=>points.slice(i+1).map((q,j)=>({a:i+1,b:i+j+2,d:Math.hypot((p[0]-q[0])*30,(p[1]-q[1])*16.875)}))).sort((a,b)=>a.d-b.d);
 console.log('Map spacing at detail 3000px width:',JSON.stringify(distances.slice(0,5)));
 const markerLayout=campaignMapMarkerLayout(points),nodeSize=3000*markerLayout.nodeRatio;
 assert.ok(markerLayout.detailWidth<=3840,'actual route must support readable numbered detail at native map resolution');
 assert.ok(distances[0].d>=nodeSize+1.5,'detail encounter targets must not overlap');
 assert.ok(distances[0].d*.8>=nodeSize*.8+1,'2400px detail zoom keeps targets separated');
 const stages=['trenches','circuit','yacht','throne','bar','verse','hatchery'],counts=[26,24,24,24,24,25,3];
 const synthetic=stages.flatMap((stage,s)=>Array.from({length:counts[s]},(_,i)=>({id:`geometry-only-${stage}-${i}`,stage})));
 const expanded=campaignMapPoints(synthetic);assert.equal(expanded.length,150);assert.equal(new Set(expanded.map(p=>p.join(','))).size,150);
 const expandedGap=Math.min(...expanded.flatMap((p,i)=>expanded.slice(i+1).map(q=>Math.hypot((p[0]-q[0])*30,(p[1]-q[1])*16.875))));
 assert.ok(expandedGap>=21.5,'synthetic150 markers keep20px targets separated at3000px detail');
 const expandedLayout=campaignMapMarkerLayout(expanded);
 assert.ok(expandedLayout.detailWidth<=3840,'synthetic150 target spacing must support readable detail at native resolution');
 assert.ok(expandedGap-3000*expandedLayout.nodeRatio>=1.5,'synthetic150 targets have actual clear space');
 assert.equal(campaignMapPaths(synthetic).length,stages.length,'render separate road traces instead of straight water-crossing connectors');
 assert.deepEqual(campaignMapPoints([]),[]);
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
 assert.ok(readFileSync('public/story/campaign-map-expanded.webp').length>0);
 console.log(`PASS: whole-map initial fit at 5 desktop/mobile sizes; aspect/zoom bounds and readable detail; ${points.length} actual unique/bounded/separated map nodes; synthetic 150-node geometry (minimum gap ${expandedGap.toFixed(2)}px); stable encounter IDs; 24 approved scenes mapped; original map retained.`);
}finally{rmSync(temp,{recursive:true,force:true});}
