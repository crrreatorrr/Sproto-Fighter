import {STORY_LOCATIONS,loadStoryLocation,drawStoryLocation} from './stageVariants';
import {FLOOR,createState,step,A} from './core';
import {ensurePoseAtlases,drawPoseAtlas,setPoseAtlasPresentation} from './poseAtlas';
const $=(id:string)=>document.getElementById(id)!;
const group=$('group') as HTMLSelectElement,position=$('position') as HTMLSelectElement;
let state=createState('duo','dummy','vela'),ready=false,playing=false,frame=0,last=0,acc=0,request=0;
function reset(){state=createState('duo','dummy','vela');frame=0;const[a,b]=state.fighters;a.x=position.value==='corners'?140:440;b.x=position.value==='corners'?1210:840;draw();}
async function load(){const token=++request;ready=false;$('status').textContent='Loading approved artwork…';const locations=STORY_LOCATIONS.slice(+group.value*6,+group.value*6+6);
 try{await Promise.all([ensurePoseAtlases(['duo','vela']),...locations.map(loadStoryLocation)]);if(token!==request)return;
 $('grid').replaceChildren();for(const location of locations){const panel=document.createElement('section');panel.className='scene';const title=document.createElement('h2');title.textContent=`${location.stage} / ${location.title}`;const canvas=document.createElement('canvas');canvas.width=640;canvas.height=360;panel.append(title,canvas);$('grid').append(panel);}ready=true;reset();
 }catch(error){$('status').textContent=String(error);}
}
function draw(){if(!ready)return;setPoseAtlasPresentation(null,[]);const canvases=Array.from($('grid').querySelectorAll('canvas'));
 STORY_LOCATIONS.slice(+group.value*6,+group.value*6+6).forEach((location,i)=>{const c=canvases[i].getContext('2d')!;c.save();c.scale(.5,.5);drawStoryLocation(c,location);
  for(const f of state.fighters){c.fillStyle='#10172555';c.beginPath();c.ellipse(f.x,FLOOR+3,f.id==='duo'?115:38,7,0,0,Math.PI*2);c.fill();drawPoseAtlas(c,f,state.frame,false,state.freeze>0);}c.restore();});
 $('status').textContent=`Locations ${+group.value*6+1}–${+group.value*6+6} of 24 · ${position.value} · frame ${frame} · ${playing?'PLAYING':'PAUSED'}`;
}
group.onchange=()=>{void load();};position.onchange=reset;$('play').onclick=()=>{playing=!playing;$('play').textContent=playing?'Pause':'Play';last=0;acc=0;draw();};
function loop(now:number){if(ready&&playing&&last){acc+=Math.min(100,now-last);while(acc>=1000/60){const move=frame%120<30?A.right:frame%120<60?A.left:0;step(state,[move,0]);frame++;acc-=1000/60;}draw();}last=now;requestAnimationFrame(loop);}void load();requestAnimationFrame(loop);
