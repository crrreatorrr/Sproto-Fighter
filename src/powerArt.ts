/** Resolve public art under the build's HTML base; Node/diagnostic fixtures use root paths. */
const asset=(path:string)=>{
 const base=typeof document==='undefined'?'/':(document.querySelector?.('meta[name="sproto-asset-base"]') as HTMLMetaElement|null)?.content||'/';
 return base+path.replace(/^\/+/, '');
};
/** Pixel motifs and reference-derived projectile sprites. */
let retainCoin: HTMLImageElement | undefined;
let referenceB: HTMLImageElement | undefined;
let miniSproto: HTMLImageElement | undefined;
let ethereum: HTMLImageElement | undefined;
let weedLeaf: HTMLImageElement | undefined;
let sharedRanged:HTMLImageElement|undefined;
let specialEffects:HTMLImageElement|undefined;
let coinReady: Promise<void> | undefined;
export function ensurePowerArt(): Promise<void> {
 const load=(url:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{
  const image=new Image();image.onload=()=>resolve(image);
  image.onerror=()=>reject(new Error('Projectile sprite could not load: '+url));image.src=asset(url);
 });
 return coinReady ??= Promise.all([
  load('/fighters/powers/chad-retain-coin.png'),
  load('/fighters/powers/sproto3106-reference-b.png'),
  load('/fighters/powers/sproto2531-mini.png'),
  load('/fighters/powers/vitalik-ethereum.png'),
  load('/fighters/powers/highsproto-weed-leaf.png'),
  load('/fighters/powers/shared-ranged-atlas.png'),
  load('/fighters/powers/team-special-effects.png'),
 ]).then(([coin,b,mini,eth,leaf,ranged,effects])=>{retainCoin=coin;referenceB=b;miniSproto=mini;ethereum=eth;weedLeaf=leaf;sharedRanged=ranged;specialEffects=effects;}).catch(error=>{coinReady=undefined;throw error;});
}
export function drawSharedRanged(c:CanvasRenderingContext2D,index:number){
 if(!sharedRanged?.naturalWidth)return false;
 c.save();c.imageSmoothingEnabled=false;
 c.drawImage(sharedRanged,index%8*96,Math.floor(index/8)*96,96,96,-23,-23,46,46);
 c.restore();return true;
}
export function drawSpecialSprite(c:CanvasRenderingContext2D,index:number,x:number,y:number,size:number,angle:number,opacity:number){
 if(!specialEffects?.naturalWidth)return;
 c.save();c.imageSmoothingEnabled=false;c.globalAlpha*=opacity;
 c.translate(Math.round(x),Math.round(y));c.rotate(angle);
 c.drawImage(specialEffects,index%4*128,Math.floor(index/4)*128,128,128,-size/2,-size/2,size,size);
 c.restore();
}
/** A pixel stream starts exactly at the caller's covered pelvic anchor. */
export function drawPelvicStream(c:CanvasRenderingContext2D,reach:number,age:number){
 c.save();c.imageSmoothingEnabled=false;
 for(let x=0;x<=reach;x+=4){
  const u=x/Math.max(1,reach),y=Math.round(-10*Math.sin(u*Math.PI)+Math.sin((x+age*7)*.12)*u*2);
  c.fillStyle='#b68b16';c.fillRect(Math.round(x),y-3,5,7);
  c.fillStyle='#ffe65b';c.fillRect(Math.round(x),y-2,5,4);
  c.fillStyle='#fff6ab';c.fillRect(Math.round(x),y-2,4,1);
 }
 c.fillStyle='#ffe65b';for(let i=0;i<4;i++){const x=reach+3+i*5,y=Math.round(Math.sin(age*.8+i)*5+i*2);c.fillRect(Math.round(x),y,3,3);}
 c.restore();
}
/** Face-on rotation keeps the supplied circle fully visible at every angle. */
export function drawRetainIcon(c:CanvasRenderingContext2D,age:number,size=48){
 c.save();c.imageSmoothingEnabled=false;c.rotate(age*.09);
 if(retainCoin?.complete&&retainCoin.naturalWidth)c.drawImage(retainCoin,-size/2,-size/2,size,size);
 c.restore();
}
/** A KO changes Michael into the icon; living fighters keep their body art. */
export function drawRetainDefeat(c:CanvasRenderingContext2D,id:string,hp:number,x:number,floor:number,age:number):boolean{
 if(id!=='michael'||hp>0)return false;
 c.save();c.translate(Math.round(x),floor-68);drawRetainIcon(c,age,112);c.restore();return true;
}
export const VITALIK_DEFEAT_LINE='HarryPotterObamaSonic10Inu is not a scam';
/** A KO caption follows health, so it works for either side and clears on restart. */
export function drawVitalikDefeatCaption(c:CanvasRenderingContext2D,fighters:readonly {id:string;hp:number}[]):boolean{
 if(!fighters.some(f=>f.id==='vitaliketh'&&f.hp<=0))return false;
 c.save();c.fillStyle='#101725ed';c.fillRect(170,600,940,46);
 c.strokeStyle='#8e89a8';c.lineWidth=1;c.strokeRect(170.5,600.5,939,45);
 c.font='800 22px "Pixelify Sans", monospace';c.textAlign='center';c.fillStyle='#fff2cd';
 c.fillText(VITALIK_DEFEAT_LINE,640,630);c.restore();return true;
}
export function drawPower(c:CanvasRenderingContext2D,shape:string,age:number,color:string){
 c.save();c.imageSmoothingEnabled=false;c.fillStyle=color;c.strokeStyle=color;c.lineWidth=3;
 const box=(x:number,y:number,w:number,h:number,fill:string)=>{c.fillStyle=fill;c.fillRect(x,y,w,h);};
 if(shape==='painting'){
  box(-23,-18,46,36,'#40221c');box(-21,-16,42,32,'#eab34d');box(-17,-12,34,24,'#fff0ce');
  box(-14,-10,12,13,'#2655da');box(-2,-8,15,8,'#ec3e42');box(-8,3,20,6,'#e3b42c');box(6,-4,5,15,'#252744');
 }
 else if(shape.startsWith('signature:')){
  drawSignatureObject(c,Number(shape.split(':')[1]),age,color);
 }
 else if(shape==='referenceB'||shape==='miniSproto'){
  const image=shape==='referenceB'?referenceB:miniSproto;
  if(image?.complete&&image.naturalWidth){
   const h=shape==='referenceB'?52:46,w=image.naturalWidth*h/image.naturalHeight;
   c.drawImage(image,-w/2,-h/2,w,h);
  }else if(!coinReady)void ensurePowerArt().catch(error=>console.error(error));
 }
 else if(shape==='ethereum'){
  if(ethereum?.complete&&ethereum.naturalWidth){
   const h=48,w=ethereum.naturalWidth*h/ethereum.naturalHeight;
   c.rotate(age*.11);c.drawImage(ethereum,-w/2,-h/2,w,h);
  }else if(!coinReady)void ensurePowerArt().catch(error=>console.error(error));
 }
 else if(shape==='pelvicStream'){box(-8,-2,16,4,'#ffe65b');box(-4,-2,9,1,'#fff6ab');box(10,3,3,3,'#ffe65b');}
 else if(shape==='chadCoin'){
  drawRetainIcon(c,age);
 }
 else if(shape==='darkRing'){
  c.rotate(age*.045);
  for(let y=-9;y<=9;y++)for(let x=-9;x<=9;x++){
   const r=Math.hypot(x,y);if(r<5||r>9)continue;
   const ink=r>8?'#686174':r<5.8?'#393242':x<0&&y<0?'#302a3a':'#0d0b13';
   box(x*2-1,y*2-1,2,2,ink);
  }
 }
 else if(shape==='sun'){
  c.rotate(age*.055);
  for(let ray=0;ray<8;ray++)for(let tip=0;tip<4;tip++){
   const angle=ray*Math.PI/4,r=21+tip*3,size=6-tip;
   box(Math.round(Math.cos(angle)*r-size/2),Math.round(Math.sin(angle)*r-size/2),size,size,tip<2?'#ef8d18':'#ffc52e');
  }
  for(let y=-6;y<=6;y++)for(let x=-6;x<=6;x++){
   const r=Math.hypot(x,y);if(r>6)continue;
   box(x*3-1,y*3-1,3,3,r>5.5?'#a44a12':r>4.8?'#f5a51e':x<0&&y<0?'#fff49b':'#ffdf36');
  }
 }
 else if(shape==='yellowEight'){
  const rows=['001111100','011111110','111000111','110000011','110000011','111000111','011111110','001111100','011111110','111000111','110000011','110000011','110000011','111000111','011111110','001111100'];
  // Keep the numeral upright and readable, with a small throwing wobble.
  c.rotate(Math.sin(age*.24)*.12);
  for(let y=0;y<rows.length;y++)for(let x=0;x<9;x++)if(rows[y][x]==='1')box((x-4)*3-1,(y-8)*3-1,5,5,'#111828');
  for(let y=0;y<rows.length;y++)for(let x=0;x<9;x++)if(rows[y][x]==='1')box((x-4)*3,(y-8)*3,3,3,x>=6||y===15?'#d6a020':x<=2&&y<12?'#fff48a':'#ffe23b');
 }
 else if(shape==='skullBones'){
  // A complete pixel Jolly Roger tumbles as one hand-thrown object.
  c.rotate(age*.19);
  for(const direction of [-1,1])for(let i=-9;i<=9;i++)box(i*2-2,direction*i+10-2,5,5,'#172035');
  for(const direction of [-1,1])for(let i=-9;i<=9;i++)box(i*2-1,direction*i+10-1,3,3,'#fff3d5');
  for(const x of [-18,18])for(const y of [1,19]){box(x-3,y-3,6,6,'#172035');box(x-2,y-2,4,4,'#fff3d5');}
  box(-12,-17,24,20,'#172035');box(-15,-13,30,13,'#172035');box(-10,-15,20,18,'#fff3d5');box(-13,-11,26,11,'#fff3d5');
  box(-9,-9,6,6,'#090e1c');box(3,-9,6,6,'#090e1c');box(-2,-3,4,3,'#090e1c');
  box(-9,1,18,6,'#172035');for(const x of [-7,-2,3])box(x,1,4,4,'#fff3d5');
 }
 else if(shape==='egg'){
  // A pointed crown and broad rounded base keep the tumbling shell readable.
  const rows=[[7,9],[6,10],[5,11],[4,12],[4,12],[3,13],[3,13],[2,14],[2,14],[1,15],[1,15],[1,15],[0,16],[0,16],[0,16],[0,16],[1,15],[1,15],[2,14],[4,12],[6,10]];
  const inside=(x:number,y:number)=>y>=0&&y<rows.length&&x>=rows[y][0]&&x<=rows[y][1];
  c.rotate(age*.14);
  for(let y=0;y<rows.length;y++)for(let x=rows[y][0];x<=rows[y][1];x++){
   const edge=!inside(x-1,y)||!inside(x+1,y)||!inside(x,y-1)||!inside(x,y+1);
   const shell=edge?'#293042':x>=11||y>=17?'#d5bf91':x>=4&&x<=7&&y>=5&&y<=13?'#fffef7':'#fff0cd';
   box((x-8)*2,(y-10)*2,2,2,shell);
  }
 }
 else if(shape==='lowerTorsoBolt'){
  // The simulation spawns a separate shot at each reviewed lower-torso emitter.
  box(-14,-2,35,4,'#f43a32');
  box(-12,-1,31,2,'#fff2a0');
 }
 else if(shape==='eyeLaser'||shape==='chestLaser'){
  // Theo's two emitters are 20 world units apart and staggered by 5 vertically.
  const tracks=shape==='chestLaser'?[[-22,0],[-42,5]]:[[-22,-4],[-36,3]];
  for(const [x,y] of tracks){box(x,y-2,66,4,'#f13d35');box(x+3,y-1,64,2,'#fffbe2');}
 }
 else if(shape==='retain'){
  const font:Record<string,string[]>={R:['11110','10001','10001','11110','10100','10010','10001'],E:['11111','10000','10000','11110','10000','10000','11111'],T:['11111','00100','00100','00100','00100','00100','00100'],A:['01110','10001','10001','11111','10001','10001','10001'],I:['11111','00100','00100','00100','00100','00100','11111'],N:['10001','11001','11001','10101','10011','10011','10001']};
  const pixels:number[][]=[];for(const[letterIndex,letter]of [...'RETAIN'].entries())font[letter].forEach((row,y)=>[...row].forEach((bit,x)=>{if(bit==='1')pixels.push([-53+letterIndex*18+x*3,-10+y*3]);}));
  for(const[x,y]of pixels)box(x-1,y-1,5,5,'#17132c');for(const[x,y]of pixels)box(x,y,3,3,'#ffe66b');
 }
 else if(shape==='joint'){
  if(weedLeaf?.naturalWidth){
   const w=42,h=weedLeaf.naturalHeight*w/weedLeaf.naturalWidth;
   c.rotate(Math.sin(age*.32)*.15);c.drawImage(weedLeaf,-w/2,-h/2,w,h);
  }else if(!coinReady)void ensurePowerArt().catch(error=>console.error(error));
 }
 else if(shape==='egg'){box(-8,-12,16,24,'#e6d5ac');box(-12,-7,24,17,'#fff6de');box(-6,-15,12,6,'#fff6de');box(-3,-7,7,10,'#f3cf4a');box(-7,10,14,4,'#d7c39d');}
 else if(shape==='drop'){box(-2,-17,4,6,'#8bdcf5');box(-5,-11,10,6,'#51b5f1');box(-9,-5,18,6,'#3089db');box(-12,1,24,9,'#2073c6');box(-8,10,16,5,'#15539b');box(-5,-2,4,8,'#d6f8ff');}
 else if(shape==='acid'){box(-14,-6,27,12,'#76a72b');box(-9,-10,19,21,'#b4e862');box(-4,-13,10,6,'#dcff8d');box(12,-2,7,8,'#8eca3e');box(-8,8,5,7,'#91c73b');box(4,10,4,9,'#b4e862');box(-20,-3,4,5,'#b4e862');}
 else if(shape==='needle'){box(-24,-2,36,4,'#c7dbef');box(-18,-1,35,2,'#f7ffff');box(-26,-5,8,3,color);box(-26,2,8,3,color);box(12,-1,10,2,'#9baec9');box(21,0,4,1,'#ffffff');}
 else if(shape==='prism'){for(let row=-12;row<=12;row+=3){const width=26-Math.abs(row)*2;box(-width/2,row,width,3,row<0?'#b3edff':'#698be7');}box(-2,-10,3,21,'#edfaff');box(-9,-2,18,3,'#d8c8ff');}
 else if(shape==='rock'){box(-14,-5,28,13,'#626b7b');box(-10,-12,17,22,'#9a9ba7');box(7,-7,8,12,'#858a9b');box(-7,-10,8,4,'#dedbcc');box(-2,4,13,5,'#555d6f');}
 else if(shape==='boulder'){box(-19,-10,36,24,'#737880');box(-12,-18,24,34,'#a9aa9e');box(-23,-3,7,14,'#72746f');box(15,-9,7,20,'#6c7169');box(-11,-15,11,6,'#e0d9b9');box(0,-5,4,17,'#575e61');box(3,-5,9,3,'#575e61');box(-4,10,8,5,'#737a76');}
 else if(shape==='laser'){box(-58,-6,78,12,'#f13d35');box(-51,-3,73,6,'#ffd45b');box(-43,-1,65,2,'#fffbe2');box(20,-3,4,6,'#fffbe2');}
 else if(shape==='twin'){const wave=Math.round(Math.sin(age*.4)*6);box(-15,-9+wave,19,8,'#ff414e');box(-15,1-wave,19,8,'#3e9eff');box(4,-6,12,12,'#ffe07a');box(16,-3,6,6,'#fff3c3');}
 else if(shape==='pumpkin'){box(-13,-10,26,20,'#eb842c');box(-8,-13,16,26,'#ffad42');box(-2,-18,5,7,'#527f3b');box(-7,-5,4,4,'#34213d');box(5,-5,4,4,'#34213d');box(-5,4,12,3,'#34213d');}
 else if(shape==='heart'||shape==='brokenHeart'){const fill=shape==='heart'?'#f29aa8':'#ac88c5';box(-12,-9,10,10,fill);box(2,-9,10,10,fill);box(-12,0,24,5,fill);box(-8,5,16,5,fill);box(-3,10,6,4,fill);if(shape==='brokenHeart'){box(0,-8,4,7,'#251b38');box(-3,-1,4,7,'#251b38');box(0,6,3,7,'#251b38');}}
 else if(shape==='gift'){box(-12,-12,24,24,'#de4f5d');box(-3,-12,6,24,'#ffdc70');box(-12,-3,24,6,'#ffdc70');box(-8,-17,6,5,'#ffdc70');box(2,-17,6,5,'#ffdc70');}
 else if(shape==='coin'||shape==='ring'||shape==='chain'){c.strokeStyle=shape==='coin'?'#ffd84f':color;c.lineWidth=shape==='coin'?6:4;c.beginPath();c.ellipse(0,0,shape==='chain'?15:11,10,0,0,Math.PI*2);c.stroke();if(shape==='coin')box(-2,-6,4,12,'#fff2a4');if(shape==='chain'){c.beginPath();c.ellipse(-20,0,12,8,0,0,Math.PI*2);c.stroke();}}
 else if(shape==='seven'){box(-12,-12,25,5,'#ffe282');box(7,-7,6,6,'#ffe282');box(2,-1,6,7,'#ffe282');box(-3,6,6,7,'#ffe282');}
 else if(shape==='rock'||shape==='boulder'||shape==='scrap'){box(-13,-9,26,18,shape==='scrap'?'#a7b7b4':'#8d91a5');box(-8,-13,16,26,shape==='scrap'?'#7b9898':'#b8b8c5');box(-9,-9,7,5,'#e0d9c6');box(4,3,9,6,'#535869');}
 else if(shape==='paw'){box(-8,0,16,12,'#ffe479');for(const x of [-12,-4,4,12])box(x-3,-10+Math.abs(x)/3,6,7,'#ffe479');}
 else if(shape==='pixel'){for(let j=0;j<5;j++)box(j*6-17,(j%2?1:-1)*(3+age%4),5,5,color);box(8,-8,14,16,'#e1fffa');}
 else if(shape==='serpent'){for(let j=0;j<7;j++)box(13-j*7,Math.round(Math.sin((age+j)*.4)*7)-3,8,7,j===0?'#f3d870':color);box(15,-3,3,3,'#141727');}
 else if(shape==='prism'||shape==='needle'||shape==='arrow'){c.fillStyle=color;c.beginPath();c.moveTo(22,0);c.lineTo(-14,-8);c.lineTo(-7,0);c.lineTo(-14,8);c.closePath();c.fill();box(-4,-2,17,4,'#e8fffb');}
 else if(shape==='orb'){c.beginPath();c.arc(0,0,13,0,Math.PI*2);c.stroke();box(-4,-4,8,8,'#ded2ff');}
 else {box(-9,-9,22,18,shape==='acid'?'#b7ec68':color);box(11,-5,7,10,shape==='acid'?'#8abb37':color);box(-4,-6,9,4,'#efffc2');for(let j=1;j<=3;j++)box(-10-j*9,Math.round(Math.sin(age*.3+j)*5),6-j,6-j,color);}
 c.restore();
}








