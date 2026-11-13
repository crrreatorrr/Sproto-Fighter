import {dragonHitBands} from './storyDragonHitbox';
import storyClips from './storyAnimationManifest.json';
import {A,FLOOR,type Action,type CombatState,type Projectile} from './core';
import {pressedMask} from './localInput';
import {makeFighter} from './sim/combat';
import missile from './story-boss-art/missile.png';
import laser from './story-boss-art/laser.svg';
import bolt from './story-boss-art/bolt.svg';
import diamond from './story-boss-art/diamond.svg';
import orb from './story-boss-art/orb.svg';
import roller from './story-boss-art/roller.svg';
import seed from './story-boss-art/seed.svg';

export type BossForm='giant'|'mecha'|'dragon'|'juicy'|'art'|'vmu';
export const STORY_BOSS_X=220;
export const storyBossX=(form:BossForm)=>form==='dragon'?470:form==='art'?315:STORY_BOSS_X;
export const BOSS_BEAM=1<<12,BOSS_BALL=1<<13,BOSS_SHIELD=1<<14;
export const BOSS_KEYS:Readonly<Record<string,number>>={
    KeyA:A.left,ArrowLeft:A.left,KeyD:A.right,ArrowRight:A.right,
    KeyW:A.up,ArrowUp:A.up,
    ShiftLeft:BOSS_SHIELD,ShiftRight:BOSS_SHIELD,KeyX:BOSS_SHIELD,KeyC:BOSS_BEAM,KeyV:BOSS_BALL,
};
/**
 * A boss form's actions from the player's fight controls, so the same buttons
 * and keys work in both: movement and dash carry over (a double-tap of left
 * or right, or a mapped Dash button), Launcher also jumps, Light and Ranged
 * power fire the beam, Medium throws the ball, and Finisher or Block raises the
 * shield (controller defaults: A jump, X/RB beam, Y ball, B/LT shield;
 * keyboard defaults: U jump, J/I beam, K ball, L/Shift shield).
 */
export function bossFightInput(mask:number):number{
    let input=mask&(A.left|A.right|A.up|A.down|A.dash);
    if(mask&A.launcher)input|=A.up;
    if(mask&(A.light|A.bolt))input|=BOSS_BEAM;
    if(mask&A.medium)input|=BOSS_BALL;
    if(mask&(A.heavy|A.block))input|=BOSS_SHIELD;
    return input;
}
/** Boss-form input for one key: its fixed BOSS_KEYS action, or else what its fight binding means in the form. */
export function bossKeyInput(code:string,bindings:Readonly<Record<Action,string>>):number{
    return BOSS_KEYS[code]??bossFightInput(pressedMask(code,bindings));
}
const projectileUrls={missile,laser,bolt,diamond,orb,roller,seed};
type Art=keyof typeof projectileUrls;
const artSize:Record<Art,readonly [number,number]>={
    missile:[44,18],laser:[96,14],bolt:[30,10],diamond:[26,20],orb:[24,24],roller:[36,20],seed:[14,14],
};
type Pattern='aim'|'fan'|'floor'|'arc'|'burst'|'bomb'|'screen'|'stair'|'wave'|'sweep';
type Attack={name:string;art:Art;speed:number;origin:readonly [number,number];pattern:Pattern;pose?:number};
const artPose=storyClips['mega-woman-growth'];
// These cel coordinates mark the palm or fingertip on each release drawing.
const paintOrigin=(x:number,y:number):readonly [number,number]=>
    [(x-artPose.x)*artPose.scale,(y-artPose.y)*artPose.scale];
