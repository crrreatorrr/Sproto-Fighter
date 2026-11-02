import {campaignMapPoints} from './campaignMapLayout';
import {ROSTER} from './core';
import {originalPortraits} from './originalPortraits';
import {STAGES} from './stage';
import {STORY_ENCOUNTERS,type Encounter,type StoryProgress} from './storyProgress';
import {storyLocationForEncounter} from './stageVariants';

/** A real 100-button map; artwork is decorative and never defines save order. */
export function mountCampaignMap(parent:HTMLElement,progress:StoryProgress,choose:(encounter:Encounter)=>void){
 const save=progress.snapshot(),points=campaignMapPoints(STORY_ENCOUNTERS),root=document.createElement('section');root.className='campaign';
 root.innerHTML='<div class="campaign-toolbar"><strong>OUT OF THE TRENCHES</strong><button class="quiet campaign-current">Find next fight</button><label>Map zoom <input class="campaign-zoom" type="range" min="2400" max="3840" step="200" value="3000"></label></div><p class="campaign-help">Scroll the map. Choose a numbered rival to inspect it. Arrow keys move between rivals; Enter selects. Gold is next, green is cleared, grey is locked.</p><div class="campaign-regions" aria-label="Jump to a map region"></div><div class="campaign-window" tabindex="0" aria-label="Scrollable campaign map"><div class="campaign-land"><img class="campaign-art" src="/story/campaign-map.webp" alt="Pixel map: trenches, neon city, yacht marina, castle, bar district and the Verse portal." draggable="false"><svg class="campaign-trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg><div class="campaign-nodes" role="group" aria-label="100 story encounters"></div></div></div><div class="campaign-rival" aria-live="polite"></div>';
 parent.append(root);
 const chapters=parent.querySelector<HTMLElement>('.campaign-chapter-list');if(chapters)chapters.hidden=true;
 const viewport=root.querySelector<HTMLElement>('.campaign-window')!;
 const land=root.querySelector<HTMLElement>('.campaign-land')!,rival=root.querySelector<HTMLElement>('.campaign-rival')!,nodes=root.querySelector<HTMLElement>('.campaign-nodes')!;
 const regionBar=root.querySelector<HTMLElement>('.campaign-regions')!,zoom=root.querySelector<HTMLInputElement>('.campaign-zoom')!;
 const trail=root.querySelector<SVGElement>('.campaign-trail')!;
 trail.innerHTML=`<polyline points="${points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#0c1428" stroke-width=".28"/><polyline points="${points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#f9d987" stroke-width=".09" stroke-dasharray=".22 .16"/>`;
 let selected=Math.min(save.cleared.length,99);
 const buttons:HTMLButtonElement[]=[];
 const pan=()=>viewport.scrollTo({left:points[selected][0]*land.clientWidth/100-viewport.clientWidth/2,top:points[selected][1]*land.clientHeight/100-viewport.clientHeight/2});
 const select=(index:number)=>{selected=Math.max(0,Math.min(99,index));for(const [i,b] of buttons.entries()){b.tabIndex=i===selected?0:-1;b.setAttribute('aria-pressed',String(i===selected));}pan();preview();};
 const focus=(index:number)=>{select(index);buttons[selected].focus({preventScroll:true});};
 function preview(){
  const encounter=STORY_ENCOUNTERS[selected],level=STAGES.find(s=>s.id===encounter.stage)!,location=storyLocationForEncounter(encounter,STORY_ENCOUNTERS),available=progress.canPlay(selected),cleared=save.cleared.includes(encounter.id);
  rival.replaceChildren();const portrait=document.createElement('img');portrait.src=originalPortraits[encounter.opponent];portrait.alt=ROSTER[encounter.opponent].name;
  const copy=document.createElement('div'),heading=document.createElement('h3');heading.textContent=`${String(selected+1).padStart(3,'0')} / ${ROSTER[encounter.opponent].name}`;
  const info=document.createElement('p');info.textContent=`${level.name}${location?' · '+location.title:''} · ${cleared?'RECRUITED':available?'READY TO CHALLENGE':'LOCKED'}`;
  const note=document.createElement('p');note.textContent=selected>=98?'Final gauntlet: defeat Morelight, refill health, then defeat Vaudream without leaving or losing.':available?'Victory recruits this fighter. God Mode test victories do not change progress.':'Clear preceding encounters to unlock this fight.';
  copy.append(heading,info,note);const start=document.createElement('button');start.className='primary';start.disabled=!available;start.textContent=available?(cleared?'Replay encounter':'Challenge rival'):'Locked';start.onclick=()=>choose(encounter);rival.append(portrait,copy,start);
 }
 for(const [i,encounter] of STORY_ENCOUNTERS.entries()){
  const b=document.createElement('button'),cleared=save.cleared.includes(encounter.id),available=progress.canPlay(i);b.className='campaign-node '+(cleared?'cleared':available?'available':'locked');
  b.style.left=points[i][0]+'%';b.style.top=points[i][1]+'%';b.dataset.encounter=encounter.id;b.textContent=String(i+1);b.title=ROSTER[encounter.opponent].name;
  b.setAttribute('aria-label',`Encounter ${i+1}: ${ROSTER[encounter.opponent].name}, ${cleared?'cleared':available?'available':'locked'}`);b.tabIndex=i===selected?0:-1;b.setAttribute('aria-pressed',String(i===selected));
  b.onclick=()=>focus(i);b.onfocus=()=>select(i);b.onkeydown=e=>{const delta=e.key==='ArrowRight'||e.key==='ArrowDown'?1:e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:0;if(delta){e.preventDefault();e.stopPropagation();focus(i+delta);}};nodes.append(b);buttons.push(b);
 }
 for(const stage of [...new Set(STORY_ENCOUNTERS.map(e=>e.stage))]){const b=document.createElement('button');b.className='quiet';b.textContent=STAGES.find(s=>s.id===stage)!.name;b.onclick=()=>focus(STORY_ENCOUNTERS.findIndex(e=>e.stage===stage));regionBar.append(b);}
 zoom.oninput=()=>{land.style.width=zoom.value+'px';land.style.setProperty('--map-node-size',Number(zoom.value)/100+'px');land.style.setProperty('--map-node-font',Math.max(11,Number(zoom.value)/230)+'px');pan();};
 root.querySelector<HTMLButtonElement>('.campaign-current')!.onclick=()=>focus(save.completed?0:Math.min(save.cleared.length,99));
 preview();requestAnimationFrame(()=>{if(root.isConnected)pan();});
}
