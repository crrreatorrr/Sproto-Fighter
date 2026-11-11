import {drawActiveStoryLocation} from './stageVariants';
import { setPoseAtlasThrowState, setPoseAtlasPresentation } from './poseAtlas';
import type { RoundPresentation } from './animationEvents';
import { drawPower, drawSharedRanged, drawRetainDefeat, drawVitalikDefeatCaption } from './powerArt';
import { drawMindBeams } from './mindBeamArt';
import { drawPelvicAttacks } from './pelvicAttack';
import { drawTeamSpecialBack, drawTeamSpecialFront } from './teamSpecial';
import { drawSprite } from './spriteRoster';
import { drawStage } from './stage';
import { FLOOR, ROSTER, COMBAT_STYLES, PLAYABLE_FIGHTERS, hashText, DUO_SPREAD, bodyOffsets, isPairedFighter, isDown, getMove, type CombatState, type Effect, type Fighter } from './core';
// Shuffle once by fighter identity, then deal all 48 sprites before reusing any.
const genericRanged=new Set(['orb','spark','prism','ring','coin']);
const sharedRangedAssignments=new Map(
    PLAYABLE_FIGHTERS.filter(id=>id!=='guest12'&&genericRanged.has(COMBAT_STYLES[id].projectile.shape))
        .sort((a,b)=>hashText('ranged-v1:'+a)-hashText('ranged-v1:'+b))
        .map((id,index)=>[id,index%48] as const)
);
function text(c: CanvasRenderingContext2D, str: string, x: number, y: number, size = 14, color = '#93a5bd', align: CanvasTextAlign = 'left', weight = 600) { c.fillStyle = color; c.font = `${weight} ${size}px "Pixelify Sans", monospace`; c.textAlign = align; c.fillText(str, x, y); }
function line(c: CanvasRenderingContext2D, x: number, y: number, x2: number, y2: number, color: string, width = 1) { c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.strokeStyle = color; c.lineWidth = width; c.stroke(); }
function poly(c: CanvasRenderingContext2D, points: number[][], color: string) { c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fillStyle = color; c.fill(); }

function drawSprotopiaAura(c: CanvasRenderingContext2D, f: Fighter) {
    if (f.id !== 'sprotopia' || f.move?.id !== 'bolt' || f.stun || f.blockstun || f.hp <= 0) return;
    const { startup } = getMove(f, 'bolt');
    const age = f.move.t;
    const fade = Math.min(1, (age + 2) / 6, (startup + 10 - age) / 8);
    if (fade <= 0) return;

    const pulse = (Math.floor(age / 3) % 3) * 3;
    const outline = [
        [-56, -14], [-76, -49], [-66, -92], [-81, -120], [-52, -137],
        [-42, -167], [-17, -158], [3, -184], [22, -166], [45, -173],
        [59, -140], [78, -119], [66, -97], [78, -58], [59, -17], [0, -5],
    ];
    c.save();
    c.translate(Math.round(f.x), Math.round(f.y));
    c.globalAlpha = .44 * fade;
    poly(c, outline.map(([x, y]) => [Math.round(x * (1 + pulse / 80)), y - pulse]), '#ff561c');
    c.globalAlpha = .62 * fade;
    poly(c, outline.map(([x, y]) => [Math.round(x * .85), Math.round((y + 90) * .88 - 90)]), '#ff9829');
    c.globalAlpha = fade;
    for (let spark = 0; spark < 8; spark++) {
        const direction = spark % 2 === 0 ? -1 : 1;
        const lift = (age * 3 + spark * 19) % 144;
        const x = direction * (59 + ((spark * 11 + pulse) % 25));
        c.fillStyle = spark % 3 === 0 ? '#ffd084' : '#ff771f';
        c.fillRect(x, -32 - lift, spark % 3 === 0 ? 5 : 3, 5 + spark % 4);
    }
    c.restore();
}

