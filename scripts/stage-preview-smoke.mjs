// The menu and the live arena must use the same scenery without preview side effects.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const code=ts.transpileModule(readFileSync(new URL('../src/stage.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const ctx=()=>new Proxy({calls:[]},{get(target,key){if(key in target)return target[key];return (...args)=>target.calls.push([key,...args]);},set(target,key,value){target[key]=value;return true;}});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>ctx()})};
globalThis.Image=class {set src(url){this.url=url;queueMicrotask(()=>this.onload());}};
const stage=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
await stage.loadStageArt();
assert.deepEqual(stage.getStageArtStatus().loaded,stage.STAGES.map(s=>s.id));
assert.deepEqual(stage.getStageArtStatus().errors,{});
stage.setStage('ranch');
for(const id of stage.STAGES.map(s=>s.id)){
 const preview=ctx();stage.drawStagePreview(preview,id,320,180);
 assert.equal(stage.getStage(),'ranch','preview must not switch the fight stage');
 assert.deepEqual(preview.calls.find(x=>x[0]==='scale'),['scale',.25,.25]);
 const image=preview.calls.find(x=>x[0]==='drawImage')[1];
 assert.equal(image.url,`/stages/higgsfield/${id}.png`);
 stage.setStage(id);const arena=ctx();stage.drawStage(arena,100);
 assert.equal(arena.calls.find(x=>x[0]==='drawImage')[1],image,'arena and preview must share the exact loaded image');
 assert.equal(arena.calls.filter(x=>x[0]==='fillText').length,0,'loaded art must not show a placeholder warning');
 stage.setStage('ranch');
}
const ranch=ctx();stage.drawStagePreview(ranch,'ranch',640,360);assert.ok(ranch.calls.some(x=>x[0]==='drawImage'));
assert.equal(stage.getStage(),'ranch');
const wide=ctx();stage.drawStagePreview(wide,'yacht',1280,420);
assert.deepEqual(wide.calls.find(x=>x[0]==='scale'),['scale',1,1],'wide preview preserves scenery proportions');
assert.ok(wide.calls.some(x=>x[0]==='clip'),'cover crop is clipped to its preview panel');
console.log('PASS: all installed previews render; generated images match actual arena selections; preview never mutates selected stage.');

// A missing optional scenery image leaves the procedural stage usable.
globalThis.Image=class {set src(url){this.url=url;queueMicrotask(()=>this.onerror());}};
const fallback=await import('data:text/javascript;base64,'+Buffer.from(code+'\n// isolated missing-image fixture').toString('base64'));
await fallback.loadStageArt();
assert.equal(Object.keys(fallback.getStageArtStatus().errors).length,stage.STAGES.length);
fallback.setStage('castle');const scene=ctx();fallback.drawStage(scene,0);
assert.ok(scene.calls.some(x=>x[0]==='drawImage'));
assert.ok(scene.calls.some(x=>x[0]==='fillText'&&x[1].includes('PLACEHOLDER')));
console.log('PASS: missing optional images retain a usable, labeled procedural stage. No aesthetic claim from this test.');
