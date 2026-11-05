import { describe, it, expect } from 'vitest';
import { A, FLOOR, createState, enableMatchDepth, getMove, nextMatchRound, saveState, loadState, step, chapterBossModifier } from '../src/core';
import { damage } from '../src/sim/combat';
import { grantMeter, matchInput, tickMatchDepth } from '../src/sim/matchRules';
import { TrainingRecorder, trainingReadout } from '../src/training';

describe('optional match depth', () => {
  it('leaves legacy single-round and damage rules unconfigured by default', () => {
    const s=createState('rivet','versus','vela');
    expect(s.matchDepth).toBeUndefined();
    s.fighters[1].move={id:'heavy',t:0,hit:false,connected:false,wave:-1};
    const m=getMove(s.fighters[0],'light');damage(s,0,m,'light');
    expect(s.fighters[1].hp).toBe(1000-m.damage);
    s.winner=0;step(s,[A.light,0]);expect(s.winner).toBe(0);
  });
  it('uses HP percentages on timeout and requires two round wins', () => {
    const s=createState('rivet','versus','vela');enableMatchDepth(s);
    const m=s.matchDepth!;m.startHp=[500,1000];s.fighters[0].hp=250;s.fighters[1].hp=400;m.remaining=1;
    tickMatchDepth(s);expect(s.winner).toBe(0);expect(m.wins).toEqual([1,0]);expect(m.complete).toBe(false);
    s.fighters[0].partner='nick';const frame=s.frame;expect(nextMatchRound(s)).toBe(true);
    expect(s.frame).toBe(frame);expect(s.fighters[0].partner).toBe('nick');expect(m.round).toBe(2);
    expect(s.fighters.map(f=>f.hp)).toEqual([500,1000]);
    s.winner=0;tickMatchDepth(s);expect(m.complete).toBe(true);expect(nextMatchRound(s)).toBe(false);
  });
  it('retains tied rounds without granting either seat a win', () => {
    const s=createState();enableMatchDepth(s);s.matchDepth!.remaining=1;tickMatchDepth(s);
    expect(s.winner).toBe(2);expect(s.matchDepth!.wins).toEqual([0,0]);expect(nextMatchRound(s)).toBe(true);
  });
  it('replays round transitions and serializes every rule counter', () => {
    const a=createState('rivet','versus','vela');enableMatchDepth(a,{modifier:'double-meter'});
    a.matchDepth!.remaining=1;a.fighters[1].hp=500;
    const b=structuredClone(a);step(a,[0,0]);step(b,[0,0]);nextMatchRound(a);
    // The presentation reset consumes no input; replay advances at its next input.
    step(a,[A.right,0]);step(b,[A.right,0]);expect(b).toEqual(a);
    grantMeter(a,0,1234);a.matchDepth!.backPressed[1]=a.frame;
    const saved=saveState(a);step(a,[0,0]);loadState(a,saved);expect(saveState(a)).toEqual(saved);
  });
  it('counter-hits startup with 25% damage and six extra stun', () => {
    const s=createState();enableMatchDepth(s);const b=s.fighters[1];
    b.move={id:'heavy',t:0,hit:false,connected:false,wave:-1};const m=getMove(s.fighters[0],'light');
    damage(s,0,m,'light');expect(b.hp).toBe(1000-Math.round(m.damage*1.25));expect(b.stun).toBe(m.stun+6);
    expect(s.effects.at(-1)?.color).toBe('#ff8844');
  });
  it('tracks fractional comeback and blocking meter and doubles only when requested', () => {
    const s=createState();enableMatchDepth(s);const m=getMove(s.fighters[0],'light');damage(s,0,m,'light');
    expect(s.matchDepth!.meter[1]).toBe(m.damage*15);expect(s.fighters[1].pips).toBe(0);
    grantMeter(s,1,10000-m.damage*15);expect(s.fighters[1].pips).toBe(1);expect(s.matchDepth!.meter[1]).toBe(0);
    const d=createState();enableMatchDepth(d,{modifier:'double-meter'});grantMeter(d,0,5000);expect(d.fighters[0].pips).toBe(1);
  });
  it('halves guard stun only for a back press in the previous three frames', () => {
    const make=(age:number)=>{const s=createState();enableMatchDepth(s);s.frame=20;s.matchDepth!.backPressed[1]=20-age;s.fighters[1].input=A.right;return s;};
    const a=make(3),b=make(4);damage(a,0,getMove(a.fighters[0],'light'),'light');damage(b,0,getMove(b.fighters[0],'light'),'light');
    expect(a.fighters[1].blockstun).toBe(8);expect(b.fighters[1].blockstun).toBe(15);
    expect(a.matchDepth!.meter[1]).toBe(800);expect(b.matchDepth!.meter[1]).toBe(300);
  });
  it('ends airborne loops after eight contacts and resets after recovery on the floor', () => {
    const s=createState();enableMatchDepth(s);const b=s.fighters[1];b.y=FLOOR-180;
    for(let n=0;n<8;n++)damage(s,0,{...getMove(s.fighters[0],'light'),damage:1},'light');
    expect(s.matchDepth!.juggles[1]).toBe(8);expect(b.reaction?.kind).toBe('knockdown');expect(b.vy).toBe(10);
    const hp=b.hp;expect(damage(s,0,getMove(s.fighters[0],'light'),'light')).toBe(false);expect(b.hp).toBe(hp);
    b.y=FLOOR;b.stun=0;b.reaction=null;s.freeze=0;step(s,[0,0]);expect(s.matchDepth!.juggles[1]).toBe(0);
  });
  it('applies explicit modifier rules without adding hidden CPU stat bonuses', () => {
    const low=createState();enableMatchDepth(low,{modifier:'low-gravity'});low.fighters[0].y=FLOOR-1;step(low,[0,0]);expect(low.fighters[0].vy).toBe(.6);
    const specials=createState();enableMatchDepth(specials,{modifier:'specials-only'});expect(matchInput(specials,A.light|A.right|A.special)).toBe(A.right|A.special);expect(specials.fighters[0].pips).toBe(3);
    const sudden=createState();enableMatchDepth(sudden,{modifier:'sudden-death'});expect(sudden.fighters.map(f=>f.hp)).toEqual([300,300]);
    expect(new Set([0,1,2,3,4].map(chapterBossModifier)).size).toBe(5);
  });
  it('reflects a guarded ordinary projectile and preserves both fighters HP', () => {
    const s=createState();enableMatchDepth(s,{modifier:'reflect-projectiles'});const b=s.fighters[1];
    s.projectiles.push({owner:0,x:b.x,y:b.y-65,vx:1,vy:0,life:50,damage:50});step(s,[0,A.right]);
    expect(s.projectiles[0].owner).toBe(1);expect(s.projectiles[0].vx).toBe(-1);expect(s.fighters.map(f=>f.hp)).toEqual([1000,1000]);
  });
});
describe('training controller',()=>{
  it('records relative inputs and loops them mirrored onto the dummy',()=>{
    const s=createState(),r=new TrainingRecorder();r.record();r.input(s,A.right|A.light,0);r.input(s,A.up,0);r.stop();r.play();
    expect(r.input(s,0,0)).toBe(A.left|A.light);expect(r.input(s,0,0)).toBe(A.up);expect(r.input(s,0,0)).toBe(A.left|A.light);
    expect(trainingReadout(s)).toContain('commitment');
  });
});

