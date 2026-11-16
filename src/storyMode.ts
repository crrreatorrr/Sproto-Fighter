import {mountStoryCutscene,storyCutsceneArt,type StoryCutscene} from './storyCutscene';
import {trenchesCutscene} from './trenchesCutscene';
import {afterArtchick,ARTCHICK,beforeArtchick} from './artchickCutscenes';
import {afterNickJuicy,beforeNickJuicy} from './nickJuicyCutscenes';
import {afterYannix} from './yannixCutscene';
import {beforeMorelight} from './morelightCutscene';
import {afterMorelightMecha} from './morelightMechaCutscene';
import {createDifficultyRetry,storyDifficulty} from './difficulty';
import {storySceneryChoices,setStorySceneryChoice,getStorySceneryChoice} from './stageVariants';
import {STAGES,STORY_STAGE_IDS,stageImageSource,type StageId} from './stage';
import {ROSTER,type PlayableFighterId} from './core';
import {STORY_ENCOUNTERS,STORY_OPPONENTS,isStoryRecruitable,type Encounter,type StoryProgress} from './storyProgress';

type Hooks={beforeStory?:()=>Promise<boolean>;pause:()=>void;resume:()=>void;launch:(stage:StageId,story:boolean,opponent?:PlayableFighterId,difficulty?:{skill:number;assisted:boolean},startWithCountdown?:boolean)=>boolean|Promise<boolean>;ready:()=>boolean;testing?:()=>boolean;godMode?:()=>boolean;selectedFighter?:()=>PlayableFighterId;canPlayFighter?:(id:PlayableFighterId)=>boolean;map?:(parent:HTMLElement,progress:StoryProgress,choose:(encounter:Encounter)=>void)=>void};
type Cutscene = {title:string;location:string;script:StoryCutscene};
const cutscenes = {
    trenches: {title:'The Signal Below',location:'Mudline Trenches',script:trenchesCutscene},
    yannix: {title:'Wide Awake',location:'Drainage Floodgate',script:afterYannix},
    artchickBefore: {title:'The First Word',location:'Mint Starlit Nursery',script:beforeArtchick},
    artchickAfter: {title:'Who Made You',location:'Mint Starlit Nursery',script:afterArtchick},
    nickJuicyBefore: {title:'Their Own Faces',location:'Red-sun Asteroid Causeway',script:beforeNickJuicy},
    nickJuicyAfter: {title:'Find Morelight',location:'Event Horizon Observatory',script:afterNickJuicy},
    morelightBefore: {title:'The Light We Carry',location:'Iceblue Event Horizon',script:beforeMorelight},
    morelightAfter: {title:'The Maker Ahead',location:'Iceblue Event Horizon',script:afterMorelightMecha},
} satisfies Record<string,Cutscene>;

