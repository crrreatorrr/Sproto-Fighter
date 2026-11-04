import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {bundledCore} from './lib/load.mjs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const compile=path=>ts.transpileModule(read(path),{
  compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022},
}).outputText;
const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const coreUrl=moduleUrl(bundledCore()), eventsUrl=moduleUrl(compile('src/animationEvents.ts'));
const core=await import(coreUrl);
const poses=await import(moduleUrl(compile('src/poseAtlas.ts')
  .replace("from './core'",`from '${coreUrl}'`)
  .replace("from './animationEvents'",`from '${eventsUrl}'`)));
const manifest=JSON.parse(read('public/fighters/pose-atlas.json'));
const refs=JSON.parse(read('art/roster-intake-named-nov03/references.json'));
const counts={intro:4,special:8,cast:4,recoil:4,defeat:12,dash:6,jump:6,heavy:8,airKick:6,victory:6};
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class {
  set src(url) {
    const buffer=readFileSync(new URL('../public'+url.split('?')[0],import.meta.url));
    this.naturalWidth=buffer.readUInt32BE(16);
    this.naturalHeight=buffer.readUInt32BE(20);
    queueMicrotask(()=>this.onload());
  }
};
const {A,FLOOR,ROSTER,PLAYABLE_FIGHTERS,bodyAtlasIds,createState,step}=core;
const {ensurePoseAtlases,getPoseAtlasDebug,setPoseAtlasPresentation,drawPoseAtlas}=poses;
const ctx={save(){},restore(){},translate(){},rotate(){},scale(){},drawImage(){}};
let cases=0;
for(const ref of refs){
  const {id,name}=ref;
  assert.equal(PLAYABLE_FIGHTERS.filter(fighter=>fighter===id).length,1,id);
  assert.equal(ROSTER[id].name,name);
  await ensurePoseAtlases([id,'rivet']);
  if(ref.identity==='existing')continue;
  assert.deepEqual(bodyAtlasIds(id),[id]);
  const cfg=manifest.fighters[id];
  assert.equal(cfg.frames.length,32);
  assert.equal(cfg.walkFrames.length,8);
  for(const [clip,count] of Object.entries(counts))assert.equal(cfg.clips[clip].length,count,`${id}/${clip}`);
  for(const facing of [-1,1]){
    function match(distance=400){
      const s=createState(id,'dummy','rivet');
      s.fighters[0].x=640;
      s.fighters[0].facing=facing;
      s.fighters[1].x=640+facing*distance;
      s.fighters[1].facing=-facing;
      return s;
    }
    function sample(s,seen){
      const fighter=s.fighters[0],before=JSON.stringify(s);
      const pose=getPoseAtlasDebug(fighter,s.frame,s.freeze>0);
      drawPoseAtlas(ctx,fighter,s.frame);
      assert.equal(JSON.stringify(s),before,`${id} draw does not change simulation`);
      const keys=seen.get(pose.sequence)??new Set();
      keys.add(pose.frameIndex);
      seen.set(pose.sequence,keys);
    }
    function action(clip,inputs,minFrames,distance=400){
      const s=match(distance),seen=new Map();
      for(let t=0;t<minFrames;t++){step(s,inputs(t));sample(s,seen);}
      const frames=seen.get(clip)?.size??0;
      assert.ok(frames>=2,`${id} facing ${facing} ${clip} played ${frames} drawings`);
      cases++;
      return {s,seen};
    }
    const front=facing===1?A.right:A.left,back=facing===1?A.left:A.right;
    for(const direction of [front,back]){
      const {s,seen}=action('walk',t=>[t<45?direction:0,0],55);
      assert.equal(seen.get('walk').size,8);
      assert.equal(s.fighters[0].vx,0);
      assert.equal(s.fighters[0].y,FLOOR);
    }
    action('dash',t=>[t===0?front|A.dash:0,0],40);
    const {s:jump}=action('jump',t=>[t===0?A.up:0,0],100);
    assert.equal(jump.fighters[0].y,FLOOR);
    action('airKick',t=>[t===0?A.up:t===9?A.heavy:0,0],100);
    action('heavy',t=>[t===0?A.heavy:0,0],100);
    action('cast',t=>[t===0?A.bolt:0,0],100);
    action('recoil',t=>[0,t===0?A.light:0],50,48);
    for(const input of [A.light,A.medium,A.down|A.light,A.down|A.heavy,A.launcher,A.grab]){
      const s=match(56),seen=new Map();
      step(s,[input,0]);
      assert.ok(s.fighters[0].move,`${id} input ${input} activates`);
      for(let t=0;t<120;t++){sample(s,seen);step(s,[0,0]);}
      assert.ok(seen.get('poses').size>=2,`${id} core pose path ${input}`);
      assert.equal(s.fighters[0].move,null);
      cases++;
    }
    const special=match(76),specialSeen=new Map();
    special.fighters[0].pips=3;
    step(special,[A.special,0]);
    let combo=0;
    for(let t=0;t<120;t++){
      sample(special,specialSeen);
      combo=Math.max(combo,special.fighters[0].combo);
      step(special,[0,0]);
    }
    assert.equal(combo,4,id);
    assert.equal(specialSeen.get('special').size,8);
    cases++;
    for(const [clip,phase,winner,fromFloor,n] of [
      ['intro','intro',null,false,4],
      ['victory','outro',0,false,6],
      ['defeat','outro',1,false,12],
      ['defeat','outro',1,true,8],
    ]){
      const s=match(),seen=new Map();
      for(let t=0;t<120;t++){
        setPoseAtlasPresentation({phase,frame:t,winner,fromFloor},s.fighters);
        sample(s,seen);
      }
      setPoseAtlasPresentation(null,[]);
      assert.equal(seen.get(clip)?.size,n,`${id} ${clip} playback`);
      cases++;
    }
  }
  console.log(`PASS: ${name} · full movement, attacks and round presentation in both facings.`);
}
console.log(`PASS: ${cases} animation scenarios across 25 new fighters and four existing portrait matches.`);