const attacks:Record<BossForm,readonly Attack[]>={
    dragon:[
        {name:'Dragonfire',art:'bolt',speed:10,origin:[214,-399],pattern:'burst'},
        {name:'Wing volley',art:'missile',speed:6,origin:[212,-254],pattern:'fan'},
        {name:'Ember roll',art:'roller',speed:8,origin:[216,-74],pattern:'floor'},
        {name:'Coiling missiles',art:'missile',speed:2.6,origin:[212,-254],pattern:'wave',pose:1},
    ],
    giant:[
        {name:'Mouth missile',art:'missile',speed:5,origin:[100,-231],pattern:'aim'},
        {name:'Spit spread',art:'seed',speed:7,origin:[100,-239],pattern:'arc'},
        {name:'Ground roll',art:'roller',speed:9,origin:[142,-156],pattern:'floor'},
        {name:'Spit missile screen',art:'missile',speed:2.7,origin:[100,-231],pattern:'screen',pose:0},
    ],
    mecha:[
        {name:'Missile barrage',art:'missile',speed:6,origin:[98,-213],pattern:'burst'},
        {name:'Cannon spread',art:'diamond',speed:9,origin:[203,-100],pattern:'sweep'},
        {name:'Mortar',art:'orb',speed:8,origin:[194,-233],pattern:'arc'},
        {name:'Torpedo staircase',art:'missile',speed:2.6,origin:[98,-213],pattern:'stair',pose:0},
    ],
    juicy:[
        {name:'Rocket salvo',art:'missile',speed:6,origin:[48,-215],pattern:'sweep'},
        {name:'Pulse fan',art:'orb',speed:8,origin:[-82,-254],pattern:'wave'},
        {name:'Ricochet mortar',art:'diamond',speed:8,origin:[-22,-248],pattern:'arc'},
        {name:'Crossing torpedoes',art:'missile',speed:2.6,origin:[48,-215],pattern:'screen',pose:0},
    ],
    art:[
        {name:'Paint burst',art:'orb',speed:7,origin:paintOrigin(708,303),pattern:'fan'},
        {name:'Palette fan',art:'diamond',speed:8,origin:paintOrigin(714,303),pattern:'wave'},
        {name:'Rolling ink',art:'roller',speed:10,origin:paintOrigin(678,368),pattern:'floor'},
        {name:'Paint missile cascade',art:'missile',speed:2.5,origin:paintOrigin(708,303),pattern:'stair',pose:0},
    ],
    vmu:[
        {name:'Laser burst',art:'laser',speed:19,origin:[25,-89],pattern:'burst'},
        {name:'Bomb drop',art:'orb',speed:10,origin:[44,-68],pattern:'bomb'},
        {name:'Slow missile screen',art:'missile',speed:2.8,origin:[44,-68],pattern:'screen'},
        {name:'Zigzag pulse',art:'diamond',speed:8,origin:[44,-68],pattern:'wave',pose:2},
    ],
};
const artRightHand=Math.max(...attacks.art.map(attack=>attack.origin[0]));
const attackOrder=[0,3,1,2],vmuAttackOrder=[0,2,1,3];
const formConfig={
    vmu:{title:'VMU · FINAL BOSS',target:[-92,-160,92,-16],period:144},
    giant:{title:'GIANT MORELIGHT',target:[-105,-313,135,0],period:166},
    mecha:{title:'MORELIGHT MECHA',target:[-121,-220,145,0],period:136},
    dragon:{title:'NICK & DRAGON',target:[-190,-302,230,-80],period:142},
    art:{title:'MEGA ARTCHICK',target:[-120,-360,125,0],period:150},
    juicy:{title:'JUICY MECHA',target:[-105,-235,130,0],period:140},
} as const;
export const storyBossTitle=(form:BossForm)=>formConfig[form].title;

type Box=readonly [left:number,top:number,right:number,bottom:number];
type Shot=Projectile&{art:Art;hit?:boolean;explodes?:boolean;rolls?:boolean;wave?:number;variant?:number};
type ShotPlan={x:number;y:number;vx:number;vy:number;gravity?:number;bounces?:number;delay?:number;explodes?:boolean;rolls?:boolean;wave?:number};
export interface StoryBoss {
    form:BossForm;
    startFrame:number;
    entryHp:number;
    jumpBuffer:number;
    dashReadyAt:number;
    airDash:boolean;
    shieldReadyAt:number;
    invulnerableUntil:number;
    beamReadyAt:number;
    ballReadyAt:number;
    warning:{attack:Attack;shots:ShotPlan[]} | null;
    pending:{shot:ShotPlan;art:Art;at:number}[];
    releasedAt:number;
    lastAttack:number;
    blasts:{x:number;y:number;until:number}[];
    impacts:{x:number;y:number;until:number}[];
}

export function storyBossPlayerPose(player:CombatState['fighters'][0]){
    return {...makeFighter(player.id,790,-1),best:player.best,hp:player.hp,...(player.partner?{partner:player.partner}:{})};
}

