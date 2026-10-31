const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const{createCanvas,Image:NativeImage}=require('/tmp/higgsfield-rig-qa/node_modules/@napi-rs/canvas');
const root=path.resolve(__dirname,'../../..');
class SourceImage extends NativeImage{set src(v){this.assetUrl=v;super.src=path.join(root,'public',v.split('?')[0]);}get src(){return super.src;}}
global.Image=SourceImage;global.fetch=async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,'public/fighters/rig-data.json'),'utf8'))});
const art=require('/tmp/higgsfield-rig-qa/build/higgsfieldRig.js'),core=require('/tmp/higgsfield-rig-qa/build/core.js');
(async()=>{await art.loadHiggsfieldRigs();const ids=art.loadedHiggsfieldRigIds(),freeze=[];
for(const id of ids){const f=core.createState(id,'dummy').fighters[0];f.x=450;const m=core.getMove(f,'light');f.move={id:'light',t:m.startup-1,hit:false,connected:false,wave:0};
 const render=(frame,frozen)=>{const canvas=createCanvas(900,720),c=canvas.getContext('2d');art.drawHiggsfieldFighter(c,f,frame,false,frozen);return canvas.toBuffer('image/png');};
 const windup=render(100,false);f.move.t=m.startup;const contact=render(101,true);assert.ok(!windup.equals(contact),id+' contact must replace windup');for(let frame=102;frame<109;frame++)assert.ok(contact.equals(render(frame,true)),id+' hitstop must not breathe/drift');freeze.push(id);}
const foot=[];for(const id of ['rivet','vela']){const f=core.createState(id,'dummy').fighters[0];f.vx=5.5;let previous={},maxDrift=0,comparisons=0;
 for(let i=0;i<90;i++){f.x=350+i*2;const canvas=createCanvas(1000,720),c=canvas.getContext('2d'),draw=c.drawImage.bind(c),current={};c.drawImage=(im,...args)=>{if(im.assetUrl?.includes('Foot.png')){const t=c.getTransform();current[im.assetUrl]={x:t.e,y:t.f};}return draw(im,...args);};art.drawHiggsfieldRigSample(c,f,100+i);
 for(const [name,p]of Object.entries(current)){const prev=previous[name],ground=core.FLOOR-7*1.35;if(prev&&Math.abs(p.y-ground)<.12&&Math.abs(prev.y-ground)<.12){maxDrift=Math.max(maxDrift,Math.abs(p.x-prev.x));comparisons++;}}previous=current;}
 assert.ok(comparisons>20,id+' stance samples');assert.ok(maxDrift<.5,id+' planted foot drift '+maxDrift);foot.push({id,comparisons,maxDrift});}
const result={revision:JSON.parse(fs.readFileSync(path.join(root,'public/fighters/rig-data.json'))).revision,firstContactThenFrozen:freeze.length,freezeFramesPerFighter:8,plantedFeet:foot};fs.writeFileSync(path.join(__dirname,'runtime','motion-checks.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));})();
