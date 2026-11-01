#!/usr/bin/env python3
"""Reference-led local face retouch. Idempotent from per-fighter identity-baseline/.
Run: python3 art/pose-atlases/fix_identity_details.py
After importing new poses: --ids mox guest08 --refresh-slots 17,18,22,23
Only touches the three owned processed directories and this script's config.
"""
import argparse,json,math,shutil,hashlib
from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np
ROOT=Path(__file__).resolve().parent; OUT=ROOT/'processed'; CFG=ROOT/'identity-details-config.json'
AP=argparse.ArgumentParser();AP.add_argument('--ids',nargs='+',default=['mox','guest07','guest08'],choices=['mox','guest07','guest08']);AP.add_argument('--refresh-slots',default='');AP.add_argument('--only-slots',default='');args=AP.parse_args()
refresh={int(x) for x in args.refresh_slots.split(',') if x}; only={int(x) for x in args.only_slots.split(',') if x}; config=json.loads(CFG.read_text()) if CFG.exists() else {}
ANGLES={'mox':{15:-28,24:-32,22:-8,23:-8},'guest07':{15:-16,24:-34,31:-18},'guest08':{15:-18,24:-28}}
def mouth_box(im):
 a=np.array(im).astype(int); mask=(a[:,:,0]>35)&(a[:,:,0]>a[:,:,1]*1.6)&(a[:,:,0]>a[:,:,2]*1.5)&(a[:,:,3]>190);seen=set();comps=[]
 for yy,xx in zip(*np.where(mask)):
  x,y=int(xx),int(yy)
  if (x,y) in seen:continue
  st=[(x,y)];seen.add((x,y));pts=[]
  while st:
   u,v=st.pop();pts.append((u,v))
   for q,r in [(u-1,v),(u+1,v),(u,v-1),(u,v+1)]:
    if 0<=q<im.width and 0<=r<im.height and mask[r,q] and (q,r) not in seen:seen.add((q,r));st.append((q,r))
  xs,ys=zip(*pts);b=[min(xs),min(ys),max(xs)+1,max(ys)+1]
  if len(pts)>2 and b[2]-b[0]>=3:comps.append(b)
 return min(comps,key=lambda b:b[1])
def retouch(im,id,b,angle):
 old=im.copy(); layer=Image.new('RGBA',im.size);d=ImageDraw.Draw(layer);x0,y0,x1,y1=b;w=x1-x0;h=y1-y0;cx=(x0+x1)/2;cy=(y0+y1)/2;rad=math.radians(angle)
 # Coordinates are normalized to the detected red mouth, then rotated with head.
 def pt(x,y):return (round(cx+x*w*math.cos(rad)-y*h*math.sin(rad)),round(cy+x*w*math.sin(rad)+y*h*math.cos(rad)))
 def poly(points,fill,outline=None):d.polygon([pt(*p) for p in points],fill=fill);d.line([pt(*p) for p in points+[points[0]]],fill=outline,width=1) if outline else None
 def line(points,fill,width=1):d.line([pt(*p) for p in points],fill=fill,width=width)
 ink=(9,12,31,255)
 if id=='guest08':
  # Remove the two generated fangs, retaining muzzle outline, cheek and eyes.
  a=np.array(im);p=np.array(layer)
  for y in range(y0,y1):
   for x in range(x0,x1):
    r,g,bl,al=map(int,a[y,x]);
    if al and min(r,g,bl)>130:p[y,x]=(193,4,13,255)
  layer=Image.fromarray(p);d=ImageDraw.Draw(layer)
  # Broad smile opening and three spaced rounded teeth, not pointed fangs.
  poly([(-.38,-.04),(-.1,.02),(.22,-.02),(.43,-.14),(.36,.29),(.18,.42),(-.10,.39),(-.29,.23)],(145,2,16,255),ink)
  line([(-.36,-.06),(-.08,.01),(.20,-.03),(.41,-.15)],(247,215,55,255))
  for c in [-.19,.055,.285]:
   top=-.015 if c<.15 else -.07
   poly([(c-.06,top),(c+.06,top),(c+.06,top+.15),(c+.025,top+.22),(c-.025,top+.22),(c-.06,top+.15)],(249,246,225,255))
  # Small red triangular nose under eye bridge, visibly separate from muzzle.
  poly([(.12,-.60),(.04,-.34),(.12,-.23),(.22,-.25),(.26,-.37)],(224,19,21,255),ink)
  line([(.15,-.21),(.15,-.10)],ink)
 elif id=='guest07':
  # Keep original eye pixels. Reshape upper muzzle into a tall angular ridge.
  poly([(-.48,-.10),(-.18,-.35),(.05,-.50),(.22,-.39),(.47,-.28),(.53,-.04),(.32,.11),(-.08,.14)],(213,12,20,255),ink)
  line([(.05,-.46),(.00,-.20),(-.09,-.10),(-.24,-.15)],(89,9,24,255))
  line([(.19,-.35),(.29,-.20),(.43,-.22)],(100,9,24,255))
  # Preserve layered lower lip, with angled fold lines instead of generic beak.
  poly([(-.46,.10),(-.05,.08),(.45,.12),(.39,.32),(.15,.48),(-.14,.40),(-.39,.23)],(192,8,25,255),ink)
  line([(-.34,.23),(-.02,.25),(.31,.28)],(92,9,25,255))
  # Sparse throat/cheek creases only on existing blue skin, never on arms/air.
  creases=Image.new('RGBA',im.size);cd=ImageDraw.Draw(creases)
  for points in [[(-.75,.15),(-.64,.04),(-.55,.13)],[(-.72,.55),(-.48,.65),(-.31,.61)],[(-.68,.82),(-.5,.91),(-.32,.88)]]:cd.line([pt(*p) for p in points],fill=(0,47,126,255),width=1)
  a=np.array(old);c=np.array(creases);valid=(a[:,:,2]>a[:,:,0]+30)&(a[:,:,2]>a[:,:,1]+25)&(a[:,:,3]>190);c[~valid]=0;layer.alpha_composite(Image.fromarray(c))
 else:
  # A shaggy lower cheek/chin with three points, above the yellow collar.
  poly([(-1.00,.0),(-.77,.45),(-.88,.82),(-.59,.62),(-.65,1.1),(-.34,.70),(-.33,1.0),(-.08,.58),(.22,.45)],(49,66,184,255))
  line([(-.77,.45),(-.88,.82),(-.59,.62),(-.65,1.1),(-.34,.70),(-.33,1.0),(-.08,.58)],ink)
  # Clear generated tiny teeth above the replacement mouth, avoiding eye region.
  a=np.array(old)
  for yy in range(max(0,y0-5),y1):
   for xx in range(max(0,x0-1),min(im.width,x1+1)):
    if min(map(int,a[yy,xx,:3]))>105 and a[yy,xx,3]>190:d.point((xx,yy),fill=(49,66,184,255))
  # Wider dark mouth aperture, separate tapered upper fangs, maroon lower lip.
  poly([(-.48,-.32),(-.14,-.53),(.46,-.48),(.50,.10),(.23,.48),(-.11,.41),(-.43,.13)],(71,7,24,255),ink)
  poly([(-.40,-.20),(-.12,-.38),(.41,-.36),(.34,.08),(-.12,.14)],(6,8,20,255))
  for c in [-.23,.04,.30]:poly([(c-.04,-.34),(c+.065,-.34),(c-.015,.18)],(247,242,214,255))
  line([(-.28,.24),(-.03,.31),(.22,.23)],(132,24,33,255))
 # Keep occluding hands in block frames: do not paint face details over skin guard.
 if id in ['guest07','guest08']:
  a=np.array(old);p=np.array(layer)
  if id=='guest08':occlude=(a[:,:,0]>130)&(a[:,:,1]>100)&(a[:,:,2]<80)&(np.indices(a.shape[:2])[0]>y0+h*.4)
  else:occlude=(a[:,:,2]>a[:,:,0]+40)&(a[:,:,1]>50)&(np.indices(a.shape[:2])[1]>x1-2)&(np.indices(a.shape[:2])[0]>cy)
  p[occlude]=0
  if id=='guest07':p[:y0]=0
  layer=Image.fromarray(p)
 im.alpha_composite(layer);return im
