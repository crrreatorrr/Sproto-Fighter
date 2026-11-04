// Installed files, actual stage renderer and campaign mapping; no browser claim.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const root=resolve('.'),temp=mkdtempSync(join(tmpdir(),'sproto-stage-catalog-'));
try {
 assert.equal(spawnSync(process.execPath,[resolve('node_modules/typescript/bin/tsc'),'src/stage.ts','src/stageGroups.ts','src/stageVariants.ts','src/storyProgress.ts','--outDir',temp,'--module','commonjs','--target','ES2022','--skipLibCheck','--resolveJsonModule','--esModuleInterop'],{stdio:'inherit'}).status,0);
 const require=createRequire(import.meta.url),stage=require(join(temp,'stage.js'));
 const {STORY_LOCATIONS,storyLocationForEncounter,loadStoryLocation,drawStoryLocation}=require(join(temp,'stageVariants.js'));
 const {STAGE_ZONES,stageZone,stagesInZone}=require(join(temp,'stageGroups.js'));
 const {STORY_ENCOUNTERS,createStoryProgress}=require(join(temp,'storyProgress.js'));
 const manifest=JSON.parse(readFileSync('public/stages/variations-v2/manifest.json','utf8'));
 const images=stage.STAGES.map(s=>stage.stageImageSource(s.id));
 const installed=readdirSync('public/stages',{recursive:true}).filter(path=>path.endsWith('.png')).map(path=>'/stages/'+path);
 assert.equal(stage.STAGES.length,121);assert.equal(new Set(images).size,121);
 assert.deepEqual([...images].sort(),installed.sort(),'every installed runtime stage is selectable exactly once');
 for(const location of STORY_LOCATIONS)assert.ok(images.includes(location.image),'missing story scenery '+location.id);
 for(const approved of manifest){
  assert.equal(stage.stageImageSource(approved.id),approved.image);
  const bytes=readFileSync('public'+approved.image);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),approved.sha256,'approved source unchanged');
 }
 const counts=Object.fromEntries(STAGE_ZONES.map(zone=>[zone.id,stagesInZone(zone.id).length]));
 assert.deepEqual(counts,{trenches:15,circuit:19,yacht:15,throne:19,bar:13,verse:15,hatchery:12,ranch:13});
 for(const entry of stage.STAGES)assert.ok(stagesInZone(stageZone(entry.id)).some(s=>s.id===entry.id));
 console.log('PASS: 121 unique installed arenas; all 112 story locations and 24 approved panoramas are selectable in eight zones; Ranch has thirteen choices.');

 const loads=[],blocked=new Set();
 globalThis.Image=class {
  set src(url){
   this.url=url;loads.push(url);
   if(blocked.has(url)){queueMicrotask(()=>this.onerror());return;}
   const bytes=readFileSync('public'+url);assert.equal(bytes.toString('ascii',1,4),'PNG');
   this.naturalWidth=bytes.readUInt32BE(16);this.naturalHeight=bytes.readUInt32BE(20);
   queueMicrotask(()=>this.onload());
  }
 };
 const ranch=stagesInZone('ranch').map(s=>s.id);
 await Promise.all([stage.loadStageArt(ranch),stage.loadStageArt(ranch)]);
 assert.equal(loads.length,13,'zone requests deduplicate without preloading every large panorama');
 await stage.loadStageArt(ranch);assert.equal(loads.length,13);
 const retry='00-trenches-drainage-floodgate',retryUrl=stage.stageImageSource(retry);
 blocked.add(retryUrl);await stage.loadStageArt([retry]);assert.ok(stage.getStageArtStatus().errors[retry]);
 blocked.delete(retryUrl);await stage.loadStageArt([retry]);assert.equal(stage.getStageArtStatus().errors[retry],undefined);
 await stage.loadStageArt();assert.equal(stage.getStageArtStatus().loaded.length,121);assert.deepEqual(stage.getStageArtStatus().errors,{});
 const ctx=()=>new Proxy({calls:[]},{get(o,k){return k in o?o[k]:(...args)=>o.calls.push([k,...args]);},set(o,k,v){o[k]=v;return true;}});
 for(const entry of stage.STAGES){
  stage.setStage('ranch');const preview=ctx();stage.drawStagePreview(preview,entry.id,256,110);
  assert.equal(stage.getStage(),'ranch','preview is side-effect-free');
  const source=preview.calls.find(call=>call[0]==='drawImage')[1];assert.equal(source.url,stage.stageImageSource(entry.id));
  stage.setStage(entry.id);const fight=ctx();stage.drawStage(fight,0);
  assert.equal(fight.calls.find(call=>call[0]==='drawImage')[1],source,'preview and fight use exact same loaded image');
 }
 for(const location of STORY_LOCATIONS){
  await loadStoryLocation(location);const story=ctx();assert.equal(drawStoryLocation(story,location),true);
  assert.equal(story.calls.find(call=>call[0]==='drawImage')[1].url,location.image);
 }
 console.log('PASS: all 121 preview/fight backgrounds match; all 112 story images load; scoped loading deduplicates and retries failed art.');

 const values=new Map(),progress=createStoryProgress({getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)});
 assert.equal(progress.begin(0),true);assert.equal(progress.win(0,0),true);
 const save=JSON.stringify([...values]),route=JSON.stringify(STORY_ENCOUNTERS),used=new Set(),bouts=[];
 const allowed={trenches:['trenches'],ranch:['ranch'],circuit:['circuit','retro'],yacht:['yacht'],throne:['throne','castle'],bar:['bar'],verse:['verse'],hatchery:['hatchery']};
 for(const encounter of STORY_ENCOUNTERS)for(const [bout,opponent]of encounter.opponents.entries()){
  const location=storyLocationForEncounter(encounter,STORY_ENCOUNTERS,bout);assert.ok(location);
  assert.ok(allowed[encounter.stage].includes(location.stage),'themed regional mapping');
  assert.equal(storyLocationForEncounter(encounter,STORY_ENCOUNTERS,bout),location,'stable replay mapping');
  used.add(location.id);bouts.push({encounter:encounter.id,bout,opponent,location:location.id,image:location.image});
 }
 assert.equal(JSON.stringify(STORY_ENCOUNTERS),route);assert.equal(JSON.stringify([...values]),save,'mapping cannot rewrite saved progress');
 const hatchery=bouts.filter(b=>STORY_ENCOUNTERS.find(e=>e.id===b.encounter).stage==='hatchery');
 assert.ok(new Set(hatchery.map(b=>b.location)).size>=4);
 for(const item of manifest.filter(item=>item.stage==='ranch'))assert.ok(used.has(item.id),'Ranch outskirts remain on the route');
 const unused=STORY_LOCATIONS.filter(location=>!used.has(location.id)).map(location=>location.id);
 for(const id of ['ranch-orchard','ranch-windmill','ranch-creek'])assert.ok(used.has(id),'new Ranch map appears in actual story: '+id);
 assert.ok(used.size>=60,'expanded campaign visits the installed scenery');
 assert.ok(unused.every(id=>STORY_LOCATIONS.find(l=>l.id===id).stage==='verse'),'only the short final chapter may omit locations');
 console.log(`PASS: ${bouts.length} bouts use ${used.size} of ${STORY_LOCATIONS.length} story locations, including all three new Ranch maps. Mapping preserves opponent and save IDs.`);
 const output={counts,stages:stage.STAGES.map(entry=>({id:entry.id,name:entry.name,zone:stageZone(entry.id),image:stage.stageImageSource(entry.id)})),storyBouts:bouts,unusedStoryLocations:unused,browserVerified:false};
 if(process.env.STAGE_CATALOG_REPORT)writeFileSync(process.env.STAGE_CATALOG_REPORT,JSON.stringify(output,null,2)+'\n');
} finally {rmSync(temp,{recursive:true,force:true});}
