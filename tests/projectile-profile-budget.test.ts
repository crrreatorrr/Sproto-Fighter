import { describe, expect, it } from 'vitest';
import { BALANCE_KITS, COMBAT_STYLES, MOVES, PLAYABLE_FIGHTERS, budgetScore, buildBalancedKit, createState, getMove } from '../src/core';

describe('bounded mechanical beam profile cost',()=>{
    it('classifies existing beams by their mechanic rather than a fighter identity',()=>{
        for(const id of PLAYABLE_FIGHTERS){
            expect(!!BALANCE_KITS[id].projectileProfileCost,id).toBe((COMBAT_STYLES[id].projectile.beamLength??0)>0);
        }
    });
    it('pins the greatest affordable inward-rounded fee without a budget premium',()=>{
        const id=PLAYABLE_FIGHTERS.find(id=>(COMBAT_STYLES[id].projectile.beamLength??0)>0)!;
        const k=BALANCE_KITS[id],fee=k.projectileProfileCost!;
        expect(fee.base).toEqual({damage:48,startup:18,recovery:20});
        expect(fee.applied).toEqual({damage:47,startup:19,recovery:22});
        expect(fee.feasibleCandidates).toBe(21);
        expect(fee.templateScore).toBeCloseTo(4.187274090619078,12);
        expect(fee.beforeScore).toBe(fee.templateScore);
        expect(fee.afterScore).toBeCloseTo(4.06767631569396,12);
        expect(fee.afterScore/fee.templateScore).toBeGreaterThanOrEqual(.97);
        expect(fee.afterScore).toBeLessThan(fee.beforeScore);
        expect(k.deltas).toEqual({boltDamage:-1/48,boltStartup:1/18,boltRecovery:.1});
        for(const delta of Object.values(k.deltas))expect(Math.abs(delta!)).toBeLessThanOrEqual(.1);
        // Applying every per-field maximum would still violate the whole-kit
        // budget, so that tempting stronger tax must remain rejected.
        const allMaximum={...k.moves,bolt:{...k.moves.bolt,damage:44,startup:19,recovery:22}};
        expect(budgetScore(allMaximum,k.projectileSpeed,k.template)).toBeLessThan(fee.templateScore*.97);
        const move=getMove(createState(id).fighters[0],'bolt');
        expect(move).toMatchObject(fee.applied);
        expect(move.active).toBe(2);
        expect(COMBAT_STYLES[id].projectile).toMatchObject({speed:0,beamLength:520,beamFrames:12,origin:{forward:36.25,height:143.75}});
    });
    it('shares the existing three-field allowance with role identity and preserves inputs',()=>{
        const before=JSON.stringify(MOVES);
        const k=buildBalancedKit('SKIRMISH',false,4,MOVES,true,{beam:true});
        const plain=buildBalancedKit('SKIRMISH',false,4,MOVES,false);
        expect(Object.keys(k.deltas).length).toBeLessThanOrEqual(3);
        for(const delta of Object.values(k.deltas))expect(Math.abs(delta!)).toBeLessThanOrEqual(.1);
        const ratio=budgetScore(k.moves,k.projectileSpeed,k.template)/budgetScore(plain.moves,plain.projectileSpeed,plain.template);
        expect(ratio).toBeGreaterThanOrEqual(.97);expect(ratio).toBeLessThanOrEqual(1.03);
        expect(JSON.stringify(MOVES)).toBe(before);
        expect(buildBalancedKit('SKIRMISH',false,4,MOVES,true,{beam:true})).toEqual(k);
    });
});