// The actual main hook must restart presentation before reporting a match result.
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { advanceRoundPresentation, createRoundPresentation } from '../src/animationEvents';
it('reuses introductions between rounds without reporting an intermediate result',()=>{
  const source=readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');
  const parsed=ts.createSourceFile('main.ts',source,ts.ScriptTarget.Latest,true);
  const hook=parsed.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='advanceRoundFrame')!;
  const compiled=ts.transpileModule(hook.getText(parsed),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
  const state=createState();enableMatchDepth(state);state.winner=0;tickMatchDepth(state);
  const fixture=new Function('deps',`
    const {state,nextMatchRound,createRoundPresentation,advanceRoundPresentation}=deps;
    let presentation={phase:'outro',frame:95,winner:0,fromFloor:false};
    const calls=[],depthRoundStarts=[],held=new Set();let queued=0,queued2=0;
    const storyAnimation={blackingOut:false,active:null,advanceBossReveal(){}};
    const versus={advance:()=>false,show:()=>calls.push('versus')};
    const countdown={advance:()=>false,hide:()=>calls.push('countdown')};
    const online=null,reportRound=()=>calls.push('report'),story={onRoundEnd:()=>calls.push('result')};
    ${compiled}
    return {run:()=>advanceRoundFrame(0),presentation:()=>presentation,calls,depthRoundStarts};
  `)({state,nextMatchRound,createRoundPresentation,advanceRoundPresentation});
  fixture.run();expect(fixture.presentation().phase).toBe('intro');expect(fixture.calls).toEqual(['countdown','versus']);
  expect(fixture.depthRoundStarts).toEqual([state.frame]);expect(state.matchDepth!.round).toBe(2);expect(state.winner).toBeNull();
});

it.each(['stun','attack','dash'])('does not reflect while guard is unavailable: %s',reason=>{
  const s=createState();enableMatchDepth(s,{modifier:'reflect-projectiles'});const b=s.fighters[1];
  if(reason==='stun')b.stun=5;
  if(reason==='attack')b.move={id:'heavy',t:0,hit:false,connected:false,wave:-1};
  if(reason==='dash')b.dash=3;
  s.projectiles.push({owner:0,x:b.x,y:b.y-65,vx:1,vy:0,life:50,damage:50});step(s,[0,A.right]);
  expect(s.fighters[1].hp).toBeLessThan(1000);expect(s.projectiles.some(p=>p.owner===1)).toBe(false);
});

it('uses effective low gravity when predicting a buffered near-floor attack',()=>{
  const s=createState();enableMatchDepth(s,{modifier:'low-gravity'});s.fighters[0].y=FLOOR-.7;
  step(s,[A.light,0]);expect(s.fighters[0].y).toBeLessThan(FLOOR);expect(s.fighters[0].move?.id).toBe('airLight');
});
