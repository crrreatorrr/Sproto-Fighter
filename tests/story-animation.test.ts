import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {createStoryAnimation,storyAnimationPlan,type StoryClip} from '../src/storyAnimation';
import manifest from '../src/storyAnimationManifest.json';
import {startStoryBoss} from '../src/storyBoss';
import {createState} from '../src/core';
import {createRoundPresentation,advanceRoundPresentation,beginRoundOutro} from '../src/animationEvents';

const requests:string[]=[];
class FakeImage {
    src='';naturalWidth=0;naturalHeight=0;
    async decode(){
        requests.push(this.src);
        const spec=Object.values(manifest).find(v=>this.src.endsWith(v.image))!;
        this.naturalWidth=spec.width*spec.columns;this.naturalHeight=Math.ceil(spec.frames/spec.columns)*spec.height;
    }
}
beforeEach(()=>{requests.length=0;vi.stubGlobal('Image',FakeImage);});
afterEach(()=>vi.unstubAllGlobals());
const order=(animation:ReturnType<typeof createStoryAnimation>)=>{
    const clips:string[]=[];
    for(let i=0;i<10000&&animation.active;i++){
        const id=animation.snapshot().clip!;if(clips.at(-1)!==id)clips.push(id);
        animation.advance();
    }
    expect(animation.active).toBe(null);return clips;
};

