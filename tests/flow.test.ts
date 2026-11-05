import { describe, expect, it } from 'vitest';
import { damage } from '../src/sim/combat';
import { A, FLOOR, KNOCKDOWN_FRAMES, GETUP_FRAMES, MOVES, PLAYABLE_FIGHTERS, ROSTER, createState, getMove, hashState, loadState, saveState, step } from '../src/core';
const tick = (s: ReturnType<typeof createState>, n=1, input=0, rival=0) => { for(let i=0;i<n;i++) step(s,[input,rival]); };
const fresh = () => {const s=createState('rivet','versus','rivet');s.fighters[0].x=250;s.fighters[1].x=1000;return s;};
describe('speed and flow',()=>{
  it('keeps effective move phases visible and shortens light/medium recovery',()=>{
    expect(MOVES.light.recovery).toBe(11);expect(MOVES.medium.recovery).toBe(14);
    for(const id of PLAYABLE_FIGHTERS){const f=createState(id).fighters[0];for(const move of Object.keys(MOVES) as (keyof typeof MOVES)[]){const m=getMove(f,move);expect(m.startup).toBeGreaterThanOrEqual(3);expect(m.active).toBeGreaterThanOrEqual(2);expect(m.recovery).toBeGreaterThanOrEqual(6);}}
  });
  it('continues held forward dash into a run and releases to walking',()=>{
    const s=fresh(),f=s.fighters[0];tick(s,1,A.right|A.dash);expect(f.dashLock).toBe(20);
    tick(s,18,A.right|A.dash);expect(f.dash).toBe(0);expect(f.vx).toBeCloseTo(ROSTER.rivet.speed*1.35);
    tick(s,2,A.right);expect(f.vx).toBe(ROSTER.rivet.speed);expect(f.runDirection).toBe(0);
    tick(s,5,A.right|A.dash);tick(s,8,A.left|A.dash);expect(f.runDirection).toBe(0);expect(f.vx).toBeLessThan(0);
  });
  it('tap dash leaves no latent run when dash is pressed again during cooldown',()=>{
    const s=fresh(),f=s.fighters[0];tick(s,1,A.right|A.dash);tick(s,1,A.right);tick(s,15,A.right|A.dash);
    expect(f.dash).toBe(0);expect(f.runDirection).toBe(0);expect(f.vx).toBe(ROSTER.rivet.speed);
  });
  it('remembers a run release during hitstop',()=>{
    const s=fresh(),f=s.fighters[0];tick(s,14,A.right|A.dash);s.freeze=3;tick(s,1,A.right);expect(f.runDirection).toBe(0);tick(s,4,A.right|A.dash);expect(f.runDirection).toBe(0);expect(f.vx).toBe(ROSTER.rivet.speed);
  });
  it('jump-cancels a medium after damage, never guard or whiff',()=>{
    for(const guarded of [false,true]){const s=fresh(),[f,b]=s.fighters;b.x=f.x+75;tick(s,1,A.medium,guarded?A.right:0);for(let i=0;i<40&&!f.move?.connected;i++)tick(s,1,0,guarded?A.right:0);expect(f.move?.connected).toBe(true);expect(f.move?.hitConfirmed===true).toBe(!guarded);tick(s,12,A.up,guarded?A.right:0);expect(f.y<FLOOR).toBe(!guarded);}
    const miss=fresh();tick(miss,1,A.medium);tick(miss,5,A.up);expect(miss.fighters[0].y).toBe(FLOOR);
  });
  it('buffers eight frames and expires a press before long recovery ends',()=>{
    const s=fresh(),f=s.fighters[0];s.freeze=3;tick(s,1,A.light);expect(f.bufferLife).toBe(8);tick(s,2);expect(f.bufferLife).toBe(8);tick(s);expect(f.move?.id).toBe('light');
    const t=fresh(),g=t.fighters[0];tick(t,1,A.heavy);tick(t,1,A.light);tick(t,60);expect(g.move).toBe(null);expect(g.combo).toBe(0);
  });
  it('samples quick/neutral/delayed rise only on landing and retains get-up frames',()=>{
    expect(KNOCKDOWN_FRAMES).toBe(12);
    for(const [input,duration] of [[A.down,6],[0,12],[A.up,24]]){const s=fresh(),f=s.fighters[0];f.y=FLOOR-1;f.vy=2;f.stun=1;f.reaction={kind:'knockdown',phase:'flight',t:0,direction:1};tick(s,1,input);expect(f.riseDelay).toBe(duration);expect(f.reaction?.phase).toBe('down');let frames=0;while(f.reaction&&frames<50){tick(s,1,input===A.down?A.up:A.down);frames++;}expect(frames).toBe(duration+GETUP_FRAMES);expect(f.reaction).toBe(null);expect(f.throwInvuln).toBe(12);expect(f.y).toBe(FLOOR);}
  });
  it('uses strength-specific hitstop and holds the final Special contact longest',()=>{
    for(const [kind,expected] of [['light',4],['medium',6],['heavy',9],['airHeavy',9],['sweep',9]] as const){const s=fresh();expect(damage(s,0,getMove(s.fighters[0],kind),kind)).toBe(true);expect(s.freeze).toBe(expected);}
    const s=fresh(),f=s.fighters[0];f.move={id:'special',t:0,wave:3,hit:false,connected:false};expect(damage(s,0,getMove(f,'special'),'special')).toBe(true);expect(s.freeze).toBe(12);
  });
  it('snapshots preserve run and wake-up choices',()=>{
    const s=fresh();tick(s,14,A.right|A.dash);const saved=saveState(s),copy=fresh();loadState(copy,saved);expect(hashState(copy)).toBe(hashState(s));for(let i=0;i<80;i++){const input=i<10?A.right|A.dash:i===10?A.up:0;tick(s,1,input);tick(copy,1,input);expect(hashState(copy)).toBe(hashState(s));}
  });
});
