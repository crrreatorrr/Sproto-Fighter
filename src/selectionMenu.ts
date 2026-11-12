import {CPU_DIFFICULTIES} from './core';
import {STAGE_ZONES,stageZone,stagesInZone} from './stageGroups';
import {storyProgress} from './storyProgress';
import {MenuRepeat,PAD,menuDirection,readButtons,type PadLike} from './gamepad';
import {menuKeyDirection} from './localInput';
import { ROSTER, COMBAT_STYLES, PLAYABLE_FIGHTERS, specialPartnerIds, PARTNER_ATTACKS, bodyAtlasIds, isPairedFighter, createState, getMove, FLOOR, type PlayableFighterId, type FighterId, type Mode } from './core';
import { portraitThumb, portraitLarge } from './portraits';
import { drawSelectionPose } from './poseAtlas';
import { STAGES, drawStagePreview, loadStagePreviews, type StageId } from './stage';
/** Simulation modes, the Tutorial (six guided lessons on the dummy), Training (a standing dummy with the hitbox overlay and route recorder) and the two online choices (matchmaking on the hub). */
export type MenuMode = Mode | 'tutorial' | 'training' | 'online' | 'online-wager';
/** Classic is one untimed round. Best of 3 adds the 60-second clock, counter-hits, the defense meter and just-defend. */
export type MatchRules = 'classic' | 'bo3';
export const rulesApply = (mode: MenuMode): boolean => mode === 'cpu' || mode === 'versus';
export interface SelectionSetup { fighter:PlayableFighterId; opponent:PlayableFighterId; stage:StageId; mode:MenuMode; godMode?:boolean; partner?:FighterId; cpuSkill?:number; rules?:MatchRules }
/** Local selection state only. The match is created by the explicit start hook. */
export function createSelectionMenu(hooks:{start:(setup:SelectionSetup)=>void;prepare?:(ids:PlayableFighterId[])=>Promise<void>;canPlay?:(id:PlayableFighterId)=>boolean;locked?:(id:PlayableFighterId)=>string|null}){
 const root=document.getElementById('selection-view')!;
 const canSelect=(id:PlayableFighterId)=>hooks.canPlay?.(id)??storyProgress.isUnlocked(id);
 const lockedWhy=(id:PlayableFighterId)=>hooks.locked?.(id)??'Defeat this fighter in story mode to recruit them.';
 let setup:SelectionSetup={fighter:'highsproto',opponent:'vela',stage:'ranch',mode:'cpu',godMode:false,cpuSkill:4,rules:'classic'},target:'fighter'|'opponent'='fighter',ready=false,open=true;
 let previewRequest=0;
 const repeat=new MenuRepeat();
 let lastButtons:number[]=[],assetRequest=0,artLoading=false,loadFailed=false;
 root.innerHTML=`<div class="arcade-echoes" aria-hidden="true"><img id="player-echo" alt=""><img id="rival-echo" alt=""></div>
 <div class="selection-heading"><span class="heading-rule"></span><h1>MEMBER <em>SELECT</em></h1><span class="heading-rule"></span></div>
 <section class="selection-locations" aria-labelledby="locations-heading"><div class="selection-section-heading"><h2 id="locations-heading">1 · CHOOSE A ZONE</h2><button id="random-stage" class="text-button">RANDOM STAGE</button></div><div id="zone-rail" class="stage-rail" role="group" aria-label="Main zones"></div><div class="selection-section-heading variation-heading"><h2 id="variations-heading">2 · CHOOSE A VARIATION</h2><span id="zone-stage-count"></span></div><div class="stage-rail" role="group" aria-labelledby="variations-heading"></div><p class="stage-swipe-cue">Choose a zone above, then swipe through its stages →</p></section>
 <div class="selection-launch"><label for="mode">RIVAL BEHAVIOR<select id="mode"><option value="cpu">CPU · Fights back</option><option value="tutorial">Tutorial · Six guided lessons</option><option value="dummy">Practice · Standing dummy</option><option value="guard">Practice · Guard dummy</option><option value="training">Training · Hitboxes, frame data, route recorder</option><option value="versus">Local versus · Second player</option><option value="online">Online · Find an opponent</option><option value="online-wager">Online · Wager 10 Tickets</option></select></label><label for="cpu-difficulty">CPU DIFFICULTY<select id="cpu-difficulty">${CPU_DIFFICULTIES.map(level=>`<option value="${level.skill}">${level.name}</option>`).join('')}</select></label><label for="rules">RULES<select id="rules"><option value="classic">Classic · One round, no timer</option><option value="bo3">Best of 3 · 60-second rounds</option></select></label><label class="god-mode-control"><span><input id="god-mode" type="checkbox" disabled> GOD MODE</span><small id="god-mode-help">Clear the campaign for this reward. Testing is available in Settings.</small></label><div class="menu-instructions"><span>Arrows: move · Enter: select · Tab: section<br>Pad: D-pad / stick · A: select · B: back · X: change side · Start: fight button</span></div><button id="start-fight" class="start-fight" disabled>LOADING FIGHTERS…</button></div><p id="selection-loading" role="status" class="selection-hint">Loading installed fighter sprites…</p>
 <div class="match-preview"><canvas id="selection-stage" width="1280" height="420" aria-label="Selected stage with both fighters facing one another"></canvas><div class="preview-shade"></div><span id="selected-stage-name" hidden></span><div class="fighter-summary red" id="player-summary"></div><div class="fighter-summary blue" id="rival-summary"></div></div>
 <section class="selection-roster" aria-labelledby="roster-heading"><div class="selection-section-heading"><div class="side-switch" aria-label="Choose which side to edit"><button id="choose-player" class="side-tab red" aria-pressed="true">P1 <span id="player-selection-name">YOUR FIGHTER</span></button><button id="choose-rival" class="side-tab blue" aria-pressed="false">CPU <span id="rival-selection-name">YOUR RIVAL</span></button></div><h2 id="roster-heading">SELECT YOUR FIGHTER</h2><span class="roster-total">${PLAYABLE_FIGHTERS.length} / SELECTABLE</span></div><div class="selection-grid" role="group" aria-label="Fighter portraits"></div><p id="selection-announcement" class="selection-hint" aria-live="polite"></p></section>
`;
 const el=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
 const grid=root.querySelector('.selection-grid')!,rail=root.querySelector('.stage-rail[aria-labelledby="variations-heading"]')!,zoneRail=el('zone-rail');
 const portraits:HTMLButtonElement[]=[];
 for(const id of PLAYABLE_FIGHTERS){const button=document.createElement('button');button.className='portrait-choice';button.dataset.fighter=id;button.setAttribute('aria-label',ROSTER[id].name);button.innerHTML=`<img src="${portraitThumb(id)}" alt="" loading="lazy" decoding="async" fetchpriority="low"><span class="portrait-name">${ROSTER[id].name}</span><span class="side-marker p1">P1</span><span class="side-marker cpu">CPU</span>`;button.onclick=()=>choose(id);button.onfocus=()=>{portraits.forEach(b=>b.tabIndex=b===button?0:-1);};grid.append(button);portraits.push(button);}
 const random=document.createElement('button');random.className='portrait-choice random-choice';random.innerHTML='<strong>?</strong><span>RANDOM FIGHTER</span>';random.setAttribute('aria-label','Random fighter for selected side');random.onclick=()=>{storyProgress.sync();const ids=PLAYABLE_FIGHTERS.filter(id=>target==='opponent'||canSelect(id));choose(ids[Math.floor(Math.random()*ids.length)]);};grid.append(random);portraits.push(random);
 function sortPortraits(){
  const ordered=[...portraits].sort((a,b)=>{
   const left=a.dataset.fighter as PlayableFighterId|undefined,right=b.dataset.fighter as PlayableFighterId|undefined;
   if(!left)return right?1:0;if(!right)return -1;
   return Number(canSelect(right))-Number(canSelect(left))||ROSTER[left].name.localeCompare(ROSTER[right].name,'en',{sensitivity:'base',numeric:true})||left.localeCompare(right);
  });
  if(ordered.every((button,index)=>button===portraits[index]))return;
  const focused=portraits.find(button=>button===document.activeElement);
  portraits.splice(0,portraits.length,...ordered);for(const button of portraits)grid.append(button);
  focused?.focus({preventScroll:true});
 }
 for(const zone of STAGE_ZONES){const button=document.createElement('button');button.className='stage-choice zone-choice';button.dataset.zone=zone.id;button.dataset.stage=zone.id;button.setAttribute('aria-label',zone.name);button.innerHTML=`<canvas width="256" height="110" aria-hidden="true"></canvas><span><small>${stagesInZone(zone.id).length} ${stagesInZone(zone.id).length===1?'STAGE':'STAGES'}</small><b>${zone.name}</b></span>`;button.onclick=()=>{setup.stage=zone.id;update();};zoneRail.append(button);}
 for(const stage of STAGES){const button=document.createElement('button');button.className='stage-choice';button.dataset.stage=stage.id;button.setAttribute('aria-label',stage.name);button.innerHTML=`<canvas width="256" height="110" aria-hidden="true"></canvas><span><small>${stage.id===stageZone(stage.id)?'MAIN STAGE':'VARIATION'}</small><b>${stage.name}</b></span>`;button.onclick=()=>{setup.stage=stage.id;update();};rail.append(button);}
 function stats(id:PlayableFighterId,side:string){const f=createState(id,'dummy').fighters[0],kit=COMBAT_STYLES[id];return `<div class="summary-top"><span>${side}</span><small>${kit.role}</small></div><h2>${ROSTER[id].name}</h2><p>${kit.specialName}</p><dl><div><dt>HEAVY DAMAGE</dt><dd>${getMove(f,'heavy').damage}<small>HP</small></dd></div><div><dt>LIGHT REACH</dt><dd>${getMove(f,'light').range}<small>PX</small></dd></div><div><dt>WALK SPEED</dt><dd>${ROSTER[id].speed.toFixed(2)}<small>PX/F</small></dd></div><div><dt>POWER STARTUP</dt><dd>${getMove(f,'bolt').startup}<small>FR</small></dd></div></dl>`;}
 function preview(){
  const canvas=el<HTMLCanvasElement>('selection-stage');
  const w=Math.round(canvas.clientWidth)||1280,h=Math.round(canvas.clientHeight)||420;
  canvas.width=w;canvas.height=h;
  const c=canvas.getContext('2d')!;drawStagePreview(c,setup.stage,w,h);
  c.fillStyle='#050712a6';c.fillRect(0,0,w,h);
  const fighters=createState(setup.fighter,'dummy',setup.opponent).fighters;
  const compact=window.innerWidth<=650,paired=isPairedFighter(setup.fighter)||isPairedFighter(setup.opponent);
  // Mobile stat panels need their own space; long labels must never cover feet.
  const summaryHeight=Math.max(el('player-summary').offsetHeight||0,el('rival-summary').offsetHeight||0);
  const summaryReserve=compact?Math.max(204,summaryHeight+18):154;
  const area=paired?h-summaryReserve:h,feet=compact?(paired?area/2-14:h-summaryReserve):area-20;
  const height=compact?176:Math.min(244,area-46);
  const scale=height/160;
  for(let i=0;i<2;i++){
   const stacked=paired&&compact;
   const actor=fighters[i],x=w*(stacked?.5:i===0?(compact?.25:paired?.25:.35):(compact?.75:paired?.75:.65));
   const floor=feet+(stacked?i*area/2:0);
   c.fillStyle=i===0?'#b41e4288':'#1c51de99';c.beginPath();c.ellipse(x,floor+1,w*(compact?.16:.10),5,0,0,Math.PI*2);c.fill();
   c.fillStyle=i===0?'#ff3e5b':'#518aff';c.fillRect(x-w*.06,floor+4,w*.12,1);
   actor.x=0;actor.y=FLOOR;actor.facing=i===0?1:-1;
   // Pack menu bodies by their visible bounds; never shrink a team by body count.
   c.save();c.translate(x,floor);drawSelectionPose(c,actor,scale,w*(paired?(compact?.90:.46):compact?.43:.28));c.restore();
  }
  for(const button of [...Array.from(zoneRail.querySelectorAll<HTMLButtonElement>('button')),...Array.from(rail.querySelectorAll<HTMLButtonElement>('button')).filter(b=>!b.hidden)]){const thumb=button.querySelector('canvas')!;drawStagePreview(thumb.getContext('2d')!,button.dataset.stage as StageId,thumb.width,thumb.height);}
 }

 function loadZonePreview(){
  const request=++previewRequest;
  void loadStagePreviews(stagesInZone(stageZone(setup.stage)).map(stage=>stage.id)).then(()=>{if(request===previewRequest&&open)preview();});
 }
 function update(){el<HTMLSelectElement>('cpu-difficulty').value=String(setup.cpuSkill??4);el<HTMLSelectElement>('cpu-difficulty').disabled=setup.mode!=='cpu';el<HTMLSelectElement>('rules').value=setup.rules??'classic';el<HTMLSelectElement>('rules').disabled=!rulesApply(setup.mode);sortPortraits();const zone=stageZone(setup.stage);for(const button of Array.from(zoneRail.querySelectorAll<HTMLButtonElement>('button')))button.setAttribute('aria-pressed',String(button.dataset.zone===zone));for(const button of Array.from(rail.querySelectorAll<HTMLButtonElement>('button')))button.hidden=stageZone(button.dataset.stage as StageId)!==zone;el('variations-heading').textContent='2 · '+STAGE_ZONES.find(item=>item.id===zone)!.name.toUpperCase()+' · CHOOSE A VARIATION';el('zone-stage-count').textContent=stagesInZone(zone).length+(stagesInZone(zone).length===1?' STAGE':' STAGES');root.dataset.paired=String(isPairedFighter(setup.fighter)||isPairedFighter(setup.opponent));const save=storyProgress.snapshot();if(!save.godModeUnlocked)setup.godMode=false;el<HTMLInputElement>('god-mode').disabled=!save.godModeUnlocked;el<HTMLInputElement>('god-mode').checked=!!setup.godMode;el('god-mode-help').textContent=save.godModeUnlocked?'Campaign reward: invulnerability + unlimited Team Special charge. Settings also offers testing in any mode.':'Clear the campaign for this reward. Testing is available in Settings.';root.querySelector('.roster-total')!.textContent=`${PLAYABLE_FIGHTERS.filter(canSelect).length} / ${PLAYABLE_FIGHTERS.length} AVAILABLE`;root.dataset.side=target;el('choose-player').setAttribute('aria-pressed',String(target==='fighter'));el('choose-rival').setAttribute('aria-pressed',String(target==='opponent'));el('player-selection-name').textContent=ROSTER[setup.fighter].name;el('rival-selection-name').textContent=ROSTER[setup.opponent].name;el<HTMLImageElement>('player-echo').src=portraitLarge(setup.fighter);el<HTMLImageElement>('rival-echo').src=portraitLarge(setup.opponent);el('roster-heading').textContent=target==='fighter'?'SELECT YOUR FIGHTER':setup.mode==='versus'?'SELECT PLAYER 2':setup.mode.startsWith('online')?'ONLINE: YOUR OPPONENT PICKS THEIR OWN':'SELECT YOUR CPU RIVAL';for(const button of portraits){const id=button.dataset.fighter as PlayableFighterId|undefined;const locked=!!id&&target==='fighter'&&!canSelect(id);button.classList.toggle('fighter-locked',locked);button.setAttribute('aria-description',locked?'Locked for play. Select to preview. '+lockedWhy(id!):'');button.title=locked?'Preview only. '+lockedWhy(id!):'';button.classList.toggle('picked-player',id===setup.fighter);button.classList.toggle('picked-rival',id===setup.opponent);button.setAttribute('aria-pressed',String(id===setup[target]));button.tabIndex=id===setup[target]?0:-1;}for(const button of Array.from(rail.querySelectorAll<HTMLButtonElement>('button')))button.setAttribute('aria-pressed',String(button.dataset.stage===setup.stage));el('player-summary').innerHTML=stats(setup.fighter,'P1 / YOU');el('rival-summary').innerHTML=stats(setup.opponent,'CPU / RIVAL');el('selected-stage-name').textContent=STAGES.find(s=>s.id===setup.stage)!.name;el<HTMLSelectElement>('mode').value=setup.mode;{const slot2=setup.mode==='versus'?'P2':'CPU';const tab=el('choose-rival').firstChild;if(tab)tab.textContent=slot2+' ';for(const marker of Array.from(root.querySelectorAll('.side-marker.cpu')))marker.textContent=slot2;};el('selection-announcement').textContent=`${target==='fighter'&&!canSelect(setup.fighter)?'Previewing locked P1':target==='fighter'?'Editing P1':'Editing CPU rival (opponent only)'} · ${ROSTER[setup[target]].name} · ${COMBAT_STYLES[setup[target]].signature} · Special partner: ${specialPartnerIds(setup[target]).map(id=>ROSTER[id].name).join(" + ")}${PARTNER_ATTACKS[ROSTER[setup[target]].partner]?" · Partner attack: "+PARTNER_ATTACKS[ROSTER[setup[target]].partner]!.name:""}`;launchState();preview();loadZonePreview();}
 function focusSelected(){portraits.find(b=>b.dataset.fighter===setup[target])?.focus();}
 function launchState(){
  const locked=!canSelect(setup.fighter);
  el<HTMLButtonElement>('start-fight').disabled=!ready||artLoading||locked;
  el('start-fight').textContent=locked?'UNLOCK IN STORY':artLoading||(!ready&&!loadFailed)?'LOADING FIGHTERS…':ready?'START FIGHT':'FIGHTERS UNAVAILABLE';
  el('selection-loading').textContent=locked?`${ROSTER[setup.fighter].name} is locked for P1. Preview only — ${lockedWhy(setup.fighter)} Or choose an unlocked fighter.`:artLoading?'Loading selected fighters…':ready?(setup.rules==='bo3'&&rulesApply(setup.mode)?'Ready · Best of 3 · 60-second rounds · Counter-hits and defense meter':setup.mode==='training'?'Ready · Training · Hitboxes and frame data on a standing dummy':setup.mode==='tutorial'?'Ready · Tutorial · Block, chain, throw, dash cancel, jump cancel, Team Special':'Ready · Offline 1v1 · No round timer'):'Loading installed fighter sprites…';
 }
 async function prepareSelection(){
  if(!hooks.prepare)return;
  const request=++assetRequest;artLoading=true;loadFailed=false;launchState();
  try{await hooks.prepare([setup.fighter,setup.opponent]);if(request!==assetRequest)return;ready=true;artLoading=false;launchState();preview();}
  catch(error){if(request!==assetRequest)return;ready=false;artLoading=false;loadFailed=true;launchState();el('selection-loading').textContent='Selected fighter art could not load. Choose again to retry.';console.error(error);}
 }
 function choose(id:PlayableFighterId){storyProgress.sync();if(target==='fighter'&&setup.fighter!==id)delete setup.partner;setup[target]=id;update();void prepareSelection();}
 function selectSide(side:typeof target){const before=document.activeElement;storyProgress.sync();target=side;update();focusSelected();noteUi(before);}
 el<HTMLInputElement>('god-mode').onchange=()=>{setup.godMode=storyProgress.snapshot().godModeUnlocked&&el<HTMLInputElement>('god-mode').checked;update();};
 el<HTMLSelectElement>('cpu-difficulty').onchange=()=>{setup.cpuSkill=Number(el<HTMLSelectElement>('cpu-difficulty').value);update();};
 el<HTMLSelectElement>('rules').onchange=()=>{setup.rules=el<HTMLSelectElement>('rules').value as MatchRules;update();launchState();};
 storyProgress.subscribe(update);
 el('choose-player').onclick=()=>selectSide('fighter');el('choose-rival').onclick=()=>selectSide('opponent');
 el('random-stage').onclick=()=>{setup.stage=STAGES[Math.floor(Math.random()*STAGES.length)].id;update();};el<HTMLSelectElement>('mode').onchange=()=>{setup.mode=el<HTMLSelectElement>('mode').value as MenuMode;update();};
 el('start-fight').onclick=()=>{storyProgress.sync();if(ready&&!artLoading&&open&&canSelect(setup.fighter))hooks.start({...setup});};
 function noteUi(before:Element|null){if(document.activeElement!==before||typeof document.dispatchEvent!=='function'||typeof CustomEvent!=='function')return;document.dispatchEvent(new CustomEvent('sproto-menu-ui',{bubbles:true}));}
 function back(){const before=document.activeElement;if(rail.contains(before)){Array.from(zoneRail.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.dataset.zone===stageZone(setup.stage))?.focus();noteUi(before);return;}selectSide('fighter');noteUi(before);}
 function columns(){const first=portraits[0].getBoundingClientRect().top;return Math.max(1,portraits.filter(b=>Math.abs(b.getBoundingClientRect().top-first)<5).length);}
 function navigate(direction:string){const active=document.activeElement as HTMLElement,index=portraits.indexOf(active as HTMLButtonElement),stageButtons=Array.from(rail.querySelectorAll<HTMLButtonElement>('button')).filter(b=>!b.hidden),zoneButtons=Array.from(zoneRail.querySelectorAll<HTMLButtonElement>('button')),selectedStage=()=>stageButtons.find(b=>b.dataset.stage===setup.stage)?.focus();
 if(index>=0){const cols=columns();if(direction==='up'&&index<cols){el(target==='fighter'?'choose-player':'choose-rival').focus();return;}if(direction==='down'&&index+cols>=portraits.length){selectedStage();return;}const offset=direction==='left'?-1:direction==='right'?1:direction==='up'?-cols:cols;portraits[(index+offset+portraits.length)%portraits.length].focus();return;}
 const zi=zoneButtons.indexOf(active as HTMLButtonElement);if(zi>=0){if(direction==='down'){selectedStage();return;}if(direction==='up'){el('random-stage').focus();return;}zoneButtons[(zi+(direction==='left'?-1:1)+zoneButtons.length)%zoneButtons.length].focus();return;}
 const si=stageButtons.indexOf(active as HTMLButtonElement);if(si>=0){if(direction==='up'){zoneButtons.find(b=>b.dataset.zone===stageZone(setup.stage))?.focus();return;}if(direction==='down'){el('mode').focus();return;}if((direction==='left'&&si===0)||(direction==='right'&&si===stageButtons.length-1)){el('random-stage').focus();return;}stageButtons[si+(direction==='left'?-1:1)].focus();return;}
 if(active===el('random-stage')){if(direction==='up'){el('story-worlds')?.focus();return;}if(direction==='down'){zoneButtons.find(b=>b.dataset.zone===stageZone(setup.stage))?.focus();return;}zoneButtons[direction==='left'?zoneButtons.length-1:0].focus();return;}
 // Launch controls, top to bottom. Disabled ones (difficulty outside CPU, rules outside CPU / versus, a locked God Mode) are skipped.
 const launch=(['mode','cpu-difficulty','rules','god-mode','start-fight'] as const).map(id=>el<HTMLInputElement>(id)).filter(control=>!control.disabled||control.id==='start-fight'||control.id==='mode');
 const li=launch.indexOf(active as HTMLInputElement);
 if(li>=0){
  const isStart=active===el('start-fight');
  if(direction==='up'||(isStart&&direction==='left')){if(li===0)selectedStage();else launch[li-1].focus();return;}
  if(direction==='down'){if(isStart)el(target==='fighter'?'choose-player':'choose-rival').focus();else launch[li+1].focus();return;}
  if(active instanceof HTMLSelectElement||(active as unknown as {options?:unknown}).options){const select=active as HTMLSelectElement;select.selectedIndex=(select.selectedIndex+(direction==='left'?-1:1)+select.options.length)%select.options.length;select.dispatchEvent(new Event('change'));return;}
 }
 if(active===el('choose-player')||active===el('choose-rival')){if(direction==='down'){focusSelected();return;}if(direction==='up'){el('start-fight').focus();return;}}
 const controls=Array.from(document.querySelectorAll<HTMLElement>('#selection-view button, #selection-view select, #selection-view input, .top-navigation button')).filter(b=>!b.hidden&&!(b as HTMLButtonElement).disabled&&b.offsetParent!==null);const i=controls.indexOf(active);controls[(i+(direction==='left'||direction==='up'?-1:1)+controls.length)%controls.length]?.focus();}

 root.addEventListener('keydown',e=>{if(!open)return;const direction=e.ctrlKey||e.metaKey||e.altKey?'':menuKeyDirection(e.code);if(direction){e.preventDefault();navigate(direction);}else if(e.key==='Escape'){e.preventDefault();back();}});
 window.addEventListener('resize',()=>{if(open)preview();});
 update();
 return {get isOpen(){return open;},getSetup:()=>({...setup}),setSetup(next:Partial<SelectionSetup>){setup={...setup,...next};update();void prepareSelection();},setReady(value:boolean,message?:string){ready=value;loadFailed=!value&&!!message;launchState();if(message&&canSelect(setup.fighter))el('selection-loading').textContent=message;preview();},show(){storyProgress.sync();open=true;root.hidden=false;update();void prepareSelection();focusSelected();},hide(){open=false;root.hidden=true;},refreshLocks:update,refresh:preview,
 pollPad(pad:PadLike|null){const buttons=pad?readButtons(pad):[];const blocked=root.hidden||!!document.querySelector('dialog[open]');if(!open||blocked){lastButtons=buttons;repeat.reset();return;}const direction=pad?menuDirection(buttons,pad.axes):'';if(repeat.next(direction,performance.now()))navigate(direction);if(buttons[PAD.a]&&!lastButtons[PAD.a]){const active=document.activeElement;if(active instanceof HTMLElement&&active.matches('button,input[type=checkbox]'))active.click();else focusSelected();}if(buttons[PAD.b]&&!lastButtons[PAD.b])back();if(buttons[PAD.x]&&!lastButtons[PAD.x])selectSide(target==='fighter'?'opponent':'fighter');if(buttons[PAD.start]&&!lastButtons[PAD.start])el('start-fight').focus();lastButtons=buttons;}
 };
}