export function startStoryBoss(state:CombatState,form:BossForm):StoryBoss {
    const [player,opponent]=state.fighters;
    state.fighters=[
        {...storyBossPlayerPose(player),hp:1000},
        makeFighter(opponent.id,storyBossX(form),1),
    ];
    state.projectiles=[];state.effects=[];state.throwState=null;state.freeze=0;state.winner=null;
    state.notice=storyBossTitle(form);state.noticeLife=135;
    return {form,startFrame:state.frame,entryHp:player.hp,jumpBuffer:0,dashReadyAt:0,airDash:true,shieldReadyAt:0,
        invulnerableUntil:0,beamReadyAt:0,ballReadyAt:0,warning:null,pending:[],releasedAt:-100,lastAttack:0,blasts:[],impacts:[]};
}

const shotWidth=(shot:Shot)=>shot.shape==='bossBeam'?62:artSize[shot.art][0];

function waveVelocity(shot:Shot){return ((shot.age??0)%32<=16?1:-1)*(shot.wave??0);}

function within(value:number,min:number,max:number){return Math.max(min,Math.min(max,value));}
function sweepTime(x:number,y:number,dx:number,dy:number,[left,top,right,bottom]:Box,w:number,h:number){
    let enter=0,exit=1;
    for(const [start,delta,min,max] of [[x,dx,left-w,right+w],[y,dy,top-h,bottom+h]]){
        if(delta===0){if(start<min||start>max)return null;continue;}
        const a=(min-start)/delta,b=(max-start)/delta;
        enter=Math.max(enter,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));
    }
    return enter<=exit?enter:null;
}

function attackFrame(boss:StoryBoss,age:number){
    return boss.warning||age-boss.releasedAt>=14?0:(attacks[boss.form][boss.lastAttack].pose??boss.lastAttack)+1;
}
function dragonBoxes(x:number,y:number,frame:number){
    return dragonHitBands[frame].flatMap(([top,...runs])=>{
        const boxes:Box[]=[];
        for(let i=0;i<runs.length;i+=2)boxes.push([x+runs[i],y+top,x+runs[i+1],y+top+8]);
        return boxes;
    });
}

/** Idle movement fades to the registered pose before the attack tell. Airborne
 * forms hover. Grounded forms move above the same planted floor anchor. */
function bossBodyMotion(state:CombatState,boss:StoryBoss){
    const age=state.frame-boss.startFrame,period=formConfig[boss.form].period;
    const beat=age%period,untilWarning=beat<24?24-beat:period+24-beat;
    if(state.winner!==null||boss.warning||boss.pending.length||age-boss.releasedAt<24){
        return {lift:0,scaleY:1};
    }
    const fade=within(Math.min(age,age-boss.releasedAt-24,untilWarning)/12,0,1);
    const pulse=fade*fade*(3-2*fade)*Math.sin(age*Math.PI/84)**2;
    if(boss.form==='dragon'||boss.form==='vmu')return {lift:-7*pulse,scaleY:1};
    return {lift:0,scaleY:1+.018*pulse};
}

export function storyBossHurtboxes(state:CombatState,boss:StoryBoss):Box[]{
    const target=state.fighters[1],bounds=formConfig[boss.form].target;
    const boxes:Box[]=boss.form==='dragon'
        ?dragonBoxes(target.x,target.y,attackFrame(boss,state.frame-boss.startFrame))
        :[[target.x+bounds[0],target.y+bounds[1],target.x+bounds[2],target.y+bounds[3]]];
    const {lift,scaleY}=bossBodyMotion(state,boss);
    if(lift===0&&scaleY===1)return boxes;
    const y=(value:number)=>FLOOR+lift+(value-FLOOR)*scaleY;
    return boxes.map(([left,top,right,bottom])=>[left,y(top),right,y(bottom)]);
}

/** The idle sheet and the cinematic's held neutral pose share the same motion. */
export function drawMovingStoryBoss(
    ctx:CanvasRenderingContext2D,state:CombatState,boss:StoryBoss,draw:()=>boolean,
):boolean{
    const {lift,scaleY}=bossBodyMotion(state,boss);
    if(lift===0&&scaleY===1)return draw();
    ctx.save();
    ctx.translate(0,FLOOR+lift);
    ctx.scale(1,scaleY);
    ctx.translate(0,-FLOOR);
    const painted=draw();
    ctx.restore();
    return painted;
}

