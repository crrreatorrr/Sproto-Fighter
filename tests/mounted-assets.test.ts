import {afterEach,describe,it,expect,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';

const modules=['poseAtlas','higgsfieldRig','stage','stageVariants','powerArt','characterVoice','campaignMap'];
afterEach(()=>vi.unstubAllGlobals());
describe('root and hub-mounted public assets',()=>{
 for(const name of modules)it(name+' keeps its public art inside the selected mount',()=>{
  const source=readFileSync(new URL('../src/'+name+'.ts',import.meta.url),'utf8');
  const file=ts.createSourceFile(name+'.ts',source,ts.ScriptTarget.Latest,true);
  const asset=file.statements.find(n=>ts.isVariableStatement(n)&&n.declarationList.declarations.some(d=>d.name.getText(file)==='asset'))!;
  const code=ts.transpileModule(asset.getText(file),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
  for(const base of ['/', './', '/play/sproto-fighter/']){
   const context={document:{querySelector:()=>({content:base})}};vm.createContext(context);vm.runInContext(code,context);
   expect(vm.runInContext("asset('/fighters/example.png?v=1')",context)).toBe(base+'fighters/example.png?v=1');
  }
  const node={};vm.createContext(node);vm.runInContext(code,node);
  expect(vm.runInContext("asset('/fighters/example.png')",node)).toBe('/fighters/example.png');
 });
 it('loads every stage and story location through the mount, preserving canonical stage IDs',async()=>{
  vi.resetModules();const requested:string[]=[];
  vi.stubGlobal('document',{querySelector:()=>({content:'/play/sproto-fighter/'})});
  vi.stubGlobal('Image',class{onload=()=>{};onerror=()=>{};set src(url:string){requested.push(url);queueMicrotask(()=>this.onload());}});
  const stage=await import('../src/stage'),variants=await import('../src/stageVariants');
  await stage.loadStageArt(stage.STAGES.map(s=>s.id));
  await Promise.all(variants.STORY_LOCATIONS.map(s=>variants.loadStoryLocation(s)));
  expect(requested).toHaveLength(stage.STAGES.length+variants.STORY_LOCATIONS.length);
  expect(requested.every(s=>s.startsWith('/play/sproto-fighter/stages/'))).toBe(true);
  expect(stage.stageImageSource('ranch-orchard')).toBe('/stages/higgsfield/ranch-orchard.png');
 });
});
