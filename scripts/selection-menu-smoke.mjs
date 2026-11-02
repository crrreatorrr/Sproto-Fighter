// Executes the actual selection controller and main pollPad against a small DOM.
// No browser, canvas aesthetics or physical-controller claim.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const asModule=s=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const core=await import(asModule(read('src/core.ts')));
const ids=new Map();let document,now=1000;
class Element{
 constructor(tag='div',id=''){this.tagName=tag.toUpperCase();this.id=id;this.children=[];this.dataset={};this.attributes={};this.events={};this.hidden=false;this.disabled=false;this.offsetParent={};this.classList={toggle(){}};this.clientWidth=1280;this.clientHeight=420;}
 set innerHTML(s){this.html=s;this.children=[];for(const m of s.matchAll(/<([\w-]+)[^>]*\bid="([^"]+)"/g)){const e=m[1]==='select'?new Select():new Element(m[1]);e.id=m[2];ids.set(e.id,e);}if(s.includes('class="selection-grid"'))this.grid=new Element();if(s.includes('class="stage-rail"'))this.rail=new Element();if(s.includes('<canvas'))this.canvas=new Element('canvas');}
 get innerHTML(){return this.html??'';}setAttribute(k,v){this.attributes[k]=String(v);}getAttribute(k){return this.attributes[k]??null;}
 append(e){this.children.push(e);}focus(){document.activeElement=this;this.onfocus?.();}click(){if(!this.disabled)this.onclick?.();}
 addEventListener(k,f){this.events[k]=f;}dispatchEvent(e){this.events[e.type]?.(e);if(e.type==='change')this.onchange?.();return true;}
 querySelector(s){if(s==='.selection-grid')return this.grid;if(s==='.stage-rail')return this.rail;if(s==='canvas')return this.canvas;return null;}
 querySelectorAll(s){return s==='button'?this.children.filter(c=>c.tagName==='BUTTON'):[];}
 getBoundingClientRect(){const i=root.grid?.children.indexOf(this)??-1;return {top:Math.floor(i/11)*100};}
 getContext(){return {fillRect(){},save(){},restore(){},translate(){},scale(){},beginPath(){},ellipse(){},fill(){}};}
 matches(s){return s==='button'&&this.tagName==='BUTTON';}
}
class Select extends Element{constructor(){super('select');this.options=[{value:'cpu'},{value:'dummy'},{value:'guard'}];this.selectedIndex=0;}get value(){return this.options[this.selectedIndex].value;}set value(v){this.selectedIndex=this.options.findIndex(o=>o.value===v);}}
const root=new Element('section','selection-view');ids.set(root.id,root);
for(const id of ['device','start','overlay-select','story-worlds'])ids.set(id,new Element('button',id));
document={activeElement:root,getElementById:id=>ids.get(id),querySelector:()=>null,querySelectorAll:()=>[],createElement:tag=>new Element(tag)};
const stages=['trenches','circuit','retro','yacht','throne','castle','bar','verse','ranch'].map((id,i)=>({id,name:id,chapter:i<4?i+1:null}));
const modules={'./core':core,'./originalPortraits':{originalPortraits:Object.fromEntries(core.PLAYABLE_FIGHTERS.map(id=>[id,'/'+id+'.png']))},'./poseAtlas':{drawSelectionPose:()=>true},'./stage':{STAGES:stages,drawStagePreview(){}}};
const context={exports:{},require:id=>modules[id],document,HTMLElement:Element,HTMLButtonElement:Element,HTMLSelectElement:Select,Event:class{constructor(type){this.type=type;}},window:{addEventListener(){}},performance:{now:()=>now},console,Math};vm.createContext(context);vm.runInContext(compile(read('src/selectionMenu.ts')),context);
let launches=0,lastSetup;const menu=context.exports.createSelectionMenu({start(setup){launches++;lastSetup=setup;menu.hide();context.running=true;context.padNeedsRelease=true;}});menu.setReady(true);
assert.ok(root.innerHTML.indexOf('class="selection-locations"')<root.innerHTML.indexOf('class="match-preview"'));assert.ok(root.innerHTML.indexOf('id="start-fight"')<root.innerHTML.indexOf('class="selection-roster"'));
const $=id=>ids.get(id),portraits=root.grid.children,stageButtons=root.rail.children;
const key=direction=>{let prevented=false;root.events.keydown({key:'Arrow'+direction,preventDefault(){prevented=true;}});assert.equal(prevented,true);};
const pad=(pressed=[],axes=[0,0])=>({connected:true,axes,buttons:Array.from({length:16},(_,i)=>({pressed:pressed.includes(i)}))});
function menuPress(buttons){now+=1000;menu.pollPad(pad());menu.pollPad(pad(buttons));}
let count=0;const check=(name,fn)=>{fn();count++;console.log('PASS:',name);};
check('keyboard grid exits reach side controls and stage rail, with reverse routes',()=>{portraits[0].focus();key('Up');assert.equal(document.activeElement,$('choose-player'));key('Down');assert.equal(document.activeElement,portraits[0]);portraits.at(-1).focus();key('Down');assert.equal(document.activeElement,stageButtons.at(-1));key('Up');assert.equal(document.activeElement,$('random-stage'));});
check('Random Stage is reachable at both rail ends; up/down and horizontal return routes work',()=>{stageButtons[0].focus();key('Left');assert.equal(document.activeElement,$('random-stage'));key('Down');assert.equal(document.activeElement,stageButtons.at(-1));key('Right');assert.equal(document.activeElement,$('random-stage'));key('Up');assert.equal(document.activeElement,$('story-worlds'));$('random-stage').focus();key('Right');assert.equal(document.activeElement,stageButtons[0]);$('random-stage').focus();key('Left');assert.equal(document.activeElement,stageButtons.at(-1));});
check('stage down reaches mode then CTA; mode changes only the future setup',()=>{stageButtons[0].focus();key('Down');assert.equal(document.activeElement,$('mode'));key('Right');assert.equal(menu.getSetup().mode,'dummy');key('Down');assert.equal(document.activeElement,$('start-fight'));key('Up');assert.equal(document.activeElement,$('mode'));key('Up');assert.equal(document.activeElement,stageButtons.at(-1));assert.equal(launches,0);});
check('gamepad D-pad uses the same grid exits and Random Stage route',()=>{portraits.at(-1).focus();menuPress([13]);assert.equal(document.activeElement,stageButtons.at(-1));menuPress([15]);assert.equal(document.activeElement,$('random-stage'));menuPress([12]);assert.equal(document.activeElement,$('story-worlds'));});
check('upper launch controls lead down to side tabs and roster, and back up',()=>{$('start-fight').focus();key('Down');assert.equal(document.activeElement,$('choose-player'));key('Down');assert.equal(document.activeElement,portraits[0]);key('Up');assert.equal(document.activeElement,$('choose-player'));key('Up');assert.equal(document.activeElement,$('start-fight'));});
check('gamepad Start focuses CTA; A launches once and held A does not repeat',()=>{menuPress([9]);assert.equal(document.activeElement,$('start-fight'));assert.equal(launches,0);menuPress([0]);assert.equal(launches,1);menu.pollPad(pad([0]));assert.equal(launches,1);assert.equal(lastSetup.fighter,'rivet');assert.equal(lastSetup.opponent,'vela');assert.equal(lastSetup.mode,'dummy');});
// Compile main's actual pollPad implementation rather than copying its release gate.
const source=ts.createSourceFile('main.ts',read('src/main.ts'),ts.ScriptTarget.Latest,true);const poll=source.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='pollPad');assert.ok(poll);
let currentPad=pad();Object.assign(context,{selection:menu,story:{isOpen:false},dialog:{open:false},running:false,remapping:null,previousPad:[],previousStart:false,padNeedsRelease:false,modalDirection:'',modalRepeatAt:0,started:false,presentation:{phase:'fight'},navigator:{getGamepads:()=>[currentPad]},$:id=>ids.get(id),A:core.A,padKeys:{light:0,medium:2},bind(){throw Error('unexpected remap');},start(){context.running=true;context.padNeedsRelease=true;},pause(){context.running=false;},returnToSelection(){context.running=false;menu.show();}});vm.runInContext(compile(poll.getText(source)),context);
check('actual main pollPad blocks menu-confirm and held controls until a neutral release',()=>{
 menu.show();menu.pollPad(pad());currentPad=pad([9]);assert.equal(context.pollPad(),0);currentPad=pad();assert.equal(context.pollPad(),0);currentPad=pad([0]);assert.equal(context.pollPad(),0);assert.equal(menu.isOpen,false);assert.equal(context.running,true);assert.equal(context.pollPad(),0,'held confirm must not become light');currentPad=pad([],[-1,0]);assert.equal(context.pollPad(),0,'held stick also requires neutral');currentPad=pad();assert.equal(context.pollPad(),0,'neutral frame is consumed');currentPad=pad([0]);assert.equal(context.pollPad()&core.A.light,core.A.light,'fresh press reaches combat after release');
});
check('actual main overlay pad navigation can return to selection without leaking attacks',()=>{context.running=false;context.previousPad=[];$('start').focus();currentPad=pad([13]);assert.equal(context.pollPad(),0);assert.equal(document.activeElement,$('overlay-select'));$('overlay-select').onclick=context.returnToSelection;currentPad=pad();context.pollPad();currentPad=pad([0]);assert.equal(context.pollPad(),0);assert.equal(menu.isOpen,true);assert.equal(context.running,false);});
console.log(`${count} selection/controller integration checks passed. Stub DOM/gamepad only; no browser or physical-controller claim.`);
