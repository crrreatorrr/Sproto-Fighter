import {describe,it,expect,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {STORY_ENCOUNTERS,createStoryProgress} from '../src/storyProgress';

// Execute the actual main-loop integration function, with network I/O replaced.
const source=readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');
const file=ts.createSourceFile('main.ts',source,ts.ScriptTarget.Latest,true);
const declaration=file.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='reportRound')!;
const code=ts.transpileModule(declaration.getText(file),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
describe('expanded campaign hub reporting',()=>{
 it('awards the chapter event at chapter completion, not on every encounter',()=>{
  const progress=createStoryProgress(null),onRoundEnd=vi.fn();
  const firstChapter=STORY_ENCOUNTERS.filter(e=>e.chapter===1);
  let active=firstChapter[0];
  const context={hub:{connected:true,onRoundEnd},state:{winner:0},mode:'cpu',chosen:'highsproto',matchGodMode:false,
   story:{snapshot:()=>({encounter:active,active:active.stage,wave:active.opponents.length-1})},
   storyProgress:progress,STORY_ENCOUNTERS,selection:{getSetup:()=>({stage:'ranch'})},hubToast(){}};
  vm.createContext(context);vm.runInContext(code,context);
  for(const encounter of firstChapter){
   active=encounter;expect(progress.begin(encounter.index)).toBe(true);
   for(let wave=0;wave<encounter.opponents.length;wave++)expect(progress.win(encounter.index,wave)).toBe(true);
   vm.runInContext('reportRound()',context);
   expect(onRoundEnd.mock.lastCall?.[0].storyWorld).toBe(encounter===firstChapter.at(-1)?1:null);
  }
  context.matchGodMode=true;vm.runInContext('reportRound()',context);
  expect(onRoundEnd.mock.lastCall?.[0].assisted).toBe(true);
  context.hub.connected=false;const count=onRoundEnd.mock.calls.length;vm.runInContext('reportRound()',context);
  expect(onRoundEnd).toHaveBeenCalledTimes(count);
 });
});
