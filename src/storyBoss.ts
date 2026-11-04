import {A,FLOOR,type CombatState,type Projectile} from './core';
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
    Space:A.up,
    ShiftLeft:A.dash,ShiftRight:A.dash,KeyX:BOSS_SHIELD,KeyC:BOSS_BEAM,KeyV:BOSS_BALL,
};
const projectileUrls={missile,laser,bolt,diamond,orb,roller,seed};
type Art=keyof typeof projectileUrls;
const artSize:Record<Art,readonly [number,number]>={
    missile:[44,18],laser:[96,14],bolt:[30,10],diamond:[26,20],orb:[24,24],roller:[36,20],seed:[14,14],
};
type Attack={name:string;art:Art;speed:number;origin:readonly [number,number];pattern:'aim'|'fan'|'floor'|'arc'|'burst'|'bomb'|'screen'};
const missileSpit:Attack={name:'Mouth missile',art:'missile',speed:5,origin:[100,-231],pattern:'aim'};
const attacks:Record<BossForm,readonly Attack[]>={
    vmu:[{name:'Laser burst',art:'laser',speed:19,origin:[25,-89],pattern:'burst'},{name:'Bomb drop',art:'orb',speed:10,origin:[44,-68],pattern:'bomb'},{name:'Slow missile screen',art:'missile',speed:2.8,origin:[44,-68],pattern:'screen'}],
    giant:[missileSpit,{name:'Spit spread',art:'seed',speed:7,origin:[100,-239],pattern:'fan'},{name:'Ground roll',art:'roller',speed:9,origin:[142,-156],pattern:'floor'}],
    mecha:[{...missileSpit,name:'Missile barrage',pattern:'burst',speed:6,origin:[98,-213]},{name:'Cannon spread',art:'diamond',speed:9,origin:[203,-100],pattern:'fan'},{name:'Mortar',art:'orb',speed:8,origin:[194,-233],pattern:'arc'}],
    dragon:[{name:'Dragonfire',art:'bolt',speed:10,origin:[174,-348],pattern:'burst'},{name:'Wing volley',art:'missile',speed:6,origin:[192,-196],pattern:'fan'},{name:'Ember roll',art:'roller',speed:8,origin:[188,-126],pattern:'floor'}],
    art:[{name:'Paint burst',art:'orb',speed:7,origin:[65,-189],pattern:'burst'},{name:'Palette fan',art:'diamond',speed:8,origin:[56,-223],pattern:'fan'},{name:'Rolling ink',art:'roller',speed:10,origin:[50,-100],pattern:'floor'}],
    juicy:[{name:'Rocket salvo',art:'missile',speed:6,origin:[48,-215],pattern:'burst'},{name:'Pulse fan',art:'orb',speed:8,origin:[-82,-254],pattern:'fan'},{name:'Ricochet mortar',art:'diamond',speed:8,origin:[-22,-248],pattern:'arc'}],
};
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
type Shot=Projectile&{art:Art;hit?:boolean;explodes?:boolean;rolls?:boolean};
type ShotPlan={x:number;y:number;vx:number;vy:number;gravity?:number;bounces?:number;delay?:number;explodes?:boolean;rolls?:boolean};
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
}

export function startStoryBoss(state:CombatState,form:BossForm):StoryBoss {
    const [player,opponent]=state.fighters;
    state.fighters=[
        {...makeFighter(player.id,790,-1),best:player.best},
        makeFighter(opponent.id,storyBossX(form),1),
    ];
    state.projectiles=[];state.effects=[];state.throwState=null;state.freeze=0;state.winner=null;
    state.notice=storyBossTitle(form);state.noticeLife=135;
    return {form,startFrame:state.frame,entryHp:player.hp,jumpBuffer:0,dashReadyAt:0,airDash:true,shieldReadyAt:0,
        invulnerableUntil:0,beamReadyAt:0,ballReadyAt:0,warning:null,pending:[],releasedAt:-100,lastAttack:0,blasts:[]};
}

