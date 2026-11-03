// Real renderer selection for individually inspected source poses. This is not
// live browser/motion approval. --preview validates the proposed mapping only.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import ts from 'typescript';

const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const hash=b=>createHash('sha256').update(b).digest('hex');
const dataUrl=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const compile=p=>ts.transpileModule(read(p).toString(),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const coreUrl=dataUrl(compile('src/core.ts')),eventsUrl=dataUrl(compile('src/animationEvents.ts'));
const core=await import(coreUrl);
const poses=await import(dataUrl(compile('src/poseAtlas.ts').replace("from './core'",`from '${coreUrl}'`).replace("from './animationEvents'",`from '${eventsUrl}'`)));
const manifest=JSON.parse(read('public/fighters/pose-atlas.json'));
const review=JSON.parse(read('art/movement-followup-20261102/paired-contact-root/review.json'));
const preview=process.argv.includes('--preview');

for(const finding of review.findings){
  const body=finding.body;
  const desired=finding.sourceIndices.map(index=>structuredClone(finding.before[index]));
  if(preview)manifest.fighters[body].clips[finding.clip]=desired;
  const installed=manifest.fighters[body].clips[finding.clip];
  assert.deepEqual(installed,desired,`${body}: reviewed mapping is not installed (use --preview only for a dry-run check)`);
  for(const [source,expected] of Object.entries(finding.reviewedSourceHashes)){
    assert.equal(hash(read('public'+source)),expected,`${body}: reviewed source pixels changed: ${source}`);
  }
  assert.equal(hash(read('public'+finding.approvedContactUrl)),finding.approvedContactSha256);
  const contract=review.samplerContract[finding.clip];
  for(const index of contract.activeSlots)assert.equal(installed[index].url,finding.approvedContactUrl,'every active slot uses inspected foot contact');
  for(const index of contract.startupSlots)assert.notEqual(installed[index].url,finding.approvedContactUrl,'full contact is not presented before startup completes');
}

globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>manifest});
globalThis.Image=class {
  set src(value){
    this.url=value;
    const b=read('public'+value.split('?')[0]);
    this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);
    queueMicrotask(()=>this.onload());
  }
};
const owners=[...new Set(review.findings.map(f=>f.owner))];
await poses.ensurePoseAtlases(owners);
let phaseFrames=0,activeContacts=0,rearCoverageFrames=0,recoveries=0;
const phaseCounts={startup:0,active:0,recovery:0},checkedBodies=new Set();
for(const finding of review.findings)for(const facing of [-1,1])for(const action of finding.clip==='heavy'?['heavy']:['airMedium','airHeavy']){
  const body=finding.body;
  const s=core.createState(finding.owner,'dummy'),f=s.fighters[0];
  f.x=640;f.y=action==='heavy'?core.FLOOR:core.FLOOR-100;f.facing=facing;
  const ids=core.bodyAtlasIds(f.id),lead=ids[facing===1?ids.length-1:0];
  const move=core.getMove(f,action),total=move.startup+move.active+move.recovery;
  const observedSlots=new Set();
  for(let age=0;age<total;age++){
    s.frame++;f.move={id:action,t:age,hit:false,connected:false,wave:-1,aim:'level'};
    const before=JSON.stringify(s),draws=[];
    const context={save(){},restore(){},translate(){},rotate(){},scale(){},drawImage(image){draws.push(image.url.split('?')[0]);}};
    const details=poses.getDuoPoseDebug(f,s.frame),selected=details.find(d=>d.entity===body);
    assert.ok(selected,`${body}: both entity identities must be available`);
    poses.drawPoseAtlas(context,f,s.frame);
    assert.equal(JSON.stringify(s),before,'sampling and painting must not mutate simulation state');
    assert.equal(draws.length,ids.length,'each complete paired body is drawn once');
    const phase=age<move.startup?'startup':age<move.startup+move.active?'active':'recovery';
    phaseCounts[phase]++;
    if(lead===body){
      assert.equal(selected.sequence,finding.clip,`${body}: correct action clip through every phase`);
      observedSlots.add(selected.frameIndex);
      const expected=manifest.fighters[body].clips[finding.clip][selected.frameIndex].url;
      assert.ok(draws.includes(expected),`${body}: actual paint uses the sampled complete-body frame`);
      assert.ok(review.samplerContract[finding.clip][phase+'Slots'].includes(selected.frameIndex),`${body}: ${phase} must sample its assigned timing slots`);
      if(phase==='active'){
        assert.equal(expected,finding.approvedContactUrl,`${body} ${action} age ${age}: held kick must match the inspected art`);
        activeContacts++;
      }
      checkedBodies.add(body+'/'+finding.clip);
    }else{
      assert.notEqual(selected.sequence,finding.clip,`${body}: rear member covers rather than duplicating the melee contact`);
      rearCoverageFrames++;
    }
    phaseFrames++;
  }
  if(lead===body)assert.deepEqual([...observedSlots].sort((a,b)=>a-b),finding.sourceIndices.map((_,i)=>i),'every authored timing slot must be exercised');
  f.move=null;f.y=core.FLOOR;f.vy=0;f.vx=0;
  for(let t=0;t<12;t++){
    core.step(s,[0,0]);
    poses.getDuoPoseDebug(f,s.frame);
  }
  for(const result of poses.getDuoPoseDebug(f,s.frame)){
    assert.equal(result.sequence,'poses',`${result.entity}: completed recovery leaves the action clip`);
    assert.ok([poses.POSE_SLOTS.guard,poses.POSE_SLOTS.breathe].includes(result.slot),`${result.entity}: completed recovery returns to neutral guard/breathing`);
  }
  recoveries++;
}
assert.equal(checkedBodies.size,review.findings.length,'each reviewed body supplied a real lead contact');
console.log(`${preview?'PREVIEW ONLY':'PASS'}: ${phaseFrames} rendered phase frames (${JSON.stringify(phaseCounts)}), ${activeContacts} reviewed active contacts, ${rearCoverageFrames} rear-cover frames, ${recoveries} recoveries; six reviewed clips across five paired bodies and actual owner facings. No live-motion approval.`);
