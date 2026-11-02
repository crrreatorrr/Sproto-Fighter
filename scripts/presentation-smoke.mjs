// Exercises the actual main-loop presentation boundary with the real combat core.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const read = name => readFileSync(new URL('../src/'+name, import.meta.url), 'utf8');
const compile = source => ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const load = async name => import('data:text/javascript;base64,'+Buffer.from(compile(read(name))).toString('base64'));
const core=await load('core.ts'), events=await load('animationEvents.ts');
const main=ts.createSourceFile('main.ts',read('main.ts'),ts.ScriptTarget.Latest,true);
const names=['advanceRoundFrame','start','pause','restart'];
const functions=main.statements.filter(n=>ts.isFunctionDeclaration(n)&&names.includes(n.name?.text)).map(n=>n.getText(main)).join('\n');
assert.equal(functions.match(/function /g).length,names.length);
function fixture(storyResult=false){
 const elements=new Map();
 const c={...core,...events,countdown:{advance:()=>false,hide(){},suspend(){}},versus:{advance:()=>false,show(){},suspend(){}},state:core.createState('rivet','dummy'),presentation:events.createRoundPresentation(),chosen:'rivet',mode:'dummy',opponent:undefined,testingGodMode:false,matchTesting:false,matchGodMode:false,matchEarnedGodMode:false,updateGodModeLabel(){},frames:[],qaEvents:[],qaPanel:null,qaRecord(){},qaStopAtOutro(){},held:new Set(),queued:0,selection:{isOpen:false},dialog:{open:false},padNeedsRelease:false,running:true,started:true,accumulator:0,storyCalls:0,overlays:0,canvas:{focus(){}},$:id=>{if(!elements.has(id))elements.set(id,{disabled:false});return elements.get(id);}};
 c.story={isOpen:false,finishMatch(){},onRoundEnd(){c.storyCalls++;if(storyResult)c.running=false;return storyResult;}};
 c.showOverlay=()=>{c.overlays++;c.running=false;};
 vm.createContext(c);vm.runInContext(compile(functions),c);return c;
}
function check(name,fn){fn();console.log('PASS:',name);}
check('intro advances presentation only; input skip enters actual combat without losing the input',()=>{
 const c=fixture(),before=JSON.stringify(c.state);for(let i=0;i<20;i++)c.advanceRoundFrame(0);
 assert.equal(JSON.stringify(c.state),before);assert.equal(c.frames.length,0);assert.equal(c.presentation.frame,20);
 c.advanceRoundFrame(core.A.light);assert.equal(c.presentation.phase,'fight');assert.equal(c.state.frame,1);assert.equal(c.state.fighters[0].move.id,'light');assert.equal(c.frames[0][0],core.A.light);
 const replay=core.createState('rivet','dummy');for(const pair of c.frames)core.step(replay,pair);assert.equal(JSON.stringify(replay),JSON.stringify(c.state));
});
check('unskipped intro has a bounded duration',()=>{const c=fixture();for(let i=0;i<events.INTRO_FRAMES-1;i++)c.advanceRoundFrame(0);assert.equal(c.state.frame,0);c.advanceRoundFrame(0);assert.equal(c.presentation.phase,'fight');assert.equal(c.state.frame,1);});
check('pause/resume preserves intro and outro; restart resets presentation and replay',()=>{
 const c=fixture();c.advanceRoundFrame(0);c.pause();assert.equal(c.running,false);c.start();assert.equal(c.presentation.frame,1);
 c.presentation.phase='outro';c.presentation.frame=30;c.state.winner=0;c.pause();c.start();assert.equal(c.presentation.phase,'outro');assert.equal(c.presentation.frame,30);
 c.frames.push([0,0]);c.restart();assert.equal(c.presentation.phase,'intro');assert.equal(c.presentation.frame,0);assert.equal(c.state.winner,null);assert.equal(c.frames.length,0);
});
for(const storyResult of [false,true])check(`winner freezes combat and replay for full outro before ${storyResult?'story handoff':'result overlay'}, exactly once`,()=>{
 const c=fixture(storyResult);c.presentation.phase='fight';c.state.fighters.forEach(f=>f.hp=0);c.advanceRoundFrame(0);assert.equal(c.presentation.phase,'outro');assert.equal(c.state.winner,2);
 const state=JSON.stringify(c.state),count=c.frames.length;for(let i=0;i<events.OUTRO_FRAMES-1;i++)c.advanceRoundFrame(core.A.light|core.A.right);
 assert.equal(c.storyCalls,0);assert.equal(c.overlays,0);assert.equal(JSON.stringify(c.state),state);assert.equal(c.frames.length,count);
 c.advanceRoundFrame(0);assert.equal(c.presentation.phase,'result');assert.equal(c.storyCalls,1);assert.equal(c.overlays,storyResult?0:1);
 c.advanceRoundFrame(0);assert.equal(c.storyCalls,1);assert.equal(JSON.stringify(c.state),state);assert.equal(c.frames.length,count);
});
check('floor defeat uses the landed knockout reaction',()=>{const c=fixture();c.presentation.phase='fight';c.state.fighters[0].hp=0;c.state.fighters[0].reaction={kind:'knockdown',phase:'down',t:0,direction:1};c.advanceRoundFrame(0);assert.equal(c.presentation.fromFloor,true);});
assert.match(read('main.ts'),/render\(ctx, state, presentation, visualFrame\)/);
assert.match(read('main.ts'),/presentationSnapshot: \(\) => structuredClone\(presentation\)/);
console.log('Presentation integration checks passed. DOM rendering and sprite aesthetics require separate browser review.');
