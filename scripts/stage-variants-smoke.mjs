import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import ts from 'typescript';
const compiled=ts.transpileModule(readFileSync(new URL('../src/stageVariants.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const {STORY_LOCATIONS,storyLocationForEncounter,loadStoryLocation,drawStoryLocation}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const added=['zone-variety','zone-variety-2','bar-blue-terrace'].flatMap(folder=>JSON.parse(readFileSync(new URL('../art/'+folder+'/art-report.json',import.meta.url),'utf8'))).map(x=>({...x,id:'zone-variety-'+x.id}));
const replacements=JSON.parse(readFileSync(new URL('../art/bar-reference-rebuild/art-report.json',import.meta.url),'utf8'));
const manifest=JSON.parse(readFileSync(new URL('../public/stages/variations-v2/manifest.json',import.meta.url),'utf8')).concat(added,JSON.parse(readFileSync(new URL('../art/ranch-nov02/art-report.json',import.meta.url),'utf8')),JSON.parse(readFileSync(new URL('../public/stages/nov04/manifest.json',import.meta.url),'utf8')));
assert.equal(STORY_LOCATIONS.length,112);assert.equal(new Set(STORY_LOCATIONS.map(l=>l.id)).size,112);
for(const l of STORY_LOCATIONS){const bytes=readFileSync(new URL('../public'+l.image,import.meta.url));assert.equal(bytes.readUInt32BE(16),l.width);assert.equal(bytes.readUInt32BE(20),l.height);assert.equal(createHash('sha256').update(bytes).digest('hex'),(replacements.find(m=>l.image==='/stages/higgsfield/'+m.id+'.png')??manifest.find(m=>m.id===l.id)).sha256);}
console.log('PASS: 112 stage PNGs resolve uniquely, preserve native dimensions and match recorded SHA-256 hashes.');
const stages=['trenches','circuit','yacht','ranch','throne','bar','verse','hatchery'];
const route=Array.from({length:240},(_,index)=>({index,id:`encounter-${index}`,stage:stages[Math.floor(index/30)]}));
const before=JSON.stringify(route),mapped=route.map(e=>storyLocationForEncounter(e,route));
assert.equal(JSON.stringify(route),before);assert.deepEqual(mapped,route.map(e=>storyLocationForEncounter(e,route)));assert.equal(new Set(mapped.filter(Boolean).map(l=>l.id)).size,112);
const regions={trenches:['trenches'],ranch:['ranch'],circuit:['circuit','retro'],yacht:['yacht'],throne:['castle','throne'],verse:['verse'],bar:['bar'],hatchery:['hatchery']};
for(const [i,e]of route.entries()){const l=mapped[i];assert.ok(regions[e.stage].includes(l.stage));}
for(const stage of Object.keys(regions)){const ids=route.filter(e=>e.stage===stage).map(e=>storyLocationForEncounter(e,route).id);const blocks=ids.filter((id,i)=>i===0||id!==ids[i-1]);assert.equal(new Set(blocks).size,blocks.length);}
assert.equal(storyLocationForEncounter({stage:'trenches',index:999},route),null);
console.log('PASS: all 112 locations occur in contiguous regional blocks across 240 encounters; opponent/save IDs remain unchanged; Bar and Hatchery now have variations.');
let loads=0;globalThis.Image=class{set src(value){loads++;queueMicrotask(()=>this.onload());}};
const first=STORY_LOCATIONS[0],calls=[],ctx={save(){},restore(){},drawImage(...a){calls.push(a);}};
assert.equal(drawStoryLocation(ctx,first),false);await Promise.all([loadStoryLocation(first),loadStoryLocation(first)]);assert.equal(loads,1);assert.equal(drawStoryLocation(ctx,first),true);assert.deepEqual(calls[0].slice(1),[0,0,1280,720]);await loadStoryLocation(first);assert.equal(loads,1);
console.log('PASS: loading deduplicates requests; unavailable art signals fallback; drawing uses unchanged arena coordinates. Visual floor alignment requires browser inspection.');