for id in args.ids:
 folder=OUT/id;base=folder/'identity-baseline';base.mkdir(exist_ok=True);records=[];faces=Image.new('RGBA',(8*280,4*300),(187,197,206,255));fd=ImageDraw.Draw(faces);contact=Image.new('RGBA',(1024,2048),(39,54,72,255))
 config.setdefault(id,{})
 for i,p in enumerate(sorted(folder.glob('[0-9][0-9]-*.png'))):
  src=base/p.name
  if only and i not in only:
   im=Image.open(p).convert('RGBA');contact.alpha_composite(im,(i%4*256,i//4*256));continue
  if not src.exists() or i in refresh:shutil.copy2(p,src);config[id].pop(str(i),None)
  im=Image.open(src).convert('RGBA');before=im.copy()
  if str(i) not in config[id]:config[id][str(i)]={'mouthBox':mouth_box(im),'angle':ANGLES[id].get(i,0)}
  cfg=config[id][str(i)];im=retouch(im,id,cfg['mouthBox'],cfg['angle']);im.save(p)
  a=np.array(before);b=np.array(im);changed=np.any(a!=b,axis=2);ys,xs=np.where(changed);bounds=[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)] if len(xs) else None
  records.append({'slot':i,'file':p.name,'changedPixels':int(changed.sum()),'bounds':bounds,'sourceSHA256':hashlib.sha256(src.read_bytes()).hexdigest()})
  contact.alpha_composite(im,(i%4*256,i//4*256));mb=cfg['mouthBox'];cx=(mb[0]+mb[2])//2;cy=mb[1]-8;crop=im.crop((cx-35,cy-35,cx+35,cy+35)).resize((280,280),Image.Resampling.NEAREST);faces.alpha_composite(crop,(i%8*280,i//8*300+20));fd.text((i%8*280+4,i//8*300+3),f'{i:02} {p.stem[3:]}',fill='black')
 contact.save(folder/'contact.png');contact.save(folder/'identity-native.png');faces.save(folder/'identity-faces-4x.png');(folder/'identity-retouch-report.json').write_text(json.dumps(records,indent=2)+'\n');print(id,len(records),'frames retouched; changed',sum(r['changedPixels'] for r in records),'pixels')
CFG.write_text(json.dumps(config,indent=2)+'\n')
