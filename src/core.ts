/** Combat is a serializable, fixed-60Hz state machine. No DOM, clock, randomness, or rendering here. */
export const WIDTH = 1280, FLOOR = 578, TICK_RATE = 60;
// Keep broad heads and throw poses inside the arena camera.
export const WALL = 80;
/** Firm neutral jumps; launch/chase impulses retain their combo-specific values. */
export const GRAVITY = .85;
export const A = { left: 1, right: 2, up: 4, down: 8, light: 16, medium: 32, heavy: 64, launcher: 128, bolt: 256, grab: 512, special: 1024, dash: 2048 } as const;
export type Action = keyof typeof A;
export type FighterId = 'rivet' | 'vela' | 'bront' | 'zephyr' | 'mox' | 'rune' | 'guest07' | 'guest08' | 'guest09' | 'guest10' | 'guest11' | 'guest12' | 'guest13' | 'guest14' | 'dumpstar' | 'crapto' | 'vamp' | 'alpha777' | 'mandela' | 'bigswole' | 'nate';
export const PLAYABLE_FIGHTERS = ['rivet', 'vela', 'bront', 'zephyr', 'mox', 'rune', 'guest07', 'guest08', 'guest09', 'guest10', 'guest11', 'guest12', 'guest13', 'guest14', 'dumpstar', 'crapto', 'vamp', 'alpha777', 'mandela', 'bigswole', 'nate'] as const;
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
    zephyr: { name: 'Halloween 2008', color: '#ffa74f', dark: '#bd5929', speed: 5.1, jump: 15.8, partner: 'vela', special: 'HARVEST MOON', role: 'AERIAL', description: 'Double-jump through the air and turn pumpkin strikes into a Harvest Moon relay.' },
    mox: { name: 'Yannix', color: '#a49eff', dark: '#4d468a', speed: 4.9, jump: 15.2, partner: 'bront', special: 'ECHO DRIVE', role: 'REACH', description: 'Catch an opening with longer-reaching light and medium attacks.' },
    rune: { name: 'Bongraker', color: '#f1b2d6', dark: '#895072', speed: 4.6, jump: 15.1, partner: 'zephyr', special: 'NIGHT BURST', role: 'BALANCED', description: 'Mix steady movement, close-range chains, and stronger, slower bolts.' },
    guest07: { name: 'Juicy', color: '#c3d3df', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Individual reference-based sprites and shared combat kit.' },
    guest08: { name: 'Yoyo', color: '#accdbf', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Individual reference-based sprites and shared combat kit.' },
    guest09: { name: 'Red Kev', color: '#d4bdc8', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Individual reference-based sprites and shared combat kit.' },
    guest10: { name: 'Sprotel Bitcoin', color: '#d9ccaa', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Individual reference-based sprites and shared combat kit.' },
    guest11: { name: 'Chode Adoration', color: '#b8bedb', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Individual reference-based sprites and shared combat kit.' },
    guest12: { name: '$Bitcoin Obama', color: '#c4d5b5', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Individual reference-based sprites and shared combat kit.' },
    guest13: { name: 'Jahon', color: '#d6c3ad', dark: '#526070', speed: 5.5, jump: 15.8, partner: 'rivet', special: 'TEAM RELAY', role: 'SHARED KIT', description: 'Individual reference-based sprites and shared combat kit.' },
 guest14:{name:'Virtuagram',color:'#becfce',dark:'#526070',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Individual reference-based sprites and shared combat kit.'},
 vamp:{name:'VAMP',color:'#5b83f4',dark:'#263c64',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Individual reference-based sprites, shared movement and attacks.'},
 alpha777:{name:'Alpha 777',color:'#98aa6c',dark:'#263c64',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Individual reference-based sprites, shared movement and attacks.'},
 mandela:{name:'Bitcoin Mandela',color:'#5288ef',dark:'#263c64',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Individual reference-based sprites, shared movement and attacks.'},
 bigswole:{name:'Big Swole',color:'#4395fb',dark:'#263c64',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Individual reference-based sprites, shared movement and attacks.'},
 nate:{name:'Little Foot Nate',color:'#97aee7',dark:'#263c64',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Individual reference-based sprites, shared movement and attacks.'},
 crapto:{name:'Crapto',color:'#d1a86c',dark:'#745137',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Individual reference-based sprite art with shared powers and animation timing.'},
 dumpstar:{name:'Dumpstar',color:'#77a9ff',dark:'#345bb3',speed:5.5,jump:15.8,partner:'rivet',special:'TEAM RELAY',role:'SHARED KIT',description:'Shared Golden Sproto movement and attacks. Face and attire from the supplied reference; shoulder objects omitted.'},
};
for (const id of PLAYABLE_FIGHTERS) {
    if (id !== 'rivet' && id !== 'vela') {
        ROSTER[id].speed = 5.5;
        ROSTER[id].jump = 15.8;
        ROSTER[id].role = 'SHARED KIT';
        ROSTER[id].description = 'Shared Golden Sproto movement, attacks, and Team Special behavior. ' + 'Individual reference-based sprite art; unique powers are deferred.';
    }
}
// Faster footwork retains a distinct burst dash. Final values are shared by
// movement, UI and deterministic replay; the neutral jump arc stays fixed.
for(const id of PLAYABLE_FIGHTERS){ROSTER[id].speed*=.92;ROSTER[id].jump*=.98;}
ROSTER.dumpstar.description = 'Shared Golden Sproto movement, attacks, and Team Special behavior. Reference face and attire; objects above shoulders omitted.';
/** Individual kits: mechanics are simulation data; the renderer uses the same identity. */
export interface CombatStyle {
 role:string; specialName:string; signature:string; lightRange:number; heavy:Partial<Move>; bolt:Partial<Move>;
 projectile:{speed:number;shape:string;gravity?:number;bounces?:number;returnAt?:number;wave?:number;accel?:number;ground?:boolean};
 specialFrames:number[]; special:Partial<Move>; advance?:number; power?:'slow'|'drain'|'pull'|'launch'|'slam';
}
const kit=(role:string,specialName:string,signature:string,lightRange:number,heavy:Partial<Move>,bolt:Partial<Move>,projectile:CombatStyle['projectile'],specialFrames:number[],special:Partial<Move>,advance=0,power?:CombatStyle['power']):CombatStyle=>({role,specialName,signature,lightRange,heavy,bolt,projectile,specialFrames,special,advance,power});
export const COMBAT_STYLES:Record<FighterId,CombatStyle>={
 rivet:kit('RUSHDOWN','CROSSCURRENT','Fast jab links and an advancing four-punch relay.',82,{}, {},{speed:9,shape:'spark'},[12,22,32,42],{range:340,damage:68},3),
 vela:kit('ZONING','PRISM BREAK','Quick straight spit and a long-range beam relay.',88,{push:20},{startup:11,recovery:20,damage:62},{speed:12,shape:'prism'},[16,32,48],{range:850,damage:86}),
 bront:kit('GRAPPLER','FAULT LINE','Short fists, crushing hammer and a two-impact rising slam.',74,{damage:120,startup:14,launch:11,push:5},{startup:23,damage:80},{speed:6,shape:'boulder',gravity:.12},[18,40],{range:300,damage:135,launch:16},0,'slam'),
 zephyr:kit('PUMPKIN','HARVEST MOON','Lob bouncing pumpkins; the relay launches then drops its victim.',92,{launch:9,damage:88},{startup:19,damage:65},{speed:7,shape:'pumpkin',gravity:.16,bounces:2},[14,28,42],{range:580,damage:88,launch:12},0,'slam'),
 mox:kit('FENCER','ECHO DRIVE','Long light pokes, narrow fast darts and five piercing relay strikes.',112,{range:155,damage:80,push:10},{startup:12,damage:40,recovery:22},{speed:14,shape:'needle'},[12,20,28,36,44],{range:460,damage:50,push:2},1),
 rune:kit('GRAVITY','NIGHT BURST','Slow drifting orbs and a relay that pulls foes into its final blast.',90,{push:-9,damage:90},{damage:68,stun:32},{speed:5,shape:'orb',wave:.8},[18,36,48],{range:650,damage:86,push:-12},0,'pull'),
 guest07:kit('UPPERCUT','CITRUS RUSH','Rising heavy punch, fast arcing juice and an advancing uppercut relay.',82,{launch:13,push:4,damage:88},{startup:13,damage:49},{speed:10,shape:'drop',gravity:.05},[12,26,42],{range:390,damage:84,launch:13},4,'launch'),
 guest08:kit('RETURN','ROUND TRIP','Returning rings control both directions; relay sweeps then pulls back.',100,{range:150,push:7,damage:82},{damage:48,recovery:23},{speed:9,shape:'ring',returnAt:28},[15,30,45],{range:590,damage:86,push:-7},0,'pull'),
 guest09:kit('MOMENTUM','REDLINE','Driving cross, accelerating shots and a three-burst forward relay.',78,{push:25,damage:100},{startup:18,damage:58},{speed:5,shape:'arrow',accel:.22},[12,24,36],{range:340,damage:95,push:9},6),
 guest10:kit('BARRAGE','GIFT STORM','Gift-box lobs, overhead hammer and four rising festive impacts.',86,{launch:7,damage:96},{startup:20,damage:72},{speed:6,shape:'gift',gravity:.2,bounces:1},[16,26,36,46],{range:640,damage:65,launch:8}),
 guest11:kit('RECOVERY','HEARTBREAK','Wide palm strike, fluttering hearts and a health-draining two-pulse relay.',96,{stun:39,damage:80},{damage:48,stun:31},{speed:7,shape:'heart',wave:1.8},[20,40],{range:530,damage:125,push:6},0,'drain'),
 guest12:kit('RICOCHET','COIN ADDRESS','Low skipping coins and three diagonal palm launches.',91,{range:145,launch:6,damage:87},{startup:14,damage:51},{speed:10,shape:'coin',gravity:.18,bounces:3},[14,28,42],{range:660,damage:82,launch:9},0,'launch'),
 guest13:kit('COIL','SERPENT COIL','Long hook, weaving spit and an inward-pulling spiral relay.',107,{range:160,push:-5,damage:85},{damage:53,stun:30},{speed:8,shape:'serpent',wave:2.4},[16,32,48],{range:560,damage:90,push:-10},0,'pull'),
 guest14:kit('PHASE','PHASE SHIFT','Fast palm finisher, accelerating pixels and three long phase dashes.',85,{startup:8,damage:76,recovery:19},{startup:10,damage:38},{speed:8,shape:'pixel',accel:.12},[12,30,48],{range:270,damage:92,push:4},8),
 dumpstar:kit('GROUND','CLEANUP CREW','Heavy low sweep and ground debris; relay punishes standing guard.',84,{low:true,push:19,damage:103},{startup:22,damage:70,low:true},{speed:7,shape:'scrap',ground:true},[18,36,48],{range:570,damage:92,low:true,push:11}),
 crapto:kit('ACID','ACID TEST','Acid spit drains health on a hit; the relay siphons three times.',80,{damage:91,stun:36},{startup:18,damage:56},{speed:8,shape:'acid',gravity:.07},[18,34,50],{range:510,damage:80,push:5},0,'drain'),
 vamp:kit('MELANCHOLY','BLACK PARADE','Broken-heart waves briefly slow movement; relay sends three sorrow pulses.',94,{damage:84,stun:37},{startup:18,damage:45},{speed:6,shape:'brokenHeart',wave:1.2},[20,36,50],{range:620,damage:78,stun:34},0,'slow'),
 alpha777:kit('BURST','LUCKY SEVENS','Seven-shaped fast shots and six deterministic jackpot impacts.',89,{damage:77,startup:9},{startup:12,damage:42},{speed:11,shape:'seven'},[14,21,28,35,42,49],{range:480,damage:44,push:2}),
 mandela:kit('CHAIN','FREEDOM CHAIN','Long reaching hands, returning links and a pull-then-release relay.',110,{range:165,damage:86,push:-6},{damage:60,stun:30},{speed:8,shape:'chain',returnAt:40},[18,34,50],{range:720,damage:88,push:-14},0,'pull'),
 bigswole:kit('POWER','ATLAS CRASH','Slow crushing fist, heavy rock and two massive upward/downward impacts.',76,{damage:132,startup:16,push:22},{startup:26,damage:88},{speed:5,shape:'rock',gravity:.1},[20,44],{range:350,damage:145,launch:17},1,'slam'),
 nate:kit('POUNCE','SMALL STEPS','Quick low kick, low hopping shots and three short pounce bursts.',79,{startup:8,damage:78,low:true},{startup:12,damage:44,low:true},{speed:9,shape:'paw',gravity:.12,bounces:2,ground:true},[10,24,38],{range:310,damage:83,low:true,push:6},5),
};
for(const id of PLAYABLE_FIGHTERS){const style=COMBAT_STYLES[id];ROSTER[id].role=style.role;ROSTER[id].special=style.specialName;ROSTER[id].description=style.signature;}
export type AttackAim = 'level' | 'up' | 'upForward' | 'down';
export type ThrowDirection = 'forward' | 'back' | 'up' | 'down';
export const THROW_HOLD_FRAMES=12, THROW_RECOVERY_FRAMES=18;
export interface ThrowState { attacker:number; victim:number; phase:'hold'|'release'; t:number; direction:ThrowDirection; facing:number; }
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
    x: number;
    y: number;
    vx: number;
    vy: number;
    facing: number;
    hp: number;
    slow: number;
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
    winner: number | null;
    clock: number;
    notice: string;
    noticeLife: number;
}
const makeFighter = (id: FighterId, x: number, facing: number): Fighter => ({ id, x, y: FLOOR, vx: 0, vy: 0, facing, hp: 1000, slow:0, stun: 0, blockstun: 0, move: null, prev: 0, input: 0, buffer: 0, bufferLife: 0, bufferInput:0, usedMoves:{}, dashCanceled:false, jumpBuffer: 0, jumpDelay: 0, airJumps: 0, dash: 0, dashLock: 0, dashBuffer:0, dashDirection:facing, pips: 0, combo: 0, comboDamage: 0, lastFinisher: false, chargeEligible: true, best: 0, flash: 0 });
export function createState(id: PlayableFighterId = 'rivet', mode: Mode = 'cpu', opponent?: PlayableFighterId): CombatState { if (!PLAYABLE_FIGHTERS.includes(id) || (opponent && !PLAYABLE_FIGHTERS.includes(opponent)))
    throw new Error('Unknown roster selection.'); return { throwState:null, frame: 0, fighters: [makeFighter(id, 380, 1), makeFighter(opponent ?? (id === 'rivet' ? 'vela' : 'rivet'), 900, -1)], projectiles: [], effects: [], freeze: 0, mode, winner: null, clock: 99 * 60, notice: 'LIGHT → MEDIUM → FINISHER', noticeLife: 220 }; }
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
    attacker.usedMoves = {};
    attacker.dashCanceled = false;
    attacker.combo = 0;
    attacker.comboDamage = 0;
    attacker.lastFinisher = false;
    attacker.chargeEligible = true;
}
/** Release a latched pair on interruption. No throw damage is awarded. */
function interruptThrow(s:CombatState):void {
    const hold=s.throwState;if(!hold)return;
    const a=s.fighters[hold.attacker],b=s.fighters[hold.victim];
    if(hold.phase==='hold'){
        b.x=clamp(a.x+hold.facing*60,WALL,WIDTH-WALL);b.vx=hold.facing*3;b.vy=0;
        b.stun=Math.max(b.stun,8);b.buffer=0;b.bufferLife=0;b.jumpBuffer=0;b.dashBuffer=0;
    }
    if(a.move?.id==='grab')a.move=null;
    s.throwState=null;
}
function positionHeldVictim(s:CombatState):void {
    const hold=s.throwState;if(!hold||hold.phase!=='hold')return;
    const a=s.fighters[hold.attacker],b=s.fighters[hold.victim],progress=hold.t/THROW_HOLD_FRAMES;
    const side=hold.direction==='back'?48*Math.cos(progress*Math.PI):48;
    const lift=hold.direction==='back'||hold.direction==='down'?Math.sin(progress*Math.PI)*55:hold.direction==='up'?progress*35:0;
    b.x=clamp(a.x+hold.facing*side,WALL,WIDTH-WALL);b.y=a.y-26-lift;b.vx=0;b.vy=0;b.facing=-hold.facing;b.stun=1;
}
function beginThrow(s:CombatState,index:number):void {
    const a=s.fighters[index],b=s.fighters[1-index];
    if(s.throwState||a.stun||a.blockstun||!a.move||a.move.id!=='grab'||!grounded(a)||!grounded(b)||b.stun||b.blockstun||a.hp<=0||b.hp<=0)return;
    s.throwState={attacker:index,victim:1-index,phase:'hold',t:0,direction:a.move.throwDirection??'forward',facing:a.facing};
    a.vx=0;a.vy=0;a.move.hit=true;a.move.connected=false;
    b.move=null;b.dash=0;b.blockstun=0;
    for(const f of [a,b]){f.buffer=0;f.bufferLife=0;f.jumpBuffer=0;f.jumpDelay=0;f.dashBuffer=0;}
    positionHeldVictim(s);effect(s,b.x,b.y-65,'block',ROSTER[a.id].color);s.freeze=Math.max(s.freeze,3);
}
function updateThrow(s:CombatState):void {
    const hold=s.throwState;if(!hold)return;
    const a=s.fighters[hold.attacker],b=s.fighters[hold.victim];
    if(a.hp<=0||b.hp<=0||a.stun||a.blockstun){interruptThrow(s);return;}
    hold.t++;
    if(hold.phase==='hold'){
        positionHeldVictim(s);
        if(hold.t>=THROW_HOLD_FRAMES){
            hold.phase='release';hold.t=0;
            damage(s,hold.attacker,getMove(a,'grab'),'grab');
            const direction=hold.direction==='back'?-hold.facing:hold.facing;
            b.x=clamp(a.x+direction*60,WALL,WIDTH-WALL);
            b.y=Math.min(b.y,FLOOR-26);
            b.vx=direction*(hold.direction==='up'?2:hold.direction==='down'?5:14);
            b.vy=hold.direction==='up'?-18:hold.direction==='down'?15:-8;
            b.stun=Math.max(b.stun,hold.direction==='up'?42:35);
            if(a.move)a.move.t=MOVES.grab.startup+MOVES.grab.active;
            effect(s,b.x,b.y-45,'hit',ROSTER[a.id].color);
        }
    }else if(hold.t>=THROW_RECOVERY_FRAMES){
        if(a.move?.id==='grab')a.move=null;
        s.throwState=null;
    }
}
function damage(s: CombatState, index: number, m: Move, kind: MoveId, projectile = false): boolean {
    const a = s.fighters[index], b = s.fighters[1 - index];
    if (b.hp <= 0)
        return false;
    const hold=s.throwState;
    // A held victim cannot take incidental projectile damage; only release hits.
    if(hold?.phase==='hold' && hold.victim===1-index && kind!=='grab')return false;
    if(hold && hold.attacker===1-index)interruptThrow(s);
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
    b.vx = a.facing * m.push * (a.combo > 0 && !m.finisher ? .55 : 1);
    if (m.launch) {
        b.vy = -m.launch;
        b.y = Math.min(b.y, FLOOR - 1);
    }
    else if (!grounded(b)) {
        // Keep confirmed aerial chains together instead of leaving the victim below
        // an ascending attacker. Finishers still knock downward; route limits remain.
        b.vy = kind === 'airHeavy' ? 10 : m.air && !grounded(a) ? Math.min(-4.5,a.vy) : -4.5;
    }
    const power=COMBAT_STYLES[a.id].power;
    if(kind==='special'||(projectile&&(a.id==='vamp'||a.id==='crapto'))){
      if(power==='slow')b.slow=90;
      if(power==='drain'&&a.hp>0)a.hp=Math.min(1000,a.hp+Math.round(amount*.2));
      if(kind==='special'&&power==='pull'&&a.move?.wave===COMBAT_STYLES[a.id].specialFrames.length-1)b.vx=a.facing*18;
      if(kind==='special'&&power==='slam'&&a.move?.wave===COMBAT_STYLES[a.id].specialFrames.length-1)b.vy=16;
    }
    a.combo++;
    a.usedMoves[kind]=(a.usedMoves[kind]??0)+1;
    if(projectile && a.move?.id==='bolt')a.move.connected=true;
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
function chooseMove(f: Fighter, buttons: number, directions=f.input): MoveId | null {
    if (buttons & A.special)
        return 'special';
    if (buttons & A.grab)
        return 'grab';
    if (buttons & A.launcher)
        return 'launcher';
    if (buttons & A.heavy)
        return !grounded(f) ? 'airHeavy' : directions & A.down ? 'sweep' : 'heavy';
    if (buttons & A.medium)
        return grounded(f) ? 'medium' : 'airMedium';
    if (buttons & A.light && directions & A.up) return 'launcher';
    if (buttons & A.light)
        return !grounded(f) ? 'airLight' : directions & A.down ? 'low' : 'light';
    if (buttons & A.bolt)
        return 'bolt';
    return null;
}
export function getMove(f: Fighter, id: MoveId): Move {
 const style=COMBAT_STYLES[f.id];
 let m:Move={...MOVES[id],...(id==='light'?{range:style.lightRange}:id==='heavy'||id==='airHeavy'?style.heavy:id==='bolt'?style.bolt:id==='special'?{...style.special,startup:style.specialFrames[0],active:style.specialFrames.at(-1)!-style.specialFrames[0]+1,recovery:30}:{} )};
 const aim = f.move?.id === id ? f.move.aim : undefined;
 if(!m.projectile && id !== 'special' && id !== 'grab'){
   if(aim==='upForward')m={...m,range:155,stun:Math.max(m.stun,32),launch:10};
   if(aim==='up')m={...m,range:95,stun:Math.max(m.stun,32),launch:14};
   if(aim==='down' && grounded(f))m={...m,low:true};
   if(!grounded(f))m={...m,air:true};
 }
 return m;
}
function act(s: CombatState, f: Fighter) {
    if (f.stun || f.blockstun || (s.throwState && (s.fighters[s.throwState.attacker]===f || (s.throwState.phase==='hold'&&s.fighters[s.throwState.victim]===f))))
        return;
    const just = f.input & ~f.prev;
    const directionalChord = (f.input & A.up) && (just & (A.light|A.medium|A.heavy|A.bolt|A.grab));
    if (directionalChord) f.jumpBuffer = 0;
    if (f.jumpBuffer > 0 && f.jumpDelay === 0) {
        if (grounded(f) && f.dash <= 8 && (!f.move || (f.move.id === 'launcher' && f.move.connected))) {
            const chasing = f.move?.id === 'launcher';
            f.vy = chasing ? -17 : ROSTER[f.id].jump * -1;
            f.y -= 1;
            f.jumpBuffer = 0;
            f.dash = 0;
            f.dashBuffer = 0;
            f.move = null;
            if (chasing)
                f.vx = f.facing * 3;
        }
    }
    // Resolve a last-instant landing press as a grounded move after physics.
    const landingThisFrame = !grounded(f) && f.vy >= 0 && f.y + f.vy + GRAVITY >= FLOOR;
    if (f.bufferLife > 0 && !landingThisFrame) {
        const id = chooseMove(f, f.buffer, f.bufferInput);
        if (id) {
            const m = getMove(f, id);
            const used=f.usedMoves[id]??0, limit=id==='light'||id==='airLight'?2:1;
            const withinRoute=f.combo===0||used<limit;
            const linkLight=f.move?.id==='light' && (id==='light'||id==='low');
            const canCancel = f.move && f.move.connected && (m.rank > MOVES[f.move.id].rank || linkLight) && f.move.id !== 'special' && id !== 'grab';
            if (withinRoute && (!f.move || canCancel) && f.dash <= 8 && (id !== 'grab' || grounded(f)) && (id !== 'special' || f.pips === 3)) {
                if (id === 'special') {
                    f.pips = 0;
                    f.chargeEligible = false;
                    s.notice = ROSTER[f.id].special + ' / TEAM RELAY';
                    s.noticeLife = 100;
                }
                const forward = f.facing===1?A.right:A.left;
                const directions=f.bufferInput;
                const aim:AttackAim = directions&A.up ? (directions&forward?'upForward':'up') : directions&A.down?'down':'level';
                const vertical = directions&A.up?-1:directions&A.down?1:0;
                const horizontal = vertical ? ((directions&A.left)?-1:(directions&A.right)?1:0) : f.facing;
                f.dash = 0;
                // The selected attack wins a simultaneous dash/attack chord.
                f.dashBuffer = 0;
                f.move = { id, t: 0, hit: false, connected: false, wave: -1, aim: id==='launcher' && aim==='level'?'up':aim, shotX:horizontal,shotY:vertical, throwDirection:id==='grab'?(directions&A.up?'up':directions&A.down?'down':directions&(f.facing===1?A.left:A.right)?'back':'forward'):undefined };

                f.buffer = 0;
                f.bufferLife = 0;
            }
        }
    }
    if (f.dashBuffer>0 && f.dashLock===0 && f.move?.connected && f.combo>0 && !f.dashCanceled && f.move.id!=='special') { f.move=null; f.dashCanceled=true; }
    if (!f.move && !f.jumpBuffer && f.dashBuffer>0 && f.dashLock === 0) {
        f.dash = 11;
        f.dashBuffer=0;
        f.dashLock = 28;
        f.vx = f.dashDirection * (f.id === 'vela' ? 13 : 15);
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
        if(s.throwState && (i===s.throwState.attacker || (s.throwState.phase==='hold'&&i===s.throwState.victim))){
            f.buffer=0;f.bufferLife=0;f.jumpBuffer=0;f.jumpDelay=0;f.dashBuffer=0;f.prev=f.input;continue;
        }
        const pressed = f.input & ~f.prev;
        if(pressed&A.dash){
            // Vertical+dash is not stored as a surprise dash after the vertical
            // direction is released. Up retains jump/chord priority; Down crouches.
            f.dashBuffer=(f.input&(A.up|A.down))?0:8;
            const horizontal=((f.input&A.right)?1:0)-((f.input&A.left)?1:0);
            f.dashDirection=horizontal||f.facing;
        }
        if (pressed & A.up) { f.jumpBuffer = 10; f.jumpDelay = 2; }
        const attacks = pressed & (A.light | A.medium | A.heavy | A.launcher | A.bolt | A.grab | A.special);
        if (attacks) {
            f.buffer = attacks;
            f.bufferLife = 14;
            f.bufferInput = f.input;
            if(f.input&A.up && attacks&(A.light|A.medium|A.heavy|A.bolt|A.grab)){f.jumpBuffer=0;f.jumpDelay=0;}
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
        if(f.slow>0)f.slow--;
        if (f.flash > 0)
            f.flash--;
        if (f.stun > 0)
            f.stun--;
        if (f.blockstun > 0)
            f.blockstun--;
        if (f.dashLock > 0)
            f.dashLock--;
        if(s.throwState && (i===s.throwState.attacker || (s.throwState.phase==='hold'&&i===s.throwState.victim))){f.vx=0;f.vy=0;f.prev=f.input;continue;}
        if (grounded(f) && !f.move && !f.stun && !f.blockstun && !f.dash)
            f.facing = other.x >= f.x ? 1 : -1;
        // Once its three committed frames finish, crouch or an opposite
        // direction can brake a dash. Neutral release alone keeps the tap dash.
        const horizontal=((f.input&A.right)?1:0)-((f.input&A.left)?1:0);
        if(f.dash>0&&f.dash<=8&&((f.input&A.down)||(horizontal&&horizontal*f.vx<0))){
            f.dash=0;f.dashBuffer=0;
        }
        act(s, f);
        if (f.dash > 0) {
            f.dash--;
            f.vx *= .94;
        }
        else if (!f.stun && !f.blockstun) {
            const dir = s.mode === 'guard' && i === 1 ? 0 : ((f.input & A.right) ? 1 : 0) - ((f.input & A.left) ? 1 : 0);
            const speed = ROSTER[f.id].speed*(f.slow>0?.65:1);
            const approach = (target:number, amount:number) => f.vx += clamp(target - f.vx, -amount, amount);
            if (!grounded(f)) {
                // Preserve takeoff/dash momentum; attacks permit reduced steering, not braking.
                const steering=f.move?.22:.65;
                // Holding the travel direction must not brake a dash-jump more
                // than releasing it; opposite input still reverses gradually.
                if (dir && (dir*f.vx<=0 || Math.abs(f.vx)<speed)) approach(dir * speed, steering);
                else f.vx *= .995;
            } else if (!f.move) {
                const target = (f.input & A.down) ? 0 : dir * speed;
                const acceleration = target === 0 ? speed * .7 : target * f.vx < 0 ? speed * 1.45 : speed * .55;
                approach(target, acceleration);
            } else if(f.move.id==='special' && f.move.t>=6 && f.move.t<=COMBAT_STYLES[f.id].specialFrames.at(-1)!){f.vx=f.facing*Math.min(COMBAT_STYLES[f.id].advance??0,Math.max(0,(other.x-f.x)*f.facing-65));}
            else f.vx *= .7;
        }
        else
            f.vx *= .84;
        const nextX=f.x+f.vx;
        f.x = clamp(nextX, WALL, WIDTH - WALL);
        if(nextX!==f.x){f.vx=0;f.dash=0;f.dashBuffer=0;}
        if (!grounded(f) || f.vy < 0) {
            f.vy += GRAVITY;
            f.y += f.vy;
            if (f.y >= FLOOR) {
                f.y = FLOOR;
                f.airJumps = 0;
                f.vy = 0;
                if (f.move && MOVES[f.move.id].air)
                    f.move = null;
                // Resolve a cross-up before executing a buffered grounded action.
                if(!f.move&&!f.stun&&!f.blockstun&&!f.dash)f.facing=other.x>=f.x?1:-1;
                // Consume buffered jump/attack on touchdown, not one input frame later.
                act(s, f);
            }
        }
        if (f.bufferLife > 0)
            f.bufferLife--;
        if (f.jumpBuffer > 0)
            f.jumpBuffer--;
        if(f.jumpDelay>0)f.jumpDelay--;
        if(f.dashBuffer>0)f.dashBuffer--;
        f.prev = f.input;
    }
    updateThrow(s);
    const [a, b] = s.fighters;
    if (s.throwState?.phase!=='hold' && Math.abs(a.x - b.x) < 55 && Math.abs(a.y - b.y) < 65) {
        const d = a.x <= b.x ? 1 : -1, overlap = (55 - Math.abs(a.x - b.x)) / 2;
        a.x = clamp(a.x - overlap * d, WALL, WIDTH - WALL);
        b.x = clamp(b.x + overlap * d, WALL, WIDTH - WALL);
    }
    // Collect active melee hits before applying them, so same-frame strikes can trade.
    const hits: {
        i: number;
        m: Move;
        id: MoveId;
    }[] = [];
    for (let i = 0; i < 2; i++) {
        const f = s.fighters[i], other = s.fighters[1 - i], attack = f.move;
        if (!attack || (s.throwState&&i===s.throwState.attacker))
            continue;
        attack.t++;
        const m = getMove(f, attack.id);
        // Chamber in the current jump arc. Diving at the button press could
        // land before a slower fighter's heavy attack ever became active.
        if (!grounded(f) && attack.aim === 'down' &&
            (attack.id === 'airHeavy' || attack.id === 'airMedium') && attack.t === m.startup) f.vy = Math.max(f.vy, 8);
        if (m.projectile && attack.t === m.startup) {
            const style=COMBAT_STYLES[f.id].projectile,dx=attack.shotX??f.facing,dy=attack.shotY??0,length=Math.hypot(dx,dy)||1,speed=style.speed;
            s.projectiles.push({...style,owner:i,x:f.x+f.facing*34,y:style.ground&&dy===0?FLOOR-22:f.y-95,vx:dx/length*speed,vy:dy/length*speed-(style.bounces&&dy===0&&!style.ground?3:0),life:100,damage:m.damage,age:0});
        }
        let active = attack.t >= m.startup && attack.t < m.startup + m.active && !attack.hit;
        if (attack.id === 'special') {
            const wave = COMBAT_STYLES[f.id].specialFrames.indexOf(attack.t);
            active = wave >= 0;
            if (active) {
                attack.wave = wave;
            }
        }
        const ahead = (other.x - f.x) * f.facing;
        const crouched = (other.input & A.down) && grounded(other);
        const dy=other.y-f.y;
        const vertical = attack.id === 'special' ? true : attack.id === 'grab' ? !s.throwState && grounded(f) && grounded(other) && other.stun === 0 && other.blockstun === 0 : attack.aim==='upForward' ? Math.abs(dy+10+Math.max(0,ahead)*.65)<65 : attack.aim==='up' ? dy>-190&&dy<45 : attack.aim==='down'&&!grounded(f) ? dy>-25&&dy<165 : Math.abs(dy)<85;
        if (active && !m.projectile && ahead >= -22 && ahead < m.range && vertical && !(crouched && m.air && grounded(f))) {
            attack.hit = true;
            attack.connected = true;
            hits.push({ i, m, id: attack.id });
        }
        if (attack.t >= m.startup + m.active + m.recovery)
            f.move = null;
    }
    if(hits.length===2&&hits.every(h=>h.id==='grab')){
        // Simultaneous grabs break cleanly instead of favoring player index.
        for(const f of s.fighters){f.move=null;f.stun=10;f.vx=-f.facing*7;}
        s.freeze=Math.max(s.freeze,3);
    }else{
        // A same-frame damaging strike interrupts a grab before it can latch.
        for(const hit of hits.filter(h=>h.id!=='grab'))damage(s,hit.i,hit.m,hit.id);
        for(const hit of hits.filter(h=>h.id==='grab'))beginThrow(s,hit.i);
    }
    for (const p of s.projectiles) {
        p.age=(p.age??0)+1;
        if(p.returnAt===p.age)p.vx*=-1;
        if(p.accel)p.vx+=Math.sign(p.vx)*p.accel;
        p.vy+=p.gravity??0;
        p.x += p.vx;
        p.y += p.vy+(p.wave?Math.sin(p.age*.3)*p.wave:0);
        if((p.bounces??0)>0&&p.y>=FLOOR-20){p.y=FLOOR-20;p.vy=-Math.max(3,Math.abs(p.vy)*.75);p.bounces!--;}
        else if(p.ground&&p.y>FLOOR-20){p.y=FLOOR-20;p.vy=0;}
        p.life--;
        const target = s.fighters[1 - p.owner];
        const crouching = (target.input & A.down) && grounded(target);
        if (Math.abs(p.x - target.x) < 34 && Math.abs(p.y - (target.y - (crouching ? 30 : 65))) < (crouching ? 25 : 50)) {
            damage(s, p.owner, { ...getMove(s.fighters[p.owner],'bolt'), damage: p.damage }, 'bolt', true);
            p.life = 0;
        }
    }
    s.projectiles = s.projectiles.filter(p => p.life > 0 && p.x > -40 && p.x < WIDTH + 40 && p.y > -120 && p.y < FLOOR + 25);
    for (let i = 0; i < 2; i++) {
        const target = s.fighters[1 - i];
        if (target.stun === 0)
            finishCombo(s, s.fighters[i]);
    }
    if (a.hp <= 0 || b.hp <= 0 || s.clock <= 0) {
        finishCombo(s, a);
        finishCombo(s, b);
        s.winner = a.hp === b.hp ? 2 : a.hp > b.hp ? 0 : 1;
        s.throwState=null;
    }
    if (s.mode !== 'cpu' && b.stun === 0 && a.combo === 0 && s.frame % 90 === 0)
        b.hp = 1000;
}
