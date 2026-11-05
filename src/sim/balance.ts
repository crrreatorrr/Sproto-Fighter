// Numeric combat templates. Rendering metadata and source artwork are never inputs.
import type { Move, MoveId } from './roster';

export type Archetype = 'Pressure' | 'Footwork' | 'Zoning' | 'Counter' | 'Brawler' | 'Weapon' | 'Paired' | 'Hover';
export interface BalanceTemplate {
    speed:number; jump:number;
    lightRange:number; lightDamage:number;
    heavyRange:number; heavyDamage:number; heavyStartup:number;
    boltStartup:number; boltRecovery:number; projectileSpeed:number;
    specialRange:number; specialStartup:number; specialEnd:number; specialDamage:number;
}
const base:BalanceTemplate = {speed:5.06,jump:15.48,lightRange:84,lightDamage:38,heavyRange:135,heavyDamage:95,heavyStartup:11,boltStartup:18,boltRecovery:25,projectileSpeed:10,specialRange:430,specialStartup:14,specialEnd:46,specialDamage:285};
export const BALANCE_TEMPLATES:Readonly<Record<Archetype,Readonly<BalanceTemplate>>> = {
    Pressure:{...base,specialRange:360,specialStartup:12,specialEnd:42},
    Footwork:{...base,speed:5.55,lightRange:86,lightDamage:37,heavyRange:140,heavyDamage:93,specialRange:400},
    Zoning:{...base,speed:4.8,jump:15.1,lightRange:80,lightDamage:36,heavyDamage:91,boltStartup:20,boltRecovery:26,projectileSpeed:12,specialRange:750,specialStartup:18,specialEnd:54},
    Counter:{...base,lightRange:86,heavyRange:145,heavyDamage:100,heavyStartup:12,specialRange:450,specialStartup:15,specialEnd:48},
    Brawler:{...base,speed:4.9,lightRange:80,lightDamage:40,heavyDamage:105,heavyStartup:13,boltStartup:22,boltRecovery:27,projectileSpeed:9,specialRange:310,specialStartup:10,specialEnd:38},
    Weapon:{...base,speed:4.9,lightRange:88,heavyRange:175,heavyStartup:14,boltStartup:20,boltRecovery:26,specialRange:500,specialStartup:16,specialEnd:50},
    Paired:{...base,lightRange:82},
    Hover:{...base,speed:4.8,jump:16,lightRange:86,heavyRange:145,heavyDamage:92,heavyStartup:12,boltStartup:20,boltRecovery:26,specialRange:520,specialStartup:16,specialEnd:50},
};

// Roles describe existing mechanics rather than installation order. Unknown
// future roles must be classified deliberately instead of silently inheriting a kit.
const ROLE_ARCHETYPES:Record<string,Archetype> = {};
for(const [archetype,roles] of Object.entries({
    Pressure:'RUSHDOWN PRESSURE UPPERCUT MOMENTUM BARE_HANDS BURST POUNCE MC SHOUT QUIRK CHEER GRIN ORIGIN',
    Footwork:'FOOTWORK SKIRMISH FORMAL POISE APLOMB STEADY DAPPER SLY SWITCH QUICK CORSAIR GOLD_COLLAR SHADOW_POISE',
    Zoning:'ZONING LASER LASER_CAPTAIN SMOKE_SHOT BARRAGE RETURN RICOCHET ACID MELANCHOLY THROWER SPITTER STREAM BRIGHT_EYES PRISM ORANGE_AURA TWIN_EMITTER DOUBLE_SHOT',
    Counter:'COUNTER PSYCHIC GRAVITY RECOVERY COIL PHASE DRY_WIT RESOLVE REGAL RADIANT CAPED TRICK FOUR_EYES DESIGN GOLD RED_EYES CROWN_TRICK',
    Brawler:'BRAWLER GRAPPLER POWER BULWARK HEAVY GROUND ROUND PUMPKIN',
    Weapon:'STAFF HALBERD SWORD RETAIN LONG_REACH CHAIN',
    Paired:'DUET', Hover:'HOVER',
}))for(const role of roles.split(' '))ROLE_ARCHETYPES[role.replaceAll('_',' ')]=archetype as Archetype;

