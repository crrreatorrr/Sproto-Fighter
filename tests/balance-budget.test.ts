import { describe, expect, it } from 'vitest';
import { A, BALANCE_KITS, BALANCE_TEMPLATES, COMBAT_STYLES, MOVES, PLAYABLE_FIGHTERS, ROSTER, bodySpread, buildBalancedKit, budgetScore, createState, getMove, isPairedFighter, step } from '../src/core';
import { BUDGET_WEIGHTS } from '../src/sim/balance';

describe('normalized combat budgets',()=>{
    it('pins exploratory weights and all eight template budget scores for review',()=>{
        expect(BUDGET_WEIGHTS).toEqual({light:.65,heavy:.25,projectile:.10,neutralSpeed:5.6,neutralReach:84,safetyFrames:100});
        const expected={Pressure:4.075285550986842,Footwork:4.769255013359776,Zoning:4.166292423161414,Counter:4.249954987105721,
            Brawler:4.136182307507014,Weapon:4.531271995123704,Paired:3.963637100368108,Hover:3.8538059152521815};
        for(const [archetype,score] of Object.entries(expected)){
            const id=PLAYABLE_FIGHTERS.find(id=>BALANCE_KITS[id].archetype===archetype)!;
            const k=buildBalancedKit(COMBAT_STYLES[id].role,isPairedFighter(id),COMBAT_STYLES[id].specialFrames.length,MOVES,false);
            expect(budgetScore(k.moves,k.projectileSpeed,k.template),archetype).toBeCloseTo(score,12);
        }
    });
    it('charges for faster neutral movement and longer effective light reach',()=>{
        const k=BALANCE_KITS.rivet;
        const base=budgetScore(k.moves,k.projectileSpeed,{speed:5.6,jump:15.48});
        expect(budgetScore(k.moves,k.projectileSpeed,{speed:6.2,jump:15.48})).toBeGreaterThan(base);
        const extended={...k.moves,light:{...k.moves.light,range:k.moves.light.range+10}};
        expect(budgetScore(extended,k.projectileSpeed,{speed:5.6,jump:15.48})).toBeGreaterThan(base);
        const committed={...k.moves,light:{...k.moves.light,startup:k.moves.light.startup+1,damage:k.moves.light.damage-4}};
        expect(budgetScore(committed,k.projectileSpeed,{speed:5.6,jump:15.48})).toBeLessThan(base);
        const safer={...k.moves,heavy:{...k.moves.heavy,blockstun:22}};
        expect(budgetScore(safer,k.projectileSpeed,k.template)).toBeGreaterThan(base);
        expect(BALANCE_TEMPLATES.Pressure.speed).toBe(5.6);
        expect(BALANCE_TEMPLATES.Footwork.speed).toBe(6.2);
        expect(BALANCE_TEMPLATES.Brawler.speed).toBe(5.2);
    });
    it('classifies the complete roster, with at most three bounded identity tradeoffs',()=>{
        for(const id of PLAYABLE_FIGHTERS){
            const k=BALANCE_KITS[id],baseline=buildBalancedKit(COMBAT_STYLES[id].role,isPairedFighter(id),k.specialFrames.length,MOVES,false);
            expect(Object.keys(k.deltas).length,id).toBeLessThanOrEqual(3);
            for(const delta of Object.values(k.deltas))expect(Math.abs(delta!),id).toBeLessThanOrEqual(.1);
            const ratio=budgetScore(k.moves,k.projectileSpeed,k.template)/budgetScore(baseline.moves,baseline.projectileSpeed,baseline.template);
            expect(ratio,id).toBeGreaterThanOrEqual(.97);expect(ratio,id).toBeLessThanOrEqual(1.03);
            expect(ROSTER[id].speed).toBe(BALANCE_TEMPLATES[k.archetype].speed);
            for(const move of Object.values(k.moves)){expect(move.startup).toBeGreaterThanOrEqual(3);expect(move.active).toBeGreaterThanOrEqual(2);expect(move.recovery).toBeGreaterThanOrEqual(6);}
        }
    });
    it('budgets every Special at 285 nominal damage for one uninterrupted combo',()=>{
        for(const id of PLAYABLE_FIGHTERS){
            const s=createState(id,'cpu','rivet'),f=s.fighters[0];
            let total=0;
            for(const [i,t] of COMBAT_STYLES[id].specialFrames.entries()){
                f.move={id:'special',t,hit:false,connected:false,wave:i};
                total+=Math.round(getMove(f,'special').damage*Math.max(.45,1-i*.08));
            }
            expect(total,id).toBe(285);
        }
    });
    it('keeps all 254 default-partner Specials in the 270–300 actual damage band',()=>{
        for(const id of PLAYABLE_FIGHTERS){
            const s=createState(id,'cpu','rivet'),[a,b]=s.fighters;
            a.x=400;b.x=a.x+60+bodySpread(a.id)+bodySpread(b.id);a.facing=1;b.facing=-1;a.pips=3;
            step(s,[A.special,0]);
            for(let frame=0;frame<180;frame++)step(s,[0,0]);
            const actual=1000-b.hp;
            expect(actual,id).toBeGreaterThanOrEqual(270);
            expect(actual,id).toBeLessThanOrEqual(300);
            expect(a.move,id).toBeNull();
        }
    });
    it('gives weapons longer heavy and sweep reach without hidden damage boosts',()=>{
        for(const id of ['sproto1011','sproto2616','michael','sproto1815','melo'] as const){
            const f=createState(id).fighters[0];
            expect(BALANCE_KITS[id].archetype).toBe('Weapon');
            expect(getMove(f,'heavy').range).toBeGreaterThanOrEqual(170);
            expect(getMove(f,'sweep').range).toBeGreaterThanOrEqual(170);
            expect(getMove(f,'heavy').startup).toBeGreaterThanOrEqual(13);
        }
    });
    it('budgets paired melee by nearest-body reach and still connects at contact',()=>{
        for(const [lead,rival] of [['duo','rivet'],['duo','sproto282'],['rivet','duo']] as const){
            const s=createState(lead,'cpu',rival),[a,b]=s.fighters;
            a.x=400;b.x=a.x+55+bodySpread(a.id)+bodySpread(b.id);a.facing=1;b.facing=-1;
            expect(getMove(a,'light').range-bodySpread(a.id)).toBe(BALANCE_KITS[a.id].moves.light.range);
            step(s,[A.light,0]);for(let i=0;i<40;i++)step(s,[0,0]);
            expect(b.hp,lead+' versus '+rival).toBeLessThan(1000);
        }
    });
    it('enforces one outstanding volley, including paired emitters',()=>{
        for(const id of ['vela','d86'] as const){
            const s=createState(id,'cpu','rivet'),f=s.fighters[0];f.x=100;s.fighters[1].x=1180;
            step(s,[A.bolt,0]);while(!s.projectiles.length)step(s,[0,0]);
            const original=s.projectiles.length;
            while(f.move)step(s,[0,0]);
            expect(s.projectiles.length).toBe(original);
            step(s,[A.bolt,0]);expect(f.move).toBeNull();
            for(let i=0;i<5;i++)step(s,[0,0]);expect(s.projectiles.length).toBe(original);
        }
    });
    it('makes Special reach meaningful and preserves caster immunity',()=>{
        const s=createState('rivet','cpu','vela'),[a,b]=s.fighters;a.x=100;b.x=1180;a.pips=3;
        step(s,[A.special,0]);for(let i=0;i<100;i++)step(s,[0,0]);expect(b.hp).toBe(1000);
        const duel=createState('rivet','cpu','rivet');duel.fighters[1].x=450;for(const f of duel.fighters)f.pips=3;
        step(duel,[A.special,A.special]);for(let i=0;i<80;i++)step(duel,[0,0]);
        expect(duel.fighters.map(f=>f.hp)).toEqual([1000,1000]);
    });
});
