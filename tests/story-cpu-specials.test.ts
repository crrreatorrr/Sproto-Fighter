import {describe,it,expect} from 'vitest';
import {A,createState,enableMatchDepth,step,type CombatState,type PlayableFighterId} from '../src/core';
import {STORY_ENCOUNTERS} from '../src/storyProgress';
import {storyChapterRule} from '../src/storyRules';
import {storyAnimationPlan} from '../src/storyAnimation';

/** A story fight as `launchSelection` in main.ts builds it: P1 against a CPU, plus the chapter rule. */
function storyFight(opponent:PlayableFighterId,godMode=false):CombatState{
    const s=createState('highsproto','cpu',opponent);
    const rule=storyChapterRule(opponent,id=>!!storyAnimationPlan(id,true).form);
    if(rule)enableMatchDepth(s,{rounds:false,modifier:rule});
    if(godMode){s.godMode=true;s.fighters[0].pips=3;}
    return s;
}
/** Steps with the CPU seat holding Special and returns how many Team Specials it started. */
function cpuSpecials(s:CombatState,frames:number):number{
    let started=0,was=false;
    for(let i=0;i<frames;i++){
        step(s,[0,i%2?A.special:0]);
        const now=s.fighters[1].move?.id==='special';
        if(now&&!was)started++;
        was=now;
    }
    return started;
}
const storyOpponents=[...new Set(STORY_ENCOUNTERS.flatMap(e=>e.opponents))];

describe('story CPU Team Special meter',()=>{
    it('Captain Green, the chapter 3 finale, cannot fire Team Specials he has not earned',()=>{
        const s=storyFight('sproto3215');
        expect(s.fighters[1].pips).toBe(0);
        expect(cpuSpecials(s,600)).toBe(0);
        expect(s.fighters[1].pips).toBe(0);
    });
    it('no story opponent starts with meter or has it refilled',()=>{
        for(const opponent of storyOpponents){
            const s=storyFight(opponent);
            expect([opponent,s.fighters.map(f=>f.pips)]).toEqual([opponent,[0,0]]);
            for(let i=0;i<5;i++)step(s,[0,0]);
            expect([opponent,s.fighters.map(f=>f.pips)]).toEqual([opponent,[0,0]]);
            s.fighters[1].pips=3;
            expect([opponent,cpuSpecials(s,120)]).toEqual([opponent,1]);
            expect([opponent,s.fighters[1].pips]).toEqual([opponent,0]);
        }
    });
    it('God Mode keeps only P1 at full meter, in every story fight',()=>{
        for(const opponent of storyOpponents){
            const s=storyFight(opponent,true);
            expect([opponent,cpuSpecials(s,120)]).toEqual([opponent,0]);
            expect([opponent,s.fighters[0].pips,s.fighters[1].pips]).toEqual([opponent,3,0]);
        }
    });
});
