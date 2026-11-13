/**
 * The interactive tutorial: six lessons played on the practice dummy. Like the training
 * recorder it only supplies the dummy's inputs and reads the state the simulation produces;
 * it never writes combat state, so a tutorial round replays from its inputs like any other.
 */
import { A, FLOOR, bodySpread, getMove, grounded, type Action, type CombatState } from './core';

export interface TutorialGoal { label: string; done: boolean }
export interface TutorialView {
    index: number; total: number; title: string; hint: string;
    goals: TutorialGoal[];
    /** Frames since the lesson was cleared (0 while it is still being played). */
    cleared: number;
    complete: boolean;
}
/** Names a control the way the fight screen does ("J", "L-Shift", "RB"...). */
export type Prompt = (action: Action) => string;
type Script = 'idle' | 'jab' | 'grab' | 'sweep';
interface Lesson {
    title: string;
    hint: (p: Prompt) => string;
    goals: ((p: Prompt) => string)[];
    /** What the dummy does while goal `n` is the next one open. */
    script: (open: number) => Script;
}

export const TUTORIAL_LESSONS: readonly Lesson[] = [
    { title: 'MOVE AND BLOCK',
        hint: p => `Walk with ${p('left')} / ${p('right')}; double-tap either to dash. Hold ${p('block')}, or the direction away from your rival, to block.`,
        goals: [() => 'Walk around', p => `Block two jabs with ${p('block')} or by holding away`],
        script: open => open === 1 ? 'jab' : 'idle' },
    { title: 'CHAIN TO A FINISHER',
        hint: p => `Each hit cancels into a stronger one: ${p('light')} → ${p('medium')} → ${p('heavy')}. Three hits ending in a finisher earn a relay charge.`,
        goals: [p => `Land ${p('light')} → ${p('medium')} → ${p('heavy')} as one combo`],
        script: () => 'idle' },
    { title: 'THROW AND TECH',
        hint: p => `${p('grab')} up close throws a rival who is blocking. Press ${p('grab')} the instant you are caught to break a throw.`,
        goals: [p => `Throw the dummy with ${p('grab')}`, p => `Break the dummy's throw with ${p('grab')}`],
        script: open => open === 1 ? 'grab' : 'idle' },
    { title: 'DASH CANCEL',
        hint: () => 'After a hit connects, double-tap forward to dash: it cuts the recovery short so you can keep attacking. Once per combo.',
        goals: [() => 'Hit, double-tap forward, then hit again in the same combo'],
        script: () => 'idle' },
    { title: 'JUMP CANCEL AND QUICK RISE',
        hint: p => `${p('launcher')} sends a rival up: press ${p('up')} as it connects to chase. When you are knocked down, hold ${p('down')} as you land to get up fast.`,
        goals: [p => `Launch with ${p('launcher')}, then ${p('up')} to chase`, p => `Let the sweep hit you, then hold ${p('down')} as you land`],
        script: open => open === 1 ? 'sweep' : 'idle' },
    { title: 'TEAM SPECIAL',
        hint: p => `Three relay charges fill the Team Special. It is full for this lesson: press ${p('special')} in range.`,
        goals: [p => `Land your Team Special with ${p('special')}`],
        script: () => 'idle' },
];

/** Frames a cleared lesson stays on screen before the next one starts. */
export const TUTORIAL_CLEAR_FRAMES = 90;

export class TutorialCoach {
    /** The round keeps the player alive and the meter full; main sets this up as a practice God Mode. */
    readonly invulnerable = true;
    /** The recorder's surface, so main can drive either through the same hook. */
    readonly playing = false;
    stop(): void { /* Nothing is recorded or played back. */ }
    lesson = 0; cleared = 0; complete = false;
    private done: boolean[] = [];
    private walked = 0; private blocks = 0; private dashed = false; private dashCombo = 0;
    private previous: { x: number; blockstun: number; combo: number; launcherHit: boolean; notice: string; caught: boolean } | null = null;
    private clock = 0;

    /** Start over from lesson one. */
    begin(): void { this.lesson = 0; this.complete = false; this.clock = 0; this.startLesson(); }
    private startLesson(): void {
        this.done = TUTORIAL_LESSONS[this.lesson].goals.map(() => false);
        this.cleared = 0; this.walked = 0; this.blocks = 0; this.dashed = false; this.dashCombo = 0; this.previous = null;
    }
    /** Jump to a lesson (QA and tests). */
    skipTo(lesson: number): void { this.lesson = Math.max(0, Math.min(TUTORIAL_LESSONS.length - 1, lesson)); this.complete = false; this.startLesson(); }

    /** Called once per combat frame, before the step: watch the player, then drive the dummy. */
    input(s: CombatState, _player: number, _dummy: number): number {
        if (this.complete) return 0;
        this.clock++;
        if (this.cleared > 0) {
            if (++this.cleared > TUTORIAL_CLEAR_FRAMES) {
                if (this.lesson === TUTORIAL_LESSONS.length - 1) { this.complete = true; return 0; }
                this.lesson++; this.startLesson();
            }
            return 0;
        }
        this.observe(s);
        if (this.done.every(Boolean)) { this.cleared = 1; return 0; }
        return this.dummyInput(s, TUTORIAL_LESSONS[this.lesson].script(this.done.indexOf(false)));
    }

