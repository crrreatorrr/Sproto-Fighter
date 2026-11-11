/**
 * The pause menu's move list: the current fighter's own moves with the player's bindings,
 * followed by the techniques every fighter shares. Read-only: built from the same move data
 * the simulation uses.
 */
import { COMBAT_STYLES, ROSTER, THROW_BREAK_FRAMES, createState, getMove, type Action, type FighterId, type MoveId, type PlayableFighterId } from './core';

export interface MoveRow { name: string; input: string; detail: string }
export type Prompt = (action: Action) => string;

const frames = (id: PlayableFighterId, move: MoveId) => getMove(createState(id, 'dummy').fighters[0], move);
const title = (text: string) => text.replace(/^signature:/, '').replace(/([a-z])([A-Z0-9])/g, '$1 $2').replace(/^./, c => c.toUpperCase());

/** The fighter's attacks, strongest information first: what to press, how fast it is, what it does. */
export function fighterMoves(id: FighterId, p: Prompt): MoveRow[] {
    const fighter = id as PlayableFighterId, style = COMBAT_STYLES[fighter];
    const row = (name: string, input: string, move: MoveId, note = ''): MoveRow => {
        const m = frames(fighter, move);
        return { name, input, detail: `${m.startup}f startup · ${m.damage} damage${m.low ? ' · low' : ''}${note ? ' · ' + note : ''}` };
    };
    const special = frames(fighter, 'special');
    return [
        row('Light', p('light'), 'light', 'chains into itself once'),
        row('Low jab', `${p('down')} + ${p('light')}`, 'low', 'must be blocked crouching'),
        row('Medium', p('medium'), 'medium'),
        row('Finisher', p('heavy'), 'heavy', 'ends a combo; knocks down'),
        row('Sweep', `${p('down')} + ${p('heavy')}`, 'sweep', 'knocks down'),
        row('Launcher', `${p('launcher')} or ${p('up')} + ${p('light')}`, 'launcher', `then ${p('up')} to chase`),
        row('Air attacks', `${p('light')} / ${p('medium')} / ${p('heavy')} in the air`, 'airHeavy', `${p('down')} + ${p('heavy')} dives`),
        row(`Ranged: ${title(style.projectile.shape)}`, p('bolt'), 'bolt', style.projectile.horizontal ? 'travels level' : `aim with ${p('up')} / ${p('down')}`),
        row('Throw', `${p('grab')} (+ direction)`, 'grab', 'beats a block'),
        { name: `Team Special: ${ROSTER[fighter].special}`, input: `${p('special')} with 3 relay charges`,
            detail: `${special.startup}f startup · ${style.specialFrames.length} hits · ${Math.round(special.range)} px reach` },
    ];
}
/** Techniques that work the same for the whole roster. */
export function sharedTechniques(p: Prompt): MoveRow[] {
    return [
        { name: 'Block', input: 'Hold away', detail: `add ${p('down')} against lows; blocked heavies still chip` },
        { name: 'Chain', input: `${p('light')} → ${p('medium')} → ${p('heavy')}`, detail: 'three hits ending in a finisher earn a relay charge' },
        { name: 'Dash cancel', input: `${p('dash')} after a hit`, detail: 'cuts recovery so the combo can continue; once per combo' },
        { name: 'Jump cancel', input: `${p('up')} after Launcher or Medium hits`, detail: 'follow the rival into the air' },
        { name: 'Throw tech', input: `${p('grab')} when caught`, detail: `inside the first ${THROW_BREAK_FRAMES} frames` },
        { name: 'Quick rise', input: `Hold ${p('down')} as you land`, detail: `hold ${p('up')} instead to stay down longer` },
    ];
}
