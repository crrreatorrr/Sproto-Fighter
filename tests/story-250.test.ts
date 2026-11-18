import {describe,it,expect} from 'vitest';
import {PLAYABLE_FIGHTERS} from '../src/core';
import {campaignForStages,createStoryProgress,STORY_ENCOUNTERS,STORY_OPPONENTS,RELIC_GUARDIAN_RIVALS,STORY_SAVE_KEY,STARTER_FIGHTERS} from '../src/storyProgress';
import {STORY_STAGE_IDS} from '../src/stage';
import {storyChapterRule} from '../src/storyRules';
import {storyAnimationPlan} from '../src/storyAnimation';

describe('250-rival campaign',()=>{
 it('has exactly 250 registered identities, 247 nodes, and the three final pairs in order',()=>{
  expect(STORY_OPPONENTS).toHaveLength(250);expect(new Set(STORY_OPPONENTS).size).toBe(250);expect(STORY_ENCOUNTERS).toHaveLength(247);
  expect(STORY_OPPONENTS.every(id=>PLAYABLE_FIGHTERS.includes(id))).toBe(true);
  expect(STORY_ENCOUNTERS.slice(-3).map(e=>e.opponents)).toEqual([['sproto865','sproto943'],['nick','guest07'],['vela','vaudream']]);
  expect(campaignForStages(STORY_STAGE_IDS,[...PLAYABLE_FIGHTERS].reverse())).toEqual(STORY_ENCOUNTERS);
 });
 it('ends the Bar chapter with Sprotel Bitcoin before proceeding to the Hatchery',()=>{
  const bar=STORY_ENCOUNTERS.filter(e=>e.stage==='bar'),finale=bar.at(-1)!;
  expect(finale.opponents).toEqual(['guest10']);
  expect(finale.id).toBe('story-v1-guest10');
  expect(STORY_ENCOUNTERS.filter(e=>e.opponent==='guest10')).toHaveLength(1);
  expect(bar.some(e=>e.opponent==='sproto3152')).toBe(true);
  expect(STORY_ENCOUNTERS[finale.index+1].stage).toBe('hatchery');
  expect(storyChapterRule('guest10',id=>!!storyAnimationPlan(id,true).form)).not.toBeNull();
 });
 it('retains a saved Sprotel win and continues at the first uncleared encounter after reordering',()=>{
  const finale=STORY_ENCOUNTERS.find(e=>e.opponent==='guest10')!;
  const previous=STORY_ENCOUNTERS[finale.index-1];
  const cleared=STORY_ENCOUNTERS.slice(0,previous.index).map(e=>e.id).concat(finale.id);
  const raw=JSON.stringify({version:3,cleared,unlocked:['guest10'],godModeUnlocked:false});
  const p=createStoryProgress({getItem:k=>k===STORY_SAVE_KEY?raw:null,setItem(){}});
  expect(p.isCleared(finale.index)).toBe(true);
  expect(p.isUnlocked('guest10')).toBe(true);
  expect(p.snapshot().nextIndex).toBe(previous.index);
  expect(p.begin(previous.index)).toBe(true);
  expect(p.win(previous.index)).toBe(true);
  expect(p.snapshot().nextIndex).toBe(finale.index+1);
 });
 it('clears and replays each guardian without granting its Hub-only player selection, including reload and sync',()=>{
  const values=new Map<string,string>(),disk={getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);}};
  const p=createStoryProgress(disk),stale=createStoryProgress(disk);
  for(const e of STORY_ENCOUNTERS){expect(p.begin(e.index)).toBe(true);for(let bout=0;bout<e.opponents.length;bout++)expect(p.win(e.index,bout)).toBe(true);}
  expect(p.snapshot().completed).toBe(true);expect(p.snapshot().godModeUnlocked).toBe(true);
  stale.sync();
  for(const guardian of RELIC_GUARDIAN_RIVALS){
   const e=STORY_ENCOUNTERS.find(e=>e.opponent===guardian.id)!;
   expect(e.stage).toBe(guardian.stage);
   for(const progress of [p,stale,createStoryProgress(disk)]){expect(progress.isCleared(e.index)).toBe(true);expect(progress.isUnlocked(e.opponent)).toBe(false);expect(progress.begin(e.index)).toBe(true);expect(progress.win(e.index)).toBe(true);expect(progress.isUnlocked(e.opponent)).toBe(false);}
  }
  expect(createStoryProgress(disk).snapshot().unlocked).toHaveLength(249);
 });
 it('preserves every previous clear and earned reward when the three new guardian gaps are inserted',()=>{
  const guardians=new Set(RELIC_GUARDIAN_RIVALS.map(g=>g.id));
  const old=STORY_ENCOUNTERS.filter(e=>!guardians.has(e.opponent));
  const raw=JSON.stringify({version:3,cleared:old.map(e=>e.id),unlocked:[...STARTER_FIGHTERS,...old.flatMap(e=>e.opponents)],godModeUnlocked:true});
  const p=createStoryProgress({getItem:k=>k===STORY_SAVE_KEY?raw:null,setItem(){}});
  expect(p.snapshot().completed).toBe(false);expect(p.snapshot().godModeUnlocked).toBe(true);
  for(const e of old){expect(p.isCleared(e.index)).toBe(true);for(const id of e.opponents)expect(p.isUnlocked(id)).toBe(true);}
  expect(p.snapshot().nextIndex).toBe(STORY_ENCOUNTERS.find(e=>guardians.has(e.opponent))!.index);
 });
});
