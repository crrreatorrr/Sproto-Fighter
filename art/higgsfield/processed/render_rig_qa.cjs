/** Offscreen execution of the actual TypeScript rig renderer, no alternative art. */
const fs=require('node:fs'),path=require('node:path');
const {createCanvas,Image:NativeImage}=require('/tmp/higgsfield-rig-qa/node_modules/@napi-rs/canvas');
const root=path.resolve(__dirname,'../../..');
class SourceImage extends NativeImage {set src(v){super.src=path.join(root,'public',v.split('?')[0]);}get src(){return super.src;}}
global.Image=SourceImage;global.fetch=async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,'public/fighters/rig-data.json'),'utf8'))});
const art=require('/tmp/higgsfield-rig-qa/build/higgsfieldRig.js'),core=require('/tmp/higgsfield-rig-qa/build/core.js');
const poses=[['idle',0],['walk',4],['walk',12],['walk',20],['jump',12],['fall',25],['crouch',20],['dash',10],['light',0],['light',1],['light',2],['medium',1],['heavy',1],['launcher',1],['bolt-level',1],['bolt-up',1],['bolt-upForward',1],['bolt-down',1],['airLight',1],['airMedium',1],['airHeavy',1],['grab',1],['hit',15],['block',12],['special',12],['special',27],['special',42],['special',65],['throw-hold',6],['throw-release',6],['victim-hold',6],['victim-release',6]];
function configure(id,pose,n,facing=1){const s=core.createState(id,'dummy'),f=s.fighters[0];f.facing=facing;f.x=110;f.y=core.FLOOR;let frame=90+n;
 if(pose==='walk'){f.vx=5;f.x+=n;}else if(pose==='jump'||pose==='fall'){f.y-=12;f.vy=pose==='jump'?-10:7;}
 else if(pose==='crouch')f.input=core.A.down;else if(pose==='dash')f.dash=6;else if(pose==='hit')f.stun=16;else if(pose==='block')f.blockstun=12;
 else if(pose.startsWith('throw')||pose.startsWith('victim')){
 const isVictim=pose.startsWith('victim'),a=isVictim?1:0,v=isVictim?0:1,phase=pose.endsWith('hold')?'hold':'release';
 const direction=pose.split('-').length===3?pose.split('-')[1]:'forward',af=isVictim?-facing:facing;
 s.fighters[a].facing=af;s.fighters[v].facing=-af;s.fighters[a].x=isVictim?110-55*af:110;s.fighters[v].x=s.fighters[a].x+55*af;s.fighters[v].y=core.FLOOR;
 const dir=direction==='up'?core.A.up:direction==='down'?core.A.down:direction==='back'?(af===1?core.A.left:core.A.right):(af===1?core.A.right:core.A.left);
 let input=[0,0];input[a]=core.A.grab|dir;core.step(s,input);
 let found=false;for(let tick=0;tick<220;tick++){input=[0,0];core.step(s,input);if(s.throwState?.phase===phase&&s.throwState.t>=n){found=true;break;}}
 if(!found)throw Error('Throw simulation failed '+id+' '+pose+' facing'+facing);
 if(s.throwState.direction!==direction)throw Error('Wrong simulated throw direction '+id+' '+direction+' got '+s.throwState.direction);
 frame=s.frame;art.setHiggsfieldThrowState(s.throwState,s.fighters);
 }
 else if(pose!=='idle'){const [id,aim='level']=pose.split('-'),m=core.getMove(f,id);f.move={id,t:pose==='special'?n:n===0?m.startup-2:n===1?m.startup+Math.min(2,m.active-1):m.startup+m.active+Math.floor(m.recovery*.5),hit:false,connected:true,wave:0,aim,shotX:aim==='up'||aim==='down'?0:1,shotY:aim==='up'||aim==='upForward'?-1:aim==='down'?1:0};if(id.startsWith('air')){f.y-=10;f.vy=-1;}}
 return {f,frame,s};}
