// Numeric combat templates. Rendering metadata and source artwork are never inputs.
import type { Move, MoveId } from './roster';
import defense from './data/hitboxes.json';

export type Archetype = 'Pressure' | 'Footwork' | 'Zoning' | 'Counter' | 'Brawler' | 'Weapon' | 'Paired' | 'Hover';
export interface BalanceTemplate {
    speed:number; jump:number;
    lightRange:number; lightDamage:number; lightStartup:number;
    heavyRange:number; heavyDamage:number; heavyStartup:number;
    boltStartup:number; boltRecovery:number; projectileSpeed:number;
    specialRange:number; specialStartup:number; specialEnd:number; specialDamage:number;
}
const base:BalanceTemplate = {speed:5.6,jump:15.48,lightRange:84,lightDamage:38,lightStartup:5,heavyRange:135,heavyDamage:95,heavyStartup:11,boltStartup:18,boltRecovery:20,projectileSpeed:10,specialRange:430,specialStartup:14,specialEnd:46,specialDamage:285};
export const BALANCE_TEMPLATES:Readonly<Record<Archetype,Readonly<BalanceTemplate>>> = {
    Pressure:{...base,specialRange:360,specialStartup:12,specialEnd:42},
    Footwork:{...base,speed:6.2,boltRecovery:18,lightRange:86,lightDamage:34,lightStartup:6,heavyRange:140,heavyDamage:93,specialRange:400},
    Zoning:{...base,speed:5.4,jump:15.1,lightRange:94,lightDamage:36,heavyDamage:91,boltStartup:20,boltRecovery:21,projectileSpeed:12,specialRange:750,specialStartup:18,specialEnd:54},
    Counter:{...base,lightRange:86,heavyRange:145,heavyDamage:100,heavyStartup:12,specialRange:450,specialStartup:15,specialEnd:48},
    Brawler:{...base,speed:5.2,lightRange:86,lightDamage:40,heavyDamage:105,heavyStartup:13,boltStartup:22,boltRecovery:22,projectileSpeed:9,specialRange:310,specialStartup:10,specialEnd:38},
    Weapon:{...base,speed:5.3,lightRange:88,heavyRange:175,heavyStartup:14,boltStartup:20,boltRecovery:22,specialRange:500,specialStartup:16,specialEnd:50},
    Paired:{...base,lightRange:86},
    Hover:{...base,speed:5.4,jump:16,lightRange:86,heavyRange:145,heavyDamage:92,heavyStartup:12,boltStartup:20,boltRecovery:21,specialRange:520,specialStartup:16,specialEnd:50},
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

type RoleDelta = Partial<Pick<BalanceTemplate,'lightRange'|'heavyRange'|'heavyDamage'|'heavyStartup'>>;
type ProjectileDelta = Partial<Record<'boltDamage'|'boltStartup'|'boltRecovery',number>>;
export type IdentityDelta = RoleDelta & ProjectileDelta;
// At most two small, role-based tradeoffs. No per-fighter or list-index bonuses.
export function identityDeltas(role:string):RoleDelta {
    if(role==='STAFF')return {heavyRange:.04,heavyDamage:-.02};
    if(role==='HALBERD')return {heavyRange:.08,heavyDamage:-.04};
    if(role==='SWORD')return {heavyStartup:-.07,heavyDamage:-.02};
    if(role==='SKIRMISH')return {lightRange:.02,heavyDamage:-.02};
    return {};
}
export interface ProjectileProfileCost {
    kind:'beam'; base:{damage:number;startup:number;recovery:number}; applied:{damage:number;startup:number;recovery:number};
    templateScore:number; beforeScore:number; afterScore:number; feasibleCandidates:number;
}
export interface BalancedKit { archetype:Archetype; template:BalanceTemplate; deltas:IdentityDelta; moves:Record<MoveId,Move>; projectileSpeed:number; specialFrames:number[]; projectileProfileCost?:ProjectileProfileCost; }

/** Exploratory weights motivated by neutral-mobility and light-spacing measurements. */
export const BUDGET_WEIGHTS = {light:.65,heavy:.25,projectile:.10,neutralSpeed:5.6,neutralReach:84,safetyFrames:100} as const;
export function budgetScore(moves:Record<MoveId,Move>,projectileSpeed:number,mobility:Pick<BalanceTemplate,'speed'|'jump'>=base):number {
    const melee=(id:'light'|'heavy')=>{
        const m=moves[id],advantage=(m.blockstun??defense.moves[id].blockstun)-(m.active+m.recovery+1);
        return m.damage/(m.startup+m.active+m.recovery)*(1+m.range/160)*(1+advantage/BUDGET_WEIGHTS.safetyFrames);
    };
    const shot=moves.bolt.damage*projectileSpeed/(moves.bolt.startup+moves.bolt.recovery);
    const speed=mobility.speed/BUDGET_WEIGHTS.neutralSpeed,reach=moves.light.range/BUDGET_WEIGHTS.neutralReach;
    return (BUDGET_WEIGHTS.light*melee('light')+BUDGET_WEIGHTS.heavy*melee('heavy')+BUDGET_WEIGHTS.projectile*shot)*speed*speed*reach;
}

/** Nominal total if contacts stay in one combo; real-step tests also cover combo resets. */
export function specialContactDamage(total:number,count:number,contact:number):number {
    const per=Math.floor(total/count),remainder=total-per*count;
    const actual=per+(contact<remainder?1:0);
    return Math.round(actual/Math.max(.45,1-contact*.08));
}

export function buildBalancedKit(role:string,paired:boolean,contacts:number,moves:Record<MoveId,Move>,applyIdentity=true,mechanics:{beam?:boolean}={}):BalancedKit {
    const archetype=archetypeFor(role,paired),template={...BALANCE_TEMPLATES[archetype]},deltas:IdentityDelta=applyIdentity?identityDeltas(role):{};
    const t={...template};
    for(const key of Object.keys(deltas) as (keyof RoleDelta)[])t[key]=template[key]*(1+deltas[key]!);
    const result=Object.fromEntries(Object.entries(moves).map(([id,m])=>[id,{...m}])) as Record<MoveId,Move>;
    result.light={...result.light,range:Math.round(t.lightRange),damage:Math.round(t.lightDamage),startup:t.lightStartup};
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
    let projectileProfileCost:ProjectileProfileCost|undefined;
    if(mechanics.beam){
        // This is a bounded exploratory fee for an existing mechanic, not a
        // premium added to the budget. Base damage is already frozen from the
        // untaxed template commitment above; longer taxed commitment cannot
        // automatically increase that damage and undo the fee.
        const reference=buildBalancedKit(role,paired,contacts,moves,false);
        const templateScore=budgetScore(reference.moves,reference.projectileSpeed,reference.template);
        const beforeScore=budgetScore(result,t.projectileSpeed,template),baseBolt={...result.bolt};
        const roleFields=Object.keys(deltas).length;
        let best:Move|undefined,bestScore=Infinity,bestDeltas:ProjectileDelta={},feasibleCandidates=0;
        for(let damage=Math.ceil(baseBolt.damage*.9);damage<=baseBolt.damage;damage++)
        for(let startup=baseBolt.startup;startup<=Math.floor(baseBolt.startup*1.1);startup++)
        for(let recovery=baseBolt.recovery;recovery<=Math.floor(baseBolt.recovery*1.1);recovery++){
            const cost:ProjectileDelta={};
            if(damage!==baseBolt.damage)cost.boltDamage=(damage-baseBolt.damage)/baseBolt.damage;
            if(startup!==baseBolt.startup)cost.boltStartup=(startup-baseBolt.startup)/baseBolt.startup;
            if(recovery!==baseBolt.recovery)cost.boltRecovery=(recovery-baseBolt.recovery)/baseBolt.recovery;
            if(roleFields+Object.keys(cost).length>3)continue;
            const candidate={...baseBolt,damage,startup,recovery};
            const score=budgetScore({...result,bolt:candidate},t.projectileSpeed,template);
            if(score<templateScore*.97||score>templateScore*1.03)continue;
            feasibleCandidates++;
            if(score<bestScore){best=candidate;bestScore=score;bestDeltas=cost;}
        }
        if(!best)throw new Error('Beam profile has no fee within the existing identity/budget bounds.');
        result.bolt=best;Object.assign(deltas,bestDeltas);
        projectileProfileCost={kind:'beam',base:{damage:baseBolt.damage,startup:baseBolt.startup,recovery:baseBolt.recovery},
            applied:{damage:best.damage,startup:best.startup,recovery:best.recovery},templateScore,beforeScore,afterScore:bestScore,feasibleCandidates};
    }
    return {archetype,template,deltas,moves:result,projectileSpeed:t.projectileSpeed,specialFrames,
        ...(projectileProfileCost?{projectileProfileCost}:{})};
}
