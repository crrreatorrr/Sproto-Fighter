import { matchGravity, matchInput, nextMatchRound, tickMatchDepth } from './matchRules';
// Deterministic math, state checksum and the per-frame step.
import { act, beginThrow, breakThrow, canGuard, clamp, damage, effect, finishCombo, getMove, grounded, isDown, updateThrow } from './combat';
import { clashProjectiles, getHitbox, getHurtbox, getProjectileHitbox, rectanglesOverlap } from './geometry';
import { A, FLOOR, GRAVITY, WIDTH } from './constants';
import { BACK_THROW_LIFT_FRAMES, COMBAT_STYLES, GETUP_FRAMES, KNOCKDOWN_FRAMES, MOVES, Move, MoveId, ROSTER, THROW_RECOVERY_FRAMES, bodySpread, fighterWall, isCrouchingSpit, isHorizontalSpit, isPairedFighter, isPracticeMode, shotOrigin } from './roster';
import { CombatState, Fighter } from './types';
import { advanceCpuState } from './cpu';
/**
 * Deterministic math for the simulation. Online play needs every browser to
 * compute identical states, and ECMAScript lets engines approximate Math.sin,
 * Math.hypot and similar functions differently. Basic arithmetic and Math.sqrt
 * are exact everywhere, so the simulation uses only those plus these helpers.
 */
