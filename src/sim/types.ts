import type { MatchDepth } from './matchRules';
// Simulation state types.
import { AttackAim, FighterId, HitReaction, Mode, MoveId, ThrowDirection, ThrowState } from './roster';
export interface Attack {
    id: MoveId;
    t: number;
    hit: boolean;
    connected: boolean;
    /** Damage confirmation; connected also includes guard contact. */
    hitConfirmed?: boolean;
    wave: number;
    aim?: AttackAim;
    shotX?: number;
    shotY?: number;
    throwDirection?: ThrowDirection;
}
export interface Fighter {
    id: FighterId;
    partner?: FighterId;
    x: number;
    y: number;
    vx: number;
    vy: number;
    facing: number;
    hp: number;
    slow: number;
    reaction:HitReaction|null;
    throwInvuln:number;
    strikeInvuln:number;
    stun: number;
    blockstun: number;
    move: Attack | null;
    prev: number;
    input: number;
    buffer: number;
    bufferLife: number;
    bufferInput: number;
    usedMoves: Partial<Record<MoveId,number>>;
    dashCanceled: boolean;
    jumpBuffer: number;
    jumpDelay: number;
    airJumps: number;
    dash: number;
    dashLock: number;
    dashBuffer:number;
    /** Direction at the dash press, preserved through hitstop/recovery. */
    dashDirection:number;
    /** Accepted dash direction for held forward run. */
    runDirection:number;
    /** Down-state frames sampled on knockdown landing; zero uses default. */
    riseDelay:number;
    pips: number;
    combo: number;
    comboDamage: number;
    lastFinisher: boolean;
    chargeEligible: boolean;
    best: number;
    flash: number;
}
export interface Effect {
    x: number;
    y: number;
    life: number;
    max: number;
    kind: 'hit' | 'block' | 'charge' | 'dash' | 'special' | 'pumpkin';
    color: string;
}
export interface Projectile {
    owner: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    damage: number;
    /** Finite, horizontal single-contact beam; it stays visible after contact. */
    beamLength?:number; beamFrames?:number; beamDirection?:number; beamHit?:boolean;
    age?:number; bounces?:number; shape?:string; gravity?:number; returnAt?:number; wave?:number; accel?:number; ground?:boolean;
}
export interface CombatState {
    /** Advanced by step for both seats, never by cpuInput. Included in snapshots/replays. */
    cpu?: [CpuMemory, CpuMemory];
    matchDepth?: MatchDepth;
    throwState: ThrowState | null;
    frame: number;
    fighters: [
        Fighter,
        Fighter
    ];
    projectiles: Projectile[];
    effects: Effect[];
    freeze: number;
    mode: Mode;
    godMode?: boolean;
    /** Chip is nonlethal by default, including Story. Optional harder rules may enable it. */
    chipKO?: boolean;
    winner: number | null;
    notice: string;
    noticeLife: number;
}

export type CpuIntent = 'approach' | 'zone' | 'pressure' | 'defend' | 'punish';
export interface CpuObservation {
    frame: number; x: number; y: number; vy: number; hp: number;
    move: MoveId | null; age: number; startup: number; active: number; recovery: number;
    low: boolean; input: number; attackRoll: number; lowRoll: number; jumpRoll: number; shot: boolean;
    /** Habit counts at observation time, so anticipation cannot read future attacks. */
    attacks: number; lows: number;
}
export interface CpuMemory {
    seed: number; intent: CpuIntent; nextDecision: number; decisionAt: number; choice: number;
    attackKey: string; attackRoll: number; lowRoll: number; jumpRoll: number;
    throwKey: number; throwRoll: number; combo: number; comboRoll: number; airborne: boolean;
    observations: CpuObservation[];
    habits: { attacks: number; lows: number; jumps: number; projectiles: number };
}
