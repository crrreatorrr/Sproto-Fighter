// Campaign composition, identity migration and atomic multi-bout progression.
// Synthetic registry entries below are test fixtures only: no runtime roster/art is added.
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';

const temp=mkdtempSync(join(tmpdir(),'sproto-expanded-story-'));
let groups=0;
try{
 assert.equal(spawnSync(process.execPath,[resolve('node_modules/typescript/bin/tsc'),'src/storyProgress.ts','--outDir',temp,'--module','commonjs','--target','ES2022','--skipLibCheck'],{stdio:'inherit'}).status,0);
 const req=createRequire(import.meta.url),story=req(join(temp,'storyProgress.js'));
 const {PLAYABLE_FIGHTERS,isPairedFighter,createState,step,A}=req(join(temp,'core.js'));
 const {STORY_STAGE_IDS}=req(join(temp,'stage.js'));
 const {campaignForStages,createStoryProgress,STORY_ENCOUNTERS,STORY_OPPONENTS,STARTER_FIGHTERS,STORY_ROSTER_COUNTS,CAMPAIGN_RECRUITS,STORY_SAVE_KEY,PREVIOUS_STORY_SAVE_KEY,LEGACY_STORY_SAVE_KEY,PREVIOUS_STORY_OPPONENTS,LEGACY_STORY_OPPONENTS}=story;
 const disk=(initial={})=>{const values=new Map(Object.entries(initial));return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};};
 const check=(name,run)=>{run();groups++;console.log('PASS:',name);};
 const baseline=[...new Set(['rivet','bront',...LEGACY_STORY_OPPONENTS])];
 const fixture150=[...PLAYABLE_FIGHTERS,...Array.from({length:Math.max(0,150-PLAYABLE_FIGHTERS.length)},(_,i)=>`qa_registered_fixture_${i+1}`)];
 const id=fighter=>`story-v1-${fighter}`;
 function verifyRoute(registry,route){
  const opponents=route.flatMap(e=>e.opponents),expected=registry.filter(f=>!STARTER_FIGHTERS.includes(f));
  assert.equal(new Set(opponents).size,opponents.length);assert.deepEqual(new Set(opponents),new Set(expected));
  assert.equal(route.length,registry.length-4);assert.equal(new Set(route.map(e=>e.id)).size,route.length);
  for(const [index,e] of route.entries()){assert.equal(e.index,index);assert.equal(e.opponent,e.opponents[0]);assert.ok(e.opponents.length===1||e.opponents.length===2);}
  assert.deepEqual(route.at(-3).opponents,['rivet']);assert.deepEqual(route.at(-2).opponents,['sproto865','sproto943']);assert.deepEqual(route.at(-1).opponents,['vela','vaudream']);
  assert.equal(route.at(-2).gauntlet,'art');assert.equal(route.at(-2).stage,'verse');assert.equal(route.at(-1).gauntlet,'final');assert.equal(route.at(-1).stage,'hatchery');
  for(const e of route)if(isPairedFighter(e.opponent)){assert.ok(e.index<route.length-2);assert.equal(e.stage,'verse');}
  assert.deepEqual([...new Set(route.map(e=>e.stage))],STORY_STAGE_IDS);
 }
 const finish=(progress,route)=>{for(let index=0;index<route.length;index++){if(progress.isCleared(index))continue;assert.ok(progress.begin(index));for(let wave=0;wave<route[index].opponents.length;wave++)assert.ok(progress.win(index,wave));}};
 function beforeGauntlet(index){
  const cleared=STORY_ENCOUNTERS.slice(0,index).map(e=>e.id);
  return disk({[STORY_SAVE_KEY]:JSON.stringify({version:3,cleared,unlocked:STARTER_FIGHTERS,godModeUnlocked:false})});
 }
 const legacyRecord=(version,count)=>{const order=version===1?LEGACY_STORY_OPPONENTS:PREVIOUS_STORY_OPPONENTS;return {version,cleared:order.slice(0,count).map(id),unlocked:[...new Set([...(version===1?['rivet','bront']:STARTER_FIGHTERS),...order.slice(0,count)])]};};

 check('registered baseline102 and current roster each produce exact distinct opponents and grouped boss nodes',()=>{
  assert.equal(baseline.length,102);verifyRoute(baseline,campaignForStages(STORY_STAGE_IDS,baseline));verifyRoute(PLAYABLE_FIGHTERS,STORY_ENCOUNTERS);
  assert.equal(STORY_ROSTER_COUNTS.installed,PLAYABLE_FIGHTERS.length);assert.equal(STORY_ROSTER_COUNTS.rivals,PLAYABLE_FIGHTERS.length-2);assert.equal(STORY_ROSTER_COUNTS.encounters,PLAYABLE_FIGHTERS.length-4);assert.equal(STORY_ROSTER_COUNTS.missing,Math.max(0,150-PLAYABLE_FIGHTERS.length));assert.deepEqual(STORY_OPPONENTS,STORY_ENCOUNTERS.flatMap(e=>e.opponents));
 });
 check('optional Satoshi/Xalt/Potocaicai pins appear in Verse immediately before Golden only when registered',()=>{
  for(const registry of [baseline,PLAYABLE_FIGHTERS,fixture150]){
   const route=campaignForStages(STORY_STAGE_IDS,registry),expected=CAMPAIGN_RECRUITS.filter(id=>registry.includes(id)),golden=route.findIndex(e=>e.opponent==='rivet');
   assert.deepEqual(route.slice(golden-expected.length,golden).map(e=>e.opponent),expected);
   for(const id of expected){const e=route.find(e=>e.opponent===id);assert.equal(e.stage,'verse');assert.ok(route.filter(e=>isPairedFighter(e.opponent)).every(p=>p.index<e.index));}
   for(const id of CAMPAIGN_RECRUITS.filter(id=>!registry.includes(id)))assert.equal(route.some(e=>e.opponents.includes(id)),false);
  }
 });
 check('new progression source typechecks against a102-entry registered fixture with no optional pin IDs',()=>{
  const fixture=join(temp,'baseline-typecheck');mkdirSync(fixture);
  writeFileSync(join(fixture,'core.ts'),`export const PLAYABLE_FIGHTERS=${JSON.stringify(baseline)} as const;export type PlayableFighterId=typeof PLAYABLE_FIGHTERS[number];export const isPairedFighter=(id:PlayableFighterId)=>new Set<string>(${JSON.stringify(baseline.filter(isPairedFighter))}).has(id);`);
  writeFileSync(join(fixture,'stage.ts'),`export const STORY_STAGE_IDS=${JSON.stringify(STORY_STAGE_IDS)} as const;export type StageId=typeof STORY_STAGE_IDS[number];`);
  writeFileSync(join(fixture,'storyProgress.ts'),readFileSync(resolve('src/storyProgress.ts'),'utf8'));
  assert.equal(spawnSync(process.execPath,[resolve('node_modules/typescript/bin/tsc'),join(fixture,'storyProgress.ts'),'--noEmit','--module','commonjs','--target','ES2022','--skipLibCheck'],{stdio:'inherit'}).status,0);
 });
 check('isolated150-entry registry yields148 rivals/146 nodes without adding fake runtime fighters',()=>{
  assert.equal(fixture150.length,150);const route=campaignForStages(STORY_STAGE_IDS,fixture150);verifyRoute(fixture150,route);
  assert.equal(route.flatMap(e=>e.opponents).length,148);assert.equal(route.length,146);assert.ok(PLAYABLE_FIGHTERS.every(f=>!f.startsWith('qa_registered_fixture_')));
  const p=createStoryProgress(disk(),route,fixture150);finish(p,route);assert.equal(p.snapshot().completed,true);assert.equal(p.snapshot().unlocked.length,150);
 });
 check('absent references never become opponents and duplicate registry inputs are harmless',()=>{
  const partial=baseline.filter(f=>!['rivet','sproto943','vaudream'].includes(f)),route=campaignForStages(STORY_STAGE_IDS,[...partial,...partial]);
  const actual=route.flatMap(e=>e.opponents);assert.deepEqual(new Set(actual),new Set(partial.filter(f=>!STARTER_FIGHTERS.includes(f))));assert.equal(actual.length,new Set(actual).size);assert.ok(actual.every(f=>partial.includes(f)));
 });
 check('fresh saves expose only starters and the first node; invalid wave/index requests do not mutate progress',()=>{
  const p=createStoryProgress(disk());assert.deepEqual(p.snapshot().unlocked,STARTER_FIGHTERS);assert.equal(p.snapshot().nextIndex,0);assert.equal(p.snapshot().godModeUnlocked,false);
  for(const n of [-1,NaN,.5,STORY_ENCOUNTERS.length]){assert.equal(p.canPlay(n),false);assert.equal(p.begin(n),false);assert.equal(p.win(n),false);assert.equal(p.currentOpponent(n),undefined);}
  assert.equal(p.win(0,1),false);assert.equal(p.win(0,-1),false);assert.equal(p.win(0,.5),false);assert.equal(p.win(1),false);assert.equal(p.snapshot().cleared.length,0);
 });
 check('all current recruits can be earned, reloaded and replayed without dropping completion',()=>{
  const store=disk(),p=createStoryProgress(store);finish(p,STORY_ENCOUNTERS);const restored=createStoryProgress(store);
  assert.equal(restored.snapshot().completed,true);assert.equal(restored.snapshot().nextIndex,null);assert.equal(restored.snapshot().godModeUnlocked,true);assert.equal(restored.snapshot().unlocked.length,PLAYABLE_FIGHTERS.length);
  const count=restored.snapshot().cleared.length;assert.ok(restored.win(0));assert.equal(restored.snapshot().cleared.length,count);
  const copy=restored.snapshot();copy.cleared.length=0;copy.unlocked.length=0;assert.equal(restored.snapshot().cleared.length,count);assert.equal(restored.snapshot().unlocked.length,PLAYABLE_FIGHTERS.length);
 });
 for(const version of [1,2])check(`v${version} migration preserves all101 historical prefix positions and old keys`,()=>{
  const order=version===1?LEGACY_STORY_OPPONENTS:PREVIOUS_STORY_OPPONENTS,key=version===1?LEGACY_STORY_SAVE_KEY:PREVIOUS_STORY_SAVE_KEY;
  for(let count=0;count<=100;count++){
   const old=legacyRecord(version,count),raw=JSON.stringify(old),store=disk({[key]:raw}),p=createStoryProgress(store),won=new Set(order.slice(0,count));
   if(count===99)won.delete('vela');if(count===100)won.add('rivet');
   const expected=STORY_ENCOUNTERS.filter(e=>e.opponents.every(f=>won.has(f))).map(e=>e.id);
   assert.deepEqual(p.snapshot().cleared,expected,`count ${count}`);for(const f of old.unlocked)assert.ok(p.isUnlocked(f),`${f} at ${count}`);
   assert.ok(p.isUnlocked('highsproto'));assert.equal(p.snapshot().godModeUnlocked,count===100);
   const next=STORY_ENCOUNTERS.findIndex(e=>!expected.includes(e.id));assert.equal(p.snapshot().nextIndex,next<0?null:next);
   if(next>=0){assert.ok(p.win(next,0));assert.equal(store.getItem(key),raw);assert.equal(JSON.parse(store.getItem(STORY_SAVE_KEY)).version,3);}
  }
 });
 check('recognized emptyv1 preserves Golden; malformed records cannot unlock a skipped encounter',()=>{
  for(const old of [{version:1,cleared:[]},{version:1},{version:1,unlocked:[]}]){const p=createStoryProgress(disk({[LEGACY_STORY_SAVE_KEY]:JSON.stringify(old)}));assert.ok(p.isUnlocked('rivet'));assert.equal(p.snapshot().cleared.length,0);}
  for(const value of ['{','null',JSON.stringify({version:9,cleared:STORY_ENCOUNTERS.map(e=>e.id)}),JSON.stringify({version:2,cleared:[id('vaudream')],unlocked:['unregistered']})]){const p=createStoryProgress(disk({[PREVIOUS_STORY_SAVE_KEY]:value}));assert.equal(p.snapshot().cleared.length,0);assert.equal(p.snapshot().godModeUnlocked,false);assert.equal(p.canPlay(STORY_ENCOUNTERS.length-1),false);}
 });
 check('completed older routes retain reward and every cleared node while inserted fighters remain available to earn',()=>{
  const baseRoute=campaignForStages(STORY_STAGE_IDS,baseline),store=disk(),old=createStoryProgress(store,baseRoute,baseline);finish(old,baseRoute);
  const expanded=createStoryProgress(store);assert.equal(expanded.snapshot().godModeUnlocked,true);assert.equal(expanded.snapshot().completed,PLAYABLE_FIGHTERS.length===baseline.length);
  for(const e of baseRoute)assert.ok(expanded.snapshot().cleared.includes(e.id));
  const added=PLAYABLE_FIGHTERS.filter(f=>!baseline.includes(f));for(const f of added)assert.equal(expanded.isUnlocked(f),false);
  if(added.length){const next=expanded.snapshot().nextIndex;assert.ok(next<expanded.snapshot().cleared.length,'saved wins after newly inserted gap remain');assert.equal(expanded.canPlay(next),true);assert.equal(expanded.canPlay(next+1),false);assert.equal(expanded.isCleared(STORY_ENCOUNTERS.length-1),true);finish(expanded,STORY_ENCOUNTERS);assert.equal(expanded.snapshot().completed,true);}
 });
 check('stale tabs merge current/legacy wins and preserve valid future records from a newer registered roster',()=>{
  const store=disk(),older=createStoryProgress(store,campaignForStages(STORY_STAGE_IDS,baseline),baseline),current=createStoryProgress(store);
  current.win(0);assert.equal(older.snapshot().cleared.length,0);older.sync();assert.equal(older.snapshot().cleared.length,1);
  const futureRoute=campaignForStages(STORY_STAGE_IDS,fixture150),future=createStoryProgress(store,futureRoute,fixture150);finish(future,futureRoute);
  const allFuture=JSON.parse(store.getItem(STORY_SAVE_KEY));older.win(0);const retained=JSON.parse(store.getItem(STORY_SAVE_KEY));
  for(const value of allFuture.cleared)assert.ok(retained.cleared.includes(value));for(const value of allFuture.unlocked)assert.ok(retained.unlocked.includes(value));
  const reload=createStoryProgress(store,futureRoute,fixture150);assert.equal(reload.snapshot().completed,true);assert.equal(reload.snapshot().unlocked.length,150);assert.ok(older.snapshot().unlocked.every(f=>baseline.includes(f)));
  const legacy=JSON.stringify(legacyRecord(1,50));store.setItem(LEGACY_STORY_SAVE_KEY,legacy);current.sync();assert.ok(current.isUnlocked('rivet'));current.win(0);assert.equal(store.getItem(LEGACY_STORY_SAVE_KEY),legacy);
 });
 for(const type of ['art','final'])check(`${type} gauntlet recruits wave1 but only atomically clears after both sequential wins`,()=>{
  const index=STORY_ENCOUNTERS.findIndex(e=>e.gauntlet===type),e=STORY_ENCOUNTERS[index],store=beforeGauntlet(index),p=createStoryProgress(store);
  assert.equal(p.win(index,1),false);assert.ok(p.begin(index));assert.equal(p.currentWave(index),0);assert.equal(p.currentOpponent(index),e.opponents[0]);assert.ok(p.win(index,0));assert.ok(p.isUnlocked(e.opponents[0]));assert.equal(p.isCleared(index),false);assert.equal(p.snapshot().nextIndex,index);assert.equal(p.currentWave(index),1);assert.equal(p.currentOpponent(index),e.opponents[1]);assert.equal(p.win(index,0),false,'duplicate first result');
  const reloaded=createStoryProgress(store);assert.ok(reloaded.isUnlocked(e.opponents[0]));assert.equal(reloaded.currentWave(index),0);assert.equal(reloaded.win(index,1),false,'reload has no midpoint checkpoint');
  assert.ok(reloaded.begin(index));assert.ok(reloaded.win(index,0));reloaded.abandonRun();assert.equal(reloaded.win(index,1),false,'death/leaving clears the run');assert.ok(reloaded.isUnlocked(e.opponents[0]));
  assert.ok(reloaded.begin(index));assert.ok(reloaded.win(index,0));assert.ok(reloaded.win(index,1));assert.ok(reloaded.isCleared(index));assert.ok(reloaded.isUnlocked(e.opponents[1]));assert.equal(reloaded.currentWave(index),0);
  const finalReload=createStoryProgress(store);assert.ok(finalReload.isCleared(index));assert.equal(finalReload.snapshot().godModeUnlocked,type==='final');
 });
 check('normal and God Mode combat KOs award identical persistent story progress',()=>{
  const states=[];
  for(const godMode of [false,true]){
   const store=disk(),p=createStoryProgress(store),combat=createState('highsproto','dummy',STORY_ENCOUNTERS[0].opponent);combat.godMode=godMode;combat.fighters[0].x=500;combat.fighters[1].x=550;combat.fighters[1].hp=1;
   assert.ok(p.begin(0));for(let frame=0;frame<180&&combat.winner===null;frame++)step(combat,[frame===0?A.light:0,0]);assert.equal(combat.winner,0);assert.ok(p.win(0,0));
   const reload=createStoryProgress(store);assert.ok(reload.isUnlocked(STORY_ENCOUNTERS[0].opponent));assert.equal(reload.snapshot().nextIndex,1);states.push(reload.snapshot());
  }
  assert.deepEqual(states[0],states[1]);
 });
 check('unavailable storage retains session progress and reports that it is not persistent',()=>{
  const p=createStoryProgress({getItem(){throw Error('blocked');},setItem(){throw Error('quota');}});assert.equal(p.snapshot().persistent,false);assert.ok(p.win(0));assert.ok(p.win(1));assert.equal(p.snapshot().cleared.length,2);assert.equal(p.snapshot().persistent,false);
 });
 console.log(`${groups} expanded campaign groups passed; actual installed ${PLAYABLE_FIGHTERS.length}, rivals ${STORY_OPPONENTS.length}, encounters ${STORY_ENCOUNTERS.length}, missing to150 ${STORY_ROSTER_COUNTS.missing}.`);
}finally{rmSync(temp,{recursive:true,force:true});}