/** Individually selected object silhouettes, tied to costume, anatomy and props. */
const SIGNATURE_ICONS:Record<string,string[]> = {"fist": [" aaaa", "aaaaaa", "abbbbbba", "abbbbbba", " abbbba", "  aaaa"], "bottle": ["  aa", "  ab", " aaaa", "abbbba", "abccba", "abccba", " abba"], "yoyo": ["  aaaa", " abbbba", "abcaacba", "abcaacba", " abbbba", "  aaaa"], "grin": ["aa      aa", "abbaaaabba", " abbbbbba", "  acccca", "   aaaa"], "camera": ["   aaa", " aaaaaaaa", "abbbbbbbba", "abbaccabba", "abbaccabba", "abbbbbbbba", " aaaaaaaa"], "chain": [" aaa   aaa", "abbba abbba", "ab abbba ba", "abbba abbba", " aaa   aaa"], "case": ["   aaaa", "  aaaaaa", " aaaaaaaa", "abbbbbbbba", "abbbccbbba", "abbbbbbbba", " aaaaaaaa"], "fan": ["    a", "  aabaaa", " aabbbaaa", "aabbbbbaaa", "   abb", "    aa"], "shield": ["aaaaaaaa", "abbbbbba", "abccbcba", "abccbcba", " abbbba", "  abba", "   aa"], "feather": ["     aa", "   aabba", "  abbbba", " abbbaa", "abbaa", " aaa", "aa"], "bubble": [" aaaaaaaa", "abbbbbbbba", "abccbbccba", "abbbbbbbba", " abbaaaba", "   aa"], "envelope": ["aaaaaaaaaa", "abbbaabbba", "abbbccbbba", "abbbbbbbba", "aaaaaaaaaa"], "cone": ["      a", "   aaaba", "aaabbbba", "   aaaba", "      a"], "crown": ["a   a   a", "ab ab ab a", "abbbbbbbba", "abccbbccba", " aaaaaaaa"], "torch": ["   b", "  bcb", " bcccb", "  bbb", "  aaa", "   a", "   a"], "pendant": ["a      a", " a    a", "  a  a", "  abba", " abccba", "  abba", "   aa"], "beetle": [" aa aa", "  aaa", " abbba", "abbabba", "abbb bba", " abbba", " aa aa"], "nunchuk": [" aa      aa", " abaaaaaaab", " ab      ab", " ab      ab", " aa      aa"], "mask": [" aaaa aaaa", "abbbbabbbba", "abccbabccba", "abbbbabbbba", " aaaaaaaa"], "scepter": ["   aaa", "  abcba", "   aaa", "    a", "    a", "   aaa", "    a"], "monocle": [" aaaa", "abbbba", "abccbaaa", "abbbba", " aaaa a", "      a"], "teeth": ["aaaaaaaaaa", "abcbcbcbca", "abcbcbcbca", " aaaaaaaa"], "planet": ["    aaaa", " aabbbbaaa", "abbbbbbbba", " aaaabbbaa", "    aaaa"], "ribbon": ["a       a", "ab     ba", "abba abba", " abbbbba", "  aabaa", " ab  ba", " a    a"], "fish": ["  aa    a", " abba aaba", "abbbbbbbba", "abccbbbbba", " abba aaba", "  aa    a"], "bat": ["a        a", "ab aaaa ba", "abbabbabba", " abbbbbba", "  abbbba", "   aaaa"], "sun": ["  a a a", " aaaaaaa", " aabbbaa", "aabccbbbaa", " aabbbaa", " aaaaaaa", "  a a a"], "column": [" aaaaaa", "abccbcba", "abbbbbba", " aaaaaa", "abbbbbba", "abccbcba", " aaaaaa"], "staff": ["   aaaa", "  abbbba", "  ab a a", "   aaa", "    a", "    a", "    a", "    a"], "lasso": [" aaaaa", "abbbbba", "ab aa ba", "abbbbba", " aaaaaa", "      a", "      a"], "comb": ["a a a a a", "aba aba aba", "abbbbbbbba", " aaaaaaaa"], "spring": ["      aa", "   aaabb", " aaabb", " abbaa", "   abbaa", "    abb", " aaaabb", "aa"], "marble": ["   aaa", " aabbbba", "abccbbbba", "abbbbbcba", "abbbbbbaa", " aabbbba", "   aaa"], "eye": ["   aaaaa", " aabbbbbaa", "abbaccbbba", " aabbbbbaa", "   aaaaa"], "domino": ["aaaaaa", "abccba", "abccba", "abbbba", "aaaaaa", "abccba", "aaaaaa"], "button": [" aaa  aaa", "abcbaabcba", " abc  abc", "  aaaaa", "   aba", "   aaa"], "pin": ["  aa", " abba", " abba", "  aa", " abba", "abbbba", " aaaa"], "star": ["    a", "   aba", "aaabbbaaa", " abbbbba", "  abbba", " abb bba", "aa   aa"], "axe": ["      aaa", " aaaabccca", "abbabcccca", " aaaabccca", "    a aaa", "    a", "    a"], "crescent": ["   aaaa", " aabbaa", " abb", "abb", " abb", " aabbaa", "   aaaa"], "pinwheel": [" aa   a", " abba aa", "  abbaaba", "aaabbbbaaa", " ababba", " aa abba", " a   aa"], "medal": ["aa    aa", " ab  ba", "  abba", " abccba", "  abba", "   aa"], "tie": ["  aaaa", "   ab", "  abba", "  abba", " abbbba", "  abba", "   aa"], "collar": ["aa      aa", " ab    ba", " abbaabba", "  abbbba", "   abba", "    aa"], "mitten": ["   aaa", "  abbba", "aaabbba", "abbbbba", " abbbba", "  aaaa"], "snow": ["a   a   a", " aa a aa", "  aaaaa", "aaaabaaaa", "  aaaaa", " aa a aa", "a   a   a"], "heart": [" aaa aaa", "abbbabbba", "abbbbbbba", " abbbbba", "  abbba", "   aba", "    a"], "cap": [" aaaaaaa", "abbbbbbba", "abbbbbbba", " aaaaaaaaaaa"], "satellite": [" aa      aa", "abbaaaaabba", " abbcccbba", "abbaaaaabba", " aa      aa", "     a", "    aaa"], "cape": ["aaa   aaa", " abaaaba", " abbbbba", "abbbbbbba", "abbbbbbba", "aabbbbbaa", "a  aaa  a"], "bow": ["aaa   aaa", "abbaaabba", "abbacabba", "abbaaabba", "aaa   aaa"], "horn": ["       aa", " aaaaabbb", "abbbbbaaa", " aaaaabbb", "       aa"], "cartridge": [" aaaaaaaa", "abbbbbbbba", "abccccccba", "abccccccba", "abbbbbbbba", " aaaaaaaa", "  a a a"], "claw": ["a  a  a", "ab ab ab", "abbabbab", " abbbba", "  abba", "   aa"], "crest": ["aaaaaa", "abbbba", "abaaaa", "abbba", "abaaa", "ab", "aa"], "glasses": [" aaaa aaaa", "abbbbabbbba", "abccbabccba", " aaaa aaaa", "a         a"], "mic": ["  aaaa", " abccba", " abccba", "  aaaa", "   ab", "   ab", "   aa"], "gear": ["  aa  aa", " aaa aaaa", "aabbbbbbaa", " abccbcba", "aabbbbbbaa", " aaa aaaa", "  aa  aa"], "brain": ["  aaaaaa", " aabcabba", "abccabcba", "abacccabba", " aabccbaa", "   aaaa"], "cup": [" aaaaaaa", "abbbbbbaa", "abbbbba ba", "abbbbbaaa", " abbbba", " aaaaaaaa"], "jester": ["aa  aa  aa", " ab ab ab", " abbbbbba", "  abbbba", "   aaaa"], "fang": ["aaaaaa", "abbbba", " abbbba", "  abbba", "   aba", "    a"]};
export const SIGNATURE_OBJECTS:Record<number,{icon:string;detail:string;name:string;color:string}> = {"0": {"icon": "fist", "detail": "star", "name": "gold knuckle meteor", "color": "#efbd44"}, "5": {"icon": "bottle", "detail": "bubble", "name": "bong smoke flask", "color": "#6a9ee9"}, "7": {"icon": "yoyo", "detail": "ribbon", "name": "corded yo-yo", "color": "#6a9ee9"}, "8": {"icon": "grin", "detail": "teeth", "name": "red smile boomerang", "color": "#e84d55"}, "13": {"icon": "camera", "detail": "star", "name": "camera flash", "color": "#6a9ee9"}, "21": {"icon": "chain", "detail": "fist", "name": "linked duet gauntlets", "color": "#6a9ee9"}, "22": {"icon": "fist", "detail": "claw", "name": "bare-knuckle fist", "color": "#d5e7e8"}, "25": {"icon": "case", "detail": "tie", "name": "executive briefcase", "color": "#d5e7e8"}, "26": {"icon": "fan", "detail": "collar", "name": "gold robe fan", "color": "#efbd44"}, "27": {"icon": "shield", "detail": "eye", "name": "eye-emblem shield", "color": "#efbd44"}, "28": {"icon": "feather", "detail": "star", "name": "levitating feather", "color": "#efbd44"}, "29": {"icon": "bubble", "detail": "grin", "name": "meme speech bubble", "color": "#6a9ee9"}, "31": {"icon": "envelope", "detail": "crest", "name": "sealed ENS envelope", "color": "#6a9ee9"}, "32": {"icon": "cone", "detail": "eye", "name": "long-nose dart", "color": "#6a9ee9"}, "34": {"icon": "crown", "detail": "heart", "name": "royal crown", "color": "#efbd44"}, "35": {"icon": "torch", "detail": "medal", "name": "resolve torch", "color": "#efbd44"}, "36": {"icon": "pendant", "detail": "teeth", "name": "toothy pendant", "color": "#efbd44"}, "37": {"icon": "beetle", "detail": "eye", "name": "red-eyed beetle", "color": "#6a9ee9"}, "38": {"icon": "nunchuk", "detail": "chain", "name": "red-blue nunchucks", "color": "#e84d55"}, "39": {"icon": "mask", "detail": "glasses", "name": "double-face mask", "color": "#6a9ee9"}, "41": {"icon": "scepter", "detail": "crown", "name": "tiny-king scepter", "color": "#efbd44"}, "42": {"icon": "mitten", "detail": "fist", "name": "red palm glove", "color": "#e84d55"}, "43": {"icon": "monocle", "detail": "eye", "name": "asymmetric monocle", "color": "#d5e7e8"}, "44": {"icon": "teeth", "detail": "ribbon", "name": "gold-tooth comb", "color": "#efbd44"}, "45": {"icon": "planet", "detail": "button", "name": "orbital eyes", "color": "#6a9ee9"}, "46": {"icon": "ribbon", "detail": "horn", "name": "red ribbon dart", "color": "#e84d55"}, "47": {"icon": "fish", "detail": "grin", "name": "strange-lipped flying fish", "color": "#6a9ee9"}, "48": {"icon": "bat", "detail": "fang", "name": "vampire bat", "color": "#6a9ee9"}, "49": {"icon": "sun", "detail": "cape", "name": "sun-hair flare", "color": "#efbd44"}, "50": {"icon": "column", "detail": "mask", "name": "stacked-face totem", "color": "#6a9ee9"}, "51": {"icon": "staff", "detail": "crescent", "name": "spiral staff glyph", "color": "#6a9ee9"}, "52": {"icon": "lasso", "detail": "button", "name": "shoulder-loop lasso", "color": "#6a9ee9"}, "53": {"icon": "comb", "detail": "crown", "name": "yellow crest comb", "color": "#efbd44"}, "54": {"icon": "spring", "detail": "fang", "name": "zigzag fang spring", "color": "#efbd44"}, "55": {"icon": "fan", "detail": "feather", "name": "orange spike fan", "color": "#efbd44"}, "56": {"icon": "marble", "detail": "ribbon", "name": "blue belly marble", "color": "#6a9ee9"}, "57": {"icon": "eye", "detail": "star", "name": "eye-mark disc", "color": "#efbd44"}, "58": {"icon": "domino", "detail": "teeth", "name": "twin-tooth domino", "color": "#6a9ee9"}, "59": {"icon": "button", "detail": "marble", "name": "figure-eight buttons", "color": "#efbd44"}, "60": {"icon": "pin", "detail": "bow", "name": "duet juggling pin", "color": "#efbd44"}, "61": {"icon": "star", "detail": "sun", "name": "yellow-hair shooting star", "color": "#efbd44"}, "62": {"icon": "axe", "detail": "fang", "name": "hooked halberd blade", "color": "#e84d55"}, "63": {"icon": "crescent", "detail": "mask", "name": "floating crescent mask", "color": "#d5e7e8"}, "64": {"icon": "pinwheel", "detail": "sun", "name": "red-yellow pinwheel", "color": "#efbd44"}, "65": {"icon": "medal", "detail": "shield", "name": "vest relay medal", "color": "#efbd44"}, "66": {"icon": "tie", "detail": "pendant", "name": "yellow tie pendant", "color": "#efbd44"}, "67": {"icon": "collar", "detail": "star", "name": "white collar star", "color": "#d5e7e8"}, "68": {"icon": "mitten", "detail": "sun", "name": "giant yellow mitten", "color": "#efbd44"}, "69": {"icon": "snow", "detail": "eye", "name": "mint snow-eye crystal", "color": "#d5e7e8"}, "70": {"icon": "heart", "detail": "cape", "name": "red-blue heart brooch", "color": "#e84d55"}, "71": {"icon": "sun", "detail": "grin", "name": "golden grin sun", "color": "#efbd44"}, "73": {"icon": "pinwheel", "detail": "teeth", "name": "toothy windmill", "color": "#efbd44"}, "74": {"icon": "staff", "detail": "monocle", "name": "sage staff seal", "color": "#efbd44"}, "75": {"icon": "staff", "detail": "ribbon", "name": "twisted candy staff", "color": "#6a9ee9"}, "76": {"icon": "cap", "detail": "grin", "name": "yellow-cap spinner", "color": "#efbd44"}, "79": {"icon": "satellite", "detail": "mask", "name": "stomach-creature satellite", "color": "#6a9ee9"}, "80": {"icon": "cape", "detail": "shield", "name": "hero mantle crest", "color": "#6a9ee9"}, "81": {"icon": "bow", "detail": "teeth", "name": "red bow-tie blade", "color": "#e84d55"}, "82": {"icon": "horn", "detail": "grin", "name": "lip trumpet", "color": "#e84d55"}, "83": {"icon": "cartridge", "detail": "eye", "name": "machine game cartridge", "color": "#6a9ee9"}, "84": {"icon": "claw", "detail": "pendant", "name": "claw medallion", "color": "#efbd44"}, "85": {"icon": "crest", "detail": "bow", "name": "duet F crest", "color": "#6a9ee9"}, "86": {"icon": "medal", "detail": "heart", "name": "blue-gold robe medallion", "color": "#efbd44"}, "87": {"icon": "button", "detail": "collar", "name": "yellow belt buckle", "color": "#efbd44"}, "88": {"icon": "glasses", "detail": "claw", "name": "cat spectacles", "color": "#d5e7e8"}, "89": {"icon": "mic", "detail": "ribbon", "name": "stage microphone", "color": "#d5e7e8"}, "91": {"icon": "mask", "detail": "eye", "name": "triclops face shield", "color": "#d5e7e8"}, "92": {"icon": "gear", "detail": "pin", "name": "robot bolt gear", "color": "#d5e7e8"}, "93": {"icon": "column", "detail": "eye", "name": "stacked-eye tower", "color": "#6a9ee9"}, "94": {"icon": "tie", "detail": "case", "name": "formal red necktie", "color": "#e84d55"}, "95": {"icon": "fang", "detail": "claw", "name": "cat-fang crescent", "color": "#e84d55"}, "96": {"icon": "brain", "detail": "heart", "name": "orange brain pulse", "color": "#6a9ee9"}, "97": {"icon": "heart", "detail": "eye", "name": "cyclops heart sigil", "color": "#6a9ee9"}, "98": {"icon": "cup", "detail": "medal", "name": "sober tea-cup seal", "color": "#6a9ee9"}, "99": {"icon": "jester", "detail": "horn", "name": "clown horn cap", "color": "#6a9ee9"}, "100": {"icon": "grin", "detail": "mask", "name": "double-mouth chatter", "color": "#6a9ee9"}, "101": {"icon": "button", "detail": "eye", "name": "yellow belly-button disc", "color": "#efbd44"}};
function drawSignatureObject(c:CanvasRenderingContext2D,index:number,age:number,color:string){
 const item=SIGNATURE_OBJECTS[index];if(!item)return;
 const palette:Record<string,string>={a:'#152036',b:item.color,c:'#ffe05a'};
 const draw=(name:string,ox:number,oy:number,scale:number,detail=false)=>{
  const lines=SIGNATURE_ICONS[name],width=Math.max(...lines.map(r=>r.length));
  for(let y=0;y<lines.length;y++)for(let x=0;x<lines[y].length;x++){
   const bit=lines[y][x];if(bit===' ')continue;
   c.fillStyle=detail&&bit==='b'?'#e34c4b':palette[bit];
   c.fillRect(Math.round(ox+(x-width/2)*scale),Math.round(oy+(y-lines.length/2)*scale),scale,scale);
  }
 };
 // The secondary object is a meaningful attached ornament, not an ID stamp.
 draw(item.icon,-3,1,3);draw(item.detail,14,-10,2,true);
}
