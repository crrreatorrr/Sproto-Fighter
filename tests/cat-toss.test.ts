import { expect, it } from 'vitest';
import { A, FLOOR, createState, getMove, step } from '../src/core';

it.each([1, -1])('Cat Toss scratches once on a clean hit facing %i and never on a block or miss', facing => {
    for (const defense of ['hit', 'block', 'miss']) {
        const s = createState('stonedalabamahuman', 'versus', 'highsproto');
        const [boxer, target] = s.fighters;
        boxer.x = 640;
        target.x = boxer.x + facing * 360;
        let inFlight = false;
        const ages: number[] = [];
        for (let tick = 0; tick < 115; tick++) {
            if (defense === 'miss') { target.y = FLOOR - 210; target.vy = 0; }
            step(s, [tick === 0 ? A.bolt : 0, defense === 'block' ? A.block : 0]);
            inFlight ||= s.projectiles.some(p => p.shape === 'catToss' && Math.sign(p.vx) === facing);
            const effects = s.effects.filter(e => e.kind === 'catScratch');
            expect(effects.length).toBeLessThanOrEqual(1);
            if (effects.length) {
                expect(effects[0]).toMatchObject({ target: 1, facing });
                ages.push(effects[0].max - effects[0].life);
            }
        }
        expect(inFlight).toBe(true);
        expect(ages).toEqual(defense === 'hit' ? Array.from({length: 24}, (_, i) => i) : []);
        if (defense === 'hit') expect(target.hp).toBe(1000 - getMove(boxer, 'bolt').damage);
        if (defense === 'miss') expect(target.hp).toBe(1000);
    }
});
