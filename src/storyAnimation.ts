import {TICK_RATE,WIDTH} from './core';
import {STORY_BOSS_X,storyBossX,type BossForm} from './storyBoss';
import manifest from './storyAnimationManifest.json';

export type StoryClip = keyof typeof manifest;
export type StoryScenePhase = 'intro'|'outro'|'boss'|'mecha';
export interface StoryAnimationPlan {
    intro:StoryClip[];outro:StoryClip[];boss?:StoryClip[];mecha?:StoryClip[];form?:BossForm;replaceDefeat:boolean;
}
/** Cinematics separating the regular bout and its fixed-screen boss forms. */
export function storyAnimationPlan(opponent:string,isStory:boolean):StoryAnimationPlan {
    const plan:StoryAnimationPlan={intro:[],outro:[],replaceDefeat:false};
    if(!isStory)return plan;
    switch(opponent){
        case 'nick':return {intro:['nick-juicy'],boss:['nick-mount'],outro:['nick-flight'],form:'dragon',replaceDefeat:true};
        case 'guest07':return {...plan,boss:['juicy-robot'],form:'juicy',replaceDefeat:true};
        case 'sproto943':return {...plan,boss:['art-fusion','mega-woman-growth'],form:'art',replaceDefeat:true};
        case 'vela':return {...plan,boss:['morelight-smoke'],mecha:['morelight-shrink','morelight-mecha'],form:'giant',outro:['morelight-ejection','morelight-wizard','morelight-exit']};
        case 'vaudream':return {...plan,outro:['vmu-shield','vmu-black-hole'],form:'vmu',replaceDefeat:true};
        default:return plan;
    }
}

const bossClips:Partial<Record<BossForm,StoryClip>>={
    giant:'morelight-smoke',mecha:'morelight-mecha',dragon:'nick-dragon',juicy:'juicy-robot',art:'mega-woman-growth',
};

