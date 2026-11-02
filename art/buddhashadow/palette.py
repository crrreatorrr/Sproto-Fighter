"""Use one undithered palette across generated frames; preserve authored alpha."""
from pathlib import Path
import importlib.util,json,hashlib
from PIL import Image
import numpy as np
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
spec=importlib.util.spec_from_file_location('palette_lab',ROOT/'art/sproto3215-clean-colors/process.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
colors=['#08090b','#151517','#252527','#3b3b3f','#555357','#7e0917','#ba051c','#e81822','#ff3a31','#98630d','#d69c19','#f6ca25','#ffea35','#fff574','#c5c4c2','#ffffff']
palette=np.array([[int(c[i:i+2],16) for i in (1,3,5)] for c in colors],dtype=np.uint8);plab=m.lab(palette);reports=[]
for kind in ['core','walk','events','identity']:
 folder=HERE/'processed'/('buddhashadow-'+kind);sheet=Image.new('RGBA',(1024,512 if kind=='walk' else 2048),'#202c3e')
 for path in sorted(folder.glob('[0-9][0-9].png')):
  im=Image.open(path).convert('RGBA');a=np.array(im);mask=a[:,:,3]>0;alpha=hashlib.sha256(a[:,:,3].tobytes()).hexdigest();source,inverse=np.unique(a[mask,:3],axis=0,return_inverse=True);dist=((m.lab(source)[:,None,:]-plab[None,:,:])**2).sum(axis=2);a[mask,:3]=palette[dist.argmin(axis=1)][inverse];assert hashlib.sha256(a[:,:,3].tobytes()).hexdigest()==alpha
  clean=Image.fromarray(a);clean.save(path);index=int(path.stem);sheet.alpha_composite(clean,(index%4*256,index//4*256));reports.append(dict(kind=kind,index=index,sourceColors=len(source),alphaSHA256=alpha))
 sheet.save(folder/'contact.png');sheet.thumbnail((640,1280));sheet.save('/Users/kenhiraoka/Documents/Codex/2026-11-01/u/work/buddhashadow-'+kind+'.png')
info=json.loads((HERE/'identity.json').read_text());info['palette']=colors;(HERE/'identity.json').write_text(json.dumps(info,indent=2)+'\n');(HERE/'plan.json').write_text(json.dumps([info],indent=2)+'\n');(HERE/'palette-report.json').write_text(json.dumps(reports,indent=2)+'\n');print('Shared 16-color palette:',len(reports),'complete frames, alpha preserved.')
