// Focused recruitment and save migration coverage for the three supplied fighters.
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const temp=mkdtempSync(join(tmpdir(),'sproto-recruits-'));
try{
 assert.equal(spawnSync(process.execPath,[resolve('node_modules/typescript/bin/tsc'),'src/storyProgress.ts','--outDir',temp,'--module','commonjs','--target','ES2022','--skipLibCheck','--resolveJsonModule','--esModuleInterop'],{stdio:'inherit'}).status,0);
 const req=createRequire(import.meta.url),{createStoryProgress,STORY_ENCOUNTERS,STORY_OPPONENTS,STORY_SAVE_KEY,PREVIOUS_STORY_SAVE_KEY,LEGACY_STORY_SAVE_KEY,PREVIOUS_STORY_OPPONENTS,LEGACY_STORY_OPPONENTS,CAMPAIGN_RECRUITS}=req(join(temp,'storyProgress.js'));
 const {isFreePlayAddition}=req(join(temp,'core.js'));
 const ids=['satoshi','xalt','potocaicai'],indices=ids.map(id=>STORY_ENCOUNTERS.findIndex(e=>e.opponents.includes(id)));
 assert.deepEqual(CAMPAIGN_RECRUITS,ids);assert.deepEqual(indices,[indices[0],indices[0]+1,indices[0]+2]);
 for(const [i,id]of ids.entries()){
  assert.equal(STORY_OPPONENTS.filter(x=>x===id).length,1);assert.deepEqual(STORY_ENCOUNTERS[indices[i]].opponents,[id]);assert.equal(isFreePlayAddition(id),false);
 }
 assert.equal(STORY_ENCOUNTERS[indices[2]+1].opponent,'freshprince');
 const storage=(data={})=>{const entries=new Map(Object.entries(data));return {getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,v)};};
 const clear=(p,index)=>{assert.ok(p.begin(index));for(let wave=0;wave<STORY_ENCOUNTERS[index].opponents.length;wave++)assert.ok(p.win(index,wave));};
 const disk=storage(),p=createStoryProgress(disk);
 for(const id of ids)assert.equal(p.isUnlocked(id),false);
 assert.equal(p.win(indices[0]),false,'cannot recruit before reaching the encounter');
 for(let n=0;n<indices[0];n++)clear(p,n);
 for(const [i,id]of ids.entries()){
  const index=indices[i];assert.equal(p.isUnlocked(id),false);assert.ok(p.canPlay(index));assert.equal(p.canPlay(index+1),false);
  const before=p.snapshot();assert.ok(p.begin(index));p.abandonRun();assert.deepEqual(p.snapshot().cleared,before.cleared);assert.equal(p.isUnlocked(id),false,'abandoned/lost encounter grants no recruit');
  clear(p,index);assert.ok(p.isUnlocked(id));assert.ok(createStoryProgress(disk).isUnlocked(id));assert.equal(p.snapshot().nextIndex,index+1);
  for(const later of ids.slice(i+1))assert.equal(p.isUnlocked(later),false);
  const count=p.snapshot().cleared.length;clear(p,index);assert.equal(p.snapshot().cleared.length,count,'replays cannot award the next recruit');
 }
 console.log('PASS: three distinct consecutive Hatchery challenges; each recruit locks P1 until its own victory and stays unlocked after reload.');
 for(const [version,key,order]of [[1,LEGACY_STORY_SAVE_KEY,LEGACY_STORY_OPPONENTS],[2,PREVIOUS_STORY_SAVE_KEY,PREVIOUS_STORY_OPPONENTS]]){
  for(let count=0;count<=order.length;count++){
   const raw=JSON.stringify({version,cleared:order.slice(0,count).map(id=>'story-v1-'+id),unlocked:[...new Set(['bront',...(version===1?['rivet']:['highsproto']),...order.slice(0,count)])]});
   const oldDisk=storage({[key]:raw}),progress=createStoryProgress(oldDisk),snap=progress.snapshot();
   for(const id of ids)assert.equal(progress.isUnlocked(id),false);
   for(const id of order.slice(0,count))assert.ok(progress.isUnlocked(id),id+' earned legacy recruit');
   assert.equal(snap.godModeUnlocked,count===order.length);assert.equal(snap.completed,false,'new challengers are not silently marked defeated');
   const won=new Set(order.slice(0,count));if(version===1&&count===order.length)won.add('rivet');
   const expected=STORY_ENCOUNTERS.filter(e=>e.opponents.every(id=>won.has(id))).map(e=>e.id);
   assert.deepEqual(new Set(snap.cleared),new Set(expected));
   assert.equal(snap.nextIndex,STORY_ENCOUNTERS.findIndex(e=>!expected.includes(e.id)));
   clear(progress,snap.nextIndex);assert.equal(oldDisk.getItem(key),raw,'historical save stays untouched');assert.equal(JSON.parse(oldDisk.getItem(STORY_SAVE_KEY)).version,3);
  }
 }
 console.log('PASS: every v1/v2 checkpoint preserves earned recruits and banked wins; completed campaigns retain God Mode and old save records.');
 const old=JSON.stringify({version:2,cleared:PREVIOUS_STORY_OPPONENTS.map(id=>'story-v1-'+id),unlocked:['highsproto','bront',...PREVIOUS_STORY_OPPONENTS]});
 const mergedDisk=storage({[PREVIOUS_STORY_SAVE_KEY]:old}),a=createStoryProgress(mergedDisk),b=createStoryProgress(mergedDisk);
 while(a.snapshot().nextIndex!==null&&a.snapshot().nextIndex<indices[0])clear(a,a.snapshot().nextIndex);
 clear(a,indices[0]);b.sync();assert.ok(b.isUnlocked('satoshi'));clear(b,indices[1]);a.sync();clear(a,indices[2]);
 // Twins added after the v2 route now follow the recruits; clear whatever remains.
 while(a.snapshot().nextIndex!==null)clear(a,a.snapshot().nextIndex);
 const restored=createStoryProgress(mergedDisk);for(const id of ids)assert.ok(restored.isUnlocked(id));assert.ok(restored.snapshot().godModeUnlocked);assert.ok(restored.snapshot().completed);
 mergedDisk.setItem(PREVIOUS_STORY_SAVE_KEY,JSON.stringify({version:2,cleared:[],unlocked:[]}));for(const id of ids)assert.ok(createStoryProgress(mergedDisk).isUnlocked(id),'old-tab writes cannot erase current recruits');
 console.log('PASS: stale-tab merges retain all three recruits and earned God Mode; banked old wins skip unnecessary replays.');
 console.log('Recruit encounters:',indices.map((n,i)=>`${n+1} ${ids[i]}`).join(', '));
}finally{rmSync(temp,{recursive:true,force:true});}
