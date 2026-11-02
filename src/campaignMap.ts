import {campaignMapMarkerLayout,campaignMapPaths,campaignMapPoints} from './campaignMapLayout';
import {campaignMapViewport} from './campaignMapViewport';
import {ROSTER} from './core';
import {originalPortraits} from './originalPortraits';
import {STAGES} from './stage';
import {STORY_ENCOUNTERS,type Encounter,type StoryProgress} from './storyProgress';
import {storyLocationForEncounter} from './stageVariants';

/** One button per actual encounter; artwork never defines save order or adds rivals. */
export function mountCampaignMap(parent:HTMLElement,progress:StoryProgress,choose:(encounter:Encounter)=>void){
 const save=progress.snapshot(),points=campaignMapPoints(STORY_ENCOUNTERS),root=document.createElement('section');root.className='campaign is-overview';
 const markerLayout=campaignMapMarkerLayout(points);
 root.innerHTML='<div class="campaign-toolbar"><strong>OUT OF THE TRENCHES</strong><button class="quiet campaign-current">Find next fight</button><button class="quiet campaign-fit">Fit map</button><label>Map zoom <input class="campaign-zoom" type="range" min="100" max="800" step="25" value="100"><output class="campaign-zoom-value">Fit</output></label></div><p class="campaign-help">The full map is visible. Select a rival or region to zoom in. Arrow keys move between rivals; Enter selects. Gold is next, green is cleared, grey is locked.</p><div class="campaign-regions" aria-label="Jump to a map region"></div><div class="campaign-window" tabindex="0" aria-label="Scrollable campaign map"><div class="campaign-land"><img class="campaign-art" src="/story/campaign-map-expanded.webp" alt="Expanded pixel world: trench villages, neon city, Bitcoin yacht marina, castle, bar district and the Verse portal." draggable="false"><svg class="campaign-trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg><div class="campaign-nodes" role="group"></div></div></div><div class="campaign-rival" aria-live="polite"></div>';
 parent.append(root);
 const chapters=parent.querySelector<HTMLElement>('.campaign-chapter-list');if(chapters)chapters.hidden=true;
 const viewport=root.querySelector<HTMLElement>('.campaign-window')!;
 const land=root.querySelector<HTMLElement>('.campaign-land')!,rival=root.querySelector<HTMLElement>('.campaign-rival')!,nodes=root.querySelector<HTMLElement>('.campaign-nodes')!;
 nodes.setAttribute('aria-label',`${STORY_ENCOUNTERS.length} story encounters`);
 const regionBar=root.querySelector<HTMLElement>('.campaign-regions')!,zoom=root.querySelector<HTMLInputElement>('.campaign-zoom')!;
 const zoomValue=root.querySelector<HTMLOutputElement>('.campaign-zoom-value')!,help=root.querySelector<HTMLElement>('.campaign-help')!;
 const trail=root.querySelector<SVGElement>('.campaign-trail')!;
 trail.innerHTML=campaignMapPaths(STORY_ENCOUNTERS).map(path=>`<polyline points="${path.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#0c1428" stroke-width=".28"/><polyline points="${path.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#f9d987" stroke-width=".09" stroke-dasharray=".22 .16"/>`).join('');
 let selected=save.nextIndex??0;
 const buttons:HTMLButtonElement[]=[];
 const pan=()=>viewport.scrollTo({left:points[selected][0]*land.clientWidth/100-viewport.clientWidth/2,top:points[selected][1]*land.clientHeight/100-viewport.clientHeight/2});
 function resize(centerSelected=true){
  if(!root.isConnected||!viewport.clientWidth||!viewport.clientHeight)return;
  const size=campaignMapViewport(viewport.clientWidth,viewport.clientHeight,Number(zoom.value));
  zoom.max=String(size.maxZoom);zoom.value=String(size.zoom);
  land.style.width=size.width+'px';land.style.height=size.height+'px';
  const nodeSize=size.width*markerLayout.nodeRatio;
  land.style.setProperty('--map-node-size',nodeSize+'px');land.style.setProperty('--map-node-font',Math.max(8,Math.min(size.nodeFont,nodeSize/2.4))+'px');
  root.classList.toggle('is-overview',size.overview||size.width*markerLayout.minGapRatio<24);
  zoomValue.value=size.zoom===100?'Fit':size.zoom+'%';zoom.setAttribute('aria-valuetext',size.zoom===100?'Entire map':size.zoom+' percent');
  help.textContent=size.zoom===100?'The full map is visible. Select a rival or region to zoom in. Arrow keys move between rivals; Enter selects. Gold is next, green is cleared, grey is locked.':'Scroll to explore. Arrow keys move between rivals; Enter selects. Fit map shows the whole world. Gold is next, green is cleared, grey is locked.';
  if(size.zoom===100)viewport.scrollTo({left:0,top:0});else if(centerSelected)pan();
 }
 function detail(){
  const size=campaignMapViewport(viewport.clientWidth,viewport.clientHeight,Number(zoom.value));
  if(size.width<markerLayout.detailWidth){zoom.value=String(Math.min(size.maxZoom,Math.ceil(markerLayout.detailWidth/size.fitWidth*4)*25));resize(false);}
 }
 const select=(index:number,showDetail=false)=>{selected=Math.max(0,Math.min(STORY_ENCOUNTERS.length-1,index));for(const [i,b] of buttons.entries()){b.tabIndex=i===selected?0:-1;b.setAttribute('aria-pressed',String(i===selected));}if(showDetail)detail();if(Number(zoom.value)>100)pan();preview();};
 const focus=(index:number)=>{select(index,true);buttons[selected].focus({preventScroll:true});};
 function preview(){
  const encounter=STORY_ENCOUNTERS[selected],level=STAGES.find(s=>s.id===encounter.stage)!,location=storyLocationForEncounter(encounter,STORY_ENCOUNTERS),available=progress.canPlay(selected),cleared=progress.isCleared(selected);
  const names=encounter.opponents.map(id=>ROSTER[id].name),portraits=document.createElement('div');portraits.className='campaign-rival-portraits';
  rival.replaceChildren();for(const id of encounter.opponents){const portrait=document.createElement('img');portrait.src=originalPortraits[id];portrait.alt=ROSTER[id].name;portrait.dataset.fighter=id;portraits.append(portrait);}
  const copy=document.createElement('div'),heading=document.createElement('h3');heading.textContent=`${String(selected+1).padStart(3,'0')} / ${names.join(' → ')}`;
  const info=document.createElement('p');info.textContent=`${level.name}${location?' · '+location.title:''} · ${cleared?'RECRUITED':available?'READY TO CHALLENGE':'LOCKED'}`;
  const note=document.createElement('p');note.textContent=encounter.opponents.length>1?`Gauntlet: defeat ${names.join(', then ')}. Health refills between bouts. Win both without leaving or losing.`:available?'Victory recruits this fighter and opens the next encounter, including in God Mode.':'Clear preceding encounters to unlock this fight.';
  copy.append(heading,info,note);const start=document.createElement('button');start.className='primary';start.disabled=!available;start.textContent=available?(cleared?'Replay encounter':encounter.opponents.length>1?'Challenge gauntlet':'Challenge rival'):'Locked';start.onclick=()=>choose(encounter);rival.append(portraits,copy,start);
 }
 for(const [i,encounter] of STORY_ENCOUNTERS.entries()){
  const b=document.createElement('button'),cleared=progress.isCleared(i),available=progress.canPlay(i);b.className='campaign-node '+(cleared?'cleared':available?'available':'locked');
  const names=encounter.opponents.map(id=>ROSTER[id].name).join(' then ');
  b.style.left=points[i][0]+'%';b.style.top=points[i][1]+'%';b.dataset.encounter=encounter.id;b.textContent=String(i+1);b.title=names;
  b.setAttribute('aria-label',`Encounter ${i+1}: ${names}, ${cleared?'cleared':available?'available':'locked'}`);b.tabIndex=i===selected?0:-1;b.setAttribute('aria-pressed',String(i===selected));
  b.onclick=()=>focus(i);b.onfocus=()=>select(i,true);b.onkeydown=e=>{const delta=e.key==='ArrowRight'||e.key==='ArrowDown'?1:e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:0;if(delta){e.preventDefault();e.stopPropagation();focus(i+delta);}};nodes.append(b);buttons.push(b);
 }
 for(const stage of [...new Set(STORY_ENCOUNTERS.map(e=>e.stage))]){const b=document.createElement('button');b.className='quiet';b.textContent=STAGES.find(s=>s.id===stage)!.name;b.onclick=()=>focus(STORY_ENCOUNTERS.findIndex(e=>e.stage===stage));regionBar.append(b);}
 zoom.oninput=()=>resize();
 root.querySelector<HTMLButtonElement>('.campaign-fit')!.onclick=()=>{zoom.value='100';resize();};
 root.querySelector<HTMLButtonElement>('.campaign-current')!.onclick=()=>focus(progress.snapshot().nextIndex??0);
 preview();requestAnimationFrame(()=>resize());
 // Closing/reopening starts at fit again; resizing preserves the user's current zoom.
 const observer=new ResizeObserver(()=>{if(root.isConnected)resize();else observer.disconnect();});observer.observe(viewport);
}
