// Browser check for src/audio.ts: no audio context exists before the player does anything,
// the first input unlocks it, menu feedback then plays, the recorded menu theme loops
// for 57.6s without restarting when options opens, and the volume sliders save.
// It cannot tell how anything sounds.
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
 assert.deepEqual(errors,[],'no page errors');
 console.log(`${checks} audio checks passed in headless Chromium. Output quality is for human ears.`);
}finally{await browser.close();await server?.close();}
