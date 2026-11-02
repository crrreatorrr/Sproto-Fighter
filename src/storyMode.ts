import {STAGES,STORY_STAGE_IDS,stageImageSource,type StageId} from './stage';
import {ROSTER,type PlayableFighterId} from './core';
import {STORY_ENCOUNTERS,STORY_OPPONENTS,storyProgress,type Encounter,type StoryProgress} from './storyProgress';

type Hooks={pause:()=>void;resume:()=>void;launch:(stage:StageId,story:boolean,opponent?:PlayableFighterId)=>boolean|Promise<boolean>;ready:()=>boolean;testing?:()=>boolean;selectedFighter?:()=>PlayableFighterId;map?:(parent:HTMLElement,progress:StoryProgress,choose:(encounter:Encounter)=>void)=>void};
/** Real progression; chapter scenes remain placeholders pending script approval. */
export function createStoryMode(hooks:Hooks,progress:StoryProgress=storyProgress){
    const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
    const modal=$<HTMLDialogElement>('journey-dialog');
    const worlds=STORY_STAGE_IDS.map(id=>STAGES.find(s=>s.id===id)!);
    let active:Encounter|null=null,wave=0,settled:number|null=null,launching=false;
    let view:'worlds'|'levels'|'scene'|'result'='worlds';
    let back:()=>void=()=>{};
    const total=STORY_ENCOUNTERS.length;
    const names=(encounter:Encounter)=>encounter.opponents.map(id=>ROSTER[id].name).join(' → ');
    const gauntletNote=(encounter:Encounter)=>encounter.opponents.length>1?`${names(encounter)}. Health refills between bouts. Beat both without losing, restarting or leaving; the second bout has no saved checkpoint. `:'';
    const storageNote=()=>progress.snapshot().persistent?'Progress saves on this browser.':'Browser saving is unavailable. Progress lasts only while this page stays open.';
    const status=()=>{$('journey-status').textContent=active?`STORY / ${STAGES.find(s=>s.id===active!.stage)!.name.toUpperCase()} / ENCOUNTER ${active.index+1} OF ${total}${active.opponents.length>1?` / BOUT ${wave+1} OF ${active.opponents.length}`:''} / ${progress.snapshot().cleared.length} CLEARED`:'FREE PLAY / '+storageNote();};
    const open=()=>{if(!modal.open){hooks.pause();modal.showModal();}};
    const close=()=>{modal.close();hooks.resume();};
    function buttons(actions:{label:string;run:()=>void}[]){
        const area=$('journey-actions');area.replaceChildren();
        for(const action of actions){const button=document.createElement('button');button.className='quiet';button.textContent=action.label;button.onclick=action.run;area.append(button);}
    }
    async function launch(id:StageId,encounter?:Encounter,nextWave=0){
        if(launching)return;
        if(!hooks.ready()){$('journey-copy').textContent='Fighter sprites are still loading. Try again in a moment.';return;}
        progress.sync();
        const selectedFighter=hooks.selectedFighter?.();
        if(selectedFighter&&!progress.isUnlocked(selectedFighter)){
            $('journey-copy').textContent=`${ROSTER[selectedFighter].name} is a locked P1 preview. Return to the arena menu and choose an unlocked P1 fighter. Defeat ${ROSTER[selectedFighter].name} in story mode to recruit them.`;
            return;
        }
        if(encounter){
            if(!progress.canPlay(encounter.index))return;
            if(nextWave===0){if(!progress.begin(encounter.index))return;}
            else if(progress.currentWave(encounter.index)!==nextWave)return;
        }
        launching=true;modal.close();
        try{
            if(!await hooks.launch(id,!!encounter,encounter?.opponents[nextWave]))throw new Error('Fighter art could not load.');
            active=encounter??null;wave=nextWave;settled=null;status();
        }catch(error){
            progress.abandonRun();active=null;settled=null;wave=0;
            $('journey-title').textContent='This match could not load.';
            $('journey-copy').textContent=`Your earned progress is unchanged. ${encounter&&encounter.opponents.length>1?'The two-bout encounter restarts from its first opponent. ':''}Try again or choose another destination.`;
            buttons([{label:encounter?'Retry encounter →':'Retry match →',run:()=>{void launch(id,encounter);}},{label:'Story route',run:()=>selector(true)}]);
            back=()=>selector(true);open();console.warn(error);
        }finally{launching=false;}
    }
    function scene(encounter:Encounter,between=false){
        view='scene';const level=STAGES.find(s=>s.id===encounter.stage)!;
        $('journey-kicker').textContent='PLACEHOLDER CUTSCENE / MAJOR STAGE';
        $('journey-title').textContent=between?`Next stop: ${level.name}`:encounter.gauntlet==='final'?`Final gauntlet: ${level.name}`:encounter.index===0?`${level.name}: the journey begins`:`Return to ${level.name}`;
        $('journey-copy').textContent=`Chapter story and cutscene script pending approval. ${gauntletNote(encounter)}Next: encounter ${encounter.index+1} of ${total} against ${names(encounter)}. ${storageNote()}`;
        $('journey-content').innerHTML=`<div class="story-slate" style="--stage-accent:${level.accent}"><span>MAJOR STAGE ${encounter.chapter}</span><strong>${level.theme}</strong><p>CUTSCENE PLACEHOLDER / SCRIPT PENDING APPROVAL</p></div>`;
        buttons([{label:`Fight ${ROSTER[encounter.opponent].name} →`,run:()=>{void launch(encounter.stage,encounter);}},{label:'Story route',run:()=>selector(true)}]);
        back=()=>selector(true);open();
    }
    function encounterPreview(encounter:Encounter){
        view='result';$('journey-kicker').textContent=`STORY / ENCOUNTER ${encounter.index+1} OF ${total}`;
        $('journey-title').textContent=`Challenge ${names(encounter)}.`;
        $('journey-copy').textContent=`${gauntletNote(encounter)}Win to recruit each defeated fighter and advance toward the Hatchery. ${storageNote()}`;
        $('journey-content').replaceChildren();
        buttons([{label:'Start encounter →',run:()=>{void launch(encounter.stage,encounter);}},{label:'Story route',run:()=>selector(true)}]);back=()=>selector(true);open();
    }
    const firstInRegion=(encounter:Encounter)=>encounter.index===0||STORY_ENCOUNTERS[encounter.index-1].stage!==encounter.stage;
    function showEncounter(encounter:Encounter,between=false){if(firstInRegion(encounter))scene(encounter,between);else encounterPreview(encounter);}
    function selector(story:boolean){
        progress.sync();
        view=story?'worlds':'levels';modal.classList.toggle('story-map-open',story);const save=progress.snapshot();
        $('journey-kicker').textContent=story?`STORY / ${save.cleared.length} OF ${total} ENCOUNTERS CLEARED`:'FREE PLAY / LEVEL SELECT';
        $('journey-title').textContent=story?'The road to the Hatchery.':'Pick a place to fight.';
        $('journey-copy').textContent=story?`${STORY_OPPONENTS.length} distinct rivals across ${total} encounters. Victory recruits each defeated fighter. The art duo closes Verse Gate. In the Hatchery, defeat Nick then Juicy before the Morelight and VMU finale. ${storageNote()}`:`Standalone matches with your sparring settings. ${storageNote()}`;
        const content=$('journey-content');content.replaceChildren();const grid=document.createElement('div');grid.className='world-grid'+(story?' campaign-chapter-list':'');content.append(grid);
        for(const level of story?worlds:STAGES){
            const encounters=STORY_ENCOUNTERS.filter(e=>e.stage===level.id),first=encounters[0],last=encounters.at(-1);
            const available=encounters.find(e=>progress.canPlay(e.index)&&!progress.isCleared(e.index))??encounters.find(e=>progress.canPlay(e.index));
            const locked=story&&!available,done=story&&encounters.every(e=>progress.isCleared(e.index));
            const button=document.createElement('button');button.className='world-card';button.style.setProperty('--stage-accent',level.accent);button.dataset.stage=level.id;button.disabled=locked;
            button.style.backgroundImage=`linear-gradient(90deg,#101a2ce8,#101a2c80),url('${stageImageSource(level.id)}')`;button.style.backgroundSize='cover';button.style.backgroundPosition='center';
            button.innerHTML=`<span>${story?`STAGE ${first.chapter} / ENCOUNTERS ${first.index+1}–${last!.index+1}`:'FREE PLAY ARENA'}${done?' / CLEARED':locked?' / LOCKED':''}</span><strong>${level.name}</strong><small>${level.theme}</small><em>${story?(locked?'CLEAR THE PREVIOUS LOCATION':`${encounters.filter(e=>progress.isCleared(e.index)).length} / ${encounters.length} CLEARED`):'FREE PLAY ARENA'}</em>`;
            button.onclick=()=>{if(locked)return;if(!story){void launch(level.id);return;}showEncounter(available!);};grid.append(button);
        }
        if(story)hooks.map?.(content,progress,encounter=>showEncounter(encounter));
        buttons(story?[
            {label:save.completed?'Replay from the beginning':'Continue story →',run:()=>showEncounter(STORY_ENCOUNTERS[save.nextIndex??0],true)},
            {label:'Free-play levels',run:()=>selector(false)},{label:'Back to arena',run:close},
        ]:[{label:'Story route',run:()=>selector(true)},{label:'Back to arena',run:close}]);
        back=close;open();
    }
    // Save a victory at KO. A second callback cannot award another bout or rival.
    function finishMatch(winner:number){
        if(!active||launching||settled!==null||![0,1,2].includes(winner))return false;
        if(winner===0&&!progress.win(active.index,wave))return false;
        settled=winner;if(winner!==0)progress.abandonRun();status();return true;
    }
    function onRoundEnd(winner:number):boolean{
        if(!active||launching)return false;
        if(settled===null&&!finishMatch(winner))return false;
        const encounter=active,result=settled,finishedWave=wave;active=null;settled=null;
        view='result';$('journey-content').replaceChildren();$('journey-kicker').textContent=`STORY / ENCOUNTER ${encounter.index+1} OF ${total}`;
        if(result===0){
            if(finishedWave+1<encounter.opponents.length){void launch(encounter.stage,encounter,finishedWave+1);return true;}
            const save=progress.snapshot(),next=save.nextIndex===null?null:STORY_ENCOUNTERS[save.nextIndex];
            if(next&&next.stage!==encounter.stage){scene(next,true);return true;}
            $('journey-title').textContent=save.completed?'The route is complete. God Mode unlocked!':`${names(encounter)} recruited!`;
            $('journey-copy').textContent=save.completed?`All ${STORY_OPPONENTS.length} installed rivals defeated. God Mode stays unlocked as the roster grows. Ending cutscene pending script approval. ${storageNote()}`:`${save.cleared.length} of ${total} encounters cleared. Each defeated fighter is available as your fighter. ${storageNote()}`;
            buttons(next?[{label:`Next: ${ROSTER[next.opponent].name} →`,run:()=>{void launch(next.stage,next);}},{label:'Story route',run:()=>selector(true)}]:[{label:'Story route',run:()=>selector(true)},{label:'Free-play levels',run:()=>selector(false)}]);
        }else{
            $('journey-title').textContent=result===2?'Draw — try this encounter again.':'Retry this encounter.';
            $('journey-copy').textContent=`${gauntletNote(encounter)}${ROSTER[encounter.opponent].name} is waiting. Defeats and draws do not advance the route. Already earned recruits are kept. ${storageNote()}`;
            buttons([{label:'Retry match →',run:()=>{void launch(encounter.stage,encounter);}},{label:'Story route',run:()=>selector(true)}]);
        }
        status();back=()=>selector(true);open();return true;
    }
    $('story-worlds').onclick=()=>selector(true);$('free-levels').onclick=()=>selector(false);$('journey-back').onclick=()=>back();
    modal.addEventListener('cancel',e=>{e.preventDefault();back();});progress.subscribe(status);status();
    return {
        get isOpen(){return modal.open;},get isActive(){return !!active;},finishMatch,onRoundEnd,
        retryMatch(){
            if(launching)return true;
            if(active){const encounter=active;progress.abandonRun();settled=null;void launch(encounter.stage,encounter);return true;}
            settled=null;progress.abandonRun();return false;
        },
        leaveStory(){progress.abandonRun();active=null;settled=null;wave=0;status();},
        snapshot:()=>({active:active?.stage??null,encounter:active?{...active,opponents:[...active.opponents]}:null,wave,opponent:active?.opponents[wave]??null,view,launching,...progress.snapshot()}),
    };
}
