"""Normalize 24/32 actor identity sheets without changing the installed roster."""
import argparse,importlib.util,json,types
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]/'sprotos-expansion/process.py'
ROOT=BASE.parents[2]
def normalize(job,folder):
 code=BASE.read_text().replace("rows=2 if kind=='walk' else 8;count=rows*4", "rows=job.get('frameCount',32)//4;count=rows*4")
 code=code.replace("floor=kind=='events' and i>=23", "floor=(kind=='identity' and i>=job.get('deathStart',16)+8) or (kind=='events' and i>=23)")
 code=code.replace("'assist':'assist'", "'assist':'assist','identity':'identity'")
 module=types.ModuleType('identity_normalizer');module.__file__=str(BASE);exec(compile(code,str(BASE),'exec'),module.__dict__);module.HERE=folder;module.ROOT=ROOT
 (folder/'raw').mkdir(exist_ok=True);(folder/'processed').mkdir(exist_ok=True)
 anchors=folder/'anchors.json';a=json.loads(anchors.read_text()) if anchors.exists() else {};a.setdefault(job['entity']+'-identity',{'scaleFromFrame':7,'targetStandingHeight':job.get('standingHeight',128)});anchors.write_text(json.dumps(a,indent=2))
 result=module.process(job);dest=folder/'processed'/f"{job['entity']}-identity";cfg=json.loads((dest/'metadata.json').read_text());f=cfg['frames'];start=job.get('deathStart',16)
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
