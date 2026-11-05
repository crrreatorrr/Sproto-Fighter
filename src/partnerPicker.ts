import {PLAYABLE_FIGHTERS,ROSTER,type FighterId,type PlayableFighterId} from './core';
import {portraitThumb,portraitLarge} from './portraits';

export function createPartnerPicker(canPlay:(id:PlayableFighterId)=>boolean){
    const screen=document.getElementById('partner-picker')!;
    screen.innerHTML=`
        <div class="selection-heading"><span class="heading-rule"></span><h1 id="partner-picker-title">PARTNER <em>SELECT</em></h1><span class="heading-rule"></span></div>
        <div class="partner-lineup">
            <div><img alt="" data-fighter-preview><span>Fighter</span><strong data-fighter-name></strong></div>
            <div><img alt="" data-partner-preview><span>Team Special partner</span><strong data-partner-name aria-live="polite"></strong></div>
        </div>
        <div class="partner-actions">
            <button class="quiet" type="button" id="partner-back">Back</button>
            <button class="start-fight" type="button" id="partner-confirm">Continue</button>
        </div>
        <section class="selection-roster" aria-label="Choose your partner">
            <div class="selection-grid" role="group" aria-label="Partner portraits"></div>
        </section>`;
    const grid=screen.querySelector('.selection-grid')!;
    const confirm=screen.querySelector<HTMLButtonElement>('#partner-confirm')!;
    const back=screen.querySelector<HTMLButtonElement>('#partner-back')!;
    const fighterView=document.getElementById('selection-view')!;
    const fightView=document.getElementById('fight-view')!;
    const nav=document.querySelector<HTMLElement>('.top-navigation')!;
    const buttons=new Map<FighterId,HTMLButtonElement>();
    let selected:FighterId;
    let close:((partner:FighterId|null)=>void)|undefined;
    let lastDirection='',repeatAt=0;

    function pick(id:FighterId){
        selected=id;
        screen.querySelector<HTMLImageElement>('[data-partner-preview]')!.src=portraitLarge(id);
        screen.querySelector('[data-partner-name]')!.textContent=ROSTER[id].name;
        for(const [key,button]of buttons){
            button.setAttribute('aria-pressed',String(key===id));
            button.tabIndex=key===id?0:-1;
        }
    }

    function move(direction:string){
        const entries=[...buttons.values()];
        const current=entries.indexOf(document.activeElement as HTMLButtonElement);
        if(current<0){
            if(direction==='down')buttons.get(selected)?.focus();
            else if(direction==='left'||direction==='right')(document.activeElement===back?confirm:back).focus();
            return;
        }
        const first=entries[0].offsetTop;
        const columns=entries.filter(button=>button.offsetTop===first).length;
        if(direction==='up'&&current<columns){confirm.focus();return;}
        const delta=direction==='left'?-1:direction==='right'?1:direction==='up'?-columns:columns;
        entries[(current+delta+entries.length)%entries.length]?.focus();
    }

    confirm.onclick=()=>close?.(selected);
    back.onclick=()=>close?.(null);
    screen.addEventListener('keydown',event=>{
        if(event.key==='Escape'){event.preventDefault();event.stopPropagation();back.click();}
        else if(event.key.startsWith('Arrow')){
            event.preventDefault();
            move(event.key.slice(5).toLowerCase());
        }
    });

    return {
        get isOpen(){return !screen.hidden;},
        pollPad(pad:Gamepad,buttons:number[],previous:number[]){
            const direction=buttons[14]||pad.axes[0]<-.55?'left':buttons[15]||pad.axes[0]>.55?'right'
                :buttons[12]||pad.axes[1]<-.55?'up':buttons[13]||pad.axes[1]>.55?'down':'';
            const now=performance.now();
            if(direction&&(direction!==lastDirection||now>=repeatAt)){
                move(direction);
                repeatAt=now+(direction===lastDirection?150:360);
            }
            lastDirection=direction;
            if(buttons[1]&&!previous[1])back.click();
            else if(buttons[9]&&!previous[9])confirm.click();
            else if(buttons[0]&&!previous[0]&&document.activeElement instanceof HTMLButtonElement)
                document.activeElement.click();
        },
        choose(fighter:PlayableFighterId,prior?:FighterId){
            if(!screen.hidden)return Promise.resolve(null);
            const usual=ROSTER[fighter].partner;
            const options=PLAYABLE_FIGHTERS.filter(id=>id!==fighter&&id!==usual&&canPlay(id));
            options.sort((left,right)=>ROSTER[left].name.localeCompare(ROSTER[right].name));
            buttons.clear();
            grid.replaceChildren();
            for(const id of [usual,...options]){
                const button=document.createElement('button');
                button.type='button';
                button.className='portrait-choice';
                button.dataset.partner=id;
                button.innerHTML=`<img src="${portraitThumb(id)}" alt="" loading="lazy" decoding="async"><span class="portrait-name"></span>`;
                const name=ROSTER[id].name+(id===usual?' (default)':'');
                button.querySelector('span')!.textContent=name;
                button.onclick=()=>pick(id);
                grid.append(button);
                buttons.set(id,button);
            }
            screen.querySelector<HTMLImageElement>('[data-fighter-preview]')!.src=portraitLarge(fighter);
            screen.querySelector('[data-fighter-name]')!.textContent=ROSTER[fighter].name;
            pick(prior&&buttons.has(prior)?prior:usual);
            const focus=document.activeElement;
            const scroll=window.scrollY;
            const previousViews=[fighterView.hidden,fightView.hidden];
            fighterView.hidden=true;fightView.hidden=true;nav.inert=true;
            screen.hidden=false;
            lastDirection='';
            confirm.focus({preventScroll:true});
            window.scrollTo(0,0);
            return new Promise<FighterId|null>(resolve=>{
                close=partner=>{
                    close=undefined;
                    screen.hidden=true;
                    [fighterView.hidden,fightView.hidden]=previousViews;
                    nav.inert=false;
                    window.scrollTo(0,scroll);
                    if(focus instanceof HTMLElement)focus.focus({preventScroll:true});
                    resolve(partner);
                };
            });
        },
    };
}