function planAttack(form:BossForm,attack:Attack,playerX:number,playerY:number):ShotPlan[]{
    const [offsetX,offsetY]=attack.origin,x=storyBossX(form)+offsetX,y=FLOOR+offsetY;
    const dx=Math.max(60,playerX-x),dy=playerY-55-y;
    const length=Math.sqrt(dx*dx+dy*dy);
    const vx=dx/length*attack.speed,vy=dy/length*attack.speed;
    switch(attack.pattern){
        case 'aim':return [{x,y,vx,vy}];
        case 'burst':return [0,12,24].map(delay=>({x,y,vx,vy,delay}));
        case 'fan':return [-2.5,0,2.5].map(offset=>({x,y,vx,vy:vy+offset}));
        case 'floor':return [0,12].map(delay=>({x,y,vx:attack.speed,vy:1,gravity:.65,rolls:true,delay}));
        case 'screen':return [20,65,112,38,90,136,54,155].map((height,i)=>({
            x,y,vx:attack.speed,vy:(FLOOR-height-y)/(form==='juicy'?190-i*12:140),delay:i*8,
        }));
        case 'stair':return [18,42,66,90,114,138,162,186].map((height,i)=>({
            x,y,vx:attack.speed+(i%3)*.15,vy:(FLOOR-height-y)/160,delay:i*8,
        }));
        case 'wave':{
            const slow=attack.speed<3;
            const lanes=slow?[-140,-90,-40,10,60,110,150,190]:[-36,0,36];
            return lanes.map((height,i)=>({
                x,y,vx:attack.speed,vy:slow?(FLOOR-y-105-height)/180:vy+height/22,
                wave:i%2===0?1.6:-1.6,delay:i*(slow?8:10),
            }));
        }
        case 'sweep':return [-2.4,-1.2,0,1.2,2.4].map((spread,i)=>({
            x,y,vx,vy:vy+spread,delay:i*7,
        }));
        case 'bomb':return [.72,1,1.27].map(factor=>({x,y,vx:dx/52*factor,vy:-5,gravity:.25,explodes:true}));
        case 'arc':return [-2,2].map(offset=>({x,y,vx:attack.speed+offset,vy:-4,gravity:.21,bounces:2}));
    }
}

