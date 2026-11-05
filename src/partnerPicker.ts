import {PLAYABLE_FIGHTERS,ROSTER,type FighterId,type PlayableFighterId} from './core';

export function createPartnerPicker(canPlay:(id:PlayableFighterId)=>boolean){
    const dialog=document.createElement('dialog');
    dialog.id='partner-picker';
    dialog.setAttribute('aria-labelledby','partner-picker-title');
    dialog.innerHTML=`<form method="dialog">
        <h2 id="partner-picker-title">Choose your partner</h2>
        <p id="partner-picker-fighter"></p>
        <label>Team Special partner <select id="partner-choice"></select></label>
        <div class="partner-actions">
            <button type="submit" class="quiet" value="cancel">Back</button>
            <button type="submit" class="quiet" id="partner-confirm" value="confirm">Continue</button>
        </div>
    </form>`;
    document.body.append(dialog);
    const select=dialog.querySelector('select')!;
    dialog.addEventListener('cancel',event=>{event.preventDefault();dialog.close('cancel');});
    return {
        get isOpen(){return dialog.open;},
        choose(fighter:PlayableFighterId,selected?:FighterId){
            if(dialog.open)return Promise.resolve(null);
            const usual=ROSTER[fighter].partner;
            const options=PLAYABLE_FIGHTERS.filter(id=>id!==fighter&&id!==usual&&canPlay(id));
            options.sort((left,right)=>ROSTER[left].name.localeCompare(ROSTER[right].name));
            select.replaceChildren();
            for(const id of [usual,...options]){
                const option=document.createElement('option');
                option.value=id;
                option.textContent=ROSTER[id].name+(id===usual?' (default)':'');
                select.append(option);
            }
            select.value=selected&&options.includes(selected as PlayableFighterId)?selected:usual;
            dialog.querySelector('#partner-picker-fighter')!.textContent=ROSTER[fighter].name;
            dialog.returnValue='';
            dialog.showModal();
            select.focus();
            return new Promise<FighterId|null>(resolve=>{
                dialog.addEventListener('close',()=>resolve(dialog.returnValue==='confirm'?select.value as FighterId:null),{once:true});
            });
        },
    };
}
