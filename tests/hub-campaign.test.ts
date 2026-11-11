import {describe,it,expect,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {STORY_ENCOUNTERS,createStoryProgress} from '../src/storyProgress';
import {BELT_OPPONENT,BELT_WORLD} from '../src/hub/config';
import {planFighterWin} from '../src/hub/report';

// Execute the actual main-loop integration function, with network I/O replaced.
const source=readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');
const file=ts.createSourceFile('main.ts',source,ts.ScriptTarget.Latest,true);
const declaration=file.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='reportRound')!;
const code=ts.transpileModule(declaration.getText(file),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
describe('expanded campaign hub reporting',()=>{
 it('awards the Belt event after Halloween 2008, without waiting for the chapter',()=>{
  const progress=createStoryProgress(null),onRoundEnd=vi.fn();
  const firstChapter=STORY_ENCOUNTERS.filter(e=>e.chapter===1);
  expect(firstChapter[0].opponent).toBe('zephyr');
  expect(firstChapter.length).toBeGreaterThan(1);
  let active=firstChapter[0];
  const context={hub:{connected:true,onRoundEnd},state:{winner:0},mode:'cpu',chosen:'highsproto',matchGodMode:false,godModeChanges:[],
   story:{snapshot:()=>({encounter:active,active:active.stage,wave:active.opponents.length-1})},
   storyProgress:progress,STORY_ENCOUNTERS,BELT_OPPONENT,BELT_WORLD,selection:{getSetup:()=>({stage:'ranch'})},hubToast(){}};
  vm.createContext(context);vm.runInContext(code,context);
  for(const encounter of firstChapter){
   active=encounter;expect(progress.begin(encounter.index)).toBe(true);
   for(let wave=0;wave<encounter.opponents.length;wave++)expect(progress.win(encounter.index,wave)).toBe(true);
   vm.runInContext('reportRound()',context);
   const win=onRoundEnd.mock.lastCall![0];
   expect(win.storyWorld).toBe(encounter===firstChapter[0]?1:null);
   expect(planFighterWin({...win,matchId:encounter.id}).filter(call=>call.kind==='event')).toHaveLength(encounter===firstChapter[0]?1:0);
  }
  context.matchGodMode=true;vm.runInContext('reportRound()',context);
  expect(onRoundEnd.mock.lastCall?.[0].assisted).toBe(true);
  context.hub.connected=false;const count=onRoundEnd.mock.calls.length;vm.runInContext('reportRound()',context);
  expect(onRoundEnd).toHaveBeenCalledTimes(count);
 });
 it('does not report a Belt event for a loss, draw, assisted win, or free play',()=>{
  const onRoundEnd=vi.fn(),encounter=STORY_ENCOUNTERS[0];
  const context={hub:{connected:true,onRoundEnd},state:{winner:0 as number|null},mode:'cpu',chosen:'highsproto',matchGodMode:false,godModeChanges:[] as {enabled:boolean}[],
   story:{snapshot:()=>({encounter:encounter as typeof encounter|null,active:encounter.stage,wave:0})},
   BELT_OPPONENT,BELT_WORLD,selection:{getSetup:()=>({stage:'ranch'})},hubToast(){}};
  vm.createContext(context);vm.runInContext(code,context);
  const events=()=>{
   vm.runInContext('reportRound()',context);
   return planFighterWin({...onRoundEnd.mock.lastCall![0],matchId:'first'}).filter(call=>call.kind==='event');
  };
  for(const winner of [1,2]){context.state.winner=winner;expect(events()).toEqual([]);}
  context.state.winner=0;context.matchGodMode=true;expect(events()).toEqual([]);
  context.matchGodMode=false;context.godModeChanges=[{enabled:true}];expect(events()).toEqual([]);
  context.godModeChanges=[];context.story.snapshot=()=>({encounter:null,active:encounter.stage,wave:0});expect(events()).toEqual([]);
  context.state.winner=null;const count=onRoundEnd.mock.calls.length;vm.runInContext('reportRound()',context);expect(onRoundEnd).toHaveBeenCalledTimes(count);
 });
});