/** Arcade's 60 Hz grounded movement and base kit, adapted to the Fighter floor and fighter-sized sprites. */
export function stepStoryBoss(state:CombatState,boss:StoryBoss,input:number){
    if(state.winner!==null)return;
    const [p,target]=state.fighters,age=++state.frame-boss.startFrame;
    if(state.godMode)p.hp=1000;
    const pressed=input&~p.prev;
    const grounded=p.y===FLOOR;
    const dx=Number(!!(input&A.right))-Number(!!(input&A.left));
    if(dx)p.facing=dx;
    boss.jumpBuffer=pressed&A.up?6:Math.max(0,boss.jumpBuffer-1);
    if(boss.jumpBuffer&&!p.dash&&(grounded||!p.airJumps)){
        if(!grounded)p.airJumps=1;
        p.vy=-13;boss.jumpBuffer=0;
    }
    if((pressed&A.dash)&&age>=boss.dashReadyAt&&(grounded||boss.airDash)){
        p.dash=11;p.dashDirection=dx||p.facing;boss.dashReadyAt=age+40;boss.airDash=false;
    }
    if((pressed&BOSS_SHIELD)&&age>=boss.shieldReadyAt)boss.shieldReadyAt=age+150;
    const shield=age<boss.shieldReadyAt-105;
    const dashing=p.dash>0;
    p.vx=dashing?p.dashDirection*22:dx*5;
    p.vy=dashing?0:p.vy+.65;
    const oldX=p.x,oldY=p.y;
    const config=formConfig[boss.form],bounds=config.target;
    const nearEdge=boss.form==='art'?artRightHand:bounds[2];
    const nextX=p.x+p.vx;
    p.x=within(nextX,target.x+nearEdge+22,1258);
    if(p.x!==nextX){
        p.vx=0;
        p.dash=0;
    }
    p.y=Math.min(FLOOR,p.y+p.vy);
    if(p.y===FLOOR){
        p.vy=0;p.airJumps=0;
        if(!dashing)boss.airDash=true;
    }
    p.prev=input;p.input=input;
    if(state.noticeLife>0)state.noticeLife--;
    if(p.flash>0)p.flash--;
    if(target.flash>0)target.flash--;
    const shots=state.projectiles as Shot[];
    const fire=(shape:string,art:Art,vx:number,vy:number,damage:number,options:Partial<Shot>={})=>
        shots.push({owner:0,shape,art,x:p.x+p.facing*23,y:p.y-89,vx,vy,damage,life:150,...options});
    if(age%12===0)fire('bossAutoShot','seed',p.facing*16,0,17);
    if((pressed&BOSS_BEAM)&&age>=boss.beamReadyAt){
        fire('bossBeam','bolt',p.facing*28,0,68,{life:180});boss.beamReadyAt=age+90;
    }
    if((pressed&BOSS_BALL)&&age>=boss.ballReadyAt){
        fire('bossBall','orb',p.facing*8,2,51,{gravity:.4,bounces:3,life:180});boss.ballReadyAt=age+120;
    }

    const pattern=attacks[boss.form],beat=age%config.period;
    const order=boss.form==='vmu'?vmuAttackOrder:attackOrder;
    const attackIndex=order[Math.floor(age/config.period)%order.length];
    if(beat===24){
        boss.lastAttack=attackIndex;
        const attack=pattern[attackIndex];
        boss.warning={attack,shots:planAttack(boss.form,attack,p.x,p.y)};
    }
    if(beat===76&&boss.warning){
        const {attack,shots:planned}=boss.warning;
        boss.pending=planned.map(shot=>({shot,art:attack.art,at:age+(shot.delay??0)}));
        boss.warning=null;
    }
    for(const {shot,art,at} of boss.pending){
        if(age!==at)continue;
        const {delay,...trajectory}=shot;
        shots.push({...trajectory,owner:1,shape:'bossHazard',art,variant:boss.lastAttack,
            damage:200,life:art==='missile'&&trajectory.vx<3?460:240,age:0});
        boss.releasedAt=age;
    }

    boss.pending=boss.pending.filter(shot=>shot.at>age);

    const hitBoxes=storyBossHurtboxes(state,boss);
    const playerBox:Box=[oldX-20,oldY-109,oldX+20,oldY-8];
    const blast=(shot:Shot)=>{
        if(hitBoxes.some(([left,top,right,bottom])=>
            (shot.x-within(shot.x,left,right))**2+(shot.y-within(shot.y,top,bottom))**2<=65**2)){target.hp=Math.max(0,target.hp-shot.damage);target.flash=8;}
        for(const hazard of shots)
            if(hazard.owner===1&&(shot.x-hazard.x)**2+(shot.y-hazard.y)**2<=65**2)hazard.life=0;
        boss.blasts.push({x:shot.x,y:shot.y,until:age+20});shot.life=0;
    };
    const hurtPlayer=()=>{
        if(state.godMode||dashing||shield||age<boss.invulnerableUntil)return;
        p.hp=Math.max(0,p.hp-200);p.flash=15;boss.invulnerableUntil=age+60;
    };
    for(const shot of shots){
        if(shot.life<=0)continue;
        const x=shot.x,y=shot.y,width=shotWidth(shot),height=artSize[shot.art][1];
        shot.age=(shot.age??0)+1;
        shot.x+=shot.vx;shot.y+=shot.vy+waveVelocity(shot);shot.vy+=shot.gravity??0;shot.life--;
        if(shot.rolls&&shot.y+height/2>=FLOOR){
            shot.y=FLOOR-height/2;shot.vy=0;shot.gravity=0;
        }
        if(shot.explodes&&shot.y+height/2>=FLOOR&&shot.vy>0){
            const px=within(shot.x,p.x-20,p.x+20),py=within(FLOOR,p.y-109,p.y-8);
            if((shot.x-px)**2+(FLOOR-py)**2<=65**2)hurtPlayer();
            boss.blasts.push({x:shot.x,y:FLOOR,until:age+20});
            shot.life=0;continue;
        }
        if(shot.bounces!==undefined&&shot.y+height/2>=FLOOR&&shot.vy>0){
            shot.y=FLOOR-height/2;shot.vy=-Math.max(3,shot.vy*.65);
            if(--shot.bounces<0){if(shot.shape==='bossBall')blast(shot);else shot.life=0;continue;}
        }
        if(shot.owner===0&&!shot.hit){
            const dx=shot.x-x,dy=shot.y-y;
            let contact=Infinity,hitBox:Box|undefined;
            for(const box of hitBoxes){
                if(y+height/2<box[1]&&shot.y+height/2<box[1]||y-height/2>box[3]&&shot.y-height/2>box[3])continue;
                const at=sweepTime(x,y,dx,dy,box,width/2,height/2);
                if(at!==null&&at<contact){contact=at;hitBox=box;}
            }
            if(hitBox){
                const impactX=within(x+dx*contact,hitBox[0],hitBox[2]),impactY=within(y+dy*contact,hitBox[1],hitBox[3]);
                if(shot.shape==='bossBall'){shot.x=impactX;shot.y=impactY;blast(shot);continue;}
                target.hp=Math.max(0,target.hp-shot.damage);target.flash=8;shot.hit=true;
                boss.impacts.push({x:impactX,y:impactY,until:age+9});
                if(shot.shape!=='bossBeam')shot.life=0;
            }
        }
        if(shot.shape==='bossBall'&&shot.life===0)blast(shot);
        if(shot.owner===1&&sweepTime(x,y,shot.x-x-(p.x-oldX),shot.y-y-(p.y-oldY),playerBox,width/2,height/2)!==null){
            shot.life=0;
            if(shot.explodes)boss.blasts.push({x:shot.x,y:shot.y,until:age+20});
            hurtPlayer();
        }
    }
    state.projectiles=shots.filter(shot=>shot.life>0&&shot.x>-60&&shot.x<1340&&shot.y>135&&shot.y<FLOOR+30);
    boss.blasts=boss.blasts.filter(b=>b.until>age);
    boss.impacts=boss.impacts.filter(b=>b.until>age);
    if(p.dash>0)p.dash--;
    if(p.hp===0||target.hp===0)state.winner=p.hp===target.hp?2:target.hp===0?0:1;
}

