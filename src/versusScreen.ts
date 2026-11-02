import {ROSTER,isPairedFighter,type PlayableFighterId} from './core';
import {originalPortraits} from './originalPortraits';

/** UI time only: never enters the deterministic combat or replay stream. */
export const VERSUS_FRAMES=132;
export function createVersusScreen(host:HTMLElement,onFinish:()=>void){
 const root=document.createElement('section');root.className='versus-screen';root.hidden=true;
 root.setAttribute('aria-label','Matchup preview');root.setAttribute('aria-live','polite');
 const heading=document.createElement('h2');heading.textContent='NEXT FIGHT';
 const lineup=document.createElement('div');lineup.className='versus-lineup';
 const sides=Array.from({length:2},(_,index)=>{
  const card=document.createElement('figure');card.className=`versus-fighter versus-${index===0?'player':'rival'}`;
  const label=document.createElement('div');label.className='versus-side';label.textContent=index===0?'P1 / YOU':'RIVAL';
  const image=document.createElement('img');image.draggable=false;image.decoding='async';
  const caption=document.createElement('figcaption');const name=document.createElement('h3');caption.append(name);
  image.onerror=()=>{image.hidden=true;card.classList.add('portrait-unavailable');};
  image.onload=()=>{image.hidden=false;card.classList.remove('portrait-unavailable');};
  card.append(label,image,caption);return {card,image,name};
 });
 const versus=document.createElement('strong');versus.className='versus-mark';versus.textContent='VS';versus.setAttribute('aria-hidden','true');
 lineup.append(sides[0].card,versus,sides[1].card);
 const skip=document.createElement('button');skip.type='button';skip.className='versus-skip';skip.textContent='Continue · Enter / A';
 const hint=document.createElement('p');hint.className='versus-hint';hint.textContent='Starting automatically · Esc pauses';
 root.append(heading,lineup,skip,hint);host.append(root);
 let age=0,suspended=false;
 function suspend(value:boolean){suspended=value;root.classList.toggle('is-suspended',value);root.setAttribute('aria-hidden',String(value));}
 function hide(){root.hidden=true;age=0;suspend(false);}
 function finish(){if(root.hidden||suspended)return;hide();onFinish();}
 skip.onclick=finish;
 return {
  get isOpen(){return !root.hidden;},
  show(player:PlayableFighterId,rival:PlayableFighterId){
   [player,rival].forEach((id,index)=>{
    const side=sides[index];side.name.textContent=ROSTER[id].name;side.card.setAttribute('data-fighter',id);
    side.image.alt=`${ROSTER[id].name} — original profile picture`;
    side.image.hidden=false;side.card.classList.remove('portrait-unavailable');
    side.image.src=originalPortraits[id];side.card.classList.toggle('is-paired',isPairedFighter(id));
   });
   age=0;suspend(false);root.hidden=false;
  },
  /** Always consumes the frame in which the preview closes. */
  advance(){if(root.hidden)return false;if(!suspended&&++age>=VERSUS_FRAMES)finish();return true;},
  skip:finish,
  suspend,
  hide,
 };
}
