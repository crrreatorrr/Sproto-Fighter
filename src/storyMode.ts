import {STAGES,type StageId} from './stage';

type Hooks={pause:()=>void;resume:()=>void;launch:(stage:StageId,story:boolean)=>void;ready:()=>boolean};
/** Session-only story flow. Scene copy is intentionally a production placeholder. */
export function createStoryMode(hooks:Hooks){
    const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
    const modal=$<HTMLDialogElement>('journey-dialog');
    const worlds=STAGES.filter(s=>s.chapter!==null);
    const cleared=new Set<StageId>();
    let active:StageId|null=null;
    let view:'worlds'|'levels'|'scene'|'result'='worlds';
    let back:()=>void=()=>{};
    const status=()=>{$('journey-status').textContent=active?`STORY / WORLD ${STAGES.find(s=>s.id===active)!.chapter} / ${cleared.size} OF 4 CLEARED THIS SESSION`:'FREE PLAY / SELECT ANY LEVEL';};
    const open=()=>{if(!modal.open){hooks.pause();modal.showModal();}};
    const close=()=>{modal.close();hooks.resume();};
    function launch(id:StageId,story:boolean){
        if(!hooks.ready()){$('journey-copy').textContent='Fighter sprites are still loading. Try again in a moment.';return;}
        active=story?id:null;status();modal.close();hooks.launch(id,story);
    }
    function buttons(actions:{label:string;run:()=>void}[]){
        const area=$('journey-actions');area.replaceChildren();
        for(const action of actions){const button=document.createElement('button');button.className='quiet';button.textContent=action.label;button.onclick=action.run;area.append(button);}
    }
    function scene(id:StageId,between=false){
        view='scene';const level=STAGES.find(s=>s.id===id)!;
        $('journey-kicker').textContent='PLACEHOLDER CUTSCENE / STATIC STORYBOARD';
        $('journey-title').textContent=between?`Next stop: ${level.name}`:`World ${level.chapter}: ${level.name}`;
        $('journey-copy').textContent=between?'Transition scene slot: connect the previous match to this location. Final story, dialogue and animation are intentionally not written.':'Opening scene slot: introduce this location and the reason for the match. Final story, dialogue and animation are intentionally not written.';
        $('journey-content').innerHTML=`<div class="story-slate" style="--stage-accent:${level.accent}"><span>SCENE ${String(level.chapter).padStart(2,'0')}</span><strong>${level.theme}</strong><p>PLACEHOLDER · STATIC PANEL · NO FINAL STORY</p></div>`;
        buttons([{label:`Fight in ${level.name} →`,run:()=>launch(id,true)},{label:'World selector',run:()=>selector(true)}]);
        back=()=>selector(true);open();
    }
    function selector(story:boolean){
        view=story?'worlds':'levels';
        $('journey-kicker').textContent=story?'STORY FRAMEWORK / FOUR SELECTABLE WORLDS':'FREE PLAY / LEVEL SELECT';
        $('journey-title').textContent=story?'Choose your starting world.':'Pick a place to fight.';
        $('journey-copy').textContent=story?'All four worlds are available. Win to advance, lose to retry. Win World 1 on a visit from the hub\'s Bar arcade to earn the Tidebreaker Belt Relic. Story and cutscenes are labeled placeholders; progress lasts for this browser session.':'Standalone matches with your sparring settings. Four stage concepts and the original ranch bonus. No story scenes or progression.';
        const content=$('journey-content');content.replaceChildren();const grid=document.createElement('div');grid.className='world-grid';content.append(grid);
        for(const level of story?worlds:STAGES){const button=document.createElement('button');button.className='world-card';button.style.setProperty('--stage-accent',level.accent);button.dataset.stage=level.id;
            button.innerHTML=`<span>${level.chapter?'WORLD 0'+level.chapter:'BONUS STAGE'}${story&&cleared.has(level.id)?' / CLEARED':''}</span><strong>${level.name}</strong><small>${level.theme}</small><em>${level.id==='ranch'?'ORIGINAL RANCH ART':'STAGE CONCEPT ART'}</em>`;
            button.onclick=()=>story?scene(level.id):launch(level.id,false);grid.append(button);}
        buttons(story?[{label:'Restart story from World 1',run:()=>{cleared.clear();status();scene(worlds[0].id);}},{label:'Free-play levels',run:()=>selector(false)},{label:'Back to arena',run:close}]:[{label:'Story worlds',run:()=>selector(true)},{label:'Back to arena',run:close}]);
        back=close;open();
    }
    function onRoundEnd(winner:number):boolean{
        if(!active)return false;
        const id=active,index=worlds.findIndex(s=>s.id===id),level=worlds[index];
        view='result';$('journey-content').replaceChildren();$('journey-kicker').textContent='STORY FRAMEWORK / MATCH RESULT';
        if(winner===0){
            cleared.add(id);status();
            if(index<worlds.length-1){scene(worlds[index+1].id,true);return true;}
            $('journey-title').textContent='Final world cleared.';
            $('journey-copy').textContent='Ending cutscene placeholder. Final story and animation will be created later. You can replay any world or restart the four-level route.';
            $('journey-content').innerHTML='<div class="story-slate"><span>ENDING SCENE SLOT</span><strong>PLACEHOLDER</strong><p>NO FINAL STORY OR ANIMATION</p></div>';
            buttons([{label:'Restart story',run:()=>{cleared.clear();status();scene(worlds[0].id);}},{label:'World selector',run:()=>selector(true)},{label:'Free-play levels',run:()=>selector(false)}]);
        }else{
            $('journey-title').textContent=winner===2?'Draw — try this world again.':'Retry this world.';
            $('journey-copy').textContent=`${level.name} remains selected. Losing or drawing does not advance story progress.`;
            buttons([{label:'Retry match →',run:()=>launch(id,true)},{label:'World selector',run:()=>selector(true)}]);
        }
        back=()=>selector(true);open();return true;
    }
    $('story-worlds').onclick=()=>selector(true);$('free-levels').onclick=()=>selector(false);$('journey-back').onclick=()=>back();
    modal.addEventListener('cancel',e=>{e.preventDefault();back();});status();
    return {get isOpen(){return modal.open;},onRoundEnd,leaveStory(){active=null;status();},snapshot:()=>({active,view,cleared:[...cleared]})};
}
