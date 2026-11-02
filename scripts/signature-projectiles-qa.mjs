import assert from 'node:assert/strict';
import fs from 'node:fs';import ts from 'typescript';
const compile=p=>ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const module=await import('data:text/javascript;base64,'+Buffer.from(compile('src/powerArt.ts')).toString('base64'));
const changes=JSON.parse(fs.readFileSync('art/identity-actions/projectile-changes.json','utf8'));
const catalog=JSON.parse(fs.readFileSync('art/identity-actions/projectile-catalog.json','utf8'));
const seen=new Map();
for(const[id,shape]of Object.entries(changes)){
 if(shape==='ethereum'){
  const draws=[],c={save(){},restore(){},rotate(){},drawImage(...a){draws.push(a)}};
  globalThis.Image=class{set src(value){this.srcValue=value;const b=fs.readFileSync('public'+value);this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);this.complete=true;queueMicrotask(()=>this.onload());}};
  await module.ensurePowerArt();module.drawPower(c,shape,0,'#638aff');assert.equal(draws.length,1);assert.ok(draws[0][0].srcValue.endsWith('vitalik-ethereum.png'));
  seen.set('reference-image:ethereum',id);continue;
 }
 const cells=new Set(),colors=new Set();
 const ctx=new Proxy({fillStyle:'#000',fillRect(x,y,w,h){colors.add(this.fillStyle);for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)cells.add(xx+','+yy);}}, {get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
 module.drawPower(ctx,shape,0,'#638aff');
 assert.ok(cells.size>80,id+' visible pixel object');
 const signature=[...cells].sort().join(';');assert.ok(!seen.has(signature),id+' must have a distinct opaque silhouette from '+seen.get(signature));seen.set(signature,id);
 assert.ok(colors.size>=3,id+' outlined color details');
 if(shape.startsWith('signature:')){const n=Number(shape.split(':')[1]);assert.ok(module.SIGNATURE_OBJECTS[n]);assert.ok(catalog.icons[module.SIGNATURE_OBJECTS[n].icon]);}
}
assert.equal(seen.size,Object.keys(changes).length,'every configured owner has a distinct visible projectile');
// Older semantic names must not secretly share the same fallback rectangle.
const retained=new Map();for(const shape of ['egg','drop','acid','needle','prism','rock','boulder','scrap']){
 const points=[];const c=new Proxy({fillStyle:'',fillRect(...a){points.push(a)}},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});module.drawPower(c,shape,0,'#638aff');const signature=JSON.stringify(points);assert.ok(!retained.has(signature),'distinct retained silhouette '+shape);retained.set(signature,shape);
}
assert.equal(changes.sproto651,'painting');
for(const id of ['sproto3152','sisma','captain','highsproto','michael','sproto2531','sproto3106'])assert.ok(!(id in changes),'existing signature preserved: '+id);
console.log(`PASS: ${seen.size} individually visible projectile silhouettes, reference artwork and object catalog, pixel palettes, Picasso painting, and protected signature exclusions.`);
