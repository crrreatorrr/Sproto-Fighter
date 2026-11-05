import {chromium} from 'playwright';
import {createServer} from 'vite';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const server=await createServer({server:{host:'127.0.0.1',port:0}});await server.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':undefined)}).catch(async e=>{await server.close();throw e;});
const base='http://127.0.0.1:'+server.httpServer.address().port+'/',out=process.env.CAMPAIGN_BROWSER_OUTPUT,errors=[],failures=[];
if(out)mkdirSync(out,{recursive:true});
const context=await browser.newContext({viewport:{width:1500,height:1000}}),page=await context.newPage();
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failures.push([r.status(),r.url()]);});
try{
 await page.goto(base);await page.waitForFunction(()=>window.neonRelay&&!document.querySelector('#start-fight').disabled);
 const data=await page.evaluate(async()=>{
  const {STORY_ENCOUNTERS,STORY_SAVE_KEY,STARTER_FIGHTERS}=await import('/src/storyProgress.ts');
  const {STORY_LOCATIONS}=await import('/src/stageVariants.ts');
  localStorage.setItem(STORY_SAVE_KEY,JSON.stringify({version:3,cleared:STORY_ENCOUNTERS.map(e=>e.id),unlocked:[...STARTER_FIGHTERS,...STORY_ENCOUNTERS.flatMap(e=>e.opponents).filter(id=>!['sproto2616','sproto3152','sproto3215'].includes(id))],godModeUnlocked:true}));
  return {route:STORY_ENCOUNTERS,locations:STORY_LOCATIONS.filter(l=>l.id.startsWith('nov04-'))};
 });
 assert.equal(data.locations.length,48);assert.equal(new Set(data.route.flatMap(e=>e.opponents)).size,250);
 await page.reload();await page.waitForFunction(()=>window.neonRelay&&!document.querySelector('#start-fight').disabled);
 assert.equal(await page.locator('.stage-rail[aria-labelledby="variations-heading"] .stage-choice').count(),121);
 const selected=[];
 for(const zone of [...new Set(data.locations.map(l=>l.stage))]){
  await page.locator('#zone-rail [data-zone="'+zone+'"]').click();
  for(const location of data.locations.filter(l=>l.stage===zone)){
   await page.locator('.stage-rail[aria-labelledby="variations-heading"] [data-stage="'+location.id+'"]').click();
   assert.equal(await page.locator('#selected-stage-name').textContent(),location.title);
   await page.locator('#start-fight').click();await page.locator('#partner-confirm').click();await page.waitForFunction(title=>document.querySelector('#stage-title').textContent===title.toUpperCase(),location.title);
   assert.ok((await page.locator('#stage-title').textContent()).includes(location.title.toUpperCase()));
   await page.locator('.versus-skip').click();
   if(out)await page.locator('#game').screenshot({path:out+'/'+location.id+'-fight.png'});
   selected.push(location.id);await page.locator('#back-select').click({force:true});
  }
 }
 const storyChoices=[];
 for(const zone of [...new Set(data.locations.map(l=>l.stage))]){
  const encounter=data.route.find(e=>e.stage===zone);
  for(const location of data.locations.filter(l=>l.stage===zone)){
   await page.locator('#story-worlds').click();await page.locator('#partner-confirm').click();
   await page.locator('.campaign-node[data-encounter="'+encounter.id+'"]').click();
   await page.locator('.campaign-rival .primary').click();
   const picker=page.getByRole('combobox',{name:'Story scenery'});await picker.selectOption(location.id);
   await page.locator('#journey-actions button').first().click();
   await page.waitForFunction(title=>document.querySelector('#stage-subtitle').textContent.includes(title.toUpperCase()),location.title);
   assert.equal(await page.evaluate(()=>window.neonRelay.storySnapshot().encounter.id),encounter.id);
   await page.locator('.versus-skip').click();
   if(location.id.endsWith('-1')){
    await page.locator('#reset').click();await page.waitForFunction(()=>!window.neonRelay.storySnapshot().launching);
    assert.ok((await page.locator('#stage-subtitle').textContent()).includes(location.title.toUpperCase()));
    assert.equal(await page.evaluate(()=>window.neonRelay.storySnapshot().wave),0);
    await page.locator('.versus-skip').click();
   }
   storyChoices.push(location.id);await page.locator('#back-select').click({force:true});
  }
 }
 await page.locator('#story-worlds').click();await page.locator('#partner-confirm').click();
 const sizes=[];
 for(const [width,height] of [[1500,1000],[390,844]]){
  await page.setViewportSize({width,height});await page.locator('.campaign-fit').click();
  await page.waitForFunction(()=>document.querySelector('.campaign-art').complete&&document.querySelector('.campaign-art').naturalWidth===3840);
  const fit=await page.locator('.campaign-window').evaluate(el=>{const land=el.querySelector('.campaign-land');return {windowWidth:el.clientWidth,windowHeight:el.clientHeight,width:land.clientWidth,height:land.clientHeight,count:el.querySelectorAll('.campaign-node').length};});
  assert.equal(fit.count,247);assert.ok(fit.width<=fit.windowWidth&&fit.height<=fit.windowHeight);
  if(out)await page.locator('#journey-dialog').screenshot({path:out+'/map-'+width+'.png'});
  await page.locator('.campaign-current').click();assert.ok(Number(await page.locator('.campaign-zoom').inputValue())>100);
  assert.equal(await page.locator('.campaign-node[aria-pressed="true"]').count(),1);
  assert.equal(await page.locator('.campaign.is-overview').count(),0);
  assert.ok((await page.locator('.campaign-node[aria-pressed="true"]').boundingBox()).width>=20);sizes.push({width,height,...fit});
 }
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
 if(out)writeFileSync(out+'/verification.json',JSON.stringify({selected,storyChoices,sizes,errors,failures},null,2));
 console.log('PASS: all48 new stages launched from the actual main menu and story scenery chooser;121 selector entries;247 map nodes fit desktop/mobile; no failed requests or browser errors.');
}finally{await context.close();await browser.close();await server.close();}
