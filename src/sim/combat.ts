import { grantMeter } from './matchRules';
// State creation, effects, combos, throws, damage and move selection.
import { A, FLOOR, GRAVITY, WIDTH } from './constants';
import { fighterPartner, AttackAim, COMBAT_STYLES, FighterId, MOVES, Mode, Move, MoveId, PARTNER_ATTACKS, PLAYABLE_FIGHTERS, PlayableFighterId, ROSTER, THROW_CATCH_FRAMES, THROW_HOLD_FRAMES, THROW_RECOVERY_FRAMES, ThrowDirection, bodySpread, fighterWall, getThrowGrip, isHorizontalSpit, isPairedFighter, partnerContactIndex } from './roster';
import { CombatState, Effect, Fighter } from './types';
import { createCpuMemory } from './cpuState';
import { BALANCE_KITS } from './roster';
import { specialContactDamage } from './balance';
import { HITBOX_DATA } from './geometry';
export const THROW_BREAK_FRAMES = 7;
export const makeFighter = (id: FighterId, x: number, facing: number): Fighter => ({ id, x, y: FLOOR, vx: 0, vy: 0, facing, hp: 1000, slow:0, reaction:null, throwInvuln:0, strikeInvuln:0, stun: 0, blockstun: 0, move: null, prev: 0, input: 0, buffer: 0, bufferLife: 0, bufferInput:0, usedMoves:{}, dashCanceled:false, jumpBuffer: 0, jumpDelay: 0, airJumps: 0, dash: 0, dashLock: 0, dashBuffer:0, dashDirection:facing, runDirection:0, riseDelay:0, pips: 0, combo: 0, comboDamage: 0, lastFinisher: false, chargeEligible: true, best: 0, flash: 0 });
export function createState(id: PlayableFighterId = 'rivet', mode: Mode = 'cpu', opponent?: PlayableFighterId): CombatState { if (!PLAYABLE_FIGHTERS.includes(id) || (opponent && !PLAYABLE_FIGHTERS.includes(opponent)))
    throw new Error('Unknown roster selection.'); return { cpu:[createCpuMemory(104729),createCpuMemory(130363)], throwState:null, frame: 0, fighters: [makeFighter(id, 380, 1), makeFighter(opponent ?? (id === 'rivet' ? 'vela' : 'rivet'), 900, -1)], projectiles: [], effects: [], freeze: 0, mode, winner: null, notice: 'LIGHT → MEDIUM → FINISHER', noticeLife: 220 }; }
