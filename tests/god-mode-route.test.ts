import {describe,it,expect} from 'vitest';
import {createStoryProgress,STORY_ENCOUNTERS} from '../src/storyProgress';

const memory=()=>{const values=new Map<string,string>();return {getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);}};};

describe('God Mode open route',()=>{
 it('locks later encounters normally and opens all of them in God Mode',()=>{
  const p=createStoryProgress(memory());
  const late=STORY_ENCOUNTERS.length-1;
  expect(p.canPlay(late)).toBe(false);expect(p.begin(late)).toBe(false);
  p.setOpenRoute(true);
  expect(p.snapshot().openRoute).toBe(true);
  expect(STORY_ENCOUNTERS.every(e=>p.canPlay(e.index))).toBe(true);
  expect(p.isOnRoute(late)).toBe(false);expect(p.isOnRoute(0)).toBe(true);
  p.setOpenRoute(false);
  expect(p.canPlay(late)).toBe(false);
 });
 it('saves an off-route win and recruits without moving the next story fight',()=>{
  const p=createStoryProgress(memory());p.setOpenRoute(true);
  const e=STORY_ENCOUNTERS.find(x=>x.index>5&&x.opponents.length===1&&!['captain','sproto2616','sproto3152','sproto3215','sproto1870'].includes(x.opponent))!;
  expect(p.begin(e.index)).toBe(true);expect(p.win(e.index)).toBe(true);
  expect(p.isCleared(e.index)).toBe(true);expect(p.isUnlocked(e.opponent)).toBe(true);
  expect(p.snapshot().nextIndex).toBe(0);
 });
 it('finishes a gauntlet started in God Mode even if God Mode is switched off mid-run',()=>{
  const p=createStoryProgress(memory());p.setOpenRoute(true);
  const e=STORY_ENCOUNTERS.find(x=>x.opponents.length>1)!;
  expect(p.begin(e.index)).toBe(true);expect(p.win(e.index,0)).toBe(true);
  p.setOpenRoute(false);
  expect(p.canPlay(e.index)).toBe(true);expect(p.win(e.index,1)).toBe(true);
  expect(p.isCleared(e.index)).toBe(true);expect(p.canPlay(e.index)).toBe(true);
  // A fresh, unrelated off-route encounter is locked again.
  expect(p.canPlay(STORY_ENCOUNTERS.length-1)).toBe(false);
 });
});