// sin(age * 0.3) for projectile age 0..255, exactly as V8 computed it, so
// Chromium behaviour is unchanged and other engines now match it.
export const WAVE_SIN:readonly number[]=[0,0.29552020666133955,0.5646424733950354,0.7833269096274833,0.9320390859672263,0.9974949866040544,0.9738476308781953,0.8632093666488737,0.675463180551151,0.42737988023383017,0.1411200080598672,-0.1577456941432482,-0.4425204432948521,-0.6877661591839738,-0.8715757724135882,-0.977530117665097,-0.9961646088358407,-0.9258146823277325,-0.7727644875559877,-0.5506855425976376,-0.27941549819892586,0.016813900484349713,0.31154136351337786,0.5784397643881994,0.7936678638491527,0.9379999767747389,0.998543345374605,0.9698898108450863,0.8545989080882805,0.6629692300821833,0.4121184852417566,0.12445442350706347,-0.17432678122297965,-0.4575358937753214,-0.6998746875935423,-0.87969575997167,-0.9809362300664912,-0.9945525882039892,-0.9193285256646757,-0.7619835839190333,-0.5365729180004349,-0.26323179136580266,0.033623047221136695,0.32747443913769303,0.592073514707223,0.803784426551621,0.9436956694441042,0.9993093887479176,0.965657776549278,0.8457468311429343,0.6502878401571168,0.39674057313061367,0.10775365229944406,-0.19085858137418765,-0.47242198639846616,-0.711785342369123,-0.8875670335815046,-0.9840650050816427,-0.9926593804706332,-0.9125824497911845,-0.7509872467716762,-0.5223085896267315,-0.24697366173662433,0.05042268780681122,0.3433149288198954,0.605539869719601,0.8136737375071054,0.9491245536478935,0.9997929001426692,0.9611527245021165,0.8366556385360561,0.6374225961502389,0.38125049165494346,0.09102241619984787,-0.20733642060675878,-0.4871745124605095,-0.723494756044245,-0.8951873678196802,-0.9869155581206488,-0.9904855208971565,-0.9055783620066238,-0.7397785850778934,-0.5078965903906252,-0.23064570592739567,0.06720807252547492,0.3590583540221683,0.6188350221200393,0.8233330007380795,0.9542850944926969,0.9999937428570207,0.956375928404503,0.8273279005953786,0.6243771354163942,0.36565262028262135,0.07426544558436131,-0.22375564018679642,-0.5017893010205711,-0.7349996180487752,-0.9025546082101854,-0.9894870832545352,-0.9880316240928618,-0.8983182425573563,-0.7283607678315959,-0.4933409949567783,-0.2142525402958877,0.08397445569174683,0.37470026364945874,0.631955213006885,0.8327594853077798,0.9591758329530784,0.9999118601072672,0.9513287387867827,0.8177662545264418,0.611155146262596,0.3499513689566688,0.057487478104924564,-0.24011159795377449,-0.516262220079927,-0.7462966756449163,-0.9096666718335252,-0.9917788534431158,-0.9852983838412038,-0.8908041440768614,-0.7167370231606575,-0.4786459185884212,-0.19779879963646227,0.10071709699250053,0.39023623530794616,0.6448967329448674,0.8419505260923011,0.9637953862840878,0.999547275043892,0.9460125826269081,0.8079734036669851,0.5977603669052606,0.33415117684842055,0.040693257349864856,-0.256399669633018,-0.5305891777502036,-0.7573827348468262,-0.9165215479156338,-0.9937902207405457,-0.9822865729036345,-0.8830381910054188,-0.7049106374142531,-0.46381551598382736,-0.1812891358696948,0.11743126282709573,0.40566187655533587,0.6576559230138641,0.8509035245341184,0.9681424484121893,0.9989000907450211,0.940428962947006,0.7979521167226351,0.5841965844132856,0.3182565111024882,0.023887531502738858,-0.27261525014307375,-0.5447661234103052,-0.7682546613236668,-0.9231172983963569,-0.9955206164785154,-0.9789970428011298,-0.8750225789894501,-0.6928849542336957,-0.4488539801017046,-0.1647282167271322,0.13411222764565714,0.42097282614276466,0.6702291758433747,0.8596159493767461,0.972215790304539,0.9979704901872812,0.9345794583884173,0.7877052269841179,0.5704676336373782,0.3022718655737269,0.007075051999930937,-0.28875375489773664,-0.5587890488516163,-0.7789093812857372,-0.929452058477416,-0.996969551427024,-0.9754307235734325,-0.8667595742607592,-0.6806633736071279,-0.43376554097568404,-0.14812072443163635,0.15075527528516208,0.43616475524782494,0.6826129366324043,0.868085337380418,0.9760142603164502,0.9967587361940657,0.9284657227653786,0.7772356315262264,0.5565773961257995,0.2862017595567536,-0.009739427812753455,-0.3048106211022167,-0.572653989411214,-0.7893438823535467,-0.9355240371496152,-0.9981366159327033,-0.9715886235161092,-0.8582515129958178,-0.6682493509082204,-0.41855446451842543,-0.13147135437354687,0.16735570030280691,0.45123336869842146,0.6948037041545341,0.8763092940185007,0.9795367845170094,0.9952651713612277,0.9220894845974522,0.7665462903887128,0.5425297990269695,0.2700507365081657,-0.026551154023966794,-0.32078130904314506,-0.5863570250928222,-0.7995552144094791,-0.9413315176992298,-0.999021480034635,-0.9674718288954816,-0.8495008006552434,-0.655646395919263,-0.40322505131547626,-0.11478481378318722,0.18390880930634296,0.46617440618717204,0.7067980317477921,0.8842854941544844,0.9827823669926928,0.9934902179602213,0.9154525466208107,0.7556402257394211,0.5283288139791364,0.25382336276203626,-0.04335537350085837,-0.3366613033721151,-0.5998942816750762,-0.8095404904318835,-0.9468728581933475,-0.9996238935576389,-0.9630815036415007,-0.8405099113037244,-0.6428580718388389,-0.38778163540943045,-0.09806582040002382,0.2004099222810683,0.48098364347588685,0.7185925282891343,0.8920116826993705];
/** Polynomial sine using only + - * / (only reached for ages beyond the table). */
export function deterministicSin(x:number):number{
    const TWO_PI=6.283185307179586,PI=3.141592653589793,HALF_PI=1.5707963267948966;
    x-=TWO_PI*Math.round(x/TWO_PI);
    if(x>HALF_PI)x=PI-x;else if(x<-HALF_PI)x=-PI-x;
    const x2=x*x;
    return x*(1+x2*(-1/6+x2*(1/120+x2*(-1/5040+x2*(1/362880+x2*(-1/39916800+x2*(1/6227020800)))))));
}
export const waveSin=(age:number)=>Number.isInteger(age)&&age>=0&&age<WAVE_SIN.length?WAVE_SIN[age]:deterministicSin(age*.3);
/**
 * 32-bit FNV-1a checksum of the complete simulation state. Two machines running
 * the same match compare these to detect a desync on the frame it happens.
 * JSON number formatting is fully specified, so the text is identical everywhere.
 */
