// Real versus component and main boundaries with a minimal DOM; browser layout
// and motion are verified separately. No save, controller hardware or art claim.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const read=name=>readFileSync(new URL('../src/'+name,import.meta.url),'utf8');
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const cu=url(bundledCore()),core=await import(cu),events=await import(url(compile(read('animationEvents.ts'))));
const pu=url(compile(read('portraits.ts')));
const {portraitLarge}=await import(pu);
const {versusPads}=await import(url(compile(read('localInput.ts')).replace("from './core'",`from '${cu}'`)));
const {createVersusScreen}=await import(url(compile(read('versusScreen.ts')).replace("from './core'",`from '${cu}'`).replace("from './portraits'",`from '${pu}'`)));
const VERSUS_FRAMES=600; // Simulate ten seconds: confirmation must never time out.
const {createFightCountdown,COUNTDOWN_FRAMES,FIGHT_CUE_FRAMES}=await import(url(compile(read('fightCountdown.ts'))));
class Element{
 constructor(tag){this.tagName=tag;this.children=[];this.attributes={};this.hidden=false;this.classes=new Set();this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),toggle:(x,on)=>on?this.classes.add(x):this.classes.delete(x)};}
 append(...els){this.children.push(...els);}setAttribute(k,v){this.attributes[k]=v;}focus(){}
}
globalThis.document={createElement:tag=>new Element(tag)};
let checks=0;const check=(name,fn)=>{fn();checks++;console.log('PASS:',name);};
// Explicit ambient main state for hooks extracted into their own VM context.
const optionalMainState=()=>({training:null,depthRoundStarts:[],matchDepthOptions:null,cpuSkill:4});
function ui(done=()=>{}){const host=new Element('div'),screen=createVersusScreen(host,done),root=host.children[0],lineup=root.children[1];return {screen,root,cards:[lineup.children[0],lineup.children[2]],button:root.children[2]};}
check('all installed portraits exist and all ordered matchups preserve exact selector names, original images and pair identity',()=>{
 const t=ui();for(const id of core.PLAYABLE_FIGHTERS)assert.ok(existsSync(new URL('../public'+portraitLarge(id),import.meta.url)),id+' versus portrait exists');
 for(const a of core.PLAYABLE_FIGHTERS)for(const b of core.PLAYABLE_FIGHTERS){
  t.screen.show(a,b);assert.ok(t.screen.isOpen);
  [a,b].forEach((id,index)=>{const card=t.cards[index];assert.equal(card.attributes['data-fighter'],id);assert.equal(card.children[1].src,portraitLarge(id));assert.equal(card.children[2].children[0].textContent,core.ROSTER[id].name);assert.equal(card.classes.has('is-paired'),core.isPairedFighter(id));});
 }
});
check('preview waits indefinitely; explicit confirmation is idempotent across matchups and missing images',()=>{
 let finishes=0;const t=ui(()=>finishes++);t.screen.show('guest08','guest09');
 for(let n=0;n<VERSUS_FRAMES-1;n++)assert.ok(t.screen.advance());assert.equal(finishes,0);
 assert.ok(t.screen.advance());assert.equal(finishes,0);assert.ok(t.screen.isOpen);t.screen.skip();assert.equal(finishes,1);assert.equal(t.screen.advance(),false);
 t.screen.show('solanadelray','realityarchitect');t.cards[0].children[1].onerror();assert.ok(t.cards[0].classes.has('portrait-unavailable'));assert.ok(t.screen.isOpen);
 t.button.onclick();assert.equal(finishes,2);t.screen.skip();assert.equal(finishes,2);
 t.screen.show('guest08','guest09');assert.equal(t.cards[0].children[1].hidden,false);t.screen.hide();assert.equal(finishes,2);
});
check('pause suspends previews and countdowns without losing their phase or hiding pause controls',()=>{
 let finishes=0;const t=ui(()=>finishes++);t.screen.show('guest08','guest09');t.screen.suspend(true);
 for(let n=0;n<VERSUS_FRAMES+10;n++)assert.equal(t.screen.advance(),true);
 t.screen.skip();assert.equal(finishes,0);assert.equal(t.root.attributes['aria-hidden'],'true');
 t.screen.suspend(false);assert.equal(t.root.attributes['aria-hidden'],'false');t.screen.skip();assert.equal(finishes,1);
 const host=new Element('div'),timer=createFightCountdown(host);timer.show();for(let n=0;n<60;n++)timer.advance();
 timer.suspend(true);for(let n=0;n<COUNTDOWN_FRAMES;n++)assert.equal(timer.advance(),true);
 assert.equal(host.children[0].children[0].textContent,'2');timer.suspend(false);for(let n=0;n<60;n++)timer.advance();assert.equal(host.children[0].children[0].textContent,'1');
});
const main=ts.createSourceFile('main.ts',read('main.ts'),ts.ScriptTarget.Latest,true);
const fn=name=>main.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name).getText(main);
check('actual keyboard accepts a fresh Enter only, rejecting Space, combat keys and repeat',()=>{
 let handler;const {screen}=ui();const c={...optionalMainState(),storyBoss:null,storyBossArt:null,bossStarts:[],godModeChanges:[],storyAnimation:{active:null,reset(){},clear(){},start(){return false;},replaceDefeat:false},online:null,window:{addEventListener(type,fn){handler=fn;}},story:{isOpen:false},dialog:{open:false},selection:{isOpen:false},running:true,blockedKeys:new Set(),versus:screen};
 vm.createContext(c);const registration=main.statements.find(n=>ts.isExpressionStatement(n)&&n.getText(main).startsWith("window.addEventListener('keydown'"));vm.runInContext(compile(registration.getText(main)),c);
 screen.show('guest08','guest09');for(const [code,repeat] of [['Space',false],['KeyA',false],['Enter',true]]){let prevented=false;handler({code,repeat,preventDefault(){prevented=true;}});assert.ok(prevented);assert.ok(screen.isOpen);}
 handler({code:'Enter',repeat:false,preventDefault(){}});assert.equal(screen.isOpen,false);assert.ok(c.blockedKeys.has('Enter'));
});
function combatFixture(){
 const c={...optionalMainState(),storyBoss:null,storyBossArt:null,bossStarts:[],godModeChanges:[],storyAnimation:{active:null,advanceBossReveal(){},reset(){},clear(){},start(){return false;},replaceDefeat:false},online:null,matchCpuSkill:4,matchDifficultyAssist:false,...core,...events,countdown:{advance:()=>false},state:core.createState('highsproto','dummy','vela'),mode:'dummy',presentation:events.createRoundPresentation(),frames:[],held:new Set(),queued:0,padNeedsRelease:false,qaPanel:null,qaRecord(){},playRetainCallout(){},qaStopAtOutro(){},story:{finishMatch(){},onRoundEnd:()=>false},showOverlay(){}};
 const t=ui(()=>{c.held.clear();c.queued=0;c.padNeedsRelease=true;});c.versus=t.screen;vm.createContext(c);vm.runInContext(compile(fn('advanceRoundFrame')),c);return {c,...t};
}
check('actual main freezes combat, CPU, replay and entrance clock during versus, then retains the full entrance',()=>{
 const {c,screen}=combatFixture();screen.show('highsproto','vela');const before=JSON.stringify(c.state);
 for(let n=0;n<VERSUS_FRAMES;n++)c.advanceRoundFrame(core.A.light|core.A.right);
 assert.equal(JSON.stringify(c.state),before);assert.equal(c.frames.length,0);assert.equal(c.presentation.frame,0);assert.equal(c.padNeedsRelease,false);assert.ok(screen.isOpen);screen.skip();assert.equal(c.padNeedsRelease,true);
 c.advanceRoundFrame(0);assert.equal(c.presentation.frame,1);assert.equal(c.state.frame,0);
 c.advanceRoundFrame(core.A.light);assert.equal(c.state.fighters[0].move.id,'light');assert.equal(c.frames.length,1);
});
check('actual main shows 3/2/1 for one second each, plays entrances without damage, and starts combat on FIGHT',()=>{
 const {c}=combatFixture(),host=new Element('div');c.countdown=createFightCountdown(host);c.countdown.show();
 const word=host.children[0].children[0];assert.equal(word.textContent,'3');
 const state=JSON.stringify(c.state);
 for(let n=1;n<COUNTDOWN_FRAMES;n++){
  c.advanceRoundFrame(core.A.light);assert.equal(c.frames.length,0);assert.equal(JSON.stringify(c.state),state);
  assert.equal(word.textContent,String(3-Math.floor(n/60)));
 }
 assert.equal(c.presentation.phase,'fight','entrance clock completes during countdown');
 c.advanceRoundFrame(core.A.light);assert.equal(word.textContent,'FIGHT!');assert.equal(c.frames.length,1);assert.equal(c.state.fighters[0].move.id,'light');
 for(let n=0;n<FIGHT_CUE_FRAMES;n++)c.advanceRoundFrame(0);assert.equal(c.countdown.isOpen,false);
 c.countdown.show();assert.equal(word.textContent,'3');c.countdown.hide();assert.equal(c.countdown.isOpen,false);
});
check('actual gamepad preview consumes only fresh A, requires neutral after skipping, and never leaks an attack',()=>{
 let current={connected:true,axes:[0,0],buttons:Array.from({length:16},()=>({pressed:false}))};
 const c={...optionalMainState(),storyBoss:null,storyBossArt:null,bossStarts:[],godModeChanges:[],storyAnimation:{active:null,reset(){},clear(){},start(){return false;},replaceDefeat:false},online:null,document:{querySelector:()=>null},...core,versusPads,previousPad2:[],selection:{isOpen:false,pollPad(){}},story:{isOpen:false},dialog:{open:false},running:true,remapping:null,previousPad:[],previousStart:false,padNeedsRelease:false,modalDirection:'',modalRepeatAt:0,started:true,presentation:{phase:'intro'},navigator:{getGamepads:()=>[current]},$:()=>({}),padKeys:{light:0},performance:{now:()=>0},start(){throw Error('preview Start leaked');},pause(){throw Error('preview Start paused');}};
 const {screen}=ui(()=>{c.padNeedsRelease=true;});c.versus=screen;vm.createContext(c);vm.runInContext(compile(fn('pollPad')),c);
 screen.show('guest08','guest09');current.buttons[9].pressed=true;assert.equal(c.pollPad(),0);assert.ok(screen.isOpen,'Start must not confirm');current.buttons[9].pressed=false;c.pollPad();
 screen.show('guest08','guest09');c.padNeedsRelease=true;current.buttons[0].pressed=true;assert.equal(c.pollPad(),0);assert.ok(screen.isOpen,'held A cannot skip a new preview');current.buttons[0].pressed=false;c.pollPad();
 for(const button of [0]){
  screen.show('guest08','guest09');c.padNeedsRelease=false;c.previousPad=[];current.buttons[button].pressed=true;
  assert.equal(c.pollPad(),0);assert.equal(screen.isOpen,false);assert.equal(c.pollPad(),0);
  current.buttons[button].pressed=false;assert.equal(c.pollPad(),0);assert.equal(c.padNeedsRelease,false);
 }
 current.buttons[0].pressed=true;assert.equal(c.pollPad(),core.A.light);
});
check('actual restart refreshes both fighter identities and return to selection removes the preview',()=>{
 const {screen,cards}=ui(),elements=new Map();
 const c={...optionalMainState(),storyBoss:null,storyBossArt:null,bossStarts:[],godModeChanges:[],storyAnimation:{active:null,reset(){},clear(){},start(){return false;},replaceDefeat:false},online:null,matchCpuSkill:4,matchDifficultyAssist:false,...core,...events,countdown:{hide(){}},versus:screen,chosen:'guest08',opponent:'guest09',mode:'dummy',testingGodMode:false,matchEarnedGodMode:false,matchTesting:false,matchGodMode:false,state:core.createState(),presentation:events.createRoundPresentation(),frames:[],qaEvents:[],accumulator:0,held:new Set(),queued:0,started:false,running:false,qaSingleStep:false,resumeAfterSettings:false,resumeAfterJourney:false,story:{leaveStory(){}},selection:{show(){}},updateGodModeLabel(){},start(){},$:id=>{if(!elements.has(id))elements.set(id,{});return elements.get(id);}};
 vm.createContext(c);vm.runInContext(compile(fn('restart')+'\n'+fn('returnToSelection')),c);c.restart();
 assert.equal(cards[0].children[2].children[0].textContent,'Yoyo');assert.equal(cards[1].children[2].children[0].textContent,'Red Kev');assert.ok(screen.isOpen);
 c.opponent='vaudream';c.restart();assert.equal(cards[1].children[1].src,portraitLarge('vaudream'));
 c.returnToSelection();assert.equal(screen.isOpen,false);
});
console.log(`${checks} versus groups passed; ${core.PLAYABLE_FIGHTERS.length**2} ordered matchup mappings, actual main clock/restart/pad boundaries. No physical controller claim.`);
