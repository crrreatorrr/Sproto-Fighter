// Browser check for src/audio.ts: no audio context exists before the player does anything,
// the first input unlocks it, menu feedback then plays, the recorded menu theme loops
// for 57.6s without restarting when options opens, and the volume sliders save.
// The Trenches fight theme is a recorded loop. This checks that it starts, wraps on the
// musical length, and stops when the player leaves. It cannot tell how anything sounds.
import {chromium} from 'playwright';
import {createServer} from 'vite';
import assert from 'node:assert/strict';
const server=process.env.BASE_URL?null:await createServer({server:{host:'127.0.0.1',port:0},logLevel:'error'});
if(server)await server.listen();
const base=process.env.BASE_URL||'http://127.0.0.1:'+server.httpServer.address().port+'/';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined}).catch(async error=>{await server?.close();throw error;});
const page=await browser.newPage({viewport:{width:1400,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
let checks=0;const check=(name,ok)=>{assert.ok(ok,name);checks++;console.log('PASS:',name);};
try{
 await page.goto(base);
 await page.waitForFunction(()=>window.neonRelay&&document.querySelector('#start-fight')?.disabled===false,null,{timeout:60000});
 const status=()=>page.evaluate(()=>window.neonRelay.audioStatus());
 const before=await status();
 check('no audio context is created before the first input',before.context==='none'&&before.played===0);
 check('the menu loop is already selected, waiting for the unlock',before.track==='menu');
 await page.keyboard.press('ArrowRight');
 await page.waitForFunction(()=>window.neonRelay.audioStatus().unlocked,null,{timeout:5000});
 check('the first key press unlocks the context',(await status()).context==='running');
 const unlocked=(await status()).played;
 await page.focus('#start-fight');await page.waitForTimeout(120);
 await page.keyboard.press('ArrowUp');await page.waitForTimeout(120);
 const moved=await status();
 check('menu movement plays feedback once unlocked',moved.played>unlocked&&moved.lastSound==='menuMove');
 const burstAt=(await status()).played;
 for(let i=0;i<4;i++){await page.keyboard.press('ArrowDown');await page.waitForTimeout(40);}
 check('fast menu moves each retrigger the click',(await status()).played>=burstAt+4);
 await page.waitForFunction(()=>{
  const loop=window.neonRelay.audioStatus().menuLoop;
  return !!loop&&Math.abs(loop.end-loop.start-57.6)<0.001;
 },null,{timeout:8000});
 const looped=await status();
 check('the menu theme loops for 30 bars with encoder padding trimmed',Math.abs(looped.menuLoop.end-looped.menuLoop.start-57.6)<0.001&&looped.menuStarts>=1);
 await page.click('#settings');
 await page.waitForSelector('#controls-dialog[open]');
 const duringOptions=await status();
 check('opening options does not restart the menu theme',duringOptions.track==='menu'&&duringOptions.menuStarts===looped.menuStarts);
 await page.$eval('#volume-music',slider=>{slider.value='20';slider.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.$eval('#volume-sfx',slider=>{slider.value='0';slider.dispatchEvent(new Event('input',{bubbles:true}));});
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sproto-arena-audio')));
 check('volume sliders save on this browser',saved.music===.2&&saved.sfx===0&&saved.master===.8);
 const muted=(await status()).played;
 await page.click('#close-settings');await page.focus('#start-fight');await page.keyboard.press('ArrowUp');await page.waitForTimeout(120);
 check('effects at zero volume play nothing',(await status()).played===muted);
 await page.click('#start-fight');
 await page.waitForSelector('#partner-picker:not([hidden])',{timeout:15000});
 const picking=await status();
 check('partner select keeps the same menu theme',picking.track==='menu'&&picking.menuStarts===looped.menuStarts&&!!picking.menuLoop);
 await page.click('#partner-confirm');
 await page.waitForFunction(()=>{const s=window.neonRelay.audioStatus();return s.track==='fight'&&!s.menuLoop;},null,{timeout:30000});
 check('starting a fight fades the menu theme out',true);
 await page.reload();
 await page.waitForFunction(()=>window.neonRelay&&document.querySelector('#start-fight')?.disabled===false,null,{timeout:60000});
 check('saved volumes are restored after a reload',await page.$eval('#volume-music',slider=>slider.value)==='20');
 await page.keyboard.press('ArrowRight');
 await page.waitForFunction(()=>window.neonRelay.audioStatus().unlocked,null,{timeout:5000});
 await page.click('#zone-rail button[data-zone="trenches"]');
 const duringMenu=await status();
 check('choosing Trenches does not start the fight theme while the menu is open',duringMenu.track==='menu'&&duringMenu.fightLoop===null);
 await page.click('#start-fight');
 await page.waitForSelector('#partner-confirm',{timeout:15000});
 check('the partner screen is still the menu, so the fight theme stays stopped',(await status()).track==='menu');
 await page.click('#partner-confirm');
 await page.waitForFunction(()=>{
  const audio=window.neonRelay.audioStatus();
  return audio.track==='fight'&&audio.fightBed==='trenches'&&audio.fightLoop&&audio.fightLoop.end>audio.fightLoop.start;
 },null,{timeout:60000});
 const playing=await status();
 const span=playing.fightLoop.end-playing.fightLoop.start;
 check('a Trenches fight plays the recorded loop for the musical length',Math.abs(span-45.000687)<1e-3&&playing.fightStarts===1);
 const seam=await page.evaluate(async()=>{
  const loop=window.neonRelay.audioStatus().fightLoop;
  const ctx=new AudioContext({sampleRate:loop.rate});
  const buf=await ctx.decodeAudioData(await (await fetch('audio/music/trenches_fight_loop.mp3')).arrayBuffer());
  const channel=buf.getChannelData(0);
  const start=Math.round(loop.start*buf.sampleRate), end=Math.round(loop.end*buf.sampleRate);
  const deltas=[];
  for(let i=Math.max(1,end-400);i<end;i++)deltas.push(Math.abs(channel[i]-channel[i-1]));
  deltas.sort((a,b)=>a-b);
  const p95=deltas[Math.floor(deltas.length*0.95)]||0;
  const jump=Math.abs(channel[end-1]-channel[start]);
  await ctx.close();
  return {samples:buf.length,start,end,jump,p95,rate:buf.sampleRate};
 });
 check('the loop points sit inside the decoded buffer',seam.samples===playing.fightLoop.samples&&seam.end<=seam.samples&&seam.end>seam.start);
 check('the wrap is no louder than a normal sample step',seam.jump<=seam.p95*2.5+1e-4);
 await page.$eval('#volume-music',slider=>{slider.value='0';slider.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.waitForFunction(()=>{const level=window.neonRelay.audioStatus().fightMusic;return level!==null&&level<0.02;},null,{timeout:2000});
 check('the music slider mutes the Trenches theme',(await status()).fightMusic<0.02);
 await page.$eval('#volume-music',slider=>{slider.value='20';slider.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.keyboard.press('Enter');
 await page.waitForFunction(()=>document.querySelector('.versus-screen')?.hidden!==false,null,{timeout:5000});
 const afterIntro=await status();
 check('the matchup screen does not restart the Trenches loop',afterIntro.track==='fight'&&afterIntro.fightStarts===1&&afterIntro.fightLoop);
 await page.click('#back-select');
 await page.waitForFunction(()=>window.neonRelay.audioStatus().track==='menu'&&window.neonRelay.audioStatus().fightLoop===null,null,{timeout:5000});
 const left=await status();
 check('leaving the fight stops the Trenches theme',left.track==='menu'&&left.fightLoop===null&&left.fightStarts===1);
 await page.click('#zone-rail button[data-zone="ranch"]');
 await page.click('#start-fight');
 await page.waitForSelector('#partner-confirm',{timeout:15000});
 await page.click('#partner-confirm');
 await page.waitForFunction(()=>{
  const audio=window.neonRelay.audioStatus();
  return audio.track==='fight'&&audio.fightBed==='synth'&&audio.fightLoop===null;
 },null,{timeout:60000});
 check('a Ranch fight keeps the synthesised loop',(await status()).fightBed==='synth'&&(await status()).fightLoop===null);
 await page.keyboard.press('Enter');
 await page.waitForFunction(()=>document.querySelector('.versus-screen')?.hidden!==false,null,{timeout:5000});
 await page.click('#back-select');
 await page.waitForFunction(()=>window.neonRelay.audioStatus().track==='menu'&&window.neonRelay.audioStatus().fightLoop===null,null,{timeout:5000});
 const grooves=[
  {zone:'yacht',bed:'yacht',seconds:61.44,gain:10**(0.4/20),seam:true,file:'audio/music/yacht_groove_loop.mp3'},
  {zone:'circuit',bed:'city',seconds:61.44,gain:1,seam:false,file:'audio/music/city_house_loop_v2.mp3'},
  {zone:'throne',bed:'castle',seconds:61.44,gain:1,seam:true,file:'audio/music/castle_vampire_loop_v2.mp3'},
  {zone:'verse',bed:'verse',seconds:61.44,gain:1,seam:true,file:'audio/music/verse_futuristic_loop_v3.mp3'},
  {zone:'bar',bed:'bar',seconds:61.44,gain:1,seam:true,file:'audio/music/bar_rock_loop.mp3'},
 ];
 for(const spec of grooves){
  await page.click(`#zone-rail button[data-zone="${spec.zone}"]`);
  await page.click('#start-fight');
  await page.waitForSelector('#partner-confirm',{timeout:15000});
  await page.click('#partner-confirm');
  await page.waitForFunction(bed=>{
   const audio=window.neonRelay.audioStatus();
   return audio.track==='fight'&&audio.fightBed===bed&&audio.fightLoop&&audio.fightLoop.end>audio.fightLoop.start;
  },spec.bed,{timeout:60000});
  const playing=await status();
  const span=playing.fightLoop.end-playing.fightLoop.start;
  const musical=Math.min(spec.seconds, playing.fightLoop.samples/playing.fightLoop.rate);
  check(`${spec.bed} loops the trimmed musical length`,Math.abs(span-musical)<1e-4);
  const music=await page.$eval('#volume-music',slider=>Number(slider.value)/100);
  check(`${spec.bed} follows the music slider and its trim`,Math.abs(playing.fightMusic-music*spec.gain)<0.02);
  const seam=await page.evaluate(async file=>{
   const loop=window.neonRelay.audioStatus().fightLoop;
   const ctx=new AudioContext({sampleRate:loop.rate});
   const buf=await ctx.decodeAudioData(await (await fetch(file)).arrayBuffer());
   const channel=buf.getChannelData(0);
   const start=Math.round(loop.start*buf.sampleRate), end=Math.round(loop.end*buf.sampleRate);
   const deltas=[];
   for(let i=Math.max(1,end-400);i<end;i++)deltas.push(Math.abs(channel[i]-channel[i-1]));
   deltas.sort((a,b)=>a-b);
   const p95=deltas[Math.floor(deltas.length*0.95)]||0;
   const jump=Math.abs((end>0?channel[end-1]:0)-(start<channel.length?channel[start]:0));
   await ctx.close();
   return {samples:buf.length,start,end,jump,p95};
  },spec.file);
  const capped=Math.min(spec.seconds, seam.samples/playing.fightLoop.rate);
  check(`${spec.bed} loop points sit inside the decoded buffer`,seam.end<=seam.samples&&seam.end>seam.start&&Math.abs((seam.end-seam.start)/playing.fightLoop.rate-capped)<1e-4);
  if(spec.seam)check(`${spec.bed} wrap is no louder than a normal sample step`,seam.jump<=seam.p95*2.5+1e-4);
  else check(`${spec.bed} keeps the musical length and leaves the encoder tail outside it`,seam.samples>=seam.end&&seam.end-seam.start===Math.round(spec.seconds*playing.fightLoop.rate));
  await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('.versus-screen')?.hidden!==false,null,{timeout:5000});
  await page.click('#back-select');
  await page.waitForFunction(()=>window.neonRelay.audioStatus().track==='menu'&&window.neonRelay.audioStatus().fightLoop===null,null,{timeout:5000});
  check(`leaving a ${spec.bed} fight stops the theme`,(await status()).track==='menu'&&(await status()).fightLoop===null);
 }
 assert.deepEqual(errors,[],'no page errors');
 console.log(`${checks} audio checks passed in headless Chromium. Output quality is for human ears.`);
}finally{await browser.close();await server?.close();}
