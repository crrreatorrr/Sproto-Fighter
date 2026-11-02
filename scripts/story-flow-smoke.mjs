// Actual campaign controller and main hooks with in-memory saves and stub DOM.
// This is functional integration coverage, not browser or physical-controller QA.
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import ts from 'typescript';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const temp=mkdtempSync(join(tmpdir(),'sproto-story-flow-'));
let checks=0;
try {
  assert.equal(spawnSync(process.execPath,[resolve('node_modules/typescript/bin/tsc'),'src/storyProgress.ts','src/storyMode.ts','src/animationEvents.ts','src/stageVariants.ts','--outDir',temp,'--module','commonjs','--target','ES2022','--skipLibCheck'],{stdio:'inherit'}).status,0,'compile actual campaign modules');
  const req=createRequire(import.meta.url);
  const progressModule=req(join(temp,'storyProgress.js'));
  const {createStoryProgress,STORY_ENCOUNTERS,STARTER_FIGHTERS,LEGACY_STORY_SAVE_KEY,LEGACY_STORY_OPPONENTS}=progressModule;
  const core=req(join(temp,'core.js'));
  const {ROSTER,PLAYABLE_FIGHTERS,createState,step,A,isFreePlayAddition}=core;
  const {STAGES,STORY_STAGE_IDS}=req(join(temp,'stage.js'));
  const {createStoryMode}=req(join(temp,'storyMode.js'));
  const {storyLocationForEncounter}=req(join(temp,'stageVariants.js'));
  const {createRoundPresentation}=req(join(temp,'animationEvents.js'));
  const TOTAL=STORY_ENCOUNTERS.length;
  const ART=STORY_ENCOUNTERS.find(e=>e.gauntlet==='art');
  const FINAL=STORY_ENCOUNTERS.find(e=>e.gauntlet==='final');
  const flush=async()=>{for(let i=0;i<16;i++)await Promise.resolve();};
  async function check(name,fn){await fn();checks++;console.log('PASS:',name);}
  function storage(initial={}) {
    const values=new Map(Object.entries(initial));
    return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  }
  function clearNode(progress,index) {
    assert.equal(progress.begin(index),true,'begin '+index);
    for(let wave=0;wave<STORY_ENCOUNTERS[index].opponents.length;wave++)assert.equal(progress.win(index,wave),true,`clear ${index}/${wave}`);
  }
  function before(index) {
    const disk=storage(),progress=createStoryProgress(disk);
    for(let i=0;i<index;i++)clearNode(progress,i);
    return disk;
  }
  class Element {
    classList={toggle(){}};children=[];open=false;disabled=false;hidden=false;dataset={};textContent='';value='';events={};style={setProperty(){}};
    set innerHTML(value){this.html=value;this.children=[];}
    get innerHTML(){return this.html??'';}
    replaceChildren(...nodes){this.children=nodes;this.html='';}
    append(...nodes){this.children.push(...nodes);}
    showModal(){assert.equal(this.open,false);this.open=true;}
    close(){this.open=false;}
    addEventListener(event,fn){this.events[event]=fn;}
    focus(){globalThis.document.activeElement=this;}
  }
  function dom() {
    const elements=new Map([...(read('index.html')+read('src/selectionMenu.ts')).matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],new Element()]));
    const $=id=>{assert.ok(elements.has(id),'missing #'+id);return elements.get(id);};
    globalThis.document={getElementById:$,createElement:()=>new Element()};
    return {$,pick:i=>$('journey-content').children[0].children[i].onclick(),action:i=>$('journey-actions').children[i].onclick(),escape:()=>$('journey-dialog').events.cancel({preventDefault(){}})};
  }
  function fresh(disk=storage()) {
    const d=dom(),progress=createStoryProgress(disk),events=[];
    let ready=true,launchResult=true,testing=false,mapChoose=null;
    const story=createStoryMode({
      pause:()=>events.push('pause'),resume:()=>events.push('resume'),ready:()=>ready,testing:()=>testing,
      map:(_parent,_progress,choose)=>mapChoose=choose,
      launch:async(stage,isStory,opponent,...rest)=>{
        events.push({stage,story:isStory,opponent,rest});
        return typeof launchResult==='function'?launchResult():launchResult;
      },
    },progress);
    return {...d,disk,progress,story,events,setReady:value=>ready=value,setTesting:value=>testing=value,setLaunch:value=>launchResult=value,
      launches:()=>events.filter(event=>typeof event==='object'),
      mapPick:index=>{assert.ok(mapChoose);mapChoose(STORY_ENCOUNTERS[index]);},
      async begin(){d.$('story-worlds').onclick();await d.action(0);await d.action(0);await flush();},
    };
  }
  async function finishWave(t,winner=0) {
    assert.equal(t.story.finishMatch(winner),true);
    assert.equal(t.story.onRoundEnd(winner),true);
    await flush();
  }
  const progressView=p=>{const s=p.snapshot();return {cleared:s.cleared,unlocked:s.unlocked,completed:s.completed,godModeUnlocked:s.godModeUnlocked,nextIndex:s.nextIndex};};

  await check('installed campaign exposes two genuine sequential gauntlets and dynamic counts',()=>{
    assert.ok(TOTAL>0);assert.ok(ART);assert.ok(FINAL);
    assert.deepEqual(ART.opponents,['sproto865','sproto943']);assert.deepEqual(FINAL.opponents,['vela','vaudream']);
    assert.equal(ART.stage,'verse');assert.equal(FINAL.stage,'hatchery');
    for(const encounter of STORY_ENCOUNTERS){assert.ok(encounter.opponents.length);assert.equal(encounter.opponent,encounter.opponents[0]);for(const id of encounter.opponents)assert.ok(PLAYABLE_FIGHTERS.includes(id),id);}
    assert.equal(new Set(STORY_ENCOUNTERS.map(e=>e.id)).size,TOTAL);
  });
  await check('initial region gates block jumps while free-play arenas stay available',async()=>{
    const t=fresh();t.$('story-worlds').onclick();const cards=t.$('journey-content').children[0].children;
    assert.equal(cards[0].disabled,false);
    for(let i=1;i<cards.length;i++){assert.equal(cards[i].disabled,true);await t.pick(i);}
    assert.equal(t.launches().length,0);
    t.$('free-levels').onclick();for(const card of t.$('journey-content').children[0].children)assert.equal(card.disabled,false);
  });
  await check('normal and God Mode controller wins persist identical recruitment and continuation',async()=>{
    const outcomes=[];
    for(const testing of [false,true]){
      const t=fresh();t.setTesting(testing);await t.begin();await finishWave(t);
      const restored=createStoryProgress(t.disk);assert.ok(restored.isUnlocked(STORY_ENCOUNTERS[0].opponent));assert.ok(restored.isCleared(0));assert.equal(restored.snapshot().nextIndex,1);
      assert.match(t.$('journey-title').textContent,/recruited/i);await t.action(0);await flush();assert.equal(t.story.snapshot().encounter.index,1);
      await finishWave(t);outcomes.push(progressView(createStoryProgress(t.disk)));
    }
    assert.deepEqual(outcomes[0],outcomes[1]);
  });
  await check('defeat, draw and duplicate result notifications do not advance ordinary encounters',async()=>{
    for(const winner of [1,2]){
      const t=fresh();await t.begin();const saved=progressView(t.progress);await finishWave(t,winner);
      assert.deepEqual(progressView(t.progress),saved);assert.match(t.$('journey-title').textContent,winner===2?/Draw/:/Retry/);
      await t.action(0);await flush();assert.equal(t.story.snapshot().encounter.index,0);
      assert.equal(t.story.finishMatch(0),true);assert.equal(t.story.finishMatch(0),false);assert.equal(t.story.onRoundEnd(0),true);assert.equal(t.story.onRoundEnd(0),false);
      assert.equal(createStoryProgress(t.disk).snapshot().nextIndex,1);
    }
  });
  await check('restart of a settled ordinary round accepts a new outcome once',async()=>{
    const t=fresh();await t.begin();t.story.finishMatch(1);assert.equal(t.story.retryMatch(),true);await flush();t.story.finishMatch(0);assert.ok(t.progress.isCleared(0));
  });
  await check('both gauntlets recruit wave one but save no halfway checkpoint; wave two auto-launches',async()=>{
    for(const encounter of [ART,FINAL]){
      const t=fresh(before(encounter.index));await t.begin();assert.equal(t.launches().at(-1).opponent,encounter.opponents[0]);
      assert.equal(t.story.finishMatch(0),true);
      const restored=createStoryProgress(t.disk);assert.ok(restored.isUnlocked(encounter.opponents[0]));assert.equal(restored.isCleared(encounter.index),false);assert.equal(restored.snapshot().nextIndex,encounter.index);
      assert.equal(t.story.onRoundEnd(0),true);await flush();assert.equal(t.launches().at(-1).opponent,encounter.opponents[1]);assert.equal(t.story.snapshot().encounter.index,encounter.index);
      await finishWave(t);assert.ok(createStoryProgress(t.disk).isCleared(encounter.index));assert.ok(t.progress.isUnlocked(encounter.opponents[1]));
    }
  });
  await check('loss and draw in either wave retry each gauntlet from its first opponent',async()=>{
    for(const encounter of [ART,FINAL])for(const wave of [0,1])for(const winner of [1,2]){
      const t=fresh(before(encounter.index));await t.begin();if(wave===1)await finishWave(t);
      assert.equal(t.launches().at(-1).opponent,encounter.opponents[wave]);await finishWave(t,winner);
      assert.equal(t.progress.isCleared(encounter.index),false);assert.equal(t.progress.snapshot().nextIndex,encounter.index);
      await t.action(0);await flush();assert.equal(t.launches().at(-1).opponent,encounter.opponents[0]);
    }
  });
  await check('reload, leaving, restart and route navigation abandon both half-finished gauntlets',async()=>{
    for(const encounter of [ART,FINAL])for(const operation of ['reload','leave','restart','back']){
      let t=fresh(before(encounter.index));await t.begin();await finishWave(t);assert.equal(t.launches().at(-1).opponent,encounter.opponents[1]);
      if(operation==='reload'){t=fresh(t.disk);await t.begin();}
      else if(operation==='leave'){t.story.leaveStory();assert.equal(t.story.finishMatch(0),false);await t.begin();}
      else if(operation==='restart'){assert.equal(t.story.retryMatch(),true);await flush();}
      else {t.$('story-worlds').onclick();t.escape();assert.equal(t.story.isOpen,false);await t.begin();}
      assert.equal(t.launches().at(-1).opponent,encounter.opponents[0],`${encounter.gauntlet}/${operation}`);
      assert.equal(t.progress.isCleared(encounter.index),false);assert.ok(t.progress.isUnlocked(encounter.opponents[0]));
    }
  });
  await check('readiness and launch failures keep progress unchanged and allow a clean retry',async()=>{
    const t=fresh();t.setReady(false);await t.begin();assert.equal(t.launches().length,0);assert.match(t.$('journey-copy').textContent,/loading/);
    t.setReady(true);t.setLaunch(false);const warn=console.warn;console.warn=()=>{};try{await t.action(0);await flush();}finally{console.warn=warn;}
    assert.equal(t.story.isActive,false);assert.equal(t.story.isOpen,true);assert.equal(t.progress.snapshot().nextIndex,0);
    t.setLaunch(true);await t.action(0);await flush();assert.equal(t.story.isActive,true);
  });
  await check('failed second-wave loading resets each gauntlet rather than granting its next fight',async()=>{
    for(const encounter of [ART,FINAL]){
      const t=fresh(before(encounter.index));await t.begin();t.setLaunch(false);const warn=console.warn;console.warn=()=>{};try{await finishWave(t);}finally{console.warn=warn;}
      assert.equal(t.story.isOpen,true);assert.equal(t.progress.isCleared(encounter.index),false);
      t.setLaunch(true);await t.action(0);await flush();assert.equal(t.launches().at(-1).opponent,encounter.opponents[0]);
    }
  });
  await check('double-clicked encounter launch submits once while assets load',async()=>{
    const t=fresh();let release;t.setLaunch(()=>new Promise(resolve=>release=resolve));
    t.$('story-worlds').onclick();await t.action(0);t.action(0);t.action(0);assert.equal(t.launches().length,1);assert.equal(t.story.snapshot().launching,true);
    release(true);await flush();assert.equal(t.story.snapshot().launching,false);assert.equal(t.story.snapshot().encounter.index,0);
  });
  await check('free play, Back and Escape do not award story progress',async()=>{
    const t=fresh();await t.begin();t.story.leaveStory();assert.equal(t.story.finishMatch(0),false);
    t.$('free-levels').onclick();await t.pick(STAGES.findIndex(s=>s.id==='ranch'));await flush();assert.equal(t.story.onRoundEnd(0),false);assert.equal(t.progress.snapshot().cleared.length,0);
    t.$('story-worlds').onclick();await t.pick(0);t.escape();assert.equal(t.story.snapshot().view,'worlds');t.escape();assert.equal(t.story.isOpen,false);
  });
  await check('migrated gaps drive Continue, map inspection and regional entry by first uncleared node',async()=>{
    const disk=storage({[LEGACY_STORY_SAVE_KEY]:JSON.stringify({version:1,cleared:LEGACY_STORY_OPPONENTS.map(id=>'story-v1-'+id),unlocked:['rivet','bront',...LEGACY_STORY_OPPONENTS]})});
    const t=fresh(disk),next=t.progress.snapshot().nextIndex;
    assert.notEqual(next,null);assert.ok(t.progress.snapshot().cleared.length>next,'migration retains later clears instead of truncating them');
    await t.begin();assert.equal(t.story.snapshot().encounter.index,next);
    t.story.leaveStory();t.$('story-worlds').onclick();const stage=STORY_ENCOUNTERS[next].stage;
    await t.pick(STORY_STAGE_IDS.indexOf(stage));await t.action(0);await flush();assert.equal(t.story.snapshot().encounter.index,next);
    t.story.leaveStory();t.$('story-worlds').onclick();t.mapPick(next);await t.action(0);await flush();assert.equal(t.story.snapshot().encounter.index,next);
    for(let wave=0;wave<STORY_ENCOUNTERS[next].opponents.length;wave++)await finishWave(t);
    const after=t.progress.snapshot().nextIndex;assert.ok(after===null||after>next);
    if(after!==null){await t.action(0);await flush();assert.equal(t.story.snapshot().encounter.index,after,'continuation skips preserved clears');}
  });
  await check('full installed route in normal and God Mode follows every wave and ends with a durable reward',async()=>{
    const outcomes=[];
    for(const testing of [false,true]){
      const t=fresh();t.setTesting(testing);await t.begin();
      for(const encounter of STORY_ENCOUNTERS){
        for(const opponent of encounter.opponents){assert.equal(t.story.snapshot().encounter.index,encounter.index);assert.equal(t.launches().at(-1).opponent,opponent);assert.equal(t.launches().at(-1).stage,encounter.stage);await finishWave(t);}
        assert.ok(t.progress.isCleared(encounter.index));if(encounter.index<TOTAL-1){await t.action(0);await flush();}
      }
      const restored=createStoryProgress(t.disk);assert.equal(restored.snapshot().completed,true);assert.equal(restored.snapshot().nextIndex,null);assert.equal(restored.snapshot().godModeUnlocked,true);
      for(const id of STORY_ENCOUNTERS.flatMap(e=>e.opponents))assert.ok(restored.isUnlocked(id),id);
      outcomes.push(progressView(restored));
    }
    assert.deepEqual(outcomes[0],outcomes[1]);
  });

  // Main-hook scenarios are appended below once controller APIs converge.

  await check('God Mode prevents melee, spit and throw damage while normal combat remains vulnerable',()=>{
    for(const attack of ['light','bolt','grab'])for(const godMode of [false,true]){
      const state=createState('rivet','cpu','bront');if(godMode)state.godMode=true;
      state.fighters[0].x=500;state.fighters[1].x=attack==='bolt'?690:550;
      for(let frame=0;frame<180;frame++)step(state,[0,frame===0?A[attack]:0]);
      if(godMode){assert.equal(state.fighters[0].hp,1000,attack);assert.equal(state.fighters[0].pips,3);}else assert.ok(state.fighters[0].hp<1000,attack+' normal damage');
    }
    const state=createState('rivet','cpu','vela');state.godMode=true;state.fighters[0].pips=3;step(state,[A.special,0]);assert.equal(state.fighters[0].move?.id,'special');assert.equal(state.fighters[0].pips,3);
  });
  await check('God Mode permits enemy KO and deterministic frame-indexed replay',()=>{
    const a=createState('rivet','cpu','vela');a.godMode=true;a.fighters[0].pips=3;const b=structuredClone(a),inputs=[];
    for(let frame=0;frame<6000&&a.winner===null;frame++){const input=[frame%60===0?A.bolt:0,0];inputs.push(input);step(a,input);}
    for(const input of inputs)step(b,input);assert.deepEqual(a,b);assert.equal(a.winner,0);assert.equal(a.fighters[0].hp,1000);
  });
  console.log(`${checks} campaign/controller/main integration checks passed for ${TOTAL} nodes / ${STORY_ENCOUNTERS.flatMap(e=>e.opponents).length} opponents. Stub DOM and in-memory saves only.`);
} finally {
  rmSync(temp,{recursive:true,force:true});
}
