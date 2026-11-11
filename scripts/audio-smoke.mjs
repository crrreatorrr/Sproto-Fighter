// Browser check for src/audio.ts: no audio context exists before the player does anything,
// the first input unlocks it, menu feedback then plays, and the volume sliders save.
// Sound is synthesised, so this needs no audio files. It cannot tell how anything sounds.
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
 await page.click('#settings');
 await page.waitForSelector('#controls-dialog[open]');
 await page.$eval('#volume-music',slider=>{slider.value='20';slider.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.$eval('#volume-sfx',slider=>{slider.value='0';slider.dispatchEvent(new Event('input',{bubbles:true}));});
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sproto-arena-audio')));
 check('volume sliders save on this browser',saved.music===.2&&saved.sfx===0&&saved.master===.8);
 const muted=(await status()).played;
 await page.click('#close-settings');await page.focus('#start-fight');await page.keyboard.press('ArrowUp');await page.waitForTimeout(120);
 check('effects at zero volume play nothing',(await status()).played===muted);
 await page.reload();
 await page.waitForFunction(()=>window.neonRelay&&document.querySelector('#start-fight')?.disabled===false,null,{timeout:60000});
 check('saved volumes are restored after a reload',await page.$eval('#volume-music',slider=>slider.value)==='20');
 assert.deepEqual(errors,[],'no page errors');
 console.log(`${checks} audio checks passed in headless Chromium. Output quality is for human ears.`);
}finally{await browser.close();await server?.close();}