function within(value:number,min:number,max:number){return Math.max(min,Math.min(max,value));}
function sweep(x:number,y:number,dx:number,dy:number,[left,top,right,bottom]:Box,w:number,h:number){
    let enter=0,exit=1;
    for(const [start,delta,min,max] of [[x,dx,left-w,right+w],[y,dy,top-h,bottom+h]]){
        if(delta===0){if(start<min||start>max)return false;continue;}
        const a=(min-start)/delta,b=(max-start)/delta;
        enter=Math.max(enter,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));
    }
    return enter<=exit;
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
        case 'screen':return [20,65,112,38,90,136].map((height,i)=>({x,y,vx:attack.speed,vy:(FLOOR-height-y)/140,delay:i*10}));
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
    p.x=within(p.x+p.vx,target.x+bounds[2]+22,1258);
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

    const pattern=attacks[boss.form],beat=age%config.period,attackIndex=Math.floor(age/config.period)%pattern.length;
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
        shots.push({...trajectory,owner:1,shape:'bossHazard',art,damage:200,life:art==='missile'&&trajectory.vx<3?460:240});
        boss.releasedAt=age;
    }

    boss.pending=boss.pending.filter(shot=>shot.at>age);

    const targetBox:Box=[target.x+bounds[0],target.y+bounds[1],target.x+bounds[2],target.y+bounds[3]];
    const playerBox:Box=[oldX-20,oldY-109,oldX+20,oldY-8];
    const blast=(shot:Shot)=>{
        const x=within(shot.x,targetBox[0],targetBox[2]),y=within(shot.y,targetBox[1],targetBox[3]);
        if((shot.x-x)**2+(shot.y-y)**2<=65**2){target.hp=Math.max(0,target.hp-shot.damage);target.flash=8;}
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
        const x=shot.x,y=shot.y,[width,height]=artSize[shot.art];
        shot.x+=shot.vx;shot.y+=shot.vy;shot.vy+=shot.gravity??0;shot.life--;
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
        if(shot.owner===0&&!shot.hit&&sweep(x,y,shot.x-x,shot.y-y,targetBox,width/2,height/2)){
            if(shot.shape==='bossBall'){blast(shot);continue;}
            target.hp=Math.max(0,target.hp-shot.damage);target.flash=8;shot.hit=true;
            if(shot.shape!=='bossBeam')shot.life=0;
        }
        if(shot.shape==='bossBall'&&shot.life===0)blast(shot);
        if(shot.owner===1&&sweep(x,y,shot.x-x-(p.x-oldX),shot.y-y-(p.y-oldY),playerBox,width/2,height/2)){
            shot.life=0;
            if(shot.explodes)boss.blasts.push({x:shot.x,y:shot.y,until:age+20});
            hurtPlayer();
        }
    }
    state.projectiles=shots.filter(shot=>shot.life>0&&shot.x>-60&&shot.x<1340&&shot.y>135&&shot.y<FLOOR+30);
    boss.blasts=boss.blasts.filter(b=>b.until>age);
    if(p.dash>0)p.dash--;
    if(p.hp===0||target.hp===0)state.winner=p.hp===target.hp?2:target.hp===0?0:1;
}

async function loadImage(url:string){
    const image=new Image();image.src=url;await image.decode();return image;
}

export async function loadStoryBossArt(form:BossForm){
    const forms:BossForm[]=form==='giant'?['giant','mecha']:[form];
    const [projectiles,poses]=await Promise.all([
        Promise.all(Object.entries(projectileUrls).map(async ([key,url])=>[key,await loadImage(url)] as const)),
        Promise.all(forms.map(async key=>{
            const image=await loadImage(import.meta.env.BASE_URL+'story-animations/'+key+'-attacks.png');
            if(image.naturalWidth!==1024||image.naturalHeight!==1024)throw new Error('Invalid boss attack sheet: '+key);
            return [key,image] as const;
        })),
    ]);
    return {
        projectiles:Object.fromEntries(projectiles) as Record<Art,HTMLImageElement>,
        poses:Object.fromEntries(poses) as Partial<Record<BossForm,HTMLImageElement>>,
    };
}

export function drawStoryBossPose(ctx:CanvasRenderingContext2D,state:CombatState,boss:StoryBoss,images:Awaited<ReturnType<typeof loadStoryBossArt>>){
    const image=images.poses[boss.form],releaseAge=state.frame-boss.startFrame-boss.releasedAt;
    if(image&&boss.form==='vmu'){
        const frame=state.winner!==null?0:boss.warning?Math.min(3,Math.floor((state.frame-boss.startFrame)%formConfig.vmu.period/14)-1)
            :releaseAge<24?4+boss.lastAttack*4+Math.floor(releaseAge/6):0;
        ctx.save();ctx.imageSmoothingEnabled=false;
        ctx.drawImage(image,frame%4*256,Math.floor(frame/4)*256,256,256,storyBossX('vmu')-128,FLOOR-208,256,256);
        ctx.restore();return true;
    }
    if(!image||state.winner!==null||(!boss.warning&&releaseAge>=21))return false;
    const frame=boss.warning||releaseAge>=14?0:boss.lastAttack+1;
    ctx.save();ctx.imageSmoothingEnabled=false;
    const scale=boss.form==='dragon'?2:1;
    const drop=boss.form==='dragon'?36:0;
    ctx.drawImage(image,frame%2*512,Math.floor(frame/2)*512,512,512,
        storyBossX(boss.form)-256*scale,FLOOR-480*scale+drop,512*scale,512*scale);
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
        const [width,height]=artSize[shot.art];
        ctx.save();ctx.translate(Math.round(shot.x),Math.round(shot.y));
        if(shot.shape!=='bossBall')ctx.rotate(Math.atan2(shot.vy,shot.vx));
        const drawWidth=shot.shape==='bossBeam'?62:width;
        ctx.drawImage(images.projectiles[shot.art],-drawWidth/2,-height/2,drawWidth,height);
        ctx.restore();
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
