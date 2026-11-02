import {STAGES,STORY_STAGE_IDS,type StageId} from './stage';
import {ROSTER,type PlayableFighterId} from './core';
import {STORY_ENCOUNTERS,FINALE_START,storyProgress,type Encounter,type StoryProgress} from './storyProgress';

type Hooks={pause:()=>void;resume:()=>void;launch:(stage:StageId,story:boolean,opponent?:PlayableFighterId)=>boolean|Promise<boolean>;ready:()=>boolean;testing?:()=>boolean};
/** Story scenes are placeholders until the separate cutscene script is approved. */
export function createStoryMode(hooks:Hooks,progress:StoryProgress=storyProgress){
    const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
    const modal=$<HTMLDialogElement>('journey-dialog');
    const worlds=STORY_STAGE_IDS.map(id=>STAGES.find(s=>s.id===id)!);
    let active:Encounter|null=null,settled:number|null=null,settledTesting=false,launching=false;
    let view:'worlds'|'levels'|'scene'|'result'='worlds';
    let back:()=>void=()=>{};
    const storageNote=()=>progress.snapshot().persistent?'Progress saves on this browser.':'Browser saving is unavailable. Progress lasts only while this page stays open.';
    const status=()=>{$('journey-status').textContent=active?`STORY / ${STAGES.find(s=>s.id===active!.stage)!.name.toUpperCase()} / ENCOUNTER ${active.index+1} OF 100 / ${progress.snapshot().cleared.length} CLEARED`:'FREE PLAY / '+storageNote();};
    const open=()=>{if(!modal.open){hooks.pause();modal.showModal();}};
    const close=()=>{modal.close();hooks.resume();};
    async function launch(id:StageId,encounter?:Encounter){
        if(launching)return;
        if(!hooks.ready()){$('journey-copy').textContent='Fighter sprites are still loading. Try again in a moment.';return;}
        if(encounter&&!progress.canPlay(encounter.index))return;
        if(encounter?.index===FINALE_START)progress.abandonFinale();
        launching=true;modal.close();
        try{
            if(!await hooks.launch(id,!!encounter,encounter?.opponent))throw new Error('Fighter art could not load.');
            active=encounter??null;settled=null;status();
        }catch(error){if(encounter?.index===99){progress.abandonFinale();active=null;buttons([{label:'Restart finale from Morelight →',run:()=>{void launch(STORY_ENCOUNTERS[98].stage,STORY_ENCOUNTERS[98]);}},{label:'Story route',run:()=>selector(true)}]);}$('journey-copy').textContent='This match could not load. Your progress is unchanged. Try again or choose another destination.';open();console.warn(error);}
        finally{launching=false;}
    }
    function buttons(actions:{label:string;run:()=>void}[]){
        const area=$('journey-actions');area.replaceChildren();
        for(const action of actions){const button=document.createElement('button');button.className='quiet';button.textContent=action.label;button.onclick=action.run;area.append(button);}
    }
    function scene(encounter:Encounter,between=false){
        view='scene';const level=STAGES.find(s=>s.id===encounter.stage)!;
        $('journey-kicker').textContent='PLACEHOLDER CUTSCENE / MAJOR STAGE';
        $('journey-title').textContent=between?`Next stop: ${level.name}`:encounter.index===FINALE_START?`Final gauntlet: ${level.name}`:encounter.index===0?`${level.name}: the journey begins`:`Return to ${level.name}`;
        $('journey-copy').textContent=`Cutscene script pending approval: the journey through the portal to the Hatchery. ${encounter.index===FINALE_START?'Final gauntlet: Morelight → full health refill → Vaudream. Beat both without dying or leaving; the second boss has no saved checkpoint. ':''}Next: encounter ${encounter.index+1} of 100 against ${ROSTER[encounter.opponent].name}. ${storageNote()}`;
        $('journey-content').innerHTML=`<div class="story-slate" style="--stage-accent:${level.accent}"><span>MAJOR STAGE ${encounter.chapter}</span><strong>${level.theme}</strong><p>CUTSCENE PLACEHOLDER / SCRIPT PENDING APPROVAL</p></div>`;
        buttons([{label:`Fight ${ROSTER[encounter.opponent].name} →`,run:()=>{void launch(encounter.stage,encounter);}},{label:'Story route',run:()=>selector(true)}]);
        back=()=>selector(true);open();
    }
    function encounterPreview(encounter:Encounter){
        view='result';$('journey-kicker').textContent=`STORY / ENCOUNTER ${encounter.index+1} OF 100`;
        $('journey-title').textContent=`Challenge ${ROSTER[encounter.opponent].name}.`;
        $('journey-copy').textContent=`Win to recruit this fighter and advance toward the Hatchery. ${storageNote()}`;
        $('journey-content').replaceChildren();
        buttons([{label:'Start encounter →',run:()=>{void launch(encounter.stage,encounter);}},{label:'Story route',run:()=>selector(true)}]);back=()=>selector(true);open();
    }
    function selector(story:boolean){
        view=story?'worlds':'levels';const save=progress.snapshot();
        $('journey-kicker').textContent=story?`STORY / ${save.cleared.length} OF 100 CLEARED`:'FREE PLAY / LEVEL SELECT';
        $('journey-title').textContent=story?'The road to the Hatchery.':'Pick a place to fight.';
        $('journey-copy').textContent=story?`Defeat 100 different rivals. Each victory permanently recruits that fighter; clear each location to open the next. Finish the route to unlock God Mode for free play. ${storageNote()}`:`Standalone matches with your sparring settings. ${storageNote()}`;
        const content=$('journey-content');content.replaceChildren();const grid=document.createElement('div');grid.className='world-grid';content.append(grid);
        for(const level of story?worlds:STAGES){
            const encounters=STORY_ENCOUNTERS.filter(e=>e.stage===level.id),first=encounters[0],last=encounters.at(-1),locked=story&&!progress.canPlay(first.index),done=story&&save.cleared.length>last!.index;
            const button=document.createElement('button');button.className='world-card';button.style.setProperty('--stage-accent',level.accent);button.dataset.stage=level.id;button.disabled=locked;
            if(level.id!=='ranch'){button.style.backgroundImage=`linear-gradient(90deg,#101a2ce8,#101a2c80),url('/stages/higgsfield/${level.id}.png')`;button.style.backgroundSize='cover';button.style.backgroundPosition='center';}
            button.innerHTML=`<span>${story?`STAGE ${first.chapter} / ENCOUNTERS ${first.index+1}–${last!.index+1}`:'FREE PLAY ARENA'}${done?' / CLEARED':locked?' / LOCKED':''}</span><strong>${level.name}</strong><small>${level.theme}</small><em>${story?(locked?'CLEAR THE PREVIOUS LOCATION':`${Math.max(0,Math.min(encounters.length,save.cleared.length-first.index))} / ${encounters.length} CLEARED`):'FREE PLAY ARENA'}</em>`;
            button.onclick=()=>{if(locked)return;if(!story){void launch(level.id);return;}const next=encounters.find(e=>e.index>=progress.snapshot().cleared.length)??first;if(next===first)scene(next);else encounterPreview(next);};grid.append(button);
        }
        buttons(story?[
            {label:save.completed?'Replay from the beginning':'Continue story →',run:()=>{const next=STORY_ENCOUNTERS[Math.min(save.cleared.length,99)];if(save.completed)scene(STORY_ENCOUNTERS[0]);else if(next.index===0||STORY_ENCOUNTERS[next.index-1].stage!==next.stage)scene(next,true);else encounterPreview(next);}},
            {label:'Free-play levels',run:()=>selector(false)},{label:'Back to arena',run:close},
        ]:[{label:'Story route',run:()=>selector(true)},{label:'Back to arena',run:close}]);
        back=close;open();
    }
    // Called at KO, before the presentation outro: reloading during the outro keeps a win.
    function finishMatch(winner:number){
        if(!active||launching||settled!==null||![0,1,2].includes(winner))return false;
        settled=winner;settledTesting=hooks.testing?.()??false;if(settledTesting)progress.abandonFinale();else if(winner===0)progress.win(active.index);else if(active.index>=FINALE_START)progress.abandonFinale();status();return true;
    }
    function onRoundEnd(winner:number):boolean{
        if(!active||launching)return false;
        finishMatch(winner);const encounter=active,result=settled,wasTesting=settledTesting;active=null;settled=null;settledTesting=false;
        view='result';$('journey-content').replaceChildren();$('journey-kicker').textContent=`STORY / ENCOUNTER ${encounter.index+1} OF 100`;
        if(wasTesting){
            $('journey-title').textContent='God Mode test complete.';
            $('journey-copy').textContent='Story progress and fighter unlocks are unchanged. Turn off God Mode for testing in Settings to earn recruits and advance the route.';
            buttons([{label:'Test again →',run:()=>{const retry=encounter.index>=FINALE_START?STORY_ENCOUNTERS[FINALE_START]:encounter;void launch(retry.stage,retry);}},{label:'Story route',run:()=>selector(true)}]);
        }else if(result===0){
            const next=STORY_ENCOUNTERS[encounter.index+1];
            if(encounter.index===FINALE_START){void launch(next.stage,next);return true;}
            if(next&&next.stage!==encounter.stage){scene(next,true);return true;}
            $('journey-title').textContent=next?`${ROSTER[encounter.opponent].name} recruited!`:'The route is complete. God Mode unlocked!';
            $('journey-copy').textContent=next?`${progress.snapshot().cleared.length} of 100 encounters cleared. ${ROSTER[encounter.opponent].name} is now available as your fighter. ${storageNote()}`:`All 100 rivals defeated. Every fighter is available. Enable God Mode in fighter select for invulnerability and unlimited Team Special charge in free play. Ending cutscene pending script approval. ${storageNote()}`;
            buttons(next?[{label:`Next: ${ROSTER[next.opponent].name} →`,run:()=>{void launch(next.stage,next);}},{label:'Story route',run:()=>selector(true)}]:[{label:'Story route',run:()=>selector(true)},{label:'Free-play levels',run:()=>selector(false)}]);
        }else{
            $('journey-title').textContent=result===2?'Draw — try this encounter again.':'Retry this encounter.';
            $('journey-copy').textContent=`${encounter.index>=FINALE_START?'The finale restarts at Morelight. Beat Morelight, refill to full health, then defeat Vaudream in one sitting. ':''}${ROSTER[encounter.opponent].name} is waiting. Defeats and draws do not recruit fighters or advance the route. ${storageNote()}`;
            buttons([{label:'Retry match →',run:()=>{const retry=encounter.index>=FINALE_START?STORY_ENCOUNTERS[FINALE_START]:encounter;void launch(retry.stage,retry);}},{label:'Story route',run:()=>selector(true)}]);
        }
        status();back=()=>selector(true);open();return true;
    }
    $('story-worlds').onclick=()=>selector(true);$('free-levels').onclick=()=>selector(false);$('journey-back').onclick=()=>back();
    modal.addEventListener('cancel',e=>{e.preventDefault();back();});progress.subscribe(status);status();
    return {get isOpen(){return modal.open;},get isActive(){return !!active;},finishMatch,onRoundEnd,retryMatch(){if(launching)return true;if(active?.index===99){progress.abandonFinale();void launch(STORY_ENCOUNTERS[98].stage,STORY_ENCOUNTERS[98]);return true;}settled=null;progress.abandonFinale();return false;},leaveStory(){progress.abandonFinale();active=null;settled=null;status();},snapshot:()=>({active:active?.stage??null,encounter:active?{...active}:null,view,launching,...progress.snapshot()})};
}
