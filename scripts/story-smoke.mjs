// Portable controller and main-hook regression checks. No browser/native Canvas dependency.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const compile=source=>ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const asModule=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const stageURL=asModule(compile(read('src/stage.ts')));
const {STAGES}=await import(stageURL);
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
 const elements=new Map([...read('index.html').matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],new Element()]));
 const $=id=>{assert.ok(elements.has(id),`index.html missing #${id}`);return elements.get(id);};
 globalThis.document={getElementById:$,createElement:tag=>{assert.notEqual(tag,'canvas','story controller must not need a Canvas');return new Element();}};
 return {$,pick:i=>$('journey-content').children[0].children[i].onclick(),action:i=>$('journey-actions').children[i].onclick(),escape:()=>{let prevented=false;$('journey-dialog').events.cancel({preventDefault(){prevented=true;}});assert.ok(prevented);}};
}
function fresh(){const d=dom(),events=[];let ready=true;const story=createStoryMode({pause:()=>events.push('pause'),resume:()=>events.push('resume'),launch:(id,story)=>events.push({id,story}),ready:()=>ready});return {...d,story,events,setReady:r=>ready=r,launches:()=>events.filter(e=>typeof e==='object')};}
let count=0;function check(name,fn){fn();count++;console.log('PASS:',name);}
const worlds=['yacht','bar','castle','retro'];
check('four story worlds and five free-play stages have distinct stable IDs',()=>{assert.deepEqual(STAGES.filter(s=>s.chapter).map(s=>s.id),worlds);assert.deepEqual(STAGES.map(s=>s.id),[...worlds,'ranch']);assert.equal(new Set(STAGES.map(s=>s.id)).size,5);});
check('each story world can be selected directly, showing a placeholder before launch',()=>{for(let i=0;i<4;i++){const t=fresh();t.$('story-worlds').onclick();assert.equal(t.$('journey-content').children[0].children.length,4);t.pick(i);assert.match(t.$('journey-kicker').textContent,/PLACEHOLDER/);assert.equal(t.launches().length,0);t.action(0);assert.deepEqual(t.launches(),[{id:worlds[i],story:true}]);assert.equal(t.story.snapshot().active,worlds[i]);assert.equal(t.story.isOpen,false);}});
check('wins advance through three transitions to ending without autostart',()=>{const t=fresh();t.$('story-worlds').onclick();t.pick(0);t.action(0);for(let i=0;i<3;i++){assert.equal(t.story.onRoundEnd(0),true);assert.equal(t.launches().length,i+1);assert.match(t.$('journey-title').textContent,/Next stop/);assert.match(t.$('journey-kicker').textContent,/PLACEHOLDER/);t.action(0);assert.equal(t.launches().at(-1).id,worlds[i+1]);}t.story.onRoundEnd(0);assert.match(t.$('journey-title').textContent,/Final world/);assert.deepEqual(t.story.snapshot().cleared,worlds);assert.match(t.$('journey-content').innerHTML,/PLACEHOLDER/);assert.equal(t.launches().length,4);});
check('defeat and draw retry the same world without clearing it, for every world',()=>{for(let i=0;i<4;i++)for(const winner of [1,2]){const t=fresh();t.$('story-worlds').onclick();t.pick(i);t.action(0);t.story.onRoundEnd(winner);assert.match(t.$('journey-title').textContent,winner===2?/Draw/:/Retry/);assert.deepEqual(t.story.snapshot().cleared,[]);t.action(0);assert.equal(t.launches().at(-1).id,worlds[i]);}});
check('starting at final world does not mark earlier worlds cleared',()=>{const t=fresh();t.$('story-worlds').onclick();t.pick(3);t.action(0);t.story.onRoundEnd(0);assert.deepEqual(t.story.snapshot().cleared,['retro']);});
check('cleared world badges survive revisiting and repeated victories are idempotent',()=>{const t=fresh();t.$('story-worlds').onclick();t.pick(0);t.action(0);t.story.onRoundEnd(0);t.story.onRoundEnd(0);assert.deepEqual(t.story.snapshot().cleared,['yacht']);t.$('journey-back').onclick();assert.match(t.$('journey-content').children[0].children[0].innerHTML,/CLEARED/);});
check('restart from ending or world selector clears progress and returns to World 1 scene',()=>{for(const fromEnding of [true,false]){const t=fresh();t.$('story-worlds').onclick();t.pick(3);t.action(0);t.story.onRoundEnd(0);if(!fromEnding)t.$('journey-back').onclick();t.action(0);assert.deepEqual(t.story.snapshot().cleared,[]);assert.match(t.$('journey-title').textContent,/World 1/);t.action(0);assert.equal(t.launches().at(-1).id,'yacht');}});
check('all five free-play choices launch without scenes or story result interception',()=>{for(let i=0;i<5;i++){const t=fresh();t.$('free-levels').onclick();assert.equal(t.$('journey-content').children[0].children.length,5);t.pick(i);assert.deepEqual(t.launches(),[{id:STAGES[i].id,story:false}]);assert.equal(t.story.snapshot().active,null);assert.equal(t.story.onRoundEnd(0),false);assert.equal(t.story.isOpen,false);}});
check('story to free-play leaves progression inactive while retaining earned session badges',()=>{const t=fresh();t.$('story-worlds').onclick();t.pick(0);t.action(0);t.story.onRoundEnd(0);t.$('free-levels').onclick();t.pick(4);assert.equal(t.story.snapshot().active,null);assert.deepEqual(t.story.snapshot().cleared,['yacht']);assert.equal(t.story.onRoundEnd(1),false);});
check('Back and Escape return scene/result to worlds then close to arena',()=>{for(const useEscape of [false,true])for(const result of [false,true]){const t=fresh();t.$('story-worlds').onclick();t.pick(2);if(result){t.action(0);t.story.onRoundEnd(1);}const back=()=>useEscape?t.escape():t.$('journey-back').onclick();back();assert.equal(t.story.snapshot().view,'worlds');assert.equal(t.story.isOpen,true);back();assert.equal(t.story.isOpen,false);assert.equal(t.events.at(-1),'resume');}});
check('selector cross-links and Back-to-arena buttons work without launching a match',()=>{const t=fresh();t.$('story-worlds').onclick();t.action(1);assert.equal(t.story.snapshot().view,'levels');t.action(0);assert.equal(t.story.snapshot().view,'worlds');t.action(2);assert.equal(t.story.isOpen,false);assert.equal(t.launches().length,0);t.$('free-levels').onclick();t.action(1);assert.equal(t.story.isOpen,false);});
check('navigation pauses only once per modal visit, preserving pre-navigation running state',()=>{const t=fresh();t.$('story-worlds').onclick();t.pick(1);t.$('journey-back').onclick();t.action(1);t.action(0);assert.equal(t.events.filter(e=>e==='pause').length,1);t.$('journey-back').onclick();t.$('story-worlds').onclick();assert.equal(t.events.filter(e=>e==='pause').length,2);});
check('readiness gate blocks every story and free-play launch and allows later retry',()=>{for(const story of [true,false])for(let i=0;i<(story?4:5);i++){const t=fresh();t.setReady(false);t.$(story?'story-worlds':'free-levels').onclick();t.pick(i);if(story)t.action(0);assert.equal(t.launches().length,0);assert.equal(t.story.isOpen,true);assert.match(t.$('journey-copy').textContent,/loading/);t.setReady(true);if(story)t.action(0);else t.pick(i);assert.equal(t.launches().length,1);assert.equal(t.story.isOpen,false);}});
check('explicit leaveStory stops story results; snapshots do not expose mutable progress',()=>{const t=fresh();t.$('story-worlds').onclick();t.pick(0);t.action(0);t.story.onRoundEnd(0);t.story.snapshot().cleared.push('castle');assert.deepEqual(t.story.snapshot().cleared,['yacht']);t.story.leaveStory();assert.equal(t.story.onRoundEnd(0),false);assert.match(t.$('journey-status').textContent,/FREE PLAY/);});
// Exercise the actual small main.ts integration block with isolated game callbacks.
function integration(wasRunning,initialMode='guard'){
 const d=dom(),main=read('src/main.ts');const start=main.indexOf('let resumeAfterJourney ='),end=main.indexOf("$('start').onclick = start;",start);assert.ok(start>=0&&end>start);
 const code=compile(main.slice(start,end));
 const fixture=new Function('createStoryMode','STAGES','$','initialMode','wasRunning','createRoundPresentation','beginRoundOutro',`
 let mode=initialMode,running=wasRunning,started=true,state={winner:null},starts=0,restarts=0;
 let presentation=createRoundPresentation();presentation.phase='fight';
 const setStage=()=>{};const showOverlay=()=>{running=false;};
 const start=()=>{starts++;running=true;};
 const restart=()=>{restarts++;state={winner:null};presentation=createRoundPresentation();};
 ${code};return {story,inspect:()=>({mode,running,starts,restarts,winner:state.winner,presentation:{...presentation}}),
 finish:()=>{state.winner=0;presentation.phase='result';},
 outro:()=>{state.winner=0;beginRoundOutro(presentation,0,false);presentation.frame=30;},
 intro:()=>{presentation=createRoundPresentation();presentation.frame=17;}};
 `)(createStoryMode,STAGES,d.$,initialMode,wasRunning,createRoundPresentation,beginRoundOutro);
 return {...d,...fixture};
}
check('actual main hooks preserve paused/running status after nested destination browsing',()=>{for(const running of [false,true]){const t=integration(running);t.$('story-worlds').onclick();t.pick(0);t.$('journey-back').onclick();t.$('journey-back').onclick();assert.equal(t.inspect().running,running);assert.equal(t.inspect().starts,running?1:0);}});
check('actual main hooks never resume a completed round from menu Back',()=>{const t=integration(true);t.finish();t.$('story-worlds').onclick();t.$('journey-back').onclick();assert.equal(t.inspect().starts,0);});
check('actual main hooks resume an unfinished outro without restarting presentation',()=>{for(const running of [false,true]){
 const t=integration(running);t.outro();const before=t.inspect().presentation;
 t.$('story-worlds').onclick();t.pick(0);t.$('journey-back').onclick();t.$('journey-back').onclick();
 assert.equal(t.inspect().running,running);assert.equal(t.inspect().starts,running?1:0);assert.equal(t.inspect().restarts,0);
 assert.equal(t.inspect().winner,0);assert.deepEqual(t.inspect().presentation,before);assert.equal(t.inspect().presentation.phase,'outro');
}});
check('actual main hooks preserve intro progress while browsing and reset it on a new stage',()=>{
 const t=integration(true);t.intro();t.$('story-worlds').onclick();t.$('journey-back').onclick();
 assert.equal(t.inspect().presentation.phase,'intro');assert.equal(t.inspect().presentation.frame,17);
 t.$('free-levels').onclick();t.pick(4);assert.equal(t.inspect().presentation.phase,'intro');assert.equal(t.inspect().presentation.frame,0);assert.equal(t.inspect().restarts,1);
});
check('actual main hooks force CPU for story and restore each prior free-play behavior',()=>{for(const mode of ['cpu','guard','dummy']){const t=integration(false,mode);t.$('story-worlds').onclick();t.pick(0);t.action(0);assert.equal(t.inspect().mode,'cpu');t.story.onRoundEnd(0);t.action(0);assert.equal(t.inspect().mode,'cpu');t.$('free-levels').onclick();t.pick(4);assert.equal(t.inspect().mode,mode);assert.equal(t.$('mode').value,mode);assert.equal(t.inspect().restarts,3);}});
console.log(`${count} story/navigation checks passed (controller + actual main hooks; DOM stub, no browser claim).`);
