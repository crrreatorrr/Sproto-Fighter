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
  const NICK_JUICY=STORY_ENCOUNTERS.find(e=>e.gauntlet==='nick-juicy');
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

  await check('installed campaign exposes three genuine sequential gauntlets and dynamic counts',()=>{
    assert.ok(TOTAL>0);assert.ok(ART);assert.ok(NICK_JUICY);assert.ok(FINAL);
    assert.deepEqual(NICK_JUICY.opponents,['nick','guest07']);assert.equal(NICK_JUICY.stage,'hatchery');assert.equal(NICK_JUICY.index,FINAL.index-1);
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
  await check('all three gauntlets recruit wave one but save no halfway checkpoint; wave two auto-launches',async()=>{
    for(const encounter of [ART,NICK_JUICY,FINAL]){
      const t=fresh(before(encounter.index));await t.begin();assert.equal(t.launches().at(-1).opponent,encounter.opponents[0]);
      assert.equal(t.story.finishMatch(0),true);
      assert.equal(t.story.finishMatch(0),false,'duplicate KO must not recruit wave two');
      const restored=createStoryProgress(t.disk);assert.ok(restored.isUnlocked(encounter.opponents[0]));assert.equal(restored.isCleared(encounter.index),false);assert.equal(restored.snapshot().nextIndex,encounter.index);
      assert.equal(t.story.onRoundEnd(0),true);assert.equal(t.story.onRoundEnd(0),false,'duplicate outro while loading must not skip the next bout');await flush();assert.equal(t.launches().at(-1).opponent,encounter.opponents[1]);assert.equal(t.story.snapshot().encounter.index,encounter.index);
      await finishWave(t);assert.ok(createStoryProgress(t.disk).isCleared(encounter.index));assert.ok(t.progress.isUnlocked(encounter.opponents[1]));
    }
  });
  await check('loss and draw in either wave retry each gauntlet from its first opponent',async()=>{
    for(const encounter of [ART,NICK_JUICY,FINAL])for(const wave of [0,1])for(const winner of [1,2]){
      const t=fresh(before(encounter.index));await t.begin();if(wave===1)await finishWave(t);
      assert.equal(t.launches().at(-1).opponent,encounter.opponents[wave]);await finishWave(t,winner);
      assert.equal(t.progress.isCleared(encounter.index),false);assert.equal(t.progress.snapshot().nextIndex,encounter.index);
      await t.action(0);await flush();assert.equal(t.launches().at(-1).opponent,encounter.opponents[0]);
    }
  });
  await check('reload, leaving, restart and route re-entry restart all three gauntlets from wave one',async()=>{
    for(const encounter of [ART,NICK_JUICY,FINAL])for(const operation of ['reload','leave','restart','back']){
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
    for(const encounter of [ART,NICK_JUICY,FINAL]){
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
  await check('preserved gaps drive Continue, map inspection and regional entry by first uncleared node',async()=>{
    let disk=storage({[LEGACY_STORY_SAVE_KEY]:JSON.stringify({version:1,cleared:LEGACY_STORY_OPPONENTS.map(id=>'story-v1-'+id),unlocked:['rivet','bront',...LEGACY_STORY_OPPONENTS]})});
    // Expanded builds get actual migration gaps. Baseline builds use a valid
    // v3 noncontiguous record to exercise the same controller cursor behavior.
    const migrated=createStoryProgress(disk).snapshot();
    if(migrated.completed)disk=storage({[progressModule.STORY_SAVE_KEY]:JSON.stringify({version:3,cleared:migrated.cleared.filter(id=>id!==STORY_ENCOUNTERS[2].id),unlocked:migrated.unlocked,godModeUnlocked:true})});
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
      const completed=progressView(t.progress);await t.begin();assert.equal(t.story.snapshot().encounter.index,0);await finishWave(t);
      assert.deepEqual(progressView(t.progress),completed,'replaying a cleared encounter retains the completion reward and all recruits');
    }
    assert.deepEqual(outcomes[0],outcomes[1]);
  });

  // Extract the real main hooks. Only browser/canvas/asset I/O is substituted.
  function integration({disk=storage(),clearCount=0}={}) {
    const d=dom(),progress=createStoryProgress(disk);
    for(let i=0;i<clearCount;i++)clearNode(progress,i);
    const main=read('src/main.ts'),parsed=ts.createSourceFile('main.ts',main,ts.ScriptTarget.Latest,true);
    const names=['launchSelection','updateStage','returnToSelection','restart','updateGodModeLabel','setTestingGodMode','closeSettings'];
    const functions=parsed.statements.filter(node=>ts.isFunctionDeclaration(node)&&names.includes(node.name?.text));
    assert.equal(functions.length,names.length,'all requested actual main hooks found');
    const start=main.indexOf('let resumeAfterJourney ='),end=main.indexOf("$('start').onclick = start;",start);
    assert.ok(start>=0&&end>start,'actual createStoryMode hook block found');
    const code=compile(functions.map(node=>node.getText(parsed)).join('\n')+'\n'+main.slice(start,end));
    const fixture=new Function('dependencies',`
      const {createStoryMode,storyProgress,STAGES,ROSTER,$,createRoundPresentation,createState,STORY_ENCOUNTERS,STORY_OPPONENTS,storyLocationForEncounter,isFreePlayAddition}=dependencies;
      let setup={fighter:'highsproto',opponent:'vela',stage:'ranch',mode:'guard',godMode:false};
      let mode='guard',running=false,started=false,chosen='highsproto',opponent='vela',matchGodMode=false,matchEarnedGodMode=false,testingGodMode=false,matchTesting=false;
      let state=createState(),presentation=createRoundPresentation(),accumulator=0,queued=0,qaSingleStep=false,resumeAfterSettings=false,remapping=null;
      let selectedStage='ranch',selectedLocation=null,assetFailure=false,mapChoose=null;
      const held=new Set(),frames=[],qaEvents=[],assetRequests=[],versusCalls=[];
      const countdown={hide(){}};
      const versus={show:(...ids)=>versusCalls.push(ids),hide(){}};
      const ensurePoseAtlases=async(ids)=>{assetRequests.push([...ids]);if(assetFailure)throw Error('asset failure');},ensurePowerArt=async()=>{};
      const setStage=id=>selectedStage=id,setActiveStoryLocation=value=>selectedLocation=value,loadStoryLocation=async()=>{};
      const selection={isOpen:true,getSetup:()=>({...setup}),setSetup:next=>setup={...setup,...next},hide(){this.isOpen=false;},show(){this.isOpen=true;},setReady(){}};
      const mountCampaignMap=(_parent,_progress,choose)=>mapChoose=choose;
      const dialog=$('controls-dialog'),updateControls=()=>{};
      const start=()=>{if(dialog.open)return;running=true;started=true;$('overlay').hidden=true;};
      const showOverlay=()=>{running=false;$('overlay').hidden=false;};
      ${code}
      return {story,launchSelection,returnToSelection,restart,setTestingGodMode,closeSettings,
        setSelectedFighter(id){setup.fighter=id;},setSelectedGodMode(value){setup.godMode=value;},
        setReady(value){$('start').disabled=!value;},failAssets(value=true){assetFailure=value;},
        openSettings(){resumeAfterSettings=running;running=false;dialog.open=true;},
        openResultSettings(){running=false;presentation.phase='result';dialog.open=true;resumeAfterSettings=false;$('overlay').hidden=false;},
        mapPick(index){if(!mapChoose)throw Error('Map not mounted');mapChoose(STORY_ENCOUNTERS[index]);},
        inspect:()=>({setup,mode,running,matchGodMode,matchTesting,state,selectedStage,selectedLocation,assetRequests,versusCalls,selectionOpen:selection.isOpen})};
    `)({createStoryMode:hooks=>createStoryMode(hooks,progress),storyProgress:progress,STAGES,ROSTER,$:d.$,createRoundPresentation,createState,
      STORY_ENCOUNTERS,STORY_OPPONENTS:progressModule.STORY_OPPONENTS,storyLocationForEncounter,isFreePlayAddition});
    return {...d,...fixture,progress,disk,async begin(){d.$('story-worlds').onclick();await d.action(0);await d.action(0);await flush();}};
  }
  await check('actual main rejects every unrecruited campaign P1 including former free-play additions',async()=>{
    const t=integration(),original=t.inspect().state;
    for(const id of progressModule.STORY_OPPONENTS){
      assert.equal(t.progress.isUnlocked(id),false,id+' starts locked');
      assert.equal(await t.launchSelection({fighter:id,opponent:'vela',stage:'ranch',mode:'cpu'}),false,id+' free-play launch gate');
      assert.equal(await t.launchSelection({fighter:id,opponent:'vela',stage:'ranch',mode:'cpu'},true),false,id+' story launch gate');
      assert.equal(t.inspect().state,original,'rejected launch must not replace the current state');
    }
  });
  await check('actual normal and God Mode wins recruit playable P1 fighters immediately and after reload',async()=>{
    for(const testing of [false,true]){
      const t=integration();if(testing)t.setTestingGodMode(true);await t.begin();await finishWave(t);t.returnToSelection();
      const recruit=STORY_ENCOUNTERS[0].opponent;assert.ok(t.progress.isUnlocked(recruit));
      assert.equal(await t.launchSelection({fighter:recruit,opponent:'vela',stage:'bar',mode:'cpu'}),true);
      assert.equal(t.inspect().state.fighters[0].id,recruit);assert.equal(!!t.inspect().state.godMode,testing);
      const restored=integration({disk:t.disk});assert.equal(await restored.launchSelection({fighter:recruit,opponent:'vela',stage:'bar',mode:'cpu'}),true);
      assert.equal(restored.inspect().state.fighters[0].id,recruit);
    }
  });
  await check('actual main refreshes stale saves before P1 launch without granting the next locked fighter',async()=>{
    const t=integration(),otherTab=createStoryProgress(t.disk);clearNode(otherTab,0);const recruit=STORY_ENCOUNTERS[0].opponent;
    assert.equal(t.progress.isUnlocked(recruit),false,'fixture starts stale');
    assert.equal(await t.launchSelection({fighter:recruit,opponent:'vela',stage:'bar',mode:'cpu'}),true);
    const before=t.inspect().state;assert.equal(await t.launchSelection({fighter:STORY_ENCOUNTERS[1].opponent,opponent:'vela',stage:'bar',mode:'cpu'}),false);assert.equal(t.inspect().state,before);
    assert.match(t.$('selection-announcement').textContent,/not recruited for P1/);
  });
  await check('actual story hook keeps locked previews open with useful recruitment feedback',async()=>{
    const t=integration(),locked=STORY_ENCOUNTERS[3].opponent,prior=t.inspect().state;
    t.setTestingGodMode(true);t.setSelectedFighter(locked);await t.begin();
    assert.equal(t.story.isOpen,true);assert.equal(t.story.isActive,false);assert.equal(t.inspect().state,prior);assert.equal(t.progress.snapshot().nextIndex,0);
    assert.match(t.$('journey-copy').textContent,/locked P1 preview/);assert.ok(t.$('journey-copy').textContent.includes(ROSTER[locked].name));
    t.setSelectedFighter(STARTER_FIGHTERS[0]);await t.action(0);await flush();assert.equal(t.story.isActive,true);assert.equal(t.inspect().state.fighters[0].id,'highsproto');assert.equal(t.inspect().state.godMode,true);
  });
  await check('actual main refills health and preserves hero and scenery between all three gauntlets’ opponents',async()=>{
    for(const encounter of [ART,NICK_JUICY,FINAL]){
      const t=integration({disk:before(encounter.index)});await t.begin();assert.equal(t.inspect().mode,'cpu');
      assert.equal(t.inspect().state.fighters[1].id,encounter.opponents[0]);
      assert.deepEqual(t.inspect().versusCalls.at(-1),[t.inspect().state.fighters[0].id,encounter.opponents[0]]);
      const hero=t.inspect().state.fighters[0].id,location=t.inspect().selectedLocation?.id??null;
      t.inspect().state.fighters[0].hp=17;t.inspect().state.fighters[0].pips=2;
      await finishWave(t);
      assert.equal(t.inspect().state.fighters[1].id,encounter.opponents[1]);assert.equal(t.inspect().state.fighters[0].id,hero);
      assert.deepEqual(t.inspect().versusCalls.at(-1),[hero,encounter.opponents[1]],'second bout gets its own correct versus portraits');
      assert.equal(t.inspect().state.fighters[0].hp,1000);assert.equal(t.inspect().state.fighters[0].pips,0);assert.equal(t.inspect().state.winner,null);
      assert.equal(t.inspect().selectedStage,encounter.stage);assert.equal(t.inspect().selectedLocation?.id??null,location,'both waves keep the encounter scenery');
      assert.equal(t.progress.isCleared(encounter.index),false);assert.match(t.$('mode-label').textContent,/HEALTH REFILLED/);
      assert.ok(t.inspect().assetRequests[0].includes(encounter.opponents[0]));assert.ok(t.inspect().assetRequests[0].includes(encounter.opponents[1]),'preload both opponents');
      await finishWave(t);assert.ok(createStoryProgress(t.disk).isCleared(encounter.index));
    }
  });
  await check('Settings God Mode during any second wave restarts that encounter and both wins still count',async()=>{
    for(const encounter of [ART,NICK_JUICY,FINAL]){
      const t=integration({disk:before(encounter.index)});await t.begin();await finishWave(t);
      assert.equal(t.inspect().state.fighters[1].id,encounter.opponents[1]);t.openSettings();t.setTestingGodMode(true);await flush();
      assert.equal(t.inspect().running,false,'do not simulate behind Settings');assert.equal(t.inspect().state.fighters[1].id,encounter.opponents[0]);assert.equal(t.inspect().state.godMode,true);
      t.closeSettings();assert.equal(t.inspect().running,true);assert.equal(t.$('overlay').hidden,true);
      await finishWave(t);assert.equal(t.inspect().state.fighters[1].id,encounter.opponents[1]);assert.equal(t.inspect().state.godMode,true);assert.equal(t.progress.isCleared(encounter.index),false);
      await finishWave(t);assert.ok(createStoryProgress(t.disk).isCleared(encounter.index));
    }
  });
  await check('earned God Mode survives campaign gaps and works in story and free play',async()=>{
    let disk=storage({[LEGACY_STORY_SAVE_KEY]:JSON.stringify({version:1,cleared:LEGACY_STORY_OPPONENTS.map(id=>'story-v1-'+id),unlocked:['rivet','bront',...LEGACY_STORY_OPPONENTS]})});
    // A baseline roster has no inserted rivals. Give its earned v3 reward
    // an explicit new-route gap, while the expanded roster uses real migration.
    const migrated=createStoryProgress(disk).snapshot();
    if(migrated.completed)disk=storage({[progressModule.STORY_SAVE_KEY]:JSON.stringify({version:3,cleared:migrated.cleared.filter(id=>id!==STORY_ENCOUNTERS[0].id),unlocked:migrated.unlocked,godModeUnlocked:true})});
    const t=integration({disk});assert.equal(t.progress.snapshot().completed,false);assert.equal(t.progress.snapshot().godModeUnlocked,true);
    t.setSelectedGodMode(true);await t.begin();assert.equal(t.inspect().state.godMode,true);assert.equal(t.inspect().state.fighters[0].pips,3);
    const saved=progressView(t.progress);t.$('free-levels').onclick();await t.pick(STAGES.findIndex(s=>s.id==='ranch'));await flush();
    assert.equal(t.inspect().mode,'guard');assert.equal(t.inspect().state.godMode,true);assert.equal(t.story.finishMatch(0),false);assert.deepEqual(progressView(t.progress),saved);
  });
  await check('actual main story scenery follows the node and standalone arenas clear the variant',async()=>{
    const t=integration();await t.begin();const expected=storyLocationForEncounter(STORY_ENCOUNTERS[0],STORY_ENCOUNTERS);
    assert.equal(t.inspect().selectedLocation?.id,expected.id);assert.ok(t.$('stage-subtitle').textContent.includes(expected.title.toUpperCase()));
    await t.launchSelection({fighter:'highsproto',opponent:'vela',stage:'bar',mode:'dummy'});
    assert.equal(t.inspect().selectedLocation,null);assert.equal(t.inspect().selectedStage,'bar');assert.equal(t.story.isActive,false);
  });
  await check('actual main asset failure preserves the current state and premature God Mode remains gated',async()=>{
    const t=integration();assert.equal(await t.launchSelection({fighter:'highsproto',opponent:'vela',stage:'ranch',mode:'cpu',godMode:true}),true);
    assert.equal(t.inspect().matchGodMode,false);const prior=t.inspect().state;t.failAssets();
    const error=console.error;console.error=()=>{};try{assert.equal(await t.launchSelection({fighter:'bront',opponent:'vela',stage:'bar',mode:'guard'}),false);}finally{console.error=error;}
    assert.equal(t.inspect().state,prior);t.returnToSelection();assert.equal(t.story.isActive,false);
  });
  await check('Settings testing toggle is immediate, restores a fresh round and resumes after result overlay',async()=>{
    const t=integration();t.setTestingGodMode(true);await t.begin();assert.equal(t.inspect().state.godMode,true);assert.equal(t.inspect().state.fighters[0].pips,3);assert.match(t.$('mode-label').textContent,/GOD MODE TEST/);
    t.inspect().state.fighters[0].hp=30;t.openSettings();t.setTestingGodMode(false);await flush();assert.equal(t.inspect().running,false);
    t.closeSettings();assert.equal(t.inspect().state.fighters[0].hp,1000);assert.equal(!!t.inspect().state.godMode,false);assert.equal(t.inspect().running,true);
    assert.doesNotMatch(t.$('mode-label').textContent,/GOD MODE/);
    t.returnToSelection();await t.launchSelection({fighter:'highsproto',opponent:'vela',stage:'bar',mode:'cpu'});
    t.openResultSettings();t.setTestingGodMode(true);assert.equal(t.inspect().running,false);t.closeSettings();assert.equal(t.inspect().running,true);assert.equal(t.$('overlay').hidden,true);assert.equal(t.inspect().state.fighters[0].hp,1000);
  });

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
