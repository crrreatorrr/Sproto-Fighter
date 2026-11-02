import {A,FLOOR,WIDTH,ROSTER,PLAYABLE_FIGHTERS,isPairedFighter,bodySpread,fighterWall,createState,step,isDown,type Fighter,type CombatState} from './core';
import {ensurePoseAtlases,drawPoseAtlas,setPoseAtlasThrowState,setPoseAtlasPresentation,getDuoPoseDebug,getDuoLayoutDebug} from './poseAtlas';
import {drawTeamSpecialBack,drawTeamSpecialFront} from './teamSpecial';
import {drawMindBeams} from './mindBeamArt';
import {drawPower} from './powerArt';
const $=(id:string)=>document.getElementById(id)!;
const sel=(id:string)=>$(id) as HTMLSelectElement;
const ids=PLAYABLE_FIGHTERS.filter(isPairedFighter),groups=Array.from({length:Math.ceil(ids.length/4)},(_,i)=>ids.slice(i*4,i*4+4));
groups.forEach((g,i)=>sel('group').add(new Option(`${i+1}: ${g.join(', ')}`,String(i))));
const actions=['idle','walk','dash','jump','light','medium','heavy','low','sweep','launcher','bolt','airLight','airMedium','airHeavy','grab forward','grab back','grab up','grab down','victim forward','victim back','victim up','victim down','hit','heavyHit','launchHit','block','special'];
actions.forEach(a=>sel('action').add(new Option(a,a)));
let states:CombatState[]=[],age=0,cycle=0,playing=false,last=0,acc=0,ready=false;
const face=()=>Number(sel('face').value),action=()=>sel('action').value;
const scenes=()=>['light','medium','heavy','low','sweep','launcher','hit','heavyHit','launchHit','block'].includes(action())||action().startsWith('grab')||action().startsWith('victim');
async function load(){ready=false;$('status').textContent='Loading selected body atlases…';await ensurePoseAtlases([...groups[Number(sel('group').value)],'vela']);ready=true;reset();}
function reset(){
 age=0;cycle=0;states=groups[Number(sel('group').value)].map(id=>{
  const s=createState(id,'cpu','vela'),[f,b]=s.fighters;f.pips=3;f.facing=face();b.facing=-face();
  const gap=scenes()?60+bodySpread(id)+bodySpread(b.id):action()==='special'?350:480;
  f.x=640-face()*gap/2;b.x=f.x+face()*gap;
  const lo=Math.max(fighterWall(f.id),fighterWall(b.id)-(b.x-f.x)),hi=Math.min(WIDTH-fighterWall(f.id),WIDTH-fighterWall(b.id)-(b.x-f.x));
  if(sel('edge').value!=='center'){f.x=sel('edge').value==='left wall'?lo:hi;b.x=f.x+face()*gap;}
  return s;
 });
 $('grid').replaceChildren();states.forEach(s=>{const card=document.createElement('section');card.className='card';card.innerHTML=`<h2>${ROSTER[s.fighters[0].id].name} · ${s.fighters[0].id}</h2><canvas width="620" height="246"></canvas><p class="meta"></p>`;$('grid').append(card);});draw();
}
function direction(f:Fighter,name:string){return name==='up'?A.up:name==='down'?A.down:name==='back'?(f.facing===1?A.left:A.right):0;}
function input(s:CombatState):[number,number]{const a=action(),f=s.fighters[0],forward=f.facing===1?A.right:A.left,back=f.facing===1?A.left:A.right;let p=0,q=0;
 if(a==='walk')p=age<35?forward:age<70?back:0;
 else if(a==='dash')p=age===0?forward|A.dash:age===38?back|A.dash:0;
 else if(a==='jump')p=age<18?forward|(age===0?A.up:0):age<35?back:0;
 else if(a.startsWith('victim'))q=age===0?A.grab|direction(s.fighters[1],a.split(' ')[1]):0;
 else if(a.startsWith('grab'))p=age===0?A.grab|direction(f,a.split(' ')[1]):0;
 else if(['hit','heavyHit','launchHit','block'].includes(a)){q=age===0?(a==='heavyHit'?A.heavy:a==='launchHit'?A.launcher:A.light):0;if(a==='block')p=back;}
 else if(a.startsWith('air'))p=age===0?A.up:age===9?(a==='airLight'?A.light:a==='airMedium'?A.medium:A.heavy):0;
 else if(age===0)p=a==='low'?A.down|A.light:a==='sweep'?A.down|A.heavy:(A[a as keyof typeof A]??0);
 return[p,q];
}
function tick(){if(!ready)return;states.forEach(s=>step(s,input(s)));age++;if(age>200){reset();cycle++;}draw();}
function draw(){if(!ready)return;setPoseAtlasPresentation(null,[]);const cards=Array.from($('grid').children);
 states.forEach((s,i)=>{
  const c=cards[i].querySelector('canvas')!.getContext('2d')!,f=s.fighters[0];
  c.fillStyle='#26384b';c.fillRect(0,0,620,246);c.save();const scale=action()==='special'?.58:.68,camera=scenes()?(s.fighters[0].x+s.fighters[1].x)/2:f.x;
  c.translate(310,225);c.scale(scale,scale);c.translate(-camera,-FLOOR);
  c.fillStyle='#6e8ba4';c.fillRect(0,FLOOR,WIDTH,2);c.fillStyle='#e4a74c';c.fillRect(0,FLOOR-260,3,260);c.fillRect(WIDTH-3,FLOOR-260,3,260);
  setPoseAtlasThrowState(s.throwState,s.fighters);drawTeamSpecialBack(c,s);
  const d0=isDown(s.fighters[0]),d1=isDown(s.fighters[1]),front=s.throwState?.attacker??(d0!==d1?(d0?1:0):(s.fighters[1].move&&!f.move?1:0));
  for(const n of [1-front,front])drawPoseAtlas(c,s.fighters[n],s.frame,false,s.freeze>0);
  drawTeamSpecialFront(c,s);drawMindBeams(c,s);
  for(const p of s.projectiles){if(p.beamLength)continue;c.save();c.translate(p.x,p.y);c.rotate(Math.atan2(p.vy,p.vx));drawPower(c,p.shape??'spark',p.age??0,ROSTER[f.id].color);c.restore();}c.restore();
  const d=getDuoPoseDebug(f,s.frame,s.freeze>0),l=getDuoLayoutDebug(f,s.frame);
  cards[i].querySelector('.meta')!.textContent=`${d.map(v=>v.sequence+':'+v.frameIndex).join(' / ')} · offset ${l.offsets.map(v=>v.toFixed(1)).join(', ')} · HP ${s.fighters.map(f=>f.hp).join('/')}${s.throwState?' · '+s.throwState.direction+' '+s.throwState.phase:''}`;
 });
 $('status').textContent=`${ids.length} paired fighters · ${action()} · frame ${age} · ${sel('face').selectedOptions[0].text} · ${sel('edge').value} · ${playing?'PLAYING':'PAUSED'}`;
}
for(const id of ['action','face','edge'])sel(id).onchange=reset;sel('group').onchange=load;
$('play').onclick=()=>{playing=!playing;$('play').textContent=playing?'Pause':'Play';last=0;acc=0;draw();};$('reset').onclick=reset;
$('advance').onclick=()=>{playing=false;$('play').textContent='Play';for(let n=0;n<Math.min(360,Number(($('frames') as HTMLInputElement).value));n++)tick();};
function loop(now:number){if(last&&playing&&ready){acc+=Math.min(100,now-last)*Number(sel('speed').value);while(acc>=1000/60){tick();acc-=1000/60;}}last=now;requestAnimationFrame(loop);}load();requestAnimationFrame(loop);
