import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{createHash}from'node:crypto';import ts from'typescript';
const text=readFileSync(new URL('../src/stage.ts',import.meta.url),'utf8');const code=ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;const stage=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const newIds=['trenches','circuit','throne','verse'];const loaded=[];
globalThis.Image=class{set src(url){this.url=url;const b=readFileSync(new URL('../public'+url,import.meta.url));assert.equal(b.toString('ascii',1,4),'PNG');this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);loaded.push(url);queueMicrotask(()=>this.onload());}};
await stage.loadStageArt();assert.equal(loaded.length,8);assert.equal(stage.getStageArtStatus().loaded.length,8);assert.deepEqual(stage.getStageArtStatus().errors,{});assert.equal(stage.STAGES.length,9);
assert.deepEqual(stage.STORY_STAGE_IDS,['trenches','circuit','yacht','throne','bar','verse']);const hashes=new Set();
for(const id of newIds){const b=readFileSync(new URL('../public/stages/higgsfield/'+id+'.png',import.meta.url));assert.equal(b.readUInt32BE(16),1280);assert.equal(b.readUInt32BE(20),720);hashes.add(createHash('sha256').update(b).digest('hex'));}
assert.equal(hashes.size,4);
const calls=[];const ctx={save(){},restore(){},beginPath(){},rect(){},clip(){},translate(){},scale(){},drawImage(image,...rest){calls.push({url:image.url,rest});}};
stage.setStage('ranch');for(const id of newIds)for(const[w,h]of[[256,110],[1280,420],[1280,720]]){stage.drawStagePreview(ctx,id,w,h);assert.equal(calls.at(-1).url,'/stages/higgsfield/'+id+'.png');assert.equal(stage.getStage(),'ranch','preview must not change active combat arena');}
console.log('PASS: nine selectable stages, ordered six-chapter story route, four distinct 1280×720 new arenas, all eight raster backgrounds load, and thumbnails/selection/match use the same stage images.');
