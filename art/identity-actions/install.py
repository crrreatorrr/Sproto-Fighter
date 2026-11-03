"""Atomically install complete per-character action batches, preserving combat kits."""
import json,hashlib,shutil,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
audit=json.loads((HERE/'audit.json').read_text());profiles=json.loads((HERE/'profiles.json').read_text())
ready={}
for path in HERE.glob('batch_*/processed/*-identity/metadata.json'):
 body=path.parent.name.removesuffix('-identity');meta=json.loads(path.read_text());clips=meta.get('clips',{})
 ledger=path.parents[2]/'jobs.json'
 if ledger.exists():
  latest=next((j for j in reversed(json.loads(ledger.read_text())) if j.get('entity')==body and j.get('job_id')),None)
  marker=path.parent/'source-job.txt'
  if latest and (latest.get('status')!='completed' or not marker.exists() or marker.read_text().strip()!=latest['job_id']):continue
 if len(clips.get('entrance',[]))==8 and len(clips.get('death',[]))==16:ready[body]=(path.parent,meta)
missing=[];selected=[]
for row in audit:
 needed=row['bodies'];ranged=profiles[row['id']]['replaceRanged']
 if all(b in ready and (not ranged or len(ready[b][1]['clips'].get('ranged',[]))==8) for b in needed):selected.append(row)
 else:missing.append(row['id'])
if missing and '--available' not in sys.argv:raise SystemExit('Incomplete character batches: '+', '.join(missing))
path=ROOT/'public/fighters/pose-atlas.json';manifest=json.loads(path.read_text());digest=hashlib.sha256();count=0
for row in selected:
 for body in row['bodies']:
  source,meta=ready[body];dest=ROOT/'public/fighters/identity'/body;dest.mkdir(parents=True,exist_ok=True)
  for image in source.glob('[0-9][0-9].png'):shutil.copy2(image,dest/image.name);digest.update(image.read_bytes())
  clips={k:v for k,v in meta['clips'].items() if k in ('entrance','death') or k=='ranged' and profiles[row['id']]['replaceRanged']}
  for entries in clips.values():
   for frame in entries:
    frame.setdefault('anchor',meta.get('anchor',[112,210]));f=ROOT/'public'/frame['url'].lstrip('/')
    if not f.exists():raise RuntimeError('Missing identity frame '+str(f))
  cfg=manifest['fighters'][body];cfg.setdefault('clips',{}).update(clips)
  if 'ranged' in clips:cfg['clips'].pop('signatureCast',None)
  count+=1
manifest['revision']='identity-'+digest.hexdigest()[:16]
path.write_text(json.dumps(manifest,separators=(',',':'))+'\n')
(HERE/'installation.json').write_text(json.dumps({'fighters':len(selected),'bodies':count,'missing':missing,'revision':manifest['revision']},indent=2)+'\n')
print(f'Installed complete identity animation sets: {len(selected)} fighters / {count} bodies; remaining {len(missing)}.')
