#!/usr/bin/env python3
"""Restore ONLY original ground kicks17/18; retain all other processed/public PNGs."""
from pathlib import Path
import subprocess,tempfile,shutil,hashlib,json
from PIL import Image,ImageDraw
import numpy as np
HERE=Path(__file__).resolve().parent;REPO=HERE.parent.parent
IDS=['rivet','bront','mox','guest08','guest12','rune'];NAMES=['17-kickHalf.png','18-kickFull.png']
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
protected={p:sha(p) for id in IDS for base in [HERE/'processed',REPO/'public/fighters/poses'] for p in (base/id).glob('[0-9][0-9]-*.png') if p.name not in NAMES}
work=Path(tempfile.mkdtemp(prefix='original-ground-kicks-'));records=[]
for id in IDS:
 subprocess.run(['python3',str(HERE/'import_atlas.py'),str(HERE/'raw'/f'{id}-32.png'),str(work/id),id],check=True,capture_output=True)
 for name in NAMES:
  src=work/id/name;dst=HERE/'processed'/id/name;shutil.copy2(src,dst)
  if id=='rune':
   im=Image.open(dst).convert('RGBA');a=np.array(im);old=a.copy();roi=(154,153,176,175) if name.startswith('17') else (184,133,208,158)
   x0,y0,x1,y1=roi
   for y in range(y0,y1):
    for x in range(x0,x1):
     r,g,b,alpha=map(int,a[y,x]);
     if alpha and b>r+14 and b>g+12:
      shade=max(13,min(32,round((r+g+b)/9)));a[y,x]=[shade,shade+1,shade+4,alpha]
   assert np.array_equal(a[:,:,3],old[:,:,3]);im=Image.fromarray(a);im.save(dst)
   records.append({'id':id,'slot':name,'shoeRegion':roi,'repaintedPixels':int(np.any(a!=old,axis=2).sum())})
  else:records.append({'id':id,'slot':name,'originalImportSHA256':sha(src)})
subprocess.run(['python3',str(HERE/'fix_identity_details.py'),'--ids','mox','guest08','--only-slots','17,18','--refresh-slots','17,18'],check=True)
for id in IDS:
 for name in NAMES:
  src=HERE/'processed'/id/name;dst=REPO/'public/fighters/poses'/id/name;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
 strip=Image.new('RGBA',(1024,280),'#aab6c0');draw=ImageDraw.Draw(strip)
 for col,slot in enumerate([16,17,18,19]):
  p=next((HERE/'processed'/id).glob(f'{slot:02}-*.png'));strip.alpha_composite(Image.open(p),(col*256,24));draw.text((col*256+4,5),id+' '+p.stem,fill='black')
 strip.save(HERE/'processed'/id/'ground-kick-review.png');strip.resize((4096,1120),Image.Resampling.NEAREST).save(HERE/'processed'/id/'ground-kick-review-4x.png')
assert all(p.exists() and sha(p)==h for p,h in protected.items()),'A non-target frame changed; investigate concurrent writes'
(HERE/'ground-kick-restore-report.json').write_text(json.dumps({'temporaryImport':str(work),'restoredOnly':NAMES,'protectedFrameCount':len(protected),'protectedFramesUnchanged':True,'records':records},indent=2)+'\n')
print('PASS restored12 target frames; public synced; non-target frame hashes preserved:',len(protected))