export const grounded = (f: Fighter) => f.y >= FLOOR;
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export function effect(s: CombatState, x: number, y: number, kind: Effect['kind'], color: string) { const life = kind === 'charge' ? 45 : kind === 'special' ? 28 : 16; s.effects.push({ x, y, kind, color, life, max: life }); }
export function finishCombo(s: CombatState, attacker: Fighter) {
    if (!attacker.combo)
        return;
    attacker.best = Math.max(attacker.best, attacker.combo);
    if (attacker.combo >= 3 && attacker.lastFinisher && attacker.chargeEligible) {
        grantMeter(s, s.fighters.indexOf(attacker), 10000);
        effect(s, attacker.x, attacker.y - 130, 'charge', ROSTER[attacker.id].color);
        // Against the CPU only the human (slot 0) gets coaching notices; in local versus both do.
        const slot = s.fighters.indexOf(attacker);
        if (slot === 0 || s.mode === 'versus') {
            s.notice = (s.mode === 'versus' ? `P${slot + 1} ` : '') + (attacker.pips === 3 ? 'RELAY READY — TEAM SPECIAL' : 'CLEAN FINISH  /  +1 RELAY CHARGE');
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
/** Cancel an interrupted catch without teleporting the victim or awarding damage. */
export function interruptThrow(s:CombatState):void {
    const hold=s.throwState;if(!hold)return;
    const a=s.fighters[hold.attacker],b=s.fighters[hold.victim];
    if(hold.phase==='hold'){
        b.vx=0;b.vy=grounded(b)?0:2;b.stun=Math.max(b.stun,8);b.throwInvuln=20;
        b.reaction={kind:'recoil',phase:'flight',t:0,direction:hold.facing};
        b.buffer=0;b.bufferLife=0;b.jumpBuffer=0;b.dashBuffer=0;
    }
    if(a.move?.id==='grab')a.move=null;
    s.throwState=null;
}
/** A fresh grab press during the first seven catch ticks breaks without damage. */
export function breakThrow(s: CombatState, slot: number): boolean {
    const hold = s.throwState;
    if (!hold || hold.phase !== 'hold' || hold.victim !== slot || hold.t >= THROW_BREAK_FRAMES) return false;
    const a = s.fighters[hold.attacker], b = s.fighters[hold.victim];
    for (const f of [a, b]) {
        f.move = null; f.stun = 10; f.blockstun = 0; f.dash = 0;
        f.buffer = 0; f.bufferLife = 0; f.jumpBuffer = 0; f.dashBuffer = 0;
        f.throwInvuln = Math.max(f.throwInvuln, 20); f.reaction = null;
    }
    a.vx = -hold.facing * 7; b.vx = hold.facing * 7;
    s.throwState = null;
    s.freeze = Math.max(s.freeze, 3);
    effect(s, (a.x + b.x) / 2, Math.min(a.y, b.y) - 70, 'block', '#85c8ff');
    s.notice = 'THROW BREAK'; s.noticeLife = 60;
    return true;
}
export function positionHeldVictim(s:CombatState):void {
    const hold=s.throwState;if(!hold||hold.phase!=='hold')return;
    const a=s.fighters[hold.attacker],b=s.fighters[hold.victim];
    const t=Math.min(1,hold.t/THROW_CATCH_FRAMES),ease=t*t*(3-2*t);
    // The pair's endpoints are already bounded together. Clamp the interpolated
    // values too: fractional authored grips can round a wall endpoint below
    // its bound by one floating-point unit (for example 79.99999999999999).
    a.x=clamp(hold.startAttackerX+(hold.gripAttackerX-hold.startAttackerX)*ease,fighterWall(a.id),WIDTH-fighterWall(a.id));
    b.x=clamp(hold.startVictimX+(hold.gripVictimX-hold.startVictimX)*ease,fighterWall(b.id),WIDTH-fighterWall(b.id));
    b.y=hold.startVictimY+(hold.gripVictimY-hold.startVictimY)*ease;
    a.facing=hold.facing;b.facing=-hold.facing;b.vx=0;b.vy=0;b.stun=1;
}
export function beginThrow(s:CombatState,index:number):void {
    const a=s.fighters[index],b=s.fighters[1-index];
    if(s.throwState||a.stun||a.blockstun||!a.move||a.move.id!=='grab'||!grounded(a)||!grounded(b)||b.stun||b.blockstun||b.throwInvuln||a.hp<=0||b.hp<=0)return;
    const hand=getThrowGrip(a,'hand'),torso=getThrowGrip({id:b.id,facing:-a.facing},'torso');
    const gap=hand[0]+torso[0];
    // Clamp the pair as a unit. Four catch frames settle into the authored grip;
    // the victim is never independently squashed into the holder at a corner.
    const aw=fighterWall(a.id),bw=fighterWall(b.id);
    const ax=clamp(a.x,a.facing===-1?Math.max(aw,bw+gap):aw,a.facing===1?Math.min(WIDTH-aw,WIDTH-bw-gap):WIDTH-aw);
    s.throwState={attacker:index,victim:1-index,phase:'hold',t:0,direction:a.move.throwDirection??'forward',facing:a.facing,
        startAttackerX:a.x,startVictimX:b.x,startVictimY:b.y,
        gripAttackerX:ax,gripVictimX:ax+a.facing*gap,gripVictimY:Math.min(FLOOR,a.y+hand[1]-torso[1])};
    a.vx=0;a.vy=0;a.runDirection=0;b.runDirection=0;a.move.hit=true;a.move.connected=false;
    b.move=null;b.dash=0;b.blockstun=0;b.reaction=null;
    for(const f of [a,b]){f.buffer=0;f.bufferLife=0;f.jumpBuffer=0;f.jumpDelay=0;f.dashBuffer=0;}
    positionHeldVictim(s);
}
export function updateThrow(s:CombatState):void {
    const hold=s.throwState;if(!hold)return;
    const a=s.fighters[hold.attacker],b=s.fighters[hold.victim];
    if(a.hp<=0||(hold.phase==='hold'&&b.hp<=0)||a.stun||a.blockstun){interruptThrow(s);return;}
    hold.t++;
    if(hold.phase==='hold'){
        positionHeldVictim(s);
        if(hold.t===THROW_CATCH_FRAMES){effect(s,b.x,b.y-65,'block',ROSTER[a.id].color);s.freeze=Math.max(s.freeze,3);}
        if(hold.t>=THROW_HOLD_FRAMES){
            hold.phase='release';hold.t=0;
            const direction=hold.direction==='back'?-hold.facing:hold.facing;
            a.facing=direction;
            damage(s,hold.attacker,getMove(a,'grab'),'grab');
            // Release exactly where the catch ended. Back throws travel over
            // the shoulder instead of teleporting to the other side.
            b.vx=hold.direction==='back'?0:direction*(hold.direction==='up'?3:hold.direction==='down'?6:14);
            b.vy=hold.direction==='up'?-18:hold.direction==='down'?12:hold.direction==='back'?-22:-8;
            b.y=Math.min(b.y,FLOOR-1);
            b.stun=35;b.reaction={kind:'knockdown',phase:'flight',t:0,direction};
            if(a.move)a.move.t=MOVES.grab.startup+MOVES.grab.active;
        }
    }else if(hold.t>=THROW_RECOVERY_FRAMES){
        if(a.move?.id==='grab')a.move=null;
        s.throwState=null;
    }
}
export function throwDirection(input:number,facing:number):ThrowDirection {
    const vertical=((input&A.up)?1:0)-((input&A.down)?1:0);
    if(vertical)return vertical>0?'up':'down';
    const horizontal=((input&A.right)?1:0)-((input&A.left)?1:0);
    return horizontal*facing<0?'back':'forward';
}
export const isDown = (f:Fighter) => !!f.reaction && f.reaction.phase!=='flight';
export function damage(s: CombatState, index: number, m: Move, kind: MoveId, projectile = false): boolean {
    const a = s.fighters[index], b = s.fighters[1 - index];
    if (s.matchDepth && s.matchDepth.juggles[1-index] >= 8 && !grounded(b)) return false;
    if (b.hp <= 0 || (kind !== 'grab' && b.strikeInvuln > 0) || (kind!=='special'&&isDown(b)))
        return false;
    const hold=s.throwState;
    // A held victim cannot take incidental projectile damage; only release hits.
    if(hold?.phase==='hold' && hold.victim===1-index && kind!=='grab')return false;
    const heldAttacker=!!hold && hold.attacker===1-index;
    const back = b.facing === 1 ? A.left : A.right;
    const guarding = !heldAttacker && kind !== 'grab' && b.stun === 0 && !b.move && b.dash === 0 && (b.input & back) !== 0 && (!m.low || (b.input & A.down) !== 0) && (!m.air || (b.input & A.down) === 0);
    if (guarding) {
        const justDefend = !!s.matchDepth && s.frame - s.matchDepth.backPressed[1-index] <= 3;
        const normalBlockstun = m.blockstun ?? HITBOX_DATA.moves[kind].blockstun;
        b.blockstun = justDefend ? Math.ceil(normalBlockstun / 2) : normalBlockstun;
        b.vx = a.facing * m.push * (m.blockPush ?? HITBOX_DATA.moves[kind].blockPush);
        const chip = Math.round(m.damage * (m.chip ?? HITBOX_DATA.moves[kind].chip));
        const chipHpBefore = b.hp;
        if (!(s.godMode && index === 1)) b.hp = Math.max(s.chipKO ? 0 : 1, b.hp - chip);
        if (s.matchDepth) grantMeter(s, 1-index, (justDefend ? 800 : 300) + (chipHpBefore - b.hp) * 15);
        effect(s, b.x, b.y - 65, 'block', justDefend ? '#fff3ad' : '#85c8ff');
        s.freeze = Math.max(s.freeze, 3);
        return false;
    }
    if(heldAttacker)interruptThrow(s);
    const counterHit = !!s.matchDepth && !!b.move && b.move.t < getMove(b, b.move.id).startup;
    const scaling = Math.max(.45, 1 - a.combo * .08), amount = Math.round(m.damage * scaling * (counterHit ? 1.25 : 1));
    const beforeHp = b.hp;
    b.hp = Math.max(0, b.hp - (s.godMode && index === 1 ? 0 : amount));
    if (s.matchDepth) {
        grantMeter(s, 1-index, (beforeHp - b.hp) * 15);
        if (!grounded(b)) s.matchDepth.juggles[1-index]++;
    }
    b.stun = m.stun + (counterHit ? 6 : 0);
    b.blockstun = 0;
    b.move = null;
    b.dash = 0;
    b.runDirection = 0;
    b.riseDelay = 0;
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
    if(kind==='special'&&PARTNER_ATTACKS[fighterPartner(a)]?.kind==='frost')b.slow=90;
    const power=COMBAT_STYLES[a.id].power;
    if(kind==='special'||(projectile&&(a.id==='vamp'||a.id==='crapto'))){
      if(power==='slow')b.slow=90;
      if(power==='drain'&&a.hp>0)a.hp=Math.min(1000,a.hp+Math.round(amount*.2));
      if(kind==='special'&&power==='pull'&&a.move?.wave===COMBAT_STYLES[a.id].specialFrames.length-1)b.vx=a.facing*18;
      if(kind==='special'&&power==='slam'&&a.move?.wave===COMBAT_STYLES[a.id].specialFrames.length-1)b.vy=16;
    }
    const finalSpecial=kind==='special' && a.move?.wave===COMBAT_STYLES[a.id].specialFrames.length-1;
    const juggleEnd=!!s.matchDepth && s.matchDepth.juggles[1-index]>=8;
    if(juggleEnd){b.vy=10;b.stun=Math.max(b.stun,20);}
    const hard=juggleEnd||!!m.finisher||finalSpecial||b.hp===0||b.reaction?.kind==='knockdown';
    if(hard && grounded(b) && !m.launch){
        b.y=FLOOR-1;b.vy=kind==='sweep'?-5:kind==='airHeavy'?6:-8;
    }
    b.reaction={kind:hard?'knockdown':!grounded(b)?'launch':'recoil',phase:'flight',t:0,direction:a.facing};
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
        a.move.hitConfirmed = true;
    }
    effect(s, b.x - a.facing * 18, b.y - 65, kind === 'special' ? 'special' : 'hit', counterHit ? '#ff8844' : ROSTER[a.id].color);
    const hitstop = finalSpecial ? 12 : kind === 'heavy' || kind === 'airHeavy' || kind === 'sweep' ? 9 : kind === 'medium' || kind === 'airMedium' ? 6 : 4;
    s.freeze = Math.max(s.freeze, hitstop);
    return true;
}
export function chooseMove(f: Fighter, buttons: number, directions=f.input): MoveId | null {
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
 const balanced=BALANCE_KITS[f.id];
 let m:Move={...balanced.moves[id]};
 if(id==='special'){
  const partner=PARTNER_ATTACKS[fighterPartner(f)];
  const beat=partnerContactIndex(f.move?.id==='special'?f.move.t:0,style.specialFrames);
  if(partner)m={...m,launch:0,low:false,...partner.hits[beat%partner.hits.length]};
  m.damage=specialContactDamage(balanced.template.specialDamage,style.specialFrames.length,beat);
 }
 const aim = f.move?.id === id ? f.move.aim : undefined;
 if(!m.projectile && id !== 'special' && id !== 'grab'){
   if(aim==='upForward')m={...m,range:155,stun:Math.max(m.stun,32),launch:10};
   if(aim==='up')m={...m,range:95,stun:Math.max(m.stun,32),launch:14};
   if(aim==='down' && grounded(f))m={...m,low:true};
   if(!grounded(f))m={...m,air:true};
 }
 // Melee originates at the front member. The shared root stays between both.
 if(isPairedFighter(f.id)&&!m.projectile&&id!=='special')m.range+=bodySpread(f.id);
 return {...m, startup:Math.max(3,m.startup), active:Math.max(2,m.active), recovery:Math.max(6,m.recovery), blockstun:HITBOX_DATA.moves[id].blockstun, blockPush:HITBOX_DATA.moves[id].blockPush, chip:HITBOX_DATA.moves[id].chip};
}
export function act(s: CombatState, f: Fighter) {
    if (f.hp<=0 || s.fighters.some(other=>other.hp<=0) || f.stun || f.blockstun || (s.throwState && (s.fighters[s.throwState.attacker]===f || (s.throwState.phase==='hold'&&s.fighters[s.throwState.victim]===f))))
        return;
    const just = f.input & ~f.prev;
    // Up + organic spit is a jump-and-fire input, not a grounded aiming chord.
    const chordAttacks=A.light|A.medium|A.heavy|A.grab|(isHorizontalSpit(f.id)?0:A.bolt);
    const directionalChord = (f.input & A.up) && (just & chordAttacks);
    if (directionalChord) f.jumpBuffer = 0;
    if (f.jumpBuffer > 0 && f.jumpDelay === 0) {
        if (grounded(f) && f.dash <= 8 && (!f.move || ((f.move.id === 'launcher' || f.move.id === 'medium') && f.move.hitConfirmed))) {
            const chasing = f.move?.id === 'launcher';
            f.vy = chasing ? -17 : ROSTER[f.id].jump * -1;
            f.y -= 1;
            f.jumpBuffer = 0;
            f.dash = 0;
            f.dashBuffer = 0;
            f.runDirection = 0;
            f.move = null;
            if (chasing)
                f.vx = f.facing * 3;
        }
    }
    // Resolve a last-instant landing press as a grounded move after physics.
    const landingThisFrame = !grounded(f) && f.vy >= 0 && f.y + f.vy + GRAVITY >= FLOOR;
    // Keep the spit buffered through the normal two-frame jump chord window.
    const waitingForSpitJump = grounded(f) && f.jumpBuffer>0 && isHorizontalSpit(f.id) && chooseMove(f,f.buffer,f.bufferInput)==='bolt' && (f.bufferInput&A.up);
    if (f.bufferLife > 0 && !landingThisFrame && !waitingForSpitJump) {
        const id = chooseMove(f, f.buffer, f.bufferInput);
        if (id) {
            const m = getMove(f, id);
            const used=f.usedMoves[id]??0, limit=id==='light'||id==='airLight'?2:1;
            const withinRoute=f.combo===0||used<limit;
            const linkLight=f.move?.id==='light' && (id==='light'||id==='low');
            const canCancel = f.move && f.move.connected && (m.rank > MOVES[f.move.id].rank || linkLight) && f.move.id !== 'special' && id !== 'grab';
            // A two-emitter cast is one volley. Another cast must wait until
            // every shot from the previous volley has left the screen.
            const ownShot=id==='bolt' && s.projectiles.some(p=>p.owner===s.fighters.indexOf(f)&&p.life>0);
            if (!ownShot && withinRoute && (!f.move || canCancel) && f.dash <= 8 && (id !== 'grab' || grounded(f)) && (id !== 'special' || f.pips === 3)) {
                if (id === 'special') {
                    f.pips = 0;
                    f.chargeEligible = false;
                    s.notice = ROSTER[f.id].special + ' / TEAM RELAY';
                    s.noticeLife = 100;
                }
                const forward = f.facing===1?A.right:A.left;
                const directions=f.bufferInput;
                const aim:AttackAim = directions&A.up ? (directions&forward?'upForward':'up') : directions&A.down?'down':'level';
                const spit=id==='bolt' && (isHorizontalSpit(f.id)||COMBAT_STYLES[f.id].projectile.horizontal===true);
                const vertical = spit?0:directions&A.up?-1:directions&A.down?1:0;
                const horizontal = vertical ? ((directions&A.left)?-1:(directions&A.right)?1:0) : f.facing;
                f.dash = 0;
                f.runDirection = 0;
                // The selected attack wins a simultaneous dash/attack chord.
                f.dashBuffer = 0;
                f.move = { id, t: 0, hit: false, connected: false, wave: -1, aim: spit?(grounded(f)&&(directions&A.down)&&!(directions&A.up)?'down':'level'):id==='launcher' && aim==='level'?'up':aim, shotX:horizontal,shotY:vertical, throwDirection:id==='grab'?throwDirection(directions,f.facing):undefined };

                f.buffer = 0;
                f.bufferLife = 0;
            }
        }
    }
    if (f.dashBuffer>0 && f.dashLock===0 && f.move?.connected && f.combo>0 && !f.dashCanceled && f.move.id!=='special') { f.move=null; f.dashCanceled=true; }
    if (!f.move && !f.jumpBuffer && f.dashBuffer>0 && f.dashLock === 0) {
        f.dash = 11;
        f.dashBuffer=0;
        f.dashLock = 20;
        f.runDirection = f.dashDirection;
        f.vx = f.dashDirection * (f.id === 'vela' ? 13 : 15);
        effect(s, f.x, f.y - 50, 'dash', ROSTER[f.id].color);
    }
}
