"""Normalize 24/32 actor identity sheets without changing the installed roster."""
import argparse,importlib.util,json,types
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]/'sprotos-expansion/process.py'
ROOT=BASE.parents[2]
def normalize(job,folder):
 code=BASE.read_text().replace("rows=2 if kind=='walk' else 8;count=rows*4", "rows=job.get('frameCount',32)//4;count=rows*4")
 code=code.replace("floor=kind=='events' and i>=23", "floor=(kind=='identity' and i>=job.get('deathStart',16)+8) or (kind=='events' and i>=23)")
 code=code.replace("root_y=180 if hover and not(kind=='events' and i>=23) else 210","root_y=180 if hover and not((kind=='events' and i>=23) or (kind=='identity' and i>=job.get('deathStart',16)+8)) else 210")
 code=code.replace("'assist':'assist'", "'assist':'assist','identity':'identity'")
 code=code.replace("    expected=count-config.get('repeatFinalRest',0)","""    if job.get('allowDetachedParts'):
        bodies=[]
        for cell in range(count):
            x0,x1=round(cell%4*cw),round((cell%4+1)*cw);y0,y1=round(cell//4*ch),round((cell//4+1)*ch)
            ys,xs=np.where(mask[y0:y1,x0:x1])
            if not len(xs):raise ValueError('Empty actor cell '+str(cell))
            l,r=int(xs.min()+x0),int(xs.max()+x0+1);t,b=int(ys.min()+y0),int(ys.max()+y0+1);runs=[]
            for y in range(t,b):
                xx=np.flatnonzero(mask[y,l:r]);
                if not len(xx):continue
                starts=np.r_[True,np.diff(xx)>1];ends=np.r_[np.diff(xx)>1,True]
                for first,last in zip(xx[starts],xx[ends]):runs.append((y,int(l+first),int(l+last+1)))
            bodies.append({'area':len(xs),'box':(l,t,r,b),'runs':runs})
    expected=count-config.get('repeatFinalRest',0)""")

 module=types.ModuleType('identity_normalizer');module.__file__=str(BASE);exec(compile(code,str(BASE),'exec'),module.__dict__);module.HERE=folder;module.ROOT=ROOT
 (folder/'raw').mkdir(exist_ok=True);(folder/'processed').mkdir(exist_ok=True)
 anchors=folder/'anchors.json';a=json.loads(anchors.read_text()) if anchors.exists() else {};a.setdefault(job['entity']+'-identity',{'scaleFromFrame':7,'targetStandingHeight':job.get('standingHeight',128)});anchors.write_text(json.dumps(a,indent=2))
 result=module.process(job);dest=folder/'processed'/f"{job['entity']}-identity";cfg=json.loads((dest/'metadata.json').read_text());f=cfg['frames'];start=job.get('deathStart',16)
 
 if job['entity'] in ('sproto1870','vaudream'):
  for entry in f[start+8:start+16]:entry['anchor']=[112,entry['bounds'][3]]
 cfg['clips']={'entrance':f[:8],'death':f[start:start+16]}
 if job.get('ranged'):cfg['clips']['ranged']=f[8:16]
 (dest/'metadata.json').write_text(json.dumps(cfg,indent=2)+'\n');return result
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--root',required=True);p.add_argument('--entity');args=p.parse_args();folder=Path(args.root).resolve();jobs=json.loads((folder/'jobs.json').read_text());latest={j['entity']:j for j in jobs if j.get('job_id')};results=[]
 for j in latest.values():
  if j.get('status')!='completed' or (args.entity and j['entity']!=args.entity):continue
  try:r=normalize(j,folder)
  except Exception as e:r={'entity':j['entity'],'status':'failed','error':str(e)}
  results.append(r);print(json.dumps(r),flush=True)
 (folder/'normalization-status.json').write_text(json.dumps(results,indent=2)+'\n')
