"""Install this reviewed art revision only, preserving gameplay and other fighters."""
import json,re,shutil,hashlib
from pathlib import Path
from PIL import Image
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];EXPANSION=ROOT/'art/sprotos-expansion'

def install():
 info=json.loads((HERE/'identity.json').read_text());ident=info['id'];jobs=json.loads((HERE/'jobs.json').read_text());latest={j['kind']:j for j in jobs if not j.get('superseded')}
 pieces={};count=0
 for kind,category in [('core','poses'),('walk','walk'),('events','events')]:
  job=latest[kind];folder=HERE/'processed'/f'{ident}-{kind}';assert job['status']=='completed';assert (folder/'source-job.txt').read_text().strip()==job['job_id']
  pieces[kind]=json.loads((folder/'metadata.json').read_text());assert len(pieces[kind]['frames'])==(8 if kind=='walk' else 32)
  for n in range(len(pieces[kind]['frames'])):
   im=Image.open(folder/f'{n:02}.png');assert im.size==(256,256) and im.mode=='RGBA';a=im.getchannel('A');assert set(a.getdata())<={0,255};l,t,r,b=a.getbbox();assert l>0 and t>0 and r<256 and b<256;count+=1
 cfg=pieces['core'];cfg['walkFrames']=pieces['walk']['frames'];cfg['clips']=pieces['events']['clips']
 manifest_path=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(manifest_path.read_text());old=manifest['fighters'][ident]
 for key in ['scale','walkCycleDistance','locomotion']:
  if key in old:cfg[key]=old[key]
 for kind,category in [('core','poses'),('walk','walk'),('events','events')]:
  folder=HERE/'processed'/f'{ident}-{kind}';canonical=EXPANSION/'processed'/f'{ident}-{kind}';backup=HERE/'before-processed'/f'{ident}-{kind}'
  if canonical.exists() and not backup.exists():shutil.copytree(canonical,backup)
  shutil.copytree(folder,canonical,dirs_exist_ok=True)
  dest=ROOT/'public/fighters'/category/ident;dest.mkdir(parents=True,exist_ok=True)
  for frame in folder.glob('[0-9][0-9].png'):shutil.copy2(frame,dest/frame.name)
 manifest['fighters'][ident]=cfg
 digest=hashlib.sha256(''.join(latest[k]['job_id'] for k in ['core','walk','events']).encode()).hexdigest()[:10]
 suffix=f'-{ident}-{digest}'
 if not manifest.get('revision','').endswith(suffix):manifest['revision']=manifest.get('revision','art')+suffix
 manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
 points={}
 for part,slot in [('hand',26),('torso',24)]:
  anchor=cfg['frames'][slot].get('anchor',cfg['anchor']);p=cfg['holdContact'][part];points[part]=[(p[i]-anchor[i])*cfg['scale'] for i in [0,1]]
 path=ROOT/'src/sim/roster.ts';s=path.read_text();pattern=r'(?m)^'+re.escape(ident)+r':\s*\{\s*"hand":\s*\[[^\]]+\],\s*"torso":\s*\[[^\]]+\]\s*\},$';s,n=re.subn(pattern,ident+':'+json.dumps(points)+',',s);assert n==1,(ident,n);path.write_text(s)
 # Append complete replacement records to the current ledger; retain all prior jobs.
 path=EXPANSION/'jobs.json';ledger=json.loads(path.read_text());known={j.get('job_id') for j in ledger}
 canonical_indices={j['kind']:j['index'] for j in ledger if j.get('entity')==ident}
 ledger.extend({**j,'index':canonical_indices.get(j['kind'],j['index']),'submissionIndex':j['index'],'artRevisionRoot':str(HERE.relative_to(ROOT))} for j in latest.values() if j['job_id'] not in known);path.write_text(json.dumps(ledger,indent=2)+'\n')
 path=EXPANSION/'inventory.json';inventory=json.loads(path.read_text());ref=next(r for r in inventory if r['id']==ident);ref['entities'][0]['description']=info['inventoryDescription'];ref.update(status='installed-playable',currentArtRevision=str(HERE.relative_to(ROOT)),visualQA=info.get('visualQA','Reviewed complete reference-based revision.'));path.write_text(json.dumps(inventory,indent=2)+'\n')
 info.update(status='installed-playable',installedFrames=count);(HERE/'identity.json').write_text(json.dumps(info,indent=2)+'\n');print(f'Installed {ident} only: {count} reviewed frames; existing kit and roster entry preserved.')

if __name__=='__main__':install()