export function archetypeFor(role:string,paired=false):Archetype {
    if(paired)return 'Paired';
    const result=ROLE_ARCHETYPES[role];
    if(!result)throw new Error('Unclassified combat role: '+role);
    return result;
}

export type IdentityDelta = Partial<Pick<BalanceTemplate,'lightRange'|'heavyRange'|'heavyDamage'|'heavyStartup'>>;
// At most two small, role-based tradeoffs. No per-fighter or list-index bonuses.
export function identityDeltas(role:string):IdentityDelta {
    if(role==='STAFF')return {heavyRange:.04,heavyDamage:-.02};
    if(role==='HALBERD')return {heavyRange:.08,heavyDamage:-.04};
    if(role==='SWORD')return {heavyStartup:-.07,heavyDamage:-.02};
    if(role==='SKIRMISH')return {lightRange:.02,heavyDamage:-.02};
    return {};
}
export interface BalancedKit { archetype:Archetype; template:BalanceTemplate; deltas:IdentityDelta; moves:Record<MoveId,Move>; projectileSpeed:number; specialFrames:number[]; }

/** Fixed weights: commitment and safety/reach for melee, speed/commitment for shots. */
export function budgetScore(moves:Record<MoveId,Move>,projectileSpeed:number):number {
    const melee=(m:Move)=>m.damage/(m.startup+m.active+m.recovery)*(1+m.range/160)*(1+(15-m.recovery)/100);
    const shot=moves.bolt.damage*projectileSpeed/(moves.bolt.startup+moves.bolt.recovery);
    return .4*melee(moves.light)+.35*melee(moves.heavy)+.18*shot;
}

/** Nominal total if contacts stay in one combo; real-step tests also cover combo resets. */
export function specialContactDamage(total:number,count:number,contact:number):number {
    const per=Math.floor(total/count),remainder=total-per*count;
    const actual=per+(contact<remainder?1:0);
    return Math.round(actual/Math.max(.45,1-contact*.08));
}

export function buildBalancedKit(role:string,paired:boolean,contacts:number,moves:Record<MoveId,Move>,applyIdentity=true):BalancedKit {
    const archetype=archetypeFor(role,paired),template={...BALANCE_TEMPLATES[archetype]},deltas=applyIdentity?identityDeltas(role):{};
    const t={...template};
    for(const key of Object.keys(deltas) as (keyof IdentityDelta)[])t[key]=template[key]*(1+deltas[key]!);
    const result=Object.fromEntries(Object.entries(moves).map(([id,m])=>[id,{...m}])) as Record<MoveId,Move>;
    result.light={...result.light,range:Math.round(t.lightRange),damage:Math.round(t.lightDamage)};
    result.heavy={...result.heavy,range:Math.round(t.heavyRange),damage:Math.round(t.heavyDamage),startup:Math.round(t.heavyStartup)};
    if(archetype==='Weapon')result.sweep={...result.sweep,range:Math.round(t.heavyRange),startup:Math.max(12,Math.round(t.heavyStartup)-1)};
    // Aerial finishers retain their shorter commitment and moderate reach.
    result.airHeavy={...result.airHeavy,damage:Math.round(t.heavyDamage*.95),range:Math.round(t.heavyRange)};
    // Faster projectiles pay for their threat through lower damage. Trajectory,
    // release geometry and visual identity stay with the authored projectile.
    result.bolt={...result.bolt,startup:t.boltStartup,recovery:t.boltRecovery,active:2,damage:Math.round(54*(t.boltStartup+t.boltRecovery)/43*10/t.projectileSpeed)};
    const specialFrames=Array.from({length:contacts},(_,i)=>Math.round(t.specialStartup+(t.specialEnd-t.specialStartup)*i/Math.max(1,contacts-1)));
    result.special={...result.special,startup:specialFrames[0],active:specialFrames.at(-1)!-specialFrames[0]+1,recovery:30,range:t.specialRange,damage:specialContactDamage(t.specialDamage,contacts,0)};
    for(const m of Object.values(result)){m.startup=Math.max(3,m.startup);m.active=Math.max(2,m.active);m.recovery=Math.max(6,m.recovery);}
    return {archetype,template,deltas,moves:result,projectileSpeed:t.projectileSpeed,specialFrames};
}
