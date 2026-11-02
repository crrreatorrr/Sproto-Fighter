"""Apply the reviewed #943 clothing edit only; preserve other concurrent work.

Normal expansion installation reuses these corrected processed frames. A forced
re-generation of #943 requires reviewing/reapplying this correction explicitly.
"""
import hashlib,json,shutil
from pathlib import Path
HERE=Path(__file__).resolve().parent
REPO=HERE.parents[3]
BACKUP=HERE

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
expected={r['path']:r['sha256'] for r in json.loads((BACKUP/'source-fingerprints.json').read_text())}
original=json.loads((BACKUP/'before-config.json').read_text())
entries=[];pieces={}
for kind,category in [('core','poses'),('walk','walk'),('events','events')]:
 source=HERE/'processed'/f'sproto943-{kind}'
 pieces[kind]=json.loads((source/'metadata.json').read_text())
 for p in sorted(source.glob('[0-9][0-9].png')):
  target=REPO/'public/fighters'/category/'sproto943'/p.name
  assert sha(target) in {expected[str(target.relative_to(REPO))],sha(p)},f'Concurrent #943 change: {target}'
  entries.append((p,target))
assert len(entries)==72
manifest_path=REPO/'public/fighters/pose-atlas.json'
manifest=json.loads(manifest_path.read_text());current=manifest['fighters']['sproto943']
updated=dict(original,frames=pieces['core']['frames'],walkFrames=pieces['walk']['frames'],clips=pieces['events']['clips'])
assert current in [original,updated],'Concurrent #943 configuration change; inspect before installing.'
# Preserve collision/hold metadata and world scale: this is an appearance fix.
pieces['core']['holdContact']=original['holdContact']
for source,target in entries:shutil.copy2(source,target)
for kind in pieces:
 source=HERE/'processed'/f'sproto943-{kind}'
 target=REPO/'art/sprotos-expansion/processed'/f'sproto943-{kind}'
 for p in source.glob('[0-9][0-9].png'):shutil.copy2(p,target/p.name)
 for name in ['contact.png','report.json']:shutil.copy2(source/name,target/name)
 (target/'metadata.json').write_text(json.dumps(pieces[kind],indent=2)+'\n')
 (target/'local-edit.json').write_text(json.dumps({'provider':'built-in image editing','purpose':'Remove protruding trouser/crotch contour','source':str((HERE/'raw'/f'sproto943-{kind}.png').relative_to(REPO)),'base_source_job_preserved':True},indent=2)+'\n')
# Read immediately before the narrow merge; keep every other fighter entry.
latest_text=manifest_path.read_text();latest=json.loads(latest_text)
assert latest['fighters']['sproto943'] in [original,updated],'Concurrent #943 config changed during install.'
if latest['fighters']['sproto943']!=updated:
 latest['fighters']['sproto943']=updated
 digest=hashlib.sha256(''.join(sha(p)for p,_ in entries).encode()).hexdigest()[:10]
 latest['revision']=latest.get('revision','local')+'-943flat-'+digest
 assert manifest_path.read_text()==latest_text,'Manifest changed concurrently; re-run the scoped installer.'
 manifest_path.write_text(json.dumps(latest,indent=2)+'\n')
assert all(sha(source)==sha(target)for source,target in entries)
print('Installed 72 #943 frames only. Existing scale, anchors, hold geometry, timings and other fighters preserved.')