async function loadImage(url:string){
    const image=new Image();image.src=url;await image.decode();return image;
}

export async function loadStoryBossArt(form:BossForm){
    const forms:BossForm[]=form==='giant'?['giant','mecha']:[form];
    const [projectiles,poses,custom]=await Promise.all([
        Promise.all(Object.entries(projectileUrls).map(async ([key,url])=>[key,await loadImage(url)] as const)),
        Promise.all(forms.map(async key=>{
            const image=await loadImage(import.meta.env.BASE_URL+'story-animations/'+key+'-attacks.png');
            const size=key==='dragon'?1536:1024;
            const width=key==='art'?artPose.width*2:size,height=key==='art'?artPose.height*2:size;
            if(image.naturalWidth!==width||image.naturalHeight!==height)throw new Error('Invalid boss attack sheet: '+key);
            return [key,image] as const;
        })),
        Promise.all(forms.map(async key=>{
            const image=await loadImage(import.meta.env.BASE_URL+'story-animations/'+key+'-projectiles.png');
            if(image.naturalWidth!==512||image.naturalHeight!==128)throw new Error('Invalid projectile sheet: '+key);
            return [key,image] as const;
        })),
    ]);
    return {
        projectiles:Object.fromEntries(projectiles) as Record<Art,HTMLImageElement>,
        poses:Object.fromEntries(poses) as Partial<Record<BossForm,HTMLImageElement>>,
        custom:Object.fromEntries(custom) as Partial<Record<BossForm,HTMLImageElement>>,
    };
}

