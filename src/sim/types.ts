// Simulation state types.
import { AttackAim, FighterId, HitReaction, Mode, MoveId, ThrowDirection, ThrowState } from './roster';
export interface Attack {
    id: MoveId;
    t: number;
    hit: boolean;
    connected: boolean;
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
    winner: number | null;
    notice: string;
    noticeLife: number;
}
