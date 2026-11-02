import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{createHash}from'node:crypto';import ts from'typescript';
const text=readFileSync(new URL('../src/stage.ts',import.meta.url),'utf8');const code=ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;const stage=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const newIds=['trenches','circuit','throne','verse','hatchery','ranch'];const loaded=[];
globalThis.Image=class{set src(url){this.url=url;const b=readFileSync(new URL('../public'+url,import.meta.url));assert.equal(b.toString('ascii',1,4),'PNG');this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);loaded.push(url);queueMicrotask(()=>this.onload());}};
await stage.loadStageArt();assert.equal(loaded.length,10);assert.equal(stage.getStageArtStatus().loaded.length,10);assert.deepEqual(stage.getStageArtStatus().errors,{});assert.equal(stage.STAGES.length,10);
assert.deepEqual(stage.STORY_STAGE_IDS,['trenches','circuit','yacht','throne','bar','verse','hatchery']);const hashes=new Set();
for(const id of newIds){const b=readFileSync(new URL('../public/stages/higgsfield/'+id+'.png',import.meta.url));assert.equal(b.readUInt32BE(16),1280);assert.equal(b.readUInt32BE(20),720);hashes.add(createHash('sha256').update(b).digest('hex'));}
assert.equal(hashes.size,6);
const calls=[];const ctx={save(){},restore(){},beginPath(){},rect(){},clip(){},translate(){},scale(){},drawImage(image,...rest){calls.push({url:image.url,rest});}};
stage.setStage('ranch');for(const id of newIds)for(const[w,h]of[[256,110],[1280,420],[1280,720]]){stage.drawStagePreview(ctx,id,w,h);assert.equal(calls.at(-1).url,'/stages/higgsfield/'+id+'.png');assert.equal(stage.getStage(),'ranch','preview must not change active combat arena');}
console.log('PASS: ten selectable stages, ordered seven-chapter story route, six distinct 1280×720 new arenas, all ten raster backgrounds load, and thumbnails/selection/match use the same stage images.');

// A missing Ranch image must preserve playable procedural scenery without changing stage IDs.
const fallback=await import('data:text/javascript;base64,'+Buffer.from(code+'\n// fallback module instance').toString('base64'));
globalThis.Image=class{set src(url){this.url=url;queueMicrotask(()=>url.endsWith('/ranch.png')?this.onerror():this.onload());}};
await fallback.loadStageArt();assert.equal(fallback.getStageArtStatus().loaded.length,9);assert.ok(fallback.getStageArtStatus().errors.ranch);
const noop=()=>{};globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>new Proxy({}, {get:()=>noop})})};
const fallbackDraws=[];const fallbackCtx=new Proxy({drawImage:(...args)=>fallbackDraws.push(args)}, {get:(o,k)=>o[k]??noop});
fallback.setStage('ranch');fallback.drawStage(fallbackCtx,0);assert.equal(fallbackDraws.length,1);assert.equal(fallbackDraws[0][0].width,320);assert.equal(fallback.getStage(),'ranch');
console.log('PASS: Ranch image failure uses the original 320×180 procedural background.');
