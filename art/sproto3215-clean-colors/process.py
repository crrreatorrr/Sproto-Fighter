"""Normalize cleaned Higgsfield sheets and enforce one undithered game palette."""
from pathlib import Path
import json,importlib.util,hashlib
import numpy as np
from PIL import Image
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]

def lab(rgb):
 rgb=rgb.astype(float)/255;linear=np.where(rgb<=.04045,rgb/12.92,((rgb+.055)/1.055)**2.4)
 xyz=np.einsum('ni,ji->nj',linear,np.array([[.4124564,.3575761,.1804375],[.2126729,.7151522,.0721750],[.0193339,.1191920,.9503041]]))
 assert np.isfinite(xyz).all()
 xyz/=np.array([.95047,1,1.08883]);f=np.where(xyz>.008856,xyz**(1/3),7.787*xyz+16/116)
 return np.stack([116*f[:,1]-16,500*(f[:,0]-f[:,1]),200*(f[:,1]-f[:,2])],axis=1)

def main():
 info=json.loads((HERE/'identity.json').read_text());palette=np.array([[int(c[i:i+2],16) for i in (1,3,5)] for c in info['palette']],dtype=np.uint8);plab=lab(palette)
 spec=importlib.util.spec_from_file_location('processor',ROOT/'art/sprotos-expansion/process.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);m.HERE=HERE
 jobs=json.loads((HERE/'jobs.json').read_text());reports=[]
 for j in jobs:
  if j.get('status')!='completed':continue
  print(m.process(j,force=True),flush=True);folder=HERE/'processed'/f'sproto3215-{j["kind"]}';rows=2 if j['kind']=='walk' else 8;sheet=Image.new('RGBA',(1024,rows*256),'#202c3e')
  for path in sorted(folder.glob('[0-9][0-9].png')):
   im=Image.open(path).convert('RGBA');a=np.array(im);mask=a[:,:,3]>0;alpha_hash=hashlib.sha256(a[:,:,3].tobytes()).hexdigest();source_colors=len(np.unique(a[mask,:3],axis=0))
   # Palette remapping is undithered; preserve the authored silhouettes exactly.
   colors,inverse=np.unique(a[mask,:3],axis=0,return_inverse=True);dist=((lab(colors)[:,None,:]-plab[None,:,:])**2).sum(axis=2);a[mask,:3]=palette[dist.argmin(axis=1)][inverse]
   assert hashlib.sha256(a[:,:,3].tobytes()).hexdigest()==alpha_hash
   clean=Image.fromarray(a);clean.save(path);index=int(path.stem);sheet.alpha_composite(clean,(index%4*256,index//4*256))
   reports.append({'kind':j['kind'],'index':index,'normalizedSourceColors':source_colors,'installedColors':len(np.unique(a[mask,:3],axis=0)),'alphaSHA256':alpha_hash})
  sheet.save(folder/'contact.png');preview=sheet.copy();preview.thumbnail((640,1280));preview.save('/Users/kenhiraoka/Documents/Codex/2026-11-01/u/work/3215-clean-'+j['kind']+'.png')
 (HERE/'palette-report.json').write_text(json.dumps(reports,indent=2)+'\n');print('Palette-normalized',len(reports),'frames.',flush=True)

if __name__=='__main__':main()
