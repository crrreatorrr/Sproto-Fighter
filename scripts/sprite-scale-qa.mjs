// All installed body cels + real pose/assist playback. No browser or art writes.
// Transform invariants are assertions. Silhouette/anatomy measurements are advisory.
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve, join} from 'node:path';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2), option = name => {
  const i = args.indexOf(name);
  if (i < 0) return null;
  assert.ok(args[i + 1] && !args[i + 1].startsWith('--'), `${name} needs a path`);
  return resolve(args[i + 1]);
};
const out = option('--out'), baselinePath = option('--baseline');
assert.ok(args.every((v, i) => ['--out', '--baseline'].includes(v) || ['--out', '--baseline'].includes(args[i - 1])), 'Usage: node scripts/sprite-scale-qa.mjs [--out directory] [--baseline report.json]');
const read = p => readFileSync(join(root, p), 'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');
const manifestText = read('public/fighters/pose-atlas.json'), manifest = JSON.parse(manifestText);
const sourcePaths = ['src/core.ts','src/poseAtlas.ts','src/spriteRoster.ts','src/teamSpecial.ts','src/animationEvents.ts','art/sprotos-expansion/process.py'];
const sourceTexts = Object.fromEntries(sourcePaths.map(path=>[path,read(path)]));
const auditScriptSha256 = hash(readFileSync(fileURLToPath(import.meta.url)));
const compile = p => ts.transpileModule(sourceTexts[p] ?? read(p), {compilerOptions:{module:ts.ModuleKind.ES2022, target:ts.ScriptTarget.ES2022}}).outputText;
const moduleUrl = text => 'data:text/javascript;base64,' + Buffer.from(text).toString('base64');
const coreUrl = moduleUrl(compile('src/core.ts')), eventsUrl = moduleUrl(compile('src/animationEvents.ts'));
const core = await import(coreUrl), events = await import(eventsUrl);
// Expose the *real* private paint function in this process only, so superseded
// installed clips are checked too. The runtime source file is never modified.
const poseUrl = moduleUrl(compile('src/poseAtlas.ts')
  .replace("from './core'", `from '${coreUrl}'`)
  .replace("from './animationEvents'", `from '${eventsUrl}'`) + `
export function __qaPaintCell(c, f, id, sequence, frameIndex) {
  const slot = sequence === 'poses' ? frameIndex : 0;
  return paint(c, f, slot, false, {slot, sequence, frameIndex}, id);
}
`);
const poses = await import(poseUrl);
// Exercise the actual body dispatcher too. Installed bodies must never reach
// the historical rig/placeholder branches; fail loudly if one does.
const spriteCode=compile('src/spriteRoster.ts');
const legacyImports=[...spriteCode.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]\.\/(?!poseAtlas['"]|core['"])[^'"]+['"]/g)];
const legacyNames=[...new Set(legacyImports.flatMap(match=>match[1].split(',').map(name=>name.trim())))];
const legacyUrl=moduleUrl(legacyNames.map(name=>`export function ${name}(){throw new Error('Unexpected legacy sprite path: ${name}');}`).join('\n'));
const runtimeSpriteUrl=moduleUrl(spriteCode.replace(/from\s*['"]\.\/([^'"]+)['"]/g,(_,name)=>`from '${name==='poseAtlas'?poseUrl:name==='core'?coreUrl:legacyUrl}'`));
const runtimeSprites=await import(runtimeSpriteUrl);
const spriteUrl = moduleUrl(`import {drawSprite as drawRuntimeSprite} from '${runtimeSpriteUrl}';
export function drawSprite(c,f,frame,ghost=false,frozen=false) {
  const first=c.draws.length;
  drawRuntimeSprite(c,f,frame,ghost,frozen);
  if(c.draws.length===first)throw new Error('Missing installed assist body: '+f.id);
  globalThis.__spriteScaleAuditAssist(c,f,frame,first);
}`);
// Effects have intentionally independent sizes. Keep real assist placement and
// body drawing, but omit effect artwork from this body-scale audit.
const effectsUrl = moduleUrl('export function drawPower(){} export function drawPelvicStream(){} export function drawPartnerEffect(){}');
const team = await import(moduleUrl(compile('src/teamSpecial.ts')
  .replace("from './core'", `from '${coreUrl}'`).replace("from './poseAtlas'", `from '${poseUrl}'`)
  .replace("from './spriteRoster'", `from '${spriteUrl}'`).replace("from './powerArt'", `from '${effectsUrl}'`)
  .replace("from './partnerEffects'", `from '${effectsUrl}'`)));

const failures = [], advisories = [], counters = {installedCellFacingDraws:0, hullRegistrationChecks:0, throwGripChecks:0, runtimeSamples:0, assistRuntimeSamples:0, imageDraws:0, replayTicks:0, replayScenarios:0, damageScenarios:0, guardScenarios:0, throwScenarios:0};
const check = (label, fn) => {try {fn();} catch (error) {failures.push({label, message:error.message});}};
const round = n => Math.round(n * 10000) / 10000;
const near = (a, b, label, tolerance = 1e-8) => assert.ok(Math.abs(a - b) <= tolerance, `${label}: ${a} != ${b}`);
const localPath = url => {
  assert.ok(!/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url) && !url.includes('\\'), 'local image URL required');
  const path = url.split('?')[0];
  return path.startsWith('/') ? path : '/fighters/' + path;
};
const cells = [], byUrl = new Map(), bodies = {};
for (const [id, cfg] of Object.entries(manifest.fighters)) {
  const scale = cfg.scale ?? cfg.worldHeight / cfg.height;
  const sequences = {poses:cfg.frames, ...(cfg.walkFrames ? {walk:cfg.walkFrames} : {}), ...cfg.clips};
  bodies[id] = {scale, authoredFacing:cfg.facing ?? 1, owners:core.PLAYABLE_FIGHTERS.filter(owner => core.bodyAtlasIds(owner).includes(id)), sequences:{}, runtimeTransforms:{}};
  for (const [sequence, frames] of Object.entries(sequences)) for (const [index, entry] of frames.entries()) {
    const frame = typeof entry === 'string' ? {url:entry} : entry;
    const pose=sequence==='poses'?Object.keys(poses.POSE_SLOTS).find(name=>poses.POSE_SLOTS[name]===index):null;
    const registration=pose?cfg.poseRegistration?.[pose]:cfg.clipRegistration?.[sequence],pixelScale=registration?.pixelScale??1,offset=registration?.anchorOffset??[0,0],sourceAnchor=frame.anchor??cfg.anchor;
    const row = {key:`${id}/${sequence}/${index}`, body:id, sequence, index, pose:sequence === 'poses' ? Object.keys(poses.POSE_SLOTS).find(name => poses.POSE_SLOTS[name] === index) : null,
      url:localPath(frame.url), width:frame.width ?? cfg.width, height:frame.height ?? cfg.height,
      anchor:sourceAnchor.map((v,i)=>v+offset[i]), bounds:frame.bounds ?? [0, 0, frame.width ?? cfg.width, frame.height ?? cfg.height],
      contactHull:frame.contactHull ?? null, scale:scale*pixelScale, sourceRegistration:registration??null, authoredFacing:cfg.facing ?? 1};
    cells.push(row);
    if (!byUrl.has(row.url)) byUrl.set(row.url, []);
    byUrl.get(row.url).push(row);
    check(row.key + ' metadata', () => {
      assert.ok(!('scale' in frame) && !('worldHeight' in frame), 'per-cel scale is not part of the runtime contract');
      assert.ok(Number.isFinite(scale) && scale > 0);
      assert.ok(row.anchor.every(Number.isFinite) && row.anchor.length === 2);
      assert.ok(row.anchor[0] >= 0 && row.anchor[0] < row.width && row.anchor[1] >= 0 && row.anchor[1] < row.height, 'anchor is inside source canvas');
    });
  }
}
check('every selectable fighter and partner has installed bodies', () => {
  for (const id of core.PLAYABLE_FIGHTERS) for (const owner of [id, ...core.specialPartnerIds(id)])
    for (const body of core.bodyAtlasIds(owner)) assert.ok(manifest.fighters[body], `${id}: missing ${body}`);
});
for(const id of core.PLAYABLE_FIGHTERS)for(const facing of [-1,1])for(const [part,slot] of [['hand',26],['torso',24]])check(`${id} facing ${facing} ${part} grip`,()=>{
  const ids=core.bodyAtlasIds(id),cfg=manifest.fighters[ids[facing===1?ids.length-1:0]],frame=cfg.frames[slot];
  const anchor=frame.anchor??cfg.anchor,contact=cfg.holdContact?.[part],registration=cfg.poseRegistration?.[part==='hand'?'grabReach':'hit'],density=registration?.pixelScale??1,offset=registration?.anchorOffset??[0,0],scale=(cfg.scale??cfg.worldHeight/cfg.height)*density;
  assert.ok(contact,'installed hand/torso contact metadata is required');
  const expected=[core.bodySpread(id)+(contact[0]-anchor[0]-offset[0])*scale*(cfg.facing??1),(contact[1]-anchor[1]-offset[1])*scale],actual=core.getThrowGrip({id,facing},part);
  near(actual[0],expected[0],'core grip x agrees with front body art metadata');near(actual[1],expected[1],'core grip y agrees with front body art metadata');
  counters.throwGripChecks++;
});

// Decode every unique installed PNG with the same Pillow dependency used by
// verify_pose_assets.py. This is real pixel validation, not fake-image loading.
const pixels = spawnSync('python3', ['-c', String.raw`
import io,json,sys,hashlib
from pathlib import Path
from PIL import Image,ImageChops
root=Path(sys.argv[1]); request=json.load(sys.stdin); paths=request['paths']; floor_sources=set(request['floorSources']); result={}
def opaque_hull(alpha):
    w,h=alpha.size; data=alpha.tobytes(); points=[]
    for y in range(h):
        row=data[y*w:(y+1)*w]; left=w-len(row.lstrip(b'\0')); right=len(row.rstrip(b'\0'))-1
        if left<=right: points.extend(((left,y),(right,y)))
    points=sorted(set(points)); lo=[]; hi=[]
    def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
    for p in points:
        while len(lo)>1 and cross(lo[-2],lo[-1],p)<=0:lo.pop()
        lo.append(p)
    for p in reversed(points):
        while len(hi)>1 and cross(hi[-2],hi[-1],p)<=0:hi.pop()
        hi.append(p)
    return lo[:-1]+hi[:-1]
def blue_head(im):
    r,g,b,a=im.split()
    mask=ImageChops.multiply(ImageChops.subtract(b,r).point(lambda v:255 if v>40 else 0),ImageChops.subtract(b,g).point(lambda v:255 if v>20 else 0))
    mask=ImageChops.multiply(mask,a.point(lambda v:255 if v>128 else 0))
    w,h=im.size; todo={i for i,v in enumerate(mask.tobytes()) if v}; largest=[]
    while todo:
        seed=todo.pop(); comp=[seed]; queue=[seed]
        while queue:
            p=queue.pop(); x=p%w; y=p//w
            for dy in (-1,0,1):
                for dx in (-1,0,1):
                    if not(dx or dy) or not(0<=x+dx<w and 0<=y+dy<h): continue
                    q=(y+dy)*w+x+dx
                    if q in todo: todo.remove(q); queue.append(q); comp.append(q)
        if len(comp)>len(largest): largest=comp
    if not largest: return None
    xs=[p%w for p in largest]; ys=[p//w for p in largest]
    return dict(bounds=[min(xs),min(ys),max(xs)+1,max(ys)+1],area=len(largest))
for path in paths:
    raw=(root/'public'/path.lstrip('/')).read_bytes()
    with Image.open(io.BytesIO(raw)) as source:
        source.load(); im=source.convert('RGBA'); alpha=im.getchannel('A'); hist=alpha.histogram()
        row=dict(width=im.width,height=im.height,mode=source.mode,bounds=alpha.getbbox(),opaque=sum(hist[1:]),softAlpha=sum(hist[1:255]),sha256=hashlib.sha256(raw).hexdigest())
        if path in floor_sources: row['actualReactionHull']=opaque_hull(alpha)
        if '/sproto1815/' in path: row['jessicaBlueHead']=blue_head(im)
        result[path]=row
print(json.dumps(result,separators=(',',':')))
`, root], {input:JSON.stringify({paths:[...byUrl.keys()],floorSources:[...new Set(cells.filter(row=>row.sequence==='poses'&&[9,24].includes(row.index)).map(row=>row.url))]}), encoding:'utf8', maxBuffer:32 * 1024 * 1024});
assert.equal(pixels.status, 0, 'PNG decoding requires python3 + Pillow: ' + pixels.stderr);
const imageStats = JSON.parse(pixels.stdout);
for (const cell of cells) {
  const stats = imageStats[cell.url];
  cell.sha256 = stats.sha256;
  cell.alphaBounds = stats.bounds;
  if(stats.actualReactionHull)cell.actualReactionHull=stats.actualReactionHull;
  cell.opaqueAreaWorld = round(stats.opaque * cell.scale ** 2);
  cell.jessicaBlueHead = stats.jessicaBlueHead ?? null;
  check(cell.key + ' decoded image', () => {
    assert.equal(stats.width, cell.width); assert.equal(stats.height, cell.height);
    assert.ok(stats.bounds, 'nonempty visible pixels');
    assert.equal(stats.mode, 'RGBA', 'transparent RGBA source');
    const [l,t,r,b] = stats.bounds, m = cell.bounds;
    assert.ok(l > 0 && t > 0 && r < cell.width && b < cell.height, 'transparent padding avoids canvas-edge clipping');
    assert.ok(m[0] <= l && m[1] <= t && m[2] >= r && m[3] >= b, 'opaque bounds metadata encloses actual visible pixels');
    if(cell.contactHull?.length){
      const xs=cell.contactHull.map(p=>p[0]),ys=cell.contactHull.map(p=>p[1]);
      const hullBounds=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)],pixelOrigins=[l,t,r-1,b-1];
      assert.ok(hullBounds.every((value,i)=>Math.abs(value-pixelOrigins[i])<=1.000001),
        `contact hull extent ${hullBounds} differs from decoded alpha ${stats.bounds}; source canvas/scale registration is stale`);
      counters.hullRegistrationChecks++;
    }
  });
  if (!stats.bounds) continue;
  const [l,t,r,b] = stats.bounds;
  cell.worldEnvelope = [l - cell.anchor[0], t - cell.anchor[1], r - cell.anchor[0], b - cell.anchor[1]].map(v => round(v * cell.scale));
  cell.floorDeltaWorld = round((b - cell.anchor[1]) * cell.scale);
  if (stats.softAlpha) advisories.push({key:cell.key, kind:'soft-alpha', pixels:stats.softAlpha});
  if (JSON.stringify(stats.bounds) !== JSON.stringify(cell.bounds)) advisories.push({key:cell.key, kind:'conservative-bounds', metadata:cell.bounds, actual:stats.bounds});
  if (Math.abs(cell.floorDeltaWorld) > 2) advisories.push({key:cell.key, kind:'authored-floor-offset', worldPixels:cell.floorDeltaWorld, note:'May be intentional air, hover, recoil, or event motion; inspect the actual support point.'});
}
globalThis.fetch = async () => ({ok:true, status:200, headers:{get:() => 'application/json'}, json:async () => structuredClone(manifest)});
globalThis.Image = class {
  set src(value) {
    this.url = localPath(value); const stats = imageStats[this.url];
    if (!stats) {queueMicrotask(() => this.onerror?.()); return;}
    this.naturalWidth = this.width = stats.width; this.naturalHeight = this.height = stats.height;
    this.complete = true; queueMicrotask(() => this.onload());
  }
};
await poses.loadPoseAtlases();
assert.equal(poses.getPoseAtlasLoadStatus().ids.length, Object.keys(bodies).length);
console.log(`Decoded ${byUrl.size} PNGs / ${cells.length} cel entries across ${Object.keys(bodies).length} installed bodies.`);

