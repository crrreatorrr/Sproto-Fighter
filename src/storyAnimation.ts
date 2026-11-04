import {TICK_RATE,WIDTH} from './core';
import manifest from '../public/story-animations/manifest.json';

export type StoryClip = keyof typeof manifest;
export type StoryScenePhase = 'intro'|'outro';
export interface StoryAnimationPlan {
    intro:StoryClip[];outro:StoryClip[];replaceDefeat:boolean;
}
/** These are presentation scenes, never extra opponents or combat moves. */
export function storyAnimationPlan(opponent:string,isStory:boolean):StoryAnimationPlan {
    const plan:StoryAnimationPlan={intro:[],outro:[],replaceDefeat:false};
    if(!isStory)return plan;
    switch(opponent){
        case 'nick':return {intro:['nick-juicy'],outro:['nick-mount','nick-dragon','nick-flight'],replaceDefeat:true};
        case 'guest07':return {...plan,outro:['juicy-robot'],replaceDefeat:true};
        case 'sproto943':return {...plan,outro:['art-fusion','mega-woman-growth'],replaceDefeat:true};
        case 'vela':return {...plan,outro:['morelight-smoke','morelight-mecha','morelight-wizard','morelight-exit']};
        case 'vaudream':return {...plan,outro:['vmu-shield','vmu-black-hole'],replaceDefeat:true};
        default:return plan;
    }
}

export function createStoryAnimation(){
    let plan=storyAnimationPlan('',false),images=new Map<StoryClip,HTMLImageElement>();
    let phase:StoryScenePhase|null=null,index=0,age=0,skipRequested=false,generation=0;
    const consumed=new Set<StoryScenePhase>();
    let sceneAnchorX:number|null=null,heldOutro=false;
    const facingFor=(id:StoryClip,defeatFacing:number)=>id==='morelight-smoke'?defeatFacing:['nick-juicy','morelight-wizard','morelight-exit'].includes(id)?1:-1;
    function reset(){phase=null;index=0;age=0;skipRequested=false;sceneAnchorX=null;heldOutro=false;consumed.clear();}
    function clear(){generation++;reset();images.clear();plan=storyAnimationPlan('',false);}
    function finish(){
        if(!phase)return false;
        heldOutro=phase==='outro';index=plan[phase].length-1;
        const spec=manifest[plan[phase][index]];
        age=Math.ceil(spec.frames*TICK_RATE/spec.fps)-1;
        phase=null;skipRequested=false;return false;
    }
    return {
        async load(next:StoryAnimationPlan){
            const token=++generation;
            const loaded=await Promise.all([...new Set([...next.intro,...next.outro])].map(async id=>{
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
        cancel(){heldOutro ||= phase==='outro';phase=null;skipRequested=false;},
        start(next:StoryScenePhase){
            if(phase||consumed.has(next)||!plan[next].length||!plan[next].every(id=>images.has(id)))return false;
            consumed.add(next);phase=next;index=0;age=0;skipRequested=false;sceneAnchorX=null;return true;
        },
        skip(){if(phase)skipRequested=true;},
        advance(){
            if(!phase)return false;
            if(skipRequested)return finish();
            const clip=manifest[plan[phase][index]];
            if(++age*clip.fps>=clip.frames*TICK_RATE){
                age=0;
                if(++index>=plan[phase].length)return finish();
            }
            return true;
        },
        draw(ctx:CanvasRenderingContext2D,x:number,y:number,defeatFacing=1){
            const drawPhase=phase??(heldOutro?'outro':null);
            if(!drawPhase)return false;
            const id=plan[drawPhase][index],spec=manifest[id],image=images.get(id)!;
            const frame=Math.min(spec.frames-1,Math.floor(age*spec.fps/TICK_RATE));
            // Mirror the recovery to match Morelight's landed KO; other clips face inward.
            const facing=facingFor(id,defeatFacing);
            if(sceneAnchorX===null){
                const bounds=plan[drawPhase].map(key=>{
                    const cell=manifest[key],direction=facingFor(key,defeatFacing);
                    const left=(direction===1?cell.x:cell.width-cell.x)*cell.scale;
                    return {left,right:cell.width*cell.scale-left};
                });
                const left=Math.max(...bounds.map(v=>v.left)),right=Math.max(...bounds.map(v=>v.right));
                sceneAnchorX=id==='nick-juicy'?spec.x*spec.scale:Math.max(left,Math.min(WIDTH-right,x));
            }
            ctx.save();ctx.imageSmoothingEnabled=false;
            ctx.translate(Math.round(sceneAnchorX),Math.round(y));ctx.scale(facing,1);
            ctx.drawImage(image,frame%spec.columns*spec.width,Math.floor(frame/spec.columns)*spec.height,
                spec.width,spec.height,-Math.round(spec.x*spec.scale),-Math.round(spec.y*spec.scale),
                Math.round(spec.width*spec.scale),Math.round(spec.height*spec.scale));
            ctx.restore();return true;
        },
        get replaceDefeat(){return plan.replaceDefeat;},
        get active(){return phase;},
        snapshot:()=>({phase,clip:phase?plan[phase][index]:null,frame:phase?Math.floor(age*manifest[plan[phase][index]].fps/TICK_RATE):0}),
    };
}
