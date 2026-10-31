/** Combat is a serializable, fixed-60Hz state machine. No DOM, clock, randomness, or rendering here. */
export const WIDTH = 1280, FLOOR = 578, TICK_RATE = 60;
export const A = { left: 1, right: 2, up: 4, down: 8, light: 16, medium: 32, heavy: 64, launcher: 128, bolt: 256, grab: 512, special: 1024, dash: 2048 } as const;
export type Action = keyof typeof A;
export type FighterId = 'rivet' | 'vela' | 'bront' | 'zephyr' | 'mox' | 'rune' | 'guest07' | 'guest08' | 'guest09' | 'guest10' | 'guest11' | 'guest12' | 'guest13' | 'guest14' | 'dumpstar';
export const PLAYABLE_FIGHTERS = ['rivet', 'vela', 'bront', 'zephyr', 'mox', 'rune', 'guest07', 'guest08', 'guest09', 'guest10', 'guest11', 'guest12', 'guest13', 'guest14', 'dumpstar'] as const;
export type PlayableFighterId = typeof PLAYABLE_FIGHTERS[number];
export type Mode = 'cpu' | 'dummy' | 'guard';
export type MoveId = 'light' | 'medium' | 'heavy' | 'low' | 'sweep' | 'airLight' | 'airMedium' | 'airHeavy' | 'launcher' | 'bolt' | 'grab' | 'special';
interface Move {
    startup: number;
    active: number;
    recovery: number;
    damage: number;
    range: number;
    stun: number;
    push: number;
    rank: number;
    finisher?: boolean;
    launch?: number;
    low?: boolean;
    air?: boolean;
    projectile?: boolean;
}
export const MOVES: Record<MoveId, Move> = {
    light: { startup: 5, active: 4, recovery: 13, damage: 38, range: 82, stun: 23, push: 5, rank: 1 },
    medium: { startup: 7, active: 5, recovery: 17, damage: 60, range: 112, stun: 28, push: 8, rank: 2 },
    heavy: { startup: 11, active: 6, recovery: 23, damage: 95, range: 135, stun: 32, push: 17, rank: 4, finisher: true },
    low: { startup: 5, active: 5, recovery: 14, damage: 34, range: 95, stun: 24, push: 3, rank: 1, low: true },
    sweep: { startup: 10, active: 6, recovery: 24, damage: 85, range: 135, stun: 32, push: 12, rank: 4, finisher: true, low: true },
    airLight: { startup: 4, active: 6, recovery: 11, damage: 36, range: 86, stun: 26, push: 3, rank: 1, air: true },
    airMedium: { startup: 6, active: 6, recovery: 14, damage: 58, range: 113, stun: 28, push: 5, rank: 2, air: true },
    airHeavy: { startup: 8, active: 7, recovery: 21, damage: 92, range: 139, stun: 33, push: 14, rank: 4, air: true, finisher: true },
    launcher: { startup: 8, active: 6, recovery: 23, damage: 64, range: 102, stun: 45, push: 3, rank: 3, launch: 16 },
    bolt: { startup: 16, active: 1, recovery: 27, damage: 55, range: 0, stun: 25, push: 7, rank: 3, projectile: true },
    grab: { startup: 6, active: 3, recovery: 30, damage: 115, range: 72, stun: 35, push: 16, rank: 5, finisher: true },
    special: { startup: 12, active: 40, recovery: 30, damage: 90, range: 680, stun: 28, push: 4, rank: 6 }
};
export const ROSTER: Record<FighterId, {
    name: string;
    color: string;
    dark: string;
    speed: number;
    jump: number;
    partner: FighterId;
    special: string;
    role: string;
    description: string;
}> = {
    rivet: { name: 'Golden Sproto', color: '#ffda55', dark: '#98702e', speed: 5.5, jump: 15.8, partner: 'vela', special: 'CROSSCURRENT', role: 'RUSHDOWN', description: 'Close the gap with fast chains, a quick dash, and an explosive launcher.' },
    vela: { name: 'Morelight', color: '#6ba9ff', dark: '#244da8', speed: 4.4, jump: 14.8, partner: 'rivet', special: 'PRISM BREAK', role: 'ZONING', description: 'Control space with faster bolts, then turn an opening into a full combo.' },
    bront: { name: 'Fat Head Dave', color: '#ed9471', dark: '#8b493f', speed: 3.7, jump: 13.6, partner: 'rivet', special: 'FAULT LINE', role: 'POWER', description: 'Stand your ground with heavier blows and a longer-reaching command grab.' },
    zephyr: { name: 'ZEPHYR', color: '#ffa74f', dark: '#bd5929', speed: 5.1, jump: 15.8, partner: 'vela', special: 'HARVEST MOON', role: 'AERIAL', description: 'Double-jump through the air and turn pumpkin strikes into a Harvest Moon relay.' },
    mox: { name: 'Yannix', color: '#a49eff', dark: '#4d468a', speed: 4.9, jump: 15.2, partner: 'bront', special: 'ECHO DRIVE', role: 'REACH', description: 'Catch an opening with longer-reaching light and medium attacks.' },
    rune: { name: 'Bongraker', color: '#f1b2d6', dark: '#895072', speed: 4.6, jump: 15.1, partner: 'zephyr', special: 'NIGHT BURST', role: 'BALANCED', description: 'Mix steady movement, close-range chains, and stronger, slower bolts.' },
    guest07: { name: 'Juicy', color: '#c3d3df', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Playable shared moveset. Generic placeholder art; reference 7 is preserved for the finished sprite.' },
    guest08: { name: 'Yoyo', color: '#accdbf', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Playable shared moveset. Generic placeholder art; reference 8 is preserved for the finished sprite.' },
    guest09: { name: 'Red Kev', color: '#d4bdc8', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Playable shared moveset. Generic placeholder art; reference 9 is preserved for the finished sprite.' },
    guest10: { name: 'FIGHTER 10', color: '#d9ccaa', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Playable shared moveset. Generic placeholder art; reference 10 is preserved for the finished sprite.' },
    guest11: { name: 'Chode Adoration', color: '#b8bedb', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Playable shared moveset. Generic placeholder art; reference 11 is preserved for the finished sprite.' },
    guest12: { name: '$Bitcoin Obama', color: '#c4d5b5', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Shared moveset, generic placeholder art; reference saved.' },
    guest13: { name: 'Jahon', color: '#d6c3ad', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Shared moveset, generic placeholder art; reference saved.' },
 guest14:{name:'Virtuagram',color:'#becfce',dark:'#526070',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Shared moveset, generic placeholder art; reference saved.'},
 dumpstar:{name:'Dumpstar',color:'#77a9ff',dark:'#345bb3',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Shared Golden Sproto movement and attacks. Face and attire from the supplied reference; shoulder objects omitted.'},
};
for (const id of PLAYABLE_FIGHTERS) {
    if (id !== 'rivet' && id !== 'vela') {
        ROSTER[id].speed = 5.5;
        ROSTER[id].jump = 15.8;
        ROSTER[id].role = 'SHARED KIT';
        ROSTER[id].description = 'Shared Golden Sproto movement, attacks, and Team Special behavior. ' + (id.startsWith('guest') ? 'Generic placeholder art; the reference is saved for later.' : 'Individual sprite art; unique powers are deferred.');
    }
}
ROSTER.dumpstar.description = 'Shared Golden Sproto movement, attacks, and Team Special behavior. Reference face and attire; objects above shoulders omitted.';
export interface Attack {
    id: MoveId;
    t: number;
    hit: boolean;
    connected: boolean;
    wave: number;
}
export interface Fighter {
    id: FighterId;
    x: number;
    y: number;
    vx: number;
    vy: number;
    facing: number;
    hp: number;
    stun: number;
    blockstun: number;
    move: Attack | null;
    prev: number;
    input: number;
    buffer: number;
    bufferLife: number;
    jumpBuffer: number;
    airJumps: number;
    dash: number;
    dashLock: number;
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
    life: number;
    damage: number;
}
export interface CombatState {
    frame: number;
    fighters: [
        Fighter,
        Fighter
    ];
    projectiles: Projectile[];
    effects: Effect[];
    freeze: number;
    mode: Mode;
    winner: number | null;
    clock: number;
    notice: string;
    noticeLife: number;
}
const makeFighter = (id: FighterId, x: number, facing: number): Fighter => ({ id, x, y: FLOOR, vx: 0, vy: 0, facing, hp: 1000, stun: 0, blockstun: 0, move: null, prev: 0, input: 0, buffer: 0, bufferLife: 0, jumpBuffer: 0, airJumps: 0, dash: 0, dashLock: 0, pips: 0, combo: 0, comboDamage: 0, lastFinisher: false, chargeEligible: true, best: 0, flash: 0 });
export function createState(id: PlayableFighterId = 'rivet', mode: Mode = 'cpu', opponent?: PlayableFighterId): CombatState { if (!PLAYABLE_FIGHTERS.includes(id) || (opponent && !PLAYABLE_FIGHTERS.includes(opponent)))
    throw new Error('Unknown roster selection.'); return { frame: 0, fighters: [makeFighter(id, 380, 1), makeFighter(opponent ?? (id === 'rivet' ? 'vela' : 'rivet'), 900, -1)], projectiles: [], effects: [], freeze: 0, mode, winner: null, clock: 99 * 60, notice: 'LIGHT → MEDIUM → FINISHER', noticeLife: 220 }; }
export const grounded = (f: Fighter) => f.y >= FLOOR;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
function effect(s: CombatState, x: number, y: number, kind: Effect['kind'], color: string) { const life = kind === 'charge' ? 45 : kind === 'special' ? 28 : 16; s.effects.push({ x, y, kind, color, life, max: life }); }
function finishCombo(s: CombatState, attacker: Fighter) {
    if (!attacker.combo)
        return;
    attacker.best = Math.max(attacker.best, attacker.combo);
    if (attacker.combo >= 3 && attacker.lastFinisher && attacker.chargeEligible) {
        attacker.pips = Math.min(3, attacker.pips + 1);
        effect(s, attacker.x, attacker.y - 130, 'charge', ROSTER[attacker.id].color);
        if (attacker === s.fighters[0]) {
            s.notice = attacker.pips === 3 ? 'RELAY READY — TEAM SPECIAL' : 'CLEAN FINISH  /  +1 RELAY CHARGE';
            s.noticeLife = 150;
        }
    }
    attacker.combo = 0;
    attacker.comboDamage = 0;
    attacker.lastFinisher = false;
    attacker.chargeEligible = true;
}
function damage(s: CombatState, index: number, m: Move, kind: MoveId, projectile = false): boolean {
    const a = s.fighters[index], b = s.fighters[1 - index];
    if (b.hp <= 0)
        return false;
    const back = b.facing === 1 ? A.left : A.right;
    const guarding = kind !== 'grab' && b.stun === 0 && !b.move && b.dash === 0 && (b.input & back) !== 0 && (!m.low || (b.input & A.down) !== 0) && (!m.air || (b.input & A.down) === 0);
    if (guarding) {
        b.blockstun = 15;
        b.vx = a.facing * m.push * .45;
        effect(s, b.x, b.y - 65, 'block', '#85c8ff');
        s.freeze = Math.max(s.freeze, 3);
        return false;
    }
    const scaling = Math.max(.45, 1 - a.combo * .08), amount = Math.round(m.damage * scaling);
    b.hp = Math.max(0, b.hp - amount);
    b.stun = m.stun;
    b.blockstun = 0;
    b.move = null;
    b.dash = 0;
    b.buffer = 0;
    b.flash = 10;
    b.vx = a.facing * m.push;
    if (m.launch) {
        b.vy = -m.launch;
        b.y = Math.min(b.y, FLOOR - 1);
    }
    else if (!grounded(b)) {
        b.vy = kind === 'airHeavy' ? 10 : -4.5;
    }
    a.combo++;
    a.comboDamage += amount;
    a.lastFinisher = !!m.finisher;
    if (kind === 'special')
        a.chargeEligible = false;
    if (!projectile && a.move) {
        a.move.hit = true;
        a.move.connected = true;
    }
    effect(s, b.x - a.facing * 18, b.y - 65, kind === 'special' ? 'special' : 'hit', ROSTER[a.id].color);
    s.freeze = Math.max(s.freeze, kind === 'heavy' || kind === 'airHeavy' ? 8 : 5);
    return true;
}
function chooseMove(f: Fighter, buttons: number): MoveId | null {
    if (buttons & A.special)
        return 'special';
    if (buttons & A.grab)
        return 'grab';
    if (buttons & A.launcher)
        return grounded(f) ? 'launcher' : null;
    if (buttons & A.heavy)
        return !grounded(f) ? 'airHeavy' : f.input & A.down ? 'sweep' : 'heavy';
    if (buttons & A.medium)
        return grounded(f) ? 'medium' : 'airMedium';
    if (buttons & A.light)
        return !grounded(f) ? 'airLight' : f.input & A.down ? 'low' : 'light';
    if (buttons & A.bolt)
        return 'bolt';
    return null;
}
export function getMove(f: Fighter, id: MoveId): Move { const m = MOVES[id]; return f.id === 'vela' && id === 'bolt' ? { ...m, startup: 11, recovery: 20, damage: 62 } : m; }
function act(s: CombatState, f: Fighter) {
    if (f.stun || f.blockstun)
        return;
    const just = f.input & ~f.prev;
    if (f.jumpBuffer > 0) {
        if ((grounded(f) && (!f.move || (f.move.id === 'launcher' && f.move.connected)))) {
            if (!grounded(f))
                f.airJumps++;
            const chasing = f.move?.id === 'launcher';
            f.vy = chasing ? -17 : ROSTER[f.id].jump * -1;
            f.y -= 1;
            f.jumpBuffer = 0;
            f.move = null;
            if (chasing)
                f.vx = f.facing * 3;
        }
    }
    if (f.bufferLife > 0) {
        const id = chooseMove(f, f.buffer);
        if (id) {
            const m = getMove(f, id);
            const canCancel = f.move && f.move.connected && m.rank > MOVES[f.move.id].rank && f.move.id !== 'special' && id !== 'grab';
            if ((!f.move || canCancel) && f.dash === 0 && (id !== 'grab' || grounded(f)) && (id !== 'special' || f.pips === 3)) {
                if (id === 'special') {
                    f.pips = 0;
                    f.chargeEligible = false;
                    s.notice = ROSTER[f.id].special + ' / TEAM RELAY';
                    s.noticeLife = 100;
                }
                f.move = { id, t: 0, hit: false, connected: false, wave: -1 };
                f.buffer = 0;
                f.bufferLife = 0;
            }
        }
    }
    if (!f.move && just & A.dash && f.dashLock === 0) {
        f.dash = 11;
        f.dashLock = 35;
        f.vx = ((f.input & A.left) ? -1 : (f.input & A.right) ? 1 : f.facing) * (f.id === 'vela' ? 12 : 14);
        effect(s, f.x, f.y - 50, 'dash', ROSTER[f.id].color);
    }
}
export function cpuInput(s: CombatState): number {
    const f = s.fighters[1], p = s.fighters[0], distance = Math.abs(p.x - f.x), toward = p.x < f.x ? A.left : A.right, away = p.x < f.x ? A.right : A.left;
    if (s.mode === 'dummy')
        return 0;
    if (s.mode === 'guard')
        return away | (p.input & A.down);
    if (f.stun || f.blockstun)
        return 0;
    if (f.move?.id === 'launcher' && f.move.connected && grounded(f))
        return A.up | toward;
    let input = distance > 105 ? toward : 0;
    if (s.frame % 2 === 0)
        return input;
    if (f.move?.connected) {
        const rank = MOVES[f.move.id].rank;
        if (rank === 1)
            return input | A.medium;
        if (rank === 2)
            return input | (s.frame % 5 === 1 && grounded(f) ? A.launcher : A.heavy);
    }
    if (f.move)
        return input;
    if (p.move && distance < 180 && s.frame % 120 < 65)
        return away | (p.input & A.down);
    if (f.pips === 3 && distance < 450)
        return A.special;
    if (f.id === 'vela' && distance > 260) {
        input = distance < 390 ? away : 0;
        if (s.frame % 45 < 4)
            return input | A.bolt;
    }
    if (distance < 90)
        return input | (s.frame % 150 < 22 ? A.grab : A.light);
    if (distance < 125)
        return input | A.medium;
    if (distance > 260 && s.frame % 90 < 3)
        return input | A.bolt;
    if (distance > 220 && s.frame % 120 < 4)
        return input | A.dash;
    return input;
}
/** Supply exactly one frame-indexed input pair per step. Replays need only initial config + these masks. */
export function step(s: CombatState, inputs: [
    number,
    number
]): void {
    if (s.winner !== null)
        return;
    s.frame++;
    s.effects = s.effects.filter(e => --e.life > 0);
    if (s.noticeLife > 0)
        s.noticeLife--;
    for (let i = 0; i < 2; i++) {
        const f = s.fighters[i];
        f.input = inputs[i];
        const pressed = f.input & ~f.prev;
        if (pressed & A.up)
            f.jumpBuffer = 10;
        const attacks = pressed & (A.light | A.medium | A.heavy | A.launcher | A.bolt | A.grab | A.special);
        if (attacks) {
            f.buffer = attacks;
            f.bufferLife = 10;
        }
    }
    if (s.freeze > 0) {
        s.freeze--;
        for (const f of s.fighters)
            f.prev = f.input;
        return;
    }
    if (s.mode === 'cpu')
        s.clock--;
    for (let i = 0; i < 2; i++) {
        const f = s.fighters[i], other = s.fighters[1 - i];
        if (f.flash > 0)
            f.flash--;
        if (f.stun > 0)
            f.stun--;
        if (f.blockstun > 0)
            f.blockstun--;
        if (f.dashLock > 0)
            f.dashLock--;
        if (!f.move && !f.stun && !f.blockstun && !f.dash)
            f.facing = other.x >= f.x ? 1 : -1;
        act(s, f);
        if (f.dash > 0) {
            f.dash--;
            f.vx *= .94;
        }
        else if (!f.stun && !f.blockstun) {
            const dir = ((f.input & A.right) ? 1 : 0) - ((f.input & A.left) ? 1 : 0);
            if (!f.move)
                f.vx = (s.mode === 'guard' && i === 1 ? 0 : dir) * ROSTER[f.id].speed * ((f.input & A.down) && grounded(f) ? 0 : 1);
            else
                f.vx *= .7;
        }
        else
            f.vx *= .84;
        f.x = clamp(f.x + f.vx, 45, WIDTH - 45);
        if (!grounded(f) || f.vy < 0) {
            f.vy += .65;
            f.y += f.vy;
            if (f.y >= FLOOR) {
                f.y = FLOOR;
                f.airJumps = 0;
                f.vy = 0;
                if (f.move && MOVES[f.move.id].air)
                    f.move = null;
            }
        }
        if (f.bufferLife > 0)
            f.bufferLife--;
        if (f.jumpBuffer > 0)
            f.jumpBuffer--;
        f.prev = f.input;
    }
    const [a, b] = s.fighters;
    if (Math.abs(a.x - b.x) < 55 && Math.abs(a.y - b.y) < 65) {
        const d = a.x <= b.x ? 1 : -1, overlap = (55 - Math.abs(a.x - b.x)) / 2;
        a.x = clamp(a.x - overlap * d, 45, WIDTH - 45);
        b.x = clamp(b.x + overlap * d, 45, WIDTH - 45);
    }
    // Collect active melee hits before applying them, so same-frame strikes can trade.
    const hits: {
        i: number;
        m: Move;
        id: MoveId;
    }[] = [];
    for (let i = 0; i < 2; i++) {
        const f = s.fighters[i], other = s.fighters[1 - i], attack = f.move;
        if (!attack)
            continue;
        attack.t++;
        const m = getMove(f, attack.id);
        if (m.projectile && attack.t === m.startup)
            s.projectiles.push({ owner: i, x: f.x + f.facing * 40, y: f.y - 70, vx: f.facing * (f.id === 'vela' ? 12 : 9), life: 100, damage: m.damage });
        let active = attack.t >= m.startup && attack.t < m.startup + m.active && !attack.hit;
        if (attack.id === 'special') {
            const wave = [12, 27, 42].indexOf(attack.t);
            active = wave >= 0;
            if (active) {
                attack.wave = wave;
                effect(s, other.x, other.y - 60, 'special', ROSTER[f.id].color);
            }
        }
        const ahead = (other.x - f.x) * f.facing;
        const crouched = (other.input & A.down) && grounded(other);
        const vertical = attack.id === 'special' ? true : attack.id === 'grab' ? grounded(f) && grounded(other) && other.stun === 0 && other.blockstun === 0 : Math.abs(f.y - other.y) < (m.launch ? 150 : 85);
        if (active && !m.projectile && ahead >= -22 && ahead < m.range && vertical && !(crouched && m.air && grounded(f))) {
            attack.hit = true;
            attack.connected = true;
            hits.push({ i, m, id: attack.id });
        }
        if (attack.t >= m.startup + m.active + m.recovery)
            f.move = null;
    }
    for (const hit of hits)
        damage(s, hit.i, hit.m, hit.id);
    for (const p of s.projectiles) {
        p.x += p.vx;
        p.life--;
        const target = s.fighters[1 - p.owner];
        const crouching = (target.input & A.down) && grounded(target);
        if (Math.abs(p.x - target.x) < 34 && Math.abs(p.y - (target.y - (crouching ? 30 : 65))) < (crouching ? 25 : 50)) {
            damage(s, p.owner, { ...MOVES.bolt, damage: p.damage }, 'bolt', true);
            p.life = 0;
        }
    }
    s.projectiles = s.projectiles.filter(p => p.life > 0 && p.x > -40 && p.x < WIDTH + 40);
    for (let i = 0; i < 2; i++) {
        const target = s.fighters[1 - i];
        if (target.stun === 0)
            finishCombo(s, s.fighters[i]);
    }
    if (a.hp <= 0 || b.hp <= 0 || s.clock <= 0) {
        finishCombo(s, a);
        finishCombo(s, b);
        s.winner = a.hp === b.hp ? 2 : a.hp > b.hp ? 0 : 1;
    }
    if (s.mode !== 'cpu' && b.stun === 0 && a.combo === 0 && s.frame % 90 === 0)
        b.hp = 1000;
}
