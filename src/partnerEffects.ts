import {drawPower} from './powerArt';
import type {PartnerAttack} from './core';
export interface PartnerEffectSample {x:number;y:number;targetX:number;targetY:number;floor:number;age:number;beat:number;body:number;facing:number}
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
/** Distinct silhouettes, paths and impact patterns. Combat owns every contact. */
export function drawPartnerEffect(c:CanvasRenderingContext2D,attack:PartnerAttack,a:PartnerEffectSample){
 const {x,y,targetX:tx,targetY:ty,floor,age,body,facing}=a,u=clamp((age+8)/8),fade=age<0?u:1-age/10;
 c.save();c.globalAlpha*=fade;c.imageSmoothingEnabled=false;
 const pixel=(px:number,py:number,w:number,h:number,color=attack.color)=>{c.fillStyle=color;c.fillRect(Math.round(px),Math.round(py),w,h);};
 const path=(points:number[][],color=attack.color,width=5)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();for(const[i,p]of points.entries())i?c.lineTo(Math.round(p[0]),Math.round(p[1])):c.moveTo(Math.round(p[0]),Math.round(p[1]));c.stroke();};
 const ring=(cx:number,cy:number,r:number,color=attack.color)=>{for(let k=0;k<24;k++){const v=k*Math.PI/12;pixel(cx+Math.cos(v)*r,cy+Math.sin(v)*r,5,5,color);}};
 const object=(shape:string,px:number,py:number,scale=1)=>{c.save();c.translate(Math.round(px),Math.round(py));c.scale(scale,scale);drawPower(c,shape,age+8,attack.color);c.restore();};
 const movingX=x+(tx-x)*u,movingY=y+(ty-y)*u;
 switch(attack.kind){
  case 'prism':
   for(let k=0;k<4;k++){const bend=x+(tx-x)*.45,dy=(k-1.5)*36;path([[x,y+dy*.22],[bend,y+dy],[movingX,movingY]],k%2?'#f8ed91':attack.color,3);pixel(bend-4,y+dy-4,9,9,'#fff7d9');}
   if(age>=0)ring(tx,ty,22+age*7);break;
  case 'geyser':
   for(let k=0;k<5;k++){const px=tx+(k-2)*23,h=(115-Math.abs(k-2)*24)*fade;pixel(px,floor-h,13,Math.ceil(h));pixel(px+3,floor-h,4,Math.ceil(h),'#d7faff');pixel(px-4,floor-h-10,21,6);}
   for(let k=0;k<7;k++)pixel(tx+(k-3)*21,floor-30-Math.sin(k+age)*35-age*3,6,8);break;
  case 'comet':{
   const cy=movingY-155*Math.sin(u*Math.PI);for(let k=1;k<7;k++)pixel(movingX-facing*k*14,cy+k*7,11-k,6);
   pixel(movingX-27,cy,54,9);pixel(movingX-18,cy-17,35,18);pixel(movingX-11,cy-21,22,6,'#fffbc3');if(age>=0)ring(tx,ty,30+age*4,'#ffbd42');break;}
  case 'vortex':
   for(let k=0;k<44;k++){const angle=k*.56-age*.42,r=(20+k*1.5)*fade;pixel(tx+Math.cos(angle)*r,ty+Math.sin(angle)*r*.7,k%3?5:9,k%3?5:9,k%2?attack.color:'#ffc7ed');}
   for(let k=0;k<4;k++)path([[tx+facing*(50+k*19),ty-35+k*23],[tx,ty]],'#e088ff',2);break;
  case 'blitz':
   for(let k=0;k<9;k++)path([[x-facing*(45+k*7),y-34+k*9],[x-facing*(105+k*13),y-34+k*9]],k%2?'#ffe9bb':attack.color,4);
   if(age>=0){for(let k=0;k<12;k++){const angle=k*Math.PI/6;path([[tx+Math.cos(angle)*18,ty+Math.sin(angle)*18],[tx+Math.cos(angle)*(48+age*5),ty+Math.sin(angle)*(48+age*5)]],attack.color,6);}pixel(tx-9,ty-9,18,18,'#fffce9');}break;
  case 'dive':
   for(let k=0;k<6;k++){const py=ty-210+k*27,px=tx-facing*(120-k*20);path([[px-facing*20,py-12],[px,py+10],[px+facing*20,py-12]],k%2?'#ffe4ee':attack.color,5);}
   if(age>=0)path([[tx-70,floor],[tx,floor-45],[tx+70,floor]],attack.color,8);break;
  case 'halberd':{
   const points=[];for(let k=0;k<18;k++){const v=-2.3+k*.17;points.push([tx+Math.cos(v)*110*facing,floor-35+Math.sin(v)*70]);}
   path(points,'#fff1df',12);path(points,attack.color,6);path([[tx-facing*80,floor-12],[tx+facing*80,floor-12]],'#e8b660',5);break;}
  case 'eights':
   for(let k=0;k<3;k++){const end=tx+(k-1)*47,px=x+(end-x)*u,py=y+(ty-y)*u-145*Math.sin(u*Math.PI)-(k%2)*30;object('yellowEight',px,py,.65+k*.13);}
   if(age>=0)for(let k=0;k<7;k++)pixel(tx+(k-3)*18,ty+35+Math.sin(k)*18,5,8);break;
  case 'storm':{
   const top=Math.max(120,ty-260);for(let branch=0;branch<3;branch++){const points=[];for(let k=0;k<9;k++)points.push([tx+(branch-1)*22+(k%2?25:-18),top+(floor-top)*k/8]);path(points,attack.color,9);path(points,'#f9f4ff',3);}
   path([[x,y],[x+facing*20,y-75],[tx,top]],'#b585ed',3);break;}
  case 'frost':
   path([[x,floor-5],[tx+facing*90,floor-5]],'#d9ffff',5);
   for(let k=0;k<8;k++){const px=tx+(k-4)*25,h=(k%2?58:88)*fade;c.fillStyle=k%2?attack.color:'#d9ffff';c.beginPath();c.moveTo(px-12,floor);c.lineTo(px+facing*9,floor-h);c.lineTo(px+14,floor);c.closePath();c.fill();}
   for(let k=0;k<8;k++)pixel(tx+(k-4)*23,ty-25+(k%3)*18-age*3,5,5);break;
  case 'crossfire':
   if(body===0){for(let k=-1;k<=1;k++)path([[x,y],[movingX,movingY+k*35]],'#ff4c60',8);}
   else{const points=[];for(let k=0;k<12;k++)points.push([x+(movingX-x)*k/11,y+(ty+35-y)*k/11+(k%2?12:-12)]);path(points,'#49b9ff',9);path(points,'#d7f6ff',3);}
   break;
  case 'quakeDive':
   if(body===0){path([[x,y-95],[tx-facing*45,ty-100],[tx,ty]],'#ffec6d',8);for(let k=0;k<5;k++)pixel(tx-facing*k*11,ty-k*18,7,12,'#fff8cf');}
   else{for(let k=0;k<4;k++){const width=24+k*27+age*3;path([[tx-width,floor],[tx-width/2,floor-15-k*6],[tx,floor],[tx+width/2,floor-15-k*6],[tx+width,floor]],k%2?'#a77e53':'#ffdb75',6);}for(let k=0;k<5;k++)object('boulder',tx+(k-2)*38,floor-20-Math.sin(k+age)*24,.45);}
   break;
  case 'boomerang':
   if(body===0){object('boulder',movingX,movingY-95*Math.sin(u*Math.PI),1.7);for(let k=0;k<5;k++)pixel(movingX-facing*(25+k*12),movingY+12,8-k,7-k,'#c2b08c');}
   else{const back=age<0?u:1-age/12,px=x+(tx-x)*back,py=y+(ty-y)*back+Math.sin(back*Math.PI)*55;ring(px,py,25,'#ffe374');ring(px,py,13,'#fff7c9');path([[px-facing*20,py+12],[px-facing*65,py+17]],'#7be7c1',5);}
   break;
 }
 c.restore();
}
