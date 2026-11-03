#!/usr/bin/env python3
"""Restore airborne head proportions; only four cells, no whole-body transform.
Idempotent from saved first-run baselines. Palette/teeth are nearest-neighbor copied.
"""
from pathlib import Path
import json, hashlib
from PIL import Image, ImageDraw, ImageChops
ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'art/pose-atlases'
CONFIG={
 'rivet':{
  22:{'scale':1.28,'pivot':[120,132],'polygon':[[85,80],[145,80],[145,121],[143,125],[139,128],[131,131],[122,133],[113,132],[105,129],[97,126],[85,126]]},
  23:{'scale':1.28,'pivot':[119,128],'polygon':[[84,75],[144,75],[144,120],[142,124],[138,127],[129,129],[119,129],[110,127],[101,125],[91,121],[84,121]]}},
 'mox':{
  22:{'scale':1.30,'pivot':[128,126],'polygon':[[104,85],[153,85],[153,125],[145,127],[137,127],[130,126],[122,125],[117,123],[112,121],[104,121]]},
  23:{'scale':1.30,'pivot':[125,113],'polygon':[[106,61],[154,61],[154,110],[145,113],[140,116],[132,115],[125,113],[120,112],[115,110],[106,110]]}}
}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
report=[]
for id,slots in CONFIG.items():
 folder=BASE/'processed'/id;backup=folder/'air-head-baseline';backup.mkdir(exist_ok=True)
 for slot,c in slots.items():
  dest=next(folder.glob(f'{slot:02}-*.png'));saved=backup/dest.name
  if not saved.exists():saved.write_bytes(dest.read_bytes())
  src=Image.open(saved).convert('RGBA');mask=Image.new('L',src.size);ImageDraw.Draw(mask).polygon([tuple(x) for x in c['polygon']],fill=255)
  mask=ImageChops.multiply(mask,src.getchannel('A'));head=src.copy();head.putalpha(mask)
  body=src.copy();alpha=body.getchannel('A');alpha=ImageChops.subtract(alpha,mask);body.putalpha(alpha)
  # Scale only the isolated head about the fixed authored neck attachment.
  s=c['scale'];px,py=c['pivot'];scaled=head.resize((round(src.width*s),round(src.height*s)),Image.Resampling.NEAREST)
  offset=(round(px*(1-s)),round(py*(1-s)));body.alpha_composite(scaled,offset)
  body.save(dest);public=ROOT/'public/fighters/poses'/id/dest.name;public.write_bytes(dest.read_bytes())
  # Pixels outside the union of old and transformed head masks stay byte-identical.
  union=Image.new('RGBA',src.size);union.alpha_composite(scaled,offset);allowed=ImageChops.lighter(mask,union.getchannel('A'))
  changed=ImageChops.difference(src,body).getbbox();bad=0
  for y in range(src.height):
   for x in range(src.width):
    if allowed.getpixel((x,y))==0 and src.getpixel((x,y))!=body.getpixel((x,y)):bad+=1
  assert bad==0
  report.append({'id':id,'slot':slot,**c,'baselineSHA256':sha(saved),'outputSHA256':sha(dest),'changedBounds':changed,'outsideHeadPixelChanges':bad,'publicMatches':sha(public)==sha(dest)})
 # Compare rise/fall/original corrected cells and enlarged cells at native and 3x.
 frames=[]
 for slot in [8,9,22,23]:
  file=next(folder.glob(f'{slot:02}-*.png'));frames.append((f'{slot} current',Image.open(file).convert('RGBA')))
 for slot in [22,23]:
  file=next(backup.glob(f'{slot:02}-*.png'));frames.append((f'{slot} before',Image.open(file).convert('RGBA')))
 out=Image.new('RGB',(768,560),'#536070');d=ImageDraw.Draw(out)
 for n,(label,im) in enumerate(frames):
  x=n%3*256;y=n//3*280;out.paste(im,(x,y+24),im);d.text((x+5,y+6),label,fill='white')
 out.save(folder/'air-head-review.png');out.resize((2304,1680),Image.Resampling.NEAREST).save(folder/'air-head-review-3x.png')
(BASE/'air-head-scale-report.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
