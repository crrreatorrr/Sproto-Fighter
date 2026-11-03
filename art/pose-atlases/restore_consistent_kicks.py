#!/usr/bin/env python3
"""Restore original-volume kick poses for VAMP, Nate and Virtuagram only.
Imports full original atlases to a temporary directory, copies only17/18/22/23,
retouches VAMP footwear and Virtuagram pupils, installs exactly those12PNGs.
"""
from pathlib import Path
import importlib.util,tempfile,json,subprocess,sys,shutil
from PIL import Image,ImageDraw
import numpy as np
ROOT=Path(__file__).resolve().parent;REPO=ROOT.parents[1];SLOTS=[17,18,22,23]
spec=importlib.util.spec_from_file_location('atlas_import',ROOT/'import_atlas.py');api=importlib.util.module_from_spec(spec);spec.loader.exec_module(api)
def hull(points):
 points=sorted(set(points));lo=[];hi=[]
 def cross(o,a,b):return(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0])
 for v in points:
  while len(lo)>1 and cross(lo[-2],lo[-1],v)<=0:lo.pop()
  lo.append(v)
 for v in reversed(points):
  while len(hi)>1 and cross(hi[-2],hi[-1],v)<=0:hi.pop()
  hi.append(v)
 return lo[:-1]+hi[:-1]
def pupil_config(im):
 a=np.array(im);white=(a[:,:,0]>190)&(a[:,:,1]>190)&(a[:,:,2]>180)&(a[:,:,3]>128)
 # These four inspected original poses have unobscured eyes, unlike half-lid21/27.
 comps=api.components(white);boxes=[]
 for g in comps:
  x0,y0,x1,y1=g['box']
  if 110<=x0 and x1<=160 and 8<=x1-x0<=19 and 6<=y1-y0<=14 and 90<=y0<=135:boxes.append((x0,y0,x1-1,y1-1))
 boxes=sorted(boxes,key=lambda b:b[1])[:2];boxes.sort();assert len(boxes)==2,boxes;eyes=[]
 for x0,y0,x1,y1 in boxes:
  poly=hull([(x,y) for y in range(y0,y1+1) for x in range(x0,x1+1) if min(a[y,x,:3])>180 and max(a[y,x,:3])-min(a[y,x,:3])<40]);w=x1-x0+1;h=y1-y0+1;ph=5 if h>=9 else 4;py=round((y0+y1-ph+1)/2)
  eyes.append({'polygon':poly,'pupils':[[x0+round(w*.3)-1,py,3,ph],[x0+round(w*.7)-1,py,3,ph]]})
 return eyes
with tempfile.TemporaryDirectory(prefix='consistent-kicks-') as temp:
 for ident in ['vamp','nate','guest14']:
  out=Path(temp)/ident;api.run(ROOT/'raw'/f'{ident}-32.png',out,ident,rows=8)
  for slot in SLOTS:
   name=f'{slot:02}-{api.SLOTS[slot]}.png';shutil.copyfile(out/name,ROOT/'processed'/ident/name)
# Recolor only the blue foot pixels in inspected explicit regions; retain alpha/outline.
for slot,box in [(17,(176,140,198,163)),(18,(208,125,229,146))]:
 p=ROOT/'processed/vamp'/f'{slot:02}-{api.SLOTS[slot]}.png';im=Image.open(p).convert('RGBA');a=np.array(im);x0,y0,x1,y1=box;patch=a[y0:y1,x0:x1];v=patch.astype(int);blue=(v[:,:,2]>v[:,:,0]*1.5)&(v[:,:,2]>v[:,:,1]*1.5)&(v[:,:,3]>0)
 yy,xx=np.where(blue);assert len(xx)>20
 patch[blue,:3]=[15,15,20]
 # The extended sole faces outward; halfway pose has a visible lower sole.
 stripe=blue & ((np.indices(blue.shape)[0]>=int(yy.max())-1) if slot==17 else (np.indices(blue.shape)[1]>=int(xx.max())-1))
 patch[stripe,:3]=[232,201,20];Image.fromarray(a).save(p)
config_path=ROOT/'fix_virtuagram.json';cfg=json.loads(config_path.read_text())
for slot in SLOTS:cfg[slot]['eyes']=pupil_config(Image.open(ROOT/'processed/guest14'/cfg[slot]['file']))
config_path.write_text(json.dumps(cfg,indent=2))
skip=[f'{i:02}' for i in range(32) if i not in SLOTS]
subprocess.run([sys.executable,str(ROOT/'fix_virtuagram.py'),'--refresh',*[f'{i:02}' for i in SLOTS],'--skip',*skip],check=True)
for ident in ['vamp','nate','guest14']:
 for slot in SLOTS:
  name=f'{slot:02}-{api.SLOTS[slot]}.png';shutil.copyfile(ROOT/'processed'/ident/name,REPO/'public/fighters/poses'/ident/name)
 # Current, explicitly labeled transition strip; never reuse stale contact.png.
 sheet=Image.new('RGB',(1024,560),'#29374b');d=ImageDraw.Draw(sheet)
 for j,slot in enumerate([16,17,18,19,22,23]):
  name=f'{slot:02}-{api.SLOTS[slot]}.png';im=Image.open(ROOT/'processed'/ident/name);x=j%4*256;y=j//4*280;sheet.paste(im,(x,y+20),im);d.text((x+5,y+3),name,fill='white')
 sheet.save(ROOT/'processed'/ident/'kick-continuity-restored.png')
print('Restored12posePNGs; targetedboot/pupilretouches complete; public copies installed.')
