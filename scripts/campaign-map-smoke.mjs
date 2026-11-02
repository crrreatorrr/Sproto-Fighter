import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const temp=mkdtempSync(join(tmpdir(),'sproto-map-'));
try{
 assert.equal(spawnSync(process.execPath,[resolve('node_modules/typescript/bin/tsc'),'src/campaignMapLayout.ts','src/storyProgress.ts','src/stageVariants.ts','--outDir',temp,'--module','commonjs','--target','ES2022','--skipLibCheck'],{stdio:'inherit'}).status,0);
 const req=createRequire(import.meta.url),{campaignMapPoints}=req(join(temp,'campaignMapLayout.js')),{STORY_ENCOUNTERS}=req(join(temp,'storyProgress.js')),{storyLocationForEncounter}=req(join(temp,'stageVariants.js'));
 const before=JSON.stringify(STORY_ENCOUNTERS),points=campaignMapPoints(STORY_ENCOUNTERS);assert.equal(points.length,100);assert.equal(new Set(points.map(p=>p.join(','))).size,100);assert.equal(JSON.stringify(STORY_ENCOUNTERS),before);
 for(const p of points)assert.ok(p.every(n=>Number.isFinite(n)&&n>0&&n<100));
 const distances=points.flatMap((p,i)=>points.slice(i+1).map((q,j)=>({a:i+1,b:i+j+2,d:Math.hypot((p[0]-q[0])*30,(p[1]-q[1])*16.875)}))).sort((a,b)=>a.d-b.d);
 console.log('Map spacing at default 3000px width:',JSON.stringify(distances.slice(0,5)));
 assert.ok(distances[0].d>=32.5,'default-size 30px encounter targets must not overlap');
 assert.ok(distances[0].d*.8>=26,'minimum zoom keeps 24px encounter targets separated');
 const locations=STORY_ENCOUNTERS.map(e=>storyLocationForEncounter(e,STORY_ENCOUNTERS));assert.equal(new Set(locations.filter(Boolean).map(l=>l.id)).size,24);for(const [i,e]of STORY_ENCOUNTERS.entries())if(e.stage==='bar'||e.stage==='hatchery')assert.equal(locations[i],null);
 assert.ok(readFileSync('public/story/campaign-map.webp').length>0);
 console.log('PASS: 100 unique, bounded, separated map nodes; stable encounter IDs; all 24 approved scenes mapped to the canonical route; Bar/Hatchery retained.');
}finally{rmSync(temp,{recursive:true,force:true});}