export function hashState(s:CombatState):number{
    return hashText(JSON.stringify(s));
}
/** FNV-1a of a state's JSON text; hashText(saveState(s).text) === hashState(s). */
export function hashText(text:string):number{
    let h=0x811c9dc5;
    for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}
    return h>>>0;
}
/** Supply exactly one frame-indexed input pair per step. Replays need only initial config + these masks. */
export function step(s: CombatState, inputs: [
    number,
    number
]): void {
    if (s.winner !== null && !nextMatchRound(s))
        return;
    inputs = [matchInput(s, inputs[0]), matchInput(s, inputs[1])];
    if(s.godMode){s.fighters[0].hp=1000;s.fighters[0].pips=3;}
    const endingKO=s.fighters.some(f=>f.hp<=0);
    if(endingKO)inputs=[0,0];
    advanceCpuState(s);
    s.frame++;
    s.effects = s.effects.filter(e => --e.life > 0);
    if (s.noticeLife > 0)
        s.noticeLife--;
    // Resolve the tactile tech before either seat can buffer an input. Otherwise
    // a slot-0 victim would free slot 1 early enough to queue an attack, while
    // the mirrored slot-1 victim would not free slot 0 until its input was lost.
    let brokeThrow = false;
    for (let i = 0; i < 2; i++) {
        if ((inputs[i] & ~s.fighters[i].prev & A.grab) && breakThrow(s, i)) { brokeThrow = true; break; }
    }
    for (let i = 0; i < 2; i++) {
        const f = s.fighters[i];
        f.input = inputs[i];
        // Release cancels a run even during hitstop; it must not reappear on thaw.
        const runInput=((f.input&A.right)?1:0)-((f.input&A.left)?1:0);
        if (!(f.input&A.dash) || runInput!==f.runDirection || (f.input&(A.up|A.down))) f.runDirection=0;
        const pressed = f.input & ~f.prev;
        if (brokeThrow) { f.prev = f.input; continue; }
        if (s.matchDepth) {
            const back = f.facing === 1 ? A.left : A.right;
            if ((f.input & back) && !(f.prev & back)) s.matchDepth.backPressed[i] = s.frame;
            if (grounded(f) && !f.stun) s.matchDepth.juggles[i] = 0;
            if (s.matchDepth.modifier === 'specials-only') f.pips = 3;
        }
        if(s.throwState && ((i===s.throwState.attacker && (s.throwState.phase==='hold'||s.throwState.t<THROW_RECOVERY_FRAMES-6)) || (s.throwState.phase==='hold'&&i===s.throwState.victim))){
            f.buffer=0;f.bufferLife=0;f.jumpBuffer=0;f.jumpDelay=0;f.dashBuffer=0;f.prev=f.input;continue;
        }
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
            f.bufferLife = 8;
            f.bufferInput = f.input;
            if(f.input&A.up && attacks&(A.light|A.medium|A.heavy|A.grab|(isHorizontalSpit(f.id)?0:A.bolt))){f.jumpBuffer=0;f.jumpDelay=0;}
        }
    }
    if (s.freeze > 0) {
        s.freeze--;
        for (const f of s.fighters)
            f.prev = f.input;
        return;
    }
    // Inputs can begin hitstop (for example a throw break). Advance known
    // commitment only after that early return, with the same ticks as physics.
    for (const memory of s.cpu!) memory.combatTicks++;
    for (let i = 0; i < 2; i++) {
        const f = s.fighters[i], other = s.fighters[1 - i];
        if(f.slow>0)f.slow--;
        if(f.throwInvuln>0)f.throwInvuln--;
        if(f.strikeInvuln>0)f.strikeInvuln--;
        if(f.reaction){
            f.reaction.t++;
            if(f.reaction.kind==='knockdown'){
                if(f.reaction.phase==='flight')f.stun=Math.max(f.stun,2);
                else if(f.reaction.phase==='down'&&f.reaction.t>=(f.riseDelay||KNOCKDOWN_FRAMES)){f.reaction.phase='rise';f.reaction.t=0;f.stun=GETUP_FRAMES+1;}
                else if(f.reaction.phase==='rise'&&f.reaction.t>=GETUP_FRAMES){f.reaction=null;f.riseDelay=0;f.stun=0;f.throwInvuln=Math.max(f.throwInvuln,12);f.strikeInvuln=Math.max(f.strikeInvuln,3);}
            }else if(f.stun<=1)f.reaction=null;
        }
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
        if (!(f.input&A.dash) || horizontal!==f.runDirection || horizontal*f.facing<=0 || (f.input&(A.down|A.up)) || f.stun || f.blockstun || f.move) f.runDirection=0;
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
                const running=f.runDirection!==0 && dir===f.runDirection;
                const target = (f.input & A.down) ? 0 : dir * speed * (running?1.35:1);
                const acceleration = target === 0 ? speed * .7 : target * f.vx < 0 ? speed * 1.45 : speed * .55;
                approach(target, acceleration);
            } else if(f.move.id==='special' && f.move.t>=6 && f.move.t<=COMBAT_STYLES[f.id].specialFrames.at(-1)!){f.vx=f.facing*Math.min(COMBAT_STYLES[f.id].advance??0,Math.max(0,(other.x-f.x)*f.facing-65));}
            else f.vx *= .7;
        }
        else
            // Airborne hit reactions retain their release momentum. Ground
            // friction must not stop a back throw before it crosses the holder.
            f.vx *= !grounded(f) && f.reaction?.phase==='flight' ? .985 : .84;
        const release=s.throwState;
        if(release?.phase==='release'&&release.direction==='back'&&release.victim===i){
            // Clear the holder's head before travelling behind their shoulder.
            if(release.t<BACK_THROW_LIFT_FRAMES)f.vx=0;
            else if(release.t===BACK_THROW_LIFT_FRAMES)f.vx=-release.facing*14;
        }
        const nextX=f.x+f.vx;
        f.x = clamp(nextX, fighterWall(f.id), WIDTH - fighterWall(f.id));
        if(nextX!==f.x){f.vx=0;f.dash=0;f.dashBuffer=0;f.runDirection=0;}
        if (!grounded(f) || f.vy < 0) {
            f.vy += matchGravity(s);
            f.y += f.vy;
            if (f.y >= FLOOR) {
                f.y = FLOOR;
                f.airJumps = 0;
                f.vy = 0;
                if (f.move && MOVES[f.move.id].air)
                    f.move = null;
                if(f.reaction?.kind==='knockdown'&&f.reaction.phase==='flight'){
                    // Down quick-rises; Up delays. Sample on landing, not later during get-up.
                    f.riseDelay=(f.input&A.down)?6:(f.input&A.up)?24:KNOCKDOWN_FRAMES;
                    f.jumpBuffer=0;f.jumpDelay=0;
                    f.reaction.phase='down';f.reaction.t=0;f.stun=f.riseDelay+GETUP_FRAMES+1;
                    f.vx*=.25;effect(s,f.x,FLOOR-8,'hit',ROSTER[f.id].color);
                }
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
    // A falling/grounded body occupies more floor space than a standing pair.
    // Start separating just before touchdown so the landing does not bury the
    // victim under the standing fighter, especially after a wall back throw.
    const descendingBody=(f:Fighter)=>f.reaction?.kind==='knockdown'&&
        (f.reaction.phase==='down'||(f.reaction.phase==='flight'&&f.reaction.t>0&&f.vy>=0));
    const settling=descendingBody(a)||descendingBody(b);
    const pairGap=((descendingBody(a)&&a.y>FLOOR-40)||(descendingBody(b)&&b.y>FLOOR-40)?115:55)+bodySpread(a.id)+bodySpread(b.id);
    if (s.throwState?.phase!=='hold' && Math.abs(a.x - b.x) < pairGap && Math.abs(a.y - b.y) < 65) {
        // At a flush wall a back throw can land exactly on the holder's x.
        // Preserve the throw's side in that tie; do not send the victim back
        // to the front merely because player zero is processed first.
        const tieDirection=a.reaction?.kind==='knockdown'?-a.reaction.direction:b.reaction?.kind==='knockdown'?b.reaction.direction:1;
        const d = Math.abs(a.x-b.x)<.001 ? tieDirection : a.x<b.x?1:-1;
        // Expand the floor contact over several ticks; a full-width correction
        // on touchdown would jerk a stationary holder sideways in one frame.
        const overlap = Math.min((pairGap - Math.abs(a.x - b.x)) / 2,settling?8:Infinity);
        a.x = clamp(a.x - overlap * d, fighterWall(a.id), WIDTH - fighterWall(a.id));
        b.x = clamp(b.x + overlap * d, fighterWall(b.id), WIDTH - fighterWall(b.id));
    }
    // Collect active melee hits before applying them, so same-frame strikes can trade.
    const specialImmune=s.fighters.map(f=>f.move?.id==='special');
    // Both active phases advance together. Capture both exposed hurtboxes before
    // collecting strikes so a startup boundary cannot favor the later seat.
    const meleeHurtboxes = s.fighters.map(f => getHurtbox(f, f.move ? getMove(f, f.move.id) : undefined, f.move ? f.move.t + 1 : 0));
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
            const rawStyle=COMBAT_STYLES[f.id].projectile,spit=isHorizontalSpit(f.id)||rawStyle.horizontal===true;
            const style=spit?{...rawStyle,gravity:0,wave:0,bounces:0,ground:false}:rawStyle;
            const dx=attack.shotX??f.facing,dy=spit?0:attack.shotY??0,length=dx&&dy?Math.SQRT2:1, // aim components are -1, 0 or 1
            speed=style.speed;
            // Reviewed emitting points in the complete-body cast release cels.
            // Keep this immutable combat data; rendering never moves a hitbox.
            const origin=shotOrigin(f);
            const {secondaryOrigin, ...projectileStyle} = style;
            const origins = secondaryOrigin ? [origin, secondaryOrigin] : [origin];
            for (const [shot, emitter] of origins.entries()) {
                const damage = shot === 0 && secondaryOrigin ? Math.ceil(m.damage / 2)
                    : shot === 1 ? Math.floor(m.damage / 2) : m.damage;
                s.projectiles.push({
                    ...projectileStyle,
                    owner:i,
                    x:f.x + f.facing * emitter.forward,
                    y:style.ground && dy === 0 ? FLOOR - 22 : f.y - emitter.height,
                    vx:dx / length * speed,
                    vy:dy / length * speed - (style.bounces && dy === 0 && !style.ground ? 3 : 0),
                    life:style.beamFrames ?? 100,
                    damage,
                    age:0,
                    ...(style.beamLength ? {beamDirection:f.facing,beamHit:false} : {}),
                });
            }
        }
        let active = attack.t >= m.startup && attack.t < m.startup + m.active && !attack.hit;
        if (attack.id === 'special') {
            const wave = COMBAT_STYLES[f.id].specialFrames.indexOf(attack.t);
            active = wave >= 0;
            if (active) {
                attack.wave = wave;
            }
        }
        const contact = rectanglesOverlap(getHitbox(f, attack.id, m), meleeHurtboxes[1-i]);
        const throwable = attack.id !== 'grab' || (!s.throwState && grounded(f) && grounded(other) && other.stun === 0 && other.blockstun === 0 && other.throwInvuln === 0);
        if (!endingKO && !specialImmune[1-i] && active && !m.projectile && (attack.id === 'special' || !isDown(other)) && throwable && contact && (attack.id === 'grab' || other.strikeInvuln === 0)) {
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
        if(p.beamLength){
            const owner=s.fighters[p.owner],origin=COMBAT_STYLES[owner.id].projectile.origin!;
            // A focused beam follows the forehead during the committed cast.
            // Hits, cancels and KO break focus immediately; there is no lingering hitbox.
            if(owner.move?.id!=='bolt'||owner.stun||owner.blockstun||owner.hp<=0){p.life=0;continue;}
            p.x=owner.x+(p.beamDirection??owner.facing)*origin.forward;p.y=owner.y-origin.height;
        }
        if(p.returnAt===p.age)p.vx*=-1;
        if(p.accel)p.vx+=Math.sign(p.vx)*p.accel;
        p.vy+=p.gravity??0;
        p.x += p.vx;
        p.y += p.vy+(p.wave?waveSin(p.age)*p.wave:0);
        if((p.bounces??0)>0&&p.y>=FLOOR-20){p.y=FLOOR-20;p.vy=-Math.max(3,Math.abs(p.vy)*.75);p.bounces!--;}
        else if(p.ground&&p.y>FLOOR-20){p.y=FLOOR-20;p.vy=0;}
        p.life--;
    }
    clashProjectiles(s.projectiles);
    for (const p of s.projectiles) {
        if (p.life <= 0 || p.beamHit) continue;
        const target = s.fighters[1 - p.owner];
        const targetMove = target.move ? getMove(target, target.move.id) : undefined;
        if (!endingKO && !specialImmune[1-p.owner] && !isDown(target) && target.strikeInvuln === 0 && rectanglesOverlap(getProjectileHitbox(p), getHurtbox(target, targetMove))) {
            if(s.matchDepth?.modifier==='reflect-projectiles' && canGuard(s,p.owner,getMove(s.fighters[p.owner],'bolt'),'bolt') && !p.beamLength){
                p.owner=1-p.owner;p.vx=-p.vx;p.vy=-p.vy;p.x=target.x+target.facing*(bodySpread(target.id)+40);continue;
            }
            damage(s, p.owner, { ...getMove(s.fighters[p.owner],'bolt'), damage: p.damage }, 'bolt', true);
            if(p.beamLength)p.beamHit=true;else p.life=0;
        }
    }
    s.projectiles = s.projectiles.filter(p => p.life > 0 && p.x > -40 && p.x < WIDTH + 40 && p.y > -120 && p.y < FLOOR + 25);
    for (let i = 0; i < 2; i++) {
        const target = s.fighters[1 - i];
        if (target.stun === 0)
            finishCombo(s, s.fighters[i]);
    }
    const koFalling=s.fighters.some(f=>f.hp<=0&&f.reaction?.kind==='knockdown'&&f.reaction.phase==='flight'&&!grounded(f));
    if ((a.hp <= 0 || b.hp <= 0) && !koFalling) {
        if(s.throwState?.phase==='hold'){
            const held=s.fighters[s.throwState.victim];
            held.y=FLOOR;held.vx=0;held.vy=0;held.stun=0;held.reaction=null;
        }
        s.throwState=null;
        for(const f of s.fighters)if(f.move?.id==='grab')f.move=null;
        finishCombo(s, a);
        finishCombo(s, b);
        s.winner = a.hp === b.hp ? 2 : a.hp > b.hp ? 0 : 1;
        s.throwState=null;
    }
    tickMatchDepth(s);
    if(s.godMode){a.hp=1000;a.pips=3;}
    if (isPracticeMode(s.mode) && b.stun === 0 && a.combo === 0 && s.frame % 90 === 0)
        b.hp = 1000;
}