    private observe(s: CombatState): void {
        const [f, rival] = s.fighters, before = this.previous;
        const caught = s.throwState?.phase === 'hold' && s.throwState.victim === 0;
        const notice = s.noticeLife > 0 ? s.notice : '';
        if (before) {
            switch (this.lesson) {
                case 0:
                    if (grounded(f) && !f.move && !f.stun && !f.blockstun) this.walked += Math.abs(f.x - before.x);
                    if (this.walked >= 90) this.done[0] = true;
                    if (f.blockstun > before.blockstun && this.done[0]) this.blocks++;
                    if (this.blocks >= 2) this.done[1] = true;
                    break;
                case 1:
                    if (f.combo >= 3 && f.lastFinisher) this.done[0] = true;
                    break;
                case 2:
                    if (s.throwState?.attacker === 0) this.done[0] = true;
                    if (this.done[0] && notice === 'THROW BREAK' && before.notice !== 'THROW BREAK' && before.caught) this.done[1] = true;
                    break;
                case 3:
                    if (f.combo === 0) { this.dashed = false; this.dashCombo = 0; }
                    else if (f.dashCanceled && !this.dashed) { this.dashed = true; this.dashCombo = f.combo; }
                    if (this.dashed && f.combo > this.dashCombo) this.done[0] = true;
                    break;
                case 4:
                    // The chase is the only jump that starts out of a launcher that hit.
                    if (before.launcherHit && !f.move && !grounded(f) && f.vy < -10) this.done[0] = true;
                    if (this.done[0] && f.riseDelay === 6 && f.reaction?.kind === 'knockdown') this.done[1] = true;
                    break;
                case 5:
                    if (f.move?.id === 'special' && f.move.hit && rival.stun > 0) this.done[0] = true;
                    break;
            }
        }
        this.previous = { x: f.x, blockstun: f.blockstun, combo: f.combo, launcherHit: f.move?.id === 'launcher' && !!f.move.hitConfirmed, notice, caught };
    }

    /** The dummy only attacks when a lesson needs something to block, break or be hit by. */
    private dummyInput(s: CombatState, script: Script): number {
        if (script === 'idle') return 0;
        const [f, dummy] = s.fighters;
        // Give the player room to stand up, and never swing at someone already down or held.
        if (dummy.move || dummy.stun || dummy.blockstun || f.stun || f.reaction || s.throwState || !grounded(f) || dummy.y < FLOOR) return 0;
        const toward = f.x < dummy.x ? A.left : A.right;
        const gap = Math.abs(f.x - dummy.x) - bodySpread(f.id) - bodySpread(dummy.id);
        const move = script === 'jab' ? 'light' : script;
        const reach = getMove(dummy, move).range - bodySpread(dummy.id) - 14;
        if (gap > reach) return toward;
        // A slow, readable rhythm: one attack, then a clear pause.
        const beat = this.clock % (script === 'jab' ? 70 : 110);
        if (beat !== 0) return 0;
        return script === 'jab' ? A.light : script === 'grab' ? A.grab : A.down | A.heavy;
    }

    view(prompt: Prompt): TutorialView {
        const lesson = TUTORIAL_LESSONS[this.lesson];
        return { index: this.lesson, total: TUTORIAL_LESSONS.length, title: lesson.title, hint: lesson.hint(prompt),
            goals: lesson.goals.map((label, i) => ({ label: label(prompt), done: !!this.done[i] })),
            cleared: this.cleared, complete: this.complete };
    }
}

/** The lesson card, drawn over the arena floor after the fight has been rendered. */
export function drawTutorial(c: CanvasRenderingContext2D, view: TutorialView): void {
    const x = 200, y = 584, width = 880, height = 90;
    c.save();
    c.fillStyle = '#0a1220e6'; c.fillRect(x, y, width, height);
    c.fillStyle = view.cleared ? '#b4f8c8' : '#f4e8c5'; c.fillRect(x, y, width, 3);
    c.textBaseline = 'alphabetic'; c.textAlign = 'left';
    c.font = '800 16px "Pixelify Sans", monospace';
    c.fillStyle = view.cleared ? '#b4f8c8' : '#f4e8c5';
    c.fillText(view.cleared ? `LESSON ${view.index + 1} OF ${view.total} CLEAR` : `LESSON ${view.index + 1} OF ${view.total} · ${view.title}`, x + 16, y + 24);
    c.font = '600 14px "Pixelify Sans", monospace';
    c.fillStyle = '#dbe6f2';
    wrap(c, view.hint, x + 16, y + 44, width - 32, 17, 2);
    let gx = x + 16;
    for (const goal of view.goals) {
        const label = `${goal.done ? '✓' : '○'} ${goal.label}`;
        c.fillStyle = goal.done ? '#b4f8c8' : '#fff3ad';
        c.fillText(label, gx, y + 81);
        gx += c.measureText(label).width + 28;
    }
    c.restore();
}
function wrap(c: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, lineHeight: number, maxLines: number): void {
    const words = text.split(' ');
    let line = '', lines = 0;
    for (const word of words) {
        const next = line ? line + ' ' + word : word;
        if (c.measureText(next).width > width && line) {
            if (++lines >= maxLines) { c.fillText(line.replace(/.{3}$/, '…'), x, y); return; }
            c.fillText(line, x, y); y += lineHeight; line = word;
        } else line = next;
    }
    if (line) c.fillText(line, x, y);
}