const moves=['light','medium','heavy','low','sweep','airLight','airMedium','airHeavy','launcher','bolt','grab','special'];
const combat=moves.flatMap(id=>[0,1,2].map(n=>[id==='special'?'special-phase':id,n])).concat(['light','medium','heavy','launcher','airLight','airMedium','airHeavy'].flatMap(id=>['up','upForward','down'].map(aim=>[id+'-'+aim,1])));
const throws=['forward','back','up','down'].flatMap(dir=>['throw','victim'].flatMap(role=>['hold','release'].map(phase=>[role+'-'+dir+'-'+phase,6])));
(async()=>{await art.loadHiggsfieldRigs();const ids=art.loadedHiggsfieldRigIds();let draws=0;const sets=[['poses',poses,220],['combat',combat,220],['throws',throws,280]];
for(const id of ids){const contacts=core.COMBAT_STYLES[id].specialFrames;const specialSamples=[['special',Math.max(0,contacts[0]-5)],...contacts.flatMap(t=>[-3,0,3].map(d=>['special',t+d])),['special',contacts.at(-1)+18]];const fighterSets=sets.map(([kind,list,cw])=>[kind,kind==='poses'?list.map(([p,n])=>[p,p==='special'?n===12?contacts[0]:n===27?contacts[Math.floor(contacts.length/2)]:n===42?contacts.at(-1):contacts.at(-1)+18:n]):list,cw]).concat([['specials',specialSamples,220]]);for(const facing of [1,-1]){for(const [kind,list,cw]of fighterSets){if(process.env.QA_SET&&kind!==process.env.QA_SET)continue;const ch=kind==='throws'?320:235,baseline=kind==='throws'?285:205,canvas=createCanvas(8*cw,Math.ceil(list.length/8)*ch),c=canvas.getContext('2d');c.fillStyle='#30394b';c.fillRect(0,0,canvas.width,canvas.height);
 list.forEach(([pose,n],i)=>{art.setHiggsfieldThrowState(null,[]);const {f,frame,s}=configure(id,pose,n,facing);const col=i%8,row=Math.floor(i/8);c.save();const pairShift=kind==='throws'?cw/2-(s.fighters[0].x+s.fighters[1].x)/2:cw/2-f.x;c.translate(col*cw+pairShift,row*ch+baseline-core.FLOOR);if(kind==='throws'){c.save();c.globalAlpha=.55;const other=s.fighters[1];art.drawHiggsfieldRigSample(c,other,frame);c.restore();}if(!art.drawHiggsfieldRigSample(c,f,frame))throw Error('missing '+id);c.restore();c.fillStyle='#7890a8';c.fillRect(col*cw,row*ch+baseline,cw,1);c.fillStyle='#edf1f8';c.font='12px sans-serif';c.fillText(pose+' '+n,col*cw+6,row*ch+baseline+19);draws++;});fs.writeFileSync(path.join(__dirname,'runtime',id+'-'+kind+(facing===1?'':'-mirrored')+'.png'),canvas.toBuffer('image/png'));if(kind==='poses'&&facing===-1)fs.writeFileSync(path.join(__dirname,'runtime',id+'-mirrored.png'),canvas.toBuffer('image/png'));
 }}}
 const audit={renderer:'actual src/higgsfieldRig.ts compiled toCommonJS with native Canvas',revision:JSON.parse(fs.readFileSync(path.join(root,'public/fighters/rig-data.json'))).revision,ids,sets:sets.map(([name,list])=>({name,poses:list.map(p=>p[0]+' '+p[1])})),specialContacts:Object.fromEntries(ids.map(id=>[id,core.COMBAT_STYLES[id].specialFrames])),specialSampling:'each contact -3, exact, +3; anticipation; recovery',orientations:['right','left'],draws,errors:0};fs.writeFileSync(path.join(__dirname,'runtime',process.env.QA_SET?'audit-'+process.env.QA_SET+'.json':'audit.json'),JSON.stringify(audit,null,2));console.log('Rendered',draws,'actual-runtime poses:',ids.length,'fighters, both facings; core throw direction assertions passed');})();
