#!/usr/bin/env python3
"""Restore four pupils from explicit per-frame eye polygons, without changing surrounds.
Run from any directory. Backups make repeat runs idempotent. After replacing a source
frame, update its eye polygon in the JSON and use --refresh NN to replace that backup.
"""
from pathlib import Path
import argparse,json,shutil
from PIL import Image,ImageDraw,ImageOps
ROOT=Path(__file__).resolve().parent
DEST=ROOT/'processed/guest14'
CONFIG=ROOT/'fix_virtuagram.json'

def run():
 ap=argparse.ArgumentParser();ap.add_argument('--refresh',nargs='*',default=[]);ap.add_argument('--skip',nargs='*',default=[]);args=ap.parse_args()
 backup=DEST/'eye-retouch-originals';backup.mkdir(exist_ok=True)
 records=json.loads(CONFIG.read_text()); changed=[]
 for rec in records:
  slot=rec['file'][:2]
  if slot in args.skip:continue
  p=DEST/rec['file'];src=backup/p.name
  if not src.exists() or slot in args.refresh:shutil.copyfile(p,src)
  im=Image.open(src).convert('RGBA');before=im.copy()
  for eye in rec['eyes']:
   mask=Image.new('L',im.size);md=ImageDraw.Draw(mask);md.polygon(eye['polygon'],fill=255)
   paint=im.copy();d=ImageDraw.Draw(paint);d.polygon(eye['polygon'],fill=(250,250,246,255))
   for x,y,w,h in eye['pupils']:
    d.ellipse((x,y,x+w-1,y+h-1),fill=(5,7,12,255))
   im.paste(paint,(0,0),mask)
  im.save(p);changed.append(rec)
 # Native whole-body and enlarged face audits, in groups of eight, both facings.
 for group in range(4):
  rows=records[group*8:(group+1)*8]
  native=Image.new('RGB',(512,8*280),'#29374b');nd=ImageDraw.Draw(native)
  zoom=Image.new('RGB',(560,8*190),'#29374b');zd=ImageDraw.Draw(zoom)
  for j,rec in enumerate(rows):
   im=Image.open(DEST/rec['file']).convert('RGBA');allpts=[p for e in rec['eyes'] for p in e['polygon']];xs,ys=zip(*allpts);cx=(min(xs)+max(xs))//2;cy=(min(ys)+max(ys))//2
   crop=im.crop((cx-34,cy-20,cx+35,cy+21)).resize((276,164),Image.Resampling.NEAREST)
   for side in range(2):
    full=im if not side else ImageOps.mirror(im);native.paste(full,(side*256,j*280+20),full)
    face=crop if not side else ImageOps.mirror(crop);zoom.paste(face,(side*280,j*190+23),face)
   nd.text((8,j*280+3),rec['file']+' native right / left',fill='white');zd.text((8,j*190+3),rec['file']+' 4x right / left',fill='white')
  native.save(DEST/f'eye-audit-{group}-native.png');zoom.save(DEST/f'eye-audit-{group}-4x.png')
 print('Retouched',len(changed),'frames; explicit polygons preserve all exterior pixels. QA sheets generated.')
if __name__=='__main__':run()