export function createStoryMode(hooks:Hooks,progress:StoryProgress){
    const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
    const modal=$<HTMLDialogElement>('journey-dialog');
    const worlds=STORY_STAGE_IDS.map(id=>STAGES.find(s=>s.id===id)!);
    let active:Encounter|null=null,wave=0,settled:number|null=null,launching=false;
    let view:'worlds'|'levels'|'cutscenes'|'scene'|'result'='worlds';
    /** Stage of the fight the result screen leads straight into (retry, next bout, next rival). Keeps that zone's song going. */
    let carryStage:StageId|null=null;
    let back:()=>void=()=>{};
    const total=STORY_ENCOUNTERS.length;
    const trenchesOpening=STORY_ENCOUNTERS.find(encounter=>encounter.stage==='trenches'&&encounter.opponent==='mox');
    const difficultyRetry=createDifficultyRetry();
    let assisted=false;
    /** Every third clear also recruits a fighter from further down the route. */
    const bonusNote=()=>{const bonus=progress.lastBonus();return bonus?`Bonus recruit: ${ROSTER[bonus].name} joins your roster early. `:'';};
    const recruitNote=(encounter:Encounter)=>encounter.opponents.every(isStoryRecruitable)?'Victory recruits each defeated fighter.':'Relic guardian: victory advances the story; player selection still requires the matching Hub Relic.';
    const names=(encounter:Encounter)=>encounter.opponents.map(id=>ROSTER[id].name).join(' → ');
    const gauntletNote=(encounter:Encounter)=>encounter.opponents.length>1?`${names(encounter)}. Health refills between bouts. Beat both without losing, restarting or leaving; the second bout has no saved checkpoint. `:'';
    const storageNote=()=>{
        const save=progress.snapshot();
        if(save.owner==='pending')return 'Connecting to the hub. Your account\'s progress loads in a moment.';
        if(!save.persistent)return 'Browser saving is unavailable. Progress lasts only while this page stays open.';
        if(save.owner==='account')return save.cloud==='offline'||save.cloud==='error'?'Progress saves to your hub account. It will sync when the hub is reachable.':'Progress saves to your hub account and loads on any device.';
        return 'Progress saves on this browser. Play from the hub to save it to your account.';
    };
    const status=()=>{$('journey-status').textContent=active?`STORY / ${STAGES.find(s=>s.id===active!.stage)!.name.toUpperCase()} / ENCOUNTER ${active.index+1} OF ${total}${active.opponents.length>1?` / BOUT ${wave+1} OF ${active.opponents.length}`:''} / ${progress.snapshot().cleared.length} CLEARED`:'FREE PLAY / '+storageNote();};
    // The first action (Continue, Fight, Next opponent, Retry) is the default: Enter or controller A presses it.
    let primary:HTMLButtonElement|null=null;
    let stopCutscene:(()=>void)|null=null;
    const focusDefault=()=>primary?.focus({preventScroll:true});
    const open=()=>{if(!modal.open){hooks.pause();modal.showModal();}focusDefault();};
    // God Mode (earned or testing) lets the player choose any encounter on the map.
    const syncRoute=()=>{progress.sync();progress.setOpenRoute(!!hooks.godMode?.());};
    const close=()=>{carryStage=null;modal.close();hooks.resume();};
    /** After a settled fight: where the default next fight happens, or null when the run stops here. */
    function nextFightStage(encounter:Encounter,result:number,finishedWave:number):StageId|null{
        if(result!==0||finishedWave+1<encounter.opponents.length)return encounter.stage;
        if(encounter.opponents[finishedWave]==='vaudream')return null;
        const save=progress.snapshot(),next=save.openRoute?STORY_ENCOUNTERS[encounter.index+1]??null:save.nextIndex===null?null:STORY_ENCOUNTERS[save.nextIndex];
        return next?.stage??null;
    }
    // Holding Enter must not activate a newly focused action on the next screen.
    const preventRepeatedEnter=(event:KeyboardEvent)=>{
        if(event.key==='Enter'&&event.repeat)event.preventDefault();
    };
    function buttons(actions:{label:string;run?:()=>void}[]){
        stopCutscene?.();stopCutscene=null;
        const area=$('journey-actions');area.replaceChildren();primary=null;
        for(const action of actions){
            const button=document.createElement('button');button.className='quiet';button.textContent=action.label;button.onclick=action.run??null;
            button.onkeydown=preventRepeatedEnter;
            area.append(button);primary??=button;
        }
        focusDefault();
    }
    async function launch(id:StageId,encounter?:Encounter,{nextWave=0,assist=false,startWithCountdown=false}={}){
        if(launching)return;
        if(!hooks.ready()){$('journey-copy').textContent='Fighter sprites are still loading. Try again in a moment.';return;}
        syncRoute();
        const selectedFighter=hooks.selectedFighter?.();
        if(selectedFighter&&!(hooks.canPlayFighter?.(selectedFighter)??progress.isUnlocked(selectedFighter))){
            $('journey-copy').textContent=`${ROSTER[selectedFighter].name} is a locked P1 preview. Return to the arena menu and choose an unlocked P1 fighter. ${isStoryRecruitable(selectedFighter)?'Defeat this fighter in story mode to recruit them.':'Player selection requires this fighter’s Hub Relic.'}`;
            return;
        }
        if(encounter){
            if(!progress.canPlay(encounter.index)){selector(true);$('journey-copy').textContent=`Encounter ${encounter.index+1} is locked. Clear the encounters before it, or turn on God Mode to choose any encounter.`;return;}
            if(nextWave===0){if(!progress.begin(encounter.index))return;difficultyRetry.begin(encounter.id);}
            else if(progress.currentWave(encounter.index)!==nextWave)return;
        }
        launching=true;
        if(stopCutscene){
            stopCutscene();stopCutscene=null;
            $('journey-content').replaceChildren();
        }
        modal.close();
        try{
            if(!await hooks.launch(id,!!encounter,encounter?.opponents[nextWave],encounter?{skill:storyDifficulty(encounter,STORY_ENCOUNTERS,assist),assisted:assist}:undefined,startWithCountdown))throw new Error('Fighter art could not load.');
            active=encounter??null;wave=nextWave;settled=null;assisted=assist;carryStage=null;status();
        }catch(error){
            progress.abandonRun();active=null;settled=null;wave=0;carryStage=null;
            $('journey-title').textContent='This match could not load.';
            $('journey-copy').textContent=`Your earned progress is unchanged. ${encounter&&encounter.opponents.length>1?'The two-bout encounter restarts from its first opponent. ':''}Try again or choose another destination.`;
            buttons([{label:encounter?'Retry encounter':'Retry match',run:()=>{void launch(id,encounter,{startWithCountdown});}},{label:'Story route',run:()=>selector(true)}]);
            back=()=>selector(true);open();console.warn(error);
        }finally{launching=false;}
    }
    function sceneryPicker(encounter:Encounter,parent=$('journey-content')){
        const label=document.createElement('label');label.textContent='Story scenery ';label.className='story-scenery-choice';
        const select=document.createElement('select');select.setAttribute('aria-label','Story scenery');
        for(const item of [{id:'',title:'Follow the story route'},...storySceneryChoices(encounter.stage)]){
            const option=document.createElement('option');option.value=item.id;option.textContent=item.title;select.append(option);
        }
        select.value=getStorySceneryChoice(encounter.stage);select.onchange=()=>setStorySceneryChoice(encounter.stage,select.value);
        label.append(select);parent.append(label);
    }
    function openingFor(encounter:Encounter):Cutscene|undefined{
        if(encounter===trenchesOpening)return cutscenes.trenches;
        if(encounter.gauntlet==='nick-juicy')return cutscenes.nickJuicyBefore;
        if(encounter.gauntlet==='final'&&encounter.opponent==='vela')return cutscenes.morelightBefore;
    }
    function scene(encounter:Encounter,between=false){
        const opening=openingFor(encounter);
        if(opening){openingCutscene(encounter,opening);return;}
        view='scene';const level=STAGES.find(s=>s.id===encounter.stage)!;
        $('journey-kicker').textContent='PLACEHOLDER CUTSCENE / MAJOR STAGE';
        $('journey-title').textContent=between?`Next stop: ${level.name}`:encounter.gauntlet==='final'?`Final gauntlet: ${level.name}`:encounter.index===0?`${level.name}: the journey begins`:`Return to ${level.name}`;
        $('journey-copy').textContent=`Chapter story and cutscene script pending approval. ${gauntletNote(encounter)}Next: encounter ${encounter.index+1} of ${total} against ${names(encounter)}. ${storageNote()}`;
        $('journey-content').innerHTML=`<div class="story-slate" style="--stage-accent:${level.accent}"><span>MAJOR STAGE ${encounter.chapter}</span><strong>${level.theme}</strong><p>CUTSCENE PLACEHOLDER / SCRIPT PENDING APPROVAL</p></div>`;
        sceneryPicker(encounter);
        buttons([{label:`Fight ${ROSTER[encounter.opponent].name}`,run:()=>{void launch(encounter.stage,encounter);}},{label:'Story route',run:()=>selector(true)}]);
        back=()=>selector(true);open();
    }
    function encounterPreview(encounter:Encounter,startWithCountdown=false){
        view='result';$('journey-kicker').textContent=`STORY / ENCOUNTER ${encounter.index+1} OF ${total}`;
        $('journey-title').textContent=`Challenge ${names(encounter)}.`;
        $('journey-copy').textContent=`${gauntletNote(encounter)}${recruitNote(encounter)} Advance toward Verse Gate. ${storageNote()}`;
        $('journey-content').replaceChildren();sceneryPicker(encounter);
        buttons([{label:'Start encounter',run:()=>{void launch(encounter.stage,encounter,{startWithCountdown});}},{label:'Story route',run:()=>selector(true)}]);back=()=>selector(true);open();
    }
    const firstInRegion=(encounter:Encounter)=>encounter.index===0||STORY_ENCOUNTERS[encounter.index-1].stage!==encounter.stage;
    function openingCutscene(encounter:Encounter,cutscene:Cutscene){
        carryStage=null;
        const finish=()=>{
            if(launching||!modal.open)return;
            // Keep the encounter controls available if the launch gate needs another attempt.
            encounterPreview(encounter,true);
            void launch(encounter.stage,encounter,{startWithCountdown:true});
        };
        showCutscene(cutscene,finish,()=>selector(true),encounter);
    }
    function showCutscene({script,title,location}:Cutscene,finish:()=>void,leave:()=>void,scenery?:Encounter){
        view='scene';modal.classList.remove('story-map-open');
        $('journey-kicker').textContent=`STORY / ${location.toUpperCase()}`;
        $('journey-title').textContent=title;
        $('journey-copy').textContent='';
        buttons([{label:'Next'},{label:'Skip cutscene',run:finish}]);
        if(scenery)sceneryPicker(scenery,$('journey-actions'));
        stopCutscene=mountStoryCutscene($('journey-content'),primary!,script,finish);
        back=leave;open();modal.scrollTop=0;
    }
    function showEncounter(encounter:Encounter,between=false){if(openingFor(encounter)||firstInRegion(encounter))scene(encounter,between);else encounterPreview(encounter);}
    function selector(story:boolean){
        syncRoute();carryStage=null;
        view=story?'worlds':'levels';modal.classList.toggle('story-map-open',story);const save=progress.snapshot();
        $('journey-kicker').textContent=story?`STORY / ${save.cleared.length} OF ${total} ENCOUNTERS CLEARED`:'FREE PLAY / LEVEL SELECT';
        $('journey-title').textContent=story?'The road to Verse Gate.':'Pick a place to fight.';
        $('journey-copy').textContent=story?`${STORY_OPPONENTS.length} distinct rivals across ${total} encounters. Victories recruit story fighters; the three Relic guardians keep their Hub-only player unlocks. Sproto Ranch is the middle chapter. The final three zones are HPOS10i Club (Bar), The Hatchery, then Verse Gate. The art duo closes the Hatchery; Nick then Juicy lead into the Morelight and VMU finale at Verse Gate. ${storageNote()}`:`Standalone matches with your sparring settings. ${storageNote()}`;
        if(story&&save.openRoute)$('journey-copy').textContent=`GOD MODE: every encounter is open. Pick any rival on the map. Wins still save and recruit. ${$('journey-copy').textContent}`;
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
            {label:save.completed?'Replay from the beginning':'Continue story',run:()=>showEncounter(STORY_ENCOUNTERS[save.nextIndex??0],true)},
            {label:'Cutscene viewer',run:cutsceneViewer},
            {label:'Free-play levels',run:()=>selector(false)},{label:'Back to arena',run:close},
        ]:[{label:'Story route',run:()=>selector(true)},{label:'Back to arena',run:close}]);
        back=close;open();
    }
    function cutsceneViewer(){
        view='cutscenes';carryStage=null;modal.classList.remove('story-map-open');
        $('journey-kicker').textContent='STORY';
        $('journey-title').textContent='Cutscene viewer';
        $('journey-copy').textContent='';
        const grid=document.createElement('div');grid.className='story-cutscene-gallery';
        const cards=Object.values(cutscenes).map(cutscene=>{
            const button=document.createElement('button');button.type='button';button.className='story-cutscene-card';
            const image=document.createElement('img');image.alt='';image.loading='lazy';image.decoding='async';
            image.src=storyCutsceneArt(cutscene.script.folder,cutscene.script.panels[0].art);
            const title=document.createElement('strong');title.textContent=cutscene.title;
            const location=document.createElement('small');location.textContent=cutscene.location;
            button.append(image,title,location);
            button.onclick=()=>showCutscene(cutscene,cutsceneViewer,cutsceneViewer);
            button.onkeydown=preventRepeatedEnter;
            return button;
        });
        grid.append(...cards);$('journey-content').replaceChildren(grid);
        back=()=>selector(true);
        buttons([{label:'Story map',run:back}]);
        primary=cards[0];open();modal.scrollTop=0;
    }
    function beforeMorelightEjection(playOutro:()=>void){
        if(active?.gauntlet!=='final'||active.opponents[wave]!=='vela'||settled!==0)return false;
        const finish=()=>{
            if(!modal.open)return;
            playOutro();close();
        };
        showCutscene(cutscenes.morelightAfter,finish,finish);
        return true;
    }
    // Save a victory at KO. A second callback cannot award another bout or rival.
    function finishMatch(winner:number){
        if(!active||launching||settled!==null||![0,1,2].includes(winner))return false;
        if(winner===0&&!progress.win(active.index,wave))return false;
        difficultyRetry.record(active.id,winner,wave===active.opponents.length-1);
        settled=winner;if(winner!==0)progress.abandonRun();status();return true;
    }
    function onRoundEnd(winner:number):boolean{
        if(!active||launching)return false;
        if(settled===null&&!finishMatch(winner))return false;
        const encounter=active,result=settled!,finishedWave=wave;active=null;settled=null;
        carryStage=nextFightStage(encounter,result,finishedWave);
        if(result===0){
            const nextWave=finishedWave+1;
            if(nextWave<encounter.opponents.length){
                if(encounter.gauntlet==='art'&&encounter.opponents[nextWave]===ARTCHICK){
                    showCutscene(cutscenes.artchickBefore,
                        ()=>{void launch(encounter.stage,encounter,{nextWave,assist:assisted,startWithCountdown:true});},
                        ()=>{progress.abandonRun();selector(true);});
                }else void launch(encounter.stage,encounter,{nextWave,assist:assisted});
                return true;
            }
            const finish=()=>showResult(encounter,result,finishedWave);
            const leave=()=>selector(true);
            if(encounter.gauntlet==='art'&&encounter.opponents[finishedWave]===ARTCHICK){
                showCutscene(cutscenes.artchickAfter,finish,leave);
                return true;
            }
            if(encounter.gauntlet==='nick-juicy'){
                showCutscene(cutscenes.nickJuicyAfter,finish,leave);
                return true;
            }
            if(encounter===trenchesOpening){
                showCutscene(cutscenes.yannix,finish,leave);
                return true;
            }
        }
        showResult(encounter,result,finishedWave);
        return true;
    }
    function showResult(encounter:Encounter,result:number,finishedWave:number){
        view='result';$('journey-content').replaceChildren();$('journey-kicker').textContent=`STORY / ENCOUNTER ${encounter.index+1} OF ${total}`;
        if(result===0){
            const save=progress.snapshot(),next=save.openRoute?STORY_ENCOUNTERS[encounter.index+1]??null:save.nextIndex===null?null:STORY_ENCOUNTERS[save.nextIndex];
            const finaleWon=encounter.opponents[finishedWave]==='vaudream';
            if(!finaleWon&&next&&(next.stage!==encounter.stage||next.gauntlet==='nick-juicy')){scene(next,true);return;}
            $('journey-title').textContent=save.completed||finaleWon?'Congratulations! You beat Sproto Fighter!':`${names(encounter)} ${encounter.opponents.every(isStoryRecruitable)?'recruited':'defeated'}!`;
            $('journey-copy').textContent=save.completed?`All ${STORY_OPPONENTS.length} installed rivals defeated. God Mode is unlocked and stays unlocked as the roster grows. ${storageNote()}`:`${save.cleared.length} of ${total} encounters cleared. ${bonusNote()}${recruitNote(encounter)} ${storageNote()}`;
            buttons(next?[{label:`Next: ${ROSTER[next.opponent].name}`,run:()=>{if(openingFor(next))scene(next);else void launch(next.stage,next);}},{label:'Story route',run:()=>selector(true)}]:[{label:'Story route',run:()=>selector(true)},{label:'Free-play levels',run:()=>selector(false)}]);
        }else{
            $('journey-title').textContent=result===2?'Draw — try this encounter again.':'Retry this encounter.';
            $('journey-copy').textContent=`${gauntletNote(encounter)}${ROSTER[encounter.opponent].name} is waiting. Defeats and draws do not advance the route. Already earned recruits are kept. ${storageNote()}`;
            const actions=[{label:'Retry match',run:()=>{void launch(encounter.stage,encounter);}},{label:'Story route',run:()=>selector(true)}];
            if(difficultyRetry.offered(encounter.id) && storyDifficulty(encounter,STORY_ENCOUNTERS,true)<storyDifficulty(encounter,STORY_ENCOUNTERS)){
                $('journey-copy').textContent+=' Optional help: retry with an easier CPU. Your fighter and rival stats stay the same.';
                actions.splice(1,0,{label:'Retry with easier CPU',run:()=>{void launch(encounter.stage,encounter,{assist:true});}});
            }
            buttons(actions);
        }
        status();back=()=>selector(true);open();
    }
    $('story-worlds').onclick=()=>{
        if(hooks.beforeStory)void hooks.beforeStory().then(confirmed=>{if(confirmed)selector(true);});
        else selector(true);
    };const levelSelect=document.getElementById('free-levels');
    if(levelSelect)levelSelect.onclick=()=>selector(false);
    $('journey-back').onclick=()=>back();
    modal.addEventListener('close',()=>{if(!modal.open){stopCutscene?.();stopCutscene=null;}});
    modal.addEventListener('cancel',e=>{e.preventDefault();if(typeof document.dispatchEvent==='function'&&typeof CustomEvent==='function')document.dispatchEvent(new CustomEvent('sproto-menu-ui',{bubbles:true}));back();});progress.subscribe(status);status();
    return {
        get isOpen(){return modal.open;},get isActive(){return !!active;},finishMatch,onRoundEnd,beforeMorelightEjection,
        /** Stage of the next story fight while the player is between two fights, else null. Main keeps the song when its zone matches. */
        get musicCarry():StageId|null{return active&&settled!==null?nextFightStage(active,settled,wave):carryStage;},
        retryMatch(){
            if(launching)return true;
            if(active){const encounter=active;progress.abandonRun();settled=null;void launch(encounter.stage,encounter);return true;}
            settled=null;progress.abandonRun();return false;
        },
        leaveStory(){progress.abandonRun();active=null;settled=null;wave=0;carryStage=null;status();},
        snapshot:()=>({active:active?.stage??null,encounter:active?{...active,opponents:[...active.opponents]}:null,wave,assisted,cpuSkill:active?storyDifficulty(active,STORY_ENCOUNTERS,assisted):null,opponent:active?.opponents[wave]??null,view,launching,...progress.snapshot()}),
    };
}