export function drawStoryBossPose(ctx:CanvasRenderingContext2D,state:CombatState,boss:StoryBoss,images:Awaited<ReturnType<typeof loadStoryBossArt>>){
    const image=images.poses[boss.form],releaseAge=state.frame-boss.startFrame-boss.releasedAt;
    const attackPose=attacks[boss.form][boss.lastAttack].pose??boss.lastAttack;
    if(image&&boss.form==='vmu'){
        const frame=state.winner!==null?0:boss.warning?Math.min(3,Math.floor((state.frame-boss.startFrame)%formConfig.vmu.period/14)-1)
            :releaseAge<24?4+attackPose*4+Math.floor(releaseAge/6):0;
        ctx.save();ctx.imageSmoothingEnabled=false;
        ctx.drawImage(image,frame%4*256,Math.floor(frame/4)*256,256,256,storyBossX('vmu')-128,FLOOR-208,256,256);
        ctx.restore();return true;
    }
    if(image&&boss.form==='art'&&state.winner===null){
        const frame=!boss.warning&&(boss.pending.length>0||releaseAge<14)?attackPose+1:0;
        const {width,height,x,y,scale}=artPose;
        ctx.save();ctx.imageSmoothingEnabled=false;
        ctx.translate(storyBossX('art'),FLOOR);ctx.scale(scale,scale);
        ctx.drawImage(image,frame%2*width,Math.floor(frame/2)*height,width,height,-x,-y,width,height);
        ctx.restore();return true;
    }
    if(!image||state.winner!==null||(!boss.warning&&releaseAge>=21))return false;
    const frame=attackFrame(boss,state.frame-boss.startFrame);
    // The mecha's neutral pose is the last boarding cel, including during warnings.
    if(boss.form==='mecha'&&frame===0)return false;
    ctx.save();ctx.imageSmoothingEnabled=false;
    const size=boss.form==='dragon'?768:512;
    const anchorY=boss.form==='dragon'?580:480;
    ctx.drawImage(image,frame%2*size,Math.floor(frame/2)*size,size,size,
        storyBossX(boss.form)-size/2,FLOOR-anchorY,size,size);
    ctx.restore();
    return true;
}

export function drawStoryBossAttacks(ctx:CanvasRenderingContext2D,state:CombatState,boss:StoryBoss,images:Awaited<ReturnType<typeof loadStoryBossArt>>){
    if(state.winner!==null)return;
    const age=state.frame-boss.startFrame,p=state.fighters[0];
    ctx.save();ctx.imageSmoothingEnabled=false;
    if(boss.warning){
        ctx.font='bold 17px monospace';ctx.textAlign='center';ctx.fillStyle='#ffca96';
        ctx.fillText(boss.warning.attack.name.toUpperCase(),640,208);
    }
    for(const shot of state.projectiles as Shot[]){
        const height=artSize[shot.art][1];
        ctx.save();ctx.translate(Math.round(shot.x),Math.round(shot.y));
        if(shot.shape!=='bossBall')ctx.rotate(Math.atan2(shot.vy+waveVelocity(shot),shot.vx));
        const drawWidth=shotWidth(shot);
        const custom=images.custom[boss.form];
        if(shot.owner===1&&shot.variant!==undefined&&custom){
            ctx.drawImage(custom,shot.variant*128,0,128,128,-drawWidth/2,-height/2,drawWidth,height);
        }else ctx.drawImage(images.projectiles[shot.art],-drawWidth/2,-height/2,drawWidth,height);
        ctx.restore();
    }
    for(const impact of boss.impacts){
        const t=(impact.until-age)/9,r=4+15*(1-t);
        ctx.globalAlpha=t;ctx.strokeStyle='#ffe383';ctx.lineWidth=3;
        ctx.beginPath();
        for(let i=0;i<4;i++){
            const a=i*Math.PI/2+Math.PI/4,dx=Math.cos(a),dy=Math.sin(a);
            ctx.moveTo(impact.x+dx*r*.35,impact.y+dy*r*.35);ctx.lineTo(impact.x+dx*r,impact.y+dy*r);
        }
        ctx.stroke();ctx.fillStyle='#fff9d7';ctx.fillRect(impact.x-3,impact.y-3,6,6);
    }
    for(const blast of boss.blasts){
        ctx.strokeStyle='#ffbc66';ctx.globalAlpha=(blast.until-age)/20;ctx.lineWidth=4;
        ctx.beginPath();ctx.arc(blast.x,blast.y,65*(1-ctx.globalAlpha*.7),0,Math.PI*2);ctx.stroke();
    }
    ctx.globalAlpha=1;
    if(age<boss.shieldReadyAt-105){
        ctx.strokeStyle='#7ff0ff';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(p.x,p.y-58,35,61,0,0,Math.PI*2);ctx.stroke();
    }
    const cooldown=(readyAt:number)=>readyAt<=age?'READY':((readyAt-age)/60).toFixed(1)+'s';
    ctx.font='bold 15px monospace';ctx.fillStyle='#eaf0f7';ctx.textAlign='center';
    ctx.fillText(`X SHIELD ${cooldown(boss.shieldReadyAt)}   C BEAM ${cooldown(boss.beamReadyAt)}   V BALL ${cooldown(boss.ballReadyAt)}`,640,150);
    ctx.restore();
}