export function createStoryAnimation(){
    let plan=storyAnimationPlan('',false),images=new Map<StoryClip,HTMLImageElement>();
    let phase:StoryScenePhase|null=null,index=0,age=0,skipRequested=false,generation=0;
    const consumed=new Set<StoryScenePhase>();
    let sceneAnchorX:number|null=null,heldOutro=false,blackout=0;
    const facingFor=(id:StoryClip,defeatFacing:number)=>id==='morelight-smoke'?defeatFacing:(id==='vmu-black-hole'||id==='vmu-shield')?1:['nick-juicy','nick-mount','nick-flight','juicy-robot','art-fusion','mega-woman-growth','morelight-shrink','morelight-mecha','morelight-ejection','morelight-wizard','morelight-exit'].includes(id)?1:-1;
    function reset(){phase=null;index=0;age=0;skipRequested=false;sceneAnchorX=null;heldOutro=false;blackout=0;consumed.clear();}
    function clear(){generation++;reset();images.clear();plan=storyAnimationPlan('',false);}
    function finish(){
        if(!phase)return false;
        heldOutro=phase==='outro';index=plan[phase]!.length-1;
        const spec=manifest[plan[phase]![index]];
        age=Math.ceil(spec.frames*TICK_RATE/spec.fps)-1;
        phase=null;skipRequested=false;return false;
    }
    return {
        async load(next:StoryAnimationPlan){
            const token=++generation;
            const loaded=await Promise.all([...new Set([...next.intro,...next.outro,...(next.boss??[]),...(next.mecha??[]),...(next.form&&bossClips[next.form]?[bossClips[next.form]!]:[])])].map(async id=>{
                const spec=manifest[id],asset=new Image();
                asset.src=import.meta.env.BASE_URL+'story-animations/'+spec.image;
                await asset.decode();
                if(asset.naturalWidth!==spec.columns*spec.width||asset.naturalHeight<Math.ceil(spec.frames/spec.columns)*spec.height)
                    throw new Error('Invalid story animation dimensions: '+id);
                return [id,asset] as const;
            }));
            if(token!==generation)return;
            reset();images=new Map(loaded);plan=next;
        },
        clear,reset,
        startBossBlackout(){blackout=Math.round(.3*TICK_RATE);},
        get blackingOut(){return blackout>0;},
        advanceBlackout(){return --blackout===0;},
        cancel(){blackout=0;heldOutro ||= phase==='outro';phase=null;skipRequested=false;},
        start(next:StoryScenePhase){
            if(phase||consumed.has(next)||!plan[next]?.length||!plan[next].every(id=>images.has(id)))return false;
            consumed.add(next);phase=next;index=0;age=0;skipRequested=false;sceneAnchorX=null;return true;
        },
        skip(){if(phase)skipRequested=true;},
        advance(){
            if(!phase)return false;
            if(skipRequested)return finish();
            const clip=manifest[plan[phase]![index]];
            if(++age*clip.fps>=clip.frames*TICK_RATE){
                age=0;
                if(++index>=plan[phase]!.length)return finish();
            }
            return true;
        },
        draw(ctx:CanvasRenderingContext2D,x:number,y:number,defeatFacing=1,boss?:BossForm){
            const drawPhase=phase??(heldOutro?'outro':null);
            if(!drawPhase&&!boss)return false;
            const id=drawPhase?plan[drawPhase]![index]:bossClips[boss!];
            if(!id)return false;
            const spec=manifest[id],image=images.get(id);
            if(!image)return false;
            const frame=drawPhase?Math.min(spec.frames-1,Math.floor(age*spec.fps/TICK_RATE)):boss==='dragon'?0:spec.frames-1;
            // Mirror the recovery to match Morelight's landed KO; other clips face inward.
            const facing=drawPhase?facingFor(id,defeatFacing):1;
            if(drawPhase&&sceneAnchorX===null){
                const bounds=plan[drawPhase]!.map(key=>{
                    const cell=manifest[key],direction=facingFor(key,defeatFacing);
                    const left=(direction===1?cell.x-cell.left:cell.right-cell.x)*cell.scale;
                    const right=(direction===1?cell.right-cell.x:cell.x-cell.left)*cell.scale;
                    return {left,right};
                });
                const left=Math.max(...bounds.map(v=>v.left)),right=Math.max(...bounds.map(v=>v.right));
                sceneAnchorX=id==='nick-juicy'?spec.x*spec.scale:Math.max(left,Math.min(WIDTH-right,x));
            }
            ctx.save();ctx.imageSmoothingEnabled=false;
            const anchor=(id==='vmu-black-hole'||id==='vmu-shield')?storyBossX('vmu')
                :id==='nick-mount'?storyBossX('dragon')-340
                :id==='nick-flight'?storyBossX('dragon')
                :id==='art-fusion'||id==='mega-woman-growth'?storyBossX('art')
                :id==='morelight-shrink'||id==='morelight-mecha'||id==='juicy-robot'?STORY_BOSS_X
                :!drawPhase&&boss?storyBossX(boss):sceneAnchorX??x;
            ctx.translate(Math.round(anchor),Math.round(y));ctx.scale(facing*spec.scale,spec.scale);
            const drawFrame=(cel:number,left=0,width=spec.width,offset=0)=>{
                ctx.drawImage(image,cel%spec.columns*spec.width+left,Math.floor(cel/spec.columns)*spec.height,
                    width,spec.height,left-spec.x+offset,-spec.y,width,spec.height);
            };
            if(id==='morelight-mecha'&&drawPhase&&frame>=26&&frame<84){
                // Hold the pilot in place and slide the parked suit in from the right.
                const progress=Math.max(0,(frame-32)/52);
                const travel=(WIDTH-anchor)/spec.scale+spec.x-88;
                drawFrame(Math.max(0,25-(frame-26)*2));
                drawFrame(84,88,spec.width-88,Math.round(travel*(1-progress)**2));
            }else if(id==='morelight-ejection'&&frame>=26&&frame<60){
                // Keep the blast centered on the cockpit and ease back to the ejection pose.
                const scale=.66+.34*Math.max(0,(frame-48)/12);
                ctx.translate(28,-112);ctx.scale(scale,scale);ctx.translate(-28,112);
                drawFrame(frame);
            }else drawFrame(frame);
            ctx.restore();return true;
        },
        portalPull(){
            if(plan.outro[index]!=='vmu-black-hole'||(phase!=='outro'&&!heldOutro))return;
            const spec=manifest['vmu-black-hole'];
            const frame=age*spec.fps/TICK_RATE;
            if(frame<24)return;
            return {x:storyBossX('vmu')+(256-spec.x)*spec.scale,y:(55-spec.y)*spec.scale,
                progress:Math.min(1,(frame-24)/14)};
        },
        get bossForm(){return plan.form;},
        get replaceDefeat(){return plan.replaceDefeat;},
        get active(){return phase;},
        snapshot:()=>({phase,blackout,clip:phase?plan[phase]![index]:null,frame:phase?Math.floor(age*manifest[plan[phase]![index]].fps/TICK_RATE):0}),
    };
}
