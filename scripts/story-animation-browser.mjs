import {chromium} from 'playwright';
import {createServer} from 'vite';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const server=process.env.BASE_URL?null:await createServer({server:{host:'127.0.0.1',port:0}});
if(server)await server.listen();
const base=process.env.BASE_URL||'http://127.0.0.1:'+server.httpServer.address().port+'/';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':undefined)}).catch(async error=>{await server?.close();throw error;});
const context=await browser.newContext({viewport:{width:1500,height:1000}}),page=await context.newPage();
const failures=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failures.push([r.status(),r.url()]);});
try{
 await page.goto(base);await page.waitForFunction(()=>window.neonRelay&&document.querySelector('#start-fight')?.disabled===false);
 const playback=await page.evaluate(async()=>{
  const {createStoryAnimation,storyAnimationPlan}=await import('/src/storyAnimation.ts');
  const {STORY_BOSS_X,loadStoryBossArt,startStoryBoss,drawStoryBossPose}=await import('/src/storyBoss.ts');
  await Promise.all(['giant','dragon','juicy','art','vmu'].map(form=>loadStoryBossArt(form)));
  const {createState}=await import('/src/core.ts');
  const {default:manifest}=await import('/src/storyAnimationManifest.json');
  const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;
  const ctx=canvas.getContext('2d'),records=[];
  for(const id of ['nick','guest07','sproto943','vela','vaudream']){
   const animation=createStoryAnimation(),plan=storyAnimationPlan(id,true);await animation.load(plan);
   const art=id==='sproto943'?await loadStoryBossArt('art'):null;
   let mechaEnd=null,mechaHeight=null;
   for(const phase of ['intro','boss','mecha','outro']){
    if(!plan[phase]?.length)continue;
    if(!animation.start(phase))throw Error('Cannot start '+id+'/'+phase);
    const seen=[],boundaryChecks=[],referenceFramesChecked=new Set();let frames=0,visible=0,ejectionEnd=null,smallMorelightHeight=null,shrinkStart=null,shrinkEnd=null,fusionEnd=null;
    while(animation.active&&frames<10000){
     const snap=animation.snapshot();if(seen.at(-1)!==snap.clip)seen.push(snap.clip);
     ctx.clearRect(0,0,1280,720);animation.draw(ctx,id==='vela'&&phase==='outro'?STORY_BOSS_X:1100,578,-1);
     if(art&&snap.clip==='art-fusion'&&snap.frame===manifest[snap.clip].frames-1&&!fusionEnd)
      fusionEnd=ctx.getImageData(0,0,1280,720).data;
     if(art&&snap.clip==='mega-woman-growth'&&snap.frame===0&&!boundaryChecks.includes('fusion/growth')){
      const first=ctx.getImageData(0,0,1280,720).data;
      if(!fusionEnd||!first.every((pixel,i)=>pixel===fusionEnd[i]))throw Error('Mega Artchick changes pose before growth');
      boundaryChecks.push('fusion/growth');
     }
     if(art&&snap.clip==='mega-woman-growth'&&snap.frame===manifest[snap.clip].frames-1&&!boundaryChecks.includes('growth/boss idle')){
      const final=ctx.getImageData(0,0,1280,720).data;
      const state=createState('highsproto','cpu',id),boss=startStoryBoss(state,'art');
      ctx.clearRect(0,0,1280,720);drawStoryBossPose(ctx,state,boss,art);
      if(!ctx.getImageData(0,0,1280,720).data.every((v,i)=>v===final[i]))throw Error('Mega Artchick changes appearance at boss start');
      boundaryChecks.push('growth/boss idle');
     }
     if(id==='vela'){
      const pixels=()=>ctx.getImageData(0,0,1280,720).data;
      const visibleHeight=data=>{let min=720,max=-1;for(let y=0;y<720;y++)for(let x=0;x<1280;x++)if(data[(y*1280+x)*4+3]){min=Math.min(min,y);max=Math.max(max,y);}return max-min+1;};
      if(snap.clip==='morelight-shrink'&&snap.frame===0&&!shrinkStart)shrinkStart=visibleHeight(pixels());
      if(snap.clip==='morelight-shrink'&&snap.frame===manifest['morelight-shrink'].frames-1&&!shrinkEnd)shrinkEnd=visibleHeight(pixels());
      if(snap.clip==='morelight-mecha'&&snap.frame===0&&shrinkEnd&&!boundaryChecks.includes('shrink/boarding')){
       if(shrinkStart<300||Math.abs(visibleHeight(pixels())-shrinkEnd)>2)throw Error('Shrink does not match the start of boarding');
       boundaryChecks.push('shrink/boarding');
      }
      if(snap.clip==='morelight-mecha'&&snap.frame===manifest['morelight-mecha'].frames-1){mechaEnd=pixels();mechaHeight=visibleHeight(mechaEnd);}
      if(snap.clip==='morelight-ejection'&&snap.frame<manifest['morelight-ejection'].referenceMechaFrames&&mechaEnd&&!referenceFramesChecked.has(snap.frame)){
       const now=pixels();if(!now.every((v,i)=>v===mechaEnd[i]))throw Error('Reference mecha changed or an unwanted chest object was added');
       referenceFramesChecked.add(snap.frame);
       if(!boundaryChecks.includes('mecha/ejection'))boundaryChecks.push('mecha/ejection');
      }
      if(snap.clip==='morelight-ejection'&&snap.frame===manifest['morelight-ejection'].frames-1){
       ejectionEnd=pixels();smallMorelightHeight=visibleHeight(ejectionEnd);
       if(Math.abs(smallMorelightHeight-159)>2||smallMorelightHeight>=mechaHeight*.75)throw Error('Morelight did not return to his small regular size');
      }
      if(snap.clip==='morelight-wizard'&&snap.frame===0&&ejectionEnd){
       const now=pixels();if(!now.every((v,i)=>v===ejectionEnd[i]))throw Error('Ejection/wizard boundary moved');
       if(!boundaryChecks.includes('ejection/wizard'))boundaryChecks.push('ejection/wizard');
      }
     }
     if(frames%20===0&&ctx.getImageData(0,0,1280,720).data.some((v,i)=>i%4===3&&v>0))visible++;
     animation.advance();frames++;
    }
    if(art&&phase==='boss'&&!boundaryChecks.includes('growth/boss idle'))throw Error('Missing Mega Artchick boundary check');
    if(animation.active)throw Error('Unbounded scene');
    if(id==='vela'&&phase==='mecha'&&!boundaryChecks.includes('shrink/boarding'))throw Error('Missing Morelight shrink boundary');
    if(id==='vela'&&phase==='outro'&&(boundaryChecks.length!==2||referenceFramesChecked.size!==manifest['morelight-ejection'].referenceMechaFrames))throw Error('Missing Morelight boundary/reference verification');
    records.push({id,phase,seen,frames,visible,boundaryChecks,...(smallMorelightHeight?{smallMorelightHeight,mechaHeight,referenceMechaFramesVerified:referenceFramesChecked.size}:{})});
   }
  }
  return records;
 });
 assert.equal(playback.length,9);for(const r of playback)assert.ok(r.visible>0,r.id);
 // Seed an isolated browser save immediately before Nick; use the actual story UI.
 await page.evaluate(async()=>{
  const {STORY_ENCOUNTERS,STORY_SAVE_KEY}=await import('/src/storyProgress.ts');
  const index=STORY_ENCOUNTERS.findIndex(e=>e.gauntlet==='nick-juicy');
  localStorage.setItem(STORY_SAVE_KEY,JSON.stringify({version:3,cleared:STORY_ENCOUNTERS.slice(0,index).map(e=>e.id),unlocked:['highsproto','bront'],godModeUnlocked:false}));
 });
 await page.reload();await page.waitForFunction(()=>document.querySelector('#start-fight')?.disabled===false);
 await page.locator('#story-worlds').click();await page.locator('#partner-picker [data-partner=bront]').click();await page.locator('#partner-confirm').click();await page.locator('#journey-actions button').first().click();await page.locator('#journey-actions button').first().click();
 await page.waitForFunction(()=>window.neonRelay.storySnapshot().opponent==='nick'&&!window.neonRelay.storySnapshot().launching);
 await page.keyboard.press('Enter');await page.waitForFunction(()=>window.neonRelay.storyAnimationSnapshot().phase==='intro');
 assert.equal(await page.evaluate(()=>window.neonRelay.snapshot().fighters[0].partner),'bront');
 const before=await page.evaluate(()=>({state:window.neonRelay.snapshot(),replay:window.neonRelay.replay()}));
 await page.locator('#pause').click();const paused=await page.evaluate(()=>window.neonRelay.storyAnimationSnapshot());
 await page.waitForTimeout(250);assert.deepEqual(await page.evaluate(()=>window.neonRelay.storyAnimationSnapshot()),paused);
 await page.locator('#game').screenshot({path:'docs/evidence/story-animations-20261104/nick-intro.png'});
 // Capture while paused: a loaded CI host can finish the short intro during
 // screenshot encoding, hiding the skip button before the next action.
 await page.locator('#start').click();
 await page.locator('#story-animation-skip').click();await page.waitForFunction(()=>window.neonRelay.storyAnimationSnapshot().phase===null);
 assert.equal((await page.evaluate(()=>window.neonRelay.replay().frames.length)),0);
 assert.equal((await page.evaluate(()=>window.neonRelay.snapshot().winner)),null);
 await page.locator('#reset').click();await page.waitForFunction(()=>window.neonRelay.storySnapshot().opponent==='nick'&&!window.neonRelay.storySnapshot().launching);
 await page.keyboard.press('Enter');await page.waitForFunction(()=>window.neonRelay.storyAnimationSnapshot().clip==='nick-juicy');
 assert.equal((await page.evaluate(()=>window.neonRelay.replay().frames.length)),0);
 assert.equal(before.replay.frames.length,0);
 // A failed scene load must leave the controller's retry gate usable.
 const retryContext=await browser.newContext({storageState:await context.storageState()}),retryPage=await retryContext.newPage();
 await retryPage.route('**/story-animations/nick-juicy.png',route=>route.fulfill({status:404,body:'missing test fixture'}));
 await retryPage.goto(base);await retryPage.waitForFunction(()=>document.querySelector('#start-fight')?.disabled===false);
 await retryPage.locator('#story-worlds').click();await retryPage.locator('#partner-confirm').click();await retryPage.locator('#journey-actions button').first().click();await retryPage.locator('#journey-actions button').first().click();
 await retryPage.waitForFunction(()=>document.querySelector('#journey-title').textContent==='This match could not load.');
 assert.equal(await retryPage.locator('#start').isDisabled(),false);
 await retryPage.unroute('**/story-animations/nick-juicy.png');await retryPage.locator('#journey-actions button').first().click();
 await retryPage.waitForFunction(()=>window.neonRelay.storySnapshot().opponent==='nick'&&!window.neonRelay.storySnapshot().launching);
 await retryPage.keyboard.press('Enter');await retryPage.waitForFunction(()=>window.neonRelay.storyAnimationSnapshot().clip==='nick-juicy');
 await retryContext.close();
 // Run the finale through the browser UI with God Mode to isolate progression and inputs.
 await page.evaluate(async()=>{
  const {STORY_ENCOUNTERS,STORY_SAVE_KEY}=await import('/src/storyProgress.ts');
  const index=STORY_ENCOUNTERS.findIndex(e=>e.gauntlet==='final');
  localStorage.setItem(STORY_SAVE_KEY,JSON.stringify({version:3,cleared:STORY_ENCOUNTERS.slice(0,index).map(e=>e.id),unlocked:['highsproto'],godModeUnlocked:false}));
 });
 await page.reload();await page.waitForFunction(()=>document.querySelector('#start-fight')?.disabled===false);
 await page.locator('#settings').click();await page.locator('#testing-god-mode').check();await page.locator('#close-settings').click();
 await page.locator('#story-worlds').click();await page.locator('#partner-confirm').click();await page.locator('#journey-actions button').first().click();await page.locator('#journey-actions button').first().click();
 await page.waitForFunction(()=>window.neonRelay.storySnapshot().opponent==='vela'&&!window.neonRelay.storySnapshot().launching);
 const regularBouts=[];
 async function winRegularBout({opponent}){
  const maxCombatFrames=7200,wallCapMs=120000,started=Date.now(),recent=[];
  let initialFrame=null,heldWalk=null,attempts=0,last=null;
  const read=()=>page.evaluate(()=>{
   const state=window.neonRelay.snapshot();
   return {frame:state.frame,winner:state.winner,godMode:!!state.godMode,
    fighters:state.fighters.map(f=>({id:f.id,x:f.x,hp:f.hp,move:f.move?.id??null,age:f.move?.t??0,stun:f.stun,blockstun:f.blockstun})),
    storyOpponent:window.neonRelay.storySnapshot().opponent,scene:window.neonRelay.storyAnimationSnapshot(),
    presentation:window.neonRelay.presentationSnapshot(),bossStarts:window.neonRelay.replay().bossStarts??[],visibility:document.visibilityState};
  });
  const diagnostic=()=>JSON.stringify({opponent,attempts,elapsedMs:Date.now()-started,initialFrame,maxCombatFrames,recent});
  try{
   await page.bringToFront();await page.keyboard.press('Enter');
   await page.waitForFunction(()=>window.neonRelay.snapshot().frame>0||window.neonRelay.replay().bossStarts?.length,null,{timeout:Math.min(30000,wallCapMs)});
   while(Date.now()-started<wallCapMs){
    last=await read();initialFrame??=last.frame;recent.push(last);if(recent.length>6)recent.shift();
    assert.equal(last.storyOpponent,opponent,'regular-bout fixture changed opponent: '+diagnostic());
    assert.equal(last.godMode,true,'regular-bout fixture lost UI-enabled God Mode: '+diagnostic());
    assert.equal(last.bossStarts.length,0,'boss entry occurred before an observed regular KO: '+diagnostic());
    if(last.winner===0){
     assert.equal(last.fighters[1].hp,0,'expected an actual regular-bout KO: '+diagnostic());
     regularBouts.push({opponent,outcome:'ko',attempts,combatFrames:last.frame-initialFrame,elapsedMs:Date.now()-started,frame:last.frame});return;
    }
    assert.equal(last.winner,null,'player failed to win the regular bout: '+diagnostic());
    assert.ok(last.frame-initialFrame<maxCombatFrames,'regular bout exceeded combat-frame cap: '+diagnostic());
    const [player,rival]=last.fighters,walk=Math.abs(rival.x-player.x)>155?(rival.x>player.x?'KeyD':'KeyA'):null;
    if(heldWalk!==walk){if(heldWalk)await page.keyboard.up(heldWalk);if(walk)await page.keyboard.down(walk);heldWalk=walk;}
    await page.keyboard.press('KeyP');attempts++;
    // Let real gameplay advance; wall-clock key counts are not evidence of a KO.
    await page.waitForFunction(frame=>window.neonRelay.snapshot().frame>=frame+6||window.neonRelay.snapshot().winner!==null||window.neonRelay.replay().bossStarts?.length,last.frame,{timeout:Math.max(1,Math.min(10000,wallCapMs-(Date.now()-started)))});
   }
   assert.fail('regular bout exceeded wall-clock cap: '+diagnostic());
  }catch(error){throw new Error('Story regular-bout verification failed: '+diagnostic(),{cause:error});}
  finally{if(heldWalk)await page.keyboard.up(heldWalk);}
 }
 await page.evaluate(()=>{
  const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
  window.blackoutPixel=null;window.blackoutPaint=null;
  const observe=()=>{
   if(window.neonRelay.storyAnimationSnapshot().blackout>0){
    // Observe a following painted frame, not merely the transition's state flag.
    requestAnimationFrame(()=>{
     const scene=window.neonRelay.storyAnimationSnapshot();
     if(scene.blackout<=0){requestAnimationFrame(observe);return;}
     window.blackoutPixel=[...ctx.getImageData(640,360,1,1).data];
     window.blackoutPaint={frame:window.neonRelay.snapshot().frame,blackout:scene.blackout,pixel:window.blackoutPixel};
    });return;
   }
   requestAnimationFrame(observe);
  };
  requestAnimationFrame(observe);
 });
 await winRegularBout({opponent:'vela'});
 try{await page.waitForFunction(()=>Array.isArray(window.blackoutPixel),null,{timeout:15000});}
 catch(error){throw new Error('No painted pre-boss blackout after regular KO: '+JSON.stringify(await page.evaluate(()=>({state:window.neonRelay.snapshot().winner,scene:window.neonRelay.storyAnimationSnapshot(),presentation:window.neonRelay.presentationSnapshot(),paint:window.blackoutPaint}))),{cause:error});}
 assert.deepEqual(await page.evaluate(()=>window.blackoutPixel),[0,0,0,255],'pre-boss blackout must paint opaque black');
 await page.waitForFunction(()=>window.neonRelay.storyAnimationSnapshot().phase==='boss');
 assert.equal(await page.evaluate(()=>window.neonRelay.storySnapshot().wave),0);
 await page.locator('#story-animation-skip').click();
 await page.waitForFunction(()=>window.neonRelay.replay().bossStarts?.length===1);
 await page.locator('#settings').click();
 const pausedFrame=await page.evaluate(()=>window.neonRelay.snapshot().frame);
 await page.locator('#testing-god-mode').uncheck();
 assert.equal(await page.evaluate(()=>!!window.neonRelay.snapshot().godMode),false);
 assert.equal(await page.evaluate(()=>window.neonRelay.snapshot().frame),pausedFrame);
 await page.locator('#testing-god-mode').check();
 assert.equal(await page.evaluate(()=>window.neonRelay.snapshot().frame),pausedFrame);
 await page.locator('#close-settings').click();
 const floor=await page.evaluate(()=>window.neonRelay.snapshot().fighters[0].y);
 await page.keyboard.down('KeyW');
 await page.waitForFunction(floor=>window.neonRelay.snapshot().fighters[0].y<floor,floor);
 await page.keyboard.up('KeyW');
 await page.waitForFunction(()=>window.neonRelay.snapshot().fighters[0].input===0);
 await page.keyboard.down('ArrowUp');
 await page.waitForFunction(()=>window.neonRelay.snapshot().fighters[0].airJumps===1);
 await page.keyboard.up('ArrowUp');
 await page.keyboard.down('KeyC');await page.keyboard.down('KeyV');
 await page.waitForFunction(()=>['bossBeam','bossBall'].every(shape=>window.neonRelay.snapshot().projectiles.some(p=>p.shape===shape)));
 await page.keyboard.up('KeyC');await page.keyboard.up('KeyV');
 assert.equal(await page.evaluate(()=>window.neonRelay.verifyReplay()),true);
 await page.waitForFunction(()=>window.neonRelay.storyAnimationSnapshot().phase==='mecha');
 assert.equal(await page.evaluate(()=>window.neonRelay.storySnapshot().wave),0);
 await page.locator('#story-animation-skip').click();
 await page.waitForFunction(()=>window.neonRelay.replay().bossStarts?.length===2);
 assert.equal(await page.evaluate(()=>window.neonRelay.verifyReplay()),true);
 await page.waitForFunction(()=>window.neonRelay.storyAnimationSnapshot().clip==='morelight-ejection');
 await page.locator('#story-animation-skip').click();
 await page.waitForFunction(()=>window.neonRelay.storySnapshot().opponent==='vaudream'&&!window.neonRelay.storySnapshot().launching);
 await winRegularBout({opponent:'vaudream'});
 await page.waitForFunction(()=>window.neonRelay.replay().bossStarts?.[0]?.form==='vmu');
 assert.equal(await page.evaluate(()=>window.neonRelay.storyAnimationSnapshot().phase),null);
 assert.equal(await page.evaluate(()=>window.neonRelay.storySnapshot().completed),false);
 await page.waitForFunction(()=>window.neonRelay.storyAnimationSnapshot().clip==='vmu-shield');
 await page.waitForFunction(()=>window.neonRelay.storyAnimationSnapshot().clip==='vmu-black-hole');
 assert.equal(await page.evaluate(()=>window.neonRelay.storySnapshot().completed),false);
 await page.waitForFunction(()=>document.querySelector('#journey-title').textContent.includes('Congratulations'));
 assert.equal(await page.evaluate(()=>window.neonRelay.storySnapshot().completed),true);
 assert.equal(await page.evaluate(()=>window.neonRelay.verifyReplay()),true);
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
 writeFileSync('docs/evidence/story-animations-20261104/browser.json',JSON.stringify({playback,regularBouts,blackoutPaint:await page.evaluate(()=>window.blackoutPaint),nickIntro:{pause:true,skip:true,retry:true,combatFrames:0,failedLoadRetry:true},morelightBoss:{progression:true,keyboardWeapons:true,replay:true,liveGodModeToggle:true},errors,failures},null,2)+'\n');
 console.log('PASS: all cinematic and attack atlases decoded and rendered in Chrome; nine bounded scene playlists; actual Nick intro pause, skip, retry and input/replay isolation; actual Morelight and VMU boss progression, C/V, replay, and portal victory.');
}finally{await browser.close();await server?.close();}
