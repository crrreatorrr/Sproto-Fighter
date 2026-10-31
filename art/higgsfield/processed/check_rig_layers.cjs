/** Structural safeguards; these do not certify visual quality or game feel. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createCanvas,Image:NativeImage}=require('/tmp/higgsfield-rig-qa/node_modules/@napi-rs/canvas');
const root=path.resolve(__dirname,'../../..');
class SourceImage extends NativeImage{set src(v){this.assetUrl=v;super.src=path.join(root,'public',v.split('?')[0]);}get src(){return super.src;}}
global.Image=SourceImage;global.fetch=async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,'public/fighters/rig-data.json'),'utf8'))});
const art=require('/tmp/higgsfield-rig-qa/build/higgsfieldRig.js'),core=require('/tmp/higgsfield-rig-qa/build/core.js');
(async()=>{await art.loadHiggsfieldRigs();let samples=0,maxTextureStretch=0;const rear=['zephyr','mox','guest08','guest09','guest11','guest13','dumpstar','vamp','mandela','nate'];
for(const id of core.PLAYABLE_FIGHTERS)for(const facing of [1,-1])for(const move of ['light','medium','heavy','sweep','airMedium','airHeavy','launcher','bolt','special']){
 const f=core.createState(id,'dummy').fighters[0],m=core.getMove(f,move);f.x=350;f.facing=facing;
 for(const t of [Math.max(0,m.startup-3),m.startup,m.startup+m.active+4]){
  f.move={id:move,t,aim:'level',hit:false,connected:false,wave:0};const c=createCanvas(700,700).getContext('2d'),draw=c.drawImage.bind(c),order=[];
  c.drawImage=(image,...args)=>{const name=image.assetUrl.split('/').at(-1).split('?')[0];order.push(name);const a=c.getTransform();const trace=a.a*a.a+a.b*a.b+a.c*a.c+a.d*a.d,det=(a.a*a.d-a.b*a.c)**2;const max=Math.sqrt((trace+Math.sqrt(Math.max(0,trace*trace-4*det)))/2)/1.35;assert.ok(Number.isFinite(max),id+' finite texture transform');maxTextureStretch=Math.max(maxTextureStretch,max);assert.ok(max<=1.450001,id+' bounded texture stretch '+name+' '+max);return draw(image,...args);};
  art.drawHiggsfieldRigSample(c,f,t);
  if(t===m.startup&&rear.includes(id)&&['light','heavy','special'].includes(move))assert.ok(order.lastIndexOf('backHand.png')>order.indexOf('torso.png'),id+' attacking hand visible in front of torso');
  if(t===m.startup&&['medium','sweep','airMedium','airHeavy'].includes(move))assert.ok(order.indexOf('frontFoot.png')>order.indexOf('pelvis.png'),id+' working leg foreground');
  samples++;
 }
}
const result={samples,fighters:21,facings:2,moveTypes:9,phases:3,maxTextureStretch,checks:['finite transforms','texture cap 1.45','rear working hand foreground','kicking leg foreground'],limitation:'Structural draw-order checks only; not pixel visibility, anatomy or aesthetic approval.'};fs.writeFileSync(path.join(__dirname,'runtime/layer-checks.json'),JSON.stringify(result,null,2));console.log(result);})();
