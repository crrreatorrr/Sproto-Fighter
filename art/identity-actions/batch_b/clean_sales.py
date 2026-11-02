"""Remove inspected neighboring-row strips; keep actual detached robot limbs.

Only disconnected components entirely above the largest actor component, with
an 8px safety margin, are removed. Raw Higgsfield sheet remains untouched.
"""
import importlib.util,json
from pathlib import Path
import numpy as np
from PIL import Image
HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('expansion',HERE.parents[1]/'sprotos-expansion/process.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
dest=HERE/'processed/sprotosales-identity';meta=json.loads((dest/'metadata.json').read_text());report=json.loads((dest/'report.json').read_text());removed=[]
for i,f in enumerate(meta['frames']):
 p=dest/f'{i:02}.png';a=np.array(Image.open(p).convert('RGBA'));parts=m.atlas.components(a[:,:,3]>0);top=max(parts,key=lambda g:g['area'])['box'][1]
 for g in parts:
  if g['box'][3]<top-8:
   removed.append({'frame':i,'bounds':g['box'],'area':g['area']})
   for y,x,z in g['runs']:a[y,x:z]=0
 im=Image.fromarray(a);im.save(p);f['bounds']=list(im.getchannel('A').getbbox());f['contactHull']=m.hull(a[:,:,3]>0);report['frames'][i]['canonicalBounds']=f['bounds']
meta['clips']={'entrance':meta['frames'][:8],'ranged':meta['frames'][8:16],'death':meta['frames'][16:32]}
sheet=Image.new('RGBA',(1024,2048),'#202c3e')
for i in range(32):sheet.alpha_composite(Image.open(dest/f'{i:02}.png'),(i%4*256,i//4*256))
sheet.save(dest/'contact.png');(dest/'metadata.json').write_text(json.dumps(meta,indent=2)+'\n');(dest/'report.json').write_text(json.dumps(report,indent=2)+'\n')
(HERE/'sales-bleed-cleanup.json').write_text(json.dumps({'reason':'Inspected row-boundary feet fragments above actor, not disassembly limbs','removed':removed},indent=2)+'\n');print('Removed',len(removed),'row-bleed components')
