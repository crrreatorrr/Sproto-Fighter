"""Recover complete Sales standing silhouettes across nominal grid boundaries."""
import importlib.util,json
from pathlib import Path
import numpy as np
from PIL import Image
H=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('m',H.parents[1]/'sprotos-expansion/process.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
im=Image.open(H/'raw/sprotosales-identity.png').convert('RGBA');im=im.resize((1600,round(im.height*1600/im.width)),Image.Resampling.NEAREST);a=np.array(im);rgb=a[:,:,:3].astype(np.int16);mask=(a[:,:,3]>=128)&~((np.minimum(rgb[:,:,0],rgb[:,:,2])-rgb[:,:,1]>65)&(rgb[:,:,0]>125)&(rgb[:,:,2]>125))
parts=m.atlas.components(mask);bodies=[g for g in parts if g['area']>28000];bodies.sort(key=lambda g:sum(g['box'][1::2])/2);ordered=[]
for row in range(5):ordered.extend(sorted(bodies[row*4:row*4+4],key=lambda g:sum(g['box'][::2])/2))
assert len(ordered)==20
D=H/'processed/sprotosales-identity';meta=json.loads((D/'metadata.json').read_text());report=json.loads((D/'report.json').read_text());scale=report['uniformSourceScale']
for i,g in enumerate(ordered[:18]):
 l,t,r,b=g['box'];pixels=np.zeros((b-t,r-l,4),dtype=np.uint8)
 for y,x,z in g['runs']:pixels[y-t,x-l:z-l]=a[y,x:z];pixels[y-t,x-l:z-l,3]=255
 crop=Image.fromarray(pixels);scaled=crop.resize((round(crop.width*scale),round(crop.height*scale)),Image.Resampling.NEAREST)
 # Standing root retains the original estimated horizontal anchor, corrected for
 # crop-left displacement; feet now end exactly at the canonical floor.
 old=report['frames'][i];anchor=old['estimatedAnchor'][0]+old['sourceBounds'][0]-l
 frame=Image.new('RGBA',(256,256));frame.alpha_composite(scaled,(round(112-anchor*scale),210-scaled.height));frame.save(D/f'{i:02}.png')
 f=meta['frames'][i];f['bounds']=list(frame.getchannel('A').getbbox());f['contactHull']=m.hull(np.array(frame.getchannel('A'))>0);old['sourceBounds']=g['box'];old['canonicalBounds']=f['bounds'];old['recoveredWholeConnectedActor']=True
meta['clips']={'entrance':meta['frames'][:8],'ranged':meta['frames'][8:16],'death':meta['frames'][16:32]}
sheet=Image.new('RGBA',(1024,2048),'#202c3e')
for i in range(32):sheet.alpha_composite(Image.open(D/f'{i:02}.png'),(i%4*256,i//4*256))
sheet.save(D/'contact.png');(D/'metadata.json').write_text(json.dumps(meta,indent=2)+'\n');(D/'report.json').write_text(json.dumps(report,indent=2)+'\n')
print('Recovered complete connected Sales frames00–17, unchanged source scale',scale)
