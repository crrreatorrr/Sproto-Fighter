// Executes the actual selection controller and main pollPad against a small DOM.
// No browser, canvas aesthetics or physical-controller claim.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const asModule=s=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const core=await import(asModule(bundledCore()));
const ids=new Map();let document,now=1000;
class Element{
 constructor(tag='div',id=''){this.tagName=tag.toUpperCase();this.id=id;this.children=[];this.dataset={};this.attributes={};this.events={};this.hidden=false;this.disabled=false;this.offsetParent={};this.classList={toggle(){}};this.clientWidth=1280;this.clientHeight=420;}
 set innerHTML(s){this.html=s;this.children=[];for(const m of s.matchAll(/<([\w-]+)[^>]*\bid="([^"]+)"/g)){const e=m[1]==='select'?new Select():new Element(m[1]);e.id=m[2];ids.set(e.id,e);}if(s.includes('class="selection-grid"'))this.grid=new Element();if(s.includes('class="stage-rail"'))this.rail=new Element();if(s.includes('<canvas'))this.canvas=new Element('canvas');}
 get innerHTML(){return this.html??'';}setAttribute(k,v){this.attributes[k]=String(v);}getAttribute(k){return this.attributes[k]??null;}
 contains(e){return this===e||this.children.some(c=>c.contains(e));}
 append(e){const index=this.children.indexOf(e);if(index>=0)this.children.splice(index,1);this.children.push(e);}focus(){document.activeElement=this;this.onfocus?.();}click(){if(!this.disabled){if(this.tagName==='INPUT'){this.checked=!this.checked;this.onchange?.();}this.onclick?.();}}
 addEventListener(k,f){this.events[k]=f;}dispatchEvent(e){this.events[e.type]?.(e);if(e.type==='change')this.onchange?.();return true;}
 querySelector(s){if(s==='.selection-grid')return this.grid;if(s.startsWith('.stage-rail'))return this.rail;if(s==='.roster-total')return this.rosterTotal??=new Element();if(s==='canvas')return this.canvas;return null;}
 querySelectorAll(s){return s==='button'?this.children.filter(c=>c.tagName==='BUTTON'):[];}
 getBoundingClientRect(){const i=root.grid?.children.indexOf(this)??-1;return {top:Math.floor(i/11)*100};}
 getContext(){return {fillRect(){},save(){},restore(){},translate(){},scale(){},beginPath(){},ellipse(){},fill(){}};}
 matches(s){return s.includes('button')&&this.tagName==='BUTTON'||s.includes('input')&&this.tagName==='INPUT';}
}
class Select extends Element{constructor(){super('select');this.options=[{value:'cpu'},{value:'dummy'},{value:'guard'}];this.selectedIndex=0;}get value(){return this.options[this.selectedIndex].value;}set value(v){this.selectedIndex=this.options.findIndex(o=>o.value===v);}}
const root=new Element('section','selection-view');ids.set(root.id,root);
for(const id of ['device','start','overlay-select','story-worlds'])ids.set(id,new Element('button',id));
document={activeElement:root,getElementById:id=>ids.get(id),querySelector:()=>null,querySelectorAll:()=>[],createElement:tag=>new Element(tag)};
const actualStage=await import(asModule(read('src/stage.ts')));
const variantsUrl=asModule(read('src/stageVariants.ts')),stageUrl=asModule(read('src/stage.ts'));
const groups=await import(asModule(read('src/stageGroups.ts').replace("from './stage'",`from '${stageUrl}'`).replace("from './stageVariants'",`from '${variantsUrl}'`)));
const stages=actualStage.STAGES;
const unlocked=new Set(['highsproto','bront']),pendingUnlocks=new Set();let completed=false,earnedReward=false;const subscribers=[];const progress={snapshot:()=>({unlocked:[...unlocked],completed,godModeUnlocked:completed||earnedReward}),isUnlocked:id=>unlocked.has(id),subscribe:fn=>subscribers.push(fn),sync(){for(const id of pendingUnlocks)unlocked.add(id);pendingUnlocks.clear();subscribers.forEach(fn=>fn());}};
const modules={'./stageGroups':groups,'./storyProgress':{storyProgress:progress},'./core':core,'./portraits':{portraitThumb:id=>'/portraits/thumb/'+id+'.webp',portraitLarge:id=>'/portraits/large/'+id+'.webp'},'./poseAtlas':{drawPoseAtlasSample:()=>true,drawSelectionPose:()=>true},'./stage':{STAGES:stages,drawStagePreview(){},loadStagePreviews:async()=>{}}};
const context={exports:{},require:id=>modules[id],document,HTMLElement:Element,HTMLButtonElement:Element,HTMLSelectElement:Select,Event:class{constructor(type){this.type=type;}},window:{addEventListener(){}},performance:{now:()=>now},console,Math};vm.createContext(context);vm.runInContext(compile(read('src/selectionMenu.ts')),context);
let launches=0,lastSetup;const menu=context.exports.createSelectionMenu({start(setup){launches++;lastSetup=setup;menu.hide();context.running=true;context.padNeedsRelease=true;}});menu.setReady(true);
assert.ok(root.innerHTML.indexOf('class="selection-locations"')<root.innerHTML.indexOf('class="match-preview"'));assert.ok(root.innerHTML.indexOf('id="start-fight"')<root.innerHTML.indexOf('class="selection-roster"'));
const $=id=>ids.get(id),portraits=root.grid.children,stageButtons=root.rail.children;
const zoneButtons=()=>ids.get('zone-rail').children;const visibleStages=()=>stageButtons.filter(b=>!b.hidden);const currentStage=()=>stageButtons.find(b=>b.dataset.stage===menu.getSetup().stage);const currentZone=()=>zoneButtons().find(b=>b.dataset.zone===groups.stageZone(menu.getSetup().stage));
const starter=portraits.find(p=>p.dataset.fighter==='highsproto');
const key=direction=>{let prevented=false;root.events.keydown({key:'Arrow'+direction,preventDefault(){prevented=true;}});assert.equal(prevented,true);};
const pad=(pressed=[],axes=[0,0])=>({connected:true,axes,buttons:Array.from({length:16},(_,i)=>({pressed:pressed.includes(i)}))});
function menuPress(buttons){now+=1000;menu.pollPad(pad());menu.pollPad(pad(buttons));}
let count=0;const check=(name,fn)=>{fn();count++;console.log('PASS:',name);};
check('unlocked fighters sort alphabetically before locked fighters on both sides and after recruitment',()=>{
 const expected=()=>[...core.PLAYABLE_FIGHTERS].sort((a,b)=>Number(unlocked.has(b))-Number(unlocked.has(a))||core.ROSTER[a].name.localeCompare(core.ROSTER[b].name,'en',{sensitivity:'base',numeric:true})||a.localeCompare(b));
 const verify=()=>{assert.deepEqual(portraits.filter(p=>p.dataset.fighter).map(p=>p.dataset.fighter),expected());assert.equal(portraits.at(-1).dataset.fighter,undefined,'random stays last');};
 verify();$('choose-rival').click();verify();$('choose-player').click();
 const aaron=portraits.find(p=>p.dataset.fighter==='aaron');aaron.focus();unlocked.add('aaron');subscribers.forEach(fn=>fn());verify();assert.equal(document.activeElement,aaron,'reordering retains focus');assert.equal(portraits[0],aaron);
 key('Right');assert.equal(document.activeElement,portraits[1],'keyboard follows sorted order');aaron.focus();menuPress([15]);assert.equal(document.activeElement,portraits[1],'controller follows sorted order');
 unlocked.delete('aaron');subscribers.forEach(fn=>fn());verify();menu.setSetup({fighter:'highsproto'});
});
check('zone selection filters variations and preserves launch identity',()=>{
 assert.equal(zoneButtons().length,8);
 const seen=new Set();for(const zone of groups.STAGE_ZONES){zoneButtons().find(b=>b.dataset.zone===zone.id).click();assert.equal(menu.getSetup().stage,zone.id);assert.deepEqual(visibleStages().map(b=>b.dataset.stage),groups.stagesInZone(zone.id).map(s=>s.id));for(const button of visibleStages())seen.add(button.dataset.stage);}
 assert.equal(seen.size,stages.length);
 zoneButtons().find(b=>b.dataset.zone==='bar').click();const blue=visibleStages().find(b=>b.dataset.stage==='bluebar');assert.ok(blue);blue.click();assert.equal(menu.getSetup().stage,'bluebar');assert.equal(currentZone().dataset.zone,'bar');blue.focus();menuPress([1]);assert.equal(document.activeElement,currentZone());
 menu.setSetup({stage:'starbridge'});assert.equal(currentZone().dataset.zone,'verse');assert.ok(visibleStages().some(b=>b.dataset.stage==='starbridge'));menu.setSetup({stage:'ranch'});
});

check('all 24 approved story panoramas are selectable, including the three new Ranch maps',()=>{
 const approved=JSON.parse(read('public/stages/variations-v2/manifest.json'));
 assert.equal(stages.length,73);
 for(const item of approved){
  const zone=groups.stageZone(item.id);zoneButtons().find(button=>button.dataset.zone===zone).click();
  const button=visibleStages().find(button=>button.dataset.stage===item.id);assert.ok(button,item.id);
  button.click();assert.equal(menu.getSetup().stage,item.id);assert.equal($('selected-stage-name').textContent,stages.find(s=>s.id===item.id).name);
  assert.equal(currentZone().dataset.zone,zone);assert.equal(button.getAttribute('aria-pressed'),'true');
 }
 zoneButtons().find(button=>button.dataset.zone==='ranch').click();
 assert.equal(visibleStages().length,7);assert.equal($('zone-stage-count').textContent,'7 STAGES');
 for(const button of visibleStages()){button.focus();menuPress([0]);assert.equal(menu.getSetup().stage,button.dataset.stage);menuPress([1]);assert.equal(document.activeElement,currentZone());}
 menu.setSetup({stage:'ranch'});
});
check('High starts fresh; locked Golden can be previewed but cannot launch',()=>{assert.equal(menu.getSetup().fighter,'highsproto');const golden=portraits.find(p=>p.dataset.fighter==='rivet');golden.click();assert.equal(menu.getSetup().fighter,'rivet');assert.match($('player-summary').innerHTML,/Golden Sproto/);assert.match(golden.getAttribute('aria-description'),/Select to preview/);assert.equal(golden.getAttribute('aria-disabled'),null);assert.match($('selection-loading').textContent,/locked for P1/);assert.equal($('start-fight').disabled,true);$('start-fight').onclick();assert.equal(launches,0);menu.setSetup({fighter:'highsproto'});assert.equal($('start-fight').disabled,false);});
check('keyboard grid exits reach variation then its zone',()=>{portraits[0].focus();key('Up');assert.equal(document.activeElement,$('choose-player'));key('Down');assert.equal(document.activeElement,starter);portraits.at(-1).focus();key('Down');assert.equal(document.activeElement,currentStage());key('Up');assert.equal(document.activeElement,currentZone());key('Down');assert.equal(document.activeElement,currentStage());});
check('Random Stage returns through zone selection',()=>{visibleStages()[0].focus();key('Left');assert.equal(document.activeElement,$('random-stage'));key('Down');assert.equal(document.activeElement,currentZone());$('random-stage').focus();key('Right');assert.equal(document.activeElement,zoneButtons()[0]);$('random-stage').focus();key('Left');assert.equal(document.activeElement,zoneButtons().at(-1));});
check('stage down reaches mode then CTA; mode changes only the future setup',()=>{currentStage().focus();key('Down');assert.equal(document.activeElement,$('mode'));key('Right');assert.equal(menu.getSetup().mode,'dummy');key('Down');assert.equal(document.activeElement,$('start-fight'));key('Up');assert.equal(document.activeElement,$('mode'));key('Up');assert.equal(document.activeElement,currentStage());assert.equal(launches,0);});
check('every installed campaign rival can be previewed but stays locked until recruited',()=>{for(const id of core.PLAYABLE_FIGHTERS.filter(id=>!unlocked.has(id))){portraits.find(b=>b.dataset.fighter===id).click();assert.equal(menu.getSetup().fighter,id);assert.equal($('start-fight').disabled,true);assert.equal(unlocked.has(id),false);}portraits.find(b=>b.dataset.fighter==='highsproto').click();});
check('gamepad exits variation and enters zone row',()=>{portraits.at(-1).focus();menuPress([13]);assert.equal(document.activeElement,currentStage());menuPress([12]);assert.equal(document.activeElement,currentZone());menuPress([12]);assert.equal(document.activeElement,$('random-stage'));});
check('upper launch controls lead down to side tabs and roster, and back up',()=>{$('start-fight').focus();key('Down');assert.equal(document.activeElement,$('choose-player'));key('Down');assert.equal(document.activeElement,starter);portraits[0].focus();key('Up');assert.equal(document.activeElement,$('choose-player'));key('Up');assert.equal(document.activeElement,$('start-fight'));});
check('locked P1 can be previewed; random P1 uses recruits and CPU choices do not unlock P1',()=>{const locked=portraits.find(p=>p.dataset.fighter==='zephyr');locked.click();assert.equal(menu.getSetup().fighter,'zephyr');assert.equal($('start-fight').disabled,true);assert.match($('selection-announcement').textContent,/locked/);for(let i=0;i<30;i++){portraits.at(-1).click();assert.ok(unlocked.has(menu.getSetup().fighter));}$('choose-rival').click();locked.click();assert.equal(menu.getSetup().opponent,'zephyr');assert.equal(unlocked.has('zephyr'),false);assert.match($('selection-announcement').textContent,/CPU rival \(opponent only\)/);menu.setSetup({fighter:'highsproto',opponent:'vela'});$('choose-player').click();});
check('recruitment updates selection immediately and God Mode is gated until completion',()=>{unlocked.add('zephyr');subscribers.forEach(fn=>fn());portraits.find(p=>p.dataset.fighter==='zephyr').click();assert.equal(menu.getSetup().fighter,'zephyr');assert.equal($('god-mode').disabled,true);$('god-mode').checked=true;$('god-mode').onchange();assert.equal(menu.getSetup().godMode,false);completed=true;subscribers.forEach(fn=>fn());assert.equal($('god-mode').disabled,false);$('god-mode').checked=true;$('god-mode').onchange();assert.equal(menu.getSetup().godMode,true);menu.setSetup({godMode:false});$('mode').focus();key('Down');assert.equal(document.activeElement,$('god-mode'));menuPress([0]);assert.equal(menu.getSetup().godMode,true);key('Down');assert.equal(document.activeElement,$('start-fight'));key('Up');assert.equal(document.activeElement,$('god-mode'));completed=false;subscribers.forEach(fn=>fn());assert.equal(menu.getSetup().godMode,false);menu.setSetup({fighter:'highsproto'});});
check('earned God Mode remains selectable when roster growth leaves new campaign gaps',()=>{earnedReward=true;completed=false;subscribers.forEach(fn=>fn());assert.equal($('god-mode').disabled,false);$('god-mode').checked=true;$('god-mode').onchange();assert.equal(menu.getSetup().godMode,true);earnedReward=false;subscribers.forEach(fn=>fn());assert.equal($('god-mode').disabled,true);assert.equal(menu.getSetup().godMode,false);});
check('gamepad Start focuses CTA; A launches once and held A does not repeat',()=>{menu.setSetup({stage:'bluebar'});menuPress([9]);assert.equal(document.activeElement,$('start-fight'));assert.equal(launches,0);menuPress([0]);assert.equal(launches,1);menu.pollPad(pad([0]));assert.equal(launches,1);assert.equal(lastSetup.fighter,'highsproto');assert.equal(lastSetup.opponent,'vela');assert.equal(lastSetup.mode,'dummy');assert.equal(lastSetup.stage,'bluebar');});
check('each main selection announces exactly its own assigned partner',()=>{
 const prior=[...unlocked];for(const id of core.PLAYABLE_FIGHTERS)unlocked.add(id);subscribers.forEach(fn=>fn());
 menu.show();
 for(const side of ['choose-player','choose-rival']){
  $(side).click();
  for(const id of core.PLAYABLE_FIGHTERS){
  portraits.find(button=>button.dataset.fighter===id).click();
  const hint=$('selection-announcement').textContent;
  const partner=core.ROSTER[id].partner;
  assert.ok(hint.includes('Special partner: '+core.ROSTER[partner].name),id);
  if(core.PARTNER_ATTACKS[partner])assert.ok(hint.endsWith('Partner attack: '+core.PARTNER_ATTACKS[partner].name),id);
  assert.equal(hint.includes('Special partners:'),false);
  }
 }
 unlocked.clear();prior.forEach(id=>unlocked.add(id));subscribers.forEach(fn=>fn());menu.setSetup({fighter:'highsproto',opponent:'vela'});
});
// Compile main's actual pollPad implementation rather than copying its release gate.
const source=ts.createSourceFile('main.ts',read('src/main.ts'),ts.ScriptTarget.Latest,true);const poll=source.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='pollPad');assert.ok(poll);
let currentPad=pad();Object.assign(context,{versus:{isOpen:false,skip(){}},selection:menu,story:{isOpen:false},dialog:{open:false},running:false,remapping:null,previousPad:[],previousStart:false,padNeedsRelease:false,modalDirection:'',modalRepeatAt:0,started:false,presentation:{phase:'fight'},navigator:{getGamepads:()=>[currentPad]},$:id=>ids.get(id),A:core.A,padKeys:{light:0,medium:2},bind(){throw Error('unexpected remap');},start(){context.running=true;context.padNeedsRelease=true;},pause(){context.running=false;},returnToSelection(){context.running=false;menu.show();}});vm.runInContext(compile(poll.getText(source)),context);
check('actual main pollPad blocks menu-confirm and held controls until a neutral release',()=>{
 menu.show();menu.pollPad(pad());currentPad=pad([9]);assert.equal(context.pollPad(),0);currentPad=pad();assert.equal(context.pollPad(),0);currentPad=pad([0]);assert.equal(context.pollPad(),0);assert.equal(menu.isOpen,false);assert.equal(context.running,true);assert.equal(context.pollPad(),0,'held confirm must not become light');currentPad=pad([],[-1,0]);assert.equal(context.pollPad(),0,'held stick also requires neutral');currentPad=pad();assert.equal(context.pollPad(),0,'neutral frame is consumed');currentPad=pad([0]);assert.equal(context.pollPad()&core.A.light,core.A.light,'fresh press reaches combat after release');
});
check('actual main overlay pad navigation can return to selection without leaking attacks',()=>{context.running=false;context.previousPad=[];$('start').focus();currentPad=pad([13]);assert.equal(context.pollPad(),0);assert.equal(document.activeElement,$('overlay-select'));$('overlay-select').onclick=context.returnToSelection;currentPad=pad();context.pollPad();currentPad=pad([0]);assert.equal(context.pollPad(),0);assert.equal(menu.isOpen,true);assert.equal(context.running,false);});
check('actual main settings confirm toggles the testing checkbox once per controller press',()=>{const checkbox=new Element('input','testing-god-mode');checkbox.checked=false;let changes=0;checkbox.onchange=()=>changes++;context.dialog.open=true;document.querySelector=()=>context.dialog;document.activeElement=checkbox;context.previousPad=[];currentPad=pad([0]);assert.equal(context.pollPad(),0);assert.equal(checkbox.checked,true);assert.equal(changes,1);context.pollPad();assert.equal(changes,1);context.dialog.open=false;document.querySelector=()=>null;});
check('saved recruits refresh before preview/start and the actual hook receives that fighter',()=>{
 menu.show();$('choose-player').click();const recruit=portraits.find(p=>p.dataset.fighter==='guest07');
 recruit.click();assert.equal($('start-fight').disabled,true);const before=launches;$('start-fight').onclick();assert.equal(launches,before);
 pendingUnlocks.add('guest07');recruit.click();assert.equal(menu.getSetup().fighter,'guest07');assert.equal($('start-fight').disabled,false);
 $('start-fight').click();assert.equal(launches,before+1);assert.equal(lastSetup.fighter,'guest07');
 menu.show();$('choose-player').click();portraits.find(p=>p.dataset.fighter==='rivet').click();assert.equal($('start-fight').disabled,true);assert.equal(unlocked.has('rivet'),false);menu.setSetup({fighter:'highsproto'});
});
console.log(`${count} selection/controller integration checks passed. Stub DOM/gamepad only; no browser or physical-controller claim.`);