function fighter(c: CanvasRenderingContext2D, f: Fighter, frame: number, ghost = false, frozen = false, visualFrame = frame) {
    if(drawRetainDefeat(c,f.id,f.hp,f.x,FLOOR,visualFrame))return;
    drawSprotopiaAura(c, f);
    drawSprite(c,f,frame,ghost,frozen);
    if (f.blockstun > 0) {
        c.save();
        c.strokeStyle = '#85c8ff';
        c.lineWidth = 3;
        c.globalAlpha = .7;
        c.beginPath();
        c.ellipse(f.x + f.facing * 24, f.y - 60, 34, 64, 0, f.facing === 1 ? -1.5 : 1.65, f.facing === 1 ? 1.5 : 4.65);
        c.stroke();
        c.restore();
    }
}
type HealthRecovery={from:number;progress:number};
/**
 * Impact feedback is presentation only. It is derived from hit stop (`s.freeze`) and the
 * effects the simulation already emits, and nothing here is read back by the simulation.
 * Hit stop is 4, 6, 9 and 12 frames by strength, so it doubles as the strength of a hit.
 */
export function impactShake(freeze: number, special = false): { amp: number; frames: number } | null {
    if (freeze >= 12) return { amp: 8, frames: 10 };
    if (freeze >= 9) return { amp: 5, frames: 7 };
    return special ? { amp: 4, frames: 6 } : null;
}
/** Spark size by the hit stop seen when the effect first appeared. */
export const sparkScale = (freeze: number): number => freeze >= 12 ? 1.7 : freeze >= 9 ? 1.4 : freeze >= 6 ? 1.12 : .85;
const sparkStrength = new WeakMap<Effect, number>();
let shake = { start: 0, frames: 0, amp: 0 };
function trackImpacts(s: CombatState, visualFrame: number): [number, number] {
    for (const e of s.effects) {
        if (sparkStrength.has(e)) continue;
        const fresh = e.life >= e.max - 2, contact = e.kind === 'hit' || e.kind === 'special';
        sparkStrength.set(e, contact && fresh ? Math.max(4, s.freeze) : 4);
        const hit = contact && fresh ? impactShake(s.freeze, e.kind === 'special') : null;
        if (hit && hit.amp >= shake.amp * Math.max(0, 1 - (visualFrame - shake.start) / (shake.frames || 1))) shake = { start: visualFrame, ...hit };
    }
    const age = visualFrame - shake.start;
    if (age < 0 || age >= shake.frames) return [0, 0];
    const fade = shake.amp * (1 - age / shake.frames);
    return [Math.round(Math.sin(age * 1.9 + 1) * fade), Math.round(Math.cos(age * 2.7) * fade * .6)];
}
/** The round-deciding call: large, centred and on its own dark band so it reads over any stage. */
function drawKoBanner(c: CanvasRenderingContext2D, label: string, age: number) {
    const enter = Math.min(1, age / 8), size = Math.round(96 * (1.35 - .35 * enter));
    c.save();
    c.globalAlpha = enter;
    c.fillStyle = '#050a14d9'; c.fillRect(0, 276, 1280, 108);
    c.fillStyle = '#f4e8c5'; c.fillRect(0, 276, 1280, 3); c.fillRect(0, 381, 1280, 3);
    c.textBaseline = 'middle';
    text(c, label, 644, 336, size, '#0b0f18', 'center', 900);
    text(c, label, 640, 332, size, '#f4e8c5', 'center', 900);
    c.restore();
}

