import { ROSTER, COMBAT_STYLES, PLAYABLE_FIGHTERS, specialPartnerIds, bodyAtlasIds, isPairedFighter, createState, getMove, FLOOR, type PlayableFighterId, type Mode } from './core';
import { originalPortraits } from './originalPortraits';
import { drawSelectionPose } from './poseAtlas';
import { STAGES, drawStagePreview, type StageId } from './stage';
export interface SelectionSetup { fighter:PlayableFighterId; opponent:PlayableFighterId; stage:StageId; mode:Mode }
/** Local selection state only. The match is created by the explicit start hook. */
export function createSelectionMenu(hooks:{start:(setup:SelectionSetup)=>void;prepare?:(ids:PlayableFighterId[])=>Promise<void>}){
 const root=document.getElementById('selection-view')!;
 let setup:SelectionSetup={fighter:'rivet',opponent:'vela',stage:'ranch',mode:'cpu'},target:'fighter'|'opponent'='fighter',ready=false,open=true;
 let lastButtons:number[]=[],lastDirection='',repeatAt=0,assetRequest=0,artLoading=false;
 root.innerHTML=`<div class="arcade-echoes" aria-hidden="true"><img id="player-echo" alt=""><img id="rival-echo" alt=""></div>
 <div class="selection-heading"><span class="heading-rule"></span><h1>MEMBER <em>SELECT</em></h1><span class="heading-rule"></span></div>
 <section class="selection-locations" aria-labelledby="locations-heading"><div class="selection-section-heading"><h2 id="locations-heading">SELECT THE STAGE</h2><button id="random-stage" class="text-button">↻ RANDOM STAGE</button></div><div class="stage-rail"></div><p class="stage-swipe-cue">← Swipe to explore all ${STAGES.length} stages →</p></section>
 <div class="selection-launch"><label for="mode">RIVAL BEHAVIOR<select id="mode"><option value="cpu">CPU · Fights back</option><option value="dummy">Practice · Standing dummy</option><option value="guard">Practice · Guard dummy</option></select></label><div class="menu-instructions"><span>Arrows: move · Enter: select · Tab: section<br>Pad: D-pad / stick · A: select · B: back · X: change side</span></div><button id="start-fight" class="start-fight" disabled>LOADING FIGHTERS…</button></div><p id="selection-loading" role="status" class="selection-hint">Loading installed fighter sprites…</p>
 <div class="match-preview"><canvas id="selection-stage" width="1280" height="420" aria-label="Selected stage with both fighters facing one another"></canvas><div class="preview-shade"></div><div class="versus" aria-hidden="true"><b>VS</b></div><div class="preview-stage-label"><span>BATTLEGROUND</span><b id="selected-stage-name"></b></div><div class="fighter-summary red" id="player-summary"></div><div class="fighter-summary blue" id="rival-summary"></div></div>
 <section class="selection-roster" aria-labelledby="roster-heading"><div class="selection-section-heading"><div class="side-switch" aria-label="Choose which side to edit"><button id="choose-player" class="side-tab red" aria-pressed="true">P1 <span id="player-selection-name">YOUR FIGHTER</span></button><button id="choose-rival" class="side-tab blue" aria-pressed="false">CPU <span id="rival-selection-name">YOUR RIVAL</span></button></div><h2 id="roster-heading">SELECT YOUR FIGHTER</h2><span class="roster-total">${PLAYABLE_FIGHTERS.length} / SELECTABLE</span></div><div class="selection-grid" role="group" aria-label="Fighter portraits"></div><p id="selection-announcement" class="selection-hint" aria-live="polite"></p></section>
`;
 const el=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
 const grid=root.querySelector('.selection-grid')!,rail=root.querySelector('.stage-rail')!;
 const portraits:HTMLButtonElement[]=[];
 for(const id of PLAYABLE_FIGHTERS){const button=document.createElement('button');button.className='portrait-choice';button.dataset.fighter=id;button.setAttribute('aria-label',ROSTER[id].name);button.innerHTML=`<img src="${originalPortraits[id]}" alt="" loading="eager"><span class="portrait-name">${ROSTER[id].name}</span><span class="side-marker p1">P1</span><span class="side-marker cpu">CPU</span>`;button.onclick=()=>choose(id);button.onfocus=()=>{portraits.forEach(b=>b.tabIndex=b===button?0:-1);};grid.append(button);portraits.push(button);}
 const random=document.createElement('button');random.className='portrait-choice random-choice';random.innerHTML='<strong>?</strong><span>RANDOM FIGHTER</span>';random.setAttribute('aria-label','Random fighter for selected side');random.onclick=()=>choose(PLAYABLE_FIGHTERS[Math.floor(Math.random()*PLAYABLE_FIGHTERS.length)]);grid.append(random);portraits.push(random);
 for(const stage of STAGES){const button=document.createElement('button');button.className='stage-choice';button.dataset.stage=stage.id;button.setAttribute('aria-label',stage.name);button.innerHTML=`<canvas width="256" height="110" aria-hidden="true"></canvas><span><small>${stage.chapter?'WORLD 0'+stage.chapter:'BONUS STAGE'}</small><b>${stage.name}</b></span>`;button.onclick=()=>{setup.stage=stage.id;update();};rail.append(button);}
 function stats(id:PlayableFighterId,side:string){const f=createState(id,'dummy').fighters[0],kit=COMBAT_STYLES[id];return `<div class="summary-top"><span>${side}</span><small>${kit.role}</small></div><h2>${ROSTER[id].name}</h2><p>${kit.specialName}</p><dl><div><dt>HEAVY DAMAGE</dt><dd>${getMove(f,'heavy').damage}<small>HP</small></dd></div><div><dt>LIGHT REACH</dt><dd>${getMove(f,'light').range}<small>PX</small></dd></div><div><dt>WALK SPEED</dt><dd>${ROSTER[id].speed.toFixed(2)}<small>PX/F</small></dd></div><div><dt>POWER STARTUP</dt><dd>${getMove(f,'bolt').startup}<small>FR</small></dd></div></dl>`;}
 function preview(){
  const canvas=el<HTMLCanvasElement>('selection-stage');
  const w=Math.round(canvas.clientWidth)||1280,h=Math.round(canvas.clientHeight)||420;
  canvas.width=w;canvas.height=h;
  const c=canvas.getContext('2d')!;drawStagePreview(c,setup.stage,w,h);
  c.fillStyle='#050712a6';c.fillRect(0,0,w,h);
  const fighters=createState(setup.fighter,'dummy',setup.opponent).fighters;
  const compact=w<650,feet=compact?h-146:h-20,scale=Math.min((compact?feet:h)*.0054,w*.0032);
  for(let i=0;i<2;i++){
   const actor=fighters[i],x=w*(i===0?(compact?.25:.35):(compact?.75:.65));
   c.fillStyle=i===0?'#b41e4288':'#1c51de99';c.beginPath();c.ellipse(x,feet+1,w*(compact?.16:.10),5,0,0,Math.PI*2);c.fill();
   c.fillStyle=i===0?'#ff3e5b':'#518aff';c.fillRect(x-w*.06,feet+4,w*.12,1);
   actor.x=0;actor.y=FLOOR;actor.facing=i===0?1:-1;
   // Pack menu bodies by their visible bounds; never shrink a team by body count.
   c.save();c.translate(x,feet);drawSelectionPose(c,actor,scale,w*(compact?.43:.28));c.restore();
  }
  for(const button of Array.from(rail.querySelectorAll<HTMLButtonElement>('button'))){const thumb=button.querySelector('canvas')!;drawStagePreview(thumb.getContext('2d')!,button.dataset.stage as StageId,thumb.width,thumb.height);}
 }

 function update(){root.dataset.side=target;el('choose-player').setAttribute('aria-pressed',String(target==='fighter'));el('choose-rival').setAttribute('aria-pressed',String(target==='opponent'));el('player-selection-name').textContent=ROSTER[setup.fighter].name;el('rival-selection-name').textContent=ROSTER[setup.opponent].name;el<HTMLImageElement>('player-echo').src=originalPortraits[setup.fighter];el<HTMLImageElement>('rival-echo').src=originalPortraits[setup.opponent];el('roster-heading').textContent=target==='fighter'?'SELECT YOUR FIGHTER':'SELECT YOUR CPU RIVAL';for(const button of portraits){const id=button.dataset.fighter;button.classList.toggle('picked-player',id===setup.fighter);button.classList.toggle('picked-rival',id===setup.opponent);button.setAttribute('aria-pressed',String(id===setup[target]));button.tabIndex=id===setup[target]?0:-1;}for(const button of Array.from(rail.querySelectorAll<HTMLButtonElement>('button')))button.setAttribute('aria-pressed',String(button.dataset.stage===setup.stage));el('player-summary').innerHTML=stats(setup.fighter,'P1 / YOU');el('rival-summary').innerHTML=stats(setup.opponent,'CPU / RIVAL');el('selected-stage-name').textContent=STAGES.find(s=>s.id===setup.stage)!.name;el<HTMLSelectElement>('mode').value=setup.mode;el('selection-announcement').textContent=`Editing ${target==='fighter'?'P1':'CPU rival'} · ${ROSTER[setup[target]].name} · ${COMBAT_STYLES[setup[target]].signature} · Special partners: ${specialPartnerIds(setup[target]).map(id=>ROSTER[id].name).join(" + ")}`;preview();}
 function focusSelected(){portraits.find(b=>b.dataset.fighter===setup[target])?.focus();}
 function launchState(){el<HTMLButtonElement>('start-fight').disabled=!ready||artLoading;el('start-fight').textContent=artLoading?'LOADING FIGHTERS…':ready?'START FIGHT  ↗':'FIGHTERS UNAVAILABLE';}
 async function prepareSelection(){
  if(!hooks.prepare)return;
  const request=++assetRequest;artLoading=true;launchState();el('selection-loading').textContent='Loading selected fighters…';
  try{await hooks.prepare([setup.fighter,setup.opponent]);if(request!==assetRequest)return;ready=true;artLoading=false;launchState();el('selection-loading').textContent='Ready · Offline 1v1 · No round timer';preview();}
  catch(error){if(request!==assetRequest)return;ready=false;artLoading=false;launchState();el('selection-loading').textContent='Selected fighter art could not load. Choose again to retry.';console.error(error);}
 }
 function choose(id:PlayableFighterId){setup[target]=id;update();void prepareSelection();}
 function selectSide(side:typeof target){target=side;update();focusSelected();}
 el('choose-player').onclick=()=>selectSide('fighter');el('choose-rival').onclick=()=>selectSide('opponent');
 el('random-stage').onclick=()=>{setup.stage=STAGES[Math.floor(Math.random()*STAGES.length)].id;update();};el<HTMLSelectElement>('mode').onchange=()=>{setup.mode=el<HTMLSelectElement>('mode').value as Mode;};
 el('start-fight').onclick=()=>{if(ready&&!artLoading&&open)hooks.start({...setup});};
 function columns(){const first=portraits[0].getBoundingClientRect().top;return Math.max(1,portraits.filter(b=>Math.abs(b.getBoundingClientRect().top-first)<5).length);}
 function navigate(direction:string){const active=document.activeElement as HTMLElement,index=portraits.indexOf(active as HTMLButtonElement),stageButtons=Array.from(rail.querySelectorAll<HTMLButtonElement>('button')),selectedStage=()=>stageButtons.find(b=>b.dataset.stage===setup.stage)?.focus();
 if(index>=0){const cols=columns();if(direction==='up'&&index<cols){el(target==='fighter'?'choose-player':'choose-rival').focus();return;}if(direction==='down'&&index+cols>=portraits.length){selectedStage();return;}const offset=direction==='left'?-1:direction==='right'?1:direction==='up'?-cols:cols;portraits[(index+offset+portraits.length)%portraits.length].focus();return;}
 const si=stageButtons.indexOf(active as HTMLButtonElement);if(si>=0){if(direction==='up'){el('random-stage').focus();return;}if(direction==='down'){el('mode').focus();return;}if((direction==='left'&&si===0)||(direction==='right'&&si===stageButtons.length-1)){el('random-stage').focus();return;}stageButtons[si+(direction==='left'?-1:1)].focus();return;}
 if(active===el('random-stage')){if(direction==='up'){el('story-worlds')?.focus();return;}if(direction==='down'){selectedStage();return;}stageButtons[direction==='left'?stageButtons.length-1:0].focus();return;}
 if(active===el('mode')){if(direction==='up'){selectedStage();return;}if(direction==='down'){el('start-fight').focus();return;}const select=active as HTMLSelectElement;select.selectedIndex=(select.selectedIndex+(direction==='left'?-1:1)+select.options.length)%select.options.length;select.dispatchEvent(new Event('change'));return;}
 if(active===el('start-fight')){if(direction==='up'||direction==='left'){el('mode').focus();return;}if(direction==='down'){el(target==='fighter'?'choose-player':'choose-rival').focus();return;}}
 if(active===el('choose-player')||active===el('choose-rival')){if(direction==='down'){focusSelected();return;}if(direction==='up'){el('start-fight').focus();return;}}
 const controls=Array.from(document.querySelectorAll<HTMLElement>('#selection-view button, #selection-view select, .top-navigation button')).filter(b=>!b.hidden&&!(b as HTMLButtonElement).disabled&&b.offsetParent!==null);const i=controls.indexOf(active);controls[(i+(direction==='left'||direction==='up'?-1:1)+controls.length)%controls.length]?.focus();}

 root.addEventListener('keydown',e=>{if(!open)return;if(e.key.startsWith('Arrow')){e.preventDefault();navigate(e.key.slice(5).toLowerCase());}else if(e.key==='Escape'){e.preventDefault();selectSide('fighter');}});
 window.addEventListener('resize',()=>{if(open)preview();});
 update();
 return {get isOpen(){return open;},getSetup:()=>({...setup}),setSetup(next:Partial<SelectionSetup>){setup={...setup,...next};update();void prepareSelection();},setReady(value:boolean,message?:string){ready=value;launchState();el('selection-loading').textContent=message??(value?'Ready · Offline 1v1 · No round timer':'Loading installed fighter sprites…');preview();},show(){open=true;root.hidden=false;update();void prepareSelection();focusSelected();},hide(){open=false;root.hidden=true;},refresh:preview,
 pollPad(pad:Gamepad|null){const buttons=pad?.buttons.map(b=>b.pressed?1:0)??[];const blocked=!!document.querySelector('dialog[open]');if(!open||blocked){lastButtons=buttons;lastDirection='';return;}const direction=pad&&(buttons[14]||pad.axes[0]<-.55)?'left':pad&&(buttons[15]||pad.axes[0]>.55)?'right':pad&&(buttons[12]||pad.axes[1]<-.55)?'up':pad&&(buttons[13]||pad.axes[1]>.55)?'down':'';const now=performance.now();if(direction&&(direction!==lastDirection||now>=repeatAt)){navigate(direction);repeatAt=now+(direction===lastDirection?150:360);}lastDirection=direction;if(buttons[0]&&!lastButtons[0]){const active=document.activeElement;if(active instanceof HTMLElement&&active.matches('button'))active.click();else focusSelected();}if(buttons[1]&&!lastButtons[1])selectSide('fighter');if(buttons[2]&&!lastButtons[2])selectSide(target==='fighter'?'opponent':'fighter');if(buttons[9]&&!lastButtons[9])el('start-fight').focus();lastButtons=buttons;}
 };
}
