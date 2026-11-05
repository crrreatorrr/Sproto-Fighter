import { expect, it } from 'vitest';
import { createState, getMove, hashState } from '../src/core';
import { drawTrainingGeometry } from '../src/training';

it('draws active collision geometry and leaves the complete simulation unchanged', () => {
    const s = createState('rivet', 'dummy', 'vela'), f = s.fighters[0];
    f.move = { id: 'heavy', t: getMove(f, 'heavy').startup, hit: false, connected: false, wave: -1 };
    s.fighters[1].input = 8;
    s.projectiles.push({ owner: 0, x: 600, y: 500, vx: 10, vy: 0, life: 20, damage: 40 });
    const draws: { color: string; bounds: number[] }[] = [];
    const c = { strokeStyle: '', lineWidth: 0, save() {}, restore() {}, strokeRect(...bounds: number[]) { draws.push({ color: this.strokeStyle, bounds }); } };
    const before = hashState(s);
    drawTrainingGeometry(c as unknown as CanvasRenderingContext2D, s);
    expect(hashState(s)).toBe(before);
    expect(draws.filter(d => d.color === '#65ef8e')).toHaveLength(2);
    expect(draws.find(d => d.color === '#65ef8e' && d.bounds[3] === 87)).toBeDefined();
    expect(draws.filter(d => d.color === '#ff6a69')).toHaveLength(1);
    expect(draws.find(d => d.color === '#6ad8ff')?.bounds).toEqual([591, 490, 18, 20]);
    draws.length = 0;
    f.move.t = 0;
    drawTrainingGeometry(c as unknown as CanvasRenderingContext2D, s);
    expect(draws.some(d => d.color === '#ff6a69')).toBe(false);
});
