/** A presentation-only countdown. Combat starts on FIGHT, never during 3/2/1. */
export const COUNTDOWN_FRAMES=180,FIGHT_CUE_FRAMES=36;
export function createFightCountdown(host:HTMLElement){
 const root=document.createElement('div');root.className='fight-countdown';root.hidden=true;
 root.setAttribute('role','status');root.setAttribute('aria-live','polite');
 const word=document.createElement('strong');root.append(word);host.append(root);
 let age=0,suspended=false;
 function suspend(value:boolean){suspended=value;root.classList.toggle('is-suspended',value);root.setAttribute('aria-hidden',String(value));}
 function hide(){root.hidden=true;age=0;suspend(false);}
 return {
  get isOpen(){return !root.hidden;},
  show(){age=0;suspend(false);word.textContent='3';root.classList.remove('is-fight');root.hidden=false;},
  hide,
  suspend,
  advance(){
   if(root.hidden)return false;
   if(suspended)return true;
   age++;
   const next=age>=COUNTDOWN_FRAMES?'FIGHT!':String(3-Math.floor(age/60));
   if(word.textContent!==next)word.textContent=next;
   root.classList.toggle('is-fight',age>=COUNTDOWN_FRAMES);
   if(age>=COUNTDOWN_FRAMES+FIGHT_CUE_FRAMES)hide();
   return !root.hidden&&age<COUNTDOWN_FRAMES;
  },
 };
}
