import { describe, expect, it } from 'vitest';
import { A, BALANCE_KITS, BALANCE_TEMPLATES, COMBAT_STYLES, MOVES, PLAYABLE_FIGHTERS, ROSTER, bodySpread, buildBalancedKit, budgetScore, createState, getMove, isPairedFighter, step } from '../src/core';

describe('normalized combat budgets',()=>{
    it('classifies the complete roster, with at most three bounded identity tradeoffs',()=>{
        for(const id of PLAYABLE_FIGHTERS){
            const k=BALANCE_KITS[id],baseline=buildBalancedKit(COMBAT_STYLES[id].role,isPairedFighter(id),k.specialFrames.length,MOVES,false);
            expect(Object.keys(k.deltas).length,id).toBeLessThanOrEqual(3);
            for(const delta of Object.values(k.deltas))expect(Math.abs(delta!),id).toBeLessThanOrEqual(.1);
            const ratio=budgetScore(k.moves,k.projectileSpeed)/budgetScore(baseline.moves,baseline.projectileSpeed);
            expect(ratio,id).toBeGreaterThanOrEqual(.97);expect(ratio,id).toBeLessThanOrEqual(1.03);
            expect(ROSTER[id].speed).toBe(BALANCE_TEMPLATES[k.archetype].speed);
            for(const move of Object.values(k.moves)){expect(move.startup).toBeGreaterThanOrEqual(3);expect(move.active).toBeGreaterThanOrEqual(2);expect(move.recovery).toBeGreaterThanOrEqual(6);}
        }
    });
    it('normalizes every clean Special to 270–300 actual damage after scaling',()=>{
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
