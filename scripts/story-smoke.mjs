// Portable controller and main-hook regression checks. No browser/native Canvas dependency.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const compile=source=>ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const asModule=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const stageURL=asModule(compile(read('src/stage.ts')));
const {STAGES,STORY_STAGE_IDS}=await import(stageURL);
const {createRoundPresentation,beginRoundOutro}=await import(asModule(compile(read('src/animationEvents.ts'))));
const {createStoryMode}=await import(asModule(compile(read('src/storyMode.ts')).replace("'./stage'",JSON.stringify(stageURL))));
class Element{
 children=[];open=false;disabled=false;dataset={};textContent='';value='';events={};style={setProperty(){}};
 set innerHTML(value){this.html=value;this.children=[];}get innerHTML(){return this.html??'';}
 replaceChildren(...nodes){this.html='';this.children=nodes;}append(node){this.children.push(node);}
 showModal(){assert.equal(this.open,false,'dialog must not be opened twice');this.open=true;}close(){this.open=false;}
 addEventListener(event,fn){this.events[event]=fn;}
}
function dom(){
 const elements=new Map([...(read('index.html')+read('src/selectionMenu.ts')).matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],new Element()]));
 const $=id=>{assert.ok(elements.has(id),`page/template missing #${id}`);return elements.get(id);};
 globalThis.document={getElementById:$,createElement:tag=>{assert.notEqual(tag,'canvas','story controller must not need a Canvas');return new Element();}};
 return {$,pick:i=>$('journey-content').children[0].children[i].onclick(),action:i=>$('journey-actions').children[i].onclick(),escape:()=>{let prevented=false;$('journey-dialog').events.cancel({preventDefault(){prevented=true;}});assert.ok(prevented);}};
}
function fresh(){const d=dom(),events=[];let ready=true;const story=createStoryMode({pause:()=>events.push('pause'),resume:()=>events.push('resume'),launch:(id,story)=>events.push({id,story}),ready:()=>ready});return {...d,story,events,setReady:r=>ready=r,launches:()=>events.filter(e=>typeof e==='object')};}
let count=0;async function check(name,fn){await fn();count++;console.log('PASS:',name);}
const worlds=[...STORY_STAGE_IDS];
const ranchIndex=STAGES.findIndex(s=>s.id==='ranch');
await check('seven story chapters follow the portal route and ten arenas have stable distinct IDs',async()=>{assert.deepEqual(worlds,['trenches','circuit','yacht','throne','bar','verse','hatchery']);assert.deepEqual(worlds.map(id=>STAGES.find(s=>s.id===id).chapter),[1,2,3,4,5,6,7]);assert.deepEqual(STAGES.map(s=>s.id),['trenches','circuit','retro','yacht','throne','castle','bar','verse','hatchery','ranch']);assert.equal(new Set(STAGES.map(s=>s.id)).size,10);});
await check('each story world can be selected directly, showing a placeholder before launch',async()=>{for(let i=0;i<worlds.length;i++){const t=fresh();t.$('story-worlds').onclick();assert.equal(t.$('journey-content').children[0].children.length,worlds.length);await t.pick(i);assert.match(t.$('journey-kicker').textContent,/PLACEHOLDER/);assert.equal(t.launches().length,0);await t.action(0);assert.deepEqual(t.launches(),[{id:worlds[i],story:true}]);assert.equal(t.story.snapshot().active,worlds[i]);assert.equal(t.story.isOpen,false);}});
await check('wins advance through all seven chapter arenas to ending without autostart',async()=>{const t=fresh();t.$('story-worlds').onclick();await t.pick(0);await t.action(0);for(let i=0;i<worlds.length-1;i++){assert.equal(t.story.onRoundEnd(0),true);assert.equal(t.launches().length,i+1);assert.match(t.$('journey-title').textContent,/Next stop/);assert.match(t.$('journey-kicker').textContent,/PLACEHOLDER/);await t.action(0);assert.equal(t.launches().at(-1).id,worlds[i+1]);}t.story.onRoundEnd(0);assert.match(t.$('journey-title').textContent,/Final world/);assert.deepEqual(t.story.snapshot().cleared,worlds);assert.match(t.$('journey-content').innerHTML,/PLACEHOLDER/);assert.equal(t.launches().length,worlds.length);});
await check('defeat and draw retry the same world without clearing it, for every world',async()=>{for(let i=0;i<worlds.length;i++)for(const winner of [1,2]){const t=fresh();t.$('story-worlds').onclick();await t.pick(i);await t.action(0);t.story.onRoundEnd(winner);assert.match(t.$('journey-title').textContent,winner===2?/Draw/:/Retry/);assert.deepEqual(t.story.snapshot().cleared,[]);await t.action(0);assert.equal(t.launches().at(-1).id,worlds[i]);}});
await check('starting at final world does not mark earlier worlds cleared',async()=>{const t=fresh();t.$('story-worlds').onclick();await t.pick(worlds.length-1);await t.action(0);t.story.onRoundEnd(0);assert.deepEqual(t.story.snapshot().cleared,[worlds.at(-1)]);});
await check('cleared world badges survive revisiting and repeated victories are idempotent',async()=>{const t=fresh();t.$('story-worlds').onclick();await t.pick(0);await t.action(0);t.story.onRoundEnd(0);t.story.onRoundEnd(0);assert.deepEqual(t.story.snapshot().cleared,[worlds[0]]);t.$('journey-back').onclick();assert.match(t.$('journey-content').children[0].children[0].innerHTML,/CLEARED/);});
await check('restart from ending or world selector clears progress and returns to World 1 scene',async()=>{for(const fromEnding of [true,false]){const t=fresh();t.$('story-worlds').onclick();await t.pick(worlds.length-1);await t.action(0);t.story.onRoundEnd(0);if(!fromEnding)t.$('journey-back').onclick();await t.action(0);assert.deepEqual(t.story.snapshot().cleared,[]);assert.match(t.$('journey-title').textContent,/World 1/);await t.action(0);assert.equal(t.launches().at(-1).id,worlds[0]);}});
await check('all ten free-play choices launch without scenes or story result interception',async()=>{for(let i=0;i<STAGES.length;i++){const t=fresh();t.$('free-levels').onclick();assert.equal(t.$('journey-content').children[0].children.length,STAGES.length);await t.pick(i);assert.deepEqual(t.launches(),[{id:STAGES[i].id,story:false}]);assert.equal(t.story.snapshot().active,null);assert.equal(t.story.onRoundEnd(0),false);assert.equal(t.story.isOpen,false);}});
await check('story to free-play leaves progression inactive while retaining earned session badges',async()=>{const t=fresh();t.$('story-worlds').onclick();await t.pick(0);await t.action(0);t.story.onRoundEnd(0);t.$('free-levels').onclick();await t.pick(ranchIndex);assert.equal(t.story.snapshot().active,null);assert.deepEqual(t.story.snapshot().cleared,[worlds[0]]);assert.equal(t.story.onRoundEnd(1),false);});
await check('Back and Escape return scene/result to worlds then close to arena',async()=>{for(const useEscape of [false,true])for(const result of [false,true]){const t=fresh();t.$('story-worlds').onclick();await t.pick(2);if(result){await t.action(0);t.story.onRoundEnd(1);}const back=()=>useEscape?t.escape():t.$('journey-back').onclick();back();assert.equal(t.story.snapshot().view,'worlds');assert.equal(t.story.isOpen,true);back();assert.equal(t.story.isOpen,false);assert.equal(t.events.at(-1),'resume');}});
await check('selector cross-links and Back-to-arena buttons work without launching a match',async()=>{const t=fresh();t.$('story-worlds').onclick();await t.action(1);assert.equal(t.story.snapshot().view,'levels');await t.action(0);assert.equal(t.story.snapshot().view,'worlds');await t.action(2);assert.equal(t.story.isOpen,false);assert.equal(t.launches().length,0);t.$('free-levels').onclick();await t.action(1);assert.equal(t.story.isOpen,false);});
await check('navigation pauses only once per modal visit, preserving pre-navigation running state',async()=>{const t=fresh();t.$('story-worlds').onclick();await t.pick(1);t.$('journey-back').onclick();await t.action(1);await t.action(0);assert.equal(t.events.filter(e=>e==='pause').length,1);t.$('journey-back').onclick();t.$('story-worlds').onclick();assert.equal(t.events.filter(e=>e==='pause').length,2);});
await check('readiness gate blocks every story and free-play launch and allows later retry',async()=>{for(const story of [true,false])for(let i=0;i<(story?worlds.length:STAGES.length);i++){const t=fresh();t.setReady(false);t.$(story?'story-worlds':'free-levels').onclick();await t.pick(i);if(story)await t.action(0);assert.equal(t.launches().length,0);assert.equal(t.story.isOpen,true);assert.match(t.$('journey-copy').textContent,/loading/);t.setReady(true);if(story)await t.action(0);else await t.pick(i);assert.equal(t.launches().length,1);assert.equal(t.story.isOpen,false);}});
await check('explicit leaveStory stops story results; snapshots do not expose mutable progress',async()=>{const t=fresh();t.$('story-worlds').onclick();await t.pick(0);await t.action(0);t.story.onRoundEnd(0);t.story.snapshot().cleared.push('castle');assert.deepEqual(t.story.snapshot().cleared,[worlds[0]]);t.story.leaveStory();assert.equal(t.story.onRoundEnd(0),false);assert.match(t.$('journey-status').textContent,/FREE PLAY/);});
// Exercise the actual small main.ts integration block with isolated game callbacks.
function integration(wasRunning,initialMode='guard',menuOpen=false){
 const d=dom(),main=read('src/main.ts');const start=main.indexOf('let resumeAfterJourney ='),end=main.indexOf("$('start').onclick = start;",start);assert.ok(start>=0&&end>start);
 const parsed=ts.createSourceFile('main.ts',main,ts.ScriptTarget.Latest,true);
 const launches=parsed.statements.filter(n=>ts.isFunctionDeclaration(n)&&['launchSelection','updateStage','returnToSelection'].includes(n.name?.text)).map(n=>n.getText(parsed)).join('\n');
 const code=compile(launches+'\n'+main.slice(start,end));
 const fixture=new Function('createStoryMode','STAGES','$','initialMode','wasRunning','createRoundPresentation','beginRoundOutro','menuOpen',`
 let mode=initialMode,running=wasRunning,started=!menuOpen,state={winner:null},starts=0,restarts=0,chosen='rivet',opponent='vela',selectedStage='ranch';
 let resumeAfterSettings=false,queued=0,accumulator=0,qaSingleStep=false;const held=new Set();
 const ensurePoseAtlases=async()=>{}; // Asset I/O stub; navigation awaits it.
 let setup={fighter:'rivet',opponent:'vela',stage:'ranch',mode:initialMode};
 const selection={isOpen:menuOpen,getSetup:()=>({...setup}),setSetup(next){setup={...setup,...next};$('mode').value=setup.mode;},hide(){this.isOpen=false;},show(){this.isOpen=true;}};
 let presentation=createRoundPresentation();presentation.phase='fight';
 const setStage=id=>{selectedStage=id;};const showOverlay=()=>{running=false;};
 const start=()=>{if(selection.isOpen)return;starts++;running=true;started=true;};
 const restart=()=>{restarts++;state={winner:null};presentation=createRoundPresentation();};
 ${code};return {story,inspect:()=>({mode,running,starts,restarts,winner:state.winner,presentation:{...presentation},selectedStage,chosen,opponent,menuOpen:selection.isOpen,setup:{...setup}}),returnToSelection,launchSelection,
 finish:()=>{state.winner=0;presentation.phase='result';},
 outro:()=>{state.winner=0;beginRoundOutro(presentation,0,false);presentation.frame=30;},
 intro:()=>{presentation=createRoundPresentation();presentation.frame=17;}};
 `)(createStoryMode,STAGES,d.$,initialMode,wasRunning,createRoundPresentation,beginRoundOutro,menuOpen);
 return {...d,...fixture};
}
await check('actual main hooks preserve paused/running status after nested destination browsing',async()=>{for(const running of [false,true]){const t=integration(running);t.$('story-worlds').onclick();await t.pick(0);t.$('journey-back').onclick();t.$('journey-back').onclick();assert.equal(t.inspect().running,running);assert.equal(t.inspect().starts,running?1:0);}});
await check('actual main hooks never resume a completed round from menu Back',async()=>{const t=integration(true);t.finish();t.$('story-worlds').onclick();t.$('journey-back').onclick();assert.equal(t.inspect().starts,0);});
await check('actual main hooks resume an unfinished outro without restarting presentation',async()=>{for(const running of [false,true]){
 const t=integration(running);t.outro();const before=t.inspect().presentation;
 t.$('story-worlds').onclick();t.pick(0);t.$('journey-back').onclick();t.$('journey-back').onclick();
 assert.equal(t.inspect().running,running);assert.equal(t.inspect().starts,running?1:0);assert.equal(t.inspect().restarts,0);
 assert.equal(t.inspect().winner,0);assert.deepEqual(t.inspect().presentation,before);assert.equal(t.inspect().presentation.phase,'outro');
}});
await check('actual main hooks preserve intro progress while browsing and reset it on a new stage',async()=>{
 const t=integration(true);t.intro();t.$('story-worlds').onclick();t.$('journey-back').onclick();
 assert.equal(t.inspect().presentation.phase,'intro');assert.equal(t.inspect().presentation.frame,17);
 t.$('free-levels').onclick();await t.pick(ranchIndex);assert.equal(t.inspect().presentation.phase,'intro');assert.equal(t.inspect().presentation.frame,0);assert.equal(t.inspect().restarts,1);
});
await check('actual main hooks force CPU for story and restore each prior free-play behavior',async()=>{for(const mode of ['cpu','guard','dummy']){const t=integration(false,mode);t.$('story-worlds').onclick();await t.pick(0);await t.action(0);assert.equal(t.inspect().mode,'cpu');t.story.onRoundEnd(0);await t.action(0);assert.equal(t.inspect().mode,'cpu');t.$('free-levels').onclick();await t.pick(ranchIndex);assert.equal(t.inspect().mode,mode);assert.equal(t.$('mode').value,mode);assert.equal(t.inspect().restarts,3);}});
await check('selection-first story browsing and Back never start combat',async()=>{const t=integration(false,'dummy',true);t.$('story-worlds').onclick();await t.pick(0);t.$('journey-back').onclick();t.$('journey-back').onclick();assert.equal(t.inspect().menuOpen,true);assert.equal(t.inspect().running,false);assert.equal(t.inspect().starts,0);assert.equal(t.inspect().restarts,0);});
await check('explicit selection applies both fighters, behavior and stage; return stops without restarting',async()=>{const t=integration(false,'dummy',true);await t.launchSelection({fighter:'bront',opponent:'mox',stage:'castle',mode:'guard'});const x=t.inspect();assert.equal(x.chosen,'bront');assert.equal(x.opponent,'mox');assert.equal(x.selectedStage,'castle');assert.equal(x.mode,'guard');assert.equal(x.running,true);assert.equal(x.menuOpen,false);assert.equal(x.restarts,1);t.returnToSelection();assert.equal(t.inspect().running,false);assert.equal(t.inspect().menuOpen,true);assert.equal(t.inspect().restarts,1);assert.deepEqual(t.inspect().setup,{fighter:'bront',opponent:'mox',stage:'castle',mode:'guard'});});
console.log(`${count} story/navigation checks passed (controller + actual main hooks; DOM stub, no browser claim).`);