// Run the real main frame hook; replace only combat/DOM/network boundaries.
const source=readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');
const parsed=ts.createSourceFile('main.ts',source,ts.ScriptTarget.Latest,true);
const frameHook=parsed.statements.find(node=>ts.isFunctionDeclaration(node)&&node.name?.text==='advanceRoundFrame')!;
const compiled=ts.transpileModule(frameHook.getText(parsed),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
async function harness(id:string,win=0){
    const animation=createStoryAnimation();await animation.load(storyAnimationPlan(id,true));
    const state=createState('highsproto','cpu',id as any),presentation=createRoundPresentation();presentation.phase='fight';
    const calls:string[]=[],frames:number[][]=[];
    const run=new Function('deps',`
        const {state,presentation,storyAnimation,calls,frames,advanceRoundPresentation,beginRoundOutro,win,startStoryBoss}=deps;
        let storyBoss=null;const bossStarts=[];const stepStoryBoss=()=>{state.winner=win;};
        const versus={advance:()=>false};const countdown={advance:()=>false,show:()=>calls.push('countdown')};
        const held=new Set();let queued=0,queued2=0,padNeedsRelease=false;
        const online=null,mode='cpu',qaPanel=null,qaRecord=()=>{},qaStopAtOutro=()=>{};
        const cpuInput=()=>0,playRetainCallout=()=>{},reportRound=()=>calls.push('report');
        const story={finishMatch:()=>calls.push('save'),onRoundEnd:()=>{calls.push('result');return true;}};
        const step=()=>{state.winner=win;};
        ${compiled}
        return advanceRoundFrame;
    `)({state,presentation,storyAnimation:animation,calls,frames,advanceRoundPresentation,beginRoundOutro,win,startStoryBoss});
    return {animation,state,presentation,calls,frames,run};
}

describe('story animation ordering and lifecycle',()=>{
    it('uses each boss\'s own scenes and preserves Morelight\'s full transformation order',()=>{
        expect(storyAnimationPlan('vela',true)).toEqual({intro:[],boss:['morelight-smoke'],mecha:['morelight-shrink','morelight-mecha'],form:'giant',outro:['morelight-ejection','morelight-wizard','morelight-exit'],replaceDefeat:false});
        expect(storyAnimationPlan('vaudream',true).outro).toEqual(['vmu-black-hole']);
        expect(storyAnimationPlan('guest07',true).boss).toEqual(['juicy-robot']);
        expect(storyAnimationPlan('sproto943',true).boss).toEqual(['art-fusion','mega-woman-growth']);
        expect(storyAnimationPlan('sproto865',true).outro).toEqual([]);
        for(const id of ['nick','guest07','sproto943','vela','vaudream'])expect(storyAnimationPlan(id,false).outro).toEqual([]);
    });
    it('plays Nick/Juicy only before Nick and resets it for retry',async()=>{
        const a=createStoryAnimation();await a.load(storyAnimationPlan('nick',true));
        expect(a.start('intro')).toBe(true);expect(order(a)).toEqual(['nick-juicy']);
        expect(a.start('intro')).toBe(false);a.reset();expect(a.start('intro')).toBe(true);
        a.skip();expect(a.advance()).toBe(false);expect(a.start('intro')).toBe(false);
        await a.load(storyAnimationPlan('guest07',true));expect(a.start('intro')).toBe(false);
        a.clear();expect(a.start('outro')).toBe(false);
    });
    it('starts VMU directly and plays the portal pull before saving victory',async()=>{
        const t=await harness('vaudream');
        t.run(0);
        expect(t.presentation.phase).toBe('fight');
        expect(t.animation.active).toBeNull();
        expect(t.state.winner).toBeNull();
        expect(t.calls).toEqual([]);
        t.run(0);
        expect(t.animation.snapshot().clip).toBe('vmu-black-hole');
        expect(t.calls).toEqual([]);
        let sawPull=false;
        while(t.animation.active){
            const pull=t.animation.portalPull();
            if(pull&&pull.progress>0&&pull.progress<1)sawPull=true;
            t.run(0);
        }
        expect(sawPull).toBe(true);
        expect(t.animation.portalPull()?.progress).toBe(1);
        expect(t.calls).toEqual(['save','report','result']);
        expect(t.frames).toHaveLength(2);
    });
    it('requires both Morelight forms to be cleared before saving or playing the final scenes',async()=>{
        const t=await harness('vela');
        t.run(0);
        expect(t.presentation.phase).toBe('outro');expect(t.calls).toEqual([]);
        for(let n=0;n<96;n++)t.run(0);
        expect(t.animation.snapshot()).toMatchObject({phase:'boss',clip:'morelight-smoke'});
        expect(t.calls).toEqual([]);
        t.animation.skip();t.run(0);
        expect(t.presentation.phase).toBe('fight');expect(t.state.winner).toBe(null);
        expect(t.calls).toEqual([]);
        t.run(0);
        expect(t.animation.snapshot().clip).toBe('morelight-shrink');
        for(let n=0;n<100&&t.animation.snapshot().clip==='morelight-shrink';n++)t.run(0);
        expect(t.animation.snapshot().clip).toBe('morelight-mecha');
        expect(t.calls).toEqual([]);
        t.animation.skip();t.run(0);
        expect(t.state.winner).toBe(null);
        t.run(0);
        expect(t.animation.snapshot().clip).toBe('morelight-ejection');
        expect(t.calls).toEqual(['save']);
        const seen:string[]=[];
        while(t.animation.active){const id=t.animation.snapshot().clip!;if(seen.at(-1)!==id)seen.push(id);t.run(0);}
        expect(seen).toEqual(storyAnimationPlan('vela',true).outro);
        expect(t.calls).toEqual(['save','report','result']);
        expect(t.frames).toHaveLength(3);
    });
    it.each([['nick','nick-mount'],['guest07','juicy-robot'],['sproto943','art-fusion']])(
        '%s skips regular defeat and starts the boss transformation immediately',async(id,clip)=>{
            const t=await harness(id);t.run(0);
            expect(t.presentation.phase).toBe('result');
            expect(t.animation.snapshot()).toMatchObject({phase:'boss',clip});
            expect(t.calls).toEqual([]);
            t.animation.skip();t.run(0);
            expect(t.state.winner).toBe(null);
            t.run(0);
            expect(t.calls).toEqual(['save']);
        });
    it('skip completes the result once without leaking input or replay frames',async()=>{
        const t=await harness('vaudream');t.run(0);t.run(0);t.animation.skip();t.run(255);
        expect(t.calls).toEqual(['save','report','result']);expect(t.frames).toHaveLength(2);
        t.run(255);expect(t.calls).toEqual(['save','report','result']);
    });
    it.each([1,2])('loss/draw %s keeps normal outro and never plays boss scenes',async winner=>{
        const t=await harness('nick',winner);t.run(0);expect(t.animation.active).toBe(null);
        expect(t.presentation.phase).toBe('outro');for(let n=0;n<96;n++)t.run(0);
        expect(t.calls).toEqual(['save','report','result']);
    });
    it('finishes Nick intro before countdown and records no combat inputs',async()=>{
        const t=await harness('nick');t.presentation.phase='intro';t.animation.start('intro');
        while(t.animation.active)t.run(255);
        expect(t.calls).toEqual(['countdown']);expect(t.frames).toHaveLength(0);expect(t.state.winner).toBe(null);
    });
    it('cancels a result scene during retry without delivering another result',async()=>{
        const t=await harness('vaudream');t.run(0);t.run(0);t.animation.cancel();t.run(0);
        expect(t.animation.active).toBe(null);expect(t.calls).toEqual([]);
        t.animation.reset();expect(t.animation.start('outro')).toBe(true);
    });
    it('holds the last sprite after completion instead of flashing the death pose',async()=>{
        const a=createStoryAnimation();await a.load(storyAnimationPlan('vaudream',true));a.start('outro');order(a);
        const draw=vi.fn(),ctx={save(){},restore(){},translate(){},scale(){},drawImage:draw};
        expect(a.draw(ctx as any,1000,578)).toBe(true);expect(draw).toHaveBeenCalledOnce();
        a.clear();expect(a.draw(ctx as any,1000,578)).toBe(false);
    });
    it('fails visibly on decode failure and validates source dimensions',async()=>{
        vi.stubGlobal('Image',class extends FakeImage{async decode(){throw Error('missing');}});
        const a=createStoryAnimation();await expect(a.load(storyAnimationPlan('nick',true))).rejects.toThrow('missing');
        expect(a.start('intro')).toBe(false);
        vi.stubGlobal('Image',class extends FakeImage{async decode(){await super.decode();this.naturalWidth=1;}});
        await expect(a.load(storyAnimationPlan('nick',true))).rejects.toThrow('dimensions');
    });
    it('ignores stale loads after leaving story',async()=>{
        let resolve!:()=>void;
        vi.stubGlobal('Image',class extends FakeImage{async decode(){await new Promise<void>(r=>resolve=r);await super.decode();}});
        const a=createStoryAnimation(),pending=a.load({intro:['nick-juicy'],outro:[],replaceDefeat:false});
        a.clear();resolve();await pending;expect(a.start('intro')).toBe(false);
    });
});
