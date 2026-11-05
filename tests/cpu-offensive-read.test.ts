import { describe, expect, it } from 'vitest';
import { A, FLOOR, createState, cpuInput, cpuTuning, hashState, step } from '../src/core';
import { CPU_OFFENSIVE_READ } from '../src/sim/cpu';

type Read={attacks:number;lows:number;projectiles:number;y:number};
const high:Read={attacks:3,lows:0,projectiles:0,y:FLOOR};
function fixture(read:Read=high,skill=7){
    const state=createState('rivet','versus','vela');
    for(let frame=0;frame<35;frame++)step(state,[0,0]);
    state.fighters[1].x=state.fighters[0].x+66;
    const memory=state.cpu![0];memory.intent='defend';memory.decisionAt=state.frame-5;
    for(const observation of memory.observations){
        Object.assign(observation,read);observation.x=state.fighters[1].x;
        observation.move=null;observation.input=0;observation.shot=false;observation.low=false;observation.lowRoll=1;
    }
    const grabShare=read.attacks>0&&read.lows/read.attacks>.5?.30:.16;
    const lower=cpuTuning(skill).guard*(1-grabShare)*.9,upper=1-grabShare;
    return{state,choice:(variant:number)=>{memory.choice=lower+variant*(upper-lower);}};
}
const cases:Array<[string,Read,number]>=[
    ['before three attacks',{...high,attacks:2},100],
    ['learned ground highs',high,260],
    ['exact ten percent lows',{...high,attacks:10,lows:1},100],
    ['exact twenty percent projectiles',{...high,attacks:5,projectiles:1},100],
    ['observed airborne rival',{...high,y:FLOOR-1},100],
    ['just below both habit thresholds',{...high,attacks:11,lows:1,projectiles:2},260],
];
describe('provisional delayed offensive read',()=>{
    for(const skill of[1,4,7,10])for(const[label,read,expected]of cases){
        it(`skill ${skill}: ${label} keeps the declared selected-low share`,()=>{
            const{state,choice}=fixture(read,skill);let lows=0;
            for(let sample=0;sample<400;sample++){
                choice((sample+.5)/400);const input=cpuInput(state,0,skill);
                expect(input&A.light).toBe(A.light);if(input&A.down)lows++;
            }
            expect(lows).toBe(expected);
        });
    }
    it('publishes explicit provisional thresholds without changing defense anchors',()=>{
        expect(CPU_OFFENSIVE_READ).toEqual({minimumAttacks:3,maximumLowShare:.10,maximumProjectileShare:.20,defaultLowShare:.25,highGroundLowShare:.65});
        expect(cpuTuning(1)).toMatchObject({reaction:28,guard:.25,low:.20});
        expect(cpuTuning(10)).toMatchObject({reaction:8,guard:.85,low:.90});
    });
    it('does not learn from unobserved live counters, inputs, projectiles or airborne state',()=>{
        const{state,choice}=fixture({...high,attacks:2});choice(.5);
        state.cpu![0].habits={attacks:100,lows:0,projectiles:0,jumps:0};
        state.fighters[1].input=A.light;state.fighters[1].move={id:'heavy',t:0,hit:false,connected:false,wave:-1};
        expect(cpuInput(state,0,7)).toBe(A.light);
        for(const observation of state.cpu![0].observations)observation.attacks=3;
        state.fighters[1].y=FLOOR-100;state.fighters[1].input=A.down|A.bolt;
        state.cpu![0].habits={attacks:100,lows:100,projectiles:100,jumps:100};
        state.projectiles.push({owner:1,x:state.fighters[1].x,y:FLOOR-60,vx:-10,vy:0,life:100,damage:20});
        expect(cpuInput(state,0,7)).toBe(A.down|A.light);
    });
    it('backs off only when changed low/projectile habits become observed',()=>{
        const{state,choice}=fixture();choice(.5);expect(cpuInput(state,0,7)).toBe(A.down|A.light);
        for(const observation of state.cpu![0].observations){observation.attacks=10;observation.lows=1;}
        expect(cpuInput(state,0,7)).toBe(A.light);
    });
    it('does not add high-habit ducking to guard or change throw boundaries',()=>{
        for(const skill of[1,4,7,10]){
            const{state}=fixture(high,skill),memory=state.cpu![0];
            memory.choice=cpuTuning(skill).guard*.84*.9/2;expect(cpuInput(state,0,skill)).toBe(A.left);
            memory.choice=.92;expect(cpuInput(state,0,skill)).toBe(A.grab);
        }
    });
    it('keeps repeated learned reads pure and reproduces outcomes from recorded inputs',()=>{
        const{state,choice}=fixture();choice(.5);const before=hashState(state);
        expect(cpuInput(state,0,7)).toBe(A.down|A.light);expect(cpuInput(state,0,7)).toBe(A.down|A.light);expect(hashState(state)).toBe(before);
        const live=createState('bront','versus','zephyr'),replay=createState('bront','versus','zephyr');
        for(let frame=0;frame<1200&&live.winner===null;frame++){
            const pair:[number,number]=[cpuInput(live,0,1),cpuInput(live,1,10)];step(live,pair);step(replay,pair);
        }
        expect(hashState(replay)).toBe(hashState(live));
    });
});