function health(c: CanvasRenderingContext2D, f: Fighter, right: boolean, mode: string, bossTitle?:string, recovery?:HealthRecovery, meterUnits=0) {
    const x = right ? 765 : 55, width = 460, color = ROSTER[f.id].color;
    text(c, bossTitle??ROSTER[f.id].name, right ? 1225 : 55, 55, 24, '#eaf0f7', right ? 'right' : 'left', 850);
    text(c, (mode === 'versus' ? (right ? 'P2 / ' : 'P1 / ') : right ? (mode === 'cpu' ? 'CPU / ' : 'DUMMY / ') : 'YOU / ') + ROSTER[f.id].role, right ? 1225 : 55, 76, 12, color, right ? 'right' : 'left');
    c.fillStyle = '#2b3547';
    c.fillRect(x, 88, width, 19);
    c.fillStyle = color;
    const hp=recovery?Math.round(recovery.from+(f.hp-recovery.from)*recovery.progress):f.hp;
    const w = width * hp / 1000;
    c.fillRect(right ? x + width - w : x, 88, w, 19);
    if(recovery){
        const start=width*recovery.from/1000;
        const glow=c.createLinearGradient(x+start,0,x+Math.max(w,start+1),0);
        glow.addColorStop(0,'#54f5a744');glow.addColorStop(1,'#bdffdf');
        c.fillStyle=glow;c.fillRect(x+start,88,Math.max(0,w-start),19);
    }
    for (let i = 1; i < 10; i++)
        line(c, x + i * 46, 88, x + i * 46, 107, '#101b2b55');
    text(c, `${hp} / 1000`, right ? x : x + width, 131, 16, '#e3ecf7', right ? 'left' : 'right', 700);
    for (let i = 0; i < 3; i++) {
        const px = right ? x + width - 34 - i * 41 : x + i * 41;
        c.fillStyle = i < f.pips ? color : '#25354a';
        poly(c, [[px + 5, 120], [px + 34, 120], [px + 29, 130], [px, 130]], c.fillStyle as string);
        if(i===f.pips && meterUnits>0){
            c.save();c.beginPath();c.rect(px,120,34*meterUnits/10000,10);c.clip();
            poly(c,[[px+5,120],[px+34,120],[px+29,130],[px,130]],color);c.restore();
        }
    }
    text(c, recovery?'RECOVERING HEALTH':f.pips === 3 ? 'TEAM SPECIAL READY' : 'RELAY CHARGE', right ? x + width : x, 153, 13, recovery?'#bdffdf':f.pips === 3 ? color : '#a9bed6', right ? 'right' : 'left');
}
export function render(c: CanvasRenderingContext2D, s: CombatState, presentation?:RoundPresentation, visualFrame=s.frame+(presentation?.frame??0), storyAnimation?:(ctx:CanvasRenderingContext2D,x:number,y:number,defeatFacing:number)=>boolean, bossAttacks?:(ctx:CanvasRenderingContext2D)=>void,bossTitle?:string, portal?:{x:number;y:number;progress:number}, recovery?:HealthRecovery) {
    setPoseAtlasThrowState(s.throwState,s.fighters);
    setPoseAtlasPresentation(presentation??null,s.fighters);
    const [shakeX, shakeY] = trackImpacts(s, visualFrame);
    c.save();
    c.translate(shakeX, shakeY);
    if(!drawActiveStoryLocation(c))drawStage(c, s.frame);
    // Keep the HUD legible over the bright sky and moon without covering fighters.
    c.fillStyle='#071224b8';c.fillRect(-16,-16,1312,178);
    c.fillStyle='#07122455';c.fillRect(-16,162,1312,10);
    for (const f of s.fighters) {
        if(portal&&f===s.fighters[0])continue;
        c.fillStyle = '#040b1366';
        for(const offset of bodyOffsets(f.id)){
            c.beginPath();
            c.ellipse(f.x+offset, FLOOR + 5, 53 - Math.min(25, (FLOOR - f.y) / 10), 10, 0, 0, Math.PI * 2);
            c.fill();
        }
    }
    drawTeamSpecialBack(c,s);
    // A fixed player-two foreground hid player one's extended hand at contact.
    // Keep the standing actor above a downed body, then prefer the attacker/holder.
    const down0=isDown(s.fighters[0]),down1=isDown(s.fighters[1]);
    const foreground = s.throwState?.attacker ?? (down0!==down1?(down0?1:0):
        (s.fighters[0].move && !s.fighters[0].stun && !s.fighters[1].move ? 0 : 1));
    for(const index of [1-foreground,foreground]){
        const actor=s.fighters[index];
        const landedKO=presentation?.fromFloor||(actor.reaction?.kind==='knockdown'&&actor.reaction.phase==='down');
        const facing=landedKO?(actor.reaction?.direction??actor.facing):actor.facing;
        if(index===1&&storyAnimation?.(c,actor.x,FLOOR,facing))continue;
        if(index===0&&portal){
            const t=portal.progress;
            if(t>=1)continue;
            const centerY=actor.y-80,angle=t*Math.PI*4;
            const orbit=Math.sin(Math.PI*t)*55;
            const x=actor.x+(portal.x-actor.x)*t+Math.sin(angle)*orbit;
            const y=centerY+(FLOOR+portal.y-centerY)*t+Math.cos(angle)*orbit;
            c.save();
            c.translate(x,y);
            c.rotate(angle);c.scale(1-t,1-t);c.translate(-actor.x,-centerY);
            fighter(c,actor,s.frame,false,s.freeze>0,visualFrame);
            c.restore();continue;
        }
        fighter(c,actor,s.frame,false,s.freeze>0,visualFrame);
    }
    if(presentation&&(presentation.phase==='outro'||presentation.phase==='result'))for(const[i,f]of s.fighters.entries()){
      if(f.id!=='sproto651'||presentation.winner===i)continue;
      const age=presentation.frame,colors=['#f34545','#e9cb30','#367ee6','#b548cf','#39b9a5'];
      for(let n=0;n<28;n++){
        const t=Math.max(0,Math.min(1,(age-10-n%8)/35)),angle=n*2.399;
        const x=f.x+Math.cos(angle)*(20+n*3)*t,y=Math.min(FLOOR+3,f.y-25-Math.sin(t*Math.PI)*(15+n%7*5)+Math.sin(angle)*n*t);
        c.fillStyle=colors[n%colors.length];c.fillRect(Math.round(x),Math.round(y),4+n%5,3+n%4);
      }
    }
    drawTeamSpecialFront(c,s);
    // The reference B is visibly held before the hand releases its projectile.
    for(const f of s.fighters)if(f.id==='sproto3106'&&f.move?.id==='bolt'&&!f.stun&&!f.blockstun){
        const startup=getMove(f,'bolt').startup;
        if(f.move.t<startup){
            const [x,y]=f.move.t<startup*.55?[2.5,70]:[41.25,81.25];
            c.save();c.translate(Math.round(f.x+f.facing*x),Math.round(f.y-y));drawPower(c,'referenceB',0,ROSTER[f.id].color);c.restore();
        }
    }
    for(const f of s.fighters)if(f.id==='sproto1601'&&f.move?.id==='bolt'&&!f.stun&&!f.blockstun){
        const startup=getMove(f,'bolt').startup;
        if(f.move.t<startup){
            const [x,y]=f.move.t<startup*.55?[0,73.75]:[67.5,85];
            c.save();c.translate(Math.round(f.x+f.facing*x),Math.round(f.y-y));drawPower(c,'yellowEight',0,ROSTER[f.id].color);c.restore();
        }
    }
    for(const f of s.fighters)if(f.id==='vitaliketh'&&f.move?.id==='bolt'&&!f.stun&&!f.blockstun){
        const startup=getMove(f,'bolt').startup;
        if(f.move.t<startup){
            const phase=f.move.t/startup;
            const [x,y]=phase<.25?[17.5,72.5]:phase<.5?[26.25,76.25]:phase<.75?[51.25,87.5]:[82.5,100];
            c.save();c.translate(Math.round(f.x+f.facing*x),Math.round(f.y-y));drawPower(c,'ethereum',0,ROSTER[f.id].color);c.restore();
        }
    }
    for(const f of s.fighters)if(f.slow>0)text(c,'MELANCHOLY · SLOWED',f.x,f.y-170,9,'#c7a5eb','center',800);
    for (const p of s.projectiles) {
        if(p.shape==='pelvicStream'||p.beamLength||p.shape?.startsWith('boss'))continue;
        const owner=s.fighters[p.owner];
        const chestLaser=p.shape==='eyeLaser'&&owner.id==='theo';
        c.save();
        c.translate(p.shape==='retain'?Math.round(p.x):p.x,p.shape==='retain'?Math.round(p.y):p.y);
        if(p.shape==='miniSproto'||chestLaser)c.scale(p.vx<0?-1:1,1);
        else if(p.shape!=='retain'&&p.shape!=='referenceB'&&p.shape!=='yellowEight'&&p.shape!=='ethereum')c.rotate(Math.atan2(p.vy,p.vx));
        const shared=sharedRangedAssignments.get(owner.id as typeof PLAYABLE_FIGHTERS[number]);
        if(shared===undefined||p.shape!==COMBAT_STYLES[owner.id].projectile.shape||!drawSharedRanged(c,shared))
            drawPower(c,chestLaser?'chestLaser':p.shape??'spark',p.age??0,ROSTER[owner.id].color);
        c.restore();
    }
    bossAttacks?.(c);
    drawPelvicAttacks(c,s);
    drawMindBeams(c,s);
    for(const f of s.fighters)if(f.id==='michael'&&(f.move?.id==='bolt'||f.move?.id==='special')&&f.move.t<38){
        c.fillStyle='#11182deb';c.fillRect(Math.round(f.x-62),Math.round(f.y-210),124,30);
        text(c,'RETAIN!',Math.round(f.x),Math.round(f.y-188),20,'#fff5d4','center',900);
    }
    // RETAIN visual bursts follow the special's existing damage schedule.
    // They are presentation only; actual ranged shots use core projectiles.
    for(const f of s.fighters)if(f.move?.id==='special'&&COMBAT_STYLES[f.id].projectile.shape==='retain'){
        for(const contact of COMBAT_STYLES[f.id].specialFrames){const age=f.move.t-contact;if(age>=0&&age<18){c.save();c.translate(Math.round(f.x+f.facing*(110+age*24)),Math.round(f.y-105));c.globalAlpha=Math.min(1,(18-age)/5);drawPower(c,'retain',age,ROSTER[f.id].color);c.restore();}}
    }
    for (const e of s.effects) {
        const life = e.life / e.max;
        c.save();
        c.globalAlpha = life;
        c.translate(e.x, e.y);
        c.strokeStyle = e.color;
        c.fillStyle = e.color;
        const contact = e.kind === 'hit' || e.kind === 'special';
        const power = contact ? sparkStrength.get(e) ?? 4 : 4, scale = contact ? sparkScale(power) : 1;
        const r = ((1 - life) * 65 + 10) * scale;
        c.lineWidth = (2 + life * 4) * Math.min(1.5, scale);
        if (e.kind === 'charge') {
            text(c, '+ RELAY', 0, -(1 - life) * 35, 15, e.color, 'center', 800);
        }
        else if (e.kind === 'dash') {
            for (let i = 0; i < 3; i++)
                line(c, -40, -30 + i * 30, 20, -30 + i * 30, e.color, 2);
        }
        else {
            c.beginPath();
            c.arc(0, 0, r * (e.kind === 'special' ? 2 : 1), 0, Math.PI * 2);
            c.stroke();
            if (e.kind !== 'block')
                for (let i = 0; i < 8; i++) {
                    const a = i * Math.PI / 4;
                    line(c, Math.cos(a) * r * .5, Math.sin(a) * r * .5, Math.cos(a) * r * 1.5, Math.sin(a) * r * 1.5, e.color, 3);
                }
            if (contact && power >= 9) {
                // Heavy and special hits throw longer shards and flash white at the point of contact.
                for (let i = 0; i < 6; i++) {
                    const a = i * Math.PI / 3 + .5;
                    line(c, Math.cos(a) * r * 1.6, Math.sin(a) * r * 1.6, Math.cos(a) * r * 2.1, Math.sin(a) * r * 2.1, '#fff6d8', 2);
                }
                if (life > .75) { c.globalAlpha = (life - .75) * 4; c.fillStyle = '#fffbe9'; c.beginPath(); c.arc(0, 0, 22 * scale, 0, Math.PI * 2); c.fill(); }
            }
        }
        c.restore();
    }
    c.restore();
    if(portal)return;
    health(c, s.fighters[0], false, s.mode,undefined,recovery,s.matchDepth?.meter[0]);
    health(c, s.fighters[1], true, s.mode,bossTitle,undefined,s.matchDepth?.meter[1]);
    text(c, s.matchDepth ? 'ROUND '+s.matchDepth.round : 'ROUND 01', 640, 117, 14, '#b9cbdc', 'center');
    if(s.matchDepth){
        text(c, String(Math.ceil(s.matchDepth.remaining/60)),640,96,28,'#fff3ad','center');
        text(c, s.matchDepth.wins[0]+' — '+s.matchDepth.wins[1],640,137,14,'#eaf0f7','center');
        if(s.matchDepth.modifier!=='none')text(c,s.matchDepth.modifier.replaceAll('-',' ').toUpperCase(),640,155,12,'#fff3ad','center');
    }
    for (let i = 0; i < 2; i++) {
        const f = s.fighters[i];
        if(f.move && f.move.t>0){
            const aim=f.move.aim,powerShape=f.id==='theo'?'chestLaser':COMBAT_STYLES[f.id].projectile.shape;
            const label=f.move.id==='grab'?(f.move.throwDirection??'forward').toUpperCase()+' THROW':f.move.id==='bolt'?(powerShape==='joint'?'WEED LEAF':powerShape==='yellowEight'?'YELLOW 8':powerShape.startsWith('signature:')?'RANGED ATTACK':powerShape==='painting'?'PAINTING THROW':powerShape.replace(/([A-Z])/g,' $1').toUpperCase()):aim==='upForward'?'DIAGONAL STRIKE':aim==='up'?'RISING STRIKE':aim==='down'?(f.y<FLOOR?'DIVE STRIKE':'LOW STRIKE'):'';
            if(label&&!(f.id==='michael'&&f.move.id==='bolt'&&f.move.t<38))text(c,label,f.x,f.y-200,10,'#e8e4cc','center',750);
            if(f.move.connected&&f.move.id!=='special'&&f.move.id!=='grab')text(c,f.dashCanceled?'CHAIN READY':'CHAIN / DASH CANCEL',f.x,f.y+35,9,'#b4f8c8','center',750);
        }
        if (f.combo > 1) {
            const x = i === 0 ? 65 : 1215;
            c.fillStyle = '#17202bd9';
            c.fillRect(i === 0 ? 48 : 972, 188, 260, 146);
            text(c, String(f.combo).padStart(2, '0'), x, 244, 61, ROSTER[f.id].color, i === 0 ? 'left' : 'right', 900);
            text(c, 'HIT COMBO', x, 268, 14, '#d8e4f0', i === 0 ? 'left' : 'right');
            text(c, f.comboDamage + ' DAMAGE', x, 291, 13, '#9db0c6', i === 0 ? 'left' : 'right');
            text(c,!f.chargeEligible?'TEAM SPECIAL · NO RECHARGE':f.combo>=3&&f.lastFinisher?'CLEAN FINISH · +1 AT END':f.combo>=3?'FINISHER TO EARN CHARGE':'EXTEND → FINISH',x,315,13,f.lastFinisher?'#b4f8c8':'#efd69b',i===0?'left':'right');
        }
    }
    const ending = presentation?.phase==='outro' || presentation?.phase==='result';
    // The K.O. banner owns the centre of the screen once a round is decided.
    if (s.noticeLife > 0 && !ending && !s.fighters.some(f=>f.move?.id==='special')) {
        c.globalAlpha = Math.min(1, s.noticeLife / 20);
        c.fillStyle = '#17202bce';
        c.fillRect(390, 176, 500, 32);
        text(c, s.notice, 640, 197, 13, '#c6dfd5', 'center', 750);
        c.globalAlpha = 1;
    }
    c.fillStyle = '#18202cba';
    c.fillRect(425, 676, 430, 29);
    text(c, 'HOLD AWAY: BLOCK  /  DOWN: CROUCH', 640, 696, 13, '#c8d5e3', 'center', 500);
    drawVitalikDefeatCaption(c,s.fighters);
    if(presentation?.phase==='intro'){
        c.fillStyle='#101725e0';c.fillRect(435,175,410,66);
        text(c,'GET READY',640,204,24,'#f4e8c5','center',900);
        text(c,'PREPARE FOR THE OPENING EXCHANGE',640,227,10,'#b4c3d3','center');
    }else if(presentation?.phase==='outro'){
        drawKoBanner(c,presentation.winner===2?'DOUBLE K.O.':'K.O.',presentation.frame);
    }
}
