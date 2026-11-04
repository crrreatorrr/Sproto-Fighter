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
  const {default:manifest}=await import('/src/storyAnimationManifest.json');
  const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;
  const ctx=canvas.getContext('2d'),records=[];
  for(const id of ['nick','guest07','sproto943','vela','vaudream']){
   const animation=createStoryAnimation(),plan=storyAnimationPlan(id,true);await animation.load(plan);
   for(const phase of ['intro','outro']){
    if(!plan[phase].length)continue;
    if(!animation.start(phase))throw Error('Cannot start '+id+'/'+phase);
    const seen=[],boundaryChecks=[],referenceFramesChecked=new Set();let frames=0,visible=0,mechaEnd=null,ejectionEnd=null,smallMorelightHeight=null,mechaHeight=null;
    while(animation.active&&frames<10000){
     const snap=animation.snapshot();if(seen.at(-1)!==snap.clip)seen.push(snap.clip);
     ctx.clearRect(0,0,1280,720);animation.draw(ctx,1100,578,-1);
     if(id==='vela'&&phase==='outro'){
      const pixels=()=>ctx.getImageData(0,0,1280,720).data;
      const visibleHeight=data=>{let min=720,max=-1;for(let y=0;y<720;y++)for(let x=0;x<1280;x++)if(data[(y*1280+x)*4+3]){min=Math.min(min,y);max=Math.max(max,y);}return max-min+1;};
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
    if(animation.active)throw Error('Unbounded scene');
    if(id==='vela'&&phase==='outro'&&(boundaryChecks.length!==2||referenceFramesChecked.size!==manifest['morelight-ejection'].referenceMechaFrames))throw Error('Missing Morelight boundary/reference verification');
    records.push({id,phase,seen,frames,visible,boundaryChecks,...(smallMorelightHeight?{smallMorelightHeight,mechaHeight,referenceMechaFramesVerified:referenceFramesChecked.size}:{})});
   }
  }
  return records;
 });
 assert.equal(playback.length,6);for(const r of playback)assert.ok(r.visible>0,r.id);
 // Seed an isolated browser save immediately before Nick; use the actual story UI.
 await page.evaluate(async()=>{
  const {STORY_ENCOUNTERS,STORY_SAVE_KEY}=await import('/src/storyProgress.ts');
  const index=STORY_ENCOUNTERS.findIndex(e=>e.gauntlet==='nick-juicy');
  localStorage.setItem(STORY_SAVE_KEY,JSON.stringify({version:3,cleared:STORY_ENCOUNTERS.slice(0,index).map(e=>e.id),unlocked:['highsproto','bront'],godModeUnlocked:false}));
 });
 await page.reload();await page.waitForFunction(()=>document.querySelector('#start-fight')?.disabled===false);
 await page.locator('#story-worlds').click();await page.locator('#journey-actions button').first().click();await page.locator('#journey-actions button').first().click();
 await page.waitForFunction(()=>window.neonRelay.storySnapshot().opponent==='nick'&&!window.neonRelay.storySnapshot().launching);
 await page.keyboard.press('Enter');await page.waitForFunction(()=>window.neonRelay.storyAnimationSnapshot().phase==='intro');
 const before=await page.evaluate(()=>({state:window.neonRelay.snapshot(),replay:window.neonRelay.replay()}));
 await page.locator('#pause').click();const paused=await page.evaluate(()=>window.neonRelay.storyAnimationSnapshot());
 await page.waitForTimeout(250);assert.deepEqual(await page.evaluate(()=>window.neonRelay.storyAnimationSnapshot()),paused);
 await page.locator('#start').click();
 await page.locator('#game').screenshot({path:'docs/evidence/story-animations-20261104/nick-intro.png'});
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
 await retryPage.locator('#story-worlds').click();await retryPage.locator('#journey-actions button').first().click();await retryPage.locator('#journey-actions button').first().click();
 await retryPage.waitForFunction(()=>document.querySelector('#journey-title').textContent==='This match could not load.');
 assert.equal(await retryPage.locator('#start').isDisabled(),false);
 await retryPage.unroute('**/story-animations/nick-juicy.png');await retryPage.locator('#journey-actions button').first().click();
 await retryPage.waitForFunction(()=>window.neonRelay.storySnapshot().opponent==='nick'&&!window.neonRelay.storySnapshot().launching);
 await retryPage.keyboard.press('Enter');await retryPage.waitForFunction(()=>window.neonRelay.storyAnimationSnapshot().clip==='nick-juicy');
 await retryContext.close();
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
 writeFileSync('docs/evidence/story-animations-20261104/browser.json',JSON.stringify({playback,nickIntro:{pause:true,skip:true,retry:true,combatFrames:0,failedLoadRetry:true},errors,failures},null,2)+'\n');
 console.log('PASS: all 14 atlases decoded and rendered in Chrome; six bounded scene playlists; actual Nick intro pause, skip, retry and input/replay isolation.');
}finally{await browser.close();await server?.close();}