const multiply = (a,b) => [a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
const point = (m,x,y) => [m[0]*x+m[2]*y+m[4], m[1]*x+m[3]*y+m[5]];
function context() {
  const c = {matrix:[1,0,0,1,0,0], stack:[], draws:[], globalAlpha:1,
    save() {this.stack.push({matrix:[...this.matrix], alpha:this.globalAlpha});},
    restore() {assert.ok(this.stack.length, 'balanced canvas restore'); const state=this.stack.pop();this.matrix=state.matrix;this.globalAlpha=state.alpha;},
    translate(x,y) {this.matrix=multiply(this.matrix,[1,0,0,1,x,y]);},
    scale(x,y) {this.matrix=multiply(this.matrix,[x,0,0,y,0,0]);},
    rotate(angle) {const co=Math.cos(angle),si=Math.sin(angle);this.matrix=multiply(this.matrix,[co,si,-si,co,0,0]);},
    transform(...m) {this.matrix=multiply(this.matrix,m);},
    setTransform(...m) {this.matrix=m.length===1?[m[0].a,m[0].b,m[0].c,m[0].d,m[0].e,m[0].f]:m;},
    resetTransform() {this.matrix=[1,0,0,1,0,0];},
    drawImage(image,...a) {
      assert.ok([2,4,8].includes(a.length), 'supported Canvas drawImage overload');
      assert.ok([...this.matrix,...a,this.globalAlpha].every(Number.isFinite), 'finite composed draw geometry');
      let sx=0,sy=0,sw=image.width,sh=image.height,dx,dy,dw=image.width,dh=image.height;
      if(a.length===8)[sx,sy,sw,sh,dx,dy,dw,dh]=a;else if(a.length===4)[dx,dy,dw,dh]=a;else [dx,dy]=a;
      assert.ok(sw>0&&sh>0&&dw>0&&dh>0, 'positive crop/destination dimensions');
      assert.ok(sx>=0&&sy>=0&&sx+sw<=image.width&&sy+sh<=image.height, 'crop stays in source image');
      const m=multiply(this.matrix,[dw/sw,0,0,dh/sh,dx-sx*dw/sw,dy-sy*dh/sh]);
      const xScale=Math.hypot(m[0],m[1]),yScale=Math.hypot(m[2],m[3]);
      const candidates=byUrl.get(image.url);assert.ok(candidates?.length, 'only installed body art enters body audit');
      const match=candidates.find(cell=>Math.abs(cell.scale-xScale)<1e-8);
      assert.ok(match, `${image.url}: ${xScale} source-pixel world scale differs from declared atlas scale`);
      near(yScale,match.scale,'vertical source-pixel world scale');
      near(m[0]*m[2]+m[1]*m[3],0,'no shear or nonuniform body distortion');
      this.draws.push({url:image.url,matrix:m,source:[sx,sy,sw,sh]});counters.imageDraws++;
    },
  };
  // Canvas effect drawing is omitted. Do not silently stub transform APIs.
  for(const method of ['fillRect','strokeRect','beginPath','moveTo','lineTo','stroke','fill','arc','ellipse','closePath','fillText','quadraticCurveTo','bezierCurveTo','setLineDash']) c[method]=()=>{};
  return c;
}
function finish(c) {assert.equal(c.stack.length,0,'body renderer balances canvas stack');assert.deepEqual(c.matrix,[1,0,0,1,0,0],'body renderer restores caller transform');}
const resetScene = () => {poses.setPoseAtlasPresentation(null,[]);poses.setPoseAtlasThrowState(null,[]);};
const fixture = (id,facing=1) => {
  const s=core.createState(id,'dummy','rivet');s.fighters[0].x=640;s.fighters[0].facing=facing;s.fighters[1].x=640+facing*400;s.fighters[1].facing=-facing;return s;
};
const seen = new Map();
function record(f,frame) {
  const samples=core.isPairedFighter(f.id)?poses.getDuoPoseDebug(f,frame):[{entity:f.id,...poses.getPoseAtlasDebug(f,frame)}];
  for(const sample of samples) {
    assert.ok(sample.available, `${sample.entity}: complete atlas required`);
    if(!seen.has(sample.entity))seen.set(sample.entity,new Set());
    seen.get(sample.entity).add(`${sample.sequence}/${sample.frameIndex}`);
  }
  return samples;
}
function inspectTransforms(f,samples,draws,presentation) {
  for(const draw of draws){
    const matching=byUrl.get(draw.url).filter(row=>core.bodyAtlasIds(f.id).includes(row.body));
    assert.ok(matching.length,'draw belongs to its fighter body');
    const sample=samples.find(row=>row.entity===matching[0].body),m=draw.matrix;
    assert.ok(sample,'selected sequence belongs to drawn body');
    // One PNG can be deliberately reused with different metadata. Prefer the
    // actual selected entry; the fallback accommodates sliced legacy defeat.
    const cell=matching.find(row=>row.sequence===sample.sequence&&row.index===sample.frameIndex)??matching[0];
    const floorEvent=['death','defeat'].includes(sample.sequence)&&presentation&&(presentation.fromFloor||(f.reaction?.kind==='knockdown'&&f.reaction.phase==='down'));
    const expectedFacing=floorEvent?(f.reaction?.direction??f.facing):f.facing;
    near(Math.sign(m[0]*m[3]-m[1]*m[2]),Math.sign(expectedFacing*cell.authoredFacing),'runtime authored facing, including floor defeat');
    const anchor=point(m,...cell.anchor),bodyIndex=core.bodyAtlasIds(f.id).indexOf(cell.body);
    const transform=bodies[cell.body].runtimeTransforms[sample.sequence]??={draws:0,scaleX:[Infinity,-Infinity],scaleY:[Infinity,-Infinity],anchorOffsetX:[Infinity,-Infinity],anchorOffsetY:[Infinity,-Infinity]};
    transform.draws++;
    for(const [key,value] of Object.entries({scaleX:Math.hypot(m[0],m[1]),scaleY:Math.hypot(m[2],m[3]),anchorOffsetX:anchor[0]-f.x-core.bodyOffsets(f.id)[bodyIndex],anchorOffsetY:anchor[1]-f.y})){
      transform[key][0]=Math.min(transform[key][0],value);transform[key][1]=Math.max(transform[key][1],value);
    }
    if(f.reaction?.kind==='knockdown'&&f.reaction.phase==='down'&&!presentation){
      const hull=cell.actualReactionHull;
      assert.ok(hull?.length,'resting-pose support is decoded from actual PNG alpha');
      // Alpha hulls above contain pixel origins; Canvas paints each whole
      // [x,x+1] × [y,y+1] square. Older authored hulls use pixel boundaries,
      // newer ones use origins, so allow exactly that footprint plus the
      // renderer's half-world-pixel translation rounding, not arbitrary hover.
      const footprint=Math.max(0,m[1])+Math.max(0,m[3]);
      const bottom=Math.max(...hull.map(([x,y])=>point(m,x,y)[1]))+footprint,delta=bottom-core.FLOOR;
      assert.ok(delta>=-.500001&&delta<=footprint+.500001,`actual opaque floor support: delta ${delta}, pixel footprint ${footprint}`);
      transform.visibleFloorDelta??=[Infinity,-Infinity];transform.visibleFloorDelta[0]=Math.min(transform.visibleFloorDelta[0],delta);transform.visibleFloorDelta[1]=Math.max(transform.visibleFloorDelta[1],delta);
    }
  }
}
globalThis.__spriteScaleAuditAssist=(c,f,frame,first)=>{
  inspectTransforms(f,record(f,frame),c.draws.slice(first),null);counters.assistRuntimeSamples++;
};
function drawState(s,presentation=null,includeTeam=false) {
  const before=JSON.stringify(s),moveData=s.fighters.map(f=>Object.keys(core.MOVES).map(id=>core.getMove(f,id)));
  poses.setPoseAtlasPresentation(presentation,s.fighters);poses.setPoseAtlasThrowState(s.throwState,s.fighters);
  const c=context();
  for(const f of s.fighters){
    const first=c.draws.length;
    runtimeSprites.drawSprite(c,f,s.frame,false,s.freeze>0);assert.ok(c.draws.length>first,'installed runtime body is drawn');const samples=record(f,s.frame);
    inspectTransforms(f,samples,c.draws.slice(first),presentation);
  }
  if(includeTeam){team.drawTeamSpecialBack(c,s);team.drawTeamSpecialFront(c,s);}
  finish(c);assert.equal(JSON.stringify(s),before,'drawing cannot mutate combat/replay state');
  assert.deepEqual(s.fighters.map(f=>Object.keys(core.MOVES).map(id=>core.getMove(f,id))),moveData,'drawing cannot change move/contact definitions');
  counters.runtimeSamples++;
  return c;
}

// Every installed cel, including secondary bodies and clips shadowed by richer
// replacements, must preserve authored foot pivot and source-pixel world scale.
resetScene();
for(const cell of cells) for(const facing of [-1,1]) check(cell.key+` facing ${facing}`,()=>{
  const owner=bodies[cell.body].owners[0]??core.PLAYABLE_FIGHTERS[0],s=fixture(owner,facing),f=s.fighters[0];
  const before=JSON.stringify(s),c=context();
  assert.ok(poses.__qaPaintCell(c,f,cell.body,cell.sequence,cell.index));finish(c);
  assert.equal(c.draws.length,1,'ordinary explicit complete-body cell has one draw');
  const d=c.draws[0];assert.equal(d.url,cell.url);
  const actual=point(d.matrix,...cell.anchor);near(actual[0],Math.round(f.x),'source anchor maps to fighter x');near(actual[1],Math.round(f.y),'source anchor maps to fighter floor/y');
  const flip=facing*cell.authoredFacing;near(d.matrix[0],flip*cell.scale,'authored facing');near(d.matrix[3],cell.scale,'vertical scale');
  assert.equal(JSON.stringify(s),before);counters.installedCellFacingDraws++;
});
console.log(`Checked ${counters.installedCellFacingDraws} installed cel/facing transforms and authored anchors.`);

// Public runtime path: every age of every move/aim plus movement, reactions,
// authored entrances/defeats/victories, frozen frames, ghosts, and actual assists.
for(const id of core.PLAYABLE_FIGHTERS) for(const facing of [-1,1]) check(`${id} facing ${facing} runtime states`,()=>{
  resetScene();
  const s=fixture(id,facing),f=s.fighters[0];
  for(let t=0;t<80;t++){s.frame=t;f.vx=0;drawState(s);}
  for(const direction of [1,-1]) for(let t=0;t<40;t++){s.frame++;f.vx=facing*direction*2;f.x+=f.vx;drawState(s);}
  f.x=640;f.vx=0;
  for(let dash=11;dash>=0;dash--){f.dash=dash;s.frame++;drawState(s);}f.dash=0;
  for(let t=0;t<20;t++){f.y=core.FLOOR-80;f.vy=-core.ROSTER[id].jump+t*2;s.frame++;drawState(s);}f.y=core.FLOOR;f.vy=0;
  f.input=core.A.down;drawState(s);f.input=0;f.blockstun=8;drawState(s);f.blockstun=0;
  for(const move of Object.keys(core.MOVES)) for(const aim of ['level','up','upForward','down']) {
    f.y=move.startsWith('air')?core.FLOOR-80:core.FLOOR;
    f.move={id:move,t:0,hit:false,connected:false,wave:-1,aim,shotX:facing,shotY:aim==='down'?1:aim.startsWith('up')?-1:0};
    const m=core.getMove(f,move),total=m.startup+m.active+m.recovery;
    for(let age=0;age<=total;age++){f.move.t=age;s.frame++;drawState(s,null,move==='special');}
  }
  f.move=null;
  for(const kind of ['recoil','launch','knockdown']) for(const phase of ['flight','down','rise']) {
    if(kind!=='knockdown'&&phase!=='flight')continue;
    for(const edge of [80,640,core.WIDTH-80]) for(const age of [0,4,10,18,35]) {
      f.x=edge;f.y=phase==='flight'?core.FLOOR-70:core.FLOOR;f.stun=30;f.reaction={kind,phase,t:age,direction:-facing};s.frame++;drawState(s);
    }
  }
  f.x=640;f.y=core.FLOOR;f.stun=0;f.reaction=null;
  for(const phase of ['intro','outro','result']) for(const winner of phase==='intro'?[null]:[0,1,2]) for(const fromFloor of [false,true]) {
    for(let t=0;t<=events.OUTRO_FRAMES;t+=2){s.frame++;drawState(s,{phase,frame:t,winner,fromFloor});}
  }
  resetScene();const c=context(),snapshot=JSON.stringify(s);runtimeSprites.drawSprite(c,f,s.frame,true,true);finish(c);assert.equal(JSON.stringify(s),snapshot);
  if(facing===1&&(core.PLAYABLE_FIGHTERS.indexOf(id)+1)%25===0)console.log(`Runtime state traversal: ${core.PLAYABLE_FIGHTERS.indexOf(id)+1}/${core.PLAYABLE_FIGHTERS.length} playable fighters.`);
});

// Rendered/control replay pairs exercise actual contact, whiff, guard, throws,
// projectile emission and special damage. Their entire states must agree each
// tick, including core's numerical hurt/contact rules (it has no sprite boxes).
for(const id of core.PLAYABLE_FIGHTERS) for(const facing of [-1,1]) for(const [label,button,gap,defense] of [
  ['light-contact',core.A.light,70,0],['medium-contact',core.A.medium,70,0],['heavy-contact',core.A.heavy,70,0],
  ['low-guard',core.A.down|core.A.light,70,'guard'],['sweep-guard',core.A.down|core.A.heavy,70,'crouch'],
  ['launcher',core.A.launcher,70,0],['ranged',core.A.bolt,180,0],['special',core.A.special,150,0],
  ['grab-forward',core.A.grab,60,0],['grab-back',core.A.grab,60,0],['whiff',core.A.medium,440,0],
]) check(`${id} facing ${facing} replay ${label}`,()=>{
  resetScene();const rendered=fixture(id,facing),f=rendered.fighters[0],foe=rendered.fighters[1];
  f.x=450;foe.x=f.x+facing*(gap+core.bodySpread(id)+core.bodySpread(foe.id));f.pips=3;
  const control=structuredClone(rendered),back=facing===1?core.A.left:core.A.right,foeBack=facing===1?core.A.right:core.A.left;
  const attack=label==='grab-back'?core.A.grab|back:button;
  let sawThrow=false,sawProjectile=false,sawGuard=false,sawDamage=false;
  for(let tick=0;tick<125;tick++) {
    const inputs=[tick===0?attack:0,defense==='crouch'?foeBack|core.A.down:defense==='guard'?foeBack:0];
    const emitted=[[],[]];
    if(label==='ranged')for(const [index,state] of [rendered,control].entries())Object.defineProperty(state.projectiles,'push',{
      configurable:true,enumerable:false,value:function(...shots){emitted[index].push(...structuredClone(shots));return Array.prototype.push.apply(this,shots);},
    });
    core.step(rendered,inputs);core.step(control,inputs);drawState(rendered,null,true);
    assert.deepEqual(rendered,control,'rendered and unrendered collision/damage/state histories agree');counters.replayTicks++;
    assert.deepEqual(emitted[0],emitted[1],'even immediately consumed projectile spawns have identical geometry');
    sawThrow ||= !!rendered.throwState;sawProjectile ||= emitted[0].length>0||rendered.projectiles.length>0;sawGuard ||= foe.blockstun>0;sawDamage ||= foe.hp<1000;
  }
  // Dummy mode restores HP at frame90. Observe damage at contact, not only the
  // final frame, or a real hit followed by dummy healing looks like a whiff.
  if(label==='whiff')assert.equal(sawDamage,false,'far attack really whiffs');
  else if(label==='sweep-guard'){assert.equal(sawDamage,false,'crouch guard prevents sweep damage');assert.ok(sawGuard,'guard actually triggered');counters.guardScenarios++;}
  else if(label==='ranged')assert.ok(sawProjectile,'projectile really spawned');
  else{assert.ok(sawDamage,`${label} really causes damage`);counters.damageScenarios++;}
  if(label.startsWith('grab')){assert.ok(sawThrow,'actual held/released throw path');counters.throwScenarios++;}
  counters.replayScenarios++;
});
resetScene();

for(const [body,summary] of Object.entries(bodies)) {
  const own=cells.filter(row=>row.body===body),guard=own.find(row=>row.sequence==='poses'&&row.index===0),guardHeight=guard.alphaBounds[3]-guard.alphaBounds[1];
  for(const sequence of new Set(own.map(row=>row.sequence))) {
    const rows=own.filter(row=>row.sequence===sequence),extent=rows.map(row=>({width:(row.alphaBounds[2]-row.alphaBounds[0])*row.scale,height:(row.alphaBounds[3]-row.alphaBounds[1])*row.scale}));
    const span=values=>[round(Math.min(...values)),round(Math.max(...values))];
    summary.sequences[sequence]={frames:rows.length,selectedInRuntime:rows.filter(row=>seen.get(body)?.has(`${sequence}/${row.index}`)).length,
      silhouetteWidth:span(extent.map(v=>v.width)),silhouetteHeight:span(extent.map(v=>v.height)),floorDelta:span(rows.map(row=>row.floorDeltaWorld)),
      anchors:[...new Set(rows.map(row=>JSON.stringify(row.anchor)))].map(JSON.parse)};
    if(sequence==='walk')for(const row of rows){
      const ratio=(row.alphaBounds[3]-row.alphaBounds[1])/guardHeight;
      if(ratio<.88||ratio>1.12)advisories.push({key:row.key,kind:'walk-envelope-height-change',ratio:round(ratio),note:'Heuristic only: weapon/hair/pose can change the envelope, and equal envelopes can hide body shrink.'});
    }
  }
  for(const transform of Object.values(summary.runtimeTransforms))for(const key of ['scaleX','scaleY','anchorOffsetX','anchorOffsetY','visibleFloorDelta'])if(transform[key])transform[key]=transform[key].map(round);
  summary.anatomicalScale='Requires visual head/torso/limb landmark review; opaque envelope is not a body-size measurement.';
}
const jessica=cells.filter(row=>row.body==='sproto1815'&&row.jessicaBlueHead),headGuard=jessica.find(row=>row.sequence==='poses'&&row.index===0)?.jessicaBlueHead;
if(headGuard)for(const row of jessica){
  const head=row.jessicaBlueHead;head.areaRatioToGuard=round(head.area/headGuard.area);
  if(row.sequence==='walk'&&head.areaRatioToGuard<.7)advisories.push({key:row.key,kind:'Jessica-blue-head-area-change',ratio:head.areaRatioToGuard,note:'Character-specific color/component heuristic. Inspect occlusion, orientation and anatomy; do not normalize all art by this mask.'});
}
const changes=[];
if(baselinePath){
  const before=JSON.parse(readFileSync(baselinePath,'utf8')),old=new Map(before.cells.map(row=>[row.key,row]));
  for(const row of cells){const previous=old.get(row.key);if(!previous){changes.push({key:row.key,kind:'added'});continue;}old.delete(row.key);
    const fields=['sha256','scale','anchor','bounds','contactHull','width','height','authoredFacing'].filter(key=>JSON.stringify(previous[key])!==JSON.stringify(row[key]));
    if(fields.length)changes.push({key:row.key,kind:'changed',fields,before:{scale:previous.scale,anchor:previous.anchor,bounds:previous.bounds,...(fields.includes('contactHull')?{contactHull:previous.contactHull}:{})},after:{scale:row.scale,anchor:row.anchor,bounds:row.bounds,...(fields.includes('contactHull')?{contactHull:row.contactHull}:{})}});
  }
  for(const key of old.keys())changes.push({key,kind:'removed'});
}
check('audited inputs remained stable during the run',()=>{
  assert.ok(read('public/fighters/pose-atlas.json')===manifestText,'manifest changed during the audit; rerun the final version');
  for(const path of sourcePaths)assert.ok(read(path)===sourceTexts[path],`${path} changed during the audit; rerun the final version`);
  assert.equal(hash(readFileSync(fileURLToPath(import.meta.url))),auditScriptSha256,'audit script changed during the run; rerun the final version');
});
const report={schemaVersion:1,auditScriptSha256,manifestRevision:manifest.revision,manifestSha256:hash(manifestText),sourceSha256:Object.fromEntries(sourcePaths.map(path=>[path,hash(sourceTexts[path])])),
  scope:{playableFighters:core.PLAYABLE_FIGHTERS.length,installedBodies:Object.keys(bodies).length,installedFrameEntries:cells.length,uniqueImages:byUrl.size,facings:[-1,1]},
  counters,failures,advisories,changes,bodies,cells,
  limits:['No browser visual approval. PNG alpha, complete draw matrices and deterministic state histories are checked.',
    'Rotation, translation, floor-safe knockdown pivots, hover/ram motion, paired spacing, and separate effects can be intentional. Only source-pixel body scale/shear is invariant.',
    'Runtime anchor-offset ranges are measured against the core root plus each companion body offset. Reaction pivots, camera/formation corrections, hover travel and pixel rounding can intentionally change them. Pixel envelopes are source-oriented; facing is checked on actual matrices.',
    'Floor support uses decoded alpha pixel squares, allowing half a world pixel of translation rounding and one transformed source-pixel footprint for the installed origin/boundary hull conventions.',
    'All installed cels are directly checked; runtime coverage counts distinguish selected cels from shadowed clips.',
    'Core contact uses range/vertical thresholds, bodySpread and projectile radii, not per-pixel sprite hit/hurt boxes. Replay equality proves render independence, not visual contact accuracy.',
    'Jessica mask: alpha>128, B>R+40, B>G+20, largest 8-connected component. Advisory for this blue head only; occlusion and rotation may change it.']};
const summaryLines=[`# Sprite scale audit`, '', `Manifest: ${manifest.revision} (${report.manifestSha256.slice(0,12)})`, '',
  `${report.scope.playableFighters} selectable fighters; ${report.scope.installedBodies} installed bodies; ${cells.length} frame entries; both facings.`,
  `${failures.length} hard failures; ${advisories.length} advisory frame flags; ${counters.imageDraws} composed body draws; ${counters.replayScenarios} rendered/control replay scenarios.`, '',
  'A passing transform audit does not approve anatomical consistency. Weapons, effects, crouches and jumps change silhouettes. Equal silhouette height can hide a smaller head and torso.', '',
  '| Body | Scale | Walk height / guard height | Walk floor delta | Advisory flags |', '|---|---:|---:|---:|---:|'];
for(const [id,b] of Object.entries(bodies)){
  const guard=cells.find(row=>row.body===id&&row.sequence==='poses'&&row.index===0),h=(guard.alphaBounds[3]-guard.alphaBounds[1])*b.scale,w=b.sequences.walk;
  summaryLines.push(`| ${id} | ${b.scale} | ${w?w.silhouetteHeight.map(v=>round(v/h)).join('–'):'—'} | ${w?w.floorDelta.join('–'):'—'} | ${advisories.filter(row=>row.key.startsWith(id+'/')).length} |`);
}
summaryLines.push('', 'See report.json for each sequence, source anchor, decoded alpha bounds, hash and baseline change; frames.csv contains every installed cel. Advisory flags are a review queue, not automatic corrections.', '', ...report.limits.map(text=>'- '+text));
if(failures.length)summaryLines.push('', '## Failures', ...failures.map(row=>`- ${row.label}: ${row.message}`));
if(out){
  mkdirSync(out,{recursive:true});writeFileSync(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');writeFileSync(join(out,'summary.md'),summaryLines.join('\n')+'\n');
  const columns=['key','url','scale','anchor','bounds','alphaBounds','worldEnvelope','floorDeltaWorld','opaqueAreaWorld','sha256','jessicaBlueHead'];
  const csv=v=>'"'+String(typeof v==='object'?JSON.stringify(v):v??'').replaceAll('"','""')+'"';
  writeFileSync(join(out,'frames.csv'),[columns.join(','),...cells.map(row=>columns.map(key=>csv(row[key])).join(','))].join('\n')+'\n');
}
console.log(`${failures.length?'FAIL':'PASS'}: ${JSON.stringify({...report.scope,...counters,hardFailures:failures.length,advisoryFlags:advisories.length,baselineChanges:changes.length})}`);
if(headGuard){const walk=jessica.filter(row=>row.sequence==='walk').map(row=>row.jessicaBlueHead.areaRatioToGuard);console.log(`Jessica advisory: blue-head walk area / guard area ${Math.min(...walk)}–${Math.max(...walk)}. Equal full-silhouette height is not evidence of equal body scale.`);}
if(out)console.log('Reports: '+out);
for(const failure of failures.slice(0,20))console.error(`${failure.label}: ${failure.message}`);
if(failures.length)process.exitCode=1;
